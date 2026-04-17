param(
  [string]$Region = "eu-north-1",
  [string]$AccountId = "519845866784",
  [string]$ApiId = "gte913rmml",
  [string]$StageName = "prod",
  [string]$RootResourceId = "r06evsl2cg",
  [string]$RoleArn = "arn:aws:iam::519845866784:role/portfolio-content-lambda-role",
  [string]$RoleName = "portfolio-content-lambda-role",
  [string]$ProjectImagesBucket = "portfolio-juanschezmor-project-images-519845866784",
  [int]$ProjectImageMaxFileBytes = 5242880
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $global:PSNativeCommandUseErrorActionPreference = $false
}

$awsCliPath = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$awsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$contentLambdasRoot = Join-Path $awsRoot "content-lambdas"
$contentZipPath = Join-Path $awsRoot "content-lambdas.zip"
$projectImagesPolicyName = "portfolio-content-project-images-access"

$projectLambdaUpdates = @(
  @{
    Name = "createProject"
    ZipPath = $contentZipPath
    Handler = "createProject/index.handler"
  },
  @{
    Name = "updateProject"
    ZipPath = $contentZipPath
    Handler = "updateProject/index.handler"
  },
  @{
    Name = "deleteProject"
    ZipPath = $contentZipPath
    Handler = "deleteProject/index.handler"
  }
)

$projectImageFunctions = @(
  @{
    Name = "uploadProjectImage"
    ZipPath = $contentZipPath
    Handler = "uploadProjectImage/index.handler"
    Timeout = 10
    MemorySize = 256
  }
)

function Invoke-Aws {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $stdoutPath = [System.IO.Path]::GetTempFileName()
  $stderrPath = [System.IO.Path]::GetTempFileName()

  try {
    $process = Start-Process `
      -FilePath $awsCliPath `
      -ArgumentList $Arguments `
      -NoNewWindow `
      -Wait `
      -PassThru `
      -RedirectStandardOutput $stdoutPath `
      -RedirectStandardError $stderrPath

    $stdout = if (Test-Path $stdoutPath) {
      [string](Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue)
    } else {
      ""
    }
    $stderr = if (Test-Path $stderrPath) {
      [string](Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue)
    } else {
      ""
    }

    if ($null -eq $stdout) { $stdout = "" }
    if ($null -eq $stderr) { $stderr = "" }
    $stderr = $stderr.Trim()

    if ($process.ExitCode -ne 0) {
      $message = if ($stderr) { $stderr } else { $stdout.Trim() }
      throw $message
    }

    return $stdout
  } finally {
    Remove-Item -LiteralPath $stdoutPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $stderrPath -Force -ErrorAction SilentlyContinue
  }
}

function Invoke-AwsJson {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $raw = Invoke-Aws -Arguments $Arguments
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $null
  }

  return $raw | ConvertFrom-Json
}

function Test-AwsCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  try {
    Invoke-Aws -Arguments $Arguments | Out-Null
    return $true
  } catch {
    return $false
  }
}

function New-TempJsonFile {
  param(
    [Parameter(Mandatory = $true)]
    $Value,
    [int]$Depth = 10
  )

  $tempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("{0}.json" -f [System.Guid]::NewGuid())
  $json = if ($Value -is [string]) {
    $Value
  } else {
    ConvertTo-Json -InputObject $Value -Depth $Depth -Compress
  }

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($tempPath, $json, $utf8NoBom)
  return $tempPath
}

function Build-Zip {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$DestinationPath
  )

  if (Test-Path $DestinationPath) {
    Remove-Item -LiteralPath $DestinationPath -Force
  }

  Compress-Archive -Path (Join-Path $SourcePath "*") -DestinationPath $DestinationPath -Force
}

function Get-EnvironmentVariables {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FunctionName
  )

  $config = Invoke-AwsJson -Arguments @(
    "lambda",
    "get-function-configuration",
    "--function-name",
    $FunctionName
  )

  $variables = @{}

  if ($config.Environment -and $config.Environment.Variables) {
    foreach ($property in $config.Environment.Variables.PSObject.Properties) {
      $variables[$property.Name] = [string]$property.Value
    }
  }

  return $variables
}

function New-ProjectImagesEnvironmentFile {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$BaseVariables
  )

  $variables = @{}

  foreach ($entry in $BaseVariables.GetEnumerator()) {
    $variables[$entry.Key] = $entry.Value
  }

  $variables.PROJECT_IMAGES_BUCKET = $ProjectImagesBucket
  $variables.PROJECT_IMAGE_MAX_FILE_BYTES = "$ProjectImageMaxFileBytes"

  return New-TempJsonFile -Depth 5 -Value @{
    Variables = $variables
  }
}

function Ensure-Bucket {
  try {
    Invoke-Aws -Arguments @(
      "s3api",
      "create-bucket",
      "--bucket",
      $ProjectImagesBucket,
      "--region",
      $Region,
      "--create-bucket-configuration",
      "LocationConstraint=$Region"
    ) | Out-Null
  } catch {
    if (
      $_.Exception.Message -notmatch "BucketAlreadyOwnedByYou" -and
      $_.Exception.Message -notmatch "BucketAlreadyExists"
    ) {
      throw
    }
  }

  Invoke-Aws -Arguments @(
    "s3api",
    "wait",
    "bucket-exists",
    "--bucket",
    $ProjectImagesBucket
  ) | Out-Null

  Invoke-Aws -Arguments @(
    "s3api",
    "put-public-access-block",
    "--bucket",
    $ProjectImagesBucket,
    "--public-access-block-configuration",
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
  ) | Out-Null

  $bucketPolicyPath = New-TempJsonFile -Depth 6 -Value @{
    Version = "2012-10-17"
    Statement = @(
      @{
        Sid = "PublicReadProjectImages"
        Effect = "Allow"
        Principal = "*"
        Action = @("s3:GetObject")
        Resource = "arn:aws:s3:::$ProjectImagesBucket/*"
      }
    )
  }
  $encryptionConfigPath = New-TempJsonFile -Depth 5 -Value @{
    Rules = @(
      @{
        ApplyServerSideEncryptionByDefault = @{
          SSEAlgorithm = "AES256"
        }
      }
    )
  }

  try {
    Invoke-Aws -Arguments @(
      "s3api",
      "put-bucket-policy",
      "--bucket",
      $ProjectImagesBucket,
      "--policy",
      "file://$bucketPolicyPath"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "s3api",
      "put-bucket-encryption",
      "--bucket",
      $ProjectImagesBucket,
      "--server-side-encryption-configuration",
      "file://$encryptionConfigPath"
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $bucketPolicyPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $encryptionConfigPath -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-RolePolicy {
  $policyDocumentPath = New-TempJsonFile -Depth 6 -Value @{
    Version = "2012-10-17"
    Statement = @(
      @{
        Sid = "ProjectImageObjectAccess"
        Effect = "Allow"
        Action = @(
          "s3:PutObject",
          "s3:DeleteObject"
        )
        Resource = "arn:aws:s3:::$ProjectImagesBucket/*"
      }
    )
  }

  try {
    Invoke-Aws -Arguments @(
      "iam",
      "put-role-policy",
      "--role-name",
      $RoleName,
      "--policy-name",
      $projectImagesPolicyName,
      "--policy-document",
      "file://$policyDocumentPath"
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $policyDocumentPath -Force -ErrorAction SilentlyContinue
  }
}

function Update-ExistingLambda {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Lambda
  )

  $baseVariables = Get-EnvironmentVariables -FunctionName $Lambda.Name
  $environmentFile = New-ProjectImagesEnvironmentFile -BaseVariables $baseVariables
  $zipFileArgument = "fileb://$($Lambda.ZipPath)"

  try {
    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-code",
      "--function-name",
      $Lambda.Name,
      "--zip-file",
      $zipFileArgument
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Lambda.Name
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-configuration",
      "--function-name",
      $Lambda.Name,
      "--handler",
      $Lambda.Handler,
      "--environment",
      "file://$environmentFile"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Lambda.Name
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $environmentFile -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-NewLambda {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Lambda
  )

  $baseVariables = Get-EnvironmentVariables -FunctionName "createProject"
  $environmentFile = New-ProjectImagesEnvironmentFile -BaseVariables $baseVariables
  $zipFileArgument = "fileb://$($Lambda.ZipPath)"

  try {
    $exists = Test-AwsCommand -Arguments @(
      "lambda",
      "get-function",
      "--function-name",
      $Lambda.Name
    )

    if (-not $exists) {
      Invoke-Aws -Arguments @(
        "lambda",
        "create-function",
        "--function-name",
        $Lambda.Name,
        "--runtime",
        "nodejs22.x",
        "--role",
        $RoleArn,
        "--handler",
        $Lambda.Handler,
        "--timeout",
        "$($Lambda.Timeout)",
        "--memory-size",
        "$($Lambda.MemorySize)",
        "--package-type",
        "Zip",
        "--zip-file",
        $zipFileArgument,
        "--environment",
        "file://$environmentFile"
      ) | Out-Null

      Invoke-Aws -Arguments @(
        "lambda",
        "wait",
        "function-active-v2",
        "--function-name",
        $Lambda.Name
      ) | Out-Null

      return
    }

    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-code",
      "--function-name",
      $Lambda.Name,
      "--zip-file",
      $zipFileArgument
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Lambda.Name
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-configuration",
      "--function-name",
      $Lambda.Name,
      "--runtime",
      "nodejs22.x",
      "--role",
      $RoleArn,
      "--handler",
      $Lambda.Handler,
      "--timeout",
      "$($Lambda.Timeout)",
      "--memory-size",
      "$($Lambda.MemorySize)",
      "--environment",
      "file://$environmentFile"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Lambda.Name
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $environmentFile -Force -ErrorAction SilentlyContinue
  }
}

function Get-ApiResources {
  return (Invoke-AwsJson -Arguments @(
    "apigateway",
    "get-resources",
    "--rest-api-id",
    $ApiId
  )).items
}

function Ensure-ApiResource {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ParentId,
    [Parameter(Mandatory = $true)]
    [string]$PathPart
  )

  $existing = Get-ApiResources |
    Where-Object { $_.parentId -eq $ParentId -and $_.pathPart -eq $PathPart } |
    Select-Object -First 1

  if ($existing) {
    return $existing.id
  }

  return (Invoke-AwsJson -Arguments @(
    "apigateway",
    "create-resource",
    "--rest-api-id",
    $ApiId,
    "--parent-id",
    $ParentId,
    "--path-part",
    $PathPart
  )).id
}

function Ensure-LambdaPermission {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FunctionName,
    [Parameter(Mandatory = $true)]
    [string]$StatementId,
    [Parameter(Mandatory = $true)]
    [string]$SourceArn
  )

  try {
    Invoke-Aws -Arguments @(
      "lambda",
      "add-permission",
      "--function-name",
      $FunctionName,
      "--statement-id",
      $StatementId,
      "--action",
      "lambda:InvokeFunction",
      "--principal",
      "apigateway.amazonaws.com",
      "--source-arn",
      $SourceArn
    ) | Out-Null
  } catch {
    if ($_.Exception.Message -notmatch "ResourceConflictException") {
      throw
    }
  }
}

function Ensure-ProxyMethod {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceId,
    [Parameter(Mandatory = $true)]
    [string]$HttpMethod,
    [Parameter(Mandatory = $true)]
    [string]$FunctionName,
    [Parameter(Mandatory = $true)]
    [string]$SourceArnPath
  )

  $lambdaUri = "arn:aws:apigateway:${Region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${Region}:${AccountId}:function:$FunctionName/invocations"
  $statementId = "$FunctionName-$($HttpMethod.ToLowerInvariant())-$($SourceArnPath -replace '[^a-zA-Z0-9]+', '-')"
  $sourceArn = "arn:aws:execute-api:${Region}:${AccountId}:$ApiId/*/$HttpMethod/$SourceArnPath"

  try {
    Invoke-Aws -Arguments @(
      "apigateway",
      "put-method",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      $HttpMethod,
      "--authorization-type",
      "NONE",
      "--no-api-key-required"
    ) | Out-Null
  } catch {
    if ($_.Exception.Message -notmatch "Method already exists") {
      throw
    }
  }

  Invoke-Aws -Arguments @(
    "apigateway",
    "put-integration",
    "--rest-api-id",
    $ApiId,
    "--resource-id",
    $ResourceId,
    "--http-method",
    $HttpMethod,
    "--type",
    "AWS_PROXY",
    "--integration-http-method",
    "POST",
    "--uri",
    $lambdaUri,
    "--passthrough-behavior",
    "WHEN_NO_MATCH"
  ) | Out-Null

  Ensure-LambdaPermission -FunctionName $FunctionName -StatementId $statementId -SourceArn $sourceArn
}

function Reset-OptionsMethod {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceId,
    [Parameter(Mandatory = $true)]
    [string]$AllowedMethods
  )

  try {
    Invoke-Aws -Arguments @(
      "apigateway",
      "delete-method",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      "OPTIONS"
    ) | Out-Null
  } catch {
    if ($_.Exception.Message -notmatch "NotFoundException") {
      throw
    }
  }

  $methodResponsePath = New-TempJsonFile -Value @{
    "method.response.header.Access-Control-Allow-Headers" = $false
    "method.response.header.Access-Control-Allow-Methods" = $false
    "method.response.header.Access-Control-Allow-Origin" = $false
  }
  $requestTemplatesPath = New-TempJsonFile -Value @{
    "application/json" = '{"statusCode":200}'
  }
  $integrationResponsePath = New-TempJsonFile -Value @{
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'$AllowedMethods'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  try {
    Invoke-Aws -Arguments @(
      "apigateway",
      "put-method",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      "OPTIONS",
      "--authorization-type",
      "NONE",
      "--no-api-key-required"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "apigateway",
      "put-method-response",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      "OPTIONS",
      "--status-code",
      "200",
      "--response-parameters",
      "file://$methodResponsePath"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "apigateway",
      "put-integration",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      "OPTIONS",
      "--type",
      "MOCK",
      "--request-templates",
      "file://$requestTemplatesPath"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "apigateway",
      "put-integration-response",
      "--rest-api-id",
      $ApiId,
      "--resource-id",
      $ResourceId,
      "--http-method",
      "OPTIONS",
      "--status-code",
      "200",
      "--response-parameters",
      "file://$integrationResponsePath"
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $methodResponsePath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $requestTemplatesPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $integrationResponsePath -Force -ErrorAction SilentlyContinue
  }
}

function Deploy-ApiStage {
  Invoke-Aws -Arguments @(
    "apigateway",
    "create-deployment",
    "--rest-api-id",
    $ApiId,
    "--stage-name",
    $StageName,
    "--description",
    "deploy-project-image-management"
  ) | Out-Null
}

Write-Host "Packaging content lambdas..."
Build-Zip -SourcePath $contentLambdasRoot -DestinationPath $contentZipPath

Write-Host "Ensuring S3 bucket..."
Ensure-Bucket

Write-Host "Ensuring Lambda role policy..."
Ensure-RolePolicy

Write-Host "Updating project lambdas..."
foreach ($lambda in $projectLambdaUpdates) {
  Write-Host "  - $($lambda.Name)"
  Update-ExistingLambda -Lambda $lambda
}

Write-Host "Ensuring project image upload lambda..."
foreach ($lambda in $projectImageFunctions) {
  Write-Host "  - $($lambda.Name)"
  Ensure-NewLambda -Lambda $lambda
}

Write-Host "Ensuring API resource..."
$projectImagesResourceId = Ensure-ApiResource -ParentId $RootResourceId -PathPart "project-images"

Ensure-ProxyMethod -ResourceId $projectImagesResourceId -HttpMethod "POST" -FunctionName "uploadProjectImage" -SourceArnPath "project-images"
Reset-OptionsMethod -ResourceId $projectImagesResourceId -AllowedMethods "POST,OPTIONS"

Write-Host "Deploying API stage..."
Deploy-ApiStage

Write-Host "Project image deployment completed."
