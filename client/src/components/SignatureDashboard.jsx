import React, { useState, useEffect } from 'react';
import DashboardHome from './DashboardHome';
import SignaturePad from './SignaturePad';
import DocumentViewer from './DocumentViewer';
import SendRequestForm from './SendRequestForm';

export default function SignatureDashboard() {
    const [userSession, setUserSession] = useState(null);
    const [activeDocument, setActiveDocument] = useState(null);
    const [signatureImage, setSignatureImage] = useState(null);
    const [pdfFileBase64, setPdfFileBase64] = useState(null);
    const [pdfName, setPdfName] = useState("");
    const [activeTab, setActiveTab] = useState('draw');

    // ✅ FIXED: Natively defined signature vector data profile matrix
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

    // Load active authenticated account parameters on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('email');
        if (storedUser) {
            try {
                const parsed = storedUser.startsWith('{') ? JSON.parse(storedUser) : { email: storedUser };
                setUserSession(parsed);
            } catch (e) {
                setUserSession({ email: storedUser });
            }
        }
    }, []);

    const handlePdfUpload = (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        setPdfName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            setPdfFileBase64(reader.result);
            setActiveDocument({
                id: `doc_custom_local_${Date.now()}`,
                name: file.name,
                type: "Local Document"
            });
        };
        reader.readAsDataURL(file);
    };

    const handleLocalSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => setSignatureImage(reader.result);
        reader.readAsDataURL(file);
    };

    // Session Security Gate
    if (!userSession) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'sans-serif' }}>
                <h3 style={{ color: '#dc3545' }}>🔒 Access Denied</h3>
                <p style={{ color: '#64748b' }}>Please log in through your Authentication page to access the Signature Dashboard.</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}
                >
                    Go to Login Screen
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Active Session Identity Banner Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>👤 Active User Session: <span style={{ color: '#0f172a' }}>{userSession.email || userSession}</span></span>
                    <button
                        onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('email'); localStorage.removeItem('token'); setUserSession(null); window.location.href = '/login'; }}
                        style={{ padding: '6px 14px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🚪 Secure Logout
                    </button>
                </div>

                {/* Local Machine Device Storage PDF Upload Banner */}
                <div style={styles.pdfUploadBanner}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>
                        {pdfFileBase64 ? `📄 Active Target Custom PDF: ${pdfName}` : "📁 Step 1: Upload a PDF from your computer to sign:"}
                    </p>
                    <label style={styles.inlinePdfPickerButton}>
                        {pdfFileBase64 ? "Change Custom PDF" : "Choose PDF Document"}
                        <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
                    </label>
                </div>

                {!activeDocument ? (
                    <DashboardHome onSelectDocument={(doc) => setActiveDocument(doc)} />
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button onClick={() => { setSignatureImage(null); setActiveDocument(null); }} style={styles.backBtn}>
                                ← Back to Dashboard Console
                            </button>
                        </div>

                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b', fontWeight: 'bold' }}>
                            Document Signing Workspace Portal
                        </h2>

                        {!signatureImage && <SendRequestForm currentUserEmail={userSession.email || userSession} />}

                        <div style={styles.portalCardContainer}>
                            {!signatureImage ? (
                                <div>
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
                                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Upload a picture of your signature from your computer device:</p>
                                            <label style={styles.filePickerLabelButton}>
                                                📁 Choose Signature Image File (PNG/JPG)
                                                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLocalSignatureUpload} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <DocumentViewer
                                    signatureSrc={signatureImage}
                                    customPdfSrc={pdfFileBase64}
                                    activeDocContext={activeDocument}
                                    currentUserEmail={userSession.email || userSession}
                                    onReset={() => setSignatureImage(null)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pdfUploadBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
    inlinePdfPickerButton: { padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' },
    backBtn: { padding: '10px 16px', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold', color: '#475569' },
    portalCardContainer: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    tabNavbar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #dee2e6', paddingBottom: '16px' },
    navTabButton: { padding: '10px 20px', border: '1px solid #dee2e6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    vaultGridDeck: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    signatureVaultCard: { border: '1px solid #e1e4e6', borderRadius: '6px', padding: '16px', cursor: 'pointer', backgroundColor: '#f8f9fa', textAlign: 'center', width: '180px' },
    cardImagePreviewContainer: { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', backgroundColor: '#fff', borderRadius: '4px' },
    vectorImageElement: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
    cardLabelText: { fontSize: '12px', fontWeight: 'bold', color: '#495057' },
    uploadZoneContainer: { display: 'flex', flexDirection: 'column', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '8px', alignItems: 'center', backgroundColor: '#f8fafc' },
    filePickerLabelButton: { padding: '12px 24px', backgroundColor: '#475569', color: '#fff', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }
};