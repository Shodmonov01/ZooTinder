# BreedMatch

Мобильное web-приложение для ответственного поиска партнёра для вязки. Репозиторий разделён на два независимых проекта: API и клиент общаются только по HTTP.

```
ZooTinder/
  backend/     NestJS + Prisma
  web/         Vite + React (SPA в телефонной рамке)
  docker-compose.yml
```

Админка в MVP встроена в клиент для ролей `ADMIN` / `MODERATOR`.

## Что уже реализовано (MVP 0.1)

- OTP-вход по телефону, JWT access/refresh, logout со всех устройств
- Профиль владельца и CRUD питомцев, фото, документы
- Discover с hard-фильтрами и ranking score из конфигурации БД
- Like / Pass, взаимный Match, чат, жалобы и блокировки
- Breeding request и события календаря
- Очередь верификации документов и модерация пользователей

Не входит в этот этап: платежи, продажа животных, WebSocket, PostGIS, S3, полноценный отдельный admin-spa.

## Запуск

Нужны Node.js 20+. Docker (Postgres/Redis) опционален: локально API может работать на SQLite.

```bash
cd backend
copy .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

API: `http://localhost:4000/api/v1`  
Health: `http://localhost:4000/api/v1/health`

```bash
cd web
npm install
npm run dev
```

Клиент: `http://localhost:5173`  
Vite проксирует `/api` и `/uploads` на `http://localhost:4000`.

В dev OTP всегда `111111`.

Демо-аккаунты:

| Роль | Телефон | Питомец |
| --- | --- | --- |
| Пользователь | `+998901111111` | Лайло, алабай, ♀ |
| Пользователь | `+998902222222` | Барс, алабай, ♂ |
| Админ | `+998900000000` | — |

Чтобы получить Match, зайдите с двух номеров и поставьте взаимный Like.

## API

Префикс `/api/v1`. Ошибки: `{ code, message, details, request_id }`.

| Метод | Путь | Назначение |
| --- | --- | --- |
| POST | `/auth/otp/request` | Отправить OTP |
| POST | `/auth/otp/verify` | Войти |
| GET | `/me` | Текущий пользователь |
| GET/POST | `/pets` | Мои животные |
| GET | `/discover` | Выдача карточек |
| POST | `/likes` | Like / Pass |
| GET | `/matches` | Match |
| GET/POST | `/chats/:id/messages` | Чат |
| POST | `/breeding-requests` | Запрос на вязку |
| POST | `/reports` `/blocks` | Жалоба / блок |
| GET | `/admin/dashboard` | Админка |

## Дальше по ТЗ

1. Отдельный `admin/` на React
2. Redis для OTP/rate limit, S3 для файлов
3. WebSocket-чат
4. PostGIS вместо haversine
5. Локализация UZ, SMS-провайдер, политика хранения ПДн
