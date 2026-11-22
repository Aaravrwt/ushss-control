'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react';
import { Card, Button, Input, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

function IndividualAttendanceContent() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [studentIdInput, setStudentIdInput] = useState(initialStudentId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation / Relief Modal State
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<'present' | 'absent'>('present');
  const [reason, setReason] = useState('Official relief approved by Dean (Medical/Academic Representation)');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudentAttendance = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/students/${id}/attendance`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch attendance data');
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching records');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialStudentId) {
      fetchStudentAttendance(initialStudentId);
    }
  }, [initialStudentId]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: selectedRecord.id,
          newStatus: targetStatus,
          reason,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to apply relief override');

      await fetchStudentAttendance(data.student.id.toString());
      setSelectedRecord(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Override failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Individual Attendance Management
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review subject breakdowns, session timestamps, and apply authorized Dean relief adjustments.
        </p>
      </div>

      {/* Student Lookup Toolbar */}
      <Card className="p-3.5 bg-[#11141a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStudentAttendance(studentIdInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 relative w-full">
            <Input
              type="text"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="Enter Student ID (e.g., 1, 2) or use Student Directory..."
              className="text-xs"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !studentIdInput}
            size="sm"
            className="w-full sm:w-auto whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Load Records'}
          </Button>
        </form>
      </Card>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <Card className="p-6">
          <TableSkeleton rows={4} cols={5} />
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          {/* Student Profile Card & Aggregate KPI */}
          <Card className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#11141a]">
            <div className="md:col-span-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-1">
                Student Profile • ID #{data.student.id}
              </span>
              <h2 className="text-lg font-semibold text-zinc-100">{data.student.full_name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-2">
                <span>
                  Enrollment: <span className="font-mono text-zinc-200">{data.student.enrollment_no || 'N/A'}</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Programme: <span className="text-zinc-200">{data.student.programme || 'N/A'}</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Cohort: <span className="text-zinc-200">Batch {data.student.batch || '—'}, Sem {data.student.semester || '—'}</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] text-right">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                Overall Aggregate
              </span>
              <div className="text-3xl font-bold font-mono text-zinc-100 mt-1">
                {data.overallStats.percentage}%
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {data.overallStats.attended} / {data.overallStats.total} Classes Attended
              </p>
            </div>
          </Card>

          {/* Subject Attendance Breakdown Cards */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Subject Attendance Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.subjectStats.map((sub: any) => (
                <Card key={sub.subject} className="flex flex-col justify-between bg-[#11141a]">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 truncate">{sub.subject}</h4>
                    <div className="text-[11px] text-zinc-500 font-mono mt-1">
                      {sub.attended_classes} of {sub.total_classes} lectures attended
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#21262d] flex items-center justify-between">
                    <span className="text-lg font-bold font-mono text-zinc-100">
                      {sub.percentage}%
                    </span>
                    <StatusBadge
                      status={sub.percentage >= 75 ? 'qualified' : 'defalcated'}
                      size="sm"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Individual Lecture Sessions Log Table */}
          <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Session Attendance Log
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Total Records: {data.records.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#161b22]/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
                  <tr>
                    <th className="px-5 py-3">Subject & Session</th>
                    <th className="px-5 py-3">Lecture Date</th>
                    <th className="px-5 py-3">Session State</th>
                    <th className="px-5 py-3">Recorded Status</th>
                    <th className="px-5 py-3">Audit Flags</th>
                    <th className="px-5 py-3 text-right">Dean Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {data.records.map((r: any) => {
                    const isPresent = r.status === 'present' && r.review_status !== 'rejected';
                    const subject = r.attendance_sessions?.timetable_slots?.subject || 'Lecture Session';
                    const date = r.attendance_sessions?.date || '—';

                    return (
                      <tr key={r.id} className="hover:bg-[#161b22]/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-zinc-200">{subject}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            Slot #{r.attendance_sessions?.timetable_slots?.id || '—'}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-zinc-400">{date}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={r.attendance_sessions?.is_open ? 'open' : 'closed'} size="sm" />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={isPresent ? 'present' : 'absent'} size="sm" />
                        </td>
                        <td className="px-5 py-3 font-mono text-[11px] text-zinc-500">
                          {r.flags || 'Standard Record'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(r);
                              setTargetStatus(r.status === 'present' ? 'absent' : 'present');
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            <span>Correct</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Relief Modal with Before/After Diff */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#11141a] border border-[#21262d] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Apply Dean Attendance Correction
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Modifies production database record with audit trail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Before / After Diff Panel */}
            <div className="my-4 p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Student:</span>
                <span className="font-semibold text-zinc-200">
                  {data?.student?.full_name} ({data?.student?.enrollment_no})
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Subject & Session Date:</span>
                <span className="text-zinc-200">
                  {selectedRecord.attendance_sessions?.timetable_slots?.subject} •{' '}
                  <span className="font-mono">{selectedRecord.attendance_sessions?.date}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Previous Status</span>
                  <StatusBadge status={selectedRecord.status} size="sm" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Revised Status</span>
                  <StatusBadge status={targetStatus} size="sm" />
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Select New Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={targetStatus === 'present' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => setTargetStatus('present')}
                    className="w-full"
                  >
                    Grant Present (Relief)
                  </Button>
                  <Button
                    type="button"
                    variant={targetStatus === 'absent' ? 'destructive' : 'secondary'}
                    size="md"
                    onClick={() => setTargetStatus('absent')}
                    className="w-full"
                  >
                    Mark Absent
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Administrative Reason / Justification (Required for Audit)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] rounded-lg text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Medical certificate verified, university sports representation..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecord(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                >
                  {submitting ? 'Updating Database...' : 'Confirm & Commit Correction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IndividualAttendancePage() {
  return (
    <Suspense fallback={<TableSkeleton rows={4} cols={5} />}>
      <IndividualAttendanceContent />
    </Suspense>
  );
}
