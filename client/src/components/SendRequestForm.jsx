import React, { useState } from 'react';

export default function SendRequestForm() {
  const [email, setEmail] = useState('');
  const [docId, setDocId] = useState('doc_101'); // Mock template identifier
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setResult(null);

    try {
      // 1. Existing Day 9 Pipeline: Generate Token and Dispatch Nodemailer Mail
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/request-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerEmail: email, documentId: docId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to dispatch request');

      // ✅ 2. Day 11 State Synchronization: Initialize status to "Pending" inside MongoDB permanently
      await fetch(`${API_URL}/api/status/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'doc_kiran_training_2026',
          signerEmail: email
        }),
      });

      setResult({
        message: "Signature request link dispatched and marked as 'Pending' in database!",
        link: data.publicSignatureLink,
      });
      setEmail('');
    } catch (err) {
      alert(`Error initializing request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formCard}>
      <h3 style={styles.cardHeading}>✉️ Dispatch Signature Request Link</h3>
      <p style={styles.subtext}>Send an authenticated tokenized link to a collaborator or client's email inbox.</p>

      <form onSubmit={handleSendRequest} style={styles.formElement}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Recipient Signer Email:</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Generating Link & Dispatching Email...' : 'Send Secure Signature Link'}
        </button>
      </form>

      {result && (
        <div style={styles.successBox}>
          <p style={{ color: '#155724', fontWeight: 'bold', margin: '0 0 10px 0' }}>✓ Success!</p>
          <p style={styles.resultText}><strong>Direct Secure URL:</strong> <a href={result.link} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>{result.link}</a></p>
          {result.preview && (
            <p style={styles.resultText}>
              <strong>📧 Testing Mail Box Stream:</strong> <a href={result.preview} target="_blank" rel="noreferrer" style={{ color: '#0056b3', fontWeight: 'bold' }}>Click to view sent test email inbox</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  formCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '24px' },
  cardHeading: { margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' },
  subtext: { margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' },
  formElement: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
  input: { padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  successBox: { marginTop: '20px', padding: '16px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px' },
  resultText: { fontSize: '13px', margin: '6px 0', color: '#1b5e20', lineHeight: '1.5' }
};
