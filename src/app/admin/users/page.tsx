import { createClient } from '@/lib/supabase/server';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">User management</h1>
      <div className="overflow-x-auto card-apex">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Phone</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <tr key={p.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-white">{p.email ?? '-'}</td>
                <td className="py-2 pr-4 text-gray-300">{p.phone ?? '-'}</td>
                <td className="py-2 pr-4 text-gray-300">{p.full_name ?? '-'}</td>
                <td className="py-2 pr-4 text-apex-primary">{p.role}</td>
                <td className="py-2 pr-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
