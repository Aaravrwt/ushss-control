'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Card, Button, Select, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

export default function SubjectAttendancePage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/attendance/subject');
        const json = await res.json();
        if (json.subjects) {
          setSubjects(json.subjects);
          if (json.subjects.length > 0) {
            setSelectedSubject(json.subjects[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSubjects();
  }, []);

  const fetchSubjectData = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('subject', selectedSubject);
      if (semester) params.set('semester', semester);

      const res = await fetch(`/api/attendance/subject?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectData();
    }
  }, [selectedSubject, semester]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Subject Attendance Matrix
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cohort-wide attendance distribution by course subject and session completion logs.
        </p>
      </div>

      {/* Subject Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#11141a] border border-[#21262d]">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            Select Course Subject
          </label>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
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
      </div>

      {/* Subject Overview KPI Banner */}
      {data && (
        <Card className="bg-[#11141a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-0.5">
              Subject Cohort Overview
            </span>
            <h2 className="text-base font-semibold text-zinc-100">{data.subject}</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Lectures Conducted: <span className="font-mono text-zinc-200">{data.totalSessions}</span> • Enrolled Students Recorded: <span className="font-mono text-zinc-200">{data.students?.length || 0}</span>
            </p>
          </div>
        </Card>
      )}

      {/* Cohort Subject Roster Table */}
      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Enrollment No</th>
                <th className="px-5 py-3 text-center">Classes Attended</th>
                <th className="px-5 py-3 text-center">Classes Missed</th>
                <th className="px-5 py-3 text-right">Attendance %</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <TableSkeleton rows={5} cols={6} />
                  </td>
                </tr>
              ) : !data || data.students?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500">
                    No attendance records found for this subject.
                  </td>
                </tr>
              ) : (
                data.students.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-200">{s.student_name}</td>
                    <td className="px-5 py-3 font-mono text-zinc-400">{s.enrollment_no}</td>
                    <td className="px-5 py-3 text-center font-mono font-medium text-emerald-400">
                      {s.attended} / {s.total}
                    </td>
                    <td className="px-5 py-3 text-center font-mono font-medium text-rose-400">
                      {s.missed}
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
