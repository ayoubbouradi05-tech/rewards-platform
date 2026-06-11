'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '🔑' },
  { href: '/admin/users', label: 'Users Management', icon: '👥' },
  { href: '/admin/conversions', label: 'Conversions Log', icon: '📥' },
  { href: '/admin/withdrawals', label: 'Withdrawal Requests', icon: '💸' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="gradient-bg min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
              👑
            </div>
            <span className="font-bold text-xl gradient-text">Admin Panel</span>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={pathname === item.href ? { background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.1) 100%)', borderColor: 'rgba(236,72,153,0.2)', color: '#ec4899' } : {}}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="sidebar-link w-full text-left"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="text-xl">📊</span>
              <span>Back to User Panel</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="sidebar-link w-full text-left"
              style={{ color: '#ef4444' }}
            >
              <span className="text-xl">🚪</span>
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: '260px' }} className="md:ml-[260px] min-h-screen transition-all duration-300 max-md:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>

          <div className="hidden md:block">
            <h2 className="font-semibold text-lg capitalize">
              {pathname === '/admin' ? 'Admin Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#ec4899' }}>
              ● Admin Session
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
