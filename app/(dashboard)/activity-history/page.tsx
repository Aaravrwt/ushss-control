'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, ShieldCheck } from 'lucide-react';
import { Card, Button, Input, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

export default function ActivityHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit?limit=100');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.detail?.toLowerCase().includes(q) ||
      log.ip?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#21262d] gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Administrative Activity History
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable audit record of institutional relief grants, corrections, and system events.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Feed</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#11141a] border border-[#21262d]">
        <Input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter audit log by action keyword, student ID, or admin note..."
          className="text-xs"
        />
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC/IST)</th>
                <th className="px-5 py-3">Action Type</th>
                <th className="px-5 py-3">Audit Details & Relief Notes</th>
                <th className="px-5 py-3 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <TableSkeleton rows={5} cols={4} />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-zinc-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let parsedDetail = log.detail;
                  try {
                    const obj = JSON.parse(log.detail);
                    parsedDetail = obj.detail || log.detail;
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-[#161b22]/50 transition-colors">
                      <td className="px-5 py-3 text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                        {new Date(log.ts).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161b22] text-blue-400 border border-blue-900/50">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-200">
                        <div className="max-w-xl break-words leading-relaxed">
                          {parsedDetail}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {log.ip || 'internal'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
