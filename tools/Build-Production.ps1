[CmdletBinding()]
param()

$ErrorActionPreference='Stop'
$ExpectedHash='11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a'
$Master=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Builder=Join-Path $PSScriptRoot 'build_production.py'
$Vendor=Join-Path $Master 'site\assets\js\vendor\liquidGL-2.0.1.js'

if(-not (Test-Path -LiteralPath $Vendor)){throw 'Production build blocked: liquidGL vendor file is missing.'}
$ActualHash=(Get-FileHash -LiteralPath $Vendor -Algorithm SHA256).Hash.ToLowerInvariant()
if($ActualHash -ne $ExpectedHash){throw "Production build blocked: liquidGL SHA-256 mismatch ($ActualHash)."}

$env:PYTHONDONTWRITEBYTECODE='1'
$py=Get-Command py -ErrorAction SilentlyContinue
if($py){& $py.Source -3 $Builder --project $Master;if($LASTEXITCODE -ne 0){throw 'Production build failed.'};return}
$python=Get-Command python -ErrorAction SilentlyContinue
if($python){& $python.Source $Builder --project $Master;if($LASTEXITCODE -ne 0){throw 'Production build failed.'};return}
throw 'Python 3 was not found.'
