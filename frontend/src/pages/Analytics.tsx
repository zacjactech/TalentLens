import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../hooks/useAdminQueries';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function Analytics() {
    const { theme } = useTheme();
    const { data: analytics, isLoading: loading, error } = useAnalytics();

    // Determine effective theme for charts
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                    <p className="text-slate-600 font-medium">{(error as any)?.message || "No data available"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1200px] mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Platform Analytics</h1>
                    <p className="text-slate-500 mt-1">Detailed reports and engagement metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[28px]">group</span>
                        </div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Candidates</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{analytics.overview.total_candidates}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                            <span className="material-symbols-outlined text-[28px]">work</span>
                        </div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Active Jobs</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{analytics.overview.active_jobs}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined text-[28px]">event_available</span>
                        </div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Interviews Completed</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{analytics.overview.completed_interviews}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-[28px]">psychology</span>
                        </div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Avg Match Score</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{analytics.overview.average_score.toFixed(1)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 w-full text-left">Hiring Velocity</h3>
                    <div className="w-full flex-1">
                        <Bar
                            data={{
                                labels: analytics.hiring_velocity.map((v: any) => v.month),
                                datasets: [{
                                    label: 'Hires',
                                    data: analytics.hiring_velocity.map((v: any) => v.hires),
                                    backgroundColor: '#0ea5e9', // primary
                                    borderRadius: 4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0, color: textColor },
                                        grid: { color: gridColor }
                                    },
                                    x: {
                                        ticks: { color: textColor },
                                        grid: { color: gridColor }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 w-full text-left">Candidate Source Distribution</h3>
                    <div className="w-full flex-1">
                        <Doughnut
                            data={{
                                labels: analytics.source_distribution?.map((v: any) => v.source) || ['LinkedIn', 'Direct', 'Referral'],
                                datasets: [{
                                    data: analytics.source_distribution?.map((v: any) => v.count) || [10, 15, 5],
                                    backgroundColor: [
                                        '#0ea5e9', // primary
                                        '#22c55e', // success
                                        '#8b5cf6', // accent
                                    ],
                                    borderWidth: 0,
                                    hoverOffset: 4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'right', labels: { color: textColor } }
                                },
                                cutout: '70%'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
