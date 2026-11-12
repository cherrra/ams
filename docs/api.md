# API (v1)

Базовый префикс: `/api/v1`. Swagger: `http://localhost:3005/docs`.
Авторизация: `Authorization: Bearer <accessToken>`.
Ошибки — стандартные ответы NestJS: `{ statusCode, message, error }`.

## Health

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/health` | все | Статус сервиса, uptime, время сервера |

## Auth

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | все | Регистрация: `username`, `email`, `password` (≥ 8) |
| POST | `/auth/login` | все | Вход: `email`, `password` → `accessToken`, `refreshToken`, `user` |
| POST | `/auth/refresh` | все | Обновление пары токенов по `refreshToken` |
| GET | `/auth/me` | авторизован | Текущий пользователь |
| PATCH | `/auth/me` | авторизован | Изменение `username`, `email`, `birthDate`, `phoneNumber` |
| DELETE | `/auth/me` | авторизован | Удаление своего аккаунта |

`user`: `{ id, username, email, birthDate, phoneNumber, linkImg, isAdmin }`.

## Категории

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/categories` | все | Категории + количество услуг |
| GET | `/categories/:id` | все | Одна категория |
| POST | `/categories` | админ | `{ categoryName }` |
| PATCH | `/categories/:id` | админ | `{ categoryName }` |
| DELETE | `/categories/:id` | админ | Удаляет категорию вместе с её услугами (CASCADE) |

## Услуги

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/services?categoryId=&search=` | все | Список услуг с названием категории |
| GET | `/services/:id` | все | Одна услуга |
| POST | `/services` | админ | `{ serviceName, description, price, categoryId }` |
| PATCH | `/services/:id` | админ | Частичное обновление |
| DELETE | `/services/:id` | админ | Удаление |

`description` обязательное (в legacy-БД `NOT NULL`), допускается пустая строка.

## Автомобили

Все методы требуют авторизации и работают только со своими авто.

| Метод | Путь | Описание |
|---|---|---|
| GET | `/cars/brands` | Марки и модели для выбора (`{ id, brandName, models[] }`) |
| GET | `/cars` | Мои автомобили |
| GET | `/cars/:id` | Автомобиль по id |
| POST | `/cars` | `{ brandName, modelName, year, mileage, vinCode?, licensePlate? }` |
| PATCH | `/cars/:id` | Частичное обновление (марка/модель создаются при необходимости) |
| DELETE | `/cars/:id` | Удаление |

## Заказы

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/orders` | авторизован | Мои заказы; фильтры `status`, `from`, `to` |
| GET | `/orders/:id` | автор / админ | Детали заказа |
| GET | `/orders/booked-slots?date=YYYY-MM-DD` | авторизован | `{ date, booked: ["10:30"], total, free }` |
| POST | `/orders` | авторизован | `{ carId, date, time, serviceIds[], comment? }` |
| PATCH | `/orders/:id/cancel` | автор | Отмена своего заказа |
| GET | `/orders/admin?status=&date=&from=&to=&search=` | админ | Все заказы, поиск по имени/email/номеру |
| PATCH | `/orders/:id/status` | админ | `{ status }`, проверяются допустимые переходы |
| DELETE | `/orders/:id` | автор (created/canceled) / админ | Удаление заказа |

Правила записи:

- слоты 09:00–20:00 с шагом 30 минут (`@ams/shared`);
- нельзя записаться на прошедшее время;
- при занятом слоте — `409 Conflict`;
- заказ и его услуги создаются в одной транзакции, `totalPrice` считается на сервере.

Статусы: `created → accepted → in_progress → completed → finished`,
из `created/accepted/in_progress` возможен `canceled`.

## Пользователи (админ)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/users?search=` | Список пользователей с авто и количеством заказов |
| GET | `/users/:id` | Пользователь по id |
| DELETE | `/users/:id` | Удаление (нельзя удалить себя и другого админа) |

## Загрузки

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/uploads/avatar` | авторизован | `multipart/form-data`, поле `file`; аватар текущего пользователя |
| POST | `/uploads/cars/:carId/photo` | владелец | Фото автомобиля |

Допустимые типы: JPEG, PNG, WebP, HEIC/HEIF; лимит — `MAX_UPLOAD_SIZE_MB` (по умолчанию 5 МБ).
Файлы сохраняются в `uploads/` и отдаются по `http://localhost:3005/uploads/<путь>`;
в БД хранится относительный путь от корня API (`uploads/avatars/...`, `uploads/cars/...`).
