"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Users, 
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/scoring', label: 'Form Simulasi Menembak', icon: ClipboardList },
  { path: '/scores', label: 'Data Scoring', icon: Database },
  { path: '/personnel', label: 'Data Personil', icon: Users },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

// lightweight user fetching: read session cookie via fetch api
function useUserName() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json().then(d => setUser(d)).catch(() => setUser(null)) : setUser(null)).catch(() => setUser(null));
  }, []);
  return user;
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useUserName();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#4A3628] text-white flex flex-col z-50 shadow-xl" data-testid="sidebar">
      <div className="p-6 border-b border-[#5a4638]">
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-[#D4AF37]" />
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight">LEMDIKLAT</h1>
            <p className="text-xs text-[#C3A987]">Simulasi Menembak</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#D4AF37] text-[#2D231F] font-semibold' 
                      : 'text-[#C3A987] hover:bg-[#5a4638] hover:text-white'
                  }`}
                  data-testid={`nav-${item.path.slice(1)}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#2D231F]' : 'text-[#C3A987] group-hover:text-white'}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#5a4638]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#C3A987] flex items-center justify-center text-[#2D231F] font-semibold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || ''}</p>
            <p className="text-xs text-[#C3A987] truncate">{user?.role || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[#C3A987] hover:bg-[#5a4638] hover:text-white transition-all duration-200"
          data-testid="sidebar-logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
