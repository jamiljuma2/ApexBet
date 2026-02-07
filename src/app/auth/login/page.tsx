'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'err', text: error.message });
      return;
    }
    setMessage({ type: 'ok', text: 'Logged in. Redirecting...' });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-apex-dark p-4">
      <div className="w-full max-w-md card-apex">
        <h1 className="text-2xl font-bold text-apex-primary mb-6">ApexBet – Login</h1>
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
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-apex-primary hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-gray-500 text-sm">
          <Link href="/auth/forgot-password" className="hover:underline">Forgot password?</Link>
        </p>
      </div>
    </main>
  );
}
