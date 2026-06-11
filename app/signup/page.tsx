'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold mb-3">Check your email</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to activate your account and start earning.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-block">
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              💎
            </div>
            <span className="font-bold text-2xl gradient-text">RewardHub</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join 85,000+ members earning daily</p>
        </div>

        <div className="glass-card p-8" style={{ boxShadow: '0 24px 80px rgba(139,92,246,0.08)' }}>
          <form onSubmit={handleSignup} className="space-y-5">
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
                id="signup-email"
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
                id="signup-password"
                type="password"
                className="input-field"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                className="input-field"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              id="signup-btn"
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              <span>{loading ? 'Creating account...' : 'Create Free Account'}</span>
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold" style={{ color: 'var(--accent-purple)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
