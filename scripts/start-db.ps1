# Запуск MySQL 8.0 из OSPanel без графической оболочки.
# OSPanel подставляет в my.ini свои плейсхолдеры (%sprogdir% и т.п.) при старте,
# поэтому здесь собираем временный конфиг с реальными путями и запускаем mysqld.
#
# Использование: powershell -ExecutionPolicy Bypass -File scripts\start-db.ps1

$ErrorActionPreference = "Stop"

$osPanel = "C:\OSPanel"
$driver = "MySQL-8.0-Win10"
$port = 3306
$mysqld = Join-Path $osPanel "modules\database\$driver\bin\mysqld.exe"
$template = Join-Path $osPanel "userdata\config\${driver}_my.ini"
$iniPath = Join-Path $env:TEMP "ams-mysql.ini"

if (-not (Test-Path $mysqld)) {
  throw "Не найден mysqld: $mysqld"
}

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
  Write-Host "MySQL уже слушает 127.0.0.1:$port" -ForegroundColor Green
  exit 0
}

$ini = Get-Content -Raw -Encoding UTF8 $template
$ini = $ini.Replace("%sprogdir%", $osPanel.Replace("\", "/"))
$ini = $ini.Replace("%mysql_driver%", $driver)
$ini = $ini.Replace("%mysqlport%", "$port")
$ini = $ini.Replace("%ip%", "127.0.0.1")
$ini = $ini.Replace("%log%", "")

[System.IO.File]::WriteAllText($iniPath, $ini, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Запускаю MySQL ($driver)..." -ForegroundColor Yellow
Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=`"$iniPath`"" -WindowStyle Hidden

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Milliseconds 500
  if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "MySQL готов: 127.0.0.1:$port" -ForegroundColor Green
    exit 0
  }
}

throw "MySQL не запустился за 15 секунд. Лог: $osPanel\userdata\logs\${driver}_error.log"
