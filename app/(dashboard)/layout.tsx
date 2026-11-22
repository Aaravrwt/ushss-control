import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getSession } from '@/lib/auth/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const fullName = session?.fullName || 'Dean of USHSS';
  const role = session?.isDean ? 'Executive Dean' : 'Administrator';

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-[#f0f6fc]">
      <Sidebar userFullName={fullName} userRole={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userFullName={fullName} userRole={role} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
