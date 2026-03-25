// src/types.ts

export interface AgentPayTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  price_drops: string;
  asset: string;
  free?: boolean;
  endpoint_url?: string;
  deploy_script?: string;
  example_request?: string;
  example_response?: string;
  github?: string;
  docs_url?: string;
  provider?: string;
}

export interface AgentPayConfig {
  /** XRPL wallet seed for signing payments */
  seed: string;
  /** XRPL network: "xrpl:0" (testnet) | "xrpl:1" (mainnet). Default: xrpl:0 */
  network?: string;
  /** AgentPay backend URL. Default: hosted endpoint */
  baseUrl?: string;
  /** Auto-fund wallet from testnet faucet on init. Default: false */
  autoFund?: boolean;
  /** Max drops to spend per call (safety limit). Default: 100000 */
  maxDropsPerCall?: number;
  /** Request timeout in ms. Default: 30000 */
  timeout?: number;
}

export interface CallResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  paid: boolean;
  drops?: number;
  txHash?: string;
  tool: string;
  duration: number;
}

export interface ScrapeResult {
  url: string;
  chars: number;
  content: string;
}

export interface PriceResult {
  XRP: { usd: number; btc: number; eur: number };
  timestamp: string;
  source: string;
}

export interface SummaryResult {
  summary: string;
  method: string;
  chars_in: number;
}

export interface DefiFeedResult {
  pools: Array<{ asset1: string; asset2: string; trading_fee?: number }>;
  timestamp: string;
  source: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  code: number;
  signal?: string;
}

export interface PaymentRequiredHeader {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    payTo: string;
    asset: string;
  }>;
  error: string;
}
