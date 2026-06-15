// 1. Load configuration first before any other imports!
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// =========================================================
// 🌐 GLOBAL MIDDLEWARE & SECURITY CONFIGURATIONS (MUST BE FIRST)
// =========================================================
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Handle large signature strings safely

// Log incoming requests for developer visibility
app.use((req, res, next) => {
  console.log(`📡 Incoming Request Event: [${req.method}] to path: ${req.url}`);
  next();
});

// =========================================================
// 🚀 MOUNT SYSTEM ROUTERS (LOADED SAFELY AFTER CORS)
// =========================================================
// Day 11 Status Router
const statusRouter = require('./routes/statusRouter');
app.use(statusRouter); 

// Day 10 Audit Log Middleware & Routes
const { auditRouter, logAuditTrailMiddleware } = require('./routes/auditRouter');
app.use(logAuditTrailMiddleware);
app.use(auditRouter);

// Core Transaction Routers
const emailRouter = require('./routes/emailRouter');
app.use(emailRouter);

const pdfRouter = require('./routes/pdfRouter');
app.use(pdfRouter);

// =========================================================
// 📦 EXTERNAL INTEGRATIONS & FEATURE ROUTES
// =========================================================
// Test Supabase Connection on startup
const supabase = require('./config/supabase');
async function testSupabase() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('❌ Supabase Storage connection failed:', error.message);
  } else {
    console.log('✅ Supabase Storage initialized successfully!');
  }
}
testSupabase();

app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const documentRoutes = require('./routes/documentRoutes');
app.use('/api/docs', documentRoutes);

const signatureRoutes = require('./routes/signatureRoutes'); 
app.use('/api/signatures', signatureRoutes); 

// Fallback Documents Tracker Mock Endpoint
app.get('/api/documents', async (req, res) => {
    try {
        const mockDocuments = [
            { id: "1", name: "Sample_Contract.pdf", url: "https://localhost:5000/test.pdf" },
            { id: "2", name: "Rental_Agreement.pdf", url: "https://localhost:5000/test.pdf" }
        ];
        res.json(mockDocuments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});

// Core Diagnostic Test Routes
app.get('/test', (req, res) => {
  res.json({ message: "Server is up and running smoothly!" });
});

app.get('/', (req, res) => {
  res.send('Backend Working');
});

// Database Connection & Server Startup
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
