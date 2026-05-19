import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import ThemeToggle from '../components/layout/ThemeToggle';
import { motion } from 'framer-motion';
import { 
  Mic, 
  CheckCircle2, 
  MessageSquare, 
  Code2, 
  Briefcase, 
  BarChart, 
  Star, 
  Zap, 
  Brain, 
  Sparkles,
  Target,
  History
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7 },
  },
};

const featureItems = [
  {
    icon: Mic,
    iconClassName: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    label: 'Real-time speech-to-text transcription',
  },
  {
    icon: CheckCircle2,
    iconClassName: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    label: 'Instant scoring based on industry rubrics',
  },
  {
    icon: MessageSquare,
    iconClassName: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
    label: 'Ideal answer suggestions for comparison',
  },
];

const popularRoles = [
  { value: 'Frontend Engineer', label: 'Frontend Eng.', icon: Code2 },
  { value: 'Product Manager', label: 'Product Manager', icon: Briefcase },
  { value: 'Data Scientist', label: 'Data Scientist', icon: BarChart },
];

const difficultyOptions = [
  {
    value: 'easy',
    title: 'Beginner',
    subtitle: 'Core concepts',
    icon: Star,
    accentClassName: 'border-amber-400/50 bg-amber-400/10 text-amber-100 shadow-amber-500/10',
    iconClassName: 'text-amber-200',
  },
  {
    value: 'medium',
    title: 'Intermediate',
    subtitle: 'Complex problems',
    icon: Zap,
    accentClassName: 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100 shadow-cyan-500/10',
    iconClassName: 'text-cyan-200',
  },
  {
    value: 'hard',
    title: 'Advanced',
    subtitle: 'System design',
    icon: Brain,
    accentClassName: 'border-indigo-400/50 bg-indigo-400/10 text-indigo-100 shadow-indigo-500/10',
    iconClassName: 'text-indigo-200',
  },
];

const themeStyles = {
  dark: {
    pageBg: 'bg-[#050816]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(5,8,22,0.98)_0%,rgba(9,14,30,0.96)_45%,rgba(2,4,12,1)_100%)]',
    ambientOne: 'bg-cyan-500/20',
    ambientTwo: 'bg-indigo-600/20',
    ambientThree: 'bg-fuchsia-500/10',
    text: 'text-slate-100',
    mutedText: 'text-slate-300',
    titleText: 'text-slate-50',
    panel: 'border-white/10 bg-white/5 shadow-black/40',
    badge: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    badgeIcon: 'text-cyan-200',
    card: 'border-white/10 bg-white/5 text-slate-200',
    cardBorderHover: 'hover:border-white/20',
    input:
      'border-white/10 bg-slate-950/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-cyan-400/20',
    chip:
      'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100',
    toggle: 'border-white/10 bg-white/5 text-slate-100 hover:border-cyan-400/30 hover:bg-cyan-400/10',
    toggleTrack: 'border-cyan-400/30 bg-cyan-400/10',
    toggleThumb: 'bg-cyan-300',
    toggleIcon: 'text-cyan-100',
    difficultySelected:
      'border-cyan-400/50 bg-cyan-400/10 text-cyan-100 shadow-cyan-500/10',
    difficultySelectedText: 'text-white/70',
    difficultyUnselected:
      'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
    difficultyUnselectedText: 'text-slate-500',
    button: 'from-cyan-500 via-sky-500 to-indigo-500 shadow-[0_18px_50px_-18px_rgba(56,189,248,0.9)] hover:shadow-[0_24px_60px_-18px_rgba(99,102,241,0.95)]',
    error: 'border-rose-500/20 bg-rose-500/10 text-rose-100',
    featureBorder: 'border-white/10',
    featureHover: 'hover:border-white/20',
  },
  light: {
    pageBg: 'bg-[#f5f7fb]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,245,249,0.94)_45%,rgba(226,232,240,0.98)_100%)]',
    ambientOne: 'bg-sky-400/20',
    ambientTwo: 'bg-indigo-400/20',
    ambientThree: 'bg-amber-300/25',
    text: 'text-slate-900',
    mutedText: 'text-slate-600',
    titleText: 'text-slate-950',
    panel: 'border-slate-200/80 bg-white/80 shadow-slate-300/50',
    badge: 'border-sky-200 bg-sky-100 text-sky-700',
    badgeIcon: 'text-sky-600',
    card: 'border-slate-200 bg-white/80 text-slate-700',
    cardBorderHover: 'hover:border-sky-200',
    input:
      'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500/50 focus:ring-sky-500/20',
    chip:
      'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700',
    toggle: 'border-slate-200 bg-white/80 text-slate-700 hover:border-sky-300 hover:bg-sky-50',
    toggleTrack: 'border-sky-300 bg-sky-100',
    toggleThumb: 'bg-white',
    toggleIcon: 'text-sky-700',
    difficultySelected:
      'border-sky-400/70 bg-sky-50 text-sky-900 shadow-sky-200/40',
    difficultySelectedText: 'text-sky-600',
    difficultyUnselected:
      'border-slate-200 bg-white/80 text-slate-700 hover:border-sky-200 hover:bg-sky-50',
    difficultyUnselectedText: 'text-slate-500',
    button: 'from-sky-500 via-cyan-500 to-indigo-500 shadow-[0_18px_50px_-18px_rgba(56,189,248,0.5)] hover:shadow-[0_24px_60px_-18px_rgba(99,102,241,0.55)]',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    featureBorder: 'border-slate-200',
    featureHover: 'hover:border-sky-200',
  },
} as const;

const HomePage = () => {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const navigate = useNavigate();
  const { startInterview, isLoading, error, isDarkMode } = useAppStore();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    await startInterview(role, difficulty);
    navigate('/interview');
  };

  const setPopularRole = (r: string) => {
    setRole(r);
  };

  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme.pageBg} ${theme.text}`}>
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className={`absolute -left-24 top-[-7rem] h-96 w-96 rounded-full blur-3xl ${theme.ambientOne}`} />
      <div className={`absolute right-[-8rem] top-28 h-[28rem] w-[28rem] rounded-full blur-3xl ${theme.ambientTwo}`} />
      <div className={`absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${theme.ambientThree}`} />
      <div
        className={`absolute inset-0 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8"
        >
          <div className={`flex items-center gap-3 text-sm font-semibold tracking-tight ${theme.titleText}`}>
            <div className="rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 p-2 shadow-lg shadow-cyan-500/20">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg">Voice AI</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-300 ${theme.toggle}`}
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </motion.header>

        <motion.main
          variants={pageVariants}
          initial="hidden"
          animate="show"
          className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-14 pt-8 md:grid-cols-2 md:px-8 lg:gap-16"
        >
          <motion.section variants={fadeUp} className="space-y-8">
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${theme.badge}`}
            >
              <Sparkles className={`h-4 w-4 ${theme.badgeIcon}`} />
              Gemini 2.0 Powered
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className={`max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl ${theme.titleText}`}
            >
              Master your next interview with{' '}
              <span className={`bg-gradient-to-r ${isDarkMode ? 'from-cyan-300 via-sky-200 to-indigo-300' : 'from-sky-600 via-cyan-600 to-indigo-600'} bg-clip-text text-transparent`}>
                Voice AI.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className={`max-w-lg text-lg leading-8 ${theme.mutedText}`}
            >
              Practice speaking naturally. Our AI coach listens to your audio, evaluates your answers, and gives you actionable feedback to land your dream job.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-4 pt-2">
              {featureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 ${theme.card} ${theme.cardBorderHover}`}
                  >
                    <div className={`rounded-xl border p-2.5 ${item.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium sm:text-base">{item.label}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.section>

          <motion.div
            variants={cardVariants}
            className={`rounded-[2rem] border p-6 shadow-2xl backdrop-blur-2xl sm:p-8 ${theme.panel}`}
          >
            <form onSubmit={handleStart} className="space-y-8">
              <div>
                <label className={`mb-3 block text-sm font-semibold ${theme.titleText}`}>
                  What role are you interviewing for?
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className={`w-full rounded-2xl border px-4 py-3 shadow-inner shadow-black/20 outline-none transition-all duration-300 focus:ring-2 ${theme.input}`}
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`mr-1 text-xs font-medium uppercase tracking-[0.18em] ${theme.mutedText}`}>
                    Popular:
                  </span>
                  {popularRoles.map((popularRole) => {
                    const Icon = popularRole.icon;
                    return (
                      <button
                        key={popularRole.value}
                        type="button"
                        onClick={() => setPopularRole(popularRole.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 ${theme.chip}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {popularRole.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={`mb-3 block text-sm font-semibold ${theme.titleText}`}>
                  Select Difficulty
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {difficultyOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = difficulty === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDifficulty(option.value)}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-0.5 ${
                          isSelected
                            ? `${theme.difficultySelected} shadow-lg`
                            : theme.difficultyUnselected
                        }`}
                      >
                        <Icon
                          className={`mb-2 h-5 w-5 ${isSelected ? option.iconClassName : theme.difficultyUnselectedText}`}
                        />
                        <span className="text-sm font-semibold">{option.title}</span>
                        <span className={`mt-0.5 text-[10px] ${isSelected ? theme.difficultySelectedText : theme.difficultyUnselectedText}`}>
                          {option.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${theme.error}`}>
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading || !role}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r py-4 font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${theme.button}`}
              >
                {isLoading ? (
                  <span className="animate-pulse">Preparing Session...</span>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Mock Interview
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default HomePage;
