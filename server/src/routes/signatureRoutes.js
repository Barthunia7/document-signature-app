const express = require('express');
const router = express.Router();
// Import brand new dedicated model cleanly
const VaultSignature = require('../models/vaultSignature');

// Endpoint 1: Save a newly hand-drawn signature straight into the user's collection vault
router.post('/api/signatures/add', async (req, res) => {
  try {
    const { userEmail, name, url } = req.body;
    if (!userEmail || !url) {
      return res.status(400).json({ error: "Missing mandatory account email or base64 image data parameters." });
    }

    const savedProfile = new VaultSignature({
      userEmail: userEmail.toLowerCase().trim(),
      name: name || `Saved Profile (${new Date().toLocaleDateString()})`,
      url
    });

    await savedProfile.save();
    return res.status(201).json({ message: "Signature successfully pinned to your account vault!", data: savedProfile });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: Fetch all matching signatures saved by the logged-in user account profile
router.get('/api/signatures/vault/:userEmail', async (req, res) => {
  try {
    const email = req.params.userEmail.toLowerCase().trim();
    const accountsDeck = await VaultSignature.find({ userEmail: email });
    
    return res.status(200).json(accountsDeck);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
