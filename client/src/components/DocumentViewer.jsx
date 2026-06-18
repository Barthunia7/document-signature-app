import React, { useState, useRef } from 'react';

export default function DocumentViewer({ signatureSrc, customPdfSrc, activeDocContext, currentUserEmail, onReset }) {

  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [pageNumber, setPageNumber] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Extract dynamic values with smart defaults
  const DOCUMENT_ID = activeDocContext?.id || 'doc_default_101';
  const DOCUMENT_NAME = activeDocContext?.name || 'Document View';
  const SIGNER_EMAIL =  currentUserEmail || 'guest@company.com';

  const handleDragEnd = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    const x = Math.max(0, Math.min(dropX - 75, rect.width - 150)); 
    const y = Math.max(0, Math.min(dropY - 25, rect.height - 50));
    setCoords({ x, y });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleReject = async () => {
    const reason = prompt("Please provide a mandatory reason for rejecting this signature request:");
    if (!reason || reason.trim() === "") return;

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/status/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: DOCUMENT_ID, reason: reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(`Document Successfully Marked as Rejected.\nReason Saved: "${data.data.rejectionReason}"`);
      onReset(); 
    } catch (err) {
      alert(`Error processing rejection: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/sign-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
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

      if (!response.ok) throw new Error('Failed to compile PDF layers');

      await fetch('http://localhost:5000/api/status/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: DOCUMENT_ID })
      });

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = `Signed_${DOCUMENT_NAME}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      
      alert("Document signed successfully! Your file has downloaded.");
      onReset();
    } catch (err) {
      alert(`Error processing transaction: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // DYNAMIC DUAL-MODE VISUAL LAYERING SYSTEM
  const renderDocumentContent = () => {
    if (customPdfSrc && typeof customPdfSrc === 'string' && customPdfSrc.startsWith('data:application/pdf;base64,')) {
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc' }}>
          <iframe
            src={customPdfSrc} 
            title="Active PDF Core Preview Layer"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              userSelect: 'none'
            }}
          />
        </div>
      );
    }

    if (DOCUMENT_ID === 'doc_102') {
      return (
        <div style={styles.documentBody}>
          <h2 style={styles.docHeader}>MUTUAL NON-DISCLOSURE AGREEMENT</h2>
          <p style={styles.docParagraph}>This structural legal document governs the proprietary safety protocols for source code repositories and access key protection schemes between parties...</p>
          <div style={styles.signingTargetZone}>
            <p style={styles.signerLabel}>Authorized NDA Recipient Signature Placement Area:</p>
            <div style={styles.targetDashedPlaceholder}></div>
          </div>
        </div>
      );
    } else if (DOCUMENT_ID === 'doc_103') {
      return (
        <div style={styles.documentBody}>
          <h2 style={styles.docHeader}>COMMERCIAL OFFICE RENTAL LEASE</h2>
          <p style={styles.docParagraph}>This operational leasing covenant outlines the technical tenancy workspace conditions, utility structural access rules, and monthly baseline rental rates...</p>
          <div style={styles.signingTargetZone}>
            <p style={styles.signerLabel}>Authorized Tenant Signature Placement Area:</p>
            <div style={styles.targetDashedPlaceholder}></div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={styles.documentBody}>
          <h2 style={styles.docHeader}>SUMMER TRAINING INTENT LETTER</h2>
          <p style={styles.docParagraph}>This educational document serves as confirmation for verified software engineering internships and academic industry validation workflows...</p>
          <div style={styles.signingTargetZone}>
            <p style={styles.signerLabel}>Authorized Registrar Signature Placement Area:</p>
            <div style={styles.targetDashedPlaceholder}></div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.viewContainer}>
      <div style={styles.actionToolbar}>
        <button onClick={onReset} style={styles.secondaryBtn} disabled={isSaving}>
          ← Back to Dashboard
        </button>

        <div style={styles.pageSelectorWrapper}>
          <label style={styles.selectorLabel}>Target Page:</label>
          <input type="number" min="1" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} style={styles.pageInput} disabled={isSaving} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleReject} style={styles.rejectBtn} disabled={isSaving}>❌ Decline Request</button>
          <button onClick={handleFinalSave} style={styles.primaryBtn} disabled={isSaving}>🖋️ Sign & Finalize</button>
        </div>
      </div>

      <div ref={containerRef} onDragOver={handleDragOver} style={styles.pdfCanvasPage}>
        {renderDocumentContent()}

        <div
          draggable="true"
          onDragEnd={handleDragEnd}
          style={{ 
            ...styles.draggableSignatureWrapper, 
            left: `${coords.x}px`, 
            top: `${coords.y}px`,
            zIndex: 999 
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
  primaryBtn: { padding: '12px 24px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  rejectBtn: { padding: '12px 24px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  secondaryBtn: { padding: '12px 24px', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  pdfCanvasPage: { position: 'relative', width: '600px', height: '800px', backgroundColor: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e1e4e6', borderRadius: '4px', overflow: 'auto', userSelect: 'none', zIndex: 1 },
  documentBody: { padding: '50px', fontFamily: 'serif', color: '#222' },
  docHeader: { fontSize: '18px', textAlign: 'center', marginBottom: '40px', letterSpacing: '1px', fontWeight: 'bold', textTransform: 'uppercase' },
  docParagraph: { fontSize: '14px', lineHeight: '1.8', marginBottom: '24px', textAlign: 'justify' },
  signingTargetZone: { marginTop: '360px' },
  signerLabel: { fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' },
  targetDashedPlaceholder: { width: '220px', height: '60px', borderBottom: '2px dashed #bbb' },
  draggableSignatureWrapper: { position: 'absolute', width: '150px', height: '60px', cursor: 'move', border: '2px dashed #007bff', backgroundColor: 'rgba(0, 123, 255, 0.08)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  signatureImageElement: { width: '100%', height: '80%', objectFit: 'contain' },
  dragHandleIndicator: { fontSize: '9px', color: '#007bff', backgroundColor: '#fff', padding: '1px 4px', borderRadius: '2px', border: '1px solid #007bff', marginTop: '-4px', fontWeight: 'bold' }
};
