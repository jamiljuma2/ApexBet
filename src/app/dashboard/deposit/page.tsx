'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt < 10 || amt > 150000) {
      setMessage({ type: 'err', text: 'Amount must be between KES 10 and 150,000' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || 'Request failed' });
        return;
      }
      setMessage({ type: 'ok', text: data.message ?? 'STK push sent. Complete payment on your phone.' });
    } catch {
      setMessage({ type: 'err', text: 'Request failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-16">
      <h1 className="text-2xl font-bold text-white mb-4">Deposit via M-Pesa</h1>
      <div className="card-apex max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone (254...) </label>
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
              min={10}
              max={150000}
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
            {loading ? 'Sending...' : 'Pay with M-Pesa'}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm">
          <Link href="/dashboard" className="text-apex-primary hover:underline">Back to dashboard</Link>
        </p>
      </div>
    </div>
  );
}
