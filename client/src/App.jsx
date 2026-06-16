import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignatureDashboard from './components/SignatureDashboard';
import Login from './components/Login';       // 👈 Ensure these component names match Auth files
import Register from './components/Register'; // 👈 Ensure these component names match Auth files

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard Portal Gateway Entry */}
        <Route path="/" element={<SignatureDashboard />} />

        {/* ✅ FIXES THE BLANK SCREEN: Mounts Day 6 registration and login routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Fallback Catch-All Safety Route Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
