'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  wallet_address: string
  method: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string
  created_at: string
  profiles: {
    username: string
    email: string
  }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadWithdrawals = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, user_id, amount, wallet_address, method, status, admin_note, created_at, profiles(username, email)')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage({ type: 'error', text: `Failed to load withdrawals: ${error.message}` })
    } else {
      setWithdrawals(data as any[] ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: id,
          action,
          adminNote: notes[id] || ''
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} withdrawal request.` })
        // Reload table data
        await loadWithdrawals()
      } else {
        setMessage({ type: 'error', text: data.error || 'Action failed.' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleNoteChange = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }))
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-yellow',
      approved: 'badge-green',
      rejected: 'badge-red',
    }
    return `badge ${map[status] ?? 'badge-purple'}`
  }

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-1">Withdrawal Requests</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review pending cashout requests, approve payout to USDT addresses, or reject and refund balance.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm max-w-xl ${message.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {message.text}
        </div>
      )}

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold">Withdrawal Queue</h2>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No withdrawal requests registered in system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Date</th>
                  <th>Member Detail</th>
                  <th>Amount</th>
                  <th>Wallet Address (USDT)</th>
                  <th>Status</th>
                  <th>Admin Action Note / Review Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((wd) => (
                  <tr key={wd.id}>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(wd.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <div className="font-semibold text-xs">{wd.profiles?.username || 'user'}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wd.profiles?.email}</div>
                    </td>
                    <td className="font-bold text-xs text-red-400">${Number(wd.amount).toFixed(2)}</td>
                    <td className="font-mono text-xs max-w-[200px] truncate" title={wd.wallet_address}>
                      {wd.wallet_address}
                    </td>
                    <td>
                      <span className={statusBadge(wd.status)} style={{ textTransform: 'capitalize' }}>
                        {wd.status}
                      </span>
                    </td>
                    <td>
                      {wd.status === 'pending' ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-sm">
                          <input
                            type="text"
                            placeholder="Add admin note..."
                            className="input-field py-1 px-2 text-xs w-full sm:w-44 font-sans"
                            value={notes[wd.id] || ''}
                            onChange={(e) => handleNoteChange(wd.id, e.target.value)}
                          />
                          <div className="flex gap-1.5 flex-shrink-0 w-full sm:w-auto justify-end">
                            <button
                              id={`approve-btn-${wd.id}`}
                              disabled={processingId !== null}
                              onClick={() => handleAction(wd.id, 'approve')}
                              className="badge badge-green cursor-pointer text-[10px] py-1.5 px-3 rounded-lg hover:scale-105 transition-transform"
                            >
                              Approve
                            </button>
                            <button
                              id={`reject-btn-${wd.id}`}
                              disabled={processingId !== null}
                              onClick={() => handleAction(wd.id, 'reject')}
                              className="badge badge-red cursor-pointer text-[10px] py-1.5 px-3 rounded-lg hover:scale-105 transition-transform"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                          Note: {wd.admin_note || 'None'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
