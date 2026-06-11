import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { withdrawalId, action, adminNote } = body // action: 'approve' or 'reject'

  if (!withdrawalId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Get withdrawal detail
  const { data: withdrawal, error: wdError } = await serviceClient
    .from('withdrawals')
    .select('*')
    .eq('id', withdrawalId)
    .single()

  if (wdError || !withdrawal) {
    return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
  }

  if (withdrawal.status !== 'pending') {
    return NextResponse.json({ error: 'Withdrawal is already processed' }, { status: 400 })
  }

  const status = action === 'approve' ? 'approved' : 'rejected'

  // If rejected, refund the balance to the user profile
  if (action === 'reject') {
    const { data: userProfile } = await serviceClient
      .from('profiles')
      .select('balance')
      .eq('id', withdrawal.user_id)
      .single()

    if (userProfile) {
      const { error: refundError } = await serviceClient
        .from('profiles')
        .update({
          balance: Number(userProfile.balance) + Number(withdrawal.amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.user_id)

      if (refundError) {
        return NextResponse.json({ error: 'Failed to refund user balance' }, { status: 500 })
      }

      // Log transaction refund credit
      await serviceClient
        .from('transactions')
        .insert({
          user_id: withdrawal.user_id,
          type: 'credit',
          amount: withdrawal.amount,
          description: `Refund for rejected withdrawal request`,
          reference_id: withdrawal.id
        })
    }
  }

  // Update withdrawal status
  const { error: updateWdError } = await serviceClient
    .from('withdrawals')
    .update({
      status,
      admin_note: adminNote || `Processed by admin`,
      processed_at: new Date().toISOString()
    })
    .eq('id', withdrawalId)

  if (updateWdError) {
    return NextResponse.json({ error: 'Failed to update withdrawal status' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status })
}
