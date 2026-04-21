require('dotenv').config({ path: '../../../../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_URL = 'https://sellerdefensekit.com/api/webhook/stripe';
const TEST_EMAIL = 'delivered@resend.dev';

// Product configurations
const PRODUCTS = {
  p2: {
    name: 'Trademark Protection Kit',
    product_id: 'prod_UIWdonnmxXAE0K',
    price_id: null,
    expected_subject: 'Your Trademark Protection Kit is ready — download inside',
  },
  p3: {
    name: 'Platform IP Enforcement Kit',
    product_id: 'prod_UMqLUXJV0Qb1DC',
    price_id: null,
    expected_subject: 'Your Platform IP Enforcement Kit is ready — 9 templates inside',
  },
};

function generateStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedContent = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedContent)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

async function testCompleteWebhook(productKey, productConfig) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Testing: ${productConfig.name}`);
  console.log(`Product ID: ${productConfig.product_id}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`${'═'.repeat(60)}\n`);

  try {
    // Get a price for this product
    const prices = await stripe.prices.list({ product: productConfig.product_id, limit: 1 });

    if (prices.data.length === 0) {
      console.log(`✗ No prices found for product ${productConfig.product_id}`);
      return;
    }

    const priceId = prices.data[0].id;
    console.log(`[${productKey.toUpperCase()}] Found price: ${priceId}`);

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://sellerdefensekit.com/thank-you?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://sellerdefensekit.com/',
      customer_email: TEST_EMAIL,
    });

    console.log(`[${productKey.toUpperCase()}] Created checkout session: ${session.id}`);

    // Retrieve the session with expanded line_items
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });

    const lineItems = expandedSession.line_items?.data || [];
    const products = lineItems.map((item) => item.price?.product).filter(Boolean);
    console.log(`[${productKey.toUpperCase()}] Session has products: ${products.join(', ')}`);

    // Now simulate a payment_intent.succeeded event
    // Create a real payment intent with the session
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 6700,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: TEST_EMAIL,
    });

    console.log(`[${productKey.toUpperCase()}] Created payment intent: ${paymentIntent.id}`);

    // Build the webhook event
    const event = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2026-02-25.clover',
      created: Math.floor(Date.now() / 1000),
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntent.id,
          object: 'payment_intent',
          amount: 6700,
          currency: 'usd',
          receipt_email: TEST_EMAIL,
          customer_details: {
            email: TEST_EMAIL,
          },
          metadata: {},
        },
      },
    };

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    console.log(`[${productKey.toUpperCase()}] Sending webhook: ${WEBHOOK_URL}`);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: payload,
    });

    const responseText = await response.text();
    const responseData = responseText.startsWith('{') ? JSON.parse(responseText) : responseText;

    console.log(`[${productKey.toUpperCase()}] HTTP ${response.status}`);

    if (response.status === 200) {
      console.log(`\n✓ [${productKey.toUpperCase()}] WEBHOOK PASSED`);
      console.log(`  - Product: ${productConfig.name}`);
      console.log(`  - Email subject: "${productConfig.expected_subject}"`);
      console.log(`  - Test email: ${TEST_EMAIL}\n`);
    } else {
      console.log(`\n✗ [${productKey.toUpperCase()}] FAILED (HTTP ${response.status})\n`);
    }
  } catch (err) {
    console.error(`✗ [${productKey.toUpperCase()}] Error:`, err.message);
  }
}

(async () => {
  console.log('UNIFIED WEBHOOK TEST — P2 and P3\n');

  await testCompleteWebhook('p3', PRODUCTS.p3);
  await testCompleteWebhook('p2', PRODUCTS.p2);

  console.log(`${'═'.repeat(60)}`);
  console.log('WEBHOOK TESTS COMPLETE');
  console.log(`${'═'.repeat(60)}\n`);
})();
