const path = require('path');
const fs = require('fs');
const { generateSignedPDF } = require('./src/services/pdfService');

// A 1x1 pixel transparent PNG base64 string to simulate a signature image
const sampleBase64Signature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Coordinates where you want the signature to appear on the PDF page
const mockCoordinates = { x: 150, y: 200 };
const templateFile = 'ID_CARD.pdf';

async function runTest() {
  console.log('🚀 Starting PDF Generation Test...');

  // 1. Verify template exists
  const templatePath = path.join(__dirname, 'uploads', templateFile);
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Error: Could not find template file at: ${templatePath}`);
    console.log('💡 Please make sure "ID_CARD.pdf" is placed inside your "server/uploads" folder.');
    return;
  }

  try {
    // 2. Execute service function
    const resultPath = await generateSignedPDF(templateFile, sampleBase64Signature, mockCoordinates);
    
    console.log('\n✅ Success! Signed PDF generated.');
    console.log(`📂 Saved to: ${resultPath}`);
    console.log('💡 Check your "server/uploads" folder to see the new signed_ file!');
  } catch (error) {
    console.error('\n❌ Test Failed with error:', error.message);
  }
}

runTest();
