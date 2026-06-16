const express = require('express');
const router = express.Router();
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

router.post('/api/sign-pdf', async (req, res) => {
  try {
    const { signatureImage, xPosition, yPosition, customPdf, targetPageNumber } = req.body;

    if (!signatureImage) {
      return res.status(400).json({ error: 'Missing signature image payload data' });
    }

        let pdfDoc;

    // --- DISTINCT MULTI-DOCUMENT ARCHITECTURE ---
    if (customPdf && typeof customPdf === 'string' && customPdf.startsWith('data:application/pdf;base64,') && customPdf.length > 500) {
      // Dynamic user upload channel (such as training letter file)
      const pdfBase64Data = customPdf.replace(/^data:application\/pdf;base64,/, "");
      const pdfBuffer = Buffer.from(pdfBase64Data, 'base64');
      pdfDoc = await PDFDocument.load(pdfBuffer);
    } else {
      // Create a fresh canvas to inject custom programmatic layouts based on the active card ID
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage(); 
      
      // Outer layout border box
      page.drawRectangle({ x: 20, y: 20, width: 572, height: 752, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });

      const currentDocId = req.headers['x-document-id'] || req.body.documentId || '';

      if (currentDocId === 'doc_102') {
        // Unique Layout 1: NDA Contract
        page.drawText('MUTUAL NON-DISCLOSURE AGREEMENT', { x: 50, y: 700, size: 18, color: rgb(0.1, 0.1, 0.1) });
        page.drawText('This layout governs structural safety protocols for source code keys...', { x: 50, y: 660, size: 11, color: rgb(0.3, 0.3, 0.3) });
        page.drawText('NDA Recipient Signature Area:', { x: 50, y: 310, size: 12, color: rgb(0.2, 0.2, 0.2) });

      } else if (currentDocId === 'doc_103') {
        // Unique Layout 2: Rental Lease
        page.drawText('COMMERCIAL OFFICE RENTAL LEASE', { x: 50, y: 700, size: 18, color: rgb(0.1, 0.2, 0.4) });
        page.drawText('This structural contract validates office tenancy conditions and rent rates...', { x: 50, y: 660, size: 11, color: rgb(0.3, 0.3, 0.3) });
        page.drawText('Tenant Agreement Signature Area:', { x: 50, y: 310, size: 12, color: rgb(0.2, 0.2, 0.2) });

      } else {
        // Unique Layout 3: Standard Training Letter fallback
        page.drawText('SUMMER TRAINING AUTHENTICATION LETTER', { x: 50, y: 700, size: 18, color: rgb(0.1, 0.5, 0.2) });
        page.drawText('This serves as documentation for verified software engineering internships...', { x: 50, y: 660, size: 11, color: rgb(0.3, 0.3, 0.3) });
        page.drawText('Authorized Signature Placement Area:', { x: 50, y: 310, size: 12, color: rgb(0.2, 0.2, 0.2) });
      }
    }

       // Capture pages array reference safely
    const pages = pdfDoc.getPages();
    const totalPagesCount = pages.length;

    // Convert human 1-base to index 0 element offsets
    let pageIndex = (parseInt(targetPageNumber, 10) || 1) - 1;
    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex >= totalPagesCount) pageIndex = totalPagesCount - 1;

    // Target the specific validated page array index channel
    const targetPage = pages[pageIndex]; 
    const { width: pdfPageWidth, height: pdfPageHeight } = targetPage.getSize();

    // ✅ FIX: Standardize scaling parameters using the layout width metrics (600px workspace)
    const scaleX = pdfPageWidth / 600;

    // Force explicit aspect ratios based on the target page width to prevent compression
    const absoluteSignatureWidth = 150 * scaleX;
    const absoluteSignatureHeight = 50 * scaleX; 

    // ✅ FIXED MATH: Scale the Y drag position cleanly relative to the actual active page height bounds
    const finalX = parseFloat(xPosition) * scaleX;
    const finalY = pdfPageHeight - (parseFloat(yPosition) * scaleX) - absoluteSignatureHeight;


    // --- EXECUTE SIGNING STAMP GENERATION ---
    if (signatureImage.includes('image/svg+xml')) {
      let signatureText = "Signed";
      try {
        const decodedUri = decodeURIComponent(signatureImage);
        const textExtract = decodedUri.match(/<text[^>]*>([\s\S]*?)<\/text>/);
        if (textExtract && textExtract) {
          signatureText = textExtract.trim();
        }
      } catch (e) { console.warn("SVG extraction fallback active", e.message); }

      targetPage.drawText(signatureText, { x: finalX + 15, y: finalY + 15, size: 24, color: rgb(0, 0, 0) });
    } else {
      const base64Data = signatureImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      const signatureBuffer = Buffer.from(base64Data, 'base64');
      
      let embeddedSignatureImage;
      if (signatureImage.includes('image/jpeg') || signatureImage.includes('image/jpg')) {
        embeddedSignatureImage = await pdfDoc.embedJpg(signatureBuffer);
      } else {
        embeddedSignatureImage = await pdfDoc.embedPng(signatureBuffer);
      }

      targetPage.drawImage(embeddedSignatureImage, { x: finalX, y: finalY, width: absoluteSignatureWidth, height: absoluteSignatureHeight });
    }

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=final_signed_document.pdf');
    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Day 8 Compiler Error:', error);
    return res.status(500).json({ error: 'Server failed to stitch or process custom PDF output.' });
  }
});

module.exports = router;
