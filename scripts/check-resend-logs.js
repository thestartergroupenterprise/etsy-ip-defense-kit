require('dotenv').config({ path: '../../../../.env' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  try {
    // List recently sent emails
    const emails = await resend.emails.list({ limit: 10 });

    console.log('Recent Resend Emails:\n');
    console.log('════════════════════════════════════════════════════════════\n');

    const relevantEmails = emails.data.filter(
      (email) =>
        email.from === 'hello@sellerdefensekit.com' &&
        (email.to === 'delivered@resend.dev' ||
          email.subject.includes('Platform IP') ||
          email.subject.includes('Trademark'))
    );

    if (relevantEmails.length === 0) {
      console.log('No recent test emails found in Resend logs.');
      console.log('\nAll recent emails:');
      emails.data.slice(0, 5).forEach((email) => {
        console.log(`  To: ${email.to}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Status: ${email.status}`);
        console.log('');
      });
    } else {
      relevantEmails.forEach((email) => {
        console.log(`✓ Email Sent:`);
        console.log(`  To: ${email.to}`);
        console.log(`  From: ${email.from}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Status: ${email.status}`);
        console.log(`  Created: ${email.created_at}`);
        console.log('');
      });
    }
  } catch (err) {
    console.error('Error checking Resend logs:', err.message);
  }
})();
