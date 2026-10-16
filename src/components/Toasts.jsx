import { AnimatePresence, motion } from 'framer-motion';
import { Info, Zap } from 'lucide-react';

export default function Toasts({ toasts }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${
              t.tone === 'xp'
                ? 'border-neon/30 bg-card/95 text-neon shadow-glow'
                : 'border-white/10 bg-card/95 text-mute'
            }`}
          >
            {t.tone === 'xp' ? <Zap size={16} /> : <Info size={16} />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
