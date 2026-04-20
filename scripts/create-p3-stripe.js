require('dotenv').config({ path: '/data/openclaw-system/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    const product = await stripe.products.create({
      name: 'Platform IP Enforcement Kit',
      description: '9 fillable PDF templates for Amazon, TikTok Shop, AliExpress, Pinterest, Shopify, Gumroad, Creative Market, Redbubble, and any platform where your work is stolen.',
      type: 'service',
      metadata: {
        product_tier: 'p3',
        launch_date: '2026-04-19'
      }
    });

    console.log('✓ Product created:');
    console.log(`  ID: ${product.id}`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Type: ${product.type}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating product:', err.message);
    process.exit(1);
  }
})();
