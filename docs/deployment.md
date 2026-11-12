# Запуск в бой: домен, HTTPS, бэкапы, логи

Документ описывает минимальный продакшн-сетап: один сервер с MySQL, API на Node и
реверс-прокси с HTTPS, плюс мобильное приложение через EAS.

## 1. Переменные окружения

`apps/api/.env` на сервере (не коммитить):

```env
DATABASE_URL="mysql://ams:ПАРОЛЬ@127.0.0.1:3306/ams_db"
PORT=3005
API_PREFIX=api/v1
CORS_ORIGINS=https://ams.example.com
JWT_ACCESS_SECRET="<64 hex-символа>"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET="<64 hex-символа>"
JWT_REFRESH_EXPIRES_IN=30d
UPLOAD_DIR=uploads
BASE_URL="https://ams.example.com"
MAX_UPLOAD_SIZE_MB=5
```

Секреты:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Правила:

- `CORS_ORIGINS` — список через запятую; `*` только для локальной разработки.
- Смените пароль MySQL и не используйте `root` в проде.
- `BASE_URL` нужен для абсолютных ссылок на загруженные файлы.

## 2. Сборка и запуск API

```bash
npm ci
npm run build            # shared + api
npm run prisma:generate
npm run prisma:deploy    # миграции без интерактива
cd apps/api && node dist/main.js
```

`prisma:deploy` — это `prisma migrate deploy` (без вопросов и без сброса данных).

### systemd (Linux)

`/etc/systemd/system/ams-api.service`:

```ini
[Unit]
Description=AMS API
After=network.target mysql.service

[Service]
Type=simple
User=ams
WorkingDirectory=/srv/ams/apps/api
EnvironmentFile=/srv/ams/apps/api/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/ams/api.log
StandardError=append:/var/log/ams/api.error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ams-api
sudo systemctl status ams-api
```

### Windows (если сервер на Windows)

Запускать `node dist/main.js` как службу через NSSM:

```powershell
nssm install AmsApi "C:\Program Files\nodejs\node.exe" "C:\srv\ams\apps\api\dist\main.js"
nssm set AmsApi AppDirectory "C:\srv\ams\apps\api"
nssm set AmsApi AppStdout "C:\srv\ams\logs\api.log"
nssm set AmsApi AppStderr "C:\srv\ams\logs\api.error.log"
nssm start AmsApi
```

## 3. Домен и HTTPS

DNS: `A`-запись `ams.example.com` → IP сервера.

nginx (Linux), `/etc/nginx/sites-available/ams`:

```nginx
server {
    listen 80;
    server_name ams.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ams.example.com;

    ssl_certificate     /etc/letsencrypt/live/ams.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ams.example.com/privkey.pem;

    client_max_body_size 6m;

    location /uploads/ {
        alias /srv/ams/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сертификат:

```bash
sudo certbot --nginx -d ams.example.com
sudo certbot renew --dry-run
```

Важно:

- После включения HTTPS укажите `BASE_URL=https://ams.example.com` и перезапустите API.
- Настройте автопродление сертификата (certbot ставит таймер сам).
- Проверьте, что `https://ams.example.com/api/v1/health` отвечает `{"status":"ok"}`.

## 4. Бэкапы MySQL

Скрипт `scripts/backup-db.ps1` (Windows) делает дамп `ams_db` в папку `backups/` и удаляет
файлы старше 14 дней:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
```

Ежедневный запуск в Планировщике заданий:

```powershell
schtasks /Create /TN "AMS DB backup" /SC DAILY /ST 03:00 /RU SYSTEM ^
  /TR "powershell -ExecutionPolicy Bypass -File C:\srv\ams\scripts\backup-db.ps1"
```

На Linux — cron:

```cron
0 3 * * * mysqldump --single-transaction --routines --triggers ams_db | gzip > /srv/backups/ams_db_$(date +\%F).sql.gz
```

Проверка восстановления (обязательно хотя бы раз в месяц):

```bash
gunzip -c /srv/backups/ams_db_2026-11-03.sql.gz | mysql -u ams -p ams_db_test
```

Что важно:

- Храните копии вне сервера (S3, другой диск, Яндекс.Диск).
- Папка `apps/api/uploads` (аватары и фото авто) бэкапится отдельно — файлы не в БД.
- Перед миграцией схемы делайте дамп вручную.

## 5. Логи

- API пишет в stdout; systemd/NSSM перенаправляет в файл (`/var/log/ams/api.log`).
- Ротация на Linux: `/etc/logrotate.d/ams`

```
/var/log/ams/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    copytruncate
}
```

- nginx: `/var/log/nginx/access.log`, `error.log` — включите стандартную ротацию.
- Ошибки 5xx ищите по `ERROR` в логе API; запросы с кодом ≥ 400 — в access-логе nginx.
- Для продакшена можно добавить `pino`/`winston` и отправку в Sentry — отдельная задача.

## 6. Мобильное приложение

### Development build (нужен для push в будущем)

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform android
```

### Публикация

```bash
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest submit --platform android
```

- В `app.json` задайте `android.package` (например, `ru.example.ams`) и `ios.bundleIdentifier`.
- Для сборки укажите продовый адрес API: `EXPO_PUBLIC_API_URL=https://ams.example.com/api/v1`
  (в `eas.json` через `env` профиля `production`).
- Обновления JS без пересборки: `eas update --branch production`.
- Push-уведомления (FCM/APNs) добавляются после перехода на development build.

## 7. Переключение с legacy

1. Прогнать `docs/acceptance.md` на новом клиенте.
2. Сделать финальный дамп legacy-базы и загрузить данные в `ams_db` (при необходимости —
   скриптом переноса).
3. Переключить DNS/ссылку для пользователей, предупредить о смене приложения.
4. Оставить legacy-сервер в режиме «только чтение» на 2–4 недели.
5. Отключить legacy после отсутствия обращений.
