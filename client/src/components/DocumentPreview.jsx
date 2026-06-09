import React from 'react';

const DocumentPreview = () => {
  // 1. Mock state tracking the data coordinates we saved in Day 5 database
  const signatureData = {
    x: 150, // Coordinates verified in MongoDB
    y: 120,
    signer: "john.doe@example.com",
    status: "pending"
  };

  // 2. Custom inline styles for our absolute placeholder box
  const placeholderStyle = {
    position: 'absolute',
    left: `${signatureData.x}px`,
    top: `${signatureData.y}px`,
    width: '140px',
    height: '45px',
    border: '2px dashed #4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#4A90E2',
    fontWeight: 'bold',
    zIndex: 10,
    pointerEvents: 'none' // Allows clicking elements underneath it
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
        Document Preview
      </h3>

      {/* CRUCIAL: The parent container MUST have position: 'relative' 
          so the coordinates scale inside the box instead of the whole web page */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '500px', 
        border: '1px dashed #ccc', 
        borderRadius: '8px',
        backgroundColor: '#fff'
      }}>
        
        {/* Placeholder signature box rendered on top of the document layout context */}
        <div style={placeholderStyle}>
          <span>Sign Here</span>
          <span style={{ fontSize: '9px', fontWeight: 'normal', color: '#666' }}>
            {signatureData.signer}
          </span>
        </div>

        {/* Existing text or loading message inside your container */}
        <div style={{ 
          display: 'flex', 
          height: '100%', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#aaa' 
        }}>
          📝 Document canvas layer background...
        </div>

      </div>
    </div>
  );
};

export default DocumentPreview;
