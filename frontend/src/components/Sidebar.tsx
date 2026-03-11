import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'Candidates', icon: 'group', path: '/candidates' },
    { name: 'Job Postings', icon: 'work', path: '/jobs' },
    { name: 'Analytics', icon: 'analytics', path: '/analytics' }
  ];

  return (
    <>
      <aside className="w-64 bg-primary flex flex-col shrink-0 border-r border-primary/10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">lens</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-none">TalentLens</h1>
            <p className="text-slate-400 text-xs mt-1">Recruiter Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-4 mt-4 flex flex-col gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-white/10">
          <Link
            to="/settings"
            className={`w-full h-10 flex items-center gap-3 px-3 rounded-lg transition-colors ${location.pathname === '/settings'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </Link>
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {user?.email ? (
                <span className="text-white font-bold text-sm uppercase">
                  {user.email.charAt(0)}
                </span>
              ) : (
                <img
                  alt="Recruiter Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgMRoztlfOfz-sDNSasmddrEI_bbKK04KtJOan1Pg2PPOeJVd3HpH1EWHwnpj5y4cBDiC55eK9TW0iUsgTKxjBEWA27NEk8vqbXwA5dp2Dabu8WYEUfirdaz1Y7uT4KzfPHPhAl-gYwJ57hTuLEC-oVggefzIvQNiHjjE2sc6aw-txER_pBGxWfju77nffaGK-WPTLsK6WDV5kAYgYTKmT53sdiHR9NtLJAL6S3P4JCOtd_vJaYub3LflUqLWqYnlAEFQC0I2nVkc"
                />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.email || "Robert Fox"}</p>
              <p className="text-[10px] text-slate-400 truncate">Senior Recruiter</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
