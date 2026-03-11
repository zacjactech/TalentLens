import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/CandidateList';
import { CandidateProfile } from './pages/CandidateProfile';
import { JobPostings } from './pages/JobPostings';
import { Analytics } from './pages/Analytics';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InterviewChat } from './pages/InterviewChat';
import { Settings } from './pages/Settings';

function AppLayout() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/interview/:id" element={<InterviewChat />} />
          <Route path="/jobs" element={<JobPostings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Public auth routes — no sidebar/header */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected routes — require authentication */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
