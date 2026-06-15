// 1. Load configuration first before any other imports!
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Initialize Express app
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit to handle large base64 signature images safely


const pdfRouter = require('./routes/pdfRouter');
app.use(pdfRouter);


app.use((req, res, next) => {
  console.log(`📡 Incoming Request Event: [${req.method}] to path: ${req.url}`);
  next();
});

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
// Import & Mount Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);// Import the routes (adjusting the path to point to your routes folder)

const documentRoutes = require('./routes/documentRoutes');

// Mount the routes onto active express application instance
app.use('/api/docs', documentRoutes);

//const router = express.Router();

const signatureRoutes = require('./routes/signatureRoutes'); 
app.use('/api/signatures', signatureRoutes); 


// Test Route
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

app.get('/api/documents', async (req, res) => {
    try {
        // Mock data to test with before connecting database
        const mockDocuments = [
            { id: "1", name: "Sample_Contract.pdf", url: "https://localhost:5000/test.pdf" },
            { id: "2", name: "Rental_Agreement.pdf", url: "https://localhost:5000/test.pdf" }
        ];
        
        // Send the file list back to the frontend
        res.json(mockDocuments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});
