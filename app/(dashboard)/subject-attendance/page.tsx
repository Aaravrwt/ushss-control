'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, CheckCircle2, AlertTriangle, ArrowUpDown } from 'lucide-react';

export default function SubjectAttendancePage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch subjects catalogue
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

  // Fetch subject matrix
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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Subject Attendance Matrix</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review cohort attendance distribution by course subject, inspect sessions conducted, and monitor compliance.
        </p>
      </div>

      {/* Subject Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Course Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
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
      </div>

      {/* Subject Overview KPI Banner */}
      {data && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">
              Subject Overview
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{data.subject}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Total Lectures Held: <strong className="text-white">{data.totalSessions}</strong> • Enrolled Students Recorded: <strong className="text-white">{data.students?.length || 0}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Cohort Subject Roster Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrollment No</th>
                <th className="px-6 py-4 text-center">Classes Attended</th>
                <th className="px-6 py-4 text-center">Classes Missed</th>
                <th className="px-6 py-4 text-right">Attendance %</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Loading subject records...
                  </td>
                </tr>
              ) : !data || data.students?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No attendance records found for this subject.
                  </td>
                </tr>
              ) : (
                data.students.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {s.student_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {s.enrollment_no}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-emerald-400">
                      {s.attended} / {s.total}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-rose-400">
                      {s.missed}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-white">
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
