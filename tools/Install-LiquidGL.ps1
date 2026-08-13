<#
.SYNOPSIS
    Verifies (or locally supplies) the pinned liquidGL v2.0.1 vendor file.
.DESCRIPTION
    This script never downloads from a CDN. The full master ships the vendor
    file already. Use -Source only to replace it from a local known-good copy.
#>
[CmdletBinding()]
param([string]$Source)

$ErrorActionPreference='Stop'
$ExpectedHash='11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a'
$Master=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Target=Join-Path $Master 'site\assets\js\vendor\liquidGL-2.0.1.js'

if($Source){
  $SourcePath=(Resolve-Path -LiteralPath $Source).Path
  New-Item (Split-Path $Target -Parent) -ItemType Directory -Force | Out-Null
  Copy-Item -LiteralPath $SourcePath -Destination $Target -Force
}

if(-not (Test-Path -LiteralPath $Target)){
  throw 'Pinned liquidGL vendor file is missing. The build is intentionally fail-closed; supply a local v2.0.1 file with -Source.'
}

$ActualHash=(Get-FileHash -LiteralPath $Target -Algorithm SHA256).Hash.ToLowerInvariant()
if($ActualHash -ne $ExpectedHash){
  throw "liquidGL integrity check failed. Expected $ExpectedHash but found $ActualHash"
}

$text=Get-Content -LiteralPath $Target -Raw
if($text -notmatch 'Version:\s*v2\.0\.1' -or $text -notmatch 'export default liquidGL'){
  throw 'liquidGL content markers do not match v2.0.1.'
}
Write-Host '[PASS] liquidGL is fully self-hosted and SHA-256 verified.' -ForegroundColor Green
