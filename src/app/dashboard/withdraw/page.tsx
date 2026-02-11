'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('wallets').select('balance_kes').eq('user_id', user.id).single();
      setBalance(data?.balance_kes ?? 0);
    })();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt < 50 || amt > 70000) {
      setMessage({ type: 'err', text: 'Amount must be between KES 50 and 70,000' });
      return;
    }
    if (balance != null && amt > balance) {
      setMessage({ type: 'err', text: 'Insufficient balance' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, phone: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || 'Withdrawal failed' });
        return;
      }
      setMessage({ type: 'ok', text: 'Withdrawal requested. You will receive funds via M-Pesa.' });
      setBalance((b) => (b != null ? b - amt : null));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 md:pt-0 min-h-screen flex flex-col items-center bg-apex-dark">
      <h1 className="text-2xl font-bold text-white mb-4">Withdraw to M-Pesa</h1>
      {balance != null && (
        <p className="text-gray-400 mb-4">Available: KES {balance.toLocaleString()}</p>
      )}
      <div className="card-apex max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone (254...)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="254712345678"
              required
              className="w-full bg-apex-muted border border-apex-primary/30 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Amount (KES)</label>
            <input
              type="number"
              min={50}
              max={70000}
              step={10}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-apex-muted border border-apex-primary/30 rounded-lg px-3 py-2 text-white"
            />
          </div>
          {message && (
            <p className={message.type === 'err' ? 'text-red-400' : 'text-apex-primary'}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm">
          <Link href="/dashboard" className="text-apex-primary hover:underline">Back to dashboard</Link>
        </p>
      </div>
    </div>
  );
}
