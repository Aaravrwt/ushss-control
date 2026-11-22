import { AttendanceRecord, AttendanceSummary, SubjectAttendanceSummary } from '@/lib/supabase/types';

/**
 * Calculates student attendance strictly according to USHSS Portal algorithm:
 * - Total = count of all marked records
 * - Attended = status == 'present' AND review_status != 'rejected'
 * - Missed = status == 'absent' OR review_status == 'rejected'
 * - Percentage = (Attended / Total) * 100 rounded to 1 decimal place
 */
export function calculateAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  let attended = 0;
  let missed = 0;

  for (const r of records) {
    if (r.status === 'present' && r.review_status !== 'rejected') {
      attended++;
    } else {
      missed++;
    }
  }

  const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0.0;

  return {
    total,
    attended,
    missed,
    percentage,
  };
}

/**
 * Calculates subject-wise breakdown for a list of records joined with sessions & slots
 */
export function calculateSubjectWiseStats(records: (AttendanceRecord & {
  attendance_sessions?: {
    timetable_slots?: {
      subject: string;
    } | null;
  } | null;
})[]): SubjectAttendanceSummary[] {
  const map = new Map<string, { total: number; attended: number; missed: number }>();

  for (const r of records) {
    const subject = r.attendance_sessions?.timetable_slots?.subject || 'Unknown Subject';
    const entry = map.get(subject) || { total: 0, attended: 0, missed: 0 };
    
    entry.total++;
    if (r.status === 'present' && r.review_status !== 'rejected') {
      entry.attended++;
    } else {
      entry.missed++;
    }
    
    map.set(subject, entry);
  }

  const results: SubjectAttendanceSummary[] = [];
  map.forEach((value, key) => {
    results.push({
      subject: key,
      total_classes: value.total,
      attended_classes: value.attended,
      missed_classes: value.missed,
      percentage: value.total > 0 ? Math.round((value.attended / value.total) * 1000) / 10 : 0.0,
    });
  });

  return results.sort((a, b) => a.subject.localeCompare(b.subject));
}
