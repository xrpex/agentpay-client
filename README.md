# agentpay-client

Official npm client for [AgentPay](https://agentpay-frontend-theta.vercel.app) — an open-source marketplace for pay-per-call AI tools on XRP Ledger.

## 🔗 Links

- **Marketplace**: https://agentpay-frontend-theta.vercel.app
- **About**: https://agentpay-frontend-theta.vercel.app/about
- **List Your Tool**: https://agentpay-frontend-theta.vercel.app/list-tool
- **Backend**: Private (business logic, database)
- **Contact**: officialagentpay@gmail.com

## 📦 Install

npm install agentpay-client

## 💳 Two Ways to Pay

### Option 1: Auto-Payment (Simple)

Pass your wallet seed — the client handles everything:

```javascript
const result = await agentpay.call('web-scraper', { url: '...' }, {
  walletSeed: process.env.XRP_SEED  // Never hardcode!
});
