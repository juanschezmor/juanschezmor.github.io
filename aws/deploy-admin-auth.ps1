param(
  [Parameter(Mandatory = $true)]
  [string]$AdminUsername,
  [Parameter(Mandatory = $true)]
  [string]$AdminPassword,
  [Parameter(Mandatory = $true)]
  [string]$AdminTokenSecret,
  [string]$Region = "eu-north-1",
  [string]$AccountId = "519845866784",
  [string]$ApiId = "gte913rmml",
  [string]$StageName = "prod",
  [string]$RootResourceId = "r06evsl2cg",
  [string]$ContentRoleArn = "arn:aws:iam::519845866784:role/portfolio-content-lambda-role",
  [int]$AdminTokenTtlSeconds = 604800
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $global:PSNativeCommandUseErrorActionPreference = $false
}

$awsCliPath = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$awsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$contentLambdasRoot = Join-Path $awsRoot "content-lambdas"
$skillsLambdasRoot = Join-Path $awsRoot "skills-lambdas"
$contentZipPath = Join-Path $awsRoot "content-lambdas.zip"
$skillsZipPath = Join-Path $awsRoot "skills-lambdas.zip"

$authEnvironmentVariables = @{
  ADMIN_USERNAME = $AdminUsername
  ADMIN_PASSWORD = $AdminPassword
  ADMIN_TOKEN_SECRET = $AdminTokenSecret
  ADMIN_TOKEN_TTL_SECONDS = "$AdminTokenTtlSeconds"
}

$contentLambdaUpdates = @(
  @{ Name = "createProject"; ZipPath = $contentZipPath },
  @{ Name = "updateProject"; ZipPath = $contentZipPath },
  @{ Name = "deleteProject"; ZipPath = $contentZipPath },
  @{ Name = "createExperience"; ZipPath = $contentZipPath },
  @{ Name = "updateExperience"; ZipPath = $contentZipPath },
  @{ Name = "deleteExperience"; ZipPath = $contentZipPath },
  @{ Name = "createActivity"; ZipPath = $contentZipPath },
  @{ Name = "deleteActivity"; ZipPath = $contentZipPath },
  @{ Name = "createResume"; ZipPath = $contentZipPath },
  @{ Name = "activateResume"; ZipPath = $contentZipPath },
  @{ Name = "deleteResume"; ZipPath = $contentZipPath }
)

$skillsLambdaUpdates = @(
  @{
    Name = "createSkill"
    ZipPath = $skillsZipPath
    Handler = "createSkill/index.handler"
  },
  @{
    Name = "deleteSkill"
    ZipPath = $skillsZipPath
    Handler = "deleteSkill/index.handler"
  }
)

$newContentLambdaFunctions = @(
  @{
    Name = "adminLogin"
    Handler = "adminLogin/index.handler"
    Timeout = 5
    MemorySize = 256
    ZipPath = $contentZipPath
  },
  @{
    Name = "adminSession"
    Handler = "adminSession/index.handler"
    Timeout = 5
    MemorySize = 256
    ZipPath = $contentZipPath
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

function Get-MergedEnvironmentFile {
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

  foreach ($entry in $authEnvironmentVariables.GetEnumerator()) {
    $variables[$entry.Key] = $entry.Value
  }

  return New-TempJsonFile -Depth 5 -Value @{
    Variables = $variables
  }
}

function Update-ExistingLambda {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Lambda
  )

  $environmentFile = Get-MergedEnvironmentFile -FunctionName $Lambda.Name
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

    $configurationArguments = @(
      "lambda",
      "update-function-configuration",
      "--function-name",
      $Lambda.Name,
      "--environment",
      "file://$environmentFile"
    )

    if ($Lambda.ContainsKey("Handler") -and -not [string]::IsNullOrWhiteSpace($Lambda.Handler)) {
      $configurationArguments += @(
        "--handler",
        $Lambda.Handler
      )
    }

    Invoke-Aws -Arguments $configurationArguments | Out-Null

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

function Ensure-NewContentLambda {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Lambda
  )

  $environmentFile = New-TempJsonFile -Depth 5 -Value @{
    Variables = $authEnvironmentVariables
  }
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
        $ContentRoleArn,
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
      $ContentRoleArn,
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

function Get-ResourceByPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  return (Get-ApiResources | Where-Object { $_.path -eq $Path } | Select-Object -First 1)
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
    "deploy-admin-auth"
  ) | Out-Null
}

Write-Host "Packaging Lambda bundles..."
Build-Zip -SourcePath $contentLambdasRoot -DestinationPath $contentZipPath
Build-Zip -SourcePath $skillsLambdasRoot -DestinationPath $skillsZipPath

Write-Host "Updating protected content Lambdas..."
foreach ($lambda in $contentLambdaUpdates) {
  Write-Host "  - $($lambda.Name)"
  Update-ExistingLambda -Lambda $lambda
}

Write-Host "Ensuring auth Lambdas..."
foreach ($lambda in $newContentLambdaFunctions) {
  Write-Host "  - $($lambda.Name)"
  Ensure-NewContentLambda -Lambda $lambda
}

Write-Host "Updating protected skills Lambdas..."
foreach ($lambda in $skillsLambdaUpdates) {
  Write-Host "  - $($lambda.Name)"
  Update-ExistingLambda -Lambda $lambda
}

Write-Host "Ensuring auth API resources..."
$authResourceId = Ensure-ApiResource -ParentId $RootResourceId -PathPart "auth"
$authLoginResourceId = Ensure-ApiResource -ParentId $authResourceId -PathPart "login"
$authSessionResourceId = Ensure-ApiResource -ParentId $authResourceId -PathPart "session"

Ensure-ProxyMethod -ResourceId $authLoginResourceId -HttpMethod "POST" -FunctionName "adminLogin" -SourceArnPath "auth/login"
Ensure-ProxyMethod -ResourceId $authSessionResourceId -HttpMethod "GET" -FunctionName "adminSession" -SourceArnPath "auth/session"

Write-Host "Resetting OPTIONS methods for protected resources..."
$corsTargets = @(
  @{ Path = "/projects"; Methods = "GET,POST,OPTIONS" },
  @{ Path = "/projects/{id}"; Methods = "DELETE,PUT,OPTIONS" },
  @{ Path = "/activities"; Methods = "GET,POST,OPTIONS" },
  @{ Path = "/activities/{id}"; Methods = "DELETE,OPTIONS" },
  @{ Path = "/experiences"; Methods = "GET,POST,OPTIONS" },
  @{ Path = "/experiences/{id}"; Methods = "DELETE,PUT,OPTIONS" },
  @{ Path = "/skills"; Methods = "GET,POST,OPTIONS" },
  @{ Path = "/skills/{id}"; Methods = "DELETE,OPTIONS" },
  @{ Path = "/resumes"; Methods = "GET,POST,OPTIONS" },
  @{ Path = "/resumes/{id}"; Methods = "DELETE,OPTIONS" },
  @{ Path = "/resumes/{id}/activate"; Methods = "POST,OPTIONS" },
  @{ Path = "/resumes/download"; Methods = "GET,OPTIONS" },
  @{ Path = "/auth/login"; Methods = "POST,OPTIONS" },
  @{ Path = "/auth/session"; Methods = "GET,OPTIONS" }
)

foreach ($target in $corsTargets) {
  $resource = Get-ResourceByPath -Path $target.Path
  if ($null -eq $resource) {
    throw "Unable to find API resource for path $($target.Path)."
  }

  Write-Host "  - $($target.Path)"
  Reset-OptionsMethod -ResourceId $resource.id -AllowedMethods $target.Methods
}

Write-Host "Deploying API stage..."
Deploy-ApiStage

Write-Host "Admin auth deployment completed."
