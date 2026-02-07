import React from 'react';

const AdminTopBar: React.FC = () => (
  <header className="sticky top-0 z-10 h-16 flex items-center justify-between bg-apex-dark border-b border-apex-muted/30 px-4 md:px-8">
    <div className="flex items-center gap-2">
      <span className="bg-apex-primary text-xs font-bold px-2 py-1 rounded">Admin</span>
      <span className="text-sm text-gray-400">Dashboard</span>
    </div>
    <div className="flex items-center gap-4">
      <button className="relative focus:outline-none" aria-label="Notifications">
        <span className="material-icons text-xl text-gray-400">notifications</span>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
      </button>
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="material-icons text-xl text-gray-400">account_circle</span>
        <span className="text-sm">Admin</span>
      </div>
    </div>
  </header>
);

export default AdminTopBar;
