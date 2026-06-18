import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignatureDashboard from './components/SignatureDashboard';
import Login from './components/login';       
import Register from './components/Register'; 
import ForgotPassword from './components/ForgotPassword'; // ✅ Added the new component import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard Portal Gateway Entry */}
        <Route path="/" element={<SignatureDashboard />} />

        {/* Mounts Day 6 registration and login routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/*  ROUTE: Mounts separate Forgot Password page */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Fallback Catch-All Safety Route Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
