param(
  [string]$Region = "eu-north-1",
  [string]$AccountId = "519845866784",
  [string]$ApiId = "gte913rmml",
  [string]$StageName = "prod",
  [string]$RootResourceId = "r06evsl2cg",
  [string]$RoleArn = "arn:aws:iam::519845866784:role/portfolio-content-lambda-role",
  [string]$RoleName = "portfolio-content-lambda-role",
  [string]$ResumesTable = "Resumes",
  [string]$ResumesByLanguageIndex = "LanguageUploadedAtIndex",
  [string]$ResumesBucket = "portfolio-juanschezmor-resumes-519845866784",
  [int]$ResumeHistoryLimit = 5,
  [int]$ResumeMaxFileBytes = 5242880,
  [string]$AdminUsername = "",
  [string]$AdminPassword = "",
  [string]$AdminTokenSecret = "",
  [int]$AdminTokenTtlSeconds = 604800
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $global:PSNativeCommandUseErrorActionPreference = $false
}

$awsCliPath = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoAwsRoot = Split-Path -Parent $scriptRoot
$contentLambdasRoot = Join-Path $repoAwsRoot "content-lambdas"
$codeZipPath = Join-Path $repoAwsRoot "content-lambdas.zip"
$resumePolicyName = "portfolio-content-resumes-access"

$resumeFunctions = @(
  @{ Name = "getResumes"; Handler = "getResumes/index.handler"; Timeout = 5; MemorySize = 256 },
  @{ Name = "createResume"; Handler = "createResume/index.handler"; Timeout = 10; MemorySize = 256 },
  @{ Name = "activateResume"; Handler = "activateResume/index.handler"; Timeout = 5; MemorySize = 256 },
  @{ Name = "deleteResume"; Handler = "deleteResume/index.handler"; Timeout = 5; MemorySize = 256 },
  @{ Name = "downloadResume"; Handler = "downloadResume/index.handler"; Timeout = 10; MemorySize = 256 }
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
    if ($null -eq $stdout) {
      $stdout = ""
    }
    if ($null -eq $stderr) {
      $stderr = ""
    }
    $stderr = $stderr.Trim()

    if ($process.ExitCode -ne 0) {
      $message = if ($stderr) {
        $stderr
      } else {
        $stdout.Trim()
      }

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

function Ensure-CodeZip {
  if (Test-Path $codeZipPath) {
    Remove-Item -LiteralPath $codeZipPath -Force
  }

  Compress-Archive -Path (Join-Path $contentLambdasRoot "*") -DestinationPath $codeZipPath -Force
}

function Ensure-Bucket {
  try {
    Invoke-Aws -Arguments @(
      "s3api",
      "create-bucket",
      "--bucket",
      $ResumesBucket,
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
    $ResumesBucket
  ) | Out-Null

  Invoke-Aws -Arguments @(
    "s3api",
    "put-public-access-block",
    "--bucket",
    $ResumesBucket,
    "--public-access-block-configuration",
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  ) | Out-Null

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
      "put-bucket-encryption",
      "--bucket",
      $ResumesBucket,
      "--server-side-encryption-configuration",
      "file://$encryptionConfigPath"
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $encryptionConfigPath -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-Table {
  $gsiConfigPath = New-TempJsonFile -Depth 8 -Value @(
    @{
      IndexName = $ResumesByLanguageIndex
      KeySchema = @(
        @{
          AttributeName = "language"
          KeyType = "HASH"
        },
        @{
          AttributeName = "uploaded_at"
          KeyType = "RANGE"
        }
      )
      Projection = @{
        ProjectionType = "ALL"
      }
    }
  )

  try {
    try {
      Invoke-Aws -Arguments @(
        "dynamodb",
        "create-table",
        "--table-name",
        $ResumesTable,
        "--billing-mode",
        "PAY_PER_REQUEST",
        "--attribute-definitions",
        "AttributeName=id,AttributeType=S",
        "AttributeName=language,AttributeType=S",
        "AttributeName=uploaded_at,AttributeType=S",
        "--key-schema",
        "AttributeName=id,KeyType=HASH",
        "--global-secondary-indexes",
        "file://$gsiConfigPath"
      ) | Out-Null
    } catch {
      if ($_.Exception.Message -notmatch "ResourceInUseException") {
        throw
      }
    }
  } finally {
    Remove-Item -LiteralPath $gsiConfigPath -Force -ErrorAction SilentlyContinue
  }

  Invoke-Aws -Arguments @(
    "dynamodb",
    "wait",
    "table-exists",
    "--table-name",
    $ResumesTable
  ) | Out-Null
}

function Ensure-RolePolicy {
  $policyDocumentPath = New-TempJsonFile -Depth 6 -Value @{
    Version = "2012-10-17"
    Statement = @(
      @{
        Sid = "ResumeMetadataAccess"
        Effect = "Allow"
        Action = @(
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        )
        Resource = @(
          "arn:aws:dynamodb:${Region}:${AccountId}:table/$ResumesTable",
          "arn:aws:dynamodb:${Region}:${AccountId}:table/$ResumesTable/index/$ResumesByLanguageIndex"
        )
      },
      @{
        Sid = "ResumeObjectAccess"
        Effect = "Allow"
        Action = @(
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        )
        Resource = "arn:aws:s3:::$ResumesBucket/*"
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
      $resumePolicyName,
      "--policy-document",
      "file://$policyDocumentPath"
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $policyDocumentPath -Force -ErrorAction SilentlyContinue
  }
}

function Get-LambdaEnvironmentVariables {
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

function New-LambdaEnvironmentFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FunctionName,
    [Parameter(Mandatory = $true)]
    [bool]$FunctionExists
  )

  $variables = @{}

  if ($FunctionExists) {
    $existingVariables = Get-LambdaEnvironmentVariables -FunctionName $FunctionName

    foreach ($entry in $existingVariables.GetEnumerator()) {
      if ($entry.Key -like "ADMIN_*") {
        $variables[$entry.Key] = $entry.Value
      }
    }
  }

  if (-not [string]::IsNullOrWhiteSpace($AdminUsername)) {
    $variables["ADMIN_USERNAME"] = $AdminUsername
  }

  if (-not [string]::IsNullOrWhiteSpace($AdminPassword)) {
    $variables["ADMIN_PASSWORD"] = $AdminPassword
  }

  if (-not [string]::IsNullOrWhiteSpace($AdminTokenSecret)) {
    $variables["ADMIN_TOKEN_SECRET"] = $AdminTokenSecret
    $variables["ADMIN_TOKEN_TTL_SECONDS"] = "$AdminTokenTtlSeconds"
  }

  $variables["RESUMES_BUCKET"] = $ResumesBucket
  $variables["RESUMES_TABLE"] = $ResumesTable
  $variables["RESUMES_BY_LANGUAGE_INDEX"] = $ResumesByLanguageIndex
  $variables["RESUME_HISTORY_LIMIT"] = "$ResumeHistoryLimit"
  $variables["RESUME_MAX_FILE_BYTES"] = "$ResumeMaxFileBytes"

  return New-TempJsonFile -Depth 4 -Value @{
    Variables = $variables
  }
}

function Ensure-LambdaFunction {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Function
  )

  $functionExists = Test-AwsCommand -Arguments @(
    "lambda",
    "get-function",
    "--function-name",
    $Function.Name
  )

  $environmentFile = New-LambdaEnvironmentFile -FunctionName $Function.Name -FunctionExists $functionExists
  $zipFileArgument = "fileb://$codeZipPath"

  try {
    if (-not $functionExists) {
      Invoke-Aws -Arguments @(
        "lambda",
        "create-function",
        "--function-name",
        $Function.Name,
        "--runtime",
        "nodejs22.x",
        "--role",
        $RoleArn,
        "--handler",
        $Function.Handler,
        "--timeout",
        "$($Function.Timeout)",
        "--memory-size",
        "$($Function.MemorySize)",
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
        $Function.Name
      ) | Out-Null

      return
    }

    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-code",
      "--function-name",
      $Function.Name,
      "--zip-file",
      $zipFileArgument
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Function.Name
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "update-function-configuration",
      "--function-name",
      $Function.Name,
      "--runtime",
      "nodejs22.x",
      "--role",
      $RoleArn,
      "--handler",
      $Function.Handler,
      "--timeout",
      "$($Function.Timeout)",
      "--memory-size",
      "$($Function.MemorySize)",
      "--environment",
      "file://$environmentFile"
    ) | Out-Null

    Invoke-Aws -Arguments @(
      "lambda",
      "wait",
      "function-updated-v2",
      "--function-name",
      $Function.Name
    ) | Out-Null
  } finally {
    Remove-Item -LiteralPath $environmentFile -Force -ErrorAction SilentlyContinue
  }
}

function Get-ApiResources {
  return Invoke-AwsJson -Arguments @(
    "apigateway",
    "get-resources",
    "--rest-api-id",
    $ApiId
  )
}

function Ensure-ApiResource {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ParentId,
    [Parameter(Mandatory = $true)]
    [string]$PathPart
  )

  $existingResource = (Get-ApiResources).items |
    Where-Object { $_.parentId -eq $ParentId -and $_.pathPart -eq $PathPart } |
    Select-Object -First 1

  if ($existingResource) {
    return $existingResource.id
  }

  $createdResource = Invoke-AwsJson -Arguments @(
    "apigateway",
    "create-resource",
    "--rest-api-id",
    $ApiId,
    "--parent-id",
    $ParentId,
    "--path-part",
    $PathPart
  )

  return $createdResource.id
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

function Ensure-OptionsMethod {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceId,
    [Parameter(Mandatory = $true)]
    [string]$AllowedMethods
  )

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
  } catch {
    if ($_.Exception.Message -notmatch "Method already exists") {
      throw
    }
  }

  $methodResponseParametersPath = New-TempJsonFile -Value @{
    "method.response.header.Access-Control-Allow-Headers" = $false
    "method.response.header.Access-Control-Allow-Methods" = $false
    "method.response.header.Access-Control-Allow-Origin" = $false
  }
  $requestTemplatesPath = New-TempJsonFile -Value @{
    "application/json" = '{"statusCode":200}'
  }
  $integrationResponseParametersPath = New-TempJsonFile -Value @{
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'$AllowedMethods'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  try {
    try {
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
        "file://$methodResponseParametersPath"
      ) | Out-Null
    } catch {
      if ($_.Exception.Message -notmatch "Response already exists") {
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
      "OPTIONS",
      "--type",
      "MOCK",
      "--request-templates",
      "file://$requestTemplatesPath"
    ) | Out-Null

    try {
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
        "file://$integrationResponseParametersPath"
      ) | Out-Null
    } catch {
      if ($_.Exception.Message -notmatch "Response already exists") {
        throw
      }
    }
  } finally {
    Remove-Item -LiteralPath $methodResponseParametersPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $requestTemplatesPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $integrationResponseParametersPath -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-BinaryMediaType {
  $api = Invoke-AwsJson -Arguments @(
    "apigateway",
    "get-rest-api",
    "--rest-api-id",
    $ApiId
  )

  $existingTypes = @()
  if ($api.binaryMediaTypes) {
    $existingTypes = @($api.binaryMediaTypes)
  }

  if ($existingTypes -contains "application/pdf") {
    return
  }

  Invoke-Aws -Arguments @(
    "apigateway",
    "update-rest-api",
    "--rest-api-id",
    $ApiId,
    "--patch-operations",
    "op=add,path=/binaryMediaTypes/application~1pdf"
  ) | Out-Null
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
    "deploy-resume-management-endpoints"
  ) | Out-Null
}

Write-Host "Packaging resume lambdas..."
Ensure-CodeZip

Write-Host "Ensuring S3 bucket and DynamoDB table..."
Ensure-Bucket
Ensure-Table

Write-Host "Ensuring Lambda role policy..."
Ensure-RolePolicy

Write-Host "Ensuring Lambda functions..."
foreach ($function in $resumeFunctions) {
  Write-Host "  - $($function.Name)"
  Ensure-LambdaFunction -Function $function
}

Write-Host "Ensuring API resources and methods..."
$resumesResourceId = Ensure-ApiResource -ParentId $RootResourceId -PathPart "resumes"
$resumeIdResourceId = Ensure-ApiResource -ParentId $resumesResourceId -PathPart "{id}"
$activateResourceId = Ensure-ApiResource -ParentId $resumeIdResourceId -PathPart "activate"
$downloadResourceId = Ensure-ApiResource -ParentId $resumesResourceId -PathPart "download"

Ensure-ProxyMethod -ResourceId $resumesResourceId -HttpMethod "GET" -FunctionName "getResumes" -SourceArnPath "resumes"
Ensure-ProxyMethod -ResourceId $resumesResourceId -HttpMethod "POST" -FunctionName "createResume" -SourceArnPath "resumes"
Ensure-ProxyMethod -ResourceId $resumeIdResourceId -HttpMethod "DELETE" -FunctionName "deleteResume" -SourceArnPath "resumes/*"
Ensure-ProxyMethod -ResourceId $activateResourceId -HttpMethod "POST" -FunctionName "activateResume" -SourceArnPath "resumes/*/activate"
Ensure-ProxyMethod -ResourceId $downloadResourceId -HttpMethod "GET" -FunctionName "downloadResume" -SourceArnPath "resumes/download"

Ensure-OptionsMethod -ResourceId $resumesResourceId -AllowedMethods "GET,POST,OPTIONS"
Ensure-OptionsMethod -ResourceId $resumeIdResourceId -AllowedMethods "DELETE,OPTIONS"
Ensure-OptionsMethod -ResourceId $activateResourceId -AllowedMethods "POST,OPTIONS"
Ensure-OptionsMethod -ResourceId $downloadResourceId -AllowedMethods "GET,OPTIONS"

Write-Host "Ensuring PDF binary support..."
Ensure-BinaryMediaType

Write-Host "Deploying API stage..."
Deploy-ApiStage

Write-Host "Resume infrastructure deployment completed."
