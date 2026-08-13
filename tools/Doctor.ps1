[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$Master=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Doctor=Join-Path $PSScriptRoot 'doctor.py'
$env:PYTHONDONTWRITEBYTECODE='1'

$py=Get-Command py -ErrorAction SilentlyContinue
if($py){& $py.Source -3 $Doctor --project $Master;if($LASTEXITCODE -ne 0){throw 'Framework acceptance gate failed.'};return}
$python=Get-Command python -ErrorAction SilentlyContinue
if($python){& $python.Source $Doctor --project $Master;if($LASTEXITCODE -ne 0){throw 'Framework acceptance gate failed.'};return}
throw 'Python 3 was not found.'
