import { Database, Table, ShieldCheck } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, StatusBadge } from '@/components/ui/design-system';

export default async function DatabaseExplorerPage() {
  const tables = [
    { name: 'users', desc: 'Enrolled students, appointed faculty, and administrators' },
    { name: 'timetable_slots', desc: 'Weekly scheduled lectures, course subjects, and rooms' },
    { name: 'attendance_sessions', desc: 'Active and closed attendance sessions conducted by faculty' },
    { name: 'attendance_records', desc: 'Student lecture attendance records, status, and audit flags' },
    { name: 'audit_log', desc: 'Institutional audit trail of administrative modifications' },
    { name: 'subjects_offered', desc: 'Master subject catalogue and academic course designations' },
    { name: 'elective_offerings', desc: 'Elective course offerings and cohort groups' },
    { name: 'student_elective_choices', desc: 'Student elective selections and allocations' },
  ];

  // Fetch count for each table
  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabaseAdmin.from(t.name).select('*', { count: 'exact', head: true });
      return { ...t, count: count ?? 0 };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Database Schema Explorer
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Read-only overview of primary Supabase PostgreSQL relational tables and row counts.
        </p>
      </div>

      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Table Name</th>
                <th className="px-5 py-3">Schema Description</th>
                <th className="px-5 py-3 text-right">Row Count</th>
                <th className="px-5 py-3 text-right">RLS / Privilege Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {counts.map((t) => (
                <tr key={t.name} className="hover:bg-[#161b22]/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-blue-400">{t.name}</td>
                  <td className="px-5 py-3 text-zinc-400">{t.desc}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-zinc-200">
                    {t.count}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[#161b22] text-zinc-400 border border-[#21262d]">
                      Service Role Only
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
