'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui/design-system';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(data.redirect || '/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-[380px]">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#161b22] border border-[#30363d] text-blue-400 mb-3 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            USHSS Master Control
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Private Dean Attendance Administration
          </p>
        </div>

        {/* Login Panel */}
        <div className="bg-[#11141a] border border-[#21262d] rounded-xl p-6 shadow-2xl">
          <div className="mb-5 pb-3 border-b border-[#21262d] flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400">
                Restricted Terminal
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161b22] text-zinc-400 border border-[#30363d]">
              v1.0 • GGSIPU
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Administrator Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dean or admin"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Passphrase
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dean Terminal'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[11px] text-zinc-500 leading-relaxed">
          University School of Humanities & Social Sciences<br />
          Guru Gobind Singh Indraprastha University
        </div>
      </div>
    </div>
  );
}
