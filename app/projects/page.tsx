'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/Sidebar'
import { useIsMobile } from '@/app/hooks/useIsMobile'
import { KM_RATE } from '@/lib/config'

const COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#8b5cf6']

function DonutChart({ segments, total }: {
  segments: { color: string; count: number; label: string }[]
  total: number
}) {
  const r = 52, cx = 76, cy = 76
  const circ = 2 * Math.PI * r
  let cumDeg = 0

  return (
    <svg width={152} height={152}>
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={21} style={{stroke: 'var(--border)'}} />
      {total > 0 && segments.filter(s => s.count > 0).map((s, i) => {
        const deg = (s.count / total) * 360
        const len = (s.count / total) * circ
        const draw = Math.max(len - (segments.filter(x => x.count > 0).length > 1 ? 5 : 0), 0)
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={21}
            strokeDasharray={`${draw} ${circ - draw}`}
            strokeDashoffset={circ * 0.25}
            transform={`rotate(${cumDeg} ${cx} ${cy})`}
          />
        )
        cumDeg += deg
        return el
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" style={{fill: 'var(--text)'}} fontSize="23" fontWeight="700" fontFamily="system-ui">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{fill: 'var(--muted-strong)'}} fontSize="11" fontFamily="system-ui">projektia</text>
    </svg>
  )
}


function GaugeChart({ score, status }: { score: number; status: 'ok' | 'warning' | 'critical' | 'no_data' }) {
  const cx = 90, cy = 78, r = 62, sw = 13

  const pt = (deg: number): [number, number] => {
    const rad = (180 - deg) * Math.PI / 180
    return [+(cx + r * Math.cos(rad)).toFixed(2), +(cy - r * Math.sin(rad)).toFixed(2)]
  }
  const arc = (d1: number, d2: number) => {
    const [x1, y1] = pt(d1); const [x2, y2] = pt(d2)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }
  const needleDeg = 10 + Math.max(0, Math.min(1, score)) * 160
  const needleRad = (180 - needleDeg) * Math.PI / 180
  const nl = r - 10
  const nx = +(cx + nl * Math.cos(needleRad)).toFixed(2)
  const ny = +(cy - nl * Math.sin(needleRad)).toFixed(2)
  const col = status === 'ok' ? '#34d399' : status === 'warning' ? '#fb923c' : status === 'critical' ? '#f87171' : '#6b7280'
  const lbl = status === 'ok' ? 'Budjetti riittää' : status === 'warning' ? 'Tarkkaile' : status === 'critical' ? 'Ylitysriski' : 'Ei dataa'

  return (
    <svg width={180} height={100} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      <path d={arc(1, 179)} fill="none" stroke="var(--border)" strokeWidth={sw} />
      <path d={arc(3, 57)} fill="none" stroke="#22c55e" strokeWidth={sw} />
      <path d={arc(63, 117)} fill="none" stroke="#f59e0b" strokeWidth={sw} />
      <path d={arc(123, 177)} fill="none" stroke="#ef4444" strokeWidth={sw} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={col} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill={col} />
      <circle cx={cx} cy={cy} r={3.5} fill="var(--bg)" />
      <text x={16} y={cy + 4} textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="system-ui" opacity="0.7">OK</text>
      <text x={164} y={cy + 4} textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="system-ui" opacity="0.7">Riski</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill={col} fontSize="12" fontWeight="700" fontFamily="system-ui">{lbl}</text>
    </svg>
  )
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, progress, trend }: {
  label: string; value: string | number; sub: string
  icon: React.ReactNode; iconBg: string; iconColor: string
  progress?: number; trend?: number | null
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted-strong)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: progress !== undefined ? 10 : 8 }}>{value}</div>
      {progress !== undefined && (
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 2, background: iconColor, width: `${Math.min(progress, 100)}%`, transition: 'width .4s' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trend !== null && trend !== undefined && (
          <span style={{ color: trend >= 0 ? '#4ade80' : '#f87171', fontSize: 12, fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} %
          </span>
        )}
        <span style={{ fontSize: 12, color: 'var(--faint)' }}>{sub}</span>
      </div>
    </div>
  )
}

export default function Projects() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [travelEntries, setTravelEntries] = useState<any[]>([])
  const [expenseEntries, setExpenseEntries] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [isOwner, setIsOwner] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const session = await supabase.auth.getSession()
      const tok = session.data.session?.access_token
      if (tok) {
        const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${tok}` } })
        const teamData = await res.json()
        if (teamData.membership && teamData.membership.role !== 'owner') setIsOwner(false)
      }
      loadAll(data.user.id)
    })
  }, [])

  async function loadAll(uid: string) {
    const [{ data: p }, { data: t }, { data: tr }, { data: ex }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('time_entries').select('*').eq('user_id', uid),
      supabase.from('travel_entries').select('*').eq('user_id', uid),
      supabase.from('expenses').select('*').eq('user_id', uid),
    ])
    setProjects(p || [])
    setTimeEntries(t || [])
    setTravelEntries(tr || [])
    setExpenseEntries(ex || [])
    const notes: Record<string, string> = {}
    for (const proj of (p || [])) notes[proj.id] = proj.notes || ''
    setLocalNotes(notes)
  }

  async function addProject() {
    if (!name || !user) return
    await supabase.from('projects').insert({ name, client, budget: parseFloat(budget) || 0, deadline: deadline || null, status: 'active', user_id: user.id })
    setName(''); setClient(''); setBudget(''); setDeadline('')
    setShowForm(false); loadAll(user.id)
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id)
    setActiveMenu(null); loadAll(user.id)
  }

  async function toggleStatus(p: any) {
    const newStatus = p.status === 'active' ? 'valmis' : 'active'
    setProjects(prev => prev.map(proj => proj.id === p.id ? { ...proj, status: newStatus } : proj))
    await supabase.from('projects').update({ status: newStatus }).eq('id', p.id)
  }

  async function saveNote(id: string, notes: string) {
    await supabase.from('projects').update({ notes }).eq('id', id)
  }

  function openEdit(p: any) {
    setEditingProject(p)
    setEditName(p.name)
    setEditDeadline(p.deadline || '')
    setEditBudget(p.budget ? String(p.budget) : '')
    setActiveMenu(null)
  }

  async function saveEdit() {
    if (!editingProject || !editName) return
    await supabase.from('projects').update({
      name: editName,
      deadline: editDeadline || null,
      budget: parseFloat(editBudget) || 0,
    }).eq('id', editingProject.id)
    setEditingProject(null)
    loadAll(user.id)
  }

  async function logout() {
    await supabase.auth.signOut(); router.push('/login')
  }

  const now = new Date()

  const pw = projects.map((p, i) => {
    const pt  = timeEntries.filter(e => e.project_id === p.id)
    const ptr = travelEntries.filter(e => e.project_id === p.id)
    const pe  = expenseEntries.filter(e => e.project_id === p.id)
    const revenue  = pt.reduce((s, e) => s + e.hours * e.rate, 0) + ptr.reduce((s, e) => s + e.km * KM_RATE, 0)
    const expenses = pe.reduce((s, e) => s + e.amount, 0)
    const totalUsed = revenue + expenses
    const progress = p.budget > 0 ? Math.min(totalUsed / p.budget * 100, 100) : 0
    const kate = p.budget > 0 ? (p.budget - totalUsed) / p.budget * 100 : null

    // Ennuste: lasketaan päiväkohtainen tahti ja arvioidaan budjetti/deadline-riskit
    const allDates = ([...pt.map((e: any) => e.date), ...pe.map((e: any) => e.date)] as string[]).filter(Boolean)
    const earliestStr: string | undefined = allDates.length > 0 ? allDates.sort()[0] : (p.created_at as string | undefined)?.slice(0, 10)
    const startMs = earliestStr ? new Date(earliestStr).getTime() : now.getTime()
    const daysActiveF = Math.max(1, (now.getTime() - startMs) / 86400000)
    const burnRate = totalUsed > 0 ? Math.round(totalUsed / daysActiveF * 10) / 10 : 0

    let projectedAtDeadline: number | null = null
    let estimatedDoneDate: Date | null = null
    let forecastStatus: 'ok' | 'warning' | 'critical' | 'no_data' = 'no_data'
    let daysToCompletion: number | null = null

    if (p.budget > 0 && burnRate > 0) {
      const remaining = Math.max(0, p.budget - totalUsed)
      const daysToExhausted = remaining / burnRate
      estimatedDoneDate = new Date(now.getTime() + daysToExhausted * 86400000)
      daysToCompletion = Math.round(daysToExhausted)
      if (p.deadline) {
        const deadlineMs = new Date(p.deadline).getTime()
        const daysFromStart = Math.max(1, (deadlineMs - startMs) / 86400000)
        projectedAtDeadline = Math.round(burnRate * daysFromStart)
        const ratio = projectedAtDeadline / p.budget
        forecastStatus = ratio > 1.1 ? 'critical' : ratio > 0.85 ? 'warning' : 'ok'
      } else {
        forecastStatus = daysToExhausted < 14 ? 'critical' : daysToExhausted < 45 ? 'warning' : 'ok'
      }
    }

    return {
      ...p, revenue, expenses, progress, kate, color: COLORS[i % COLORS.length],
      burnRate, projectedAtDeadline, estimatedDoneDate, forecastStatus,
      daysToCompletion, daysActive: Math.round(daysActiveF),
    }
  })

  const viewPw = selectedProjectId ? pw.filter(p => p.id === selectedProjectId) : pw
  const viewProjects = selectedProjectId ? projects.filter(p => p.id === selectedProjectId) : projects

  const activeCount = viewProjects.filter(p => p.status === 'active').length
  const doneCount = viewProjects.filter(p => p.status === 'valmis').length
  const totalBudget = viewProjects.reduce((s, p) => s + (p.budget || 0), 0)
  const totalRevenue = viewPw.reduce((s, p) => s + p.revenue + p.expenses, 0)
  const kateVals = viewPw.filter(p => p.kate !== null).map(p => p.kate as number)
  const avgKate = kateVals.length > 0 ? kateVals.reduce((s, v) => s + v, 0) / kateVals.length : null
  const kateStatus: 'ok' | 'warning' | 'critical' | 'no_data' =
    avgKate === null ? 'no_data' : avgKate >= 20 ? 'ok' : avgKate >= 0 ? 'warning' : 'critical'
  const kateScore = avgKate === null ? 0.5 : Math.max(0, Math.min(1, 0.5 - avgKate / 100))
  const budgetPct = totalBudget > 0 ? totalRevenue / totalBudget * 100 : 0

  const upcoming = viewProjects
    .filter(p => p.deadline && p.status === 'active')
    .map(p => ({ ...p, daysLeft: Math.ceil((new Date(p.deadline).getTime() - now.getTime()) / 86400000) }))
    .filter(p => p.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5)

  const statusSegments = [
    { label: 'Aktiivinen', color: '#7c3aed', count: activeCount },
    { label: 'Valmis',     color: '#10b981', count: doneCount },
  ]

  const selectedPw = selectedProjectId ? pw.find(p => p.id === selectedProjectId) : null

  const activeWithData = pw.filter(p => p.status === 'active' && p.forecastStatus !== 'no_data')
  const overallForecastStatus: 'ok' | 'warning' | 'critical' | 'no_data' =
    activeWithData.length === 0 ? 'no_data' :
    activeWithData.some(p => p.forecastStatus === 'critical') ? 'critical' :
    activeWithData.some(p => p.forecastStatus === 'warning') ? 'warning' : 'ok'
  const forecastScore =
    overallForecastStatus === 'no_data' ? 0.5 :
    overallForecastStatus === 'ok' ? 0.15 :
    overallForecastStatus === 'warning' ? 0.5 : 0.85

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '9px 13px', color: 'var(--text-soft)',
    fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui,sans-serif' }} onClick={() => setActiveMenu(null)}>
      {user && <Sidebar user={user} onLogout={logout} />}
      <main style={{ flex: 1, padding: isMobile ? '72px 16px 24px' : '28px 36px', overflow: 'auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.5px' }}>Projektit</h1>
            <p style={{ color: 'var(--muted-strong)', marginTop: 5, fontSize: 13.5 }}>Projektit, budjetit ja aikataulut yhdessä näkymässä.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--muted)', cursor: 'default' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {now.toLocaleDateString('fi-FI', { year: 'numeric', month: 'long' })}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', position: 'relative' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {projects.length > 0 && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', border: '1.5px solid var(--bg)' }} />}
            </button>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'default' }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Project selector pills */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setSelectedProjectId(null)}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: selectedProjectId === null ? '#7c3aed' : 'var(--surface)', color: selectedProjectId === null ? '#fff' : 'var(--muted)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
            >
              Kaikki projektit
            </button>
            {pw.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${selectedProjectId === p.id ? p.color : 'var(--border)'}`, background: selectedProjectId === p.id ? `${p.color}22` : 'var(--surface)', color: selectedProjectId === p.id ? p.color : 'var(--muted)', fontSize: 12.5, fontWeight: selectedProjectId === p.id ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Single project detail panel */}
        {selectedPw && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${selectedPw.color}40`, borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: selectedPw.color }} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{selectedPw.name}</span>
                  <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: selectedPw.status === 'active' ? 'rgba(251,146,60,0.15)' : 'rgba(16,185,129,0.12)', color: selectedPw.status === 'active' ? '#fb923c' : '#34d399' }}>
                    {selectedPw.status === 'active' ? 'Käynnissä' : 'Valmis'}
                  </span>
                </div>
                {selectedPw.client && <div style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 20 }}>{selectedPw.client}</div>}
              </div>
              {selectedPw.deadline && (() => {
                const days = Math.ceil((new Date(selectedPw.deadline).getTime() - now.getTime()) / 86400000)
                return (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Deadline</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: days <= 7 ? '#f87171' : days <= 30 ? '#fb923c' : 'var(--text-soft)' }}>{selectedPw.deadline}</div>
                    <div style={{ fontSize: 11.5, color: days <= 7 ? '#f87171' : 'var(--muted)' }}>{days >= 0 ? `${days} pv jäljellä` : 'Mennyt'}</div>
                  </div>
                )
              })()}
            </div>
            {selectedPw.budget > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>Budjetin käyttö</span>
                  <span>{Math.round(selectedPw.progress)} % · {Math.round(selectedPw.revenue + selectedPw.expenses).toLocaleString('fi-FI')} € / {selectedPw.budget.toLocaleString('fi-FI')} €</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: selectedPw.progress >= 100 ? '#f87171' : selectedPw.progress >= 80 ? '#fb923c' : selectedPw.color, width: `${Math.min(selectedPw.progress, 100)}%`, transition: 'width .4s' }} />
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Laskutettu', value: `${Math.round(selectedPw.revenue).toLocaleString('fi-FI')} €`, color: '#60a5fa' },
                { label: 'Kulut', value: `${Math.round(selectedPw.expenses).toLocaleString('fi-FI')} €`, color: '#f87171' },
                { label: 'Yhteensä', value: `${Math.round(selectedPw.revenue + selectedPw.expenses).toLocaleString('fi-FI')} €`, color: selectedPw.color },
                { label: 'Kate', value: selectedPw.kate !== null ? `${Math.round(selectedPw.kate)} %` : '—', color: (selectedPw.kate ?? 0) > 0 ? '#34d399' : '#f87171' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {selectedPw.forecastStatus !== 'no_data' && (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>Ennuste</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: selectedPw.forecastStatus === 'ok' ? 'rgba(52,211,153,0.12)' : selectedPw.forecastStatus === 'warning' ? 'rgba(251,146,60,0.12)' : 'rgba(248,113,113,0.12)',
                    color: selectedPw.forecastStatus === 'ok' ? '#34d399' : selectedPw.forecastStatus === 'warning' ? '#fb923c' : '#f87171',
                  }}>
                    {selectedPw.forecastStatus === 'ok' ? '✓ Budjetti riittää' : selectedPw.forecastStatus === 'warning' ? '⚠ Tarkkaile budjettia' : '✕ Budjetti ylittyy'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Päiväkohtainen tahti</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{selectedPw.burnRate} €/pv</div>
                    <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>{selectedPw.daysActive} aktiivista pv</div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                      {selectedPw.projectedAtDeadline !== null ? 'Ennuste deadlineen' : 'Budjettia jäljellä'}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: selectedPw.forecastStatus === 'ok' ? '#34d399' : selectedPw.forecastStatus === 'warning' ? '#fb923c' : '#f87171' }}>
                      {selectedPw.projectedAtDeadline !== null
                        ? `${selectedPw.projectedAtDeadline.toLocaleString('fi-FI')} €`
                        : selectedPw.daysToCompletion !== null ? `${selectedPw.daysToCompletion} pv` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
                      {selectedPw.projectedAtDeadline !== null && selectedPw.budget > 0
                        ? `${Math.round(selectedPw.projectedAtDeadline / selectedPw.budget * 100)} % budjetista`
                        : 'nykyisellä tahdilla'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Valmistumisarvio</div>
                    {selectedPw.estimatedDoneDate ? (
                      <>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                          {selectedPw.estimatedDoneDate.toLocaleDateString('fi-FI')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
                          {selectedPw.daysToCompletion !== null && selectedPw.daysToCompletion > 0
                            ? `${selectedPw.daysToCompletion} pv jäljellä`
                            : 'Budjetti täynnä'}
                        </div>
                      </>
                    ) : <div style={{ fontSize: 14, color: 'var(--faint)' }}>—</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard
            label="Käynnissä olevat projektit" value={activeCount}
            sub={`${projects.length} projektia yhteensä`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>}
            iconBg="rgba(124,58,237,0.15)" iconColor="#a78bfa"
          />
          <StatCard
            label="Budjetin toteuma"
            value={totalBudget > 0 ? `${Math.round(budgetPct)} %` : '—'}
            sub={`${Math.round(totalRevenue).toLocaleString('fi-FI')} € / ${totalBudget.toLocaleString('fi-FI')} €`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
            iconBg="rgba(59,130,246,0.12)" iconColor="#60a5fa"
            progress={budgetPct}
          />
          <StatCard
            label="Laskutettu yhteensä"
            value={`${Math.round(totalRevenue).toLocaleString('fi-FI')} €`}
            sub="kaikki kirjaukset"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            iconBg="rgba(16,185,129,0.12)" iconColor="#34d399"
          />
          <StatCard
            label="Arvioitu kate"
            value={avgKate !== null ? `${Math.round(avgKate)} %` : '—'}
            sub="keskimääräinen jäljellä"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>}
            iconBg="rgba(251,146,60,0.12)" iconColor="#fb923c"
            trend={avgKate !== null ? Math.round(avgKate) : null}
          />
        </div>

        {/* Middle: donut + timeline + bar */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 18px', color: 'var(--text-heading)' }}>Projektien tila</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <DonutChart segments={statusSegments} total={projects.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {statusSegments.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>{s.count}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted-strong)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 18px', color: 'var(--text-heading)' }}>Aikataulu – seuraavat deadlinet</h2>
            {upcoming.length === 0 ? (
              <div style={{ color: 'var(--faint)', fontSize: 13 }}>Ei tulevia deadlineja.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.map(p => {
                  const color = COLORS[projects.findIndex(pr => pr.id === p.id) % COLORS.length]
                  const urgent = p.daysLeft <= 7, soon = p.daysLeft <= 30
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted-strong)', marginTop: 1 }}>{p.client || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: urgent ? '#f87171' : soon ? '#fb923c' : 'var(--muted)' }}>{p.deadline}</div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: urgent ? '#f87171' : '#7c3aed', marginTop: 1 }}>{p.daysLeft} pv</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-heading)' }}>Katteet</h2>
            {avgKate === null ? (
              <div style={{ color: 'var(--faint)', fontSize: 13 }}>Ei kateprosentteja vielä.</div>
            ) : (
              <>
                <GaugeChart score={kateScore} status={kateStatus} />
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0 10px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {viewPw.filter(p => p.kate !== null).map(p => {
                    const kColor = (p.kate ?? 0) >= 20 ? '#34d399' : (p.kate ?? 0) >= 0 ? '#fb923c' : '#f87171'
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: kColor, flexShrink: 0 }}>{Math.round(p.kate ?? 0)} %</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-heading)' }}>Budjetti</h2>
            {pw.filter(p => p.status === 'active').length === 0 ? (
              <div style={{ color: 'var(--faint)', fontSize: 13 }}>Ei aktiivisia projekteja.</div>
            ) : (
              <>
                <GaugeChart score={forecastScore} status={overallForecastStatus} />
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0 10px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {pw.filter(p => p.status === 'active').map(p => {
                    const fcColor = p.forecastStatus === 'ok' ? '#34d399' : p.forecastStatus === 'warning' ? '#fb923c' : p.forecastStatus === 'critical' ? '#f87171' : 'var(--faint-strong)'
                    const fcLabel = p.forecastStatus === 'ok' ? 'OK' : p.forecastStatus === 'warning' ? 'Tarkkaile' : p.forecastStatus === 'critical' ? 'Ylitysriski' : 'Ei dataa'
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: fcColor, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: fcColor, flexShrink: 0 }}>{fcLabel}</span>
                        {p.burnRate > 0 && <span style={{ fontSize: 10.5, color: 'var(--muted)', flexShrink: 0 }}>{p.burnRate} €/pv</span>}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* New project form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18, marginTop: 0, color: 'var(--text-heading)' }}>Uusi projekti</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div><label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Nimi *</label><input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Projektin nimi" /></div>
              <div><label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Asiakas</label><input value={client} onChange={e => setClient(e.target.value)} style={inp} placeholder="Asiakkaan nimi" /></div>
              <div><label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Budjetti (€)</label><input value={budget} onChange={e => setBudget(e.target.value)} type="number" style={inp} placeholder="0" /></div>
              <div><label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Deadline</label><input value={deadline} onChange={e => setDeadline(e.target.value)} type="date" style={inp} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addProject} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Tallenna</button>
              <button onClick={() => setShowForm(false)} style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 20px', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>Peruuta</button>
            </div>
          </div>
        )}

        {/* Projects table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'visible' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-heading)' }}>Projektit yhteenveto</h2>
            {isOwner && (
              <button onClick={() => setShowForm(v => !v)} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                + Uusi projekti
              </button>
            )}
          </div>
          {viewPw.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>Ei projekteja vielä. Lisää ensimmäinen projekti!</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: 'Projekti', mob: false },
                    { label: 'Tila',     mob: false },
                    { label: 'Aikataulu',mob: true  },
                    { label: 'Budjetti', mob: false },
                    { label: 'Toteuma',  mob: true  },
                    { label: 'Kate',     mob: true  },
                    { label: 'Ennuste',  mob: true  },
                    { label: '',         mob: false },
                  ].map(({ label, mob }) => (
                    <th key={label} className={mob ? 'mob-hide' : ''} style={{ textAlign: 'left', padding: '12px 18px', color: 'var(--faint-strong)', fontWeight: 500, fontSize: 12 }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewPw.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${p.color}18`, border: `1px solid ${p.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: p.color }}>
                          {p.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-soft)', fontSize: 13.5 }}>{p.name}</div>
                          {p.client && <div style={{ fontSize: 11.5, color: 'var(--muted-strong)', marginTop: 2 }}>{p.client}</div>}
                          <input
                            type="text"
                            value={localNotes[p.id] ?? ''}
                            onChange={e => setLocalNotes(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
                            onBlur={e => { e.currentTarget.style.borderBottomColor = 'transparent'; saveNote(p.id, e.currentTarget.value) }}
                            onClick={e => e.stopPropagation()}
                            placeholder="Lisää muistiinpano…"
                            style={{ marginTop: 5, display: 'block', width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', color: 'var(--muted)', fontSize: 11.5, fontFamily: 'system-ui', outline: 'none', padding: '2px 0', transition: 'border-color .15s' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        onClick={e => { e.stopPropagation(); toggleStatus(p) }}
                        title="Klikkaa vaihtaaksesi tilaa"
                        style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 20, fontWeight: 600, cursor: 'pointer', userSelect: 'none', background: p.status === 'active' ? 'rgba(251,146,60,0.15)' : 'rgba(16,185,129,0.12)', color: p.status === 'active' ? '#fb923c' : '#34d399', border: `1px solid ${p.status === 'active' ? 'rgba(251,146,60,0.35)' : 'rgba(16,185,129,0.25)'}` }}
                      >
                        {p.status === 'active' ? 'Käynnissä' : 'Valmis'}
                      </span>
                    </td>
                    <td className="mob-hide" style={{ padding: '14px 18px', minWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: p.color, width: `${p.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--text-soft)', fontWeight: 500, width: 38, textAlign: 'right', flexShrink: 0 }}>{p.progress.toFixed(0)} %</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>{p.budget ? `${p.budget.toLocaleString('fi-FI')} €` : '—'}</td>
                    <td className="mob-hide" style={{ padding: '14px 18px', color: 'var(--text-soft)', fontWeight: 500 }}>{(p.revenue + p.expenses) > 0 ? `${Math.round(p.revenue + p.expenses).toLocaleString('fi-FI')} €` : '—'}</td>
                    <td className="mob-hide" style={{ padding: '14px 18px' }}>
                      {p.kate !== null ? (
                        <span style={{ color: p.kate > 0 ? '#34d399' : '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {Math.round(p.kate)} %
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {p.kate > 0 ? <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></> : <><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>}
                          </svg>
                        </span>
                      ) : <span style={{ color: 'var(--faint)' }}>—</span>}
                    </td>
                    <td className="mob-hide" style={{ padding: '14px 18px' }}>
                      {p.forecastStatus === 'no_data' ? (
                        <span style={{ color: 'var(--faint)', fontSize: 12.5 }}>—</span>
                      ) : (
                        <span style={{
                          fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                          background: p.forecastStatus === 'ok' ? 'rgba(52,211,153,0.1)' : p.forecastStatus === 'warning' ? 'rgba(251,146,60,0.1)' : 'rgba(248,113,113,0.1)',
                          color: p.forecastStatus === 'ok' ? '#34d399' : p.forecastStatus === 'warning' ? '#fb923c' : '#f87171',
                        }}>
                          {p.forecastStatus === 'ok' ? '✓ OK' : p.forecastStatus === 'warning' ? '⚠ Tarkkaile' : '✕ Riski'}
                        </span>
                      )}
                    </td>
                    {isOwner && (
                      <td style={{ padding: '14px 18px', width: 48 }}>
                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', padding: '5px 7px', borderRadius: 7, display: 'flex', alignItems: 'center' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'var(--border)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                          </button>
                          {activeMenu === p.id && (
                            <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 200, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, minWidth: 160, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
                              <button
                                onClick={() => openEdit(p)}
                                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-soft)', fontSize: 13, cursor: 'pointer', padding: '8px 12px', borderRadius: 7, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseOver={e => (e.currentTarget.style.background = 'var(--border)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'none')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Muokkaa
                              </button>
                              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                              <button
                                onClick={() => deleteProject(p.id)}
                                style={{ width: '100%', background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer', padding: '8px 12px', borderRadius: 7, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseOver={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'none')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                Poista projekti
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Edit modal */}
      {editingProject && (
        <div
          onClick={() => setEditingProject(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '28px', width: 420, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Muokkaa projektia</h2>
              <button onClick={() => setEditingProject(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 6px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
              <div>
                <label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Nimi *</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 13px', color: 'var(--text-soft)', fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Budjetti (€)</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={e => setEditBudget(e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 13px', color: 'var(--text-soft)', fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={e => setEditDeadline(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 13px', color: 'var(--text-soft)', fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={saveEdit}
                disabled={!editName}
                style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: editName ? 'pointer' : 'not-allowed', opacity: editName ? 1 : 0.5 }}
              >
                Tallenna muutokset
              </button>
              <button
                onClick={() => setEditingProject(null)}
                style={{ padding: '11px 18px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}
              >
                Peruuta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
