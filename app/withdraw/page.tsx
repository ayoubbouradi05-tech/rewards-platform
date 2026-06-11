'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [withdrawals, setWithdrawals] = useState<Array<{
    id: string; amount: number; status: string; created_at: string; wallet_address: string
  }>>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (profile) setBalance(Number(profile.balance))

      const { data: wds } = await supabase
        .from('withdrawals')
        .select('id, amount, status, created_at, wallet_address')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (wds) setWithdrawals(wds)
      setPageLoading(false)
    }
    load()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), walletAddress }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: '✅ Withdrawal request submitted! Processing within 24-48 hours.' })
      setBalance(prev => prev - parseFloat(amount))
      setAmount('')
      setWalletAddress('')
      // Reload withdrawals
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: wds } = await supabase
          .from('withdrawals')
          .select('id, amount, status, created_at, wallet_address')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (wds) setWithdrawals(wds)
      }
    } else {
      setMessage({ type: 'error', text: data.error ?? 'Withdrawal failed. Please try again.' })
    }
    setLoading(false)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-yellow',
      approved: 'badge-green',
      rejected: 'badge-red',
    }
    return `badge ${map[status] ?? 'badge-purple'}`
  }

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">Withdraw Earnings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Send your earnings to your USDT (TRC-20) wallet.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Withdraw Form */}
        <div className="glass-card p-8">
          {/* Balance display */}
          <div className="p-5 rounded-2xl mb-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Available Balance</p>
            <p className="text-4xl font-bold text-green-400">${balance.toFixed(2)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>USDT equivalent</p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-5 text-sm ${message.type === 'success' ? 'toast-success' : 'toast-error'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Withdrawal Method
              </label>
              <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <span className="text-2xl">₮</span>
                <div>
                  <p className="font-semibold text-sm">USDT (TRC-20)</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tron Network · Fast & Low Fees</p>
                </div>
                <span className="ml-auto badge badge-green">Available</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-secondary)' }}>$</span>
                <input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  min="5"
                  max={balance}
                  className="input-field pl-8"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Minimum: $5.00</p>
                <button
                  type="button"
                  className="text-xs font-medium"
                  style={{ color: 'var(--accent-purple)' }}
                  onClick={() => setAmount(balance.toFixed(2))}
                >
                  Use Max
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                USDT Wallet Address (TRC-20)
              </label>
              <input
                id="wallet-address"
                type="text"
                className="input-field font-mono text-sm"
                placeholder="T..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                ⚠️ Double-check your address. Transactions are irreversible.
              </p>
            </div>

            <button
              id="withdraw-btn"
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading || balance < 5}
            >
              <span>
                {loading ? 'Processing...' : balance < 5 ? `Need $${(5 - balance).toFixed(2)} more` : 'Request Withdrawal'}
              </span>
            </button>
          </form>
        </div>

        {/* Info + history */}
        <div className="space-y-6">
          {/* Info */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Withdrawal Info</h3>
            <div className="space-y-3 text-sm">
              {[
                ['⏱️', 'Processing Time', '24–48 hours'],
                ['💎', 'Minimum Amount', '$5.00'],
                ['🔄', 'Network', 'USDT TRC-20 (Tron)'],
                ['💸', 'Fees', 'None — we cover fees'],
                ['📊', 'Status Updates', 'Check withdrawals table'],
              ].map(([icon, label, val]) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal history */}
          <div className="glass-card overflow-hidden">
            <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold">Recent Withdrawals</h3>
            </div>
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No withdrawals yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((wd) => (
                      <tr key={wd.id}>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(wd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="font-bold text-green-400">${Number(wd.amount).toFixed(2)}</td>
                        <td>
                          <span className={statusBadge(wd.status)} style={{ textTransform: 'capitalize' }}>
                            {wd.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
