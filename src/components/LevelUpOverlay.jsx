import { AnimatePresence, motion } from 'framer-motion';

export default function LevelUpOverlay({ level, onDismiss }) {
  return (
    <AnimatePresence>
      {level && (
        <motion.div
          key={level}
          className="fixed inset-0 z-[60] grid cursor-pointer place-items-center bg-void/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          role="alert"
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          >
            <p className="font-display text-5xl font-bold tracking-wider text-neon drop-shadow-[0_0_24px_rgba(182,255,74,0.55)] sm:text-7xl">
              LEVEL UP
            </p>
            <p className="mt-3 font-display text-xl text-ink sm:text-2xl">
              You reached level <span className="text-violet">{String(level).padStart(2, '0')}</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
