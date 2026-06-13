import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CustomCursor from './components/ui/CustomCursor'
import Navbar from './components/ui/Navbar'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'))
const SchemesPage = lazy(() => import('./pages/SchemesPage'))

import { AuthProvider } from './context/AuthContext'

function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#0A0E17' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(0,229,199,0.15)',
        borderTopColor: '#00E5C7',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise-overlay" />
        <CustomCursor />
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
