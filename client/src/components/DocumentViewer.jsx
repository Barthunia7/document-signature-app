// components/DocumentViewer.jsx
import React, { useState } from 'react';
import SignaturePlaceholder from './SignaturePlaceholder';

const DocumentViewer = () => {
  // Mocking state that would typically come from your API call
  const [signatureData, setSignatureData] = useState({
    x: 120, // Horizontal coordinate from top-left of container
    y: 250, // Vertical coordinate from top-left of container
    signer: 'john.doe@example.com',
    status: 'pending'
  });

  return (
    <div style={{ padding: '20px' }}>
      <h3>Document Preview</h3>
      
      {/* Container must be relative so absolute coordinates map directly to it */}
      <div style={{ position: 'relative', width: '600px', height: '800px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
        
        {/* Mock PDF background content */}
        <div style={{ padding: '40px', color: '#aaa' }}>
          [PDF Document Content Background Rendered via react-pdf]
        </div>

        {/* Display signature placeholder on PDF */}
        <SignaturePlaceholder 
          x={signatureData.x} 
          y={signatureData.y} 
          signer={signatureData.signer} 
          status={signatureData.status} 
        />
        
      </div>
    </div>
  );
};

export default DocumentViewer;
