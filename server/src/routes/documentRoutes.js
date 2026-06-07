const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Verify your Day 2 filename
const upload = require('../middleware/uploadMiddleware');
const Document = require('../models/document');

router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file received or target is not a PDF' });
    }

    const newDocument = new Document({
      userId: req.user,
      fileName: req.file.originalname,
      filePath: req.file.path 
    });

    await newDocument.save();

    return res.status(201).json({
      message: 'PDF cataloged and uploaded successfully',
      document: {
        id: newDocument._id,
        fileName: newDocument.fileName,
        status: newDocument.status
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server file system error', error: error.message });
  }
});

module.exports = router;
