[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$BaseUrl
)
$ErrorActionPreference='Stop'
$BaseUrl=$BaseUrl.TrimEnd('/')
$failures=0
function Pass([string]$m){Write-Host "[PASS] $m" -ForegroundColor Green}
function Fail([string]$m){Write-Host "[FAIL] $m" -ForegroundColor Red;$script:failures++}

foreach($path in @('/','/it-services/it-support/','/.well-known/security.txt','/robots.txt','/sitemap.xml')){
  try{
    $r=Invoke-WebRequest -Uri ($BaseUrl+$path) -UseBasicParsing -MaximumRedirection 3
    if($r.StatusCode -eq 200){Pass "$path -> 200"}else{Fail "$path -> $($r.StatusCode)"}
  }catch{Fail "$path -> $($_.Exception.Message)"}
}

try{
  Invoke-WebRequest -Uri ($BaseUrl+'/this-route-must-not-exist/') -UseBasicParsing -ErrorAction Stop | Out-Null
  Fail 'Missing route unexpectedly returned success.'
}catch{
  $response=$_.Exception.Response
  if($response -and [int]$response.StatusCode -eq 404){Pass 'Custom missing-route status is 404.'}else{Fail 'Missing route did not return HTTP 404.'}
}

try{
  $head=Invoke-WebRequest -Uri ($BaseUrl+'/') -UseBasicParsing
  foreach($name in @('Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy')){
    if($head.Headers[$name]){Pass "Header present: $name"}else{Fail "Header missing: $name"}
  }
}catch{Fail "Header test failed: $($_.Exception.Message)"}

if($failures){throw "$failures production smoke test(s) failed."}
Write-Host '[OK] Production smoke test passed.' -ForegroundColor Cyan
