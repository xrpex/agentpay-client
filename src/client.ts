// src/client.ts
// Main AgentPayClient — discovers tools, handles payments, typed methods.

import type {
  AgentPayConfig,
  AgentPayTool,
  CallResult,
  ScrapeResult,
  PriceResult,
  SummaryResult,
  DefiFeedResult,
  ExecuteResult,
} from "./types.js";
import { x402Fetch } from "./x402.js";

const DEFAULT_BASE = "https://agentpay-backend-production.up.railway.app";
const DEFAULT_NETWORK = "xrpl:0";
const DEFAULT_MAX_DROPS = 100_000;
const DEFAULT_TIMEOUT = 30_000;

export class AgentPayClient {
  private config: Required<AgentPayConfig>;
  private wallet: import("xrpl").Wallet | null = null;
  private toolCache: AgentPayTool[] | null = null;

  constructor(config: AgentPayConfig) {
    this.config = {
      network:        config.network        ?? DEFAULT_NETWORK,
      baseUrl:        config.baseUrl        ?? DEFAULT_BASE,
      autoFund:       config.autoFund       ?? false,
      maxDropsPerCall: config.maxDropsPerCall ?? DEFAULT_MAX_DROPS,
      timeout:        config.timeout        ?? DEFAULT_TIMEOUT,
      seed:           config.seed,
    };
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  /** Initialize wallet. Called automatically on first paid call. */
  async init(): Promise<this> {
    const { Wallet } = await import("xrpl");
    this.wallet = Wallet.fromSeed(this.config.seed);

    if (this.config.autoFund && this.config.network === "xrpl:0") {
      await this._fundFromFaucet();
    }

    return this;
  }

  private async _fundFromFaucet(): Promise<void> {
    if (!this.wallet) return;
    console.log(`[AgentPay] Funding wallet ${this.wallet.classicAddress} from testnet faucet…`);
    try {
      await fetch("https://faucet.altnet.rippletest.net/accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ destination: this.wallet.classicAddress }),
      });
      // Wait for ledger confirmation
      await new Promise(r => setTimeout(r, 10_000));
      console.log("[AgentPay] Wallet funded ✓");
    } catch (e) {
      console.warn("[AgentPay] Faucet funding failed:", (e as Error).message);
    }
  }

  private async _ensureWallet(): Promise<import("xrpl").Wallet> {
    if (!this.wallet) await this.init();
    return this.wallet!;
  }

  // ── Tool Discovery ────────────────────────────────────────────────────────

  /** Fetch all available tools from AgentPay registry */
  async listTools(forceRefresh = false): Promise<AgentPayTool[]> {
    if (this.toolCache && !forceRefresh) return this.toolCache;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const r = await fetch(`${this.config.baseUrl}/tools`, { signal: controller.signal });
      if (!r.ok) throw new Error(`Registry fetch failed: HTTP ${r.status}`);
      const tools = await r.json() as AgentPayTool[];
      this.toolCache = tools;
      return tools;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Find a tool by ID */
  async getTool(id: string): Promise<AgentPayTool | undefined> {
    const tools = await this.listTools();
    return tools.find(t => t.id === id);
  }

  /** List tools by category */
  async getToolsByCategory(category: string): Promise<AgentPayTool[]> {
    const tools = await this.listTools();
    return tools.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  // ── Low-level call ────────────────────────────────────────────────────────

  /** Call any tool by path. Handles payment automatically. */
  async call<T = unknown>(
    toolPath: string,
    options: RequestInit = {}
  ): Promise<CallResult<T>> {
    const wallet = await this._ensureWallet();
    const url = `${this.config.baseUrl}${toolPath}`;
    const start = Date.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await x402Fetch(
        url,
        options,
        wallet,
        this.config.network,
        this.config.maxDropsPerCall,
        controller.signal
      );

      const data = await response.json() as T;
      const paymentHeader = response.headers.get("X-PAYMENT-RESPONSE");
      let txHash: string | undefined;
      let drops: number | undefined;

      if (paymentHeader) {
        try {
          const parsed = JSON.parse(atob(paymentHeader));
          txHash = parsed.txHash;
          drops  = parsed.drops;
        } catch {}
      }

      return {
        ok:       response.ok,
        status:   response.status,
        data,
        paid:     response.status !== 402 && !!paymentHeader,
        drops,
        txHash,
        tool:     toolPath,
        duration: Date.now() - start,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Typed Tool Methods ────────────────────────────────────────────────────

  /** Scrape clean text from any public URL */
  async scrape(url: string): Promise<CallResult<ScrapeResult>> {
    return this.call<ScrapeResult>(
      `/tools/web-scraper?url=${encodeURIComponent(url)}`
    );
  }

  /** Get live XRP price in USD, BTC, EUR */
  async getPrice(): Promise<CallResult<PriceResult>> {
    return this.call<PriceResult>("/tools/price-oracle");
  }

  /** Summarize text in 3 sentences using Claude */
  async summarize(text: string): Promise<CallResult<SummaryResult>> {
    return this.call<SummaryResult>("/tools/ai-summarizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  }

  /** Get XRPL AMM pool snapshot */
  async getDefiFeed(): Promise<CallResult<DefiFeedResult>> {
    return this.call<DefiFeedResult>("/tools/defi-feed");
  }

  /** Run Python code in a sandboxed executor */
  async execute(code: string): Promise<CallResult<ExecuteResult>> {
    return this.call<ExecuteResult>("/tools/code-executor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  /** Get wallet address */
  async getAddress(): Promise<string> {
    const wallet = await this._ensureWallet();
    return wallet.classicAddress;
  }

  /** Check backend health */
  async health(): Promise<{ ok: boolean; latency: number; time?: string }> {
    const start = Date.now();
    try {
      const r = await fetch(`${this.config.baseUrl}/health`);
      const data = await r.json() as { time?: string };
      return { ok: r.ok, latency: Date.now() - start, time: data.time };
    } catch {
      return { ok: false, latency: Date.now() - start };
    }
  }

  /** Print a summary of available tools */
  async printTools(): Promise<void> {
    const tools = await this.listTools();
    console.log("\n⚡ AgentPay Tool Registry");
    console.log("─".repeat(60));
    for (const t of tools) {
      const xrp = (parseInt(t.price_drops) / 1_000_000).toFixed(4);
      console.log(`  ${t.icon}  ${t.name.padEnd(22)} ${(t.free ? "FREE" : xrp + " XRP").padEnd(12)} ${t.method} ${t.path}`);
    }
    console.log("─".repeat(60) + "\n");
  }
}
