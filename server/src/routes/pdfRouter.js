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

    // --- COMPREHENSIVE MULTI-SOURCE DOCUMENT PARSER ---
    if (customPdf && customPdf.startsWith('data:application/pdf;base64,')) {
      const pdfBase64Data = customPdf.replace(/^data:application\/pdf;base64,/, "");
      const pdfBuffer = Buffer.from(pdfBase64Data, 'base64');
      pdfDoc = await PDFDocument.load(pdfBuffer);
    } else {
      const assetsDir = path.join(__dirname, '../assets');
      const templatePath = path.join(assetsDir, 'template.pdf');

      if (fs.existsSync(templatePath)) {
        const existingPdfBytes = fs.readFileSync(templatePath);
        pdfDoc = await PDFDocument.load(existingPdfBytes);
      } else {
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(); 
        page.drawRectangle({ x: 20, y: 20, width: 572, height: 752, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
        page.drawText('MUTUAL NON-DISCLOSURE AGREEMENT', { x: 50, y: 700, size: 18, color: rgb(0.1, 0.1, 0.1) });
        page.drawText('This structural document governs the security requirements for software architectures...', { x: 50, y: 660, size: 11, color: rgb(0.3, 0.3, 0.3) });
        page.drawText('Authorized Signature Placement Area:', { x: 50, y: 310, size: 12, color: rgb(0.2, 0.2, 0.2) });
      }
    }

    // Capture pages array reference
    const pages = pdfDoc.getPages();
    const totalPagesCount = pages.length;

    // ✅ INPUT PAGE INDEX SAFETY VALIDATOR:
    // Convert 1-based human indexing (e.g. Page 7) to 0-based computer indexing (e.g. index 6)
    let pageIndex = (parseInt(targetPageNumber, 10) || 1) - 1;

    // Boundary containment fallback: ensure pageIndex stays within actual constraints
    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex >= totalPagesCount) pageIndex = totalPagesCount - 1;

    // Target the specific validated page array index channel
    const targetPage = pages[pageIndex]; 
    const { width: pdfPageWidth, height: pdfPageHeight } = targetPage.getSize();

    // Mapping browser pixel configurations onto physical target coordinates
    const scaleX = pdfPageWidth / 600;
    const absoluteSignatureWidth = 150 * scaleX;
    const absoluteSignatureHeight = 50 * scaleX; 

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
