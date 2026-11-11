import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#07111f' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-auto" style={{ backgroundColor: '#07111f' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
