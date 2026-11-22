import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/auth/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        userFullName={session?.fullName || 'Dean of USHSS'}
        userRole={session?.isDean ? 'Dean of School' : 'Administrator'}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
