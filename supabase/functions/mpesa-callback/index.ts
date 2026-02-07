import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;
    const resultCode = body.Body?.stkCallback?.ResultCode;
    const callbackMetadata = body.Body?.stkCallback?.CallbackMetadata?.Item;
    if (!checkoutRequestId) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'OK' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const existing = await supabase
      .from('mpesa_callbacks')
      .select('id, processed_at, user_id')
      .eq('checkout_request_id', checkoutRequestId)
      .single();
    if (existing?.data?.processed_at) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'OK' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (resultCode !== 0) {
      await supabase
        .from('mpesa_callbacks')
        .update({ status: 'failed', raw_response: body })
        .eq('checkout_request_id', checkoutRequestId);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'OK' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const getItem = (arr: { Name: string; Value: string }[] | undefined, name: string) =>
      arr?.find((i) => i.Name === name)?.Value;
    const amount = parseFloat(getItem(callbackMetadata, 'Amount') || '0');
    const mpesaReceipt = getItem(callbackMetadata, 'MpesaReceiptNumber') || '';
    const phone = getItem(callbackMetadata, 'PhoneNumber') || '';
    const userId = existing?.data?.user_id ?? null;
    if (userId && amount > 0) {
      await supabase.rpc('wallet_credit', {
        p_user_id: userId,
        p_amount_kes: amount,
        p_type: 'deposit',
        p_reference_id: null,
        p_metadata: { mpesa_receipt: mpesaReceipt, phone },
      });
    }
    await supabase
      .from('mpesa_callbacks')
      .update({
        receipt_number: mpesaReceipt,
        amount,
        phone,
        status: 'completed',
        raw_response: body,
        processed_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', checkoutRequestId);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'OK' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: 'Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
