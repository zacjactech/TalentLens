import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCandidate, useCandidateTranscript, useUpdateCandidateScore } from '../hooks/useCandidateQueries';
import type { InterviewMessage } from '../types';

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: candidate, isLoading: candidateLoading, isFetching: candidateFetching } = useCandidate(id || '');
  const { data: transcript = [], isLoading: transcriptLoading, isFetching: transcriptFetching } = useCandidateTranscript(id ? parseInt(id) : 0);
  const updateScore = useUpdateCandidateScore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    experience_score: 0,
    stability_score: 0,
    communication_score: 0,
    typing_score: 0,
    role_specific_score: 0,
    overall_score: 0
  });

  const loading = candidateLoading || transcriptLoading;
  const isSyncing = candidateFetching || transcriptFetching;

  if (loading && !candidate) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return <div className="p-8 text-center text-slate-500">Candidate not found</div>;
  }

  return (
    <div>
      {/* Profile Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img className="size-16 rounded-full object-cover ring-4 ring-primary/10" src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${candidate.first_name}+${candidate.last_name}&background=random`} alt={`${candidate.first_name} ${candidate.last_name}`} />
              <div className="absolute -bottom-1 -right-1 bg-success size-4 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{candidate.first_name} {candidate.last_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{candidate.status}</span>
              </div>
              <p className="text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">terminal</span> {candidate.target_role}
                <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
                <span className="material-symbols-outlined text-sm">location_on</span> Remote
              </p>
            </div>
            <div className="ml-8 px-6 py-2 bg-success/5 rounded-xl border border-success/20">
              <p className="text-[10px] uppercase tracking-wider font-bold text-success">AI Match Score</p>
              <p className="text-2xl font-black text-success">{candidate.score?.overall_score || 0}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSyncing && !loading && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 px-2 py-1 rounded-full animate-pulse">
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                Syncing
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (candidate.resume_url) {
                    window.open(candidate.resume_url, '_blank');
                  } else {
                    alert("Resume not available for this candidate.");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <span className="material-symbols-outlined text-lg">download</span> Resume
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all print:hidden"
              >
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Download PDF Report
              </button>
              <button
                onClick={() => {
                  const meetUrl = import.meta.env.VITE_MEETING_BASE_URL || 'https://meet.google.com/new';
                  window.open(meetUrl, '_blank');
                }}
                className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 print:hidden"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span> Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Evaluation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: AI Score Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span> AI Score Breakdown
              </h3>
              <div className="flex items-center gap-2 print:hidden">
                <button 
                  onClick={() => {
                    setEditFormData({
                      experience_score: candidate.score?.experience_fit || 0,
                      stability_score: candidate.score?.career_stability || 0,
                      communication_score: candidate.score?.communication_quality || 0,
                      typing_score: candidate.score?.typing_test || 0,
                      role_specific_score: candidate.score?.role_specific || 0,
                      overall_score: candidate.score?.overall_score || 0
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Manual Override
                </button>
                <span className="text-xs text-slate-400 font-medium">Last updated: {new Date(candidate.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Experience Fit', value: candidate.score?.experience_fit, max: 30 },
                { label: 'Career Stability', value: candidate.score?.career_stability, max: 20 },
                { label: 'Communication Quality', value: candidate.score?.communication_quality, max: 20 },
                { label: 'Typing & Role Specific', value: (candidate.score?.typing_test || 0) + (candidate.score?.role_specific || 0), max: 30 },
              ].map((item: { label: string, value: number | undefined, max: number }) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-success">{Math.round((item.value || 0) / item.max * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-success h-2.5 rounded-full" style={{ width: `${Math.round((item.value || 0) / item.max * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Resume Summary & Key Strengths */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_toy</span> Gemini AI Resume Summary
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {candidate.profile?.summary || "No AI summary available for this candidate yet."}
              </p>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Key Strengths</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {candidate.profile?.skills_analysis || "Skill analysis in progress..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Interview Transcript */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">chat</span> Chatbot Interview Transcript
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Duration: {candidate.sessions?.find(s => s.status === 'completed')?.duration_minutes ? `${candidate.sessions.find(s => s.status === 'completed')?.duration_minutes}m` : 'N/A'}
              </span>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
              <span className="text-xs font-medium text-slate-500">Completed: {new Date(candidate.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
                <p>No interview messages recorded yet.</p>
              </div>
            ) : (
              (transcript || []).map((msg: InterviewMessage, idx: number) => (
                <div key={idx} className="space-y-6">
                  {/* Message AI (Question) */}
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">TalentLens Assistant</p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{msg.question_text || `Question about ${msg.question_category}`}</p>
                      </div>
                    </div>
                  </div>

                  {/* Message Candidate (Answer) */}
                  <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="size-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">person</span>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{candidate.first_name}</p>
                      <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none text-left">
                        <p className="text-sm">{msg.answer_text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <button
              onClick={() => {
                const title = `Interview Transcript: ${candidate.first_name} ${candidate.last_name}\n\n`;
                const text = (transcript || []).map((m: InterviewMessage) => `TalentLens Assistant:\n${m.question_text || `Question about ${m.question_category}`}\n\n${candidate.first_name}:\n${m.answer_text}\n\n`).join('\n');
                const blob = new Blob([title + text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${candidate.first_name}_${candidate.last_name}_transcript.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Download Full Transcript <span className="material-symbols-outlined text-lg">description</span>
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Manual Score Override</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Experience Fit (0-30)', key: 'experience_score' },
                { label: 'Career Stability (0-20)', key: 'stability_score' },
                { label: 'Communication Quality (0-20)', key: 'communication_score' },
                { label: 'Typing Test (0-15)', key: 'typing_score' },
                { label: 'Role Specific (0-15)', key: 'role_specific_score' },
                { label: 'Overall Score (0-100)', key: 'overall_score' },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</label>
                  <input 
                    type="number" 
                    value={editFormData[item.key as keyof typeof editFormData]} 
                    onChange={e => setEditFormData({ ...editFormData, [item.key]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" 
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold">Cancel</button>
              <button 
                onClick={async () => {
                  if (id) {
                    await updateScore.mutateAsync({ id: parseInt(id), scoreData: editFormData });
                    setIsEditModalOpen(false);
                  }
                }} 
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
              >
                {updateScore.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, .print\\:hidden, .material-symbols-outlined:not(.text-primary) {
            display: none !important;
          }
          .p-8 {
            padding: 1rem !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
          }
          .grid {
            display: block !important;
          }
          .bg-white, .dark\\:bg-slate-900 {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          .shadow-sm, .border {
            box-shadow: none !important;
            border: none !important;
          }
          .h-\\[500px\\] {
            height: auto !important;
            overflow: visible !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
          }
          p, h1, h2, h3, h4, span {
            color: black !important;
          }
          .text-primary, .text-success {
            color: black !important;
            font-weight: bold !important;
          }
          .bg-white {
            page-break-inside: avoid;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
