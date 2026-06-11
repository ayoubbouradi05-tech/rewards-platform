import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Manage Users — RewardHub Admin',
  description: 'Manage users profiles, balances, and admin statuses.',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  // Fetch all profiles
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, username, balance, total_earned, is_admin, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">Users Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View registered profiles, current balances, and system roles.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold">All Users ({users?.length ?? 0})</h2>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-400">
            Failed to load users: {error.message}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No users found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>UUID / Joined</th>
                  <th>Username / Email</th>
                  <th>Balance</th>
                  <th>Total Earned</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="text-[11px] font-mono text-gray-500">{u.id}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-xs">{u.username || 'No Username'}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td className="font-bold text-green-400 text-xs">${Number(u.balance).toFixed(2)}</td>
                    <td className="font-semibold text-xs" style={{ color: 'var(--text-secondary)' }}>${Number(u.total_earned).toFixed(2)}</td>
                    <td>
                      {u.is_admin ? (
                        <span className="badge badge-purple text-[10px]">ADMIN</span>
                      ) : (
                        <span className="badge badge-blue text-[10px]" style={{ background: 'rgba(59,130,246,0.06)', color: 'rgba(59,130,246,0.7)', border: '1px solid rgba(59,130,246,0.1)' }}>USER</span>
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
