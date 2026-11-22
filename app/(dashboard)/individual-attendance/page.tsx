'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

function IndividualAttendanceContent() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [studentIdInput, setStudentIdInput] = useState(initialStudentId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal / Relief Action state
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

      // Refresh data
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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Individual Attendance Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect student records across all subjects, verify lecture logs, and apply authorized administrative reliefs.
        </p>
      </div>

      {/* Student Lookup Input */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStudentAttendance(studentIdInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="Enter Student ID (e.g., 1, 2) or use Student Directory..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !studentIdInput}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Load Records'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Student Profile Header & Overall Stats */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">
                Student Profile
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{data.student.full_name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                <span>Enrollment: <strong className="text-slate-200">{data.student.enrollment_no || 'N/A'}</strong></span>
                <span>•</span>
                <span>Programme: <strong className="text-slate-200">{data.student.programme || 'N/A'}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-slate-200">{data.student.batch || '—'}</strong></span>
                <span>•</span>
                <span>Sem: <strong className="text-slate-200">{data.student.semester || '—'}</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Overall Aggregate
              </span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {data.overallStats.percentage}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {data.overallStats.attended} Attended / {data.overallStats.total} Total Classes
              </p>
            </div>
          </div>

          {/* Subject-Wise Breakdown Cards */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Subject Attendance Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.subjectStats.map((sub: any) => (
                <div
                  key={sub.subject}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate">{sub.subject}</h4>
                    <div className="text-xs text-slate-400 mt-1">
                      {sub.attended_classes} of {sub.total_classes} lectures attended
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-lg font-bold ${
                        sub.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        sub.percentage >= 75
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {sub.percentage >= 75 ? 'Eligible' : 'Deficit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Lecture Sessions Log Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Class Sessions Log & Administrative Corrections
              </h3>
              <span className="text-xs text-slate-400">Total Records: {data.records.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Date & Subject</th>
                    <th className="px-6 py-3.5">Session Status</th>
                    <th className="px-6 py-3.5">Recorded Attendance</th>
                    <th className="px-6 py-3.5">Audit & Flags</th>
                    <th className="px-6 py-3.5 text-right">Dean Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {data.records.map((r: any) => {
                    const isPresent = r.status === 'present' && r.review_status !== 'rejected';
                    const subject = r.attendance_sessions?.timetable_slots?.subject || 'Lecture';
                    const date = r.attendance_sessions?.date || '—';

                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{subject}</div>
                          <div className="text-xs text-slate-500">Date: {date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              r.attendance_sessions?.is_open
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {r.attendance_sessions?.is_open ? 'Open Session' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                              isPresent
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            }`}
                          >
                            {isPresent ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                            )}
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-400">
                            {r.flags || 'Standard Record'}
                          </div>
                          {r.review_status && r.review_status !== 'approved' && (
                            <span className="text-[10px] text-amber-400">
                              Review: {r.review_status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedRecord(r);
                              setTargetStatus(r.status === 'present' ? 'absent' : 'present');
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-800/60 text-xs font-medium transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Correct Record</span>
                          </button>
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

      {/* Dean Override Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dean Attendance Correction</h3>
                <p className="text-xs text-slate-400">Authorized administrative relief modification</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5 text-xs text-slate-300 space-y-1.5">
              <p>
                Student: <strong className="text-white">{data?.student?.full_name}</strong> ({data?.student?.enrollment_no})
              </p>
              <p>
                Subject: <strong className="text-white">{selectedRecord.attendance_sessions?.timetable_slots?.subject}</strong>
              </p>
              <p>
                Session Date: <strong className="text-white">{selectedRecord.attendance_sessions?.date}</strong>
              </p>
              <p>
                Current Status: <strong className="text-white uppercase">{selectedRecord.status}</strong>
              </p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('present')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                      targetStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Grant Present (Relief)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('absent')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                      targetStatus === 'absent'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/25'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Set Absent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Administrative Reason / Justification
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for granting relief (e.g. Medical certificate verified, sports event representation)..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {submitting ? 'Updating Database...' : 'Apply & Recalculate'}
                </button>
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
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading Attendance Interface...</div>}>
      <IndividualAttendanceContent />
    </Suspense>
  );
}
