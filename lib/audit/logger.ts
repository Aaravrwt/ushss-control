import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function logAdminAction(action: string, detail: string, ip?: string) {
  try {
    const session = await getSession();
    const userId = typeof session?.userId === 'number' && session.userId > 0 ? session.userId : null;

    await supabaseAdmin.from('audit_log').insert({
      user_id: userId,
      action: `[DEAN_CONTROL] ${action}`,
      detail: JSON.stringify({
        executor: session?.fullName || 'Dean Office',
        username: session?.username || 'dean',
        detail,
        timestamp: new Date().toISOString(),
      }),
      ip: ip || 'internal_server',
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to write administrative audit log:', e);
  }
}
