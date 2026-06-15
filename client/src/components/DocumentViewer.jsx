import React, { useState, useRef } from 'react';

export default function DocumentViewer({ signatureSrc, customPdfSrc, onReset }) {
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [pageNumber, setPageNumber] = useState(1); // Default to page 1
  const [isSaving, setIsSaving] = useState(false);

  // Constants to match tracking specs
  const DOCUMENT_ID = 'doc_kiran_training_2026';
  const SIGNER_EMAIL = 'sainikiran7852@gmail.com';

  const handleDragEnd = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    // Keep the signature block completely inside the document view wrapper workspace
    const x = Math.max(0, Math.min(dropX - 75, rect.width - 150)); 
    const y = Math.max(0, Math.min(dropY - 25, rect.height - 50));

    setCoords({ x, y });
  };

  const handleDragOver = (e) => e.preventDefault();

  // ✅ Day 11 Workflow: Actively Decline & Reject to Sign Document Request
  const handleReject = async () => {
    const reason = prompt("Please provide a mandatory reason for rejecting this signature request:");
    if (!reason || reason.trim() === "") {
      alert("Rejection cancelled. A valid reason must be supplied to reject this document.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/status/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: DOCUMENT_ID,
          reason: reason
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reject document');

      alert(`Document Successfully Marked as Rejected.\nReason Saved: "${data.data.rejectionReason}"`);
      onReset(); // Route user back out to the home/pad setup screen
    } catch (err) {
      alert(`Error processing rejection state: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Day 8-10 Workflow: Confirm, Burn PDF, and Update State to 'Signed'
  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      // 1. Post to pdf-lib engine to generate compiled binary
      const response = await fetch('http://localhost:5000/api/sign-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Day 10 Metadata Tracking Headers
          'X-Document-Id': DOCUMENT_ID, 
          'X-Signer-Email': SIGNER_EMAIL
        },
        body: JSON.stringify({
          signatureImage: signatureSrc,
          xPosition: coords.x,
          yPosition: coords.y,
          customPdf: customPdfSrc,
          targetPageNumber: parseInt(pageNumber, 10) || 1
        })
      });

      if (!response.ok) throw new Error('Failed to compile signed PDF document layers');

      // 2. Day 11 State Transition: Mark document collection status as 'Signed' in MongoDB
      await fetch('http://localhost:5000/api/status/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: DOCUMENT_ID })
      });

      // 3. Process incoming binary data buffer file download execution
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = 'final_signed_document.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      
      alert("Document signed successfully! Your finalized PDF file has downloaded.");
    } catch (err) {
      alert(`Error processing signature layout transaction: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.viewContainer}>
      <div style={styles.actionToolbar}>
        <button onClick={onReset} style={styles.secondaryBtn} disabled={isSaving}>
          ← Redraw Signature
        </button>

        {/* Dynamic Page Selector Counter Element */}
        <div style={styles.pageSelectorWrapper}>
          <label style={styles.selectorLabel}>Target Page:</label>
          <input 
            type="number" 
            min="1" 
            value={pageNumber} 
            onChange={(e) => setPageNumber(e.target.value)} 
            style={styles.pageInput}
            disabled={isSaving}
          />
        </div>

        {/* Day 11 Accept/Decline Button Stack */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleReject} style={styles.rejectBtn} disabled={isSaving}>
            ❌ Decline Request
          </button>
          <button onClick={handleFinalSave} style={styles.primaryBtn} disabled={isSaving}>
            {isSaving ? 'Processing PDF...' : '🖋️ Sign & Finalize'}
          </button>
        </div>
      </div>

      <div ref={containerRef} onDragOver={handleDragOver} style={styles.pdfCanvasPage}>
        {/* Mock Document Page Background Frame Canvas Layer */}
        <div style={styles.documentBody}>
          <h2 style={styles.docHeader}>MUTUAL NON-DISCLOSURE AGREEMENT</h2>
          <p style={styles.docParagraph}>This structural document governs the security requirements for software architectures...</p>
          
          <div style={styles.signingTargetZone}>
            <p style={styles.signerLabel}>Authorized Signature Placement Area:</p>
            <div style={styles.targetDashedPlaceholder}></div>
          </div>
        </div>

        {/* Draggable Active Floating Signature Element Layer */}
        <div
          draggable="true"
          onDragEnd={handleDragEnd}
          style={{
            ...styles.draggableSignatureWrapper,
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
        >
          <img src={signatureSrc} alt="Live Signature Layer" style={styles.signatureImageElement} />
          <div style={styles.dragHandleIndicator}>✛ Drag Me</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  viewContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' },
  actionToolbar: { display: 'flex', gap: '16px', width: '600px', justifyContent: 'space-between', alignItems: 'center' },
  pageSelectorWrapper: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  selectorLabel: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
  pageInput: { width: '50px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' },
  primaryBtn: { padding: '12px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' },
  rejectBtn: { padding: '12px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' },
  secondaryBtn: { padding: '12px 20px', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  pdfCanvasPage: { position: 'relative', width: '600px', height: '800px', backgroundColor: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e1e4e6', borderRadius: '4px', overflow: 'hidden', userSelect: 'none' },
  documentBody: { padding: '50px', fontFamily: 'serif', color: '#222' },
  docHeader: { fontSize: '20px', textAlign: 'center', marginBottom: '40px', letterSpacing: '1px' },
  docParagraph: { fontSize: '14px', lineHeight: '1.8', marginBottom: '24px', textAlign: 'justify' },
  signingTargetZone: { marginTop: '400px' },
  signerLabel: { fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px' },
  targetDashedPlaceholder: { width: '220px', height: '60px', borderBottom: '2px dashed #bbb' },
  draggableSignatureWrapper: { position: 'absolute', width: '150px', height: '60px', cursor: 'move', border: '2px dashed #007bff', backgroundColor: 'rgba(0, 123, 255, 0.08)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  signatureImageElement: { width: '100%', height: '80%', objectFit: 'contain' },
  dragHandleIndicator: { fontSize: '9px', color: '#007bff', backgroundColor: '#fff', padding: '1px 4px', borderRadius: '2px', border: '1px solid #007bff', marginTop: '-4px', fontWeight: 'bold' }
};
