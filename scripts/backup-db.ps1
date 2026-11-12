# Daily MySQL dump for the AMS database.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1 -KeepDays 30
#
# Environment variables (optional):
#   AMS_DB_HOST, AMS_DB_PORT, AMS_DB_USER, AMS_DB_PASSWORD, AMS_DB_NAME
#
# The dump is written to <repo>\backups and old files are removed.

param(
  [int]$KeepDays = 14,
  [string]$BackupDir = ""
)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
if (-not $BackupDir) {
  $BackupDir = Join-Path $repo "backups"
}

$dbHost = if ($env:AMS_DB_HOST) { $env:AMS_DB_HOST } else { "127.0.0.1" }
$dbPort = if ($env:AMS_DB_PORT) { $env:AMS_DB_PORT } else { "3306" }
$dbUser = if ($env:AMS_DB_USER) { $env:AMS_DB_USER } else { "root" }
$dbName = if ($env:AMS_DB_NAME) { $env:AMS_DB_NAME } else { "ams_db" }

# Prefer OSPanel MySQL, then a local MySQL distribution on PATH.
$candidates = @(
  "C:\OSPanel\modules\database\MySQL-8.0-Win10\bin\mysqldump.exe",
  "C:\Users\cherr\tools\mysql-8.0.44-winx64\bin\mysqldump.exe"
)
$dump = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $dump) {
  $onPath = Get-Command mysqldump -ErrorAction SilentlyContinue
  if ($onPath) { $dump = $onPath.Source }
}
if (-not $dump) {
  throw "mysqldump.exe not found. Set it in PATH or edit the candidates list in this script."
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$file = Join-Path $BackupDir "${dbName}_$stamp.sql"

$dumpArgs = @(
  "--host=$dbHost",
  "--port=$dbPort",
  "--user=$dbUser",
  "--single-transaction",
  "--routines",
  "--triggers",
  "--default-character-set=utf8mb4",
  "--result-file=$file",
  $dbName
)

if ($env:AMS_DB_PASSWORD) {
  $dumpArgs = @("--password=$($env:AMS_DB_PASSWORD)") + $dumpArgs
}

Write-Host "Dumping $dbName to $file ..."
& $dump @dumpArgs
if ($LASTEXITCODE -ne 0) {
  throw "mysqldump exited with code $LASTEXITCODE"
}

$size = (Get-Item $file).Length
Write-Host ("Backup created: {0} ({1:N0} KB)" -f $file, ($size / 1KB))

$limit = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem -Path $BackupDir -Filter "${dbName}_*.sql" |
  Where-Object { $_.LastWriteTime -lt $limit } |
  ForEach-Object {
    Write-Host "Removing old backup: $($_.Name)"
    Remove-Item $_.FullName -Force
  }
