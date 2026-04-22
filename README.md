# Flexpay – Buy Airtime Instantly With Crypto

Flexpay is an onchain tool that lets users **buy airtime instantly using crypto**, without off-ramping or switching apps.
Built on **Base**, Flexpay enables fast, affordable, and reliable airtime top-ups directly from a crypto wallet.

## What Is Flexpay?

Flexpay makes crypto **practical**.

No banks.
No mobile money.
No waiting.

Just:

1. Connect wallet
2. Select provider
3. Enter phone number
4. Pay with crypto
5. Receive airtime instantly

A flat fee of **$0.05** applies per transaction, with **automatic refunds** on any failed top-ups.

## Tagline

- spend your USDC simply
- a simple way to spend your USDC
- what if you could simply spend your crypto every day instead of off-ramping first
- we enable people spend their crypto simply

## 30-second Elevator Pitch

- We are Flexpay and we allow users to conveniently top up airtime using USDC.

## Key Features

- One-step airtime purchase
- $0.05 flat fee (no hidden charges)
- Instant airtime delivery
- Automatic refunds for failed transactions
- Non-custodial (user controls their wallet)
- Seamless integration via link
- Community-driven adoption
- Powered by Base for fast, low-fee transactions

## Architecture

See `architecture.md` for the system design.

## Running locally

### Quickstart (clone → dev)

```bash
git clone <YOUR_REPO_URL>
cd FlexPay
npm install
npm run dev
```

### Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node)

### Install dependencies

From the repository root:

```bash
npm install
```

### Run (recommended: start everything)

This starts **frontend** + **backend** together:

```bash
npm run dev
```

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:4000` (override with `BACKEND_PORT`)

### Environment variables

Flexpay supports a “demo” mode with minimal setup, and a full “production” mode.

- **Demo mode (no env required)**: you can run `npm run dev` and browse the UI; orders are stored in-memory and airtime send will return a clear “demo mode” error until the full stack is configured.
- **Full stack (Postgres + Africa’s Talking + refunds)**: create `frontend/.env.local` (and optionally `backend/.env`) and set:
  - `DATABASE_URL` (Postgres; enables persistent orders/prices via Prisma)
  - `NEXT_AFRICASTALKING_USERNAME`
  - `NEXT_AFRICASTALKING_API_KEY`
  - `NEXT_AFRICASTALKING_URL`
  - `NEXT_PUBLIC_AIRTIME_CONTRACT_ADDRESS`
  - `TREASURY_PRIVATE_KEY` (server-side; required to issue onchain refunds)
  - `NEXT_PUBLIC_ONCHAINKIT_API_KEY` (optional; wallet UI)
  - `SERVICE_FEE` (optional; defaults to `0.05`)
  - `CORS_ORIGIN` (optional for backend; comma-separated allowlist, defaults to allow all)

Note: the backend loads env in this order: `frontend/.env.local`, `frontend/.env`, then `backend/.env`.
