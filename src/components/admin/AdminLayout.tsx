import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen bg-apex-dark text-white">
    <AdminSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-apex-card">
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;
