import React from 'react';
import { motion } from 'framer-motion';

export interface AdminCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, value, icon, className = '', loading, error }) => (
  <motion.div className={`bg-apex-muted/40 rounded-lg p-4 flex flex-col gap-2 shadow ${className}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center gap-2">
      {icon && <span className="text-2xl text-apex-primary">{icon}</span>}
      <span className="text-sm text-gray-400 font-medium">{title}</span>
    </div>
    <div className="text-2xl font-mono font-bold text-white min-h-[2.5rem]">
      {loading ? <span className="animate-pulse text-gray-500">...</span> : error ? <span className="text-red-500 text-base">{error}</span> : value}
    </div>
  </motion.div>
);

export default AdminCard;
