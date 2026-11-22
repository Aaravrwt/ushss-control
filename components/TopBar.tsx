'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from './ui/design-system';

interface TopBarProps {
  userFullName?: string;
  userRole?: string;
}

export default function TopBar({
  userFullName = 'Dean of USHSS',
  userRole = 'Executive Administrator',
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic breadcrumb mapping
  const breadcrumbMap: Record<string, string> = {
    '/': 'Overview',
    '/students': 'Student Directory',
    '/individual-attendance': 'Individual Attendance Management',
    '/subject-attendance': 'Subject Attendance Matrix',
    '/class-attendance': 'Class & Session Attendance',
    '/overall-attendance': 'Overall Attendance Register',
    '/database-explorer': 'Database Explorer',
    '/activity-history': 'Activity History & Audit Log',
    '/settings': 'Security Settings',
  };

  const title = breadcrumbMap[pathname] || 'Administration';

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
    <header className="h-14 border-b border-[#21262d] bg-[#0d1117] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-zinc-500 font-medium">Dean Portal</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200 font-semibold">{title}</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-400 bg-[#161b22] px-2.5 py-1 rounded-md border border-[#21262d]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>{userFullName}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500 font-mono text-[11px]">{userRole}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-rose-400">
          <LogOut className="w-3.5 h-3.5 mr-1" />
          <span>Exit</span>
        </Button>
      </div>
    </header>
  );
}
