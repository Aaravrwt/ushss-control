import { Shield, Key, Lock, Database } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Security & Administration Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review executive authentication status, Supabase connection boundaries, and access configurations.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Active Executive Session</h3>
            <p className="text-xs text-slate-400">Authenticated administrative identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold">Authorized Identity</span>
            <p className="text-white font-medium text-sm mt-1">{session?.fullName || 'Dean of USHSS'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold">Username / Role</span>
            <p className="text-white font-medium text-sm mt-1">{session?.username} ({session?.role})</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold">Security Level</span>
            <p className="text-blue-400 font-medium text-sm mt-1">Executive Administrator (Full Overrides)</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold">Session Status</span>
            <p className="text-emerald-400 font-medium text-sm mt-1">Valid (HttpOnly JWT Cookie)</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Supabase Security Guardrails</h3>
            <p className="text-xs text-slate-400">Isolation from public browser exposure</p>
          </div>
        </div>

        <ul className="space-y-3 text-xs text-slate-300">
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>Zero Browser Exposure:</strong> Direct Supabase database queries and the <code>SUPABASE_SERVICE_ROLE_KEY</code> are executed exclusively on server-side Next.js route handlers.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>No Public Registration:</strong> This portal has no signup form, public endpoint, or links on the student portal.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>Full Dashboard Consistency:</strong> Modifications update the primary <code>attendance_records</code> table directly, guaranteeing instantaneous recalculations on student and teacher dashboards.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
