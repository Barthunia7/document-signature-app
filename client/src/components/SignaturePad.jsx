import React, { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onSaveSignature }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000'; // Black stroke color
    ctx.lineWidth = 3;           // Smooth line thickness
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Get mouse or touch coordinates relative to canvas boundaries
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support both desktop mouse and mobile touch inputs
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleConfirmSignature = () => {
    const canvas = canvasRef.current;
    
    // Check if the canvas is completely blank before saving
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert("Please provide a signature stroke before saving.");
      return;
    }

    // Capture the custom canvas signature directly as a Base64 PNG data URL string
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div style={{ border: '2px dashed #007bff', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleClear} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#eee', border: 'none', borderRadius: '4px' }}>
          Clear Pad
        </button>
        <button onClick={handleConfirmSignature} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Use This Signature
        </button>
      </div>
    </div>
  );
}
