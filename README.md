# Technical Event Management

Monorepo with a **Node/Express** API and a **React + Vite + TypeScript** client.

**Live:** [https://technical-event-management-1-jdkz.onrender.com](https://technical-event-management-1-jdkz.onrender.com)

## Sample logins (seed / demo)

These are example accounts from the seed data—not for production.

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | `admin@example.com` | `admin123` |

## Layout

```
Technical-Event-Management/
├── backend/
│   └── src/
│       ├── config/        # DB pool
│       ├── controllers/   # HTTP handlers
│       ├── routes/        # Express routers
│       ├── middleware/    # auth, roles
│       ├── services/      # domain helpers
│       ├── utils/         # jwt, hash, http
│       ├── app.js         # Express app
│       └── server.js      # entry + env
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/      # API client (`api.ts`)
│       └── context/
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Backend

```bash
cd backend
cp ../.env .env   # optional; root `.env` is loaded by default
npm install
npm run dev       # http://localhost:3001
```

## Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend (see `frontend/vite.config.ts`).

## Database

Apply SQL under `backend/sql/` and the reference `database/schema.sql` as needed for your Postgres instance. `DATABASE_URL` must be set in `.env`.
