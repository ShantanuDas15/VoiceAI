
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Home, Award } from 'lucide-react';

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
    scoreGradient: 'from-cyan-300 to-indigo-300',
    questionAccent: 'text-cyan-300',
    scoreBadge: 'border-white/10 bg-white/5 text-cyan-200',
    transcriptBox: 'bg-black/20',
    label: 'text-slate-500',
    body: 'text-slate-300',
    idealPanel: 'border-indigo-500/20 bg-indigo-500/5',
    idealTitle: 'text-indigo-300',
    strengthTitle: 'text-emerald-400',
    weaknessTitle: 'text-orange-400',
    strengthBullet: 'text-emerald-500/50',
    weaknessBullet: 'text-orange-500/50',
    finishButton: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
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
    scoreGradient: 'from-sky-600 to-indigo-600',
    questionAccent: 'text-sky-600',
    scoreBadge: 'border-slate-200 bg-white/80 text-sky-600',
    transcriptBox: 'bg-white/70',
    label: 'text-slate-500',
    body: 'text-slate-700',
    idealPanel: 'border-indigo-200 bg-indigo-50/80',
    idealTitle: 'text-indigo-600',
    strengthTitle: 'text-emerald-600',
    weaknessTitle: 'text-orange-600',
    strengthBullet: 'text-emerald-500/70',
    weaknessBullet: 'text-orange-500/70',
    finishButton: 'border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50',
  },
} as const;

const FeedbackPage = () => {
  const { currentSession, questions, feedbackResults, reset, isDarkMode } = useAppStore();
  const navigate = useNavigate();
  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  if (!currentSession || questions.length === 0) {
    return <Navigate to="/" />;
  }

  // Calculate average score
  const totalScore = questions.reduce((acc, q) => acc + (feedbackResults[q.id]?.score || 0), 0);
  const avgScore = Math.round(totalScore / questions.length);

  const handleFinish = () => {
    reset();
    navigate('/');
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme.pageBg} ${theme.text}`}>
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className={`absolute -left-24 top-[-7rem] h-96 w-96 rounded-full blur-3xl ${theme.ambientOne}`} />
      <div className={`absolute right-[-8rem] top-28 h-[28rem] w-[28rem] rounded-full blur-3xl ${theme.ambientTwo}`} />
      <div className={`absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${theme.ambientThree}`} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 md:px-12 md:py-12">
        <header className="mb-12 flex items-center justify-between gap-6">
          <div>
            <h1 className={`mb-2 text-3xl font-bold ${theme.title}`}>Interview Results</h1>
            <p className={theme.muted}>
              {currentSession.role} • {currentSession.difficulty}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.scoreGradient}`}>
              {avgScore}<span className={`text-2xl ${theme.muted}`}>/100</span>
            </div>
            <p className={`mt-1 text-sm font-medium uppercase tracking-wider ${theme.muted}`}>Average Score</p>
          </div>
        </header>

        <div className="space-y-8">
          {questions.map((q, idx) => {
            const feedback = feedbackResults[q.id];
            if (!feedback) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={q.id}
                className="glass-panel rounded-3xl p-8 backdrop-blur-2xl"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <h3 className={`flex-1 text-xl font-medium ${theme.title}`}>
                    <span className={`mr-2 ${theme.questionAccent}`}>Q{idx + 1}.</span>
                    {q.question_text}
                  </h3>
                  <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold ${theme.scoreBadge}`}>
                    {feedback.score}
                  </div>
                </div>

                <div className={`mb-6 rounded-xl p-4 ${theme.transcriptBox}`}>
                  <p className={`mb-2 text-sm font-semibold uppercase tracking-wide ${theme.muted}`}>Your Transcript</p>
                  <p className={`leading-relaxed italic ${theme.body}`}>
                    "{feedback.transcript || 'No transcript captured.'}"
                  </p>
                </div>

                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className={`flex items-center gap-2 font-medium ${theme.strengthTitle}`}>
                      <TrendingUp className="h-5 w-5" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${theme.muted}`}>
                          <span className={`mt-0.5 ${theme.strengthBullet}`}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className={`flex items-center gap-2 font-medium ${theme.weaknessTitle}`}>
                      <AlertCircle className="h-5 w-5" /> Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${theme.muted}`}>
                          <span className={`mt-0.5 ${theme.weaknessBullet}`}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`rounded-2xl border p-6 ${theme.idealPanel}`}>
                  <h4 className={`mb-3 flex items-center gap-2 font-medium ${theme.idealTitle}`}>
                    <Award className="h-5 w-5" /> Ideal Answer
                  </h4>
                  <p className={`text-sm leading-relaxed ${theme.body}`}>{feedback.ideal_answer}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center pb-12">
          <button
            onClick={handleFinish}
            className={`flex items-center gap-2 rounded-xl border px-8 py-4 font-medium transition-all duration-300 hover:-translate-y-0.5 ${theme.finishButton}`}
          >
            <Home className="h-5 w-5" /> Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
