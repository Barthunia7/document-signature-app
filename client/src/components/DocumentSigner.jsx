import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

export default function DocumentSigner({ signatureImage }) {
  const [coordinates, setCoordinates] = useState({ x: 150, y: 500 }); // Default starting position
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalizePlacement = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        fieldId: `field_${Date.now()}`,
        signer: "student@example.com",
        status: "signed",
        coordinates: {
          x: Math.round(coordinates.x),
          y: Math.round(coordinates.y)
        },
        signatureImage: signatureImage
      };

      const response = await fetch('http://localhost:5000/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert('🎉 Document generated successfully!');
        window.open(result.filePath, '_blank'); // Opens the fresh signed PDF from Supabase
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Drag the signature exactly over the signing box</h3>
      
      <div 
        id="pdf-container"
        style={{
          position: 'relative',
          width: '612px',  // Perfectly mirrors the 612x792 PDF canvas size
          height: '792px',
          border: '2px solid #333',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          background: '#fff',
          backgroundImage: `url('https://supabase.co')`, // Blank template preview URL
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Rnd
          bounds="#pdf-container"
          size={{ width: 110, height: 35 }}
          position={{ x: coordinates.x, y: coordinates.y }}
          onDragStop={(e, d) => setCoordinates({ x: d.x, y: d.y })}
          style={{
            border: '2px dashed #0070f3',
            background: 'rgba(0, 112, 243, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move'
          }}
        >
          <img src={signatureImage} alt="Signature" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
        </Rnd>
      </div>

      <button
        onClick={handleFinalizePlacement}
        disabled={isSubmitting}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          background: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {isSubmitting ? 'Uploading to Supabase...' : 'Lock Placement & Save PDF'}
      </button>
    </div>
  );
}
