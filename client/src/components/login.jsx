import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Tracks visibility state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Save token and user details to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert(`Welcome back, ${res.data.user.name}!`);
      navigate('/'); // Routes smoothly straight into your Signature Dashboard console
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>Account Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', outline: 'none' }} 
          />
        </div>

        {/* Password Layout with Inline Visibility Toggle Button */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Password:</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <input 
              type={showPassword ? "text" : "password"} // Dynamically swaps input type
              name="password" 
              value={formData.password}
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', paddingRight: '40px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', outline: 'none' }} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                userSelect: 'none',
                outline: 'none'
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {/* Link for Forgot Password Routing requests */}
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '22px' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s' }}>
          Login
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
      </p>
    </div>
  );
};

export default Login;
