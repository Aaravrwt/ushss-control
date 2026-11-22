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
    const query = searchParams.get('q') || '';
    const programme = searchParams.get('programme') || '';
    const semester = searchParams.get('semester') || '';

    let req = supabaseAdmin
      .from('users')
      .select('id, username, full_name, email, enrollment_no, programme, batch, semester, section, status, is_active')
      .eq('role', 'student')
      .order('full_name', { ascending: true })
      .limit(100);

    if (query) {
      req = req.or(`full_name.ilike.%${query}%,enrollment_no.ilike.%${query}%,username.ilike.%${query}%`);
    }

    if (programme) {
      req = req.eq('programme', programme);
    }

    if (semester) {
      req = req.eq('semester', semester);
    }

    const { data, error } = await req;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ students: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
