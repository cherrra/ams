# Дымовой тест API: health → login → профиль → каталог → авто → заказ → 409 → отмена → админ.
# Требует запущенного API (npm run dev:api) и засиженной БД.
# Использование: powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1

param(
  [string]$BaseUrl = "http://localhost:3005/api/v1",
  [string]$Email = "user@ams.local",
  [string]$Password = "User12345"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Net.Http

$script:failed = 0
$script:client = New-Object System.Net.Http.HttpClient

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body,
    [string]$Token,
    [int[]]$Expect = @(200, 201, 204)
  )

  $request = New-Object System.Net.Http.HttpRequestMessage(
    (New-Object System.Net.Http.HttpMethod($Method)),
    "$BaseUrl$Path"
  )

  if ($Token) {
    $request.Headers.Add("Authorization", "Bearer $Token") | Out-Null
  }

  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth 6 -Compress
    $request.Content = New-Object System.Net.Http.StringContent(
      $json,
      [System.Text.Encoding]::UTF8,
      "application/json"
    )
  }

  try {
    $response = $script:client.SendAsync($request).GetAwaiter().GetResult()
    $code = [int]$response.StatusCode
    $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  } catch {
    Write-Host "  FAIL $Method $Path — $($_.Exception.Message)" -ForegroundColor Red
    $script:failed++
    return $null
  } finally {
    $request.Dispose()
  }

  if ($Expect -notcontains $code) {
    Write-Host "  FAIL $Method $Path → $code : $content" -ForegroundColor Red
    $script:failed++
    return $null
  }

  Write-Host "  OK   $Method $Path → $code" -ForegroundColor Green

  if ([string]::IsNullOrWhiteSpace($content)) { return $null }
  return $content | ConvertFrom-Json
}

Write-Host "Health"
$null = Invoke-Api -Method GET -Path "/health"

Write-Host "Auth"
$auth = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email = $Email; password = $Password }
if (-not $auth) {
  Write-Host "Логин не удался, дальше проверять нечего" -ForegroundColor Red
  exit 1
}

$token = $auth.accessToken
$null = Invoke-Api -Method POST -Path "/auth/refresh" -Body @{ refreshToken = $auth.refreshToken }
$profile = Invoke-Api -Method GET -Path "/auth/me" -Token $token
# Патчим текущее имя, чтобы проверить ручку и не менять данные пользователя.
$null = Invoke-Api -Method PATCH -Path "/auth/me" -Token $token -Body @{ username = $profile.username }

Write-Host "Каталог"
$null = Invoke-Api -Method GET -Path "/categories"
$services = Invoke-Api -Method GET -Path "/services"

Write-Host "Гараж"
$null = Invoke-Api -Method GET -Path "/cars/brands" -Token $token
$cars = Invoke-Api -Method GET -Path "/cars" -Token $token
$carId = if ($cars -and $cars.Count -gt 0) { $cars[0].id } else { $null }

if (-not $carId) {
  $newCar = Invoke-Api -Method POST -Path "/cars" -Token $token -Body @{
    brandName = "Lada"
    modelName = "Vesta"
    year      = 2020
    mileage   = 50000
  }
  if ($newCar) {
    $carId = $newCar.id
    $null = Invoke-Api -Method PATCH -Path "/cars/$carId" -Token $token -Body @{ mileage = 51000 }
  }
}

Write-Host "Заказ"
$serviceId = if ($services -and $services.Count -gt 0) { $services[0].id } else { $null }

if ($carId -and $serviceId) {
  $date = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")

  $booked = Invoke-Api -Method GET -Path "/orders/booked-slots?date=$date" -Token $token
  $busy = @()
  if ($booked) { $busy = @($booked.booked) }

  $slot = $null
  for ($minutes = 9 * 60; $minutes -lt 20 * 60; $minutes += 30) {
    $candidate = "{0:D2}:{1:D2}" -f [int][math]::Floor($minutes / 60), [int]($minutes % 60)
    if ($busy -notcontains $candidate) { $slot = $candidate; break }
  }

  if ($slot) {
    $orderBody = @{
      carId      = $carId
      date       = $date
      time       = $slot
      serviceIds = @($serviceId)
      comment    = "smoke test"
    }

    $order = Invoke-Api -Method POST -Path "/orders" -Token $token -Body $orderBody

    if ($order) {
      $null = Invoke-Api -Method GET -Path "/orders" -Token $token
      $null = Invoke-Api -Method GET -Path "/orders/$($order.id)" -Token $token
      $null = Invoke-Api -Method POST -Path "/orders" -Token $token -Body $orderBody -Expect @(409)
      $null = Invoke-Api -Method PATCH -Path "/orders/$($order.id)/cancel" -Token $token
      $null = Invoke-Api -Method DELETE -Path "/orders/$($order.id)" -Token $token
    }
  } else {
    Write-Host "  SKIP все слоты на $date заняты" -ForegroundColor Yellow
  }
} else {
  Write-Host "  SKIP нет авто или услуг для создания заказа" -ForegroundColor Yellow
}

Write-Host "Админ"
$adminAuth = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email = "admin@ams.local"; password = "Admin12345" }
if ($adminAuth) {
  $null = Invoke-Api -Method GET -Path "/orders/admin" -Token $adminAuth.accessToken
  $null = Invoke-Api -Method GET -Path "/users" -Token $adminAuth.accessToken
  $null = Invoke-Api -Method GET -Path "/orders/admin" -Token $token -Expect @(403)
}

$script:client.Dispose()

Write-Host ""
if ($script:failed -eq 0) {
  Write-Host "Все проверки пройдены" -ForegroundColor Green
} else {
  Write-Host "Провалено проверок: $script:failed" -ForegroundColor Red
  exit 1
}
