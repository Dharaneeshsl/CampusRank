# CampusRank

CampusRank is a full-stack Next.js 14 hackathon project for hyperlocal college coding leaderboards.

## Demo

- Landing: `/`
- Register: `/register`
- Dashboard: `/dashboard`
- College leaderboard: `/leaderboard/psg-college-of-technology`
- City leaderboard: `/city/Coimbatore`
- Public profile: `/profile/aaravraman`

The app includes fallback demo data, so pages render even before a database URL or Gemini key is configured.

## Run locally

```bash
npm install
npm run dev
```

For production-style persistence, copy `.env.example` to `.env.local`, set a Neon PostgreSQL `DATABASE_URL`, then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Demo account: `aaravraman@psgtech.ac.in` / `campusrank123`.
