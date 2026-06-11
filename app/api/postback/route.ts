import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const subid = searchParams.get('subid')       // User ID
  const payoutRaw = searchParams.get('payout')   // Payout amount
  const offerName = searchParams.get('offer_name') ?? 'Unknown Offer'
  const token = searchParams.get('token')         // Security token
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  // ── 1. Validate security token ──────────────────────────────
  const secret = process.env.POSTBACK_SECRET
  if (!secret || token !== secret) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid token' },
      { status: 401 }
    )
  }

  // ── 2. Validate required params ─────────────────────────────
  if (!subid || !payoutRaw) {
    return NextResponse.json(
      { error: 'Missing required params: subid, payout' },
      { status: 400 }
    )
  }

  const payout = parseFloat(payoutRaw)
  if (isNaN(payout) || payout <= 0) {
    return NextResponse.json(
      { error: 'Invalid payout value' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // ── 3. Verify user exists ────────────────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, balance, total_earned')
    .eq('id', subid)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // ── 4. Prevent duplicate conversions (unique subid) ──────────
  // We use offer_name+user combo as subid uniqueness key
  const conversionSubid = `${subid}_${offerName}_${Date.now()}`
  // Check last 1 hour for same user+offer to prevent rapid duplication
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('conversions')
    .select('id')
    .eq('user_id', subid)
    .eq('offer_name', offerName)
    .gte('created_at', oneHourAgo)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Duplicate conversion detected' },
      { status: 409 }
    )
  }

  // ── 5. Credit user balance ───────────────────────────────────
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: Number(profile.balance) + payout,
      total_earned: Number(profile.total_earned) + payout,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subid)

  if (updateError) {
    console.error('Balance update error:', updateError)
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
  }

  // ── 6. Insert conversion record ──────────────────────────────
  const { data: conversion } = await supabase
    .from('conversions')
    .insert({
      user_id: subid,
      offer_name: offerName,
      payout,
      subid: conversionSubid,
      status: 'completed',
      ip_address: ip,
    })
    .select('id')
    .single()

  // ── 7. Insert transaction record ─────────────────────────────
  await supabase
    .from('transactions')
    .insert({
      user_id: subid,
      type: 'credit',
      amount: payout,
      description: `Earned from: ${offerName}`,
      reference_id: conversion?.id ?? null,
    })

  console.log(`✅ Postback processed: user=${subid}, payout=$${payout}, offer=${offerName}`)

  return NextResponse.json(
    { success: true, message: `Credited $${payout} to user ${subid}` },
    { status: 200 }
  )
}
