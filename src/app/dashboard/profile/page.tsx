import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Profile & limits</h1>
      <div className="card-apex max-w-lg">
        <ProfileForm profile={profile} email={user.email ?? ''} />
      </div>
      <div className="mt-6 card-apex max-w-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Responsible gaming</h2>
        <p className="text-gray-400 text-sm mb-2">Daily limit: KES {Number(profile?.daily_limit_kes ?? 50000).toLocaleString()}</p>
        <p className="text-gray-400 text-sm">
          {profile?.self_excluded_until
            ? `Self-excluded until ${new Date(profile.self_excluded_until).toLocaleDateString()}`
            : 'You can set daily limits and self-exclusion in settings.'}
        </p>
      </div>
    </div>
  );
}
