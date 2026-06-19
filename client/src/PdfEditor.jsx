import React, { useState, useRef } from 'react';

export default function PdfEditor() {
  const [signaturePosition, setSignaturePosition] = useState(null);
  const containerRef = useRef(null);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", "signature-overlay");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Convert absolute pixel layout into percentage coordinate weights
    const xPercent = (rawX / rect.width) * 100;
    const yPercent = (rawY / rect.height) * 100;

    setSignaturePosition({ xPercent, yPercent });
    sendSignatureToServer(xPercent, yPercent);
  };

  const sendSignatureToServer = async (x, y) => {
  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/signatures`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: "document_101", 
          coordinates: {
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2))
          },
          signer: "Primary Signer",
          status: "pending"
        })
      });
      const result = await response.json();
      console.log("Server verification status:", result);
    } catch (error) {
      console.error("Failed connection to signature server:", error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px' }}>
      {/* Sidebar Tool Component */}
      <div>
        <h3 style={{ color: '#fff' }}>Tools</h3>
        <div 
          draggable 
          onDragStart={handleDragStart}
          style={{ 
            padding: '12px', 
            background: '#007bff', 
            color: 'white', 
            cursor: 'grab',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          Signature Field ⠿
        </div>
      </div>

      {/* Main Sandbox Layout Area */}
      <div>
        <h3 style={{ color: '#fff' }}>PDF Display Window</h3>
        <div 
          ref={containerRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ 
            position: 'relative', 
            width: '500px', 
            height: '650px', 
            backgroundColor: '#ffffff',
            border: '2px solid #dee2e6',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ textAlign: 'center', paddingTop: '40%', color: '#6c757d' }}>
            [ PDF Content Layer Container ]
          </div>

          {signaturePosition && (
            <div style={{
              position: 'absolute',
              left: `${signaturePosition.xPercent}%`,
              top: `${signaturePosition.yPercent}%`,
              transform: 'translate(-50%, -50%)', 
              border: '2px dashed #28a745',
              background: 'rgba(40, 167, 69, 0.15)',
              padding: '8px',
              borderRadius: '4px',
              color: '#1e7e34',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              ✗ Sign Here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
