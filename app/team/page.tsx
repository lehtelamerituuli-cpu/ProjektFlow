'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/Sidebar'
import { supabase } from '@/lib/supabase'

type Member = { user_id: string; email: string; role: string; joined_at: string }
type Invite = { id: string; email: string; created_at: string; expires_at: string }
type TimeEntry = { id: string; user_id: string; date: string; hours: number; rate: number; description: string; projects: { name: string } | null }
type TravelEntry = { id: string; user_id: string; date: string; km: number; rate: number; description: string; projects: { name: string } | null }

export default function TeamPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [team, setTeam] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [travelEntries, setTravelEntries] = useState<TravelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'members' | 'entries'>('members')
  const [profileNames, setProfileNames] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null)
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fetchTeam = useCallback(async (tok: string) => {
    const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${tok}` } })
    const data = await res.json()
    setTeam(data.team)
    setMembership(data.membership)
    setMembers(data.members || [])
    setInvites(data.invites || [])
    setLoading(false)
    const { data: profilesData } = await supabase.from('profiles').select('id, display_name')
    const pm: Record<string, string> = {}
    for (const p of (profilesData || [])) if (p.display_name) pm[p.id] = p.display_name
    setProfileNames(pm)
  }, [])

  const fetchEntries = useCallback(async (tok: string) => {
    const res = await fetch('/api/team/entries', { headers: { Authorization: `Bearer ${tok}` } })
    if (res.ok) {
      const data = await res.json()
      setTimeEntries(data.timeEntries || [])
      setTravelEntries(data.travelEntries || [])
    }
  }, [])

  useEffect(() => {
    if (!token) return
    fetchTeam(token)
  }, [token, fetchTeam])

  useEffect(() => {
    if (!token || membership?.role !== 'owner') return
    fetchEntries(token)
  }, [token, membership, fetchEntries])

  async function createTeam() {
    if (!teamName.trim() || !token) return
    setCreating(true)
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: teamName.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      await fetchTeam(token)
      setMsg('Tiimi luotu!')
    } else {
      setMsg(data.error || 'Virhe tiimin luomisessa.')
    }
    setCreating(false)
  }

  async function removeMember(userId: string) {
    if (!token) return
    const res = await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setMsg('Jäsen poistettu.')
      await fetchTeam(token)
    } else {
      const data = await res.json()
      setMsg(data.error || 'Virhe poistamisessa.')
    }
  }

  async function revokeInvite(inviteId: string) {
    if (!token) return
    await fetch('/api/team/invite', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ inviteId }),
    })
    await fetchTeam(token)
    setMsg('Kutsu peruttu.')
  }

  async function resendInvite(email: string, inviteId: string) {
    if (!token) return
    await revokeInvite(inviteId)
    setInviteEmail(email)
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      setMsg('Kutsu lähetetty uudelleen!')
      await fetchTeam(token)
    } else {
      const data = await res.json()
      setMsg(data.error || 'Virhe kutsun lähettämisessä.')
    }
  }

  async function sendInvite() {
    if (!inviteEmail.trim() || !token) return
    setInviting(true)
    setMsg('')
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setInviteEmail('')
      setMsg('Kutsu lähetetty!')
      await fetchTeam(token)
    } else {
      setMsg(data.error || 'Virhe kutsun lähettämisessä.')
    }
    setInviting(false)
  }

  const memberEmailMap = Object.fromEntries(members.map(m => [m.user_id, m.email]))

  const memberStats = members.map(m => {
    const te = timeEntries.filter(e => e.user_id === m.user_id)
    const tv = travelEntries.filter(e => e.user_id === m.user_id)
    const totalHours = te.reduce((s, e) => s + e.hours, 0)
    const totalIncome = te.reduce((s, e) => s + e.hours * e.rate, 0)
    const totalKm = tv.reduce((s, e) => s + e.km, 0)
    return { ...m, totalHours, totalIncome, totalKm }
  })

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {user && <Sidebar user={user} onLogout={logout} />}
      <main style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Ladataan...</p>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {user && <Sidebar user={user} onLogout={logout} />}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Tiimi</h1>

        {!team ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', maxWidth: 440 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Luo tiimi</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Luo tiimi ja kutsu työkaverit sähköpostilla. Esimiehenä näet kaikkien merkinnät.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Tiimin nimi"
                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem' }}
                onKeyDown={e => e.key === 'Enter' && createTeam()}
              />
              <button
                onClick={createTeam}
                disabled={creating}
                style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                {creating ? '...' : 'Luo'}
              </button>
            </div>
            {msg && <p style={{ marginTop: '0.75rem', color: 'var(--accent)', fontSize: '0.9rem' }}>{msg}</p>}
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{team.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
                  {membership?.role === 'owner' ? 'Esimies' : 'Jäsen'} · {members.length} jäsentä
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['members', 'entries'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.45rem 1.1rem',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: activeTab === tab ? 'var(--accent)' : 'var(--surface)',
                    color: activeTab === tab ? '#fff' : 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {tab === 'members' ? 'Jäsenet' : 'Merkinnät'}
                </button>
              ))}
            </div>

            {activeTab === 'members' && (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Sähköposti</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Rooli</th>
                        {membership?.role === 'owner' && (
                          <>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Tunnit</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Tulot</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}></th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {memberStats.map(m => (
                        <tr key={m.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.95rem' }}>
                            {profileNames[m.user_id] || m.email}
                            {profileNames[m.user_id] && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>{m.email}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: 6,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: m.role === 'owner' ? 'rgba(124,58,237,0.15)' : 'rgba(100,100,100,0.1)',
                              color: m.role === 'owner' ? 'var(--accent)' : 'var(--text-muted)',
                            }}>
                              {m.role === 'owner' ? 'Esimies' : 'Jäsen'}
                            </span>
                          </td>
                          {membership?.role === 'owner' && (
                            <>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.95rem' }}>{m.totalHours.toFixed(1)} h</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.95rem' }}>{m.totalIncome.toFixed(2)} €</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                {m.role !== 'owner' && (
                                  <button
                                    onClick={() => { if (confirm(`Poistetaanko ${profileNames[m.user_id] || m.email} tiimistä?`)) removeMember(m.user_id) }}
                                    style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', borderRadius: 5 }}
                                    onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
                                    onMouseOut={e => (e.currentTarget.style.color = 'var(--faint)')}
                                  >
                                    Poista
                                  </button>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {membership?.role === 'owner' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Kutsu jäsen</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="sähköposti@esimerkki.fi"
                        style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem' }}
                        onKeyDown={e => e.key === 'Enter' && sendInvite()}
                      />
                      <button
                        onClick={sendInvite}
                        disabled={inviting}
                        style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                      >
                        {inviting ? '...' : 'Kutsu'}
                      </button>
                    </div>
                    {msg && <p style={{ marginTop: '0.75rem', color: 'var(--accent)', fontSize: '0.9rem' }}>{msg}</p>}
                  </div>
                )}

                {invites.length > 0 && membership?.role === 'owner' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                    <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Odottavat kutsut</h3>
                    {invites.map(inv => (
                      <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{inv.email}</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                            Vanhenee {new Date(inv.expires_at).toLocaleDateString('fi-FI')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => resendInvite(inv.email, inv.id)}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Lähetä uudelleen
                          </button>
                          <button
                            onClick={() => revokeInvite(inv.id)}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: 6, border: 'none', background: 'rgba(248,113,113,0.12)', color: '#f87171', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Peruuta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'entries' && membership?.role === 'owner' && (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>Työtunnit</div>
                  {timeEntries.length === 0 ? (
                    <p style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ei merkintöjä.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Henkilö</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Päivä</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Projekti</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Tunnit</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Summa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeEntries.map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profileNames[e.user_id] || memberEmailMap[e.user_id] || e.user_id.slice(0, 8)}</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }}>{new Date(e.date).toLocaleDateString('fi-FI')}</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }}>{e.projects?.name || '—'}</td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.9rem' }}>{e.hours} h</td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.9rem' }}>{(e.hours * e.rate).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>Matkat</div>
                  {travelEntries.length === 0 ? (
                    <p style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ei matkakirjauksia.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Henkilö</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Päivä</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Projekti</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>km</th>
                          <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>Summa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {travelEntries.map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profileNames[e.user_id] || memberEmailMap[e.user_id] || e.user_id.slice(0, 8)}</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }}>{new Date(e.date).toLocaleDateString('fi-FI')}</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }}>{e.projects?.name || '—'}</td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.9rem' }}>{e.km} km</td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text)', fontSize: '0.9rem' }}>{(e.km * e.rate).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {activeTab === 'entries' && membership?.role !== 'owner' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Vain esimies voi nähdä kaikkien merkinnät.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
