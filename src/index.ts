// src/index.ts
// agentpay-client — Public API

export { AgentPayClient } from "./client.js";
export type {
  AgentPayConfig,
  AgentPayTool,
  CallResult,
  ScrapeResult,
  PriceResult,
  SummaryResult,
  DefiFeedResult,
  ExecuteResult,
  PaymentRequiredHeader,
} from "./types.js";

// Convenience factory function — the one-liner
export async function createAgent(
  seed: string,
  options?: Omit<import("./types.js").AgentPayConfig, "seed">
) {
  const { AgentPayClient } = await import("./client.js");
  const client = new AgentPayClient({ seed, ...options });
  await client.init();
  return client;
}
