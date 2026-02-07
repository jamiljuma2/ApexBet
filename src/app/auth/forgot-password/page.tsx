'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setMessage({ type: 'err', text: error.message });
      return;
    }
    setMessage({ type: 'ok', text: 'Check your email for the reset link.' });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-apex-dark p-4">
      <div className="w-full max-w-md card-apex">
        <h1 className="text-2xl font-bold text-apex-primary mb-6">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          <Link href="/auth/login" className="text-apex-primary hover:underline">Back to login</Link>
        </p>
      </div>
    </main>
  );
}
