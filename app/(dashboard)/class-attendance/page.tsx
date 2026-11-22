import { supabaseAdmin } from '@/lib/supabase/server';
import { CalendarDays, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClassAttendancePage() {
  const { data: sessions, error } = await supabaseAdmin
    .from('attendance_sessions')
    .select(`
      id,
      date,
      is_open,
      opened_at,
      closed_at,
      timetable_slots (
        id,
        subject,
        programme,
        batch,
        semester,
        start_time,
        end_time,
        room
      ),
      faculty:faculty_id (
        full_name,
        email
      )
    `)
    .order('date', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Class & Session Attendance</h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical log of all classroom lecture sessions conducted by faculty with attendance status.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Session & Date</th>
                <th className="px-6 py-4">Course Subject</th>
                <th className="px-6 py-4">Cohort</th>
                <th className="px-6 py-4">Faculty In-Charge</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {!sessions || sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No classroom sessions found in database.
                  </td>
                </tr>
              ) : (
                sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">Session #{s.id}</div>
                      <div className="text-xs text-slate-500">{s.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">
                        {s.timetable_slots?.subject || 'Lecture'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Room: {s.timetable_slots?.room || 'TBD'} • {s.timetable_slots?.start_time} - {s.timetable_slots?.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div>{s.timetable_slots?.programme || '—'}</div>
                      <div className="text-slate-500">
                        Batch {s.timetable_slots?.batch || '—'} • Sem {s.timetable_slots?.semester || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="font-medium text-white">{s.faculty?.full_name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{s.faculty?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          s.is_open
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {s.is_open ? 'Open' : 'Closed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
