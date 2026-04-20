param(
  [string]$InputFile = ""
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

function Resolve-BackupFile([string]$fileArg) {
  if ($fileArg -and (Test-Path $fileArg)) {
    return (Resolve-Path $fileArg).Path
  }

  $backupDir = Join-Path $PWD "backups"
  if (-not (Test-Path $backupDir)) {
    throw "Folder backups tidak ditemukan. Jalankan npm run db:backup terlebih dahulu."
  }

  $latest = Get-ChildItem -Path $backupDir -Filter "*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) {
    throw "Tidak ada file backup .dump di folder backups."
  }

  return $latest.FullName
}

$dbUrl = Get-DatabaseUrl
$uri = [System.Uri]$dbUrl

$userInfo = $uri.UserInfo.Split(":", 2)
$dbUser = [System.Uri]::UnescapeDataString($userInfo[0])
$dbPassword = if ($userInfo.Length -gt 1) { [System.Uri]::UnescapeDataString($userInfo[1]) } else { "" }
$dbHost = $uri.Host
$dbPort = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$dbName = $uri.AbsolutePath.TrimStart("/")

$backupFile = Resolve-BackupFile $InputFile

$env:PGPASSWORD = $dbPassword

Write-Host "Restore database '$dbName' dari file: $backupFile"
& pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName --clean --if-exists --no-owner --no-privileges $backupFile

if ($LASTEXITCODE -ne 0) {
  throw "Restore gagal. Exit code: $LASTEXITCODE"
}

Write-Host "Restore berhasil." -ForegroundColor Green
