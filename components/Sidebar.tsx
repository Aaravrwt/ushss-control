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
  Database,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  userFullName?: string;
  userRole?: string;
}

export default function Sidebar({
  userFullName = 'Dean of USHSS',
  userRole = 'Executive Administrator',
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const attendanceNav = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Student Search', href: '/students', icon: Users },
    { name: 'Individual Attendance', href: '/individual-attendance', icon: UserCheck },
    { name: 'Subject Attendance', href: '/subject-attendance', icon: BookOpen },
    { name: 'Class Attendance', href: '/class-attendance', icon: CalendarDays },
    { name: 'Overall Attendance', href: '/overall-attendance', icon: FileSpreadsheet },
  ];

  const systemNav = [
    { name: 'Database Explorer', href: '/database-explorer', icon: Database },
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
    <aside className="w-64 bg-[#0d1117] border-r border-[#21262d] flex flex-col flex-shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-[#21262d] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-semibold text-zinc-100 tracking-tight block">
              USHSS Control
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase block">
              Dean Office
            </span>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Connected to Supabase" />
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Attendance Group */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5 mb-2">
            Attendance Administration
          </div>
          <div className="space-y-0.5">
            {attendanceNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1f242c] text-blue-400 border border-[#30363d] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Group */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5 mb-2">
            System & Records
          </div>
          <div className="space-y-0.5">
            {systemNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1f242c] text-blue-400 border border-[#30363d] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Admin User & Sign Out */}
      <div className="p-3 border-t border-[#21262d] bg-[#0d1117]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-[#21262d] mb-2">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-zinc-200 truncate">{userFullName}</p>
            <p className="text-[10px] text-zinc-500 truncate capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 rounded-md bg-transparent hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-900/50 text-xs font-medium transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
