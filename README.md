# Shazly Portfolio Backend

Node.js + Express + SQLite API for the portfolio website and admin dashboard.

## Local

```sh
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:4000/api`

## Render deploy

- **Root Directory:** leave empty (this repo is the backend only)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:**
  - `JWT_SECRET`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `CLIENT_ORIGINS` (comma-separated frontend/admin URLs)
  - `NODE_VERSION=22`

## Image uploads

Admin can upload project images via `POST /api/admin/uploads`.
Images are stored as BLOBs in SQLite and served from `GET /api/uploads/:id`.
