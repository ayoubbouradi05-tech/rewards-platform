import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Conversions Log — RewardHub Admin',
  description: 'View the log of all postbacks and offer conversions.',
}

export default async function AdminConversionsPage() {
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

  // Fetch conversions
  const { data: conversions, error } = await supabase
    .from('conversions')
    .select('id, user_id, offer_name, payout, subid, status, ip_address, created_at, profiles(username, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">Conversions Log</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track all dynamic postbacks sent by the external Offerwall APIs.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold font-mono">Postback Records ({conversions?.length ?? 0})</h2>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-400">
            Failed to load conversions log: {error.message}
          </div>
        ) : !conversions || conversions.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No conversions registered yet. Make sure your postback endpoint `/api/postback` is configured correctly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table font-sans">
              <thead>
                <tr>
                  <th>User / Click Details</th>
                  <th>Offer Name</th>
                  <th>Payout</th>
                  <th>Tracking Subid</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conv: any) => (
                  <tr key={conv.id}>
                    <td>
                      <div className="font-bold text-xs">{conv.profiles?.username || 'user'}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{conv.profiles?.email}</div>
                    </td>
                    <td className="text-xs font-semibold">{conv.offer_name}</td>
                    <td className="text-green-400 font-bold text-xs">+${Number(conv.payout).toFixed(2)}</td>
                    <td className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>{conv.subid}</td>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{conv.ip_address || 'unknown'}</td>
                    <td className="text-[11px]" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(conv.created_at).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
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
