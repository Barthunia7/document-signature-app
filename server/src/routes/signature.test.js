const express = require('express');
const router = express.Router();
const { generateSignedPDF } = require('../services/pdfService');

router.post('/', async (req, res) => {
  const { fieldId, coordinates, signer, status, signatureImage } = req.body;

  if (!fieldId || !coordinates || !signer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const templateName = 'ID_CARD.pdf'; 
    let signedFilePath = null;

    if (signatureImage) {
      signedFilePath = await generateSignedPDF(
        templateName, 
        signatureImage, 
        coordinates
      );
    }

    res.status(200).json({ 
      success: true, 
      filePath: signedFilePath 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
