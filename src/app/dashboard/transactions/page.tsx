import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Transaction history</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Amount (KES)</th>
              <th className="pb-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {txns?.map((tx) => (
              <tr key={tx.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-gray-300">
                  {format(new Date(tx.created_at), 'd MMM yyyy, HH:mm')}
                </td>
                <td className="py-2 pr-4 text-white">{tx.type}</td>
                <td className={`py-2 pr-4 ${tx.amount_kes >= 0 ? 'text-apex-primary' : 'text-red-400'}`}>
                  {tx.amount_kes >= 0 ? '+' : ''}{Number(tx.amount_kes).toLocaleString()}
                </td>
                <td className="py-2 pr-4 text-gray-400">{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!txns || txns.length === 0) && (
          <p className="text-gray-500 py-4">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}
