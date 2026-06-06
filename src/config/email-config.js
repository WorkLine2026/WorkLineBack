const nodemailer = require('nodemailer');
const dns = require('dns');

// 🔴 კრიტიკულად მნიშვნელოვანია: აიძულებს მთლიან Node.js პროცესს Render-ზე,
// რომ Gmail-ის მისამართი გადათარგმნოს IPv4-ში და არა IPv6-ში.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

console.log('\n🔧 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 INITIALIZING EMAIL SERVICE (RENDER FIX)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ FATAL ERROR: EMAIL_USER or EMAIL_PASS is not set');
  process.exit(1);
}

// 🟢 გადავდივართ 587 პორტზე, რომელსაც Render არ ბლოკავს
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587-ის დროს აუცილებლად false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // უგულებელყოფს სერტიფიკატების მკაცრ შემოწმებას Render-ის შიდა ქსელში
    rejectUnauthorized: false
  }
});

// კავშირის შემოწმება გაშვებისას
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ EMAIL SERVICE VERIFICATION FAILED:', err.message);
  } else {
    console.log('✅ EMAIL SERVICE READY & VERIFIED ON RENDER ✓');
  }
});

module.exports = transporter;