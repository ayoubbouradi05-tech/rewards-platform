'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      <div className="fixed bottom-0 right-1/3 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              💎
            </div>
            <span className="font-bold text-2xl gradient-text">RewardHub</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue earning</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8" style={{ boxShadow: '0 24px 80px rgba(139,92,246,0.08)' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold" style={{ color: 'var(--accent-purple)' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
