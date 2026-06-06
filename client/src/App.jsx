import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

// Simple temporary Dashboard component for testing successful logins
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h1>📝 Document Signature Dashboard</h1>
      <p>Welcome, <strong>{user?.name || 'User'}</strong>! You have successfully logged in using JWT.</p>
      <button 
        onClick={handleLogout} 
        style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
