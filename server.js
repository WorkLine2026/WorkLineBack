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
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? '✅ SET (' + process.env.GMAIL_PASSWORD.length + ' chars)' : '❌ MISSING');
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ SET' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'ℹ️ Not set (using default)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ═══════════════════════════════════════════════════════════════
// Dependencies
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// 💡 Routes — სრულად გასწორებული Linux-ისთვის (პატარა ასოებით):
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');           // <-- დიდი "R"
const workerRoutes = require('./src/routes/worker.routes');    
const jobRequestRoutes = require('./src/routes/Jobrequest.routes'); // <-- გასწორდა პატარა j-თი!

// ═══════════════════════════════════════════════════════════════
// App setup
// ═══════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════
// Middleware - CORS დაკონფიგურირება (trailing slash მოსწორებული)
// ═══════════════════════════════════════════════════════════════
// 🔧 ამოშორებს trailing slash FRONTEND_URL-დან
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      FRONTEND_URL,                    // Production Frontend
      'http://localhost:4200',         // Development (Angular)
      'http://localhost:3000',         // Development (other)
    ];
    
    // ✅ აძლევს CORS-ს თუ origin 허용ებულია ან არ არის (preflight)
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
    emailService: process.env.EMAIL_SERVICE,
    adminEmail: process.env.ADMIN_EMAIL,
    frontendUrl: FRONTEND_URL,
  });
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
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD ? '✅ SET' : '❌ MISSING',
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
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
    console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE || 'not configured'}`);
    console.log(`👤 Admin Email: ${process.env.ADMIN_EMAIL || 'not configured'}`);
    console.log(`✅ CORS allowed from: ${FRONTEND_URL}`);
    console.log(`🔗 Debug: http://localhost:${PORT}/api/debug/env`);
  });
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

module.exports = app;