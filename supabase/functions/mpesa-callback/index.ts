
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';


function setCors(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).send('ok');
    return;
  }
  try {
    const body = req.body;
    const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;
    const resultCode = body.Body?.stkCallback?.ResultCode;
    const callbackMetadata = body.Body?.stkCallback?.CallbackMetadata?.Item;
    if (!checkoutRequestId) {
      res.status(200).json({ ResultCode: 0, ResultDesc: 'OK' });
      return;
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const existing = await supabase
      .from('mpesa_callbacks')
      .select('id, processed_at, user_id')
      .eq('checkout_request_id', checkoutRequestId)
      .single();
    if (existing?.data?.processed_at) {
      res.status(200).json({ ResultCode: 0, ResultDesc: 'OK' });
      return;
    }
    if (resultCode !== 0) {
      await supabase
        .from('mpesa_callbacks')
        .update({ status: 'failed', raw_response: body })
        .eq('checkout_request_id', checkoutRequestId);
      res.status(200).json({ ResultCode: 0, ResultDesc: 'OK' });
      return;
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
    res.status(200).json({ ResultCode: 0, ResultDesc: 'OK' });
  } catch {
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error' });
  }
}
