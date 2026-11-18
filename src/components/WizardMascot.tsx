import { motion } from 'motion/react';

export type MascotMood = 'idle' | 'thinking' | 'happy' | 'shocked' | 'oops';

interface WizardMascotProps {
  mood: MascotMood;
  message: string;
}

const MOOD_FACE: Record<MascotMood, string> = {
  idle: '🧙‍♂️',
  thinking: '🔮',
  happy: '🥳',
  shocked: '🤯',
  oops: '😅',
};

const MOOD_RING: Record<MascotMood, string> = {
  idle: 'border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.4)]',
  thinking: 'border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.5)]',
  happy: 'border-fuchsia-400/70 shadow-[0_0_32px_rgba(232,121,249,0.6)]',
  shocked: 'border-amber-400/70 shadow-[0_0_32px_rgba(250,204,21,0.55)]',
  oops: 'border-rose-400/60 shadow-[0_0_26px_rgba(251,113,133,0.45)]',
};

export function WizardMascot({ mood, message }: WizardMascotProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl magic-card px-4 py-3 max-w-2xl mx-auto">
      <motion.div
        key={mood}
        initial={{ scale: 0.85, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-700/80 via-fuchsia-700/60 to-indigo-900 border flex items-center justify-center text-2xl shrink-0 animate-float-orb ${MOOD_RING[mood]}`}
        aria-hidden="true"
      >
        {MOOD_FACE[mood]}
      </motion.div>
      <div className="min-w-0">
        <p className="text-[11px] font-mono text-fuchsia-300">
          Wizard Orby · Crystal Ball Mascot
        </p>
        <p className="text-sm text-purple-50 leading-snug">{message}</p>
      </div>
    </div>
  );
}
