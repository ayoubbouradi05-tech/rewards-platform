import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || ''

  const apiKey = process.env.OFFERS_API_KEY
  const offersUserId = process.env.OFFERS_USER_ID

  const apiUrl = `https://d1cdbd1x576ga0.cloudfront.net/public/offers/feed.php?user_id=${offersUserId}&api_key=${apiKey}&s1=${userId}&s2=&callback=`

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RewardHub/1.0',
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 502 })
    }

    let text = await res.text()

    // Handle JSONP response — strip callback wrapper if present
    text = text.trim()
    if (text.startsWith('(') && text.endsWith(')')) {
      text = text.slice(1, -1)
    }
    if (text.startsWith('?(')) {
      text = text.slice(2, -1)
    }

    let offers = []
    try {
      offers = JSON.parse(text)
    } catch {
      // Return empty if parsing fails
      return NextResponse.json([])
    }

    // Sanitize and return structured offer data
    const sanitized = offers.slice(0, 10).map((offer: Record<string, unknown>, idx: number) => ({
      id: String(offer.offer_id ?? offer.id ?? idx),
      title: String(offer.anchor ?? offer.name ?? offer.title ?? 'Offer'),
      description: String(offer.description ?? offer.desc ?? ''),
      payout: parseFloat(String(offer.payout ?? offer.amount ?? '0')).toFixed(2),
      url: String(offer.url ?? offer.link ?? '#'),
      image: String(offer.picture ?? offer.image ?? offer.icon ?? ''),
      category: String(offer.categories ?? offer.category ?? 'General'),
      conversion: String(offer.conversion ?? ''),
    }))

    return NextResponse.json(sanitized)
  } catch (err) {
    console.error('Offers API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
