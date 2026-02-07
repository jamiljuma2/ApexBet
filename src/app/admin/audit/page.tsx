import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Audit logs</h1>
      <div className="overflow-x-auto card-apex">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Time</th>
              <th className="pb-2 pr-4">Actor</th>
              <th className="pb-2 pr-4">Action</th>
              <th className="pb-2 pr-4">Resource</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-gray-500">{format(new Date(log.created_at), 'd MMM yyyy, HH:mm:ss')}</td>
                <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{log.actor_id?.slice(0, 8) ?? '-'}</td>
                <td className="py-2 pr-4 text-white">{log.action}</td>
                <td className="py-2 pr-4 text-gray-400">{log.resource_type} {log.resource_id ? `(${String(log.resource_id).slice(0, 8)})` : ''}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr><td colSpan={4} className="py-4 text-gray-500">No audit logs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
