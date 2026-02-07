import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';


// Helper to handle CORS
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
    const { amount, phone, user_id } = req.body;
    const secretKey = process.env.LIPANA_SECRET_KEY;
    const callbackUrl = process.env.LIPANA_CALLBACK_URL; // You may want to set this in your env
    if (!secretKey) {
      res.status(500).json({ error: 'Lipana not configured' });
      return;
    }
    // Prepare request to Lipana STK Push endpoint
    const pushBody = {
      amount: Math.round(amount),
      phone: phone.startsWith('254') ? phone : `254${phone.replace(/^0/, '')}`,
      callback_url: callbackUrl,
      metadata: {
        user_id: user_id || null,
      },
    };
    const stkRes = await fetch('https://api.lipana.dev/v1/transactions/push-stk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushBody),
    });
    const data = await stkRes.json();
    if (!stkRes.ok) {
      res.status(stkRes.status).json({ error: data.error || 'STK push failed' });
      return;
    }
    const checkoutId = data.checkoutRequestID || data.CheckoutRequestID || data.id;
    const transactionId = data.transactionId || data.transaction_id;
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.rpc('insert_pending_lipana_deposit', {
      checkoutrequestid: checkoutId,
      transactionid: transactionId,
      user_id: user_id || null,
    });
    res.status(200).json({ checkoutRequestID: checkoutId, message: 'STK push sent' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
