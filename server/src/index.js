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

// ✅ DAY 12 ALIGNMENT: Expose /api/docs endpoint matching frontend fetch exactly
app.get('/api/docs', async (req, res) => {
    try {
        const mockDocuments = [
            { id: "doc_kiran_training_2026", name: "Kiran Saini Summer Training Letter.pdf", type: "Letter" },
            { id: "doc_102", name: "Mutual Non-Disclosure Agreement.pdf", type: "Contract" },
            { id: "doc_103", name: "Commercial Office Rental Lease.pdf", type: "Agreement" }
        ];
        
        // Send the complete array back to the frontend dashboard console
        return res.json(mockDocuments);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch document templates registry" });
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
