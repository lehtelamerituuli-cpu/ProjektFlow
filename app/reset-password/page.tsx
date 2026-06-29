'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (password.length < 6) { setError('Salasanan tulee olla vähintään 6 merkkiä'); return }
    if (password !== confirm) { setError('Salasanat eivät täsmää'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setError('Salasana vaihdettu! Ohjataan kirjautumiseen...')
    setTimeout(() => router.push('/login'), 2000)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">ProjektFlow</h1>
        <p className="text-gray-400 text-sm mb-8">Aseta uusi salasana</p>

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

        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: error.includes('vaihdettu') ? '#4ade80' : '#f87171' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Hetki...' : 'Vaihda salasana'}
        </button>
      </div>
    </main>
  )
}
