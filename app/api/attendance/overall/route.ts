import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { calculateAttendanceStats } from '@/lib/attendance/calculations';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programme = searchParams.get('programme') || '';
    const semester = searchParams.get('semester') || '';

    // 1. Fetch all students
    let studentsQuery = supabaseAdmin
      .from('users')
      .select('id, full_name, enrollment_no, programme, batch, semester, section')
      .eq('role', 'student')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (programme) studentsQuery = studentsQuery.eq('programme', programme);
    if (semester) studentsQuery = studentsQuery.eq('semester', semester);

    const { data: students, error: stdErr } = await studentsQuery;
    if (stdErr) return NextResponse.json({ error: stdErr.message }, { status: 500 });

    if (!students || students.length === 0) {
      return NextResponse.json({ summaries: [] });
    }

    const studentIds = students.map((s) => s.id);

    // 2. Fetch all attendance records for these students
    const { data: records, error: recErr } = await supabaseAdmin
      .from('attendance_records')
      .select('id, student_id, status, review_status')
      .in('student_id', studentIds);

    if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 });

    // Group records by student
    const studentRecordsMap = new Map<number, any[]>();
    studentIds.forEach((id) => studentRecordsMap.set(id, []));

    (records || []).forEach((r) => {
      const arr = studentRecordsMap.get(r.student_id);
      if (arr) arr.push(r);
    });

    const summaries = students.map((s) => {
      const recs = studentRecordsMap.get(s.id) || [];
      const stats = calculateAttendanceStats(recs as any);
      return {
        student_id: s.id,
        student_name: s.full_name,
        enrollment_no: s.enrollment_no || 'N/A',
        programme: s.programme || 'N/A',
        batch: s.batch || 'N/A',
        semester: s.semester || 'N/A',
        section: s.section || '',
        total_classes: stats.total,
        attended_classes: stats.attended,
        missed_classes: stats.missed,
        percentage: stats.percentage,
      };
    });

    return NextResponse.json({ summaries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
