param(
  [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"

function Get-DatabaseUrl {
  $envLocalPath = Join-Path $PWD ".env.local"
  $envPath = Join-Path $PWD ".env"

  $line = $null
  if (Test-Path $envLocalPath) {
    $line = (Select-String -Path $envLocalPath -Pattern '^DATABASE_URL=' | Select-Object -First 1).Line
  }

  if (-not $line -and (Test-Path $envPath)) {
    $line = (Select-String -Path $envPath -Pattern '^DATABASE_URL=' | Select-Object -First 1).Line
  }

  if (-not $line) {
    throw "DATABASE_URL tidak ditemukan di .env.local atau .env"
  }

  return ($line -replace '^DATABASE_URL="?','' -replace '"$','')
}

$dbUrl = Get-DatabaseUrl
$uri = [System.Uri]$dbUrl

$userInfo = $uri.UserInfo.Split(":", 2)
$dbUser = [System.Uri]::UnescapeDataString($userInfo[0])
$dbPassword = if ($userInfo.Length -gt 1) { [System.Uri]::UnescapeDataString($userInfo[1]) } else { "" }
$dbHost = $uri.Host
$dbPort = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$dbName = $uri.AbsolutePath.TrimStart("/")

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $OutputDir "absenapp-$timestamp.dump"

$env:PGPASSWORD = $dbPassword

Write-Host "Membuat backup database '$dbName' ke file: $backupFile"
& pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName -F c -f $backupFile --no-owner --no-privileges

if ($LASTEXITCODE -ne 0) {
  throw "Backup gagal. Exit code: $LASTEXITCODE"
}

Write-Host "Backup berhasil." -ForegroundColor Green
Write-Host "File: $backupFile"
