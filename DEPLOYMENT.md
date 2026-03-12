# Deployment Guide (Vercel + Render)

This repo is a monorepo:

- `frontend` (Vite React app) -> deploy on Vercel
- `backend` (Express API) -> deploy on Render

## 1) Backend (Render)

Create a new **Web Service** from this repo.

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

You can also use the included `render.yaml` blueprint.

Set these Render environment variables:

- `NODE_ENV=production`
- `PORT=10000` (or let Render provide PORT automatically)
- `MONGODB_URI` (use `campus-placement-v2` DB)
- `FRONTEND_URL` (your Vercel production URL)
- `SUPERADMIN_URL` (same Vercel URL)
- `JWT_SECRET`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_LEGACY_JWT_AUDIENCE`
- `CLERK_NEW_JWT_TEMPLATE_NAME`
- `CLERK_NEW_JWT_AUDIENCE`
- `CLERK_JWT_ISSUER`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `WEB3FORMS_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_MENTOR_CHAT_ID`

After deploy, note backend URL:

- `https://<your-render-service>.onrender.com`

## 2) Frontend (Vercel)

Create a new Vercel project from this repo.

- Framework: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

`frontend/vercel.json` is included to support SPA routing refresh.

Set these Vercel environment variables:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_OPENROUTER_API_KEY`
- `VITE_OPENROUTER_BASE_URL`
- `VITE_OPENROUTER_MODEL`
- `VITE_GEMINI_API_KEY`
- `VITE_WEB3FORMS_KEY`
- `VITE_GOOGLE_CALENDAR_API_KEY`

## 3) Post-deploy checks

1. Backend health:
   - `https://<render-url>/health`
2. Frontend loads without console CORS errors.
3. Login works for admin/student.
4. Student directory loads and shows `campus-placement-v2` data.

## 4) Important

- Do not commit real `.env` files.
- Rotate secrets that were previously exposed.
