'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/Sidebar'
import { useIsMobile } from '@/app/hooks/useIsMobile'
import { BREAK_THRESHOLD_HOURS, BREAK_DEDUCTION_HOURS } from '@/lib/config'

export default function Time() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [rate, setRate] = useState('75')
  const [description, setDescription] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [projectRates, setProjectRates] = useState<Record<string, number>>({})
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const isMobile = useIsMobile()

  const TIMER_KEY = 'fh_timer'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase.from('projects').select('*').eq('user_id', data.user.id).eq('status', 'active').then(({ data: d }) => {
        setProjects(d || [])
        const saved = localStorage.getItem(TIMER_KEY)
        if (saved) {
          const { startTime, projectId: pid, rate: r } = JSON.parse(saved)
          setTimerRunning(true)
          setTimerStart(startTime)
          setTimerSeconds(Math.floor((Date.now() - startTime) / 1000))
          if (pid) setProjectId(pid)
          if (r) setRate(String(r))
        } else if (d && d.length > 0) {
          setProjectId(d[0].id)
        }
      })
      loadEntries(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (!timerRunning || timerStart === null) return
    const interval = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStart) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning, timerStart])

  async function loadEntries(_uid: string) {
    const { data } = await supabase.from('time_entries').select('*, projects(name)').order('date', { ascending: false })
    const loaded = data || []
    setEntries(loaded)
    const rates: Record<string, number> = {}
    for (const e of loaded) {
      if (e.project_id && !rates[e.project_id]) rates[e.project_id] = e.rate
    }
    setProjectRates(rates)
    if (projectId && rates[projectId]) setRate(String(rates[projectId]))
  }

  function timeToHours(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h + m / 60
  }

  async function addEntry() {
    if (!projectId || !user) return
    let rawH: number
    let st = startTime || undefined
    let et = endTime || undefined
    if (startTime && endTime) {
      rawH = parseFloat((timeToHours(endTime) - timeToHours(startTime)).toFixed(2))
      if (rawH <= 0) return
    } else {
      if (!hours) return
      rawH = parseFloat(hours)
    }
    const breakDeducted = rawH >= BREAK_THRESHOLD_HOURS
    const finalH = breakDeducted ? parseFloat((rawH - BREAK_DEDUCTION_HOURS).toFixed(2)) : rawH
    const finalDesc = breakDeducted && !description
      ? `−${BREAK_DEDUCTION_HOURS * 60} min tauko vähennetty`
      : description
    await supabase.from('time_entries').insert({ project_id: projectId, date, hours: finalH, rate: parseFloat(rate) || 0, description: finalDesc, user_id: user.id, start_time: st || null, end_time: et || null })
    setHours(''); setDescription(''); setStartTime(''); setEndTime(''); setShowForm(false)
    loadEntries(user.id)
  }

  function startTimer() {
    const start = Date.now()
    setTimerStart(start)
    setTimerRunning(true)
    setTimerSeconds(0)
    localStorage.setItem(TIMER_KEY, JSON.stringify({ startTime: start, projectId, rate: parseFloat(rate) || 0 }))
  }

  async function stopTimer() {
    const stopTs = Date.now()
    setTimerRunning(false)
    setTimerStart(null)
    localStorage.removeItem(TIMER_KEY)
    let h = parseFloat((timerSeconds / 3600).toFixed(2))
    if (h > 0 && projectId && user) {
      const breakDeducted = h >= BREAK_THRESHOLD_HOURS
      if (breakDeducted) h = parseFloat((h - BREAK_DEDUCTION_HOURS).toFixed(2))
      const desc = breakDeducted
        ? `Ajastettu työ (−${BREAK_DEDUCTION_HOURS * 60} min tauko vähennetty)`
        : 'Ajastettu työ'
      const fmt2 = (ts: number) => new Date(ts).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
      const st = timerStart ? fmt2(timerStart) : null
      const et = fmt2(stopTs)
      await supabase.from('time_entries').insert({ project_id: projectId, date: new Date().toISOString().split('T')[0], hours: h, rate: parseFloat(rate) || 0, description: desc, user_id: user.id, start_time: st, end_time: et })
      loadEntries(user.id)
    }
    setTimerSeconds(0)
  }

  async function deleteEntry(id: string) {
    await supabase.from('time_entries').delete().eq('id', id)
    loadEntries(user.id)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const ENTRY_COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#8b5cf6']
  function projectColor(id: string) {
    let h = 0
    for (const c of (id || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff
    return ENTRY_COLORS[h % ENTRY_COLORS.length]
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  function dateLabel(d: string) {
    const date = new Date(d + 'T12:00:00')
    const wd = date.toLocaleDateString('fi-FI', { weekday: 'long' })
    const dm = date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })
    if (d === todayStr) return `Tänään, ${wd} ${dm}`
    if (d === yesterdayStr) return `Eilen, ${wd} ${dm}`
    return `${wd.charAt(0).toUpperCase() + wd.slice(1)} ${dm}`
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '9px 13px', color: 'var(--text-soft)',
    fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box',
  }

  const filtered = entries.filter(e => {
    if (filterProject && e.project_id !== filterProject) return false
    if (filterDateFrom && e.date < filterDateFrom) return false
    if (filterDateTo && e.date > filterDateTo) return false
    return true
  })

  const totalHours = filtered.reduce((s, e) => s + e.hours, 0)
  const totalRevenue = filtered.reduce((s, e) => s + e.hours * e.rate, 0)
  const hasFilter = !!(filterProject || filterDateFrom || filterDateTo)

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui,sans-serif'}}>
      {user && <Sidebar user={user} onLogout={logout} />}
      <main style={{flex: 1, padding: isMobile ? '72px 16px 24px' : '32px 36px', overflow: 'auto'}}>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28}}>
          <div>
            <h1 style={{fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text)'}}>Työajan seuranta</h1>
            <p style={{color: 'var(--muted-strong)', marginTop: 5, fontSize: 13.5}}>
              {totalHours.toFixed(1)} h · {totalRevenue.toFixed(0)} € kirjattu yhteensä
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'}}
          >
            + Lisää kirjaus
          </button>
        </div>

        {/* Timer */}
        <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px', marginBottom: 16}}>
          <div style={{fontSize: 12, color: 'var(--muted-strong)', fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            AJASTIN
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <span style={{fontSize: 38, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timerRunning ? '#a78bfa' : 'var(--text)', letterSpacing: '-1px'}}>
              {fmt(timerSeconds)}
            </span>
            <select value={projectId} onChange={e => { const id = e.target.value; setProjectId(id); if (projectRates[id]) setRate(String(projectRates[id])) }} style={{...inp, width: 180}}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={rate} onChange={e => setRate(e.target.value)} type="number" style={{...inp, width: 90}} placeholder="€/h" />
            {!timerRunning
              ? (
                <button onClick={startTimer} style={{background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Käynnistä
                </button>
              ) : (
                <button onClick={stopTimer} style={{background: 'linear-gradient(135deg,#dc2626,#b91c1c)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                  Pysäytä ja tallenna
                </button>
              )
            }
          </div>
        </div>

        {showForm && (
          <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 16}}>
            <h2 style={{fontSize: 14, fontWeight: 600, marginBottom: 18, marginTop: 0, color: 'var(--text-heading)'}}>Lisää kirjaus</h2>
            <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 16}}>
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Projekti</label>
                <select value={projectId} onChange={e => { const id = e.target.value; setProjectId(id); if (projectRates[id]) setRate(String(projectRates[id])) }} style={inp}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Päivämäärä</label>
                <input value={date} onChange={e => setDate(e.target.value)} type="date" style={inp} />
              </div>
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Aloitusaika</label>
                <input value={startTime} onChange={e => setStartTime(e.target.value)} type="time" style={inp} />
              </div>
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Lopetusaika</label>
                <input value={endTime} onChange={e => setEndTime(e.target.value)} type="time" style={inp} />
                {startTime && endTime && timeToHours(endTime) > timeToHours(startTime) && (
                  <div style={{ marginTop: 5, fontSize: 11.5, color: 'var(--muted)' }}>
                    Kesto: {(timeToHours(endTime) - timeToHours(startTime)).toFixed(2)} h
                    {(timeToHours(endTime) - timeToHours(startTime)) >= BREAK_THRESHOLD_HOURS && (
                      <span style={{ color: '#fb923c' }}> → {(timeToHours(endTime) - timeToHours(startTime) - BREAK_DEDUCTION_HOURS).toFixed(2)} h (tauko vähennetty)</span>
                    )}
                  </div>
                )}
              </div>
              {!(startTime && endTime) && (
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Tunnit (jos ei aikoja)</label>
                <input value={hours} onChange={e => setHours(e.target.value)} type="number" step="0.5" style={inp} placeholder="0.0" />
                {parseFloat(hours) >= BREAK_THRESHOLD_HOURS && (
                  <div style={{ marginTop: 5, fontSize: 11.5, color: '#fb923c' }}>
                    ⚠ Yli {BREAK_THRESHOLD_HOURS} h — {BREAK_DEDUCTION_HOURS * 60} min tauko vähennetään → {(parseFloat(hours) - BREAK_DEDUCTION_HOURS).toFixed(2)} h kirjataan
                  </div>
                )}
              </div>
              )}
              <div>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Tuntihinta (€/h)</label>
                <input value={rate} onChange={e => setRate(e.target.value)} type="number" style={inp} placeholder="75" />
              </div>
              <div style={{gridColumn: '1/-1'}}>
                <label style={{fontSize: 11.5, color: 'var(--muted-strong)', display: 'block', marginBottom: 6, fontWeight: 500}}>Kuvaus</label>
                <input value={description} onChange={e => setDescription(e.target.value)} style={inp} placeholder="Mitä teit?" />
              </div>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              <button onClick={addEntry} style={{background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'}}>Tallenna</button>
              <button onClick={() => setShowForm(false)} style={{background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 20px', color: 'var(--muted)', fontSize: 13, cursor: 'pointer'}}>Peruuta</button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 140 }}>
            <option value="">Kaikki projektit</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ ...inp, width: 'auto' }} title="Alkupäivä" />
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ ...inp, width: 'auto' }} title="Loppupäivä" />
          {hasFilter && (
            <button onClick={() => { setFilterProject(''); setFilterDateFrom(''); setFilterDateTo('') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
              Tyhjennä suodatin
            </button>
          )}
          {hasFilter && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
              {filtered.length}/{entries.length} kirjausta · {totalHours.toFixed(1)} h · {totalRevenue.toFixed(0)} €
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '48px', textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>
            Ei kirjauksia vielä.
          </div>
        ) : (() => {
          const grouped: Record<string, typeof filtered> = {}
          for (const e of filtered) {
            if (!grouped[e.date]) grouped[e.date] = []
            grouped[e.date].push(e)
          }
          const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {dates.map(d => {
                const dayEntries = grouped[d]
                const dayHours = dayEntries.reduce((s: number, e: any) => s + e.hours, 0)
                const dayRevenue = dayEntries.reduce((s: number, e: any) => s + e.hours * e.rate, 0)
                return (
                  <div key={d}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', letterSpacing: '-0.2px' }}>
                        {dateLabel(d)}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {dayHours.toFixed(1)} h · {dayRevenue.toFixed(0)} €
                      </span>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                      {dayEntries.map((e: any, i: number) => {
                        const color = projectColor(e.project_id)
                        return (
                          <div
                            key={e.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < dayEntries.length - 1 ? '1px solid var(--border-subtle)' : 'none', position: 'relative' }}
                          >
                            <div style={{ width: 3, height: 36, borderRadius: 4, background: color, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-soft)', marginBottom: 2 }}>
                                {e.projects?.name || '—'}
                              </div>
                              {e.description && (
                                <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {e.description}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {e.start_time && e.end_time && (
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>
                                  {e.start_time}–{e.end_time}
                                </div>
                              )}
                              <div style={{ fontSize: 14, fontWeight: 700, color: color }}>
                                {e.hours % 1 === 0 ? e.hours : e.hours.toFixed(1)} h
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>
                                {(e.hours * e.rate).toFixed(0)} €
                              </div>
                            </div>
                            <button
                              onClick={() => deleteEntry(e.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: 16, padding: '0 2px', flexShrink: 0 }}
                              onMouseOver={ev => (ev.currentTarget.style.color = '#f87171')}
                              onMouseOut={ev => (ev.currentTarget.style.color = 'var(--faint)')}
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </main>
    </div>
  )
}
