import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { logAdminAction } from '@/lib/audit/logger';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { recordId, studentId, sessionId, newStatus, reason } = await request.json();

    if (!newStatus || !['present', 'absent'].includes(newStatus)) {
      return NextResponse.json({ error: 'Valid status (present/absent) is required' }, { status: 400 });
    }

    // Case 1: Existing record update
    if (recordId) {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('attendance_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('attendance_records')
        .update({
          status: newStatus,
          review_status: 'approved',
          flags: existing.flags ? `${existing.flags},DEAN_CORRECTION` : 'DEAN_CORRECTION',
        })
        .eq('id', recordId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      await logAdminAction(
        'ATTENDANCE_CORRECTION',
        `Record #${recordId} for Student #${existing.student_id} changed from '${existing.status}' to '${newStatus}'. Reason: ${reason || 'Relief granted by Dean'}`,
        request.headers.get('x-forwarded-for') || undefined
      );

      return NextResponse.json({ success: true, record: updated });
    }

    // Case 2: New record creation for a session if student wasn't marked
    if (studentId && sessionId) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('attendance_records')
        .upsert(
          {
            session_id: sessionId,
            student_id: studentId,
            status: newStatus,
            review_status: 'approved',
            flags: 'DEAN_MANUAL_INSERT',
            marked_at: new Date().toISOString(),
          },
          { onConflict: 'session_id,student_id' }
        )
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      await logAdminAction(
        'ATTENDANCE_INSERT_OVERRIDE',
        `Student #${studentId} assigned '${newStatus}' for Session #${sessionId}. Reason: ${reason || 'Relief granted by Dean'}`,
        request.headers.get('x-forwarded-for') || undefined
      );

      return NextResponse.json({ success: true, record: inserted });
    }

    return NextResponse.json({ error: 'Missing recordId or (studentId and sessionId)' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
