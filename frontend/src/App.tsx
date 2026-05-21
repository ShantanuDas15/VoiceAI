import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import DashboardPage from './pages/DashboardPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppStore } from './store/useAppStore';
import ThemeToggle from './components/layout/ThemeToggle';

const GlobalNav = () => {
  const location = useLocation();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  
  if (location.pathname === '/' || location.pathname === '/interview') {
    return null; // Home and Interview pages have their own custom navigation
  }

  return (
    <nav className="absolute top-0 z-50 flex w-full items-center justify-between p-6 pointer-events-none">
      <div className={`select-none flex items-center gap-2 text-xl font-bold tracking-tight ${isDarkMode ? 'text-white/80' : 'text-slate-800'}`}>
        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 shadow-lg shadow-cyan-500/20" />
        AI Coach
      </div>
      <div className="pointer-events-auto flex items-center gap-3">
        <ThemeToggle />
        <Link
          to="/"
          className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`}
        >
          Home
        </Link>
        {location.pathname !== '/dashboard' && (
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDarkMode ? 'dark' : 'light';
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <GlobalNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
