'use client';

import { useState, useEffect } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Select, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

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
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Cohort Defalcation Register
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Institutional cumulative attendance and official 75% exam qualification tracking.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-[#11141a]">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Evaluated Students
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
            {summaries.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Enrolled cohort members</p>
        </Card>

        <Card className="bg-[#11141a]">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">
            Qualified (≥75%)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {eligibleCount}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Meets university exam threshold</p>
        </Card>

        <Card className="bg-[#11141a]">
          <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider block">
            Defalcated (&lt;75%)
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {defalcatedCount}
          </div>
          <p className="text-[11px] text-rose-500/80 mt-0.5">Subject to detention without relief</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#11141a] border border-[#21262d]">
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            Filter Programme
          </label>
          <Select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="text-xs"
          >
            <option value="">All Academic Programmes</option>
            <option value="M.A. English">M.A. English</option>
            <option value="B.A.">B.A.</option>
            <option value="Ph.D.">Ph.D.</option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            Filter Semester
          </label>
          <Select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              const headers = [
                'Student Name',
                'Enrollment No',
                'Programme',
                'Semester',
                'Attended',
                'Total',
                'Percentage',
              ];
              const rows = summaries.map((s) => [
                `"${s.student_name}"`,
                `"${s.enrollment_no}"`,
                `"${s.programme}"`,
                `"${s.semester}"`,
                s.attended_classes,
                s.total_classes,
                `${s.percentage}%`,
              ]);
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute(
                'download',
                `USHSS_Attendance_Register_${new Date().toISOString().slice(0, 10)}.csv`
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="w-4 h-4 mr-1.5 text-zinc-400" />
            <span>Export CSV Register</span>
          </Button>
        </div>
      </div>

      {/* Main Register Table */}
      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Enrollment No</th>
                <th className="px-5 py-3">Cohort</th>
                <th className="px-5 py-3 text-center">Classes Attended</th>
                <th className="px-5 py-3 text-right">Aggregate %</th>
                <th className="px-5 py-3 text-right">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton rows={5} cols={7} />
                  </td>
                </tr>
              ) : summaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-500">
                    No student attendance records found.
                  </td>
                </tr>
              ) : (
                summaries.map((s) => (
                  <tr key={s.student_id} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-200">{s.student_name}</td>
                    <td className="px-5 py-3 font-mono text-zinc-400">{s.enrollment_no}</td>
                    <td className="px-5 py-3 text-zinc-400">
                      {s.programme} (Sem {s.semester})
                    </td>
                    <td className="px-5 py-3 text-center font-mono">
                      <span className="text-emerald-400 font-medium">{s.attended_classes}</span> / {s.total_classes}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-zinc-100">
                      {s.percentage}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge
                        status={s.percentage >= 75 ? 'qualified' : 'defalcated'}
                        size="sm"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/individual-attendance?studentId=${s.student_id}`}>
                        <Button variant="secondary" size="sm">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
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
