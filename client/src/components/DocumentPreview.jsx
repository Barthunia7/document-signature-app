import React from 'react';

export default function DocumentPreview({ fileUrl }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', minHeight: '550px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#333', borderBottom: '20px' }}>Document Preview</h3>
      
      {fileUrl ? (
        /* Styled Simulated Document Frame Component */
        <div style={{ border: '1px solid #ddd', padding: '30px', background: '#fafafa', borderRadius: '4px', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Header Area */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 'bold', color: '#0070f3', fontSize: '14px' }}>✓ Secure Document Loader</span>
              <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Page 1 of 1</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '25px' }} />
            
            {/* Content Mock Rows representing contract text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ height: '24px', background: '#333', borderRadius: '4px', width: '60%', fontWeight: 'bold', color: '#fff', padding: '4px 8px', fontSize: '13px' }}>STANDARD MUTUAL AGREEMENT</div>
              <div style={{ height: '14px', background: '#e0e0e0', borderRadius: '4px', width: '95%', marginTop: '10px' }}></div>
              <div style={{ height: '14px', background: '#e0e0e0', borderRadius: '4px', width: '90%' }}></div>
              <div style={{ height: '14px', background: '#e0e0e0', borderRadius: '4px', width: '85%' }}></div>
              <div style={{ height: '14px', background: '#e0e0e0', borderRadius: '4px', width: '40%' }}></div>
            </div>
          </div>

          {/* Footer Area for signatures (Prepares your UI layout for Day 5) */}
          <div style={{ marginTop: '50px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>TARGET FILE PATH: <span style={{ fontFamily: 'monospace', color: '#555' }}>{fileUrl}</span></p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, border: '1px dashed #b0bec5', height: '60px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eceff1', color: '#78909c', fontSize: '12px' }}>
                Signee Initials
              </div>
              <div style={{ flex: 1, border: '1px dashed #b0bec5', height: '60px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eceff1', color: '#78909c', fontSize: '12px' }}>
                Date Window
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', border: '2px dashed #eee', borderRadius: '4px' }}>
          <p style={{ color: '#999', textAlign: 'center' }}>👋 Select a document from the dashboard list<br/>on the left to trigger the view panel.</p>
        </div>
      )}
    </div>
  );
}
