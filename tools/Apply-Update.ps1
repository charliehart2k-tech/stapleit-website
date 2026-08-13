[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Package)

$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest

function Get-RelativePath([string]$Base,[string]$Target){
  $BaseFull=[IO.Path]::GetFullPath($Base).TrimEnd('\')+'\'
  $TargetFull=[IO.Path]::GetFullPath($Target)
  $BaseUri=New-Object System.Uri($BaseFull)
  $TargetUri=New-Object System.Uri($TargetFull)
  return [Uri]::UnescapeDataString($BaseUri.MakeRelativeUri($TargetUri).ToString()).Replace('/','\')
}
function Test-AllowedPath([string]$Relative){
  $clean=$Relative.TrimStart('.','\','/')
  if($clean -match '(^|[\\/])\.\.([\\/]|$)'){return $false}
  $rootFiles=@('Start-Staging.ps1','README.md','.gitignore')
  if($rootFiles -contains $clean){return $true}
  $top=($clean -split '[\\/]')[0]
  return @('site','tools','docs','reference','deploy') -contains $top
}

$Master=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$PackagePath=(Resolve-Path -LiteralPath $Package).Path
$Work=Join-Path $Master 'staging\runtime\apply'
$BackupRoot=Join-Path $Master ('staging\backups\'+(Get-Date -Format 'yyyyMMdd-HHmmss'))

try{
  if(Test-Path $Work){Remove-Item $Work -Recurse -Force}
  New-Item $Work -ItemType Directory -Force|Out-Null

  if((Get-Item -LiteralPath $PackagePath).PSIsContainer){
    $Source=$PackagePath
  }elseif([IO.Path]::GetExtension($PackagePath) -ieq '.zip'){
    Expand-Archive -LiteralPath $PackagePath -DestinationPath $Work -Force
    $Source=$Work
  }else{
    throw 'Update must be a folder or ZIP file.'
  }

  # Friendly handling for ZIPs that contain one wrapper directory.
  $topItems=@(Get-ChildItem -LiteralPath $Source -Force|Where-Object{$_.Name -ne '__MACOSX'})
  if($topItems.Count -eq 1 -and $topItems[0].PSIsContainer){
    $candidate=$topItems[0].FullName
    $candidateItems=@(Get-ChildItem -LiteralPath $candidate -Force)
    $looksLikePatch=$candidateItems|Where-Object{
      $_.Name -in @('site','tools','docs','reference','deploy','Start-Staging.ps1','README.md','.gitignore')
    }
    if($looksLikePatch){$Source=$candidate}
  }

  $Files=@(Get-ChildItem -LiteralPath $Source -File -Recurse|Where-Object{$_.FullName -notmatch '[\\/]__MACOSX[\\/]?'})
  if(-not $Files){throw 'No files found in update package.'}

  $Plan=@()
  foreach($File in $Files){
    $Relative=Get-RelativePath $Source $File.FullName
    if(-not (Test-AllowedPath $Relative)){throw "Unsupported or unsafe update path: $Relative"}
    $Target=Join-Path $Master $Relative
    $Plan+=New-Object PSObject -Property @{Source=$File.FullName;Relative=$Relative;Target=$Target}
  }

  foreach($Item in $Plan){
    if(Test-Path -LiteralPath $Item.Target){
      $Backup=Join-Path $BackupRoot $Item.Relative
      New-Item (Split-Path $Backup -Parent) -ItemType Directory -Force|Out-Null
      Copy-Item -LiteralPath $Item.Target -Destination $Backup -Force
    }
  }
  foreach($Item in $Plan){
    New-Item (Split-Path $Item.Target -Parent) -ItemType Directory -Force|Out-Null
    Copy-Item -LiteralPath $Item.Source -Destination $Item.Target -Force
    Write-Host "[UPDATED] $($Item.Relative)"
  }

  Write-Host ''
  Write-Host "[OK] Applied $($Plan.Count) file(s)." -ForegroundColor Green
  if(Test-Path $BackupRoot){Write-Host "[BACKUP] $BackupRoot" -ForegroundColor Cyan}
  Write-Host '[LIVE] Browser auto-refresh will pick up the changes.' -ForegroundColor Cyan
}catch{
  # IMPORTANT: do not call exit here. Start-Staging.ps1 deliberately catches a
  # failed command and keeps the interactive staging server alive.
  throw "Update failed: $($_.Exception.Message)"
}finally{
  if(Test-Path $Work){Remove-Item $Work -Recurse -Force -ErrorAction SilentlyContinue}
}
