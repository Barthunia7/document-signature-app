const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define Document Status Schema
const DocumentStatusSchema = new mongoose.Schema({
  documentId: { type: String, required: true },
  signerEmail: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Signed', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const DocumentStatus = mongoose.models.DocumentStatus || mongoose.model('DocumentStatus', DocumentStatusSchema);

// ✅ ADDED: Endpoint to initialize status to Pending 
router.post('/api/status/init', async (req, res) => {
  try {
    const { documentId, signerEmail } = req.body;
    
    const record = await DocumentStatus.findOneAndUpdate(
      { documentId },
      { signerEmail, status: 'Pending', rejectionReason: '', updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    return res.status(200).json({ message: 'Document status initialized to Pending', data: record });
  } catch (error) {
    console.error("Day 11 Init DB Fault:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint: Mandatory Reject Option (Allows signer to decline with a reason)
router.post('/api/status/reject', async (req, res) => {
  try {
    const { documentId, reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: 'A valid reason is required to reject signature requests' });
    }

    const record = await DocumentStatus.findOneAndUpdate(
      { documentId },
      { status: 'Rejected', rejectionReason: reason, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Document signature request actively rejected', data: record });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint: Update status to Signed (Triggered upon file generation completion)
router.post('/api/status/sign', async (req, res) => {
  try {
    const { documentId } = req.body;
    const record = await DocumentStatus.findOneAndUpdate(
      { documentId },
      { status: 'Signed', updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ message: 'Document status updated to Signed', data: record });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint: Fetch active signature state
router.get('/api/status/:documentId', async (req, res) => {
  try {
    const record = await DocumentStatus.findOne({ documentId: req.params.documentId });
    if (!record) return res.status(404).json({ error: 'No status record tracked for this ID' });
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
