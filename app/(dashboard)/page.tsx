import { Users, GraduationCap, CheckCircle2, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, Button, StatusBadge } from '@/components/ui/design-system';

export default async function OverviewPage() {
  const [
    { count: studentCount },
    { count: facultyCount },
    { count: sessionCount },
    { count: recordCount },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
    supabaseAdmin.from('attendance_sessions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('attendance_records').select('*', { count: 'exact', head: true }),
  ]);

  const { data: recentSessions } = await supabaseAdmin
    .from('attendance_sessions')
    .select(`
      id,
      date,
      is_open,
      timetable_slots (
        subject,
        programme,
        semester
      ),
      faculty:faculty_id (
        full_name
      )
    `)
    .order('id', { ascending: false })
    .limit(5);

  const stats = [
    {
      name: 'Enrolled Students',
      value: studentCount ?? 0,
      icon: Users,
      desc: 'Active student roster in Supabase',
    },
    {
      name: 'Appointed Faculty',
      value: facultyCount ?? 0,
      icon: GraduationCap,
      desc: 'Teaching & department faculty',
    },
    {
      name: 'Class Sessions',
      value: sessionCount ?? 0,
      icon: CheckCircle2,
      desc: 'Lectures held across all subjects',
    },
    {
      name: 'Attendance Records',
      value: recordCount ?? 0,
      icon: ShieldCheck,
      desc: 'Verified student attendance records',
    },
  ];

  const modules = [
    {
      title: 'Individual Attendance Relief',
      href: '/individual-attendance',
      desc: 'Search student profile, review attended vs missed lectures, and apply authorized administrative relief.',
    },
    {
      title: 'Subject Attendance Matrix',
      href: '/subject-attendance',
      desc: 'Filter by course subject to inspect cohort enrollment, lecture logs, and subject percentages.',
    },
    {
      title: 'Overall Defalcation Register',
      href: '/overall-attendance',
      desc: 'Cohort-wide compliance tracking for students below the 75% exam qualification threshold with CSV export.',
    },
    {
      title: 'Class Attendance Log',
      href: '/class-attendance',
      desc: 'Historical lecture session logs conducted by faculty with room allocations and timestamps.',
    },
    {
      title: 'Activity History & Audit',
      href: '/activity-history',
      desc: 'Immutable audit trail of all administrative interventions, previous statuses, and justifications.',
    },
    {
      title: 'Database Explorer',
      href: '/database-explorer',
      desc: 'Direct read-only schema table browser to verify database referential integrity.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#21262d] gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Administrative Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry and executive controls for USHSS student attendance records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/individual-attendance">
            <Button size="sm">
              <span>Grant Relief</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
          <Link href="/overall-attendance">
            <Button variant="secondary" size="sm">
              Defalcation Register
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.name} className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-400 tracking-wide uppercase">
                  {s.name}
                </span>
                <div className="p-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
                  {s.value}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{s.desc}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Modules and Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Nav Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Dean Administrative Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map((m) => (
              <Link key={m.title} href={m.href}>
                <Card hover className="h-full flex flex-col justify-between group cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                        {m.title}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{m.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Recent Sessions Feed */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Recent Lecture Sessions
          </h2>
          <Card className="space-y-3 divide-y divide-[#21262d]">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((s: any) => (
                <div key={s.id} className="pt-3 first:pt-0 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {s.timetable_slots?.subject || 'Lecture Session'}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {s.timetable_slots?.programme} • Sem {s.timetable_slots?.semester}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {s.faculty?.full_name || 'Faculty N/A'} • {s.date}
                    </p>
                  </div>
                  <StatusBadge status={s.is_open ? 'open' : 'closed'} size="sm" />
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">No recent sessions recorded.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
