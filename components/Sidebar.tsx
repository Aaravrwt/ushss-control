'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  userFullName?: string;
  userRole?: string;
}

export default function Sidebar({ userFullName = 'Dean of USHSS', userRole = 'Executive Administrator' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Student Search', href: '/students', icon: Users },
    { name: 'Individual Attendance', href: '/individual-attendance', icon: UserCheck },
    { name: 'Subject Attendance', href: '/subject-attendance', icon: BookOpen },
    { name: 'Class Attendance', href: '/class-attendance', icon: CalendarDays },
    { name: 'Overall Attendance', href: '/overall-attendance', icon: FileSpreadsheet },
    { name: 'Activity History', href: '/activity-history', icon: History },
    { name: 'Security Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">USHSS CONTROL</h2>
          <p className="text-xs text-blue-400 font-medium">Dean Office Portal</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Attendance Modules
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="truncate pr-2">
            <p className="text-sm font-semibold text-white truncate">{userFullName}</p>
            <p className="text-xs text-slate-400 truncate">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-800/50 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
