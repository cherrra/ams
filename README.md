
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

## Документация

- `docs/legacy-analysis.md` — разбор старого Android/Express-проекта
- `docs/database.md` — миграции, сид, работа с MySQL
- `docs/api.md` — эндпоинты нового API
- `docs/acceptance.md` — чек-лист приёмки (паритет экранов и сценарии)
- `docs/deployment.md` — домен, HTTPS, бэкапы, логи, сборка приложения
- `docs/roadmap.md` — план миграции по этапам
