'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Select, TableSkeleton, StatusBadge } from '@/components/ui/design-system';

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
      {/* Page Header */}
      <div className="pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Student Directory</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Search student profiles by enrollment number or name across academic programmes.
        </p>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#11141a] border border-[#21262d]"
      >
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student by name, enrollment no, or username..."
            className="pl-9 text-xs"
          />
        </div>

        <div>
          <Select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="text-xs"
          >
            <option value="">All Programmes</option>
            <option value="M.A. English">M.A. English</option>
            <option value="B.A.">B.A.</option>
            <option value="Ph.D.">Ph.D.</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
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
          <Button type="submit" size="sm" className="whitespace-nowrap">
            Search
          </Button>
        </div>
      </form>

      {/* Student List Table */}
      <div className="rounded-xl bg-[#11141a] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161b22] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#21262d]">
              <tr>
                <th className="px-5 py-3">Student Name & Email</th>
                <th className="px-5 py-3">Enrollment No</th>
                <th className="px-5 py-3">Programme & Cohort</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton rows={4} cols={5} />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">
                    No students found matching your search criteria.
                  </td>
                </tr>
              ) : (
                students.map((std) => (
                  <tr key={std.id} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-zinc-200">{std.full_name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{std.email}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-zinc-300">
                      {std.enrollment_no || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-zinc-200">{std.programme || 'N/A'}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Batch {std.batch || '—'} • Sem {std.semester || '—'} {std.section ? `• Sec ${std.section}` : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={std.is_active ? 'approved' : 'rejected'} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/individual-attendance?studentId=${std.id}`}>
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
