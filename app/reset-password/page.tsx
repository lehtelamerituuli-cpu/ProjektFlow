'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user arrives via reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (password.length < 6) { setIsError(true); setMessage('Salasanan tulee olla vähintään 6 merkkiä'); return }
    if (password !== confirm) { setIsError(true); setMessage('Salasanat eivät täsmää'); return }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setIsError(true); setMessage(error.message); setLoading(false); return }

    // Sign out immediately so user must log in with new password
    await supabase.auth.signOut()
    setDone(true)
    setIsError(false)
    setMessage('Salasana vaihdettu onnistuneesti!')
    setLoading(false)
    setTimeout(() => router.push('/login'), 2500)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">ProjektFlow</h1>
        <p className="text-gray-400 text-sm mb-8">Aseta uusi salasana</p>

        {!ready && !done && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 14 }}>
            Ladataan — odota hetki...
          </div>
        )}

        {ready && !done && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Uusi salasana</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-1 block">Toista salasana</label>
              <input
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                type="password"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleReset()}
              />
            </div>

            {message && (
              <p className="text-sm mb-4 text-center" style={{ color: isError ? '#f87171' : '#4ade80' }}>
                {message}
              </p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Hetki...' : 'Vaihda salasana'}
            </button>
          </>
        )}

        {done && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ color: '#4ade80', fontSize: 14, marginBottom: 8 }}>Salasana vaihdettu onnistuneesti!</p>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Ohjataan kirjautumiseen...</p>
          </div>
        )}
      </div>
    </main>
  )
}
