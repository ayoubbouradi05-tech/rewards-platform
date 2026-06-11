import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Transactions — RewardHub',
  description: 'View your complete earnings and withdrawal history.',
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalCredits = transactions
    ?.filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

  const totalDebits = transactions
    ?.filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">Transaction History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>A complete record of all your earnings and withdrawals.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 stat-card-green">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold text-green-400">${totalCredits.toFixed(2)}</div>
          <div className="text-sm font-medium">Total Earned</div>
        </div>
        <div className="glass-card p-5 stat-card-purple">
          <div className="text-2xl mb-2">💸</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-purple)' }}>${totalDebits.toFixed(2)}</div>
          <div className="text-sm font-medium">Total Withdrawn</div>
        </div>
        <div className="glass-card p-5 stat-card-blue">
          <div className="text-2xl mb-2">🔢</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>{transactions?.length ?? 0}</div>
          <div className="text-sm font-medium">Total Transactions</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold">All Transactions</h2>
        </div>
        {!transactions || transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="font-medium mb-2">No transactions yet</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Complete an offer to see your earnings here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="font-medium">{tx.description}</td>
                    <td>
                      <span className={`badge ${tx.type === 'credit' ? 'badge-green' : 'badge-purple'}`}>
                        {tx.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                      </span>
                    </td>
                    <td>
                      <span className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-purple-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
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
  )
}
