import React from 'react';
import { motion } from 'framer-motion';

export interface AdminTableProps<T> {
  columns: { key: keyof T; label: string; className?: string }[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  error?: string;
  renderRow?: (row: T, idx: number) => React.ReactNode;
}

function AdminTable<T extends { id: string | number }>(props: AdminTableProps<T>) {
  const { columns, data, loading, emptyText, error, renderRow } = props;
  if (loading) {
    return (
      <div className="animate-pulse p-8 text-center text-gray-500">Loading...</div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!data.length) {
    return <div className="p-8 text-center text-gray-500">{emptyText || 'No data found.'}</div>;
  }
  return (
    <motion.table className="w-full text-sm border-separate border-spacing-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} className={`text-left px-3 py-2 font-semibold text-gray-300 ${col.className || ''}`}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          renderRow ? renderRow(row, idx) : (
            <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-3 py-2 ${col.className || ''}`}>{String(row[col.key])}</td>
              ))}
            </tr>
          )
        ))}
      </tbody>
    </motion.table>
  );
}

export default AdminTable;
