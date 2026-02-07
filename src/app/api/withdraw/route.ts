import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendPayoutToPhone } from '@/lib/lipana';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const amount = parseFloat(body.amount);
    const phone = String(body.phone || '').trim();
    const normalizedPhone = phone.replace(/\D/g, '');
    if (!Number.isFinite(amount) || amount < 50 || amount > 70000 || normalizedPhone.length < 9) {
      return NextResponse.json({ error: 'Invalid amount or phone' }, { status: 400 });
    }

    const { error: debitError } = await supabase.rpc('wallet_debit', {
      p_user_id: user.id,
      p_amount_kes: amount,
      p_type: 'withdrawal',
      p_reference_id: null,
      p_metadata: { phone: normalizedPhone },
    });
    if (debitError) {
      return NextResponse.json({ error: debitError.message }, { status: 400 });
    }

    try {
      await sendPayoutToPhone(phone, amount);
    } catch (e) {
      try {
        const admin = createAdminClient();
        await admin.rpc('wallet_credit', {
          p_user_id: user.id,
          p_amount_kes: amount,
          p_type: 'bet_refund',
          p_reference_id: null,
          p_metadata: { reason: 'payout_failed', error: e instanceof Error ? e.message : String(e) },
        });
      } catch (refundErr) {
        console.error('Withdrawal payout failed and refund failed:', refundErr);
      }
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Payout failed. Your balance has been restored.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
