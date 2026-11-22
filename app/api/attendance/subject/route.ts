import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || '';
    const semester = searchParams.get('semester') || '';

    // 1. Get subjects list if not specified
    if (!subject) {
      const { data: slots, error: slotsErr } = await supabaseAdmin
        .from('timetable_slots')
        .select('subject, semester, programme')
        .order('subject', { ascending: true });

      if (slotsErr) return NextResponse.json({ error: slotsErr.message }, { status: 500 });

      // Unique subjects
      const subjects = Array.from(new Set((slots || []).map((s) => s.subject)));
      return NextResponse.json({ subjects });
    }

    // 2. Fetch timetable slots for this subject
    let slotsReq = supabaseAdmin
      .from('timetable_slots')
      .select('id, subject, semester, programme, batch, section')
      .eq('subject', subject);

    if (semester) slotsReq = slotsReq.eq('semester', semester);

    const { data: slots, error: slotsErr } = await slotsReq;
    if (slotsErr) return NextResponse.json({ error: slotsErr.message }, { status: 500 });

    const slotIds = (slots || []).map((s) => s.id);

    // 3. Fetch attendance sessions
    const { data: sessions, error: sessErr } = await supabaseAdmin
      .from('attendance_sessions')
      .select('id, date, is_open, slot_id')
      .in('slot_id', slotIds);

    if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 500 });

    const sessionIds = (sessions || []).map((sess) => sess.id);

    // 4. Fetch all attendance records for these sessions
    let records: any[] = [];
    if (sessionIds.length > 0) {
      const { data: recs, error: recErr } = await supabaseAdmin
        .from('attendance_records')
        .select(`
          id,
          session_id,
          student_id,
          status,
          review_status,
          users (
            id,
            full_name,
            enrollment_no,
            programme,
            semester
          )
        `)
        .in('session_id', sessionIds);

      if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 });
      records = recs || [];
    }

    // Aggregate by student
    const studentMap = new Map<number, {
      student_id: number;
      student_name: string;
      enrollment_no: string;
      total: number;
      attended: number;
      missed: number;
    }>();

    records.forEach((r) => {
      if (!r.users) return;
      const sid = r.student_id;
      const existing = studentMap.get(sid) || {
        student_id: sid,
        student_name: r.users.full_name,
        enrollment_no: r.users.enrollment_no || 'N/A',
        total: 0,
        attended: 0,
        missed: 0,
      };

      existing.total++;
      if (r.status === 'present' && r.review_status !== 'rejected') {
        existing.attended++;
      } else {
        existing.missed++;
      }

      studentMap.set(sid, existing);
    });

    const students = Array.from(studentMap.values()).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.attended / s.total) * 1000) / 10 : 0.0,
    })).sort((a, b) => a.student_name.localeCompare(b.student_name));

    return NextResponse.json({
      subject,
      totalSessions: sessionIds.length,
      sessions,
      students,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
