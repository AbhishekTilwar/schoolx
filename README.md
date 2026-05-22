# SchoolX — School Management System (Local MVP)

Basic school ERP with **Flutter** (Teacher + Student apps), **React** admin, **Node.js** API, and **PostgreSQL**.

## Stack

| Component | Tech |
|-----------|------|
| API | Node.js + Express + Prisma |
| Database | PostgreSQL |
| Admin | React + Vite |
| Mobile | Flutter (2 apps) |
| Real-time | REST (+ WebSocket for chat) |

## Prerequisites

- Node.js 20+
- PostgreSQL (Docker **or** local install)
- Flutter 3.x (for mobile apps)

## Quick start

### 1. Database

**Option A — Docker (recommended)**

```bash
docker compose up -d postgres
```

Uses port **5433** (`backend/.env` is preconfigured).

**Option B — Local PostgreSQL**

```bash
createdb schoolx
```

`backend/.env` (password `@` must be URL-encoded as `%40`):

```
DATABASE_URL="postgresql://abhishektilwar:Test%40123@localhost:5432/schoolx?schema=public"
```

### 2. Setup & seed

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

### 3. Run API + Admin

```bash
./scripts/dev.sh
```

- API: http://localhost:3000  
- Admin: http://localhost:5173  

### 4. Flutter apps (emulator — automated)

```bash
chmod +x scripts/*.sh
./scripts/run-emulators.sh
```

This will:
- Ensure the API is running
- Boot the Android emulator (`Medium_Phone_API_36.1` by default)
- Install **Teacher** and **Student** apps on the same emulator

```bash
# Stop Flutter processes
./scripts/stop-emulators.sh

# Or via npm
npm run emulators
npm run emulators:stop
```

### 4b. Flutter apps (manual)

```bash
cd app_teacher && flutter run
cd app_student && flutter run
```

**API URL on device/emulator**

- iOS Simulator / macOS: `http://127.0.0.1:3000` (default in code)
- Android emulator: `http://10.0.2.2:3000` (default in code)

## Data model

**All app and admin screens load data from the API → PostgreSQL.** There is no hardcoded dummy content in the UI.

Initial data is inserted **only into the database** via seed:

```bash
cd backend && npm run seed
```

After seeding (optional demo org), example accounts:

| Role | Email | Password | Org slug |
|------|-------|----------|----------|
| Admin | admin@greenwood.edu | password123 | greenwood |
| Teacher | teacher@greenwood.edu | password123 | greenwood |
| Student | student@greenwood.edu | password123 | greenwood |

To start empty, skip `npm run seed` and add organizations/users through your own SQL or future admin forms.

## Prisma migrations

Schema lives in `backend/prisma/schema.prisma`. Versioned SQL is in `backend/prisma/migrations/`.

| Command | Purpose |
|---------|---------|
| `cd backend && npm run db:migrate` | Dev: apply schema changes (`prisma migrate dev`) |
| `npm run db:migrate:deploy` | Prod/CI: apply pending migrations only |
| `npm run db:migrate:status` | Check migration state |
| `npm run db:migrate:reset` | **Dev only** — drop DB, re-run migrations + seed |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:studio` | Open Prisma Studio |

**After editing `schema.prisma`:**

```bash
cd backend
npm run db:migrate -- --name add_my_feature
```

**Fresh machine / CI:**

```bash
cd backend
npm run db:migrate:deploy
npm run seed   # optional
```

Initial migration `20260521201951_init` is baselined to your existing database (no data loss).

## Features

- Unified **content** (homework, notices, announcements, exams) via `type` + `tags`
- Attendance marking (teacher) / history (student)
- Timetable, fees list, leave, bus tracking (simulated GPS)
- Class chat (REST; WebSocket available at `ws://localhost:3000/ws?threadId=...`)

## Project structure

```
schoolx/
├── backend/          # Express API
├── admin-web/        # React admin panel
├── app_teacher/      # Flutter teacher app
├── app_student/      # Flutter student app
├── docker-compose.yml
└── scripts/
```

## API examples

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@greenwood.edu","password":"password123","orgSlug":"greenwood"}'

# Content feed (with token)
curl http://localhost:3000/api/v1/content -H "Authorization: Bearer TOKEN"
```
