const axios = require('axios');


async function getPaymentIntent(tool, options = {}) {
  const endpoint = options.endpoint || options.defaultEndpoint;
  
  const response = await axios.post(`${endpoint}/v1/tools/${tool.name}/intent`, {
    tool: tool.name,
    price: tool.price
  }, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.data; 
}

async function callWithProof(tool, params, paymentProof, options = {}) {
  const endpoint = options.endpoint || options.defaultEndpoint;
  
  const response = await axios.post(`${endpoint}/v1/tools/${tool.name}/call`, {
    params,
    paymentProof: {
      txHash: paymentProof.txHash,
      amount: paymentProof.amount,
      destination: paymentProof.destination,
      sender: paymentProof.sender
    }
  }, {
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.data;
}

/**
 * Auto-payment flow: handles payment internally if walletSeed provided
 */
async function callTool(tool, params, options = {}) {
  const endpoint = options.endpoint || options.defaultEndpoint;
  const onPayment = options.onPayment || (() => {});
  
  
  if (!options.walletSeed) {
    throw new Error(
      `No walletSeed provided. Either:\n` +
      `  1. Pass walletSeed for auto-payment, or\n` +
      `  2. Use getPaymentIntent() + callWithProof() for manual payment`
    );
  }
  
  
  const { Client, Wallet } = require('xrpl');
  
  onPayment({ status: 'creating_payment', tool: tool.name });
  
  
  const intent = await getPaymentIntent(tool, options);
  
  
  const client = new Client(intent.network === 'testnet' 
    ? 'wss://s.altnet.rippletest.net:51233' 
    : 'wss://xrpl.ws');
  await client.connect();
  
  try {
    const wallet = Wallet.fromSeed(options.walletSeed);
    const payment = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: intent.destination,
      Amount: intent.amount.toString(),
      Fee: '12',
      Flags: 2147483648
    };
    
    const signed = wallet.sign(payment);
    const result = await client.submitAndWait(signed.tx_blob);
    const paymentProof = {
      txHash: result.result.hash,
      amount: intent.amount,
      destination: intent.destination,
      sender: wallet.classicAddress
    };
    
    onPayment({ status: 'payment_sent', txHash: paymentProof.txHash });
    
    
    onPayment({ status: 'executing_tool', tool: tool.name });
    const response = await callWithProof(tool, params, paymentProof, options);
    
    onPayment({ status: 'success', result: response });
    return response;
    
  } finally {
    await client.disconnect();
  }
}

module.exports = { callTool, getPaymentIntent, callWithProof };
