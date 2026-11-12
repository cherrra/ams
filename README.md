# AMS — автосервис (Expo + NestJS)

Новая реализация мобильного приложения автосервиса: клиент на React Native (Expo), сервер на NestJS.

## Структура

```
ams/
  apps/
    api/        # NestJS 12 + Prisma + MySQL
    mobile/     # Expo SDK 58 + expo-router (этапы 5–7)
  packages/
    shared/     # общие типы, статусы, константы
  docs/         # анализ legacy, схема БД, roadmap
  scripts/      # вспомогательные скрипты для Windows
```

## Требования

- **Node.js >= 22.22** (NestJS 12 — ESM-пакеты; проверено на 24.22.2)
- **MySQL 8.x** (локально: OSPanel, порт 3306, база `ams_db`)
- npm 10+ (используются npm workspaces)

Если системный Node старше требуемого, перед командами выполните в PowerShell:

```powershell
. .\scripts\use-node24.ps1
```

## Быстрый старт API

```powershell
. .\scripts\use-node24.ps1
copy apps\api\.env.example apps\api\.env    # отредактируйте DATABASE_URL и JWT-секреты
npm install
npm run build:shared
npm run prisma:generate
npm run prisma:migrate                      # создаст таблицы в указанной БД
npm run prisma:seed                         # данные из legacy-дампа + демо-аккаунты
npm run dev:api
```

- API: http://localhost:3005/api/v1
- Healthcheck: http://localhost:3005/api/v1/health
- Swagger: http://localhost:3005/docs

Демо-доступы после сида: `admin@ams.local` / `Admin12345`, `user@ams.local` / `User12345`.

## Запуск мобильного приложения

### 1. База данных

Если MySQL из OSPanel не запущен автоматически:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-db.ps1
```

Скрипт поднимает MySQL 8.0 из OSPanel на `127.0.0.1:3306` без графической оболочки.

### 2. API

```powershell
. .\scripts\use-node24.ps1
npm run dev:api
```

API должен слушать `http://localhost:3005`. Телефон обращается к нему по LAN-адресу
компьютера — приложение вычисляет его из адреса dev-сервера Expo автоматически.

### 3. Приложение

```powershell
npm run dev:mobile
```

В терминале появится QR-код:

- **Телефон**: установите **Expo Go** (Android / iOS), отсканируйте QR. Компьютер и телефон
  должны быть в одной Wi-Fi-сети. Если Windows блокирует соединение, разрешите Node.js
  в брандмауэре для частных сетей.
- **Браузер**: нажмите `w` в терминале Expo или запустите `npm run dev:mobile:web`
  (http://localhost:8081).

Если телефон не видит API, задайте адрес явно — создайте `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3005/api/v1
```

(замените IP на адрес компьютера в локальной сети; после изменения перезапустите Expo
с флагом `--clear`). Порт API по умолчанию — `3005`; если вы его меняли, укажите
`EXPO_PUBLIC_API_PORT=3005` или полный `EXPO_PUBLIC_API_URL`.

### Фото профиля и автомобилей

Аватар меняется на экране «Профиль» (тап по аватарке), фото авто — в «Гараже» (тап по
фото или иконке). Приложение использует `expo-image-picker`, поэтому:

- на телефоне при первом выборе разрешите доступ к галерее;
- файлы складываются в `apps/api/uploads/avatars` и `apps/api/uploads/cars` и отдаются
  по адресу `http://<IP>:3005/uploads/...`;
- папка `apps/api/uploads` не должна попадать в git (уже в `.gitignore`).

Удалить аккаунт можно внизу экрана «Профиль»: приложение попросит подтверждение и удалит
пользователя вместе с авто и историей записей (`DELETE /auth/me`).

### Уведомления о заказах

Пока приложение открыто, оно раз в 30 секунд проверяет заказы:

- клиенту приходит уведомление при смене статуса его записи;
- администратору — о новых записях;
- на телефоне дополнительно показывается системное уведомление (при первом запуске
  система спросит разрешение), в браузере — только баннер сверху;
- экраны заказов обновляются сами, перезагружать вручную не нужно.

Push-уведомления при закрытом приложении требуют development build и будут добавлены
отдельным этапом (в Expo Go на Android они недоступны).

### Проверка типов мобильного приложения

```powershell
npm run typecheck:mobile
```

## Проверка API

```powershell
# при запущенном API
powershell -ExecutionPolicy Bypass -File scripts\smoke.ps1
```

Скрипт проходит health → логин → refresh → профиль → каталог → гараж → создание заказа →
конфликт слота (409) → отмена → удаление → админские ручки и проверку 403 для обычного пользователя.

## Бэкапы БД

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
```

Дамп `ams_db` попадает в `backups/` (папка в `.gitignore`), файлы старше 14 дней удаляются.
Параметр `-KeepDays` меняет срок хранения, `-BackupDir` — папку. Как поставить задание по
расписанию и как восстанавливать дамп — в `docs/deployment.md`.

## Документация

- `docs/legacy-analysis.md` — разбор старого Android/Express-проекта
- `docs/database.md` — миграции, сид, работа с MySQL
- `docs/api.md` — эндпоинты нового API
- `docs/acceptance.md` — чек-лист приёмки (паритет экранов и сценарии)
- `docs/deployment.md` — домен, HTTPS, бэкапы, логи, сборка приложения
- `docs/roadmap.md` — план миграции по этапам
