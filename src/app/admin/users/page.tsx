import { createClient } from '@/lib/supabase/server';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div className="px-2 sm:px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center sm:text-left">User management</h1>
      <div className="overflow-x-auto card-apex p-2 sm:p-4">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-1 sm:pb-2 pr-2 sm:pr-4">Email</th>
              <th className="pb-1 sm:pb-2 pr-2 sm:pr-4">Phone</th>
              <th className="pb-1 sm:pb-2 pr-2 sm:pr-4">Name</th>
              <th className="pb-1 sm:pb-2 pr-2 sm:pr-4">Role</th>
              <th className="pb-1 sm:pb-2 pr-2 sm:pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <tr key={p.id} className="border-b border-apex-muted/50">
                <td className="py-1 sm:py-2 pr-2 sm:pr-4 text-white">{p.email ?? '-'}</td>
                <td className="py-1 sm:py-2 pr-2 sm:pr-4 text-gray-300">{p.phone ?? '-'}</td>
                <td className="py-1 sm:py-2 pr-2 sm:pr-4 text-gray-300">{p.full_name ?? '-'}</td>
                <td className="py-1 sm:py-2 pr-2 sm:pr-4 text-apex-primary">{p.role}</td>
                <td className="py-1 sm:py-2 pr-2 sm:pr-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
