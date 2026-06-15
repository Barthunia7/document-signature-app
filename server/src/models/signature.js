// models/Signature.js
const mongoose = require('mongoose');

const SignatureSchema = new mongoose.Schema({
  fieldId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // Stores the relative or absolute position on the document
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    pageNumber: { type: Number, default: 1 } 
  },
  signer: { 
    type: String, 
    required: true // e.g., User ID or Email of the signer
  },
  status: { 
    type: String, 
    enum: ['pending', 'signed'], 
    default: 'pending' 
  },
  // Day 8 Addition: Stores the Supabase public download URL
  pdfUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Signature', SignatureSchema);
