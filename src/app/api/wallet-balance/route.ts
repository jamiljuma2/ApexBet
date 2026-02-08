import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: wallet,
    error,
  } = await supabase.from('wallets').select('balance_kes').single();

  if (error) {
    return NextResponse.json({ balance_kes: 0, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ balance_kes: wallet?.balance_kes ?? 0 });
}
