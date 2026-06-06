const nodemailer = require('nodemailer');
const dns = require('dns');

// აიძულებს Node.js-ს, რომ DNS რეზოლუციისას საერთოდ უგულებელყოს IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

console.log('\n🔧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 INITIALIZING EMAIL SERVICE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ FATAL ERROR: EMAIL_USER or EMAIL_PASS is not set');
  process.exit(1);
}

// გადავდივართ 587 პორტზე (TLS), რომელიც ბევრად უფრო ღიაა ჰოსტინგებზე
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 პორტისთვის აუცილებლად უნდა იყოს false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // ეს უზრუნველყოფს, რომ Render-მა არ დაბლოკოს კავშირი სერტიფიკატის გამო
    rejectUnauthorized: false
  }
});

// კავშირის შემოწმება
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ EMAIL SERVICE VERIFICATION FAILED:', err.message);
  } else {
    console.log('✅ EMAIL SERVICE READY & VERIFIED ✓');
  }
});

module.exports = transporter;