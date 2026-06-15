import React, { useState } from 'react';
import SignaturePad from './SignaturePad';
import DocumentViewer from './DocumentViewer';

export default function SignatureDashboard() {
  const [signatureImage, setSignatureImage] = useState(null);
  const [pdfFileBase64, setPdfFileBase64] = useState(null); // Stores local base64 PDF
  const [pdfName, setPdfName] = useState("");
  const [activeTab, setActiveTab] = useState('draw');

  const savedSignatures = [
    { 
      id: 1, 
      name: "Primary Initials", 
      url: "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='150' height='50'><text x='35' y='35' font-family='cursive' font-size='28' font-style='italic' fill='%23000'>J.D.</text></svg>" 
    },
    { 
      id: 2, 
      name: "Full Legal Signature", 
      url: "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='150' height='50'><text x='15' y='35' font-family='cursive' font-size='26' font-style='italic' fill='%23000'>John Doe</text></svg>" 
    }
  ];

  // 1. Process Custom PDF File upload from local computer
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.');
      return;
    }

    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPdfFileBase64(reader.result); // Base64 Data URL containing the actual PDF document bytes
    };
    reader.readAsDataURL(file);
  };

  const handleLocalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.dashboardWrapper}>
      <h2 style={styles.dashboardTitle}>Day 8 Document Signing Portal</h2>
      
      {/* STEP A: Always let them choose the custom local target PDF first */}
      <div style={styles.pdfUploadBanner}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#475569' }}>
          {pdfFileBase64 ? `📄 Active Target Document: ${pdfName}` : "📁 Step 1: Upload a PDF from your computer to sign (Optional)"}
        </p>
        <label style={styles.inlinePdfPickerButton}>
          {pdfFileBase64 ? "Change PDF File" : "Choose PDF Document"}
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {!signatureImage ? (
        <div style={styles.portalCardContainer}>
          <div style={styles.tabNavbar}>
            <button onClick={() => setActiveTab('draw')} style={{ ...styles.navTabButton, background: activeTab === 'draw' ? '#007bff' : '#fff', color: activeTab === 'draw' ? '#fff' : '#495057' }}>✍️ Draw Live</button>
            <button onClick={() => setActiveTab('vault')} style={{ ...styles.navTabButton, background: activeTab === 'vault' ? '#007bff' : '#fff', color: activeTab === 'vault' ? '#fff' : '#495057' }}>📂 Account Vault</button>
            <button onClick={() => setActiveTab('upload')} style={{ ...styles.navTabButton, background: activeTab === 'upload' ? '#007bff' : '#fff', color: activeTab === 'upload' ? '#fff' : '#495057' }}>💻 Upload Local Signature</button>
          </div>

          {activeTab === 'draw' && <SignaturePad onSaveSignature={setSignatureImage} />}

          {activeTab === 'vault' && (
            <div style={styles.vaultGridDeck}>
              {savedSignatures.map((sig) => (
                <div key={sig.id} onClick={() => setSignatureImage(sig.url)} style={styles.signatureVaultCard}>
                  <div style={styles.cardImagePreviewContainer}><img src={sig.url} alt={sig.name} style={styles.vectorImageElement} /></div>
                  <span style={styles.cardLabelText}>{sig.name}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div style={styles.uploadZoneContainer}>
              <label style={styles.filePickerLabelButton}>
                📁 Choose Signature Image File
                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLocalFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      ) : (
        /* Step B: Pass the custom PDF along with signature down to viewer workspace */
        <DocumentViewer 
          signatureSrc={signatureImage} 
          customPdfSrc={pdfFileBase64} // Passed cleanly into existing layout mechanics
          onReset={() => {
            setSignatureImage(null);
            setActiveTab('draw');
          }} 
        />
      )}
    </div>
  );
}

// Reuse your styles, adding the new banner configuration:
const styles = {
  dashboardWrapper: { padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' },
  dashboardTitle: { textAlign: 'center', marginBottom: '20px', color: '#212529', fontWeight: 'bold' },
  pdfUploadBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' },
  inlinePdfPickerButton: { padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', fontSize: '13px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' },
  portalCardContainer: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '8px', border: '1px solid #e1e4e6', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' },
  tabNavbar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #dee2e6', paddingBottom: '16px' },
  navTabButton: { padding: '10px 20px', border: '1px solid #dee2e6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  vaultGridDeck: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  signatureVaultCard: { border: '1px solid #e1e4e6', borderRadius: '6px', padding: '16px', cursor: 'pointer', backgroundColor: '#f8f9fa', textAlign: 'center', width: '180px' },
  cardImagePreviewContainer: { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', backgroundColor: '#fff', borderRadius: '4px' },
  vectorImageElement: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  cardLabelText: { fontSize: '12px', fontWeight: 'bold', color: '#495057' },
  uploadZoneContainer: { display: 'flex', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '8px', justifyContent: 'center', backgroundColor: '#f8fafc' },
  filePickerLabelButton: { padding: '12px 24px', backgroundColor: '#475569', color: '#fff', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }
};
