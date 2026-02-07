import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/lipana';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const amount = parseFloat(body.amount);
    const phone = String(body.phone ?? '').trim();

    if (!Number.isFinite(amount) || amount < 10 || amount > 150_000) {
      return NextResponse.json(
        { error: 'Amount must be between KES 10 and 150,000' },
        { status: 400 }
      );
    }
    if (phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const result = await initiateStkPush(phone, amount);

    const checkoutRequestID = result.data?.checkoutRequestID;
    const transactionId = result.data?.transactionId;

    if (checkoutRequestID) {
      const { error: rpcError } = await supabase.rpc('insert_pending_lipana_deposit', {
        p_checkout_request_id: checkoutRequestID,
        p_transaction_id: transactionId ?? null,
      });
      if (rpcError) {
        console.error('Failed to store pending deposit:', rpcError);
        // Don't fail the request - STK was sent; webhook might still need manual lookup
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message ?? 'STK push sent. Complete payment on your phone.',
      data: result.data,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Deposit request failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
