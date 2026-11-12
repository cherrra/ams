# Требуется Node >= 22.22 (NestJS 12). Если системный Node старше,
# скрипт подставит локальную сборку Node 24 в PATH текущей сессии.
$node24 = "C:\Users\cherr\tools\node-v24.22.2-win-x64"

if (Test-Path $node24) {
  $env:PATH = "$node24;$env:PATH"
  Write-Host "Используется Node: $(& "$node24\node.exe" -v)"
} else {
  Write-Host "Локальный Node 24 не найден, используется системный: $(node -v)"
}
