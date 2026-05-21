import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Session } from '../types';
import { motion } from 'framer-motion';
import { History, Calendar, Star, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const themeStyles = {
  dark: {
    pageBg: 'bg-[#050816]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(5,8,22,0.98)_0%,rgba(9,14,30,0.96)_45%,rgba(2,4,12,1)_100%)]',
    ambientOne: 'bg-cyan-500/20',
    ambientTwo: 'bg-indigo-600/20',
    ambientThree: 'bg-fuchsia-500/10',
    text: 'text-slate-100',
    title: 'text-slate-50',
    muted: 'text-slate-400',
    button:
      'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 shadow-cyan-500/20',
    emptyTitle: 'text-slate-50',
    emptyText: 'text-slate-400',
    sessionTitle: 'text-slate-50',
    sessionMeta: 'text-slate-400',
    badge: 'bg-white/10 text-slate-200',
    icon: 'text-cyan-400',
    arrow: 'text-cyan-300',
  },
  light: {
    pageBg: 'bg-[#f5f7fb]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,245,249,0.94)_45%,rgba(226,232,240,0.98)_100%)]',
    ambientOne: 'bg-sky-400/20',
    ambientTwo: 'bg-indigo-400/20',
    ambientThree: 'bg-amber-300/25',
    text: 'text-slate-900',
    title: 'text-slate-950',
    muted: 'text-slate-600',
    button:
      'bg-slate-950 text-white hover:bg-slate-800 shadow-slate-300/40',
    emptyTitle: 'text-slate-950',
    emptyText: 'text-slate-600',
    sessionTitle: 'text-slate-950',
    sessionMeta: 'text-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    icon: 'text-sky-600',
    arrow: 'text-sky-600',
  },
} as const;

const difficultyBadgeStyles = {
  dark: {
    easy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    medium: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    hard: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    default: 'border-white/10 bg-white/10 text-slate-200',
  },
  light: {
    easy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    hard: 'border-rose-200 bg-rose-50 text-rose-700',
    default: 'border-slate-200 bg-slate-100 text-slate-700',
  },
} as const;

const getDifficultyBadgeClass = (difficulty: string, isDarkMode: boolean) => {
  const styles = isDarkMode ? difficultyBadgeStyles.dark : difficultyBadgeStyles.light;
  return styles[difficulty as keyof typeof styles] ?? styles.default;
};

const DashboardPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  useEffect(() => {
    api.getSessions().then(data => {
      setSessions(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme.pageBg} ${theme.text}`}>
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className={`absolute -left-24 top-[-7rem] h-96 w-96 rounded-full blur-3xl ${theme.ambientOne}`} />
      <div className={`absolute right-[-8rem] top-28 h-[28rem] w-[28rem] rounded-full blur-3xl ${theme.ambientTwo}`} />
      <div className={`absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${theme.ambientThree}`} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 md:px-12 md:py-12">
        <header className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h1 className={`mb-2 flex items-center gap-3 text-3xl font-bold ${theme.title}`}>
              <History className={`h-8 w-8 ${theme.icon}`} />
              Session History
            </h1>
            <p className={theme.muted}>Review your past interview performances.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className={`rounded-xl px-6 py-2.5 font-medium transition-all duration-300 hover:-translate-y-0.5 ${theme.button}`}
          >
            New Interview
          </button>
        </header>

        {isLoading ? (
          <div className={`py-20 text-center ${theme.muted}`}>Loading history...</div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel rounded-3xl py-20 text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/5 p-4">
              <Star className={`h-8 w-8 ${theme.muted}`} />
            </div>
            <h3 className={`mb-2 text-xl font-medium ${theme.emptyTitle}`}>No Interviews Yet</h3>
            <p className={theme.emptyText}>Start your first AI mock interview to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={session.id}
                className="group glass-panel flex cursor-pointer items-center justify-between rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                onClick={() => {/* In a full app, this would route to a historical detail view */}}
              >
                <div>
                  <h3 className={`mb-1 text-lg font-medium ${theme.sessionTitle}`}>{session.role}</h3>
                  <div className={`flex items-center gap-4 text-sm ${theme.sessionMeta}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${getDifficultyBadgeClass(session.difficulty, isDarkMode)}`}>
                      {session.difficulty}
                    </span>
                  </div>
                </div>
                <div className={`transition-transform duration-300 group-hover:translate-x-1 ${theme.arrow}`}>
                  <ChevronRight className="h-6 w-6" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
