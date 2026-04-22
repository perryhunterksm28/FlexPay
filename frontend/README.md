

## Getting Started

Install dependencies:

```bash
npm install
```

### Run with no `.env` (UI + demo APIs)

If you do not set `DATABASE_URL` yet, you can still run the app:

```bash
npm run dev
```

- **Landing** (`/`) and **platform** (`/platform`) load normally.
- **`/api/prices`** uses Coinbase (or built-in fallbacks) and does not need a database.
- **`/api/orders`** stores demo orders **in memory** only (lost on server restart).
- **`/api/airtime/send`** returns a clear **demo** error until you configure Postgres + Africa’s Talking.

### Production / full stack

Copy `.env.example` to `.env.local` and fill in values (see list below). Apply the database schema:

```bash
cd frontend
npx prisma migrate deploy
```

```bash
copy .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Database (Prisma):

- `DATABASE_URL` — PostgreSQL connection string (e.g. from Supabase, Neon, or self-hosted Postgres)

Africa’s Talking:

- `NEXT_AFRICASTALKING_USERNAME`
- `NEXT_AFRICASTALKING_API_KEY`
- `NEXT_AFRICASTALKING_URL`

OnchainKit (optional for wallet UI):

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

Contracts:

- `NEXT_PUBLIC_AIRTIME_CONTRACT_ADDRESS`
- `TREASURY_PRIVATE_KEY` (server only; refunds)

## API Routes

- `/api/orders` - Create and manage orders
- `/api/airtime/send` - Send airtime to phone numbers
- `/api/airtime/status` - Check airtime transaction status
- `/api/prices` - Get current airtime prices
