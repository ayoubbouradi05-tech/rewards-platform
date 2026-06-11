import Link from 'next/link'

const stats = [
  { label: 'Total Paid Out', value: '$2.4M+' },
  { label: 'Active Members', value: '85,000+' },
  { label: 'Available Offers', value: '500+' },
  { label: 'Avg. Daily Earnings', value: '$12.50' },
]

const features = [
  {
    icon: '🎯',
    title: 'Complete Offers & Surveys',
    description: 'Browse hundreds of high-paying offers from top advertisers. Complete tasks at your own pace.',
  },
  {
    icon: '⚡',
    title: 'Instant Credit',
    description: 'Earnings are credited to your account automatically via our secure postback system.',
  },
  {
    icon: '💎',
    title: 'USDT Withdrawals',
    description: 'Withdraw your earnings to your USDT wallet with a minimum of just $5. Fast processing.',
  },
  {
    icon: '🛡️',
    title: 'Secure & Trusted',
    description: 'Your data is protected with enterprise-grade security. Powered by Supabase.',
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    description: 'Earn on any device — desktop, tablet, or smartphone. Optimized for all screens.',
  },
  {
    icon: '📊',
    title: 'Detailed Analytics',
    description: 'Track all your earnings, conversions, and withdrawal history in real-time.',
  },
]

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up for free in under 60 seconds.' },
  { step: '02', title: 'Complete Offers', desc: 'Browse and complete offers to earn rewards.' },
  { step: '03', title: 'Get Paid', desc: 'Withdraw to USDT when you hit $5 minimum.' },
]

export default function LandingPage() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              💎
            </div>
            <span className="font-bold text-xl gradient-text">RewardHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
            <span>🚀</span>
            <span>Trusted by 85,000+ members worldwide</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Earn Real{' '}
            <span className="gradient-text text-glow">Crypto Rewards</span>
            <br />
            Completing Offers
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of members earning USDT by completing surveys, watching videos, testing apps, and more. Get paid instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base py-4 px-8 w-full sm:w-auto text-center">
              <span>Start Earning Now — It&apos;s Free</span>
            </Link>
            <Link href="/login" className="btn-secondary text-base py-4 px-8 w-full sm:w-auto text-center">
              Sign In to Dashboard
            </Link>
          </div>

          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            No credit card required · Withdraw from $5 · Instant USDT
          </p>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-5 text-center" style={{ background: 'rgba(19,19,31,0.8)' }}>
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Start earning in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="glass-card p-8 text-center relative">
                <div className="text-5xl font-black mb-4" style={{ color: 'rgba(139,92,246,0.15)' }}>{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Earn</h2>
            <p style={{ color: 'var(--text-secondary)' }}>A complete rewards platform built for serious earners</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="p-12 rounded-2xl text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />
            <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of members who are already earning USDT every day.
            </p>
            <Link href="/signup" className="btn-primary text-lg py-4 px-10 inline-block">
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold gradient-text">RewardHub</span>
            <span>© 2025 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
