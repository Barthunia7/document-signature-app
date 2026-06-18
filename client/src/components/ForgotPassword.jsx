import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // 🚀 Cleaned up URL property for production

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // ✅ PRODUCTION FIX: Fallback to local endpoint if the environment variable is not defined yet
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message || 'If that account exists, a password reset link has been dispatched.'
      });
      setEmail('');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || err.response?.data?.message || 'Failed to dispatch reset link.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', backgroundColor: '#fff' }}>
      <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#1e293b' }}>🔒 Reset Password</h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
        Enter your registered email address below, and we will send a secure link to reset your account password.
      </p>
      
      <form onSubmit={handleResetRequest}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Email Address:</label>
          <input
            type="email"
            placeholder="your-email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
            required
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          disabled={loading}
        >
          {loading ? 'Sending link...' : 'Send Password Reset Link'}
        </button>
      </form>

      {/* Dynamic Success/Error Alerts Notification Container */}
      {message.text && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          borderRadius: '6px', 
          fontSize: '13px', 
          textAlign: 'center',
          border: '1px solid',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', 
          borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb', 
          color: message.type === 'success' ? '#155724' : '#721c24' 
        }}>
          {/* ✅ PRODUCTION FIX: Removed the Ethereal sandbox link container completely */}
          {message.text}
        </div>
      )}

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
