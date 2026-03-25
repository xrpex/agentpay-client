# agentpay-client

> One-line SDK for AI agents to discover and call [AgentPay](https://agentpay-frontend-theta.vercel.app) tools with automatic XRPL x402 payments.

```bash
npm install agentpay-client
```

---

## What is AgentPay?

AgentPay is an open-source AI tool marketplace where any agent can call tools and pay per request using **XRP on the XRPL** via the [x402 protocol](https://xrpl-x402.t54.ai/docs) — no API keys, no subscriptions, no accounts.

---

## Quickstart

```typescript
import { createAgent } from "agentpay-client";

// One line — creates wallet, connects, ready to call tools
const agent = await createAgent(process.env.XRPL_SEED, {
  network: "xrpl:0", // testnet
  autoFund: true,     // auto-fund from faucet (testnet only)
});

// Discover available tools
await agent.printTools();

// Call any tool — payment handled automatically
const price = await agent.getPrice();
console.log("XRP/USD:", price.data.XRP.usd);

const scrape = await agent.scrape("https://example.com");
console.log("Content:", scrape.data.content.slice(0, 200));
```

---

## Installation

```bash
npm install agentpay-client
# or
yarn add agentpay-client
# or
pnpm add agentpay-client
```

Requires **Node.js 18+**.

---

## Configuration

```typescript
import { AgentPayClient } from "agentpay-client";

const agent = new AgentPayClient({
  seed:            "sEdYourXRPLWalletSeedHere",  // required
  network:         "xrpl:0",    // "xrpl:0" testnet | "xrpl:1" mainnet
  baseUrl:         "https://agentpay-backend-production.up.railway.app",
  autoFund:        false,       // auto-fund from faucet (testnet only)
  maxDropsPerCall: 100_000,     // safety limit per call
  timeout:         30_000,      // request timeout ms
});

await agent.init();
```

---

## API Reference

### Tool Discovery

```typescript
// List all tools
const tools = await agent.listTools();

// Get tool by ID
const scraper = await agent.getTool("web-scraper");

// Filter by category
const financeTools = await agent.getToolsByCategory("Finance");

// Print formatted table
await agent.printTools();
```

### Built-in Tools

#### 🌐 Web Scraper
```typescript
const result = await agent.scrape("https://example.com");
// result.data: { url, chars, content }
```

#### 📈 XRP Price Oracle
```typescript
const result = await agent.getPrice();
// result.data: { XRP: { usd, btc, eur }, timestamp }
```

#### 🤖 AI Summarizer
```typescript
const result = await agent.summarize("Long text to summarize...");
// result.data: { summary, method, chars_in }
```

#### 💹 XRPL DeFi Feed
```typescript
const result = await agent.getDefiFeed();
// result.data: { pools: [{ asset1, asset2, trading_fee }], timestamp }
```

#### ⚡ Code Executor
```typescript
const result = await agent.execute('print("Hello from AgentPay!")');
// result.data: { stdout, stderr, code }
```

### Low-level Call

Call any tool by path with full control:

```typescript
const result = await agent.call("/tools/web-scraper?url=https://example.com");

// POST call
const result = await agent.call("/tools/ai-summarizer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "..." }),
});

// CallResult shape:
// { ok, status, data, paid, drops, txHash, tool, duration }
```

### Utilities

```typescript
// Get wallet address
const address = await agent.getAddress();

// Health check
const health = await agent.health();
// { ok: true, latency: 42, time: "2026-03-23T..." }
```

---

## Payment Flow

```
Agent → GET /tools/web-scraper
      ← 402 Payment Required + XRPL wallet + drops amount
      → Signs XRPL Payment tx, retries with X-PAYMENT header
      ↔ t54 Labs facilitator verifies + settles on XRPL ledger
      ← 200 OK + tool response
```

The SDK handles the entire flow automatically. You never touch HTTP headers or XRPL transactions directly.

---

## Framework Integrations

### LangChain

```typescript
import { createAgent } from "agentpay-client";
import { Tool } from "@langchain/core/tools";

const ap = await createAgent(process.env.XRPL_SEED);

const tools = [
  new Tool({
    name: "scrape_web",
    description: "Scrape text from any URL. Input: URL string.",
    func: async (url) => (await ap.scrape(url)).data.content.slice(0, 3000),
  }),
  new Tool({
    name: "get_xrp_price",
    description: "Get live XRP price.",
    func: async () => {
      const r = await ap.getPrice();
      return `XRP/USD: $${r.data.XRP.usd}`;
    },
  }),
];

// Use with any LangChain agent executor
```

### AutoGen / CrewAI

```typescript
import { createAgent } from "agentpay-client";

const ap = await createAgent(process.env.XRPL_SEED);

// Define as tool functions for your agent framework
export const agentPayTools = {
  scrapeWeb:   (url: string) => ap.scrape(url).then(r => r.data.content),
  getXrpPrice: ()            => ap.getPrice().then(r => r.data.XRP.usd),
  summarize:   (text: string) => ap.summarize(text).then(r => r.data.summary),
  runPython:   (code: string) => ap.execute(code).then(r => r.data.stdout),
};
```

### Claude Tool Use

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { createAgent } from "agentpay-client";

const ap      = await createAgent(process.env.XRPL_SEED);
const claude  = new Anthropic();

// Define AgentPay tools for Claude
const tools = [
  {
    name: "get_xrp_price",
    description: "Get live XRP/USD price",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "scrape_url",
    description: "Scrape text from a URL",
    input_schema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
];

// Handle tool calls from Claude
async function handleToolCall(name: string, input: Record<string, string>) {
  if (name === "get_xrp_price") return (await ap.getPrice()).data.XRP.usd;
  if (name === "scrape_url")    return (await ap.scrape(input.url)).data.content.slice(0, 2000);
}
```

---

## Getting an XRPL Wallet

**Testnet (free):**
```bash
# Generate a funded testnet wallet
curl -X POST https://faucet.altnet.rippletest.net/accounts \
  -H "Content-Type: application/json"
# Copy the "seed" from the response
```

**Mainnet:**
Use any XRPL wallet (XUMM, Ledger, etc.) and export the seed.

---

## Environment Variables

```bash
# .env
XRPL_SEED=sEdYourWalletSeedHere
XRPL_NETWORK=xrpl:0          # xrpl:0 testnet | xrpl:1 mainnet
AGENTPAY_BASE_URL=https://agentpay-backend-production.up.railway.app
```

---

## Self-Hosting

Point the client at your own AgentPay backend:

```typescript
const agent = await createAgent(seed, {
  baseUrl: "https://your-agentpay-instance.com",
});
```

Deploy your own backend: [github.com/xrpex/agentpay-backend](https://github.com/xrpex/agentpay-backend)

---

## Links

- 🌐 Marketplace: [agentpay-frontend-theta.vercel.app](https://agentpay-frontend-theta.vercel.app)
- 📦 npm: [npmjs.com/package/agentpay-client](https://npmjs.com/package/agentpay-client)
- 🐙 GitHub: [github.com/xrpex/agentpay-client](https://github.com/xrpex/agentpay-client)
- 📄 x402 Docs: [xrpl-x402.t54.ai/docs](https://xrpl-x402.t54.ai/docs)
- ✉️ Support: [officialagentpay@gmail.com](mailto:officialagentpay@gmail.com)

---

## License

MIT © [AgentPay](https://agentpay-frontend-theta.vercel.app)
