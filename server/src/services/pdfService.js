const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

/**
 * Generates a signed PDF and uploads it directly to Supabase Cloud Storage.
 */
async function generateSignedPDF(templateName, base64Signature, coordinates) {
  try {
    const rootDir = process.cwd(); 
    const templatePath = path.join(rootDir, 'uploads', templateName);
    const uniqueFileName = `signed_${Date.now()}_${templateName}`;

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file missing at: ${templatePath}`);
    }

    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; // Secure target page array index position

    const { width: pageWidth, height: pageHeight } = firstPage.getSize();

    // 1. Production Mapping: Convert web-canvas coordinates cleanly
    const inputX = parseFloat(coordinates.x) || 210; 
    const inputY = parseFloat(coordinates.y) || 400; 
    const sigWidth = 110;
    const sigHeight = 35;

    // Convert browser top-left coordinates to PDF bottom-left coordinates
    const finalX = inputX;
    const finalY = pageHeight - inputY - sigHeight;

    // 2. Process and Draw the Real Signature Image Layer
    const cleanBase64 = base64Signature.replace(/^data:image\/png;base64,/, "").trim();
    const signatureImageBytes = Buffer.from(cleanBase64, 'base64');
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    
    firstPage.drawImage(signatureImage, {
      x: finalX,
      y: finalY,
      width: sigWidth,
      height: sigHeight,
    });

    const signedPdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(signedPdfBytes);

    const { data, error } = await supabase.storage
      .from('signed-document')
      .upload(uniqueFileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('signed-document')
      .getPublicUrl(uniqueFileName);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('❌ Error inside pdfService:', error.message);
    throw error;
  }
}

module.exports = { generateSignedPDF };
