import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSettings = location.pathname === '/settings';
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {isSettings ? (
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        ) : (
          <div className="relative w-full max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-accent/50 focus:outline-none placeholder:text-slate-500 dark:text-slate-100 transition-colors"
              placeholder="Search candidates, roles or skills..."
              type="text"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                <button className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                  <p className="text-sm text-slate-800 dark:text-slate-200"><span className="font-bold">System</span> automatically scored 3 new candidates.</p>
                  <p className="text-xs text-slate-500 mt-1">10 minutes ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                  <p className="text-sm text-slate-800 dark:text-slate-200"><span className="font-bold">Alice Worker</span> completed their AI interview.</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                  <p className="text-sm text-slate-800 dark:text-slate-200">New job posting <span className="font-bold">Senior Designer</span> published.</p>
                  <p className="text-xs text-slate-500 mt-1">yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
}

