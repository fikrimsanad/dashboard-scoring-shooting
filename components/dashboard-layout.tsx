"use client";

import Sidebar from './sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {title && (
          <header className="bg-white border-b border-[#E6E1D8] px-8 py-5 sticky top-0 z-40">
            <h1 className="font-heading text-2xl font-bold text-[#2D231F]">{title}</h1>
          </header>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
