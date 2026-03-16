# PlateOps Frontend (`plateopsCliente`)

Frontend web app for PlateOps, built with React + TypeScript + Vite.

## Features

- Role-based screens for **Waiter**, **Kitchen**, and **Cashier**.
- Real-time refresh via Socket.IO.
- Order creation by table with category filters.
- Kitchen order board with status transitions.
- Cashier flow with table billing and payment methods.
- New **Insights Dashboard** at `/dashboard/insights` with:
  - Compact KPI cards (reduced spacing/typography)
  - KPIs (orders, active, paid, revenue, prep time)
  - Hourly order load chart
  - Peak hour indicator
  - Status distribution
  - Top selling items
  - Waiter leaderboard
  - Category mix bars
  - Most active tables
  - Auto-refresh toggle (30s), manual refresh and CSV export
- New **Kitchen productivity upgrades**:
  - SLA-style overdue highlighting on pending/in-progress cards
  - "Somente atrasados" filter toggle
  - Fast table search on kitchen board
  - Queue ordering by oldest order first
  - Bulk actions: "Iniciar todos" and "Marcar todos prontos"
  - Optional sound alert when overdue count increases
- New **Payment upgrades**:
  - Tip presets (0/5/10/15%)
  - Custom tip value input
  - Split-bill helper (1x to 8x) with per-person amount
  - Stripe intent synced with final payable total
- New **smart filters** on waiter and cashier dashboards:
  - table search
  - status chips
  - operational summary cards

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Environment

Copy `.env.example` to `.env` and configure:

- `VITE_API_URL` (or `VITE_SOCKET_URL`) to your backend URL
- `VITE_STRIPE_PUBLIC_KEY` for online payment flow

Example:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Run locally

```bash
npm install
npm run dev
```

App default URL: `http://localhost:5173`
