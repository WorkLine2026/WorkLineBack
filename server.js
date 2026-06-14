// ═══════════════════════════════════════════════════════════════
// 🔐 .env ჯერ უნდა ჩატვირთოს (ყველა სხვამდე!)
// ═══════════════════════════════════════════════════════════════
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════
// 🔧 Debug: .env ჩატვირთულია?
// ═══════════════════════════════════════════════════════════════
console.log('\n🔍 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 ENV ცვლადები:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PORT:', process.env.PORT || '3000');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('📧 EMAIL_PASSWORD:', process.env.EMAIL_PASS ? '✅ SET (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ MISSING');
console.log('📧 SENDER_EMAIL:', process.env.SENDER_EMAIL);
console.log('📧 ADMIN_EMAILS:', process.env.ADMIN_EMAILS);
console.log('📱 SMSOFFICE_API_KEY:', process.env.SMSOFFICE_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('📱 SMSOFFICE_SENDER:', process.env.SMSOFFICE_SENDER || 'WorkLine (default)');
console.log('🗄️  MONGO_URI:', process.env.MONGO_URI ? '✅ SET' : '❌ MISSING');
console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL || 'ℹ️ Not set (using default)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ═══════════════════════════════════════════════════════════════
// Dependencies
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// 💡 Routes — სრულად გასწორებული Linux-ისთვის (პატარა ასოებით):
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const workerRoutes = require('./src/routes/worker.routes');
const jobRequestRoutes = require('./src/routes/Jobrequest.routes');

// ═══════════════════════════════════════════════════════════════
// App setup
// ═══════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════
// Middleware - CORS დაკონფიგურირება (trailing slash მოსწორებული)
// ═══════════════════════════════════════════════════════════════
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:4200',
      'http://localhost:3000',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS denied for origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/job-requests', jobRequestRoutes);

// ═══════════════════════════════════════════════════════════════
// Health check
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    emailService: process.env.EMAIL_USER ? '✅ Gmail' : '❌ Not configured',
    adminEmail: process.env.ADMIN_EMAILS,
    smsService: process.env.SMSOFFICE_API_KEY ? '✅ smsoffice.ge' : '❌ Not configured',
    frontendUrl: FRONTEND_URL,
  });
});

// ═══════════════════════════════════════════════════════════════
// 🧪 EMAIL TEST ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendVerificationEmail } = require('./src/services/email.service');
    
    const testEmail = req.query.email || process.env.EMAIL_USER;
    
    console.log('\n🧪 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 EMAIL SERVICE TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Sending test email to:', testEmail);
    
    await sendVerificationEmail(testEmail, '123456');
    
    console.log('✅ Test email sent successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({ 
      success: true, 
      message: 'Email test successful!',
      sentTo: testEmail
    });
    
  } catch (err) {
    console.error('\n🧪 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🧪 EMAIL TEST FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      hint: 'Check .env file: EMAIL_USER and EMAIL_PASS must be correct'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 📱 SMS TEST ENDPOINT (smsoffice.ge)
// ═══════════════════════════════════════════════════════════════
app.get('/api/test-sms', async (req, res) => {
  try {
    // ✅ smsoffice.ge კონფიგურაცია შემოწმება
    if (!process.env.SMSOFFICE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'smsoffice.ge API Key არ არის კონფიგურირებული',
        required: ['SMSOFFICE_API_KEY'],
      });
    }

    const { sendVerificationSMS } = require('./src/services/sms.service');
    
    const testPhone = req.query.phone || '+995591234567'; // დეფოლტი: test ნომერი
    
    console.log('\n🧪 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 SMS SERVICE TEST (smsoffice.ge)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Sending test SMS to:', testPhone);
    console.log('📱 Sender:', process.env.SMSOFFICE_SENDER || 'WorkLine');
    
    await sendVerificationSMS(testPhone, '654321');
    
    console.log('✅ Test SMS sent successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({ 
      success: true, 
      message: 'SMS test successful!',
      sentTo: testPhone,
      from: process.env.SMSOFFICE_SENDER || 'WorkLine',
      service: 'smsoffice.ge'
    });
    
  } catch (err) {
    console.error('\n🧪 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🧪 SMS TEST FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      hint: 'Check .env file: SMSOFFICE_API_KEY must be correct'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 🔧 Debug (დეველოპმენტი მხოლოდ)
// ═══════════════════════════════════════════════════════════════
app.get('/api/debug/env', (_, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.json({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASS ? '✅ SET' : '❌ MISSING',
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    SMSOFFICE_API_KEY: process.env.SMSOFFICE_API_KEY ? '✅ SET' : '❌ MISSING',
    SMSOFFICE_SENDER: process.env.SMSOFFICE_SENDER || 'WorkLine (default)',
    FRONTEND_URL: FRONTEND_URL,
  });
});

// ═══════════════════════════════════════════════════════════════
// 404 Handler
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} ვერ მოიძებნა` });
});

// ═══════════════════════════════════════════════════════════════
// Error Handler
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ message: 'სერვერის შეცდომა' });
});

// ═══════════════════════════════════════════════════════════════
// Start server
// ═══════════════════════════════════════════════════════════════
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 WorkLine API running → http://localhost:${PORT}`);
    console.log(`📧 Email Service: ${process.env.EMAIL_USER || 'not configured'}`);
    console.log(`📱 SMS Service: smsoffice.ge (${process.env.SMSOFFICE_API_KEY ? '✅' : '❌'} configured)`);
    console.log(`👤 Admin Emails: ${process.env.ADMIN_EMAILS || 'not configured'}`);
    console.log(`✅ CORS allowed from: ${FRONTEND_URL}`);
    console.log(`\n🧪 Test Endpoints:`);
    console.log(`   📧 Email: http://localhost:${PORT}/api/test-email?email=your@email.com`);
    console.log(`   📱 SMS:   http://localhost:${PORT}/api/test-sms?phone=+995591234567`);
    console.log(`   🔍 Debug: http://localhost:${PORT}/api/debug/env`);
  });
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

module.exports = app;