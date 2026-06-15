import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import your new combined signature dashboard component
import SignatureDashboard from './components/SignatureDashboard';

// Import your other existing page components
import Login from './components/login';
import Dashboard from './components/SignatureDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Your existing application routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 2. Add the dedicated Day 8 production route */}
          <Route path="/sign-document" element={<SignatureDashboard />} />
          
          {/* Default fallback route pointing straight to your new portal */}
          <Route path="/" element={<SignatureDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
