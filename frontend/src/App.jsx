import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { DrawMechanicsPage } from './pages/DrawMechanicsPage';
import { CharityDirectoryPage } from './pages/CharityDirectoryPage';
import { CharityDetailPage } from './pages/CharityDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-brand-coral selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mechanics" element={<DrawMechanicsPage />} />
          <Route path="/charities" element={<CharityDirectoryPage />} />
          <Route path="/charities/:slug" element={<CharityDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Subscriber Route (PRD § 10) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Route (PRD § 11) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
