import { Shield, Database, Lock, CheckCircle2 } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { Card } from '@/components/ui/design-system';

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Security & Configuration Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review active executive session boundaries, Supabase connections, and credential policies.
        </p>
      </div>

      {/* Active Session Card */}
      <Card className="bg-[#11141a] space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#21262d]">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
              Active Executive Session
            </h3>
            <p className="text-[11px] text-zinc-500">Authenticated administrative credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block">
              Authorized Identity
            </span>
            <p className="text-zinc-200 font-medium text-xs mt-1">
              {session?.fullName || 'Dean of USHSS'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block">
              Username & Role
            </span>
            <p className="text-zinc-200 font-mono text-xs mt-1">
              {session?.username} ({session?.role})
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block">
              Access Scope
            </span>
            <p className="text-blue-400 font-medium text-xs mt-1">
              Dean Level (Database Overrides & Relinquishment)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block">
              Session Integrity
            </span>
            <p className="text-emerald-400 font-medium text-xs mt-1">
              Valid (HttpOnly JWT Signed Session)
            </p>
          </div>
        </div>
      </Card>

      {/* Database Guardrails Card */}
      <Card className="bg-[#11141a] space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#21262d]">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
              Supabase Architecture & Security Guardrails
            </h3>
            <p className="text-[11px] text-zinc-500">Security enforcement details</p>
          </div>
        </div>

        <ul className="space-y-2.5 text-xs text-zinc-400">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Zero Browser Key Exposure:</strong> Database operations use <code className="text-blue-400 font-mono text-[11px]">SUPABASE_SERVICE_ROLE_KEY</code> strictly server-side.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Revoked Public Tables Compliance:</strong> Complies with migration <code className="text-zinc-300 font-mono text-[11px]">003_revoke_public_client_access.sql</code>.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Automatic Sync Across Dashboards:</strong> Changes propagate directly to <code className="text-zinc-300 font-mono text-[11px]">attendance_records</code>, keeping student and faculty dashboards in sync.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
