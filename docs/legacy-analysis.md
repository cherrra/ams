# Legacy-анализ (Android/Java + Express/MySQL)

Дата: 2026-10-31
Источники:
- https://github.com/cherrra/Application.git — Android/Java, последний коммит `fbdcb91 upd: time slots` (20.07.2025)
- https://github.com/cherrra/server_ams_app.git — Express/MySQL, последний коммит `784e617 upd` (27.04.2025)
- дамп БД `auto_db.sql` (MySQL 8.0.30, phpMyAdmin, 31.10.2026)

## 1. Стек

### Mobile
- Java 8, minSdk 24, targetSdk 34, `com.example.application`
- Activity + ViewModel + Repository, OkHttp/Gson, Glide, EncryptedSharedPreferences
- UI: XML + программное построение View
- Base URL: `https://automser.store/api/`
- Карта: WebView (Яндекс.Карты)
- Уведомления: polling `/api/orders` каждые 30 с + локальные Android-уведомления

### Server
- Express 4, mysql2 (callbacks), JWT (access 15m / refresh 30d), bcryptjs, multer → `uploads/`
- Порт 5000, статика `/uploads`
- Конфиг БД захардкожен: `root` / пустой пароль / `auto_db`

## 2. Экранная карта

### Пользователь
| Экран | Функционал |
|---|---|
| MainActivity | вход / регистрация |
| LoginActivity | логин; админ определяется по `email.contains("@admin-mail")` |
| RegisterActivity | регистрация + политика |
| HomeActivity | карта сервиса, категории услуг, нижняя навигация |
| ServicesActivity | услуги категории, добавление в локальную корзину |
| AddOrderActivity | авто, дата, слоты 09:00–20:00 (шаг 30 мин), комментарий, цена |
| OrdersActivity | активные / история, отмена, легенда статусов |
| NotificationActivity | лента статусов + системные уведомления |
| GarageActivity / AddCarActivity / EditCarActivity / DetailsCarActivity | CRUD авто и фото |
| AccountActivity / DetailsActivity / EditActivity | профиль, аватар, редактирование, удаление аккаунта |

### Администратор
| Экран | Функционал |
|---|---|
| HomeAdminActivity | категории CRUD, переходы в разделы |
| ServicesAdminActivity | услуги CRUD |
| OrdersAdminActivity | все/завершённые заказы, поиск, смена статуса |
| UsersAdminActivity | пользователи + авто, поиск, удаление |
| NotificationAdminActivity | polling новых заказов + уведомления |

## 3. REST API legacy

Защита: `Authorization: Bearer <accessToken>`.

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | username, email (`.ru|.com`), password ≥ 8 |
| POST | `/api/auth/login` | email, password → access+refresh |
| GET | `/api/auth/user` | профиль |
| PUT | `/api/auth/user` | username, email, birth_date, phone_number |
| DELETE | `/api/auth/delete` | удаление своего аккаунта |
| GET | `/api/users` | список пользователей с авто (admin) |
| DELETE | `/api/users/:id` | удаление пользователя (admin) |
| GET/POST | `/api/cars` | список / добавление авто |
| PUT/DELETE | `/api/cars/:id` | изменение / удаление авто |
| GET | `/api/categories` | категории |
| GET | `/api/categories/admin` | категории (admin) |
| POST/PUT/DELETE | `/api/categories[/:id]` | CRUD (admin) |
| GET | `/api/services?id_category=` | услуги категории |
| POST/PUT/DELETE | `/api/services[/:id]` | CRUD (admin) |
| GET | `/api/orders` | заказы пользователя |
| GET | `/api/orders/admin` | все заказы (admin) |
| POST | `/api/orders` | создание заказа |
| PUT | `/api/orders/admin/:id` | смена статуса (admin) |
| DELETE | `/api/orders/:id` | удаление заказа |
| POST | `/api/upload` | аватар |
| POST | `/api/cars/:id/upload` | фото авто |

### Отсутствующие, но используемые клиентом ручки
- `POST /api/auth/refresh` — не зарегистрирован → refresh не работает
- `GET /api/orders/booked-slots?date=` — не реализован → слоты не проверяются
- `GET /api/users/:id` — не реализован → 404

## 4. Фактическая схема БД (по дампу)

```
brand(id_brand PK AI, brand_name VARCHAR(255))
model(id_model PK AI, model_name VARCHAR(255), id_brand FK→brand ON DELETE CASCADE)

users(id PK AI, username VARCHAR(255), email VARCHAR(255) — НЕ unique,
      password VARCHAR(255) bcrypt, birth_date DATE NULL, phone_number VARCHAR(15) NULL,
      link_img VARCHAR(255) NULL, is_admin TINYINT(1) DEFAULT 0,
      id_car INT NULL FK→cars(id_car) — legacy, не используется, везде NULL)

cars(id_car PK AI, year INT NOT NULL, mileage INT NOT NULL, id FK→users ON DELETE CASCADE,
     vin_code VARCHAR(20) NULL, license_plate VARCHAR(15) NULL,
     id_model FK→model ON DELETE CASCADE, link_img VARCHAR(255) NULL)

categories(id_category PK AI, category_name VARCHAR(255))
services(id_service PK AI, service_name VARCHAR(255), description VARCHAR(555) NOT NULL,
         price DECIMAL(10,2), id_category FK→categories ON DELETE CASCADE)

orders(id_order PK AI, id FK→users ON DELETE CASCADE, id_car FK→cars ON DELETE CASCADE,
       order_date DATE, order_time TIME, total_price DECIMAL(10,2) NULL,
       status ENUM('created','accepted','in_progress','completed','canceled','finished') DEFAULT 'created',
       comment TEXT NULL, doc VARCHAR(255) NULL)

order_services(id_order_service PK AI, id_order FK→orders ON DELETE CASCADE,
               id_service FK→services ON DELETE CASCADE, price DECIMAL(10,2) NULL)
```

Особенности данных:
- В `users.email` нет уникального индекса — в новой схеме добавляем.
- `orders.doc` хранит путь к PDF (акт работ), в коде старого сервера не используется.
- Статусы в БД: `created`, `accepted`, `in_progress`, `completed`, `canceled`, `finished`.
- Время заказа хранится как `TIME` (время суток), дата — отдельным `DATE`.
- В данных есть записи вне рабочих часов (05:25) и мусорные бренды/модели (`xxzzz`, `hdjsj`) — следы тестирования.

## 5. Проблемы legacy

1. Refresh-токен не работает (нет роута) при access 15 минут.
2. Слоты не проверяются, нет `booked-slots`, нет 409 при конфликте.
3. Нет `GET /api/users/:id`.
4. Админ — по подстроке email на клиенте; `is_admin` не возвращается в `/auth/user`.
5. Нет валидации DTO, централизованных ошибок, транзакций.
6. Заказ и `order_services` пишутся раздельно → возможен «полузаказ».
7. `PUT /api/cars/:id` сформирован как `/api//5`.
8. Модель `Order` на клиенте ждёт `car_model`/`car_brand`, сервер отдаёт `car` — рассинхрон.
9. Загрузки: локальный диск, без лимитов и проверки типа, URL захардкожен.
10. Секреты только в env, `.env` в репозитории нет; конфиг MySQL захардкожен.
11. Дублирование сетевого слоя (OkHttp напрямую и через Repository).
12. Нет смены пароля, подтверждения email, восстановления доступа.

## 6. Что меняем в новой версии

| Legacy | Новая реализация |
|---|---|
| Express + callbacks | NestJS 12 + Prisma + MySQL |
| `/api/...` | `/api/v1/...` + Swagger |
| status VARCHAR/ENUM вручную | `OrderStatus` enum + state machine в `@ams/shared` |
| слоты не проверяются | `GET /orders/booked-slots`, проверка конфликта, 409, транзакция |
| admin по email | роль `isAdmin` на сервере + RolesGuard |
| локальный диск | локально сейчас, S3-совместимое хранилище позже |
| polling в каждом экране | единый слой данных (TanStack Query) + локальные уведомления |
| разрозненные модели | единые DTO/типы в `packages/shared` |
