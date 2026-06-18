
const mongoose = require('mongoose');

const VaultSignatureSchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    required: true 
  }, // Ties this specific drawn layout to the logged-in user account
  name: { 
    type: String, 
    required: true 
  }, // Profile name label (e.g. "Primary Legal Initials", "Formal Check Stamp")
  url: { 
    type: String, 
    required: true 
  }, // Holds the raw interactive Base64 image data string payload
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Use existing model instance compilation catch checks safely
module.exports = mongoose.models.VaultSignature || mongoose.model('VaultSignature', VaultSignatureSchema);
