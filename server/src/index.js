// 1. Load configuration first before any other imports!
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Import & Mount Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Test Route
app.get('/test', (req, res) => {
  res.json({ message: "Server is up and running smoothly!" });
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
