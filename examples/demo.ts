// examples/demo.ts
// Complete demo — shows every AgentPay tool in action.
// Run: npx tsx examples/demo.ts

import { createAgent } from "agentpay-client";

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║     agentpay-client Demo — All 5 Tools       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // ── One-line agent creation ──────────────────────────────────────────────
  const agent = await createAgent(
    process.env.XRPL_SEED!,
    {
      network: "xrpl:0",          // testnet
      autoFund: true,             // auto-fund wallet from faucet
      maxDropsPerCall: 50_000,    // safety limit
    }
  );

  console.log("Wallet:", await agent.getAddress());

  // ── Discover tools ───────────────────────────────────────────────────────
  await agent.printTools();

  // ── Health check ─────────────────────────────────────────────────────────
  const health = await agent.health();
  console.log(`Backend: ${health.ok ? "✅ Online" : "❌ Offline"} (${health.latency}ms)\n`);

  // ── Web Scraper ───────────────────────────────────────────────────────────
  console.log("🌐 Scraping example.com…");
  const scrape = await agent.scrape("https://example.com");
  console.log(`   ✅ ${scrape.data.chars} chars | paid: ${scrape.paid}`);
  console.log(`   Preview: ${scrape.data.content.slice(0, 80).replace(/\n/g," ")}…\n`);

  // ── AI Summarizer ─────────────────────────────────────────────────────────
  console.log("🤖 Summarizing scraped content…");
  const summary = await agent.summarize(scrape.data.content.slice(0, 1000));
  console.log(`   ✅ "${summary.data.summary}"\n`);

  // ── Price Oracle ──────────────────────────────────────────────────────────
  console.log("📈 Fetching XRP prices…");
  const price = await agent.getPrice();
  console.log(`   ✅ XRP/USD: $${price.data.XRP.usd} | BTC: ${price.data.XRP.btc}\n`);

  // ── DeFi Feed ─────────────────────────────────────────────────────────────
  console.log("💹 Fetching XRPL DeFi pools…");
  const defi = await agent.getDefiFeed();
  console.log(`   ✅ ${defi.data.pools.length} pools retrieved\n`);

  // ── Code Executor ─────────────────────────────────────────────────────────
  console.log("⚡ Running Python code…");
  const exec = await agent.execute(`
import math
price = ${price.data.XRP.usd}
print(f"XRP: ${"{"}price{"}"}")
print(f"100 XRP = ${"{"}price * 100:.2f{"}"} USD")
print(f"sqrt(2) = {math.sqrt(2):.6f}")
  `.trim());
  console.log(`   ✅ stdout:\n${exec.data.stdout.split("\n").map(l=>`      ${l}`).join("\n")}\n`);

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  ✅  All tools called with auto-payment!     ║");
  console.log("╚══════════════════════════════════════════════╝\n");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
