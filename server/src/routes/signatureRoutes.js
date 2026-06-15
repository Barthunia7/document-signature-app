const express = require('express');
const router = express.Router();
const { generateSignedPDF } = require('../services/pdfService');

router.post('/', async (req, res) => {
  try {
    const { fieldId, coordinates, signer, status, signatureImage } = req.body;

    if (!fieldId || !coordinates || !signer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const templateName = 'ID_CARD.pdf'; 
    let signedFilePath = null;

    if (signatureImage) {
      signedFilePath = await generateSignedPDF(
        templateName, 
        signatureImage, 
        coordinates
      );
    }

    return res.status(200).json({ 
      success: true, 
      filePath: signedFilePath 
    });
  } catch (error) {
    console.error("❌ Route Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
