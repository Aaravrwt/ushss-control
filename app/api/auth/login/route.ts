import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 1. Check Master Dean Key override if set
    const deanAdminKey = process.env.DEAN_ADMIN_KEY;
    if (deanAdminKey && (username.toLowerCase() === 'dean' || username.toLowerCase() === 'admin')) {
      if (password === deanAdminKey) {
        await createSession({
          userId: 0,
          username: 'dean',
          role: 'admin',
          fullName: 'Dean of USHSS',
          isDean: true,
        });

        return NextResponse.json({ success: true, redirect: '/' });
      }
    }

    // 2. Query Supabase users table for admin credentials
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'admin')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid administrative credentials' },
        { status: 401 }
      );
    }

    // 3. Verify bcrypt password hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid administrative credentials' },
        { status: 401 }
      );
    }

    // 4. Create encrypted session cookie
    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name || 'Dean / Administrator',
      isDean: true,
    });

    return NextResponse.json({ success: true, redirect: '/' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failure';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
