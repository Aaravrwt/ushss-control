import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { calculateAttendanceStats, calculateSubjectWiseStats } from '@/lib/attendance/calculations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    // 1. Fetch student info
    const { data: student, error: studentErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Fetch all attendance records with session and slot details
    const { data: records, error: recordsErr } = await supabaseAdmin
      .from('attendance_records')
      .select(`
        id,
        session_id,
        student_id,
        status,
        marked_at,
        review_status,
        flags,
        suspicion_score,
        attendance_sessions (
          id,
          date,
          is_open,
          opened_at,
          closed_at,
          timetable_slots (
            id,
            subject,
            day_of_week,
            start_time,
            end_time,
            room,
            programme,
            semester
          )
        )
      `)
      .eq('student_id', studentId)
      .order('marked_at', { ascending: false });

    if (recordsErr) {
      return NextResponse.json({ error: recordsErr.message }, { status: 500 });
    }

    // Cast the records
    const attendanceRecords = records || [];

    // Calculate overall stats
    const overallStats = calculateAttendanceStats(attendanceRecords as any);

    // Calculate subject-wise breakdown
    const subjectStats = calculateSubjectWiseStats(attendanceRecords as any);

    return NextResponse.json({
      student,
      overallStats,
      subjectStats,
      records: attendanceRecords,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
