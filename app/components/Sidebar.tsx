'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
)
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconReceipt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/>
  </svg>
)
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconPieChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>
)
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="1" y="1" width="9" height="9" rx="2.5" fill="#a78bfa"/>
    <rect x="12" y="1" width="9" height="9" rx="2.5" fill="#7c3aed"/>
    <rect x="1" y="12" width="9" height="9" rx="2.5" fill="#6d28d9"/>
    <rect x="12" y="12" width="9" height="9" rx="2.5" fill="#4f46e5" opacity="0.55"/>
  </svg>
)

const NAV = [
  { href: '/dashboard',    label: 'Yleiskatsaus',      Icon: IconGrid,     color: '#7c3aed' },
  { href: '/projects',     label: 'Projektit',         Icon: IconFolder,   color: '#3b82f6' },
  { href: '/time',         label: 'Tunnit',            Icon: IconClock,    color: '#10b981' },
  { href: '/travel',       label: 'Matkat',            Icon: IconMapPin,   color: '#f59e0b' },
  { href: '/expenses',     label: 'Kulut',             Icon: IconReceipt,  color: '#ef4444' },
  { href: '/laskutus',     label: 'Laskutus',          Icon: IconFileText, color: '#6366f1' },
  { href: '/invoices',     label: 'Laskuhistoria',     Icon: IconHistory,  color: '#06b6d4' },
  { href: '/receipts',     label: 'Kuitit',            Icon: IconCamera,   color: '#ec4899' },
  { href: '/tax',          label: 'Verotus',           Icon: IconPieChart, color: '#8b5cf6' },
  { href: '/team',         label: 'Tiimi',             Icon: IconUsers,    color: '#14b8a6' },
]

const DARK_VARS: Record<string, string> = {
  '--bg': '#09090f',
  '--surface': '#111120',
  '--surface-raised': '#16162a',
  '--border': '#1c1c30',
  '--border-subtle': '#0f0f1c',
  '--text': '#eeeeff',
  '--text-soft': '#ddddf0',
  '--text-heading': '#c0c0e0',
  '--muted': '#5e5e80',
  '--muted-strong': '#42425e',
  '--faint': '#35354f',
  '--faint-strong': '#3a3a5a',
  '--sidebar-bg': '#0c0c17',
  '--sidebar-border': '#17172a',
  '--color-scheme': 'dark',
}

const LIGHT_VARS: Record<string, string> = {
  '--bg': '#f4f4fb',
  '--surface': '#ffffff',
  '--surface-raised': '#f0f0fa',
  '--border': '#e2e2f0',
  '--border-subtle': '#ebebf8',
  '--text': '#111128',
  '--text-soft': '#222240',
  '--text-heading': '#333358',
  '--muted': '#6868a0',
  '--muted-strong': '#5555a0',
  '--faint': '#a0a0c0',
  '--faint-strong': '#8888aa',
  '--sidebar-bg': '#f0f0fa',
  '--sidebar-border': '#e2e2f0',
  '--color-scheme': 'light',
}

function applyVars(vars: Record<string, string>) {
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

export function Sidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark')
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pwSection, setPwSection] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyNameInput, setCompanyNameInput] = useState('')
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyMsg, setCompanyMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isTeamMember, setIsTeamMember] = useState(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const [{ data: profile }, { data: membership }] = await Promise.all([
        supabase.from('profiles').select('display_name, company_name').eq('id', user.id).single(),
        supabase.from('team_members').select('role, teams(owner_id)').eq('user_id', user.id).single(),
      ])
      if (profile?.display_name) { setDisplayName(profile.display_name); setDisplayNameInput(profile.display_name) }

      const role = membership?.role
      const ownerTeam = membership?.teams as any

      if (role === 'member' && ownerTeam?.owner_id) {
        setIsTeamMember(true)
        const { data: ownerProfile } = await supabase
          .from('profiles').select('company_name').eq('id', ownerTeam.owner_id).single()
        const cn = ownerProfile?.company_name || ''
        setCompanyName(cn)
      } else {
        if (profile?.company_name) { setCompanyName(profile.company_name); setCompanyNameInput(profile.company_name) }
      }
    }
    loadProfile()
  }, [user.id])

  async function saveDisplayName() {
    if (!displayNameInput.trim()) return
    setNameLoading(true); setNameMsg('')
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayNameInput.trim() })
    setNameLoading(false)
    if (error) setNameMsg('Virhe: ' + error.message)
    else { setDisplayName(displayNameInput.trim()); setNameMsg('Tallennettu!'); setTimeout(() => setNameMsg(''), 2000) }
  }

  async function saveCompanyName() {
    setCompanyLoading(true); setCompanyMsg('')
    const { error } = await supabase.from('profiles').upsert({ id: user.id, company_name: companyNameInput.trim() })
    setCompanyLoading(false)
    if (error) setCompanyMsg('Virhe: ' + error.message)
    else { setCompanyName(companyNameInput.trim()); setCompanyMsg('Tallennettu!'); setTimeout(() => setCompanyMsg(''), 2000) }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-theme')
      if (!saved) return
      const { theme } = JSON.parse(saved)
      setActiveTheme(theme === 'light' ? 'light' : 'dark')
      applyVars(theme === 'light' ? LIGHT_VARS : DARK_VARS)
    } catch {}
  }, [])

  async function changePassword() {
    if (newPw !== newPw2) { setPwMsg('Salasanat eivät täsmää'); return }
    if (newPw.length < 6) { setPwMsg('Salasanan tulee olla vähintään 6 merkkiä'); return }
    setPwLoading(true); setPwMsg('')
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { error } = await sb.auth.updateUser({ password: newPw })
    setPwLoading(false)
    if (error) { setPwMsg('Virhe: ' + error.message) }
    else { setPwMsg('Salasana vaihdettu!'); setNewPw(''); setNewPw2(''); setTimeout(() => setPwSection(false), 1500) }
  }

  async function deleteAccount() {
    setDeleteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Istunto vanhentunut. Kirjaudu uudelleen ja yritä uudelleen.')
        setDeleteLoading(false)
        setDeleteConfirm(false)
        return
      }
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        await supabase.auth.signOut()
        window.location.href = '/login'
      } else {
        const json = await res.json().catch(() => ({}))
        alert('Virhe: ' + (json.error || 'Tuntematon virhe'))
        setDeleteLoading(false)
        setDeleteConfirm(false)
      }
    } catch (e: any) {
      alert('Virhe: ' + (e?.message || 'Tuntematon virhe'))
      setDeleteLoading(false)
      setDeleteConfirm(false)
    }
  }

  function selectTheme(theme: 'dark' | 'light') {
    applyVars(theme === 'light' ? LIGHT_VARS : DARK_VARS)
    setActiveTheme(theme)
    localStorage.setItem('fh-theme', JSON.stringify({ theme }))
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Hamburger button — mobile only, when sidebar closed */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 400,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, width: 42, height: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <IconMenu />
        </button>
      )}

      {/* Backdrop — mobile only, when open */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobile}
          style={{ position: 'fixed', inset: 0, zIndex: 298, background: 'rgba(0,0,0,0.55)' }}
        />
      )}

      <aside style={{
        width: 230, flexShrink: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex', flexDirection: 'column',
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0,
          height: '100vh', zIndex: 299,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.24s ease',
          minHeight: 'unset',
        } : {
          minHeight: '100vh',
        }),
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LogoMark />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              ProjektFlow
            </span>
          </div>
          {isMobile && (
            <button onClick={closeMobile} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
              <IconX />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(({ href, label, Icon, color }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} onClick={closeMobile} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                color: active ? 'var(--text-soft)' : 'var(--muted)',
                background: active ? `${color}1a` : 'transparent',
                textDecoration: 'none', fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
              }}>
                <span style={{ color: active ? color : `${color}99`, display: 'flex', alignItems: 'center' }}>
                  <Icon />
                </span>
                {label}
              </Link>
            )
          })}

          <div style={{ height: 1, background: 'var(--sidebar-border)', margin: '8px 4px 4px' }} />

          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              color: 'var(--muted)', background: 'transparent',
              border: 'none', cursor: 'pointer', fontSize: 13.5,
              fontWeight: 400, width: '100%', textAlign: 'left',
              borderLeft: '2px solid transparent',
            }}
          >
            <IconSettings />
            Asetukset
          </button>
        </nav>

        {/* User */}
        <div style={{
          padding: '14px 16px', borderTop: '1px solid var(--sidebar-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {(displayName || user?.email || '')[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: 'var(--text-soft)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName || user?.email?.split('@')[0]}
            </div>
            {companyName && (
              <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                {companyName}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--faint-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
              {user?.email}
            </div>
          </div>
        </div>
      </aside>

      {/* Settings modal */}
      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 18, padding: '28px 28px 24px',
              width: 400, maxWidth: '92vw',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <IconSettings />
                </div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Asetukset</h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 6px', borderRadius: 6 }}
              >
                ×
              </button>
            </div>

            {/* Theme selector */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: 10 }}>TEEMA</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => selectTheme('dark')}
                  style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: '#0e0e1a',
                    border: `2px solid ${activeTheme === 'dark' ? '#7c3aed' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                    <div style={{ width: 20, height: 13, borderRadius: 4, background: '#111120', border: '1px solid #1c1c30' }} />
                    <div style={{ width: 28, height: 13, borderRadius: 4, background: '#16162a' }} />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#c4b5fd' }}>Tumma</div>
                  <div style={{ fontSize: 11, color: '#5e5e80', marginTop: 2 }}>Tumma tausta</div>
                </button>
                <button
                  onClick={() => selectTheme('light')}
                  style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: '#ffffff',
                    border: `2px solid ${activeTheme === 'light' ? '#7c3aed' : '#e2e2f0'}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                    <div style={{ width: 20, height: 13, borderRadius: 4, background: '#f4f4fb', border: '1px solid #e2e2f0' }} />
                    <div style={{ width: 28, height: 13, borderRadius: 4, background: '#f0f0fa' }} />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6d28d9' }}>Vaalea</div>
                  <div style={{ fontSize: 11, color: '#6868a0', marginTop: 2 }}>Vaalea tausta</div>
                </button>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>Näyttönimi</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={displayNameInput}
                  onChange={e => setDisplayNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
                  placeholder="Etunimi Sukunimi"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
                />
                <button onClick={saveDisplayName} disabled={nameLoading} style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  {nameLoading ? '...' : 'OK'}
                </button>
              </div>
              {nameMsg && <p style={{ margin: '6px 0 0', fontSize: 12, color: nameMsg.includes('Virhe') ? '#f87171' : '#34d399' }}>{nameMsg}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>Yrityksen nimi</div>
              {isTeamMember ? (
                <div style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--border)', color: 'var(--muted)', fontSize: 13 }}>
                  {companyName || '—'}
                  <span style={{ fontSize: 11, color: 'var(--faint)', marginLeft: 8 }}>(vain esimies voi muuttaa)</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={companyNameInput}
                      onChange={e => setCompanyNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveCompanyName()}
                      placeholder="Yritys Oy"
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
                    />
                    <button onClick={saveCompanyName} disabled={companyLoading} style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                      {companyLoading ? '...' : 'OK'}
                    </button>
                  </div>
                  {companyMsg && <p style={{ margin: '6px 0 0', fontSize: 12, color: companyMsg.includes('Virhe') ? '#f87171' : '#34d399' }}>{companyMsg}</p>}
                </>
              )}
            </div>

            <button
              onClick={() => { setPwSection(v => !v); setPwMsg('') }}
              style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, textAlign: 'left' }}
            >
              🔑 Vaihda salasana {pwSection ? '▲' : '▼'}
            </button>
            {pwSection && (
              <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Uusi salasana" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
                <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} placeholder="Toista salasana" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} onKeyDown={e => e.key === 'Enter' && changePassword()} />
                <button onClick={changePassword} disabled={pwLoading} style={{ padding: '8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {pwLoading ? '...' : 'Vaihda salasana'}
                </button>
                {pwMsg && <p style={{ margin: 0, fontSize: 12, color: pwMsg.includes('Virhe') ? '#f87171' : '#34d399' }}>{pwMsg}</p>}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '0 0 16px' }} />

            <button
              onClick={onLogout}
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                color: '#f87171', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <IconLogout />
              Kirjaudu ulos
            </button>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ width: '100%', marginTop: 10, padding: '8px', background: 'none', border: 'none', color: 'var(--faint)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Poista tili ja kaikki tiedot
              </button>
            ) : (
              <div style={{ marginTop: 12, padding: '14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#f87171', fontWeight: 600 }}>Varoitus: tämä poistaa pysyvästi</p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Kaikki projektit, työtunnit, kulut ja tilisi poistetaan eikä niitä voi palauttaa.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={deleteAccount}
                    disabled={deleteLoading}
                    style={{ flex: 1, padding: '9px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: deleteLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: deleteLoading ? 0.6 : 1 }}
                  >
                    {deleteLoading ? 'Poistetaan...' : 'Poista kaikki'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleteLoading}
                    style={{ padding: '9px 14px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}
                  >
                    Peruuta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
