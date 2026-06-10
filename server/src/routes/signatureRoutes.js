// routes/signatures.js
const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');

// Route to save or update signature positions (x, y)
router.post('/', async (req, res) => {
  const { fieldId, coordinates, signer, status } = req.body;

  if (!fieldId || !coordinates || !signer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Upsert mechanism: Updates if fieldId exists, creates if it doesn't
    const updatedSignature = await Signature.findOneAndUpdate(
      { fieldId },
      { coordinates, signer, status },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      data: updatedSignature 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
