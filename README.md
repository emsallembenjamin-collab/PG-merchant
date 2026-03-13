# GoldPay Merchant Portal

GoldPay Merchant is the merchant-facing workspace for the payment gateway service. It is built with Next.js, React, TypeScript, and Tailwind CSS, and uses the `GoldPay` backend API authenticated with merchant API keys.

## Purpose

Use this app to:

- review your transactions
- track provider activity
- monitor notifications
- inspect payment history

## Local Development

```bash
npm install
npm run dev -- --port 3001
```

Default local URL:

- `http://localhost:3001`

Required backend:

- `http://localhost:4000`

## Demo Merchant Login

For local testing, use the current demo API key configured in the local environment:

- API key: check `Merchant/.env`

## Branding

The merchant portal uses the GoldPay brand system and merchant-specific shell copy.
"# PG-merchant" 
