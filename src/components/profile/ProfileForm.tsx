'use client';

import { useState } from 'react';
import type { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

export function ProfileForm({
  profile,
  email,
}: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [dailyLimit, setDailyLimit] = useState(String(profile?.daily_limit_kes ?? 50000));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        daily_limit_kes: parseFloat(dailyLimit) || 50000,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile?.id);
    setSaving(false);
    if (error) setMessage(error.message);
    else setMessage('Saved.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input type="email" value={email} disabled className="w-full bg-apex-muted rounded-lg px-3 py-2 text-gray-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full bg-apex-muted border border-apex-primary/30 rounded-lg px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Daily limit (KES)</label>
        <input
          type="number"
          min={1000}
          max={500000}
          step={1000}
          value={dailyLimit}
          onChange={(e) => setDailyLimit(e.target.value)}
          className="w-full bg-apex-muted border border-apex-primary/30 rounded-lg px-3 py-2 text-white"
        />
      </div>
      {message && <p className="text-apex-primary text-sm">{message}</p>}
      <button type="submit" disabled={saving} className="btn-primary py-2 px-4 rounded-lg">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
