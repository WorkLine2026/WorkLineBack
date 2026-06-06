const nodemailer = require('nodemailer');

console.log('\n🔧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 INITIALIZING EMAIL SERVICE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ✅ VALIDATE REQUIRED VARIABLES
if (!process.env.EMAIL_USER) {
  console.error('❌ FATAL ERROR: EMAIL_USER is not set in .env');
  process.exit(1);
}

if (!process.env.EMAIL_PASS) {
  console.error('❌ FATAL ERROR: EMAIL_PASS is not set in .env');
  process.exit(1);
}

// ✅ CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,  // true for 465
  family: 4,     // IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ VERIFY CONNECTION ON STARTUP
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ EMAIL SERVICE VERIFICATION FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('\n❌ Error:', err.message);
    console.error('\n🔍 TROUBLESHOOTING:');
    console.error('   1. Check EMAIL_USER in .env (should be your gmail address)');
    console.error('   2. Check EMAIL_PASS in .env (should be 16-char App Password)');
    console.error('   3. Make sure 2-Factor Authentication is enabled on Gmail');
    console.error('   4. Generate new App Password: https://myaccount.google.com/apppasswords');
    console.error('   5. Restart backend after updating .env');
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ EMAIL SERVICE READY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Email User:', process.env.EMAIL_USER);
    console.log('✅ Email Host:', process.env.EMAIL_HOST);
    console.log('✅ Email Port:', process.env.EMAIL_PORT);
    console.log('✅ SMTP Connection: VERIFIED ✓');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
});

module.exports = transporter;