import { useRef, useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useWaveform } from '../hooks/useWaveform';
import ThemeToggle from '../components/layout/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, ArrowRight, CheckCircle2, Target, History, Clock, Sparkles } from 'lucide-react';

const themeStyles = {
  dark: {
    pageBg: 'bg-[#050816]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(5,8,22,0.98)_0%,rgba(9,14,30,0.96)_45%,rgba(2,4,12,1)_100%)]',
    ambientOne: 'bg-cyan-500/20',
    ambientTwo: 'bg-indigo-600/20',
    ambientThree: 'bg-fuchsia-500/10',
    text: 'text-slate-100',
    titleText: 'text-slate-50',
    mutedText: 'text-slate-300',
    linkText: 'text-slate-300 hover:text-cyan-100',
    card: 'border-white/10 bg-white/5 text-slate-100 shadow-black/40',
    progressActive: 'bg-cyan-400',
    progressComplete: 'bg-cyan-400/60',
    progressPending: 'bg-slate-600',
    timer: 'border-white/10 bg-white/5 text-slate-200',
    tip: 'border-white/10 bg-white/5 text-slate-300',
    divider: 'bg-white/10',
    loading: 'text-cyan-200',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    nextButton:
      'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400',
    micIdle:
      'bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-cyan-500/20 hover:scale-105',
    micActive: 'bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-rose-500/30',
    note: 'text-slate-400',
    questionText: 'text-slate-50',
    topLabel: 'text-slate-400',
  },
  light: {
    pageBg: 'bg-[#f5f7fb]',
    overlay:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,245,249,0.94)_45%,rgba(226,232,240,0.98)_100%)]',
    ambientOne: 'bg-sky-400/20',
    ambientTwo: 'bg-indigo-400/20',
    ambientThree: 'bg-amber-300/25',
    text: 'text-slate-900',
    titleText: 'text-slate-950',
    mutedText: 'text-slate-600',
    linkText: 'text-slate-500 hover:text-slate-950',
    card: 'border-slate-200 bg-white/80 text-slate-900 shadow-slate-300/50',
    progressActive: 'bg-sky-500',
    progressComplete: 'bg-sky-500/60',
    progressPending: 'bg-slate-300',
    timer: 'border-slate-200 bg-white text-slate-700',
    tip: 'border-slate-200 bg-white text-slate-600',
    divider: 'bg-slate-200',
    loading: 'text-sky-600',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
    nextButton:
      'bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 text-white hover:from-sky-400 hover:via-cyan-400 hover:to-indigo-400',
    micIdle:
      'bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sky-500/20 hover:scale-105',
    micActive: 'bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-rose-500/30',
    note: 'text-slate-500',
    questionText: 'text-slate-950',
    topLabel: 'text-slate-500',
  },
} as const;

const InterviewPage = () => {
  const navigate = useNavigate();
  const { currentSession, questions, currentQuestionIndex, submitAnswerAndGetFeedback, nextQuestion, isLoading, feedbackResults, isDarkMode } = useAppStore();
  const { isRecording, stream, startRecording, stopRecording } = useAudioRecorder();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Timer state (mock functionality for visual parity)
  const [timer, setTimer] = useState(0);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useWaveform(stream, canvasRef);

  if (!currentSession || questions.length === 0) {
    return <Navigate to="/" />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = !!feedbackResults[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleRecordToggle = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await submitAnswerAndGetFeedback(currentQuestion.id, audioBlob);
      }
    } else {
      await startRecording();
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      navigate('/feedback');
    } else {
      nextQuestion();
    }
  };

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
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
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
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${theme.linkText}`}
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-4xl rounded-[2rem] border p-8 shadow-2xl backdrop-blur-2xl md:p-14 ${theme.card}`}
          >
            <div className="mb-12 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="mr-3 flex gap-1.5">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentQuestionIndex
                          ? `w-6 ${theme.progressActive}`
                          : idx < currentQuestionIndex
                            ? `w-2 ${theme.progressComplete}`
                            : `w-2 ${theme.progressPending}`
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-semibold tracking-wide ${theme.topLabel}`}>
                  Q{currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${theme.timer}`}>
                <Clock className="h-4 w-4" />
                <span className="w-10 text-center font-mono">{formatTime(timer)}</span>
              </div>
            </div>

            <h2 className={`mb-8 px-4 text-center font-serif text-3xl font-medium leading-tight md:text-4xl lg:text-5xl ${theme.questionText}`}>
              "{currentQuestion.question_text}"
            </h2>

            <div className="mb-12 flex justify-center">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${theme.tip}`}>
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Tip: Use the STAR method (Situation, Task, Action, Result)
              </div>
            </div>

            <div className={`mx-auto mb-12 h-px max-w-lg ${theme.divider}`} />

            <div className="flex min-h-[160px] flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`flex flex-col items-center gap-4 ${theme.loading}`}
                  >
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <span>Analyzing your answer with Gemini...</span>
                  </motion.div>
                ) : hasAnswered ? (
                  <motion.div
                    key="answered"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                  >
                    <div className={`mb-6 flex items-center justify-center gap-3 rounded-2xl border p-4 ${theme.success}`}>
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="font-medium">Response recorded!</span>
                    </div>
                    <button
                      onClick={handleNext}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${theme.nextButton}`}
                    >
                      {isLastQuestion ? 'View Results' : 'Next Question'}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="record"
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={handleRecordToggle}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                        isRecording ? theme.micActive : theme.micIdle
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <span className="absolute h-full w-full animate-ping rounded-full border-2 border-current opacity-30" />
                          <canvas ref={canvasRef} width={80} height={40} className="absolute inset-0 m-auto opacity-70" />
                        </>
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </button>
                    <p className={`mt-6 text-sm font-medium ${theme.note}`}>
                      {isRecording ? 'Recording... Tap to stop.' : 'Tap the microphone to begin answering'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default InterviewPage;
