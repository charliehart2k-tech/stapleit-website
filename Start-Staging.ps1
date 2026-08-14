<#
.SYNOPSIS
    Runs the Staple IT site locally with live reload and a small staging console.

.DESCRIPTION
    Launches tools\dev\_server.py against the site\ folder, opens the local
    site, and provides a few safe helper commands for opening pages, editing
    files, replacing text from the clipboard, injecting local assets, running
    the static-site audit, and inspecting server logs.

    The server binds only to 127.0.0.1. Commands that write files refuse paths
    outside the repository and make timestamped backups before replacement.
#>
[CmdletBinding()]
param(
  [ValidateRange(0,65535)]
  [int]$Port = 0,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Master    = $PSScriptRoot
$Site      = Join-Path $Master 'site'
$Tools     = Join-Path $Master 'tools'
$Runtime   = Join-Path $Master 'staging\runtime'
$PortFile  = Join-Path $Runtime 'port.txt'
$StdOut    = Join-Path $Runtime 'server.log'
$StdErr    = Join-Path $Runtime 'server-error.log'
$Server    = Join-Path $Tools 'dev\_server.py'
$Audit     = Join-Path $Tools 'audit-site.py'
$BuildFile = Join-Path $Master 'BUILD-ID.txt'
$BuildId   = if(Test-Path $BuildFile){ ((Get-Content $BuildFile -Raw).Trim() -replace "`r?`n", ' · ') } else { 'unlabelled build' }
$Proc      = $null
$Url       = $null

$Aliases = @{
  'home'        = 'site\index.html'
  'support'     = 'site\it-services\it-support\index.html'
  'solutions'   = 'site\it-services\it-solutions\index.html'
  'consultancy' = 'site\it-services\it-consultancy\index.html'
  'security'    = 'site\it-services\cybersecurity\index.html'
  'ai'          = 'site\it-services\ai-integrations\index.html'
  'portal'      = 'site\client-portal\index.html'
  'homecss'     = 'site\assets\css\home-hero.css'
  'base'        = 'site\assets\css\base.css'
  'tokens'      = 'site\assets\css\tokens.css'
  'glass'       = 'site\assets\css\glass.css'
  'nav'         = 'site\assets\css\nav.css'
  'shell'       = 'site\assets\css\reset-shell.css'
  'appjs'       = 'site\assets\js\app.js'
  'server'      = 'tools\dev\_server.py'
  'audittool'   = 'tools\audit-site.py'
}

function Write-Info([string]$Message){ Write-Host $Message -ForegroundColor Cyan }
function Write-Ok([string]$Message){ Write-Host $Message -ForegroundColor Green }
function Write-Warn([string]$Message){ Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Fail([string]$Message){ Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Field([string]$Tag,[string]$Value){
  Write-Host ("[{0}] " -f $Tag) -ForegroundColor Cyan -NoNewline
  Write-Host $Value
}

function Get-RelativePath([string]$Base,[string]$Target){
  $baseFull = [IO.Path]::GetFullPath($Base).TrimEnd('\') + '\'
  $targetFull = [IO.Path]::GetFullPath($Target)
  $baseUri = New-Object System.Uri($baseFull)
  $targetUri = New-Object System.Uri($targetFull)
  return [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()).Replace('/','\')
}

function Test-PathWithinMaster([string]$Path){
  $full = [IO.Path]::GetFullPath($Path)
  $rootPath = [IO.Path]::GetFullPath($Master).TrimEnd('\') + '\'
  return $full.StartsWith($rootPath,[StringComparison]::OrdinalIgnoreCase)
}

function Find-Python{
  $py = Get-Command py -ErrorAction SilentlyContinue
  if($py){
    & $py.Source -3 --version *> $null
    if($LASTEXITCODE -eq 0){ return [pscustomobject]@{ Path=$py.Source; Args=@('-3') } }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if($python -and $python.Source -notlike '*\WindowsApps\python*.exe'){
    & $python.Source --version *> $null
    if($LASTEXITCODE -eq 0){ return [pscustomobject]@{ Path=$python.Source; Args=@() } }
  }

  throw 'Python 3 was not found. Install it from python.org or run: winget install Python.Python.3'
}

function Quote-ProcessArgument([string]$Value){
  if($Value.Contains('"')){ throw "Cannot launch a path containing a double quote: $Value" }
  return '"' + $Value + '"'
}

function Start-Server{
  if(-not (Test-Path $Server)){ throw "Dev server script not found: $Server" }
  if(Test-Path $PortFile){ Remove-Item $PortFile -Force }
  New-Item $Runtime -ItemType Directory -Force | Out-Null

  $py = Find-Python
  $procArgs = @() + $py.Args + @(
    (Quote-ProcessArgument $Server),
    '--root',(Quote-ProcessArgument $Site),
    '--runtime',(Quote-ProcessArgument $Runtime),
    '--port',"$Port"
  )
  $script:Proc = Start-Process -FilePath $py.Path -ArgumentList $procArgs -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr

  $deadline = (Get-Date).AddSeconds(8)
  while(-not (Test-Path $PortFile)){
    if($script:Proc.HasExited){
      $err = if(Test-Path $StdErr){ Get-Content $StdErr -Raw } else { 'Unknown server error' }
      throw "Staging server stopped during startup. $err"
    }
    if((Get-Date) -gt $deadline){ throw 'Timed out waiting for staging server.' }
    Start-Sleep -Milliseconds 120
  }

  $portText = (Get-Content $PortFile -Raw).Trim()
  $parsedPort = 0
  if(-not [int]::TryParse($portText,[ref]$parsedPort)){ throw "Invalid staging port: '$portText'" }
  $script:Url = "http://127.0.0.1:$parsedPort/"
}

function Stop-Server{
  if($script:Proc -and -not $script:Proc.HasExited){
    Stop-Process -Id $script:Proc.Id -Force -ErrorAction SilentlyContinue
    try{ $script:Proc.WaitForExit() }catch{}
  }
}

function Resolve-Target([string]$Value){
  $key = $Value.ToLowerInvariant()
  if($Aliases.ContainsKey($key)){ return Join-Path $Master $Aliases[$key] }
  return [IO.Path]::GetFullPath((Join-Path $Master $Value))
}

function Backup-Target([string]$Target){
  if(-not (Test-Path -LiteralPath $Target)){ return $null }
  $relative = Get-RelativePath $Master $Target
  $backup = Join-Path $Master ('staging\backups\manual-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '\' + $relative)
  New-Item (Split-Path $backup -Parent) -ItemType Directory -Force | Out-Null
  Copy-Item -LiteralPath $Target -Destination $backup -Force
  return $backup
}

function Tokenize([string]$InputLine){
  $tokenMatches = [regex]::Matches($InputLine,'("[^"]*"|''[^'']*''|\S+)')
  $out = @()
  foreach($m in $tokenMatches){
    $v = $m.Value.Trim()
    if(($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))){
      $v = $v.Substring(1,$v.Length-2)
    }
    $out += $v
  }
  return $out
}

function Open-Editor([string]$Target){
  if(-not (Test-Path -LiteralPath $Target)){ throw "File not found: $Target" }
  if($env:EDITOR){
    $parts = @(Tokenize $env:EDITOR)
    $exe = $parts[0]
    $editorArgs = @() + ($parts | Select-Object -Skip 1) + @($Target)
    Start-Process -FilePath $exe -ArgumentList $editorArgs
  }else{
    Start-Process -FilePath 'notepad.exe' -ArgumentList "`"$Target`""
  }
}

function Run-Audit{
  if(-not (Test-Path $Audit)){ throw "Audit script not found: $Audit" }
  $py = Find-Python
  & $py.Path @($py.Args + @($Audit,'--root',$Site))
  if($LASTEXITCODE -eq 0){ Write-Ok '[OK] Static site audit passed.' }
  else{ Write-Warn "Static site audit returned exit code $LASTEXITCODE." }
}

function Help{
  Write-Host ''
  Write-Host 'Commands:'
  Write-Host '  open / home                 Open homepage'
  Write-Host '  who                         Open homepage at Who do we support?'
  Write-Host '  support / solutions         Open service routes'
  Write-Host '  consultancy / security / ai Open service routes'
  Write-Host '  portal                      Open Client Portal placeholder'
  Write-Host '  audit                       Run static-site integrity/security checks'
  Write-Host '  edit <alias>                Edit a repository file'
  Write-Host '  paste <alias>               Replace text file from clipboard (backup first)'
  Write-Host '  inject <src> <target>       Copy a file into the repository (backup first)'
  Write-Host '  aliases / paths / status    Show working information'
  Write-Host '  version / backups           Show build or recent backups'
  Write-Host '  log / errors                Show staging server diagnostics'
  Write-Host '  restart / clear             Restart server or clear console'
  Write-Host '  help / quit'
  Write-Host ''
}

try{
  if(-not (Test-Path (Join-Path $Site 'index.html'))){ throw "Site root is incomplete: $Site" }
  Start-Server

  Write-Host ''
  Write-Host '====================================================' -ForegroundColor DarkGray
  Write-Host ' Staple IT Live Staging' -ForegroundColor White
  Write-Host '====================================================' -ForegroundColor DarkGray
  Write-Field 'BUILD' $BuildId
  Write-Field 'URL' $Url
  Write-Field 'LIVE' $Site
  Write-Info '[AUTO] Browser refreshes after live file changes.'
  Write-Info '[SAFE] paste/inject make timestamped backups first.'
  Write-Info "[CHECK] Type 'audit' to run the static-site audit."

  if($NoBrowser){ Write-Info "[INFO] Browser auto-open skipped. Use 'open' to launch it." }
  else{ Start-Process $Url }
  Help

  :StagingLoop while($true){
    $line = (Read-Host 'staple').Trim()
    if(-not $line){ continue }

    try{
      $tokens = @(Tokenize $line)
      if($tokens.Count -eq 0){ continue }
      $cmd = ([string]$tokens[0]).ToLowerInvariant()

      switch($cmd){
        'open'        { Start-Process $Url }
        'home'        { Start-Process $Url }
        'who'         { Start-Process ($Url + '#who-we-support') }
        'support'     { Start-Process ($Url + 'it-services/it-support/') }
        'solutions'   { Start-Process ($Url + 'it-services/it-solutions/') }
        'consultancy' { Start-Process ($Url + 'it-services/it-consultancy/') }
        'security'    { Start-Process ($Url + 'it-services/cybersecurity/') }
        'ai'          { Start-Process ($Url + 'it-services/ai-integrations/') }
        'portal'      { Start-Process ($Url + 'client-portal/') }
        'audit'       { Run-Audit }
        'aliases' {
          $Aliases.GetEnumerator() | Sort-Object Name | ForEach-Object {
            Write-Host ("  {0,-12} {1}" -f $_.Name,$_.Value)
          }
        }
        'paths' {
          Write-Field 'SITE'      $Site
          Write-Field 'HOME'      (Join-Path $Site 'index.html')
          Write-Field 'CSS'       (Join-Path $Site 'assets\css')
          Write-Field 'JS'        (Join-Path $Site 'assets\js')
          Write-Field 'MEDIA'     (Join-Path $Site 'assets\media')
          Write-Field 'REFERENCE' (Join-Path $Master 'reference')
          Write-Field 'TOOLS'     $Tools
        }
        'version' { Write-Field 'BUILD' $BuildId; Write-Field 'ROOT' $Master }
        'status' {
          $running = $script:Proc -and -not $script:Proc.HasExited
          Write-Field 'BUILD' $BuildId
          Write-Field 'SERVER' $(if($running){'running'}else{'stopped'})
          Write-Field 'URL' $Url
          if($running){
            $uptime = (Get-Date) - $script:Proc.StartTime
            Write-Field 'UPTIME' ('{0:hh\:mm\:ss}' -f $uptime)
          }
        }
        'backups' {
          $backupRoot = Join-Path $Master 'staging\backups'
          if(-not (Test-Path $backupRoot)){ Write-Info 'No backups yet.' }
          else{
            Get-ChildItem $backupRoot -Directory |
              Sort-Object LastWriteTime -Descending |
              Select-Object -First 15 |
              ForEach-Object { Write-Host ("  {0}  {1}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'),$_.Name) }
          }
        }
        'edit' {
          if($tokens.Count -lt 2){ Write-Warn 'Usage: edit <alias-or-relative-path>'; continue }
          $target = Resolve-Target $tokens[1]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to open a path outside the repository: $target" }
          Open-Editor $target
          Write-Field 'EDIT' $target
        }
        'paste' {
          if($tokens.Count -lt 2){ Write-Warn 'Usage: paste <alias-or-relative-path>'; continue }
          $target = Resolve-Target $tokens[1]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to write outside the repository: $target" }
          $content = Get-Clipboard -Raw -ErrorAction SilentlyContinue
          if([string]::IsNullOrWhiteSpace($content)){ Write-Warn 'Clipboard is empty.'; continue }
          $backup = Backup-Target $target
          New-Item (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
          [IO.File]::WriteAllText($target,$content,(New-Object Text.UTF8Encoding($false)))
          Write-Field 'PASTED' $target
          if($backup){ Write-Field 'BACKUP' $backup }
        }
        'inject' {
          if($tokens.Count -lt 3){ Write-Warn 'Usage: inject "C:\path\file" "site\assets\..."'; continue }
          $src = (Resolve-Path -LiteralPath $tokens[1]).Path
          $target = Resolve-Target $tokens[2]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to write outside the repository: $target" }
          $backup = Backup-Target $target
          New-Item (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
          Copy-Item -LiteralPath $src -Destination $target -Force
          Write-Field 'INJECTED' $target
          if($backup){ Write-Field 'BACKUP' $backup }
        }
        'log'     { if(Test-Path $StdOut){ Get-Content $StdOut -Tail 24 } else { Write-Info 'No request log yet.' } }
        'errors'  { if(Test-Path $StdErr){ Get-Content $StdErr -Tail 40 } else { Write-Info 'No error log yet.' } }
        'restart' { Stop-Server; Start-Server; Write-Ok "[OK] Restarted: $Url" }
        'clear'   { Clear-Host }
        'cls'     { Clear-Host }
        'help'    { Help }
        'quit'    { break StagingLoop }
        'exit'    { break StagingLoop }
        default   { Write-Warn "Unknown command '$cmd'. Type 'help' for the command list." }
      }
    }catch{
      Write-Fail $_.Exception.Message
    }
  }
}catch{
  Write-Error "FAILED: $($_.Exception.Message)"
  if(Test-Path $StdErr){ Get-Content $StdErr -Tail 40 }
  exit 1
}finally{
  Stop-Server
  Write-Host '[INFO] Staple IT staging stopped.'
}
