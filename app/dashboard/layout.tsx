'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/offers', label: 'Offers', icon: '🎯' },
  { href: '/transactions', label: 'Transactions', icon: '📋' },
  { href: '/withdraw', label: 'Withdraw', icon: '💰' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              💎
            </div>
            <span className="font-bold text-xl gradient-text">RewardHub</span>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Postback URL</p>
              <p className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>
                /api/postback?subid={'{uid}'}&payout={'{amount}'}
              </p>
            </div>
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
              {pathname.replace('/', '') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
              ● Live
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
