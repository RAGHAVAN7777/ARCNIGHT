import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Score Engine', href: '/#score-engine' },
  { label: 'Schemes', href: '/#schemes' },
  { label: 'About', href: '/#about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, openAuthModal, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault()
      const id = href.replace('/#', '')
      if (location.pathname !== '/') {
        window.location.href = href
        return
      }
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '0 24px',
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(10, 14, 23, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 900,
          fontSize: '1.4rem',
          color: '#fff',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          VISHWAS <span style={{ color: '#00E5C7' }}>AI</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
      }} className="hidden md:flex">
        {navLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            {link.label}
          </a>
        ))}
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
              Go to Dashboard
            </Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => openAuthModal()} className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
            Log In
          </button>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden"
        style={{ background: 'none', color: '#fff', padding: 8 }}
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          background: 'rgba(10, 14, 23, 0.98)',
          backdropFilter: 'blur(20px)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center' }}>
                Go to Dashboard
              </Link>
              <button onClick={logout} style={{ color: '#E5484D', fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', marginTop: 8 }}>
                <LogOut size={18} />
                Log Out
              </button>
            </>
          ) : (
            <button onClick={() => openAuthModal()} className="btn-primary" style={{ justifyContent: 'center' }}>
              Log In / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
