// examples/langchain.ts
// Wrap AgentPay tools as LangChain tools.
// npm install langchain @langchain/core

import { createAgent } from "agentpay-client";
import { Tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";

// ── Wrap AgentPay as LangChain Tools ─────────────────────────────────────────
async function buildAgentPayTools() {
  const agent = await createAgent(process.env.XRPL_SEED!, { network: "xrpl:0" });

  return [
    new Tool({
      name: "scrape_web",
      description: "Scrape clean text from any public URL. Input: a URL string.",
      func: async (url: string) => {
        const r = await agent.scrape(url);
        return r.data.content.slice(0, 3000);
      },
    }),

    new Tool({
      name: "get_xrp_price",
      description: "Get live XRP price in USD, BTC, EUR. No input needed.",
      func: async () => {
        const r = await agent.getPrice();
        return `XRP/USD: $${r.data.XRP.usd}, XRP/BTC: ${r.data.XRP.btc}`;
      },
    }),

    new Tool({
      name: "summarize_text",
      description: "Summarize long text into 3 sentences. Input: text to summarize.",
      func: async (text: string) => {
        const r = await agent.summarize(text);
        return r.data.summary;
      },
    }),

    new Tool({
      name: "run_python",
      description: "Execute a Python code snippet. Input: Python code as string.",
      func: async (code: string) => {
        const r = await agent.execute(code);
        return r.data.stdout || r.data.stderr || "No output";
      },
    }),
  ];
}

async function main() {
  const tools = await buildAgentPayTools();
  const llm   = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });
  const prompt = await pull("hwchase17/react");

  const reactAgent = await createReactAgent({ llm, tools, prompt });
  const executor   = AgentExecutor.fromAgentAndTools({ agent: reactAgent, tools, verbose: true });

  const result = await executor.invoke({
    input: "What is the current XRP price, and scrape the title of https://example.com?",
  });

  console.log("Result:", result.output);
}

main().catch(console.error);
