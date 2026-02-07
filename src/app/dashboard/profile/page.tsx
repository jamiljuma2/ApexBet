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
    <div className="px-2 sm:px-4 py-4 max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center sm:text-left">Profile & limits</h1>
      <div className="card-apex p-3 sm:p-4 w-full">
        <ProfileForm profile={profile} email={user.email ?? ''} />
      </div>
      <div className="mt-4 sm:mt-6 card-apex p-3 sm:p-4 w-full">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-2 text-center sm:text-left">Responsible gaming</h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-2">Daily limit: KES {Number(profile?.daily_limit_kes ?? 50000).toLocaleString()}</p>
        <p className="text-gray-400 text-xs sm:text-sm">
          {profile?.self_excluded_until
            ? `Self-excluded until ${new Date(profile.self_excluded_until).toLocaleDateString()}`
            : 'You can set daily limits and self-exclusion in settings.'}
        </p>
      </div>
    </div>
  );
}
