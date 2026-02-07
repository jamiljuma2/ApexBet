import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function AdminTransactionsPage() {
  const supabase = await createClient();
  const { data: txns } = await supabase
    .from('transactions')
    .select('id, user_id, type, amount_kes, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Transactions</h1>
      <div className="overflow-x-auto card-apex">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">User</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Amount (KES)</th>
              <th className="pb-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {txns?.map((t) => (
              <tr key={t.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-gray-500">{format(new Date(t.created_at), 'd MMM yyyy, HH:mm')}</td>
                <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{t.user_id.slice(0, 8)}</td>
                <td className="py-2 pr-4 text-white">{t.type}</td>
                <td className={`py-2 pr-4 ${t.amount_kes >= 0 ? 'text-apex-primary' : 'text-red-400'}`}>
                  {Number(t.amount_kes).toLocaleString()}
                </td>
                <td className="py-2 pr-4 text-gray-400">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
