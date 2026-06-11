import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard — RewardHub',
  description: 'RewardHub administration panel statistics and overview.',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Double check admin role server-side
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  // Fetch metrics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Total balance liabilities
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('balance, total_earned')

  const totalUserBalanceLiability = allProfiles?.reduce((sum, p) => sum + Number(p.balance), 0) ?? 0
  const totalAllTimeEarnings = allProfiles?.reduce((sum, p) => sum + Number(p.total_earned), 0) ?? 0

  // Total pending withdrawals
  const { data: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('amount')
    .eq('status', 'pending')

  const pendingWithdrawalAmount = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) ?? 0
  const pendingCount = pendingWithdrawals?.length ?? 0

  // Recent Conversions
  const { data: recentConversions } = await supabase
    .from('conversions')
    .select('id, user_id, offer_name, payout, created_at, profiles(username, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent Withdrawals
  const { data: recentWithdrawals } = await supabase
    .from('withdrawals')
    .select('id, user_id, amount, status, wallet_address, created_at, profiles(username, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      label: 'Total Users',
      value: (totalUsers ?? 0).toString(),
      icon: '👥',
      variant: 'stat-card-blue',
      sub: 'Registered accounts',
    },
    {
      label: 'Total Earned',
      value: `$${totalAllTimeEarnings.toFixed(2)}`,
      icon: '📈',
      variant: 'stat-card-green',
      sub: 'Credited to users',
    },
    {
      label: 'Balance Liabilities',
      value: `$${totalUserBalanceLiability.toFixed(2)}`,
      icon: '💎',
      variant: 'stat-card-purple',
      sub: 'Currently in user balances',
    },
    {
      label: 'Pending Requests',
      value: `${pendingCount} ($${pendingWithdrawalAmount.toFixed(2)})`,
      icon: '⏳',
      variant: 'stat-card-gold',
      sub: 'Awaiting action',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">
          System Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Live platform stats, liabilities, and latest events.</p>
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Conversions */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>📥</span> Recent Conversions
            </h2>
            <Link href="/admin/conversions" className="text-xs font-semibold text-pink-500">View All →</Link>
          </div>
          {!recentConversions || recentConversions.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No conversions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Offer Name</th>
                    <th>Payout</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentConversions.map((conv: any) => (
                    <tr key={conv.id}>
                      <td className="font-medium">
                        <div className="text-xs font-mono">{conv.profiles?.username || 'user'}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{conv.profiles?.email}</div>
                      </td>
                      <td className="max-w-[150px] truncate text-xs">{conv.offer_name}</td>
                      <td className="text-green-400 font-bold text-xs">+${Number(conv.payout).toFixed(2)}</td>
                      <td className="text-[11px]" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(conv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Withdrawals */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>💸</span> Recent Withdrawals
            </h2>
            <Link href="/admin/withdrawals" className="text-xs font-semibold text-pink-500">View All →</Link>
          </div>
          {!recentWithdrawals || recentWithdrawals.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No withdrawals requested yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWithdrawals.map((wd: any) => (
                    <tr key={wd.id}>
                      <td className="font-medium">
                        <div className="text-xs font-mono">{wd.profiles?.username || 'user'}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wd.profiles?.email}</div>
                      </td>
                      <td className="font-bold text-xs text-red-400">${Number(wd.amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge text-[10px] ${wd.status === 'approved' ? 'badge-green' : wd.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                          {wd.status}
                        </span>
                      </td>
                      <td className="text-[11px]" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(wd.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
  )
}
