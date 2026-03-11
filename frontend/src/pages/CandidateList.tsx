import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates } from '../hooks/useCandidateQueries';
import { useCandidateStats } from '../hooks/useAdminQueries';
import type { Candidate } from '../types';

export function CandidateList() {
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Filter by Role');
  const [statusFilter, setStatusFilter] = useState('Filter by Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    roleFilter !== 'Filter by Role' ? roleFilter : undefined,
    statusFilter !== 'Filter by Status' ? statusFilter : undefined,
    debouncedSearch || undefined
  );

  const { data: stats = { average_score: 0, high_match_count: 0, pending_assessment_count: 0 }, isLoading: statsLoading } = useCandidateStats();

  const loading = candidatesLoading || statsLoading;

  if (loading && candidates.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-b-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Candidate Management</h2>
          <p className="text-slate-500 text-sm">Manage applicants and track AI match scores across all open roles.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New Candidate
        </button>
      </div>

      {/* Management Tools Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search by name, email or keyword..."
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-48">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 dark:text-slate-200"
              >
                <option>Filter by Role</option>
                <option>Backend Engineer</option>
                <option>Frontend Engineer</option>
                <option>Product Manager</option>
                <option>UI/UX Designer</option>
              </select>
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 dark:text-slate-200"
              >
                <option>Filter by Status</option>
                <option>Scored</option>
                <option>Pending</option>
                <option>Interviewed</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Match Score</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {(candidates || []).map((candidate: Candidate) => (
                <tr key={candidate.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img className="w-full h-full object-cover" src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${candidate.first_name}+${candidate.last_name}&background=random`} alt={`${candidate.first_name} ${candidate.last_name}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{candidate.first_name} {candidate.last_name}</p>
                        <p className="text-xs text-slate-500">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{candidate.target_role || "Unspecified"}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{candidate.years_of_experience ?? 0} yrs</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${(candidate.score?.overall_score || 0) >= 80
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}>
                      {candidate.score?.overall_score || 0} / 100
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${candidate.status === 'Interviewed'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : candidate.status === 'On Hold'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link to={`/candidates/${candidate.id}`} className="text-primary font-semibold text-sm hover:underline">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900 dark:text-slate-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{(currentPage - 1) * itemsPerPage + candidates.length}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{candidates.length + stats.pending_assessment_count}</span> tracking</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={candidates.length < itemsPerPage}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <span className="material-symbols-outlined text-[28px]">trending_up</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Match Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.average_score.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">stars</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Match Candidates</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.high_match_count}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Assessment</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.pending_assessment_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
