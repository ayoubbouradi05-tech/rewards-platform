import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard — RewardHub',
  description: 'View your earnings, balance, and recent activity.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: conversionsCount } = await supabase
    .from('conversions')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)

  const { data: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('amount')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const pendingTotal = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) ?? 0
  const completedTasks = conversionsCount?.length ?? 0

  const stats = [
    {
      label: 'Available Balance',
      value: `$${Number(profile?.balance ?? 0).toFixed(2)}`,
      icon: '💎',
      variant: 'stat-card-purple',
      sub: 'Ready to withdraw',
    },
    {
      label: 'Total Earned',
      value: `$${Number(profile?.total_earned ?? 0).toFixed(2)}`,
      icon: '💰',
      variant: 'stat-card-green',
      sub: 'All time earnings',
    },
    {
      label: 'Completed Tasks',
      value: completedTasks.toString(),
      icon: '✅',
      variant: 'stat-card-blue',
      sub: 'Offers completed',
    },
    {
      label: 'Pending Withdrawals',
      value: `$${pendingTotal.toFixed(2)}`,
      icon: '⏳',
      variant: 'stat-card-gold',
      sub: 'Being processed',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, <span className="gradient-text">{profile?.username ?? user.email?.split('@')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here&apos;s your earnings overview for today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-card p-6 ${stat.variant}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-semibold mb-0.5">{stat.label}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-5">
        <a
          href="/offers"
          className="glass-card p-6 flex items-center gap-5 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))' }}>
            🎯
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Browse Offers</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Complete offers to earn rewards instantly</p>
          </div>
          <div className="ml-auto text-2xl opacity-30 group-hover:opacity-80 group-hover:translate-x-1 transition-all">→</div>
        </a>

        <a
          href="/withdraw"
          className="glass-card p-6 flex items-center gap-5 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))' }}>
            💸
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Withdraw Earnings</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send to your USDT wallet · Min $5</p>
          </div>
          <div className="ml-auto text-2xl opacity-30 group-hover:opacity-80 group-hover:translate-x-1 transition-all">→</div>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <a href="/transactions" className="text-sm font-medium" style={{ color: 'var(--accent-purple)' }}>View all →</a>
        </div>
        {!recentTransactions || recentTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="font-medium mb-2">No activity yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Complete your first offer to see earnings here.</p>
            <a href="/offers" className="btn-primary text-sm py-2 px-5 inline-block">
              <span>Browse Offers</span>
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-medium">{tx.description}</td>
                    <td>
                      <span className={tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'credit' ? 'badge-green' : 'badge-red'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
