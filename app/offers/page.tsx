'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Offer {
  id: string
  title: string
  description: string
  payout: string
  url: string
  image: string
  category: string
  conversion: string
}

function OfferSkeleton() {
  return (
    <div className="offer-card p-5 space-y-3">
      <div className="skeleton h-36 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex justify-between items-center mt-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      try {
        const res = await fetch(`/api/offers?userId=${user?.id ?? ''}`)
        if (!res.ok) throw new Error('Failed to load offers')
        const data = await res.json()
        setOffers(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Could not load offers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-1">Available Offers</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete offers to earn instant rewards. Your user ID is automatically tracked.
        </p>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <span className="text-xl mt-0.5">💡</span>
        <div>
          <p className="text-sm font-medium mb-0.5">How earnings work</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Click any offer below, complete the required action, and your account will be credited automatically. Earnings may take a few minutes to appear.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Offers grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <OfferSkeleton key={i} />)
          : offers.length === 0 && !error
          ? (
            <div className="col-span-full glass-card p-12 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <p className="font-medium mb-2">No offers available right now</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Check back soon — new offers are added daily.</p>
            </div>
          )
          : offers.map((offer) => (
            <div key={offer.id} className="offer-card flex flex-col">
              {/* Image */}
              <div className="h-36 flex items-center justify-center p-4" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                {offer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="max-h-28 max-w-full object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="text-5xl">🎁</div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm leading-tight flex-1 line-clamp-2">{offer.title}</h3>
                  {offer.category && (
                    <span className="badge badge-purple text-xs flex-shrink-0">{offer.category}</span>
                  )}
                </div>

                {offer.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {offer.description}
                  </p>
                )}

                {offer.conversion && (
                  <p className="text-xs mb-3 italic" style={{ color: 'var(--text-muted)' }}>
                    ✓ {offer.conversion}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold" style={{ color: '#10b981' }}>
                      ${offer.payout}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>reward</div>
                  </div>
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-4 text-center"
                    id={`offer-${offer.id}`}
                  >
                    <span>Complete →</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* User ID reference */}
      {userId && (
        <div className="glass-card p-4 flex items-center gap-3">
          <span className="text-lg">🔑</span>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Your Tracking ID (subid)</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{userId}</p>
          </div>
        </div>
      )}
    </div>
  )
}
