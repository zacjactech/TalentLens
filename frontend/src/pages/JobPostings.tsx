import { useState } from 'react';
import { useJobs, useCreateJob, useUpdateJob } from '../hooks/useJobQueries';
import type { Job } from '../types';

export function JobPostings() {
    const { data: jobs = [], isLoading: loading, error } = useJobs();
    const createJob = useCreateJob();
    const updateJob = useUpdateJob();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        department: string;
        location: string;
        type: string;
        status: 'Active' | 'Draft' | 'Closed';
        description: string;
        requirements: string;
    }>({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        status: 'Active' as const,
        description: '',
        requirements: ''
    });

    const openCreateModal = () => {
        setEditingJob(null);
        setFormData({ title: '', department: '', location: '', type: 'Full-time', status: 'Active', description: '', requirements: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (job: Job) => {
        setEditingJob(job);
        setFormData({
            title: job.title || '',
            department: job.department || '',
            location: job.location || '',
            type: job.type || 'Full-time',
            status: job.status || 'Active',
            description: job.description || '',
            requirements: job.requirements || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingJob) {
                await updateJob.mutateAsync({ id: editingJob.id, data: formData });
            } else {
                await createJob.mutateAsync(formData);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save job:", err);
            alert("Failed to save job. See console for details.");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-b-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                    <p className="text-slate-600 font-medium">{(error as Error).message || "Failed to load jobs"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Job Postings</h1>
                    <p className="text-slate-500 mt-1">Manage open roles and publish job requirements.</p>
                </div>
                <button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                    Create Job Posting
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">
                                        No job postings found. Create your first job posting.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job: Job) => (
                                    <tr key={job.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{job.title}</p>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{job.department || "Unspecified"}</td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{job.location || "Remote"}</td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{job.type}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${job.status === 'Active'
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button onClick={() => openEditModal(job)} className="text-primary font-semibold text-sm hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{editingJob ? 'Edit Job Posting' : 'Create Job Posting'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Job Title*</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Senior Frontend Engineer" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Engineering" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" placeholder="e.g. Remote, San Francisco" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-200">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Draft' | 'Closed' })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-200">
                                        <option>Active</option>
                                        <option>Draft</option>
                                        <option>Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" placeholder="Role overview..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Requirements</label>
                                <textarea rows={3} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" placeholder="Required skills..." />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                            <button onClick={handleSave} disabled={!formData.title} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                Save Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
