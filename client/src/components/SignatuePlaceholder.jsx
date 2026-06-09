// components/SignaturePlaceholder.jsx
import React from 'react';

const SignaturePlaceholder = ({ x, y, signer, status }) => {
  // Styles for absolute positioning on top of the PDF container
  const placeholderStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '150px',
    height: '50px',
    border: status === 'signed' ? '2px solid green' : '2px dashed #4A90E2',
    backgroundColor: status === 'signed' ? 'rgba(0, 128, 0, 0.1)' : 'rgba(74, 144, 226, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    userSelect: 'none',
    zIndex: 10
  };

  return (
    <div style={placeholderStyle}>
      <span style={{ fontWeight: 'bold' }}>Sign Here</span>
      <span style={{ fontSize: '10px', color: '#666' }}>{signer}</span>
    </div>
  );
};

export default SignaturePlaceholder;
