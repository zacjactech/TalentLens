import { Link } from 'react-router-dom';
import { useAdminStats, useTopCandidates, useUpcomingInterviews, useRecentActivity } from '../hooks/useAdminQueries';
import type { Candidate, Interview, Activity } from '../types';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: topCandidates, isLoading: candidatesLoading } = useTopCandidates(5);
  const { data: upcomingInterviews, isLoading: upcomingLoading } = useUpcomingInterviews();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  const loading = statsLoading || candidatesLoading || upcomingLoading || activityLoading;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Candidates</span>
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.total_candidates || 0}</h3>
            <span className="text-success text-xs font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 0%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Average Score</span>
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.average_score?.toFixed(1) || 0}%</h3>
            <span className="text-slate-400 text-xs font-medium">Platform quality</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Completed Interviews</span>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.completed_interviews || 0}</h3>
            <span className="text-amber-500 text-xs font-semibold">Live sessions</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Candidates Leaderboard</h2>
            <p className="text-sm text-slate-500">Candidates filtered by AI Gemini match score.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = ['Name', 'Email', 'Role', 'Status', 'Score'];
                const rows = (topCandidates || []).map((c: Candidate) => [
                  `"${c.name}"`,
                  `"${c.email}"`,
                  `"${c.role}"`,
                  `"${c.status || 'Pending'}"`,
                  c.score?.overall_score || 0
                ].join(','));
                const csvContent = [headers.join(','), ...rows].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.setAttribute('download', 'top_candidates_report.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Export CSV
            </button>
            <Link to="/candidates" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Gemini Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {(topCandidates || []).map((candidate: Candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img alt="Candidate" className="size-10 rounded-full border border-slate-200 dark:border-slate-700" src={candidate.avatarUrl} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{candidate.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-sm font-bold">
                      {candidate.score?.overall_score || 0}/100
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/candidates/${candidate.id}`} className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent/90 shadow-sm shadow-accent/20">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Upcoming Interviews</h4>
          <div className="space-y-4">
            {(upcomingInterviews || []).map((interview: Interview) => (
              <div key={interview.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 rounded bg-white dark:bg-slate-700 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold text-accent uppercase">{interview.month}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{interview.date}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{interview.title}</p>
                  <p className="text-xs text-slate-500">{interview.subtitle}</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">more_vert</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h4>
          <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {(recentActivity || []).map((activity: Activity) => (
              <div key={activity.id} className="relative flex gap-4 pl-8">
                <div className={`absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 ${activity.type === 'success' ? 'bg-success' : activity.type === 'mail' ? 'bg-accent' : 'bg-slate-400'
                  }`}>
                  <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-900 dark:text-slate-100"><span className="font-semibold">{activity.title}</span> {activity.details}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
