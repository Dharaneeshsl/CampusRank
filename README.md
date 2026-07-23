# CampusRank

**Hyperlocal college coding leaderboards — production-ready, secure, and built for real campuses.**

CampusRank ranks students inside their own college by pulling verified scores from LeetCode, Codeforces, and HackerRank. Every account is tied to an institution email, verified with OTP, and protected with bcrypt + JWT sessions.

---

## What it does

| Feature | Description |
|--------|-------------|
| **College leaderboards** | Rank students within their institution |
| **City leaderboards** | Compare colleges in the same city |
| **Student dashboard** | Total score, platform breakdown, score history |
| **AI insights** | Optional Gemini-powered performance summaries |
| **Admin panel** | Provision new college email domains |
| **Secure auth** | Email OTP on signup **and** sign-in |

---

## Security (production-grade)

- **No mock data** — all data comes from PostgreSQL
- **No credentials in URLs** — email/OTP state stays in sessionStorage; passwords only sent via POST
- **Passwords** — bcrypt (cost 12), always masked (`type="password"`)
- **OTP codes** — SHA-256 hashed at rest, 10-minute expiry
- **Sign-in flow** — password check → OTP email → short-lived server ticket → session
- **Rate limiting** — register, verify, login, and resend endpoints
- **Route protection** — Next.js middleware + server-side session checks
- **Admin access** — email allowlist (`ADMIN_EMAILS`)

---

## Tech stack

- **Next.js 14** (App Router)
- **NextAuth v5** (JWT credentials)
- **PostgreSQL** + **Prisma**
- **Resend** (OTP email delivery)
- **Tailwind CSS**
- **Google Gemini** (optional AI)
- **Inngest** (background sync jobs)

---

## Quick start

### 1. Environment

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-random-base64-secret"
AUTH_SECRET="your-random-base64-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAILS="24z218@psgtech.ac.in"
RESEND_API_KEY="re_..."
EMAIL_FROM="CampusRank <your-verified@domain.com>"
```

Generate a secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Use the same value for `NEXTAUTH_SECRET` and `AUTH_SECRET`.

### 2. Install & run

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. First admin setup

1. Seed creates **PSG College of Technology** (`psgtech.ac.in`)
2. Register with **`24z218@psgtech.ac.in`**
3. Verify the OTP from your inbox
4. Sign in (password + OTP)
5. Open **Admin** → add other college domains
6. Students on provisioned domains can register and sign in

---

## Auth flow

```
Register → OTP email → Verify → Login (password + OTP) → Dashboard
                ↑                              ↑
         Resend available              Resend available
```

**Routes**

| Path | Access |
|------|--------|
| `/register` | Public |
| `/verify-email` | Public |
| `/login` | Public |
| `/onboarding` | Authenticated |
| `/dashboard` | Authenticated |
| `/settings` | Authenticated |
| `/leaderboard/[slug]` | Authenticated |
| `/profile/[username]` | Authenticated |
| `/admin` | Admin only |

---

## Production deploy

```bash
npm run build
npm start
```

Set production env vars on your host (Vercel, Railway, etc.):

- `NEXTAUTH_URL` → your live domain
- `DATABASE_URL` → production PostgreSQL
- `RESEND_API_KEY` + verified `EMAIL_FROM`
- Strong `NEXTAUTH_SECRET` / `AUTH_SECRET`

Health check: `GET /api/health`

---

## Verification checklist

| Check | Status |
|-------|--------|
| TypeScript compile | Pass |
| Production build (`npm run build`) | Pass |
| Database schema sync | Pass |
| College seed (PSG) | Pass |
| Mock/demo data removed | Pass |
| Credentials removed from URLs | Pass |
| Session secrets generated | Pass |

---

## Project structure

```
app/
  (auth)/          Login, register, verify-email
  (main)/          Dashboard, leaderboard, admin, settings
  api/auth/        Register, OTP, verify, NextAuth
  api/admin/       College provisioning
  api/sync/        Platform score sync
lib/
  auth.ts          NextAuth config
  otp.ts           OTP generation, hashing, email
  admin.ts         Admin allowlist
  data.ts          Prisma data layer
prisma/
  schema.prisma    Database models
  seed.ts          PSG college bootstrap
```

---

## Built by

CampusRank — turning campus coding talent into measurable, ranked, AI-enhanced leaderboards.

**Stack:** Next.js · PostgreSQL · NextAuth · Resend · Tailwind · Gemini

---

*Ready for demo, deployment, and real campus onboarding.*
