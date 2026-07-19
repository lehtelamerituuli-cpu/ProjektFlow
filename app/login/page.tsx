'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Salasanan palautuslinkki lähetetty sähköpostiisi!')
      setLoading(false)
      return
    }

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || email.split('@')[0] } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Tarkista sähköpostisi ja vahvista rekisteröinti!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Väärä sähköposti tai salasana'); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  function reset() {
    setIsForgot(false)
    setIsRegister(false)
    setError('')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">ProjektFlow</h1>
        <p className="text-gray-400 text-sm mb-8">
          {isForgot ? 'Nollaa salasana' : isRegister ? 'Luo uusi tili' : 'Kirjaudu sisään'}
        </p>

        {isRegister && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Nimesi</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              type="text"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
              placeholder="Matti Meikäläinen"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-1 block">Sähköposti</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
            placeholder="nimi@yritys.fi"
          />
        </div>

        {!isForgot && (
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-1 block">Salasana</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        )}

        {isForgot && <div className="mb-6" />}

        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: error.includes('lähetetty') || error.includes('Tarkista') ? '#4ade80' : '#f87171' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition mb-4 disabled:opacity-50"
        >
          {loading ? 'Hetki...' : isForgot ? 'Lähetä palautuslinkki' : isRegister ? 'Rekisteröidy' : 'Kirjaudu'}
        </button>

        {!isForgot && (
          <>
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="w-full text-gray-400 hover:text-white text-sm transition mb-3"
            >
              {isRegister ? 'Onko sinulla jo tili? Kirjaudu' : 'Ei tiliä? Rekisteröidy'}
            </button>
            {!isRegister && (
              <button
                onClick={() => { setIsForgot(true); setError('') }}
                className="w-full text-gray-500 hover:text-gray-300 text-sm transition"
              >
                Unohdin salasanani
              </button>
            )}
          </>
        )}

        {isForgot && (
          <button
            onClick={reset}
            className="w-full text-gray-400 hover:text-white text-sm transition"
          >
            Takaisin kirjautumiseen
          </button>
        )}
      </div>
    </main>
  )
}
