/**
 * Lipana API client for M-Pesa payments (STK Push, Payouts).
 * API base: https://api.lipana.dev/v1
 * Use secret key (lip_sk_*) server-side only.
 */

const LIPANA_BASE = 'https://api.lipana.dev/v1';
const LIPANA_PAYOUTS_BASE = 'https://api.lipana.dev/api/v1';

function getApiKey(): string {
  const key = process.env.LIPANA_SECRET_KEY;
  if (!key) throw new Error('LIPANA_SECRET_KEY is not set');
  return key;
}

export interface StkPushResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    status: string;
    checkoutRequestID: string;
    message: string;
  };
}

export interface LipanaWebhookPayload {
  event: string;
  data: {
    transactionId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    phone?: string;
    checkoutRequestID?: string;
    timestamp?: string;
  };
}

/**
 * Initiate M-Pesa STK Push. Min amount 10 KES.
 * Phone: +254712345678 or 254712345678
 */
export async function initiateStkPush(
  phone: string,
  amount: number
): Promise<StkPushResponse> {
  const normalizedPhone = phone.replace(/\D/g, '');
  const formattedPhone =
    normalizedPhone.startsWith('254')
      ? `+${normalizedPhone}`
      : `+254${normalizedPhone.replace(/^0/, '')}`;

  const res = await fetch(`${LIPANA_BASE}/transactions/push-stk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
    },
    body: JSON.stringify({
      phone: formattedPhone,
      amount: Math.round(amount),
    }),
  });

  const data = (await res.json()) as StkPushResponse;
  if (!res.ok) {
    const err = (data as { error?: string; message?: string }).message
      ?? (data as { error?: string }).error
      ?? 'STK push failed';
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }
  return data;
}

/**
 * Send payout to an M-Pesa phone number (withdrawal).
 * Uses Lipana payouts/phone endpoint.
 */
export async function sendPayoutToPhone(
  phone: string,
  amount: number
): Promise<{ success: boolean; payout?: { id: string; status: string }; message?: string }> {
  const normalizedPhone = phone.replace(/\D/g, '');
  const formattedPhone = normalizedPhone.startsWith('254')
    ? normalizedPhone
    : `254${normalizedPhone.replace(/^0/, '')}`;

  const res = await fetch(`${LIPANA_PAYOUTS_BASE}/payouts/phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
    },
    body: JSON.stringify({
      phone: formattedPhone,
      amount: Math.round(amount),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = (data as { message?: string }).message ?? (data as { error?: string }).error ?? 'Payout failed';
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }
  return data as { success: boolean; payout?: { id: string; status: string }; message?: string };
}

/**
 * Verify Lipana webhook signature (HMAC-SHA256 of raw body with webhook secret).
 * Uses constant-time comparison. Signature and computed value are hex strings.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  try {
    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}
