# Работа с БД

## Локальное окружение (эта машина)

- MySQL 8.0.30 из OSPanel, порт `3306`, пользователь `root` с пустым паролем.
- Новая БД: **`ams_db`** (legacy-база `auto_db` не затрагивается — остаётся как эталон данных).
- Служба `MySQL80` нерабочая (её `mysqld.exe` удалён), поэтому используем OSPanel.
- `DATABASE_URL="mysql://root:@127.0.0.1:3306/ams_db"` в `apps/api/.env`.

Проверка подключения:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -e "SHOW DATABASES;"
```

Клиент MySQL (если нет в PATH):

```powershell
& "C:\Users\cherr\tools\mysql-8.0.44-winx64\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root -e "SHOW DATABASES;"
```

## Создание БД и миграции

```powershell
. .\scripts\use-node24.ps1
mysql -h 127.0.0.1 -P 3306 -u root -e "CREATE DATABASE IF NOT EXISTS ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
npm run prisma:migrate      # prisma migrate dev
npm run prisma:seed         # данные из legacy-дампа + демо-аккаунты
```

Демо-доступы после сида:

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@ams.local` | `Admin12345` |
| Пользователь | `user@ams.local` | `User12345` |

## Особенности схемы

- `orders.order_date` — `VARCHAR(10)` (`YYYY-MM-DD`), `orders.order_time` — `VARCHAR(5)` (`HH:MM`).
  Изначально колонки были `DATE` и `TIME`, но Prisma + MySQL сравнивают их с параметрами
  некорректно при смене часового пояса (запрос `order_date = ?` не находил существующую запись,
  из-за чего не срабатывала проверка занятого слота). Строки ISO однозначны, корректно
  сортируются и фильтруются, поэтому выбран этот вариант.
- `users.email` — уникальный (в legacy-БД уникальности не было).
- `users.id_car` из legacy-дампа не переносится — связь «пользователь → авто» и так есть в `cars.id`.
- В таблицах появились `created_at`/`updated_at`.

## Вариант B. Импорт старого дампа как есть

Если нужно поднять точную копию legacy-БД (для сравнения поведения):

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -e "CREATE DATABASE auto_db_copy CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
Get-Content apps\api\prisma\legacy\auto_db.sql -Raw | mysql -h 127.0.0.1 -P 3306 -u root auto_db_copy
```

Prisma-схема не совпадёт с этой копией по нескольким колонкам
(`users.id_car`, `orders.doc`, отсутствие `created_at`/`updated_at`, уникальность `email`) —
для разработки используйте основную схему (`ams_db` + миграции Prisma).

## Полезные команды

```powershell
npm run prisma:generate   # перегенерировать Prisma Client
npm run prisma:studio     # GUI для данных
npm run prisma:seed       # перезалить сид (данные удаляются и создаются заново)
```

## Запасной вариант: переносимый MySQL

В `C:\Users\cherr\tools\mysql-8.0.44-winx64` лежит распакованная сборка MySQL 8.0.44
(данные — `C:\Users\cherr\tools\mysql-data`, конфиг — `C:\Users\cherr\tools\mysql\my.ini`).
Нужна, только если OSPanel-сервер недоступен: запуск `mysqld.exe --defaults-file=... --console`.
