# Clinic Calendar — Setup Guide

## 1. Create a Neon database

1. Sign up at https://neon.tech (free tier)
2. Create a new project → copy the **Connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`)

## 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

**`DATABASE_URL`** — paste your Neon connection string.

**`ADMIN_PIN_HASH`** — generate a bcrypt hash of your chosen PIN:
```bash
node -e "const b=require('bcryptjs'); b.hash('1234',10).then(console.log)"
```
Paste the output (starts with `$2b$...`).

**`CRON_SECRET`** — any random string, e.g. `openssl rand -hex 20`

## 3. Run migrations and seed

```bash
npm run db:push     # push schema to Neon
npm run db:seed     # create the 4 rooms
```

## 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

## 5. Deploy to Vercel

```bash
npx vercel
```

Add the three env vars in Vercel → Project → Settings → Environment Variables.

The cron job (`vercel.json`) will sync subscriptions hourly automatically.

## Admin access

Click **Admin** in the top-right and enter your PIN. Admin mode:
- Create / edit / delete bookings
- Bulk add bookings across a date range
- Manage calendar subscriptions (Google Calendar iCal, RSS)
- Manage cleaner schedule (via Dashboard)

Admin state is stored in `sessionStorage` — it clears when you close the browser tab.
