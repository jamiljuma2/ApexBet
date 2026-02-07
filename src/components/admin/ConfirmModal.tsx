import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', loading, error, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="bg-apex-card rounded-lg shadow-lg p-6 w-full max-w-sm" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
          <h2 className="text-lg font-bold mb-2">{title}</h2>
          {description && <p className="text-sm text-gray-300 mb-4">{description}</p>}
          {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-1.5 rounded bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50" onClick={onCancel} disabled={loading}>{cancelText}</button>
            <button className="px-4 py-1.5 rounded bg-apex-primary text-white hover:bg-apex-primary/80 disabled:opacity-50" onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : confirmText}</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmModal;
