require('dotenv').config({ path: '/data/openclaw-system/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    // Step 1: Create price for the product
    const price = await stripe.prices.create({
      product: 'prod_UMqLUXJV0Qb1DC',
      unit_amount: 6700, // $67.00 in cents
      currency: 'usd',
      metadata: {
        product_tier: 'p3'
      }
    });

    console.log('✓ Price created:');
    console.log(`  ID: ${price.id}`);
    console.log(`  Amount: $${(price.unit_amount / 100).toFixed(2)} USD`);

    // Step 2: Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://sellerdefensekit.com/thank-you?session_id={CHECKOUT_SESSION_ID}'
        }
      },
      metadata: {
        product_tier: 'p3'
      }
    });

    console.log('✓ Payment link created:');
    console.log(`  URL: ${paymentLink.url}`);
    console.log(`  Price ID: ${price.id}`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
