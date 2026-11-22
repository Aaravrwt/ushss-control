'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OverallAttendancePage() {
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('');
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverallSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (programme) params.set('programme', programme);
      if (semester) params.set('semester', semester);

      const res = await fetch(`/api/attendance/overall?${params.toString()}`);
      const json = await res.json();
      setSummaries(json.summaries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverallSummaries();
  }, [programme, semester]);

  const defalcatedCount = summaries.filter((s) => s.percentage < 75).length;
  const eligibleCount = summaries.filter((s) => s.percentage >= 75).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Overall Attendance & Defalcation Register</h1>
          <p className="text-sm text-slate-400 mt-1">
            Institutional overview of cumulative attendance percentages across all enrolled students and courses.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Evaluated Students
          </span>
          <div className="text-2xl font-bold text-white mt-1">{summaries.length}</div>
          <p className="text-xs text-slate-500 mt-1">Students enrolled in active cohort</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Eligible (&ge; 75%)
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{eligibleCount}</div>
          <p className="text-xs text-emerald-600 mt-1">Meets university exam threshold</p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            Defalcated (&lt; 75%)
          </span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{defalcatedCount}</div>
          <p className="text-xs text-rose-600 mt-1">Candidates requiring Dean review / relief</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Filter Programme
          </label>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Programmes</option>
            <option value="M.A. English">M.A. English</option>
            <option value="B.A.">B.A.</option>
            <option value="Ph.D.">Ph.D.</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Filter Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              const headers = ['Student Name', 'Enrollment No', 'Programme', 'Semester', 'Attended', 'Total', 'Percentage'];
              const rows = summaries.map((s) => [
                `"${s.student_name}"`,
                `"${s.enrollment_no}"`,
                `"${s.programme}"`,
                `"${s.semester}"`,
                s.attended_classes,
                s.total_classes,
                `${s.percentage}%`,
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `USHSS_Attendance_Register_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV Register</span>
          </button>
        </div>
      </div>

      {/* Main Register Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrollment No</th>
                <th className="px-6 py-4">Programme & Sem</th>
                <th className="px-6 py-4 text-center">Classes Attended</th>
                <th className="px-6 py-4 text-right">Aggregate %</th>
                <th className="px-6 py-4 text-right">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Computing cumulative attendance registers...
                  </td>
                </tr>
              ) : summaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                summaries.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {s.student_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {s.enrollment_no}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {s.programme} (Sem {s.semester})
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-200">
                      <span className="text-emerald-400 font-semibold">{s.attended_classes}</span> / {s.total_classes}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-white text-base">
                      {s.percentage}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          s.percentage >= 75
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {s.percentage >= 75 ? 'Qualified' : 'Defalcated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/individual-attendance?studentId=${s.student_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-950/60 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-800/60 text-xs font-medium transition-all"
                      >
                        <span>Relief View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
