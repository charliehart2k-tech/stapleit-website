<#
.SYNOPSIS
    Runs a local live-staging server for the site and opens an interactive
    console for editing, patching, and inspecting the live copy.

.DESCRIPTION
    Start-Staging.ps1 launches the Python dev server (tools\dev\_server.py)
    against the `site` folder, opens it in the browser, then hands control
    to an interactive "staple>" prompt. From there you can open pages, edit
    live files, replace file contents from the clipboard, inject external
    files into the master copy, and apply packaged updates - all with
    automatic timestamped backups before anything destructive happens.

    A single bad command (bad path, empty clipboard, a failing external
    script, etc.) is caught and reported without ending the session, so you
    don't lose the server and have to restart the whole tool.

.PARAMETER Port
    TCP port for the dev server. Defaults to 0, which lets the OS choose a
    free port automatically (the real port is read back from
    staging\runtime\port.txt).

.PARAMETER NoBrowser
    Don't automatically open the site in the browser on startup. The server
    still starts normally; use the 'open' command whenever you want it.

.EXAMPLE
    .\Start-Staging.ps1

.EXAMPLE
    .\Start-Staging.ps1 -Port 8080 -NoBrowser
#>
[CmdletBinding()]
param(
  [ValidateRange(0,65535)]
  [int]$Port = 0,

  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Master   = $PSScriptRoot
$Site     = Join-Path $Master 'site'
$Tools    = Join-Path $Master 'tools'
$Runtime  = Join-Path $Master 'staging\runtime'
$PortFile = Join-Path $Runtime 'port.txt'
$StdOut   = Join-Path $Runtime 'server.log'
$StdErr   = Join-Path $Runtime 'server-error.log'
$Server   = Join-Path $Tools 'dev\_server.py'
$BuildFile = Join-Path $Master 'BUILD-ID.txt'
$BuildId = if(Test-Path $BuildFile){ ((Get-Content $BuildFile -Raw).Trim() -replace "`r?`n", ' · ') } else { 'unlabelled build' }
$Proc = $null
$Url  = $null

$Aliases = @{
  'home'       = 'site\index.html'
  'support'    = 'site\it-services\it-support\index.html'
  'solutions'  = 'site\it-services\it-solutions\index.html'
  'consultancy'= 'site\it-services\it-consultancy\index.html'
  'security'   = 'site\it-services\cybersecurity\index.html'
  'ai'         = 'site\it-services\ai-integrations\index.html'
  'homecss'    = 'site\assets\css\pages\home.css'
  'supportcss' = 'site\assets\css\pages\it-support.css'
  'servicecss' = 'site\assets\css\pages\service-v1.css'
  'tokens'     = 'site\assets\css\tokens.css'
  'glass'      = 'site\assets\css\glass.css'
  'nav'        = 'site\assets\css\nav.css'
  'footer'     = 'site\assets\css\footer.css'
  'appjs'      = 'site\assets\js\app.js'
  'liquidjs'   = 'site\assets\js\liquid-enhance.js'
}

# ----------------------------------------------------------------------------
# Output helpers
# ----------------------------------------------------------------------------
function Write-Info([string]$Message){ Write-Host $Message -ForegroundColor Cyan }
function Write-Ok([string]$Message){ Write-Host $Message -ForegroundColor Green }
function Write-Warn([string]$Message){ Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Fail([string]$Message){ Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Field([string]$Tag,[string]$Value){
  Write-Host ("[{0}] " -f $Tag) -ForegroundColor Cyan -NoNewline
  Write-Host $Value
}

function Get-RelativePath([string]$Base,[string]$Target){
  $BaseFull = [IO.Path]::GetFullPath($Base).TrimEnd('\') + '\'
  $TargetFull = [IO.Path]::GetFullPath($Target)
  $BaseUri = New-Object System.Uri($BaseFull)
  $TargetUri = New-Object System.Uri($TargetFull)
  return [Uri]::UnescapeDataString($BaseUri.MakeRelativeUri($TargetUri).ToString()).Replace('/','\')
}

function Test-PathWithinMaster([string]$Path){
  # Comparing with a trailing separator prevents prefix collisions such as
  # C:\Site accidentally matching a sibling such as C:\SiteEvil.
  $full = [IO.Path]::GetFullPath($Path)
  $rootPath = [IO.Path]::GetFullPath($Master).TrimEnd('\') + '\'
  return $full.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)
}

function Find-Python{
  # Prefer the official Windows py launcher, then fall back to python.
  $py = Get-Command py -ErrorAction SilentlyContinue
  if($py){
    & $py.Source -3 --version *> $null
    if($LASTEXITCODE -eq 0){ return [pscustomobject]@{ Path = $py.Source; Args = @('-3') } }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if($python -and $python.Source -notlike '*\WindowsApps\python*.exe'){
    & $python.Source --version *> $null
    if($LASTEXITCODE -eq 0){ return [pscustomobject]@{ Path = $python.Source; Args = @() } }
  }

  throw 'Python 3 was not found. Install it from python.org or run: winget install Python.Python.3'
}


function Start-Server{
  if(-not (Test-Path $Server)){ throw "Dev server script not found: $Server" }
  if(Test-Path $PortFile){ Remove-Item $PortFile -Force }
  New-Item $Runtime -ItemType Directory -Force | Out-Null

  $py = Find-Python
  $procArgs = @() + $py.Args + @($Server,'--root',$Site,'--runtime',$Runtime,'--port',$Port)
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
  if(-not [int]::TryParse($portText,[ref]$parsedPort)){
    throw "Dev server wrote an invalid port value: '$portText'"
  }
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
  $Relative = Get-RelativePath $Master $Target
  $Backup = Join-Path $Master ('staging\backups\manual-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '\' + $Relative)
  New-Item (Split-Path $Backup -Parent) -ItemType Directory -Force | Out-Null
  Copy-Item -LiteralPath $Target -Destination $Backup -Force
  return $Backup
}

function Tokenize([string]$InputLine){
  # Do not use $matches here: variable names are case-insensitive and
  # $Matches is PowerShell's automatic regex result variable.
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

function Help{
  Write-Host ''
  Write-Host 'Commands:'
  Write-Host '  home / support             Open those live pages'
  Write-Host '  solutions / consultancy    Open the new service pages'
  Write-Host '  security / ai              Open the new service pages'
  Write-Host '  liquid                     Open homepage with liquidGL enabled'
  Write-Host '  liquidaudit                Open homepage at the audit liquidGL surface'
  Write-Host '  liquidoff                  Open CSS-only comparison'
  Write-Host '  liquiddebug                Open homepage liquidGL with status overlay'
  Write-Host '  install-liquid             Verify the self-hosted liquidGL vendor hash'
  Write-Host '  doctor                     Run framework acceptance checks'
  Write-Host '  open                       Open homepage'
  Write-Host '  edit <alias>               Edit a live file'
  Write-Host '  paste <alias>              Replace live HTML/CSS/JS from clipboard (backup first)'
  Write-Host '  inject <src> <target>      Copy an asset/file into the master (backup first)'
  Write-Host '  apply <zip|folder>         Apply a ChatGPT update package'
  Write-Host '  aliases / paths / status   Show working information'
  Write-Host '  version                    Show the exact build you are running'
  Write-Host '  backups                    List recent manual backups'
  Write-Host '  log / errors               Diagnostics'
  Write-Host '  restart                    Restart local server'
  Write-Host '  clear                      Clear the screen'
  Write-Host '  help / quit'
  Write-Host ''
}

try{
  if(-not (Test-Path (Join-Path $Site 'index.html'))){ throw "Site root is incomplete: $Site" }
  Start-Server
  Write-Host ''
  Write-Host '====================================================' -ForegroundColor DarkGray
  Write-Host ' Staple IT Live Staging - Framework' -ForegroundColor White
  Write-Host '====================================================' -ForegroundColor DarkGray
  Write-Field 'BUILD' $BuildId
  Write-Field 'URL'  $Url
  Write-Field 'LIVE' $Site
  Write-Info '[AUTO] Browser refreshes after live file changes.'
  Write-Info '[SAFE] paste/inject/apply make backups first.'

  if($NoBrowser){
    Write-Info "[INFO] Browser auto-open skipped (-NoBrowser). Use 'open' to launch it."
  }else{
    Start-Process $Url
  }
  Help

  :StagingLoop while($true){
    $line = (Read-Host 'staple').Trim()
    if(-not $line){ continue }

    # Command parsing lives inside the per-command try/catch. PowerShell
    # unwraps one-item arrays returned from functions, so force @() here:
    # without this, a one-word command such as `liquid` becomes a String and
    # indexing [0] returns a System.Char. That was the cause of the
    # `System.Char ... ToLowerInvariant` crash.
    try{
      $tokens = @(Tokenize $line)
      if($tokens.Count -eq 0){ continue }
      $cmd = ([string]$tokens[0]).ToLowerInvariant()

      switch($cmd){
        'open'    { Start-Process $Url }
        'home'    { Start-Process $Url }
        'support' { Start-Process ($Url + 'it-services/it-support/') }
        'solutions' { Start-Process ($Url + 'it-services/it-solutions/') }
        'consultancy' { Start-Process ($Url + 'it-services/it-consultancy/') }
        'security' { Start-Process ($Url + 'it-services/cybersecurity/') }
        'ai' { Start-Process ($Url + 'it-services/ai-integrations/') }
        'liquid' { Start-Process ($Url + '?liquid=on') }
        'liquidaudit' { Start-Process ($Url + '?liquid=on#audit') }
        'liquidoff' { Start-Process ($Url + '?liquid=off#audit') }
        'liquiddebug' { Start-Process ($Url + '?liquid=on&liquiddebug=1#audit') }
        'install-liquid' { & (Join-Path $Tools 'Install-LiquidGL.ps1') }
        'doctor' { & (Join-Path $Tools 'Doctor.ps1') }
        'aliases' {
          $Aliases.GetEnumerator() | Sort-Object Name | ForEach-Object {
            Write-Host ("  {0,-12} {1}" -f $_.Name,$_.Value)
          }
        }
        'paths' {
          Write-Field 'SITE'      $Site
          Write-Field 'HOME'      (Join-Path $Site 'index.html')
          Write-Field 'SUPPORT'   (Join-Path $Site 'it-services\it-support\index.html')
          Write-Field 'CSS'       (Join-Path $Site 'assets\css')
          Write-Field 'JS'        (Join-Path $Site 'assets\js')
          Write-Field 'IMAGES'    (Join-Path $Site 'assets\images')
          Write-Field 'INBOX'     (Join-Path $Master 'staging\inbox')
          Write-Field 'REFERENCE' (Join-Path $Master 'reference')
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
          if(-not (Test-Path $backupRoot)){
            Write-Info 'No backups yet.'
          }else{
            Get-ChildItem $backupRoot -Directory |
              Sort-Object LastWriteTime -Descending |
              Select-Object -First 15 |
              ForEach-Object { Write-Host ("  {0}  {1}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'),$_.Name) }
          }
        }
        'edit' {
          if($tokens.Count -lt 2){ Write-Warn 'Usage: edit home | support | homecss | supportcss | tokens | glass | nav'; continue }
          $target = Resolve-Target $tokens[1]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to open a path outside the master folder: $target" }
          Open-Editor $target
          Write-Field 'EDIT' $target
        }
        'paste' {
          if($tokens.Count -lt 2){ Write-Warn 'Usage: paste home | support | homecss | supportcss | tokens | glass | nav'; continue }
          $target = Resolve-Target $tokens[1]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to write outside the master folder: $target" }
          $content = Get-Clipboard -Raw -ErrorAction SilentlyContinue
          if([string]::IsNullOrWhiteSpace($content)){ Write-Warn 'Clipboard is empty.'; continue }
          $backup = Backup-Target $target
          New-Item (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
          [IO.File]::WriteAllText($target,$content,(New-Object Text.UTF8Encoding($false)))
          Write-Field 'PASTED' $target
          if($backup){ Write-Field 'BACKUP' $backup }
        }
        'inject' {
          if($tokens.Count -lt 3){ Write-Warn 'Usage: inject "C:\path\file.png" "site\assets\images\file.png"'; continue }
          $src = (Resolve-Path -LiteralPath $tokens[1]).Path
          $target = Resolve-Target $tokens[2]
          if(-not (Test-PathWithinMaster $target)){ throw "Refusing to write outside the master folder: $target" }
          $backup = Backup-Target $target
          New-Item (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
          Copy-Item -LiteralPath $src -Destination $target -Force
          Write-Field 'INJECTED' $target
          if($backup){ Write-Field 'BACKUP' $backup }
        }
        'apply' {
          if($tokens.Count -lt 2){ Write-Warn 'Usage: apply .\staging\inbox\update.zip'; continue }
          $updater = Join-Path $Tools 'Apply-Update.ps1'
          if(-not (Test-Path $updater)){ throw "Updater script not found: $updater" }
          & $updater -Package $tokens[1]
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
