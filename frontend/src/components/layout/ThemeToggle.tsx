import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type ThemeToggleProps = {
  className?: string;
};

const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const buttonStyles = isDarkMode
    ? 'border-white/10 bg-white/5 text-slate-100 hover:border-cyan-400/30 hover:bg-cyan-400/10'
    : 'border-slate-200 bg-white/90 text-slate-700 hover:border-sky-300 hover:bg-sky-50';

  const trackStyles = isDarkMode
    ? 'border-cyan-400/30 bg-cyan-400/10'
    : 'border-sky-300 bg-sky-100';

  const thumbStyles = isDarkMode ? 'bg-cyan-300' : 'bg-sky-500';
  const iconStyles = isDarkMode ? 'text-cyan-100' : 'text-sky-700';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-3 rounded-full border px-2.5 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-300 ${buttonStyles} ${className}`}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`relative flex h-8 w-14 items-center rounded-full border transition-colors duration-300 ${trackStyles}`}>
        <motion.span
          animate={{ x: isDarkMode ? 0 : 24 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`absolute left-1 top-1 h-6 w-6 rounded-full shadow-lg ${thumbStyles}`}
        />
        <Moon className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${iconStyles} ${isDarkMode ? 'opacity-100' : 'opacity-30'}`} />
        <Sun className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${iconStyles} ${isDarkMode ? 'opacity-30' : 'opacity-100'}`} />
      </span>
      <span className={`hidden sm:inline ${iconStyles}`}>{isDarkMode ? 'Dark mode' : 'Light mode'}</span>
      <span className={`sm:hidden ${iconStyles}`}>{isDarkMode ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
};

export default ThemeToggle;