// src/x402.ts
// Handles the full x402 HTTP 402 payment flow on XRPL.
// 1. Detects 402 response with payment instructions
// 2. Signs an XRPL Payment transaction
// 3. Retries the request with PAYMENT-SIGNATURE header

import type { Wallet as XrplWallet } from "xrpl";
import type { PaymentRequiredHeader } from "./types.js";

export async function buildPaymentPayload(
  wallet: XrplWallet,
  requirements: PaymentRequiredHeader["accepts"][0],
  network: string
): Promise<string> {
  // Dynamically import xrpl to keep it optional for non-payment use
  const { Wallet, encode } = await import("xrpl");

  const drops = requirements.maxAmountRequired;
  const destination = requirements.payTo;

  // Build XRPL Payment tx blob
  const tx = {
    TransactionType: "Payment" as const,
    Account: wallet.classicAddress,
    Destination: destination,
    Amount: drops,
    Fee: "12",
    // InvoiceID binds payment to specific request (anti-replay)
    InvoiceID: requirements.resource
      ? Buffer.from(requirements.resource).toString("hex").padEnd(64, "0").slice(0, 64).toUpperCase()
      : undefined,
  };

  // Sign the transaction
  const signed = wallet.sign(tx as Parameters<typeof wallet.sign>[0]);

  // Return base64-encoded signed tx blob as payment payload
  const payload = {
    x402Version: 1,
    scheme: "exact",
    network,
    payload: {
      signature: signed.tx_blob,
      from: wallet.classicAddress,
    },
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function parsePaymentRequired(response: Response): PaymentRequiredHeader | null {
  try {
    // x402 sends payment details in response body for 402s
    return null; // Will be populated after body parse
  } catch {
    return null;
  }
}

export async function x402Fetch(
  url: string,
  options: RequestInit,
  wallet: XrplWallet,
  network: string,
  maxDrops: number,
  signal?: AbortSignal
): Promise<Response> {
  const opts = { ...options, signal };

  // First attempt — no payment
  const firstResponse = await fetch(url, opts);

  if (firstResponse.status !== 402) {
    return firstResponse;
  }

  // Parse 402 payment requirements from body
  let paymentReq: PaymentRequiredHeader;
  try {
    paymentReq = await firstResponse.json() as PaymentRequiredHeader;
  } catch {
    throw new Error("AgentPay: 402 response body is not valid JSON");
  }

  if (!paymentReq.accepts?.length) {
    throw new Error("AgentPay: 402 response has no payment requirements");
  }

  const requirement = paymentReq.accepts[0];

  // Safety check
  const drops = parseInt(requirement.maxAmountRequired, 10);
  if (drops > maxDrops) {
    throw new Error(
      `AgentPay: Tool costs ${drops} drops but maxDropsPerCall is ${maxDrops}. ` +
      `Increase maxDropsPerCall in config to allow this payment.`
    );
  }

  // Build signed payment payload
  const paymentPayload = await buildPaymentPayload(wallet, requirement, network);

  // Retry with payment header
  const paidResponse = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers as Record<string, string> || {}),
      "X-PAYMENT": paymentPayload,
      "Content-Type": options.method === "POST" ? "application/json" : "",
    },
  });

  return paidResponse;
}
