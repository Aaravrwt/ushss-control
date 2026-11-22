'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, ChevronRight, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentsSearchPage() {
  const [query, setQuery] = useState('');
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (programme) params.set('programme', programme);
      if (semester) params.set('semester', semester);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [programme, semester]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Student Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search students across programmes to inspect attendance profiles and manage relief overrides.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student by name, enrollment no, or username..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programmes</option>
            <option value="M.A. English">M.A. English</option>
            <option value="B.A.">B.A.</option>
            <option value="Ph.D.">Ph.D.</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
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
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Student List Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrollment No</th>
                <th className="px-6 py-4">Programme & Cohort</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Loading student records from Supabase...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{std.full_name}</div>
                      <div className="text-xs text-slate-500">{std.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {std.enrollment_no || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300 font-medium">{std.programme || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">
                        Batch {std.batch || '—'} • Sem {std.semester || '—'} {std.section ? `• Sec ${std.section}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          std.is_active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {std.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/individual-attendance?studentId=${std.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-950/60 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-800/60 text-xs font-medium transition-all"
                      >
                        <span>Manage Attendance</span>
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
