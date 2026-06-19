// 1. Load configuration first before any other imports!
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
// =========================================================
// 🌐 GLOBAL MIDDLEWARE & SECURITY CONFIGURATIONS
// =========================================================

// Dynamically handle allowed URLs from Render Environment Settings
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow local development tools (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy configuration'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));


// Log incoming requests for developer visibility
app.use((req, res, next) => {
  console.log(`📡 Incoming Request Event: [${req.method}] to path: ${req.url}`);
  next();
});

// Serve static assets safely
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================
// 📦 EXTERNAL INTEGRATIONS (Supabase Startup Check)
// =========================================================
const supabase = require('./config/supabase');
async function testSupabase() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    console.log('✅ Supabase Storage initialized successfully!');
  } catch (error) {
    console.error('❌ Supabase Storage connection failed:', error.message);
  }
}
testSupabase();

// =========================================================
// 🚀 MOUNT SYSTEM ROUTERS (Ordered by responsibility)
// =========================================================

// Global Diagnostics & Health Checks
app.get('/test', (req, res) => res.json({ message: "Server is up and running smoothly!" }));
app.get('/', (req, res) => res.send('Backend Working'));

// Day 11 Status Router
const statusRouter = require('./routes/statusRouter');
app.use(statusRouter); 

// Day 10 Audit Log Middleware & Routes 
const { auditRouter, logAuditTrailMiddleware } = require('./routes/auditRouter');
app.use(auditRouter);
// Note: Apply logAuditTrailMiddleware inside specific routers or below this line 
// to prevent it from intercepting standard health checks if needed.
app.use(logAuditTrailMiddleware);

// Core Transaction Routers
const emailRouter = require('./routes/emailRouter');
const pdfRouter = require('./routes/pdfRouter');
app.use(emailRouter);
app.use(pdfRouter);

// Authentication & Core Domain API Routes
const authRoutes = require('./routes/authRoutes');
const signatureRoutes = require('./routes/signatureRoutes'); 
app.use('/api/auth', authRoutes);
app.use('/api/signatures', signatureRoutes); 

// Document Routes Management 
// (Ensure your local mock data route logic matches or resides cleanly inside documentRoutes.js)
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/docs', documentRoutes);

// =========================================================
// 🛡️ GLOBAL ERROR HANDLING MIDDLEWARE (MUST BE LAST)
// =========================================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// =========================================================
// 🗄️ DATABASE CONNECTION & SERVER STARTUP
// =========================================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("Checking DB URI:", MONGO_URI ? "Found" : "NOT FOUND (Typo in .env)");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("🚀 Connected to MongoDB successfully!");
    app.listen(PORT, () => {
      console.log(`📡 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
