'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg, #09090f)',
      color: 'var(--text, #eeeeff)',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, margin: '0 auto 1.5rem',
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 64, fontWeight: 800, margin: '0 0 0.25rem', color: '#7c3aed', lineHeight: 1 }}>404</h1>
        <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--text, #eeeeff)' }}>Sivua ei löydy</p>
        <p style={{ fontSize: 14, color: 'var(--muted, #5e5e80)', marginBottom: '2rem' }}>
          Etsimäsi sivu on poistettu tai osoite on virheellinen.
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff',
          borderRadius: 10,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
        }}>
          Takaisin etusivulle
        </Link>
      </div>
    </main>
  )
}
