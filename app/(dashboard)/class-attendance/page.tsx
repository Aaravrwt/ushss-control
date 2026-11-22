import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

export default async function ClassAttendancePage() {
  const { data: sessions } = await supabaseAdmin
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
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Class & Session Attendance
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Historical log of lecture sessions conducted by faculty with schedule and room mappings.
        </p>
      </div>

      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Session & Date</th>
                <th className="px-5 py-3">Course Subject & Room</th>
                <th className="px-5 py-3">Cohort</th>
                <th className="px-5 py-3">Faculty In-Charge</th>
                <th className="px-5 py-3 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {!sessions || sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">
                    No classroom sessions found in database.
                  </td>
                </tr>
              ) : (
                sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono font-medium text-zinc-200">Session #{s.id}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{s.date}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-zinc-200">
                        {s.timetable_slots?.subject || 'Lecture'}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Room {s.timetable_slots?.room || 'TBD'} • {s.timetable_slots?.start_time} - {s.timetable_slots?.end_time}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      <div>{s.timetable_slots?.programme || '—'}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Batch {s.timetable_slots?.batch || '—'} • Sem {s.timetable_slots?.semester || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-zinc-200">{s.faculty?.full_name || 'N/A'}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{s.faculty?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={s.is_open ? 'open' : 'closed'} size="sm" />
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
