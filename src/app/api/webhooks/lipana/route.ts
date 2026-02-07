import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/lipana';
import type { LipanaWebhookPayload } from '@/lib/lipana';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-lipana-signature');
  const secret = process.env.LIPANA_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LIPANA_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: LipanaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LipanaWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, data } = payload;
  if (event !== 'payment.success' || !data?.amount || data.amount <= 0) {
    return NextResponse.json({ received: true });
  }

  const checkoutRequestID = data.checkoutRequestID ?? data.transactionId;
  if (!checkoutRequestID) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  const { data: row, error: fetchError } = await supabase
    .from('mpesa_callbacks')
    .select('id, user_id, processed_at')
    .eq('checkout_request_id', checkoutRequestID)
    .single();

  if (fetchError || !row) {
    console.error('Lipana webhook: pending deposit not found', checkoutRequestID, fetchError);
    return NextResponse.json({ received: true });
  }

  if (row.processed_at) {
    return NextResponse.json({ received: true });
  }

  const userId = row.user_id;
  if (!userId) {
    console.error('Lipana webhook: no user_id for checkout', checkoutRequestID);
    return NextResponse.json({ received: true });
  }

  const { error: creditError } = await supabase.rpc('wallet_credit', {
    p_user_id: userId,
    p_amount_kes: data.amount,
    p_type: 'deposit',
    p_reference_id: null,
    p_metadata: {
      provider: 'lipana',
      transactionId: data.transactionId,
      phone: data.phone,
      checkoutRequestID,
    },
  });

  if (creditError) {
    console.error('Lipana webhook: wallet_credit failed', creditError);
    return NextResponse.json({ error: 'Settlement failed' }, { status: 500 });
  }

  await supabase
    .from('mpesa_callbacks')
    .update({
      receipt_number: data.transactionId ?? null,
      amount: data.amount,
      phone: data.phone ?? null,
      status: 'completed',
      raw_response: payload as unknown as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  return NextResponse.json({ received: true });
}
