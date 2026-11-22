import { Users, GraduationCap, CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  // Fetch overview statistics directly with service role
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

  // Fetch recent attendance sessions
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
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-800/50',
    },
    {
      name: 'Appointed Faculty',
      value: facultyCount ?? 0,
      icon: GraduationCap,
      desc: 'Teaching & department faculty',
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-800/50',
    },
    {
      name: 'Class Sessions',
      value: sessionCount ?? 0,
      icon: CheckCircle2,
      desc: 'Lectures held across all subjects',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/50',
    },
    {
      name: 'Attendance Records',
      value: recordCount ?? 0,
      icon: ShieldCheck,
      desc: 'Verified student attendance records',
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Executive Level Control
            </span>
            <span className="text-xs text-slate-400">• Institutional Supabase Connection Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5">Welcome, Dean of USHSS</h1>
          <p className="text-sm text-slate-400 mt-1">
            Oversee classroom attendance, execute administrative reliefs, and inspect institutional academic logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/individual-attendance"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/25 flex items-center space-x-1.5"
          >
            <span>Grant Relief</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/overall-attendance"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            Defalcation Register
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className={`p-6 rounded-2xl border ${s.bg} flex flex-col justify-between backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {s.name}
                </span>
                <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Modules & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Nav Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center space-x-2">
            <span>Dean Administrative Modules</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/individual-attendance"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Individual Attendance Override
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search individual students, review session attendance, and apply approved relief corrections directly to the database.
              </p>
            </Link>

            <Link
              href="/subject-attendance"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Subject Attendance Matrix
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by subject and semester to inspect cohort enrollment, total lectures, and recalculate subject percentages.
              </p>
            </Link>

            <Link
              href="/overall-attendance"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Cohort Defalcation Register
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor students below the mandatory 75% attendance threshold and track aggregate institutional attendance.
              </p>
            </Link>

            <Link
              href="/activity-history"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Administrative Audit Log
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review timestamped records of every modification, relief grant, and credentialed administrative action.
              </p>
            </Link>
          </div>
        </div>

        {/* Live Recent Sessions Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide">Recent Lecture Sessions</h2>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((s: any) => (
                <div
                  key={s.id}
                  className="pb-3 border-b border-slate-800/80 last:border-0 last:pb-0 flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {s.timetable_slots?.subject || 'Lecture Session'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {s.timetable_slots?.programme} • Sem {s.timetable_slots?.semester}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Faculty: {s.faculty?.full_name || 'N/A'} • {s.date}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      s.is_open
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {s.is_open ? 'Active' : 'Closed'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent sessions recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
