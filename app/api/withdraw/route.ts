import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const MIN_WITHDRAWAL = 5.00

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { amount, walletAddress, method = 'usdt' } = body

  // Validate amount
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount < MIN_WITHDRAWAL) {
    return NextResponse.json(
      { error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}` },
      { status: 400 }
    )
  }

  // Validate wallet address
  if (!walletAddress || walletAddress.trim().length < 10) {
    return NextResponse.json(
      { error: 'Please provide a valid wallet address' },
      { status: 400 }
    )
  }

  // Check user balance using service client
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('balance')
    .eq('id', user.id)
    .single()

  if (!profile || Number(profile.balance) < numAmount) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 }
    )
  }

  // Check for pending withdrawals to prevent multiple pending requests
  const { data: existingPending } = await serviceClient
    .from('withdrawals')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .limit(1)

  if (existingPending && existingPending.length > 0) {
    return NextResponse.json(
      { error: 'You already have a pending withdrawal. Please wait for it to be processed.' },
      { status: 400 }
    )
  }

  // Deduct balance (held pending)
  const { error: deductError } = await serviceClient
    .from('profiles')
    .update({
      balance: Number(profile.balance) - numAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (deductError) {
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }

  // Create withdrawal request
  const { data: withdrawal, error: withdrawError } = await serviceClient
    .from('withdrawals')
    .insert({
      user_id: user.id,
      amount: numAmount,
      wallet_address: walletAddress.trim(),
      method,
      status: 'pending',
    })
    .select('id')
    .single()

  if (withdrawError) {
    // Rollback balance
    await serviceClient
      .from('profiles')
      .update({ balance: Number(profile.balance) })
      .eq('id', user.id)
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 })
  }

  // Log transaction
  await serviceClient
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'debit',
      amount: numAmount,
      description: `Withdrawal request (${method.toUpperCase()})`,
      reference_id: withdrawal.id,
    })

  return NextResponse.json({ success: true, withdrawalId: withdrawal.id })
}
