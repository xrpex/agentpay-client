/**
 * agentpay-client — One-line wrapper for AI agents
 * 
 * Official client for AgentPay marketplace: https://agentpay-frontend-theta.vercel.app
 * 
 * Usage:
 *   const agentpay = require('agentpay-client');
 *   
 *   // Option 1: Auto-payment (requires wallet seed)
 *   const result = await agentpay.call('web-scraper', { url: '...' }, {
 *     walletSeed: process.env.XRP_SEED
 *   });
 *   
 *   // Option 2: Manual payment (client handles payment externally)
 *   const intent = await agentpay.getPaymentIntent('web-scraper');
 *   const proof = await agentpay.sendPayment(intent);  // client handles XRP
 *   const result = await agentpay.callWithProof('web-scraper', { url: '...' }, proof);
 */

const { discoverTools, getTool } = require('./tools');
const { callTool, getPaymentIntent, callWithProof } = require('./payment');

const DEFAULT_ENDPOINT = 'https://agentpay-backend-production.up.railway.app';

/**
 * Discover all available AgentPay tools
 */
async function discover(options = {}) {
  return discoverTools({ ...options, defaultEndpoint: DEFAULT_ENDPOINT });
}

/**
 * Get payment intent for a tool (returns facilitator address and amount)
 * @param {string} toolName - Name of the tool
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Payment intent with destination, amount, and tool details
 */
async function getPaymentIntent(toolName, options = {}) {
  if (!toolName || typeof toolName !== 'string') {
    throw new Error('toolName is required and must be a string');
  }
  
  const tool = await getTool(toolName, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found. Run discover() to see available tools.`);
  }
  
  return getPaymentIntent(tool, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
}

/**
 * Call a tool with an existing payment proof (manual payment flow)
 * @param {string} toolName - Name of the tool
 * @param {Object} params - Tool-specific parameters
 * @param {Object} paymentProof - Payment proof from facilitator
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Tool execution result
 */
async function callWithProof(toolName, params, paymentProof, options = {}) {
  if (!toolName || typeof toolName !== 'string') {
    throw new Error('toolName is required and must be a string');
  }
  if (!params || typeof params !== 'object') {
    throw new Error('params is required and must be an object');
  }
  if (!paymentProof || !paymentProof.txHash) {
    throw new Error('paymentProof with txHash is required');
  }
  
  const tool = await getTool(toolName, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found. Run discover() to see available tools.`);
  }
  
  return callWithProof(tool, params, paymentProof, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
}

/**
 * Call a tool with auto-payment (requires wallet seed)
 * @param {string} toolName - Name of the tool to call
 * @param {Object} params - Tool-specific parameters
 * @param {Object} options - Optional configuration
 * @param {string} options.walletSeed - XRPL wallet seed for auto-payment
 * @param {string} options.endpoint - Custom AgentPay API endpoint
 * @param {Function} options.onPayment - Callback for payment status updates
 * @returns {Promise<Object>} Tool execution result
 */
async function call(toolName, params, options = {}) {
  if (!toolName || typeof toolName !== 'string') {
    throw new Error('toolName is required and must be a string');
  }
  if (!params || typeof params !== 'object') {
    throw new Error('params is required and must be an object');
  }
  
  const tool = await getTool(toolName, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found. Run discover() to see available tools.`);
  }
  
  // walletSeed is optional now
  return callTool(tool, params, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
}

/**
 * Get tool details by name
 */
async function get(toolName, options = {}) {
  if (!toolName || typeof toolName !== 'string') {
    throw new Error('toolName is required and must be a string');
  }
  
  const tool = await getTool(toolName, { ...options, defaultEndpoint: DEFAULT_ENDPOINT });
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found. Run discover() to see available tools.`);
  }
  return tool;
}

module.exports = { 
  discover, 
  call, 
  get, 
  getPaymentIntent, 
  callWithProof,
  DEFAULT_ENDPOINT 
};
