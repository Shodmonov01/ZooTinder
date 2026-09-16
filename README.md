# BreedMatch

Мобильное web-приложение для ответственного поиска партнёра для вязки. Репозиторий: API и React-клиент.

```
ZooTinder/
  backend/     NestJS + Prisma
  frontend/    Vite + React
  docker-compose.yml
```

## Запуск

Нужны Node.js 20+. PostgreSQL — через Docker, когда демон запущен:

```bash
docker compose up -d postgres
```

Локально без Docker API работает на SQLite (`DATABASE_URL="file:./dev.db"`). `.env.example` содержит URL Postgres.

```bash
cd backend
copy .env.example .env
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

API: `http://localhost:4000/api/v1`

```bash
cd frontend
npm install
npm run dev
```

Клиент: `http://localhost:5173`  
Vite проксирует `/api` на `http://localhost:4000`.

В dev OTP всегда `111111`.

Демо-аккаунты:

| Роль | Телефон | Питомец |
| --- | --- | --- |
| Пользователь | `+998901111111` | Лайло |
| Пользователь | `+998902222222` | Барс |
| Админ | `+998900000000` | — |

## Что умеет MVP

- OTP, профиль владельца, питомцы с фото и публикацией
- Discover с фильтрами, свайпом и кнопками Like/Pass
- Match, чат с опросом, жалобы и блокировки
- Документы, очередь модерации, запрос на вязку и история
- Медиа только по JWT, CORS allowlist, rate limit, SMS-заглушка в production
