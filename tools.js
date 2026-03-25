// tools.js - AgentPay tool management and API integration

// ─────────────────────────────────────────────────────────────────────────────
// FREE TOOLS (Open Source - Community Maintained)
// ─────────────────────────────────────────────────────────────────────────────

export const FREE_TOOLS = [
  {
    id: "web-scraper",
    name: "Web Scraper",
    description: "Extract content from any URL with smart parsing. Returns clean text, metadata, and structured data.",
    category: "Data",
    icon: "🕷️",
    path: "/api/tools/web-scraper",
    method: "POST",
    free: true,
    github: "https://github.com/xrpex/agentpay-tools/tree/main/web-scraper",
    docs_url: "https://agentpay-frontend-theta.vercel.app/docs/web-scraper",
    deploy_script: `#!/bin/bash
# Deploy Web Scraper to your own server
git clone https://github.com/xrpex/agentpay-tools.git
cd agentpay-tools/web-scraper
npm install
npm start

# Or use Docker:
# docker run -p 3000:3000 xrpex/web-scraper`,
    example_request: `curl -X POST https://your-server.com/api/tools/web-scraper \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "format": "markdown"}'`,
    example_response: `{
  "success": true,
  "data": {
    "title": "Example Domain",
    "content": "# Example Domain\\n\\nThis domain is for use...",
    "metadata": {
      "description": "Example domain description",
      "wordCount": 124
    }
  }
}`,
    schema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri", description: "URL to scrape" },
        format: { type: "string", enum: ["text", "markdown", "html"], default: "markdown" }
      },
      required: ["url"]
    }
  },
  {
    id: "price-oracle",
    name: "Price Oracle",
    description: "Real-time XRP/USD price feed from multiple exchanges. Returns current price, 24h change, and volume.",
    category: "Finance",
    icon: "📊",
    path: "/api/tools/price-oracle",
    method: "GET",
    free: true,
    github: "https://github.com/xrpex/agentpay-tools/tree/main/price-oracle",
    docs_url: "https://agentpay-frontend-theta.vercel.app/docs/price-oracle",
    deploy_script: `#!/bin/bash
# Deploy Price Oracle
git clone https://github.com/xrpex/agentpay-tools.git
cd agentpay-tools/price-oracle
npm install
npm start`,
    example_request: `curl https://your-server.com/api/tools/price-oracle?currency=XRP`,
    example_response: `{
  "success": true,
  "data": {
    "symbol": "XRP/USD",
    "price": 0.5234,
    "change_24h": 2.34,
    "volume_24h": 1250000000,
    "timestamp": "2026-03-25T10:30:00Z"
  }
}`,
    schema: {
      type: "object",
      properties: {
        currency: { type: "string", enum: ["XRP", "BTC", "ETH"], default: "XRP" }
      }
    }
  },
  {
    id: "ai-summarizer",
    name: "AI Summarizer",
    description: "Summarize long-form content using open-source LLMs. Works with text, URLs, or uploaded documents.",
    category: "AI",
    icon: "🤖",
    path: "/api/tools/ai-summarizer",
    method: "POST",
    free: true,
    github: "https://github.com/xrpex/agentpay-tools/tree/main/ai-summarizer",
    docs_url: "https://agentpay-frontend-theta.vercel.app/docs/ai-summarizer",
    deploy_script: `#!/bin/bash
# Deploy AI Summarizer (requires Ollama)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama2
git clone https://github.com/xrpex/agentpay-tools.git
cd agentpay-tools/ai-summarizer
npm install
npm start`,
    example_request: `curl -X POST https://your-server.com/api/tools/ai-summarizer \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Long article text here...", "max_length": 200}'`,
    example_response: `{
  "success": true,
  "data": {
    "summary": "This is a concise summary of the original text...",
    "original_length": 1250,
    "summary_length": 185,
    "compression_ratio": 0.148
  }
}`,
    schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to summarize" },
        url: { type: "string", format: "uri", description: "URL to fetch and summarize" },
        max_length: { type: "integer", minimum: 50, maximum: 1000, default: 200 }
      }
    }
  },
  {
    id: "codex-search",
    name: "Codex Search",
    description: "Search code and documentation across GitHub, Stack Overflow, and npm. Returns relevant code snippets.",
    category: "Dev",
    icon: "🔍",
    path: "/api/tools/codex-search",
    method: "POST",
    free: true,
    github: "https://github.com/xrpex/agentpay-tools/tree/main/codex-search",
    docs_url: "https://agentpay-frontend-theta.vercel.app/docs/codex-search",
    deploy_script: `#!/bin/bash
# Deploy Codex Search
git clone https://github.com/xrpex/agentpay-tools.git
cd agentpay-tools/codex-search
npm install
npm start`,
    example_request: `curl -X POST https://your-server.com/api/tools/codex-search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "fetch API javascript", "sources": ["github", "stackoverflow"]}'`,
    example_response: `{
  "success": true,
  "data": {
    "results": [
      {
        "source": "github",
        "title": "fetch-example.js",
        "snippet": "fetch('https://api.example.com/data')\\n  .then(response => response.json())\\n  .then(data => console.log(data));",
        "url": "https://github.com/example/fetch-example"
      }
    ],
    "total": 12
  }
}`,
    schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        sources: { type: "array", items: { type: "string", enum: ["github", "stackoverflow", "npm"] }, default: ["github"] }
      },
      required: ["query"]
    }
  },
  {
    id: "defi-data",
    name: "DeFi Data",
    description: "Fetch DeFi protocol analytics, TVL, yields, and token prices across major chains.",
    category: "Finance",
    icon: "💰",
    path: "/api/tools/defi-data",
    method: "GET",
    free: true,
    github: "https://github.com/xrpex/agentpay-tools/tree/main/defi-data",
    docs_url: "https://agentpay-frontend-theta.vercel.app/docs/defi-data",
    deploy_script: `#!/bin/bash
# Deploy DeFi Data aggregator
git clone https://github.com/xrpex/agentpay-tools.git
cd agentpay-tools/defi-data
npm install
npm start`,
    example_request: `curl https://your-server.com/api/tools/defi-data?protocol=aave&chain=ethereum`,
    example_response: `{
  "success": true,
  "data": {
    "protocol": "Aave",
    "chain": "ethereum",
    "tvl": 5420000000,
    "total_borrowed": 3250000000,
    "apy": {
      "usdc": 3.45,
      "weth": 1.23
    }
  }
}`,
    schema: {
      type: "object",
      properties: {
        protocol: { type: "string", description: "Protocol name" },
        chain: { type: "string", enum: ["ethereum", "polygon", "arbitrum", "optimism"] }
      }
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PAID TOOLS (Premium - Pay Per Call via XRPL x402)
// ─────────────────────────────────────────────────────────────────────────────

// These will be fetched from backend, but here's the expected structure
export const PAID_TOOLS_SCHEMA = {
  "web-scraper-pro": {
    id: "web-scraper-pro",
    name: "Web Scraper Pro",
    description: "Advanced web scraping with JavaScript rendering, proxy rotation, and anti-bot bypass.",
    category: "Data",
    icon: "🕷️⚡",
    price_drops: 20000, // 0.02 XRP
    price_xrp: 0.02,
    endpoint: "/v1/tools/web-scraper-pro",
    method: "POST",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        javascript: { type: "boolean", default: true },
        wait_for: { type: "integer", minimum: 0, maximum: 10000, default: 2000 }
      },
      required: ["url"]
    }
  },
  "ai-summarizer-pro": {
    id: "ai-summarizer-pro",
    name: "AI Summarizer Pro",
    description: "Premium summarization with GPT-4 level quality. Handles PDFs, videos, and multi-document synthesis.",
    category: "AI",
    icon: "🧠",
    price_drops: 50000, // 0.05 XRP
    price_xrp: 0.05,
    endpoint: "/v1/tools/ai-summarizer-pro",
    method: "POST",
    schema: {
      type: "object",
      properties: {
        content: { type: "string" },
        url: { type: "string", format: "uri" },
        format: { type: "string", enum: ["bullet", "paragraph", "executive"] },
        max_tokens: { type: "integer", minimum: 100, maximum: 2000, default: 500 }
      }
    }
  },
  "defi-analytics": {
    id: "defi-analytics",
    name: "DeFi Analytics Premium",
    description: "Real-time DeFi analytics with historical data, APY tracking, and risk metrics across 50+ protocols.",
    category: "Finance",
    icon: "📈",
    price_drops: 30000, // 0.03 XRP
    price_xrp: 0.03,
    endpoint: "/v1/tools/defi-analytics",
    method: "GET",
    schema: {
      type: "object",
      properties: {
        protocol: { type: "string" },
        chain: { type: "string" },
        timeframe: { type: "string", enum: ["1h", "24h", "7d", "30d"], default: "24h" }
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agentpay-backend-production.up.railway.app';

/**
 * Fetch paid tools from backend
 */
export async function fetchPaidTools() {
  try {
    const response = await fetch(`${API_BASE}/v1/tools`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform backend response to match frontend tool format
    return (data.tools || []).map(tool => ({
      id: tool.id || tool.name,
      name: tool.name,
      description: tool.description,
      category: tool.category || "General",
      icon: tool.icon || "⚡",
      path: tool.endpoint || `/v1/tools/${tool.name}`,
      method: tool.method || "POST",
      free: false,
      price_drops: tool.priceInDrops || Math.floor(tool.price * 1000000),
      price_xrp: tool.price,
      schema: tool.schema,
      github: tool.github_url,
      docs_url: tool.docs_url,
      provider: tool.provider,
      verified: tool.verified ?? true
    }));
  } catch (error) {
    console.error('Failed to fetch paid tools:', error);
    // Return fallback data if backend unavailable
    return Object.values(PAID_TOOLS_SCHEMA).map(tool => ({
      ...tool,
      free: false,
      path: tool.endpoint
    }));
  }
}

/**
 * Fetch a single tool by ID (free or paid)
 */
export async function fetchToolById(toolId) {
  // Check free tools first
  const freeTool = FREE_TOOLS.find(t => t.id === toolId);
  if (freeTool) {
    return { ...freeTool, free: true };
  }
  
  // Check paid tools from backend
  try {
    const response = await fetch(`${API_BASE}/v1/tools/${toolId}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Tool not found: ${toolId}`);
    }
    
    const tool = await response.json();
    return {
      ...tool,
      id: tool.id || toolId,
      free: false,
      price_drops: tool.priceInDrops || Math.floor(tool.price * 1000000)
    };
  } catch (error) {
    console.error('Failed to fetch tool:', error);
    return null;
  }
}

/**
 * Get payment intent for a paid tool
 * Returns facilitator address and amount to pay
 */
export async function getPaymentIntent(toolId, options = {}) {
  const response = await fetch(`${API_BASE}/v1/tools/${toolId}/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      toolId,
      ...options
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }
  
  return response.json();
}

/**
 * Execute a paid tool with payment proof
 */
export async function executePaidTool(toolId, params, paymentProof) {
  const response = await fetch(`${API_BASE}/v1/tools/${toolId}/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      params,
      paymentProof: {
        txHash: paymentProof.txHash,
        amount: paymentProof.amount,
        destination: paymentProof.destination,
        sender: paymentProof.sender,
        timestamp: paymentProof.timestamp
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Tool execution failed');
  }
  
  return response.json();
}

/**
 * Execute free tool (no payment required)
 */
export async function executeFreeTool(toolId, params, baseUrl = null) {
  const tool = FREE_TOOLS.find(t => t.id === toolId);
  if (!tool) {
    throw new Error(`Free tool "${toolId}" not found`);
  }
  
  const url = baseUrl || `${API_BASE}${tool.path}`;
  
  const response = await fetch(url, {
    method: tool.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: tool.method === 'POST' ? JSON.stringify(params) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`Tool execution failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get all tools (free + paid) for discovery
 */
export async function getAllTools() {
  const freeTools = FREE_TOOLS.map(t => ({ ...t, free: true }));
  const paidTools = await fetchPaidTools();
  return [...freeTools, ...paidTools];
}

/**
 * Get tool categories with counts
 */
export function getCategoriesWithCounts(tools) {
  const counts = {};
  tools.forEach(tool => {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate tool parameters against schema
 */
export function validateToolParams(tool, params) {
  if (!tool.schema) return { valid: true };
  
  const { required, properties } = tool.schema;
  const errors = [];
  
  // Check required fields
  if (required) {
    for (const field of required) {
      if (params[field] === undefined || params[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Type validation (basic)
  if (properties) {
    for (const [field, schema] of Object.entries(properties)) {
      if (params[field] !== undefined) {
        const value = params[field];
        
        if (schema.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
        if (schema.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        }
        if (schema.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean`);
        }
        if (schema.type === 'array' && !Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        }
        
        // Enum validation
        if (schema.enum && !schema.enum.includes(value)) {
          errors.push(`${field} must be one of: ${schema.enum.join(', ')}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
