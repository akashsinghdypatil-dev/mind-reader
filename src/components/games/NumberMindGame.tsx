import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import {
  createInitialCandidates,
  getNextNumberQuestion,
  NumberQuestionOption,
} from '../../lib/gameEngines';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface NumberMindGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

const MIN_NUM = 1;
const MAX_NUM = 50;

export function NumberMindGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: NumberMindGameProps) {
  const [stage, setStage] = useState<'intro' | 'playing' | 'reveal'>('intro');
  const [candidates, setCandidates] = useState<number[]>(() =>
    createInitialCandidates(MIN_NUM, MAX_NUM)
  );
  const [step, setStep] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);
  const [predictedNumber, setPredictedNumber] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  const resetGame = () => {
    soundEngine.playClick();
    setStage('intro');
    setCandidates(createInitialCandidates(MIN_NUM, MAX_NUM));
    setStep(0);
    setTrail([]);
    setPredictedNumber(null);
    setLocked(false);
    onMascot('idle', 'Think of any secret number from 1 to 50. I will deduce it in 4–5 questions!');
  };

  const handleStart = () => {
    soundEngine.playClick();
    setStage('playing');
    onMascot('thinking', 'First signal: is your secret number Even or Odd?');
  };

  const currentQuestion =
    stage === 'playing' ? getNextNumberQuestion(candidates, step, MAX_NUM) : null;

  const handleAnswer = (option: NumberQuestionOption) => {
    if (locked || !currentQuestion) return;
    setLocked(true);
    soundEngine.playClick();

    const filtered = candidates.filter(option.filter);
    const nextCandidates = filtered.length > 0 ? filtered : candidates;
    const nextTrail = [
      ...trail,
      `${currentQuestion.prompt} → ${option.label} (${nextCandidates.length} left)`,
    ];

    setCandidates(nextCandidates);
    setTrail(nextTrail);

    if (nextCandidates.length <= 1) {
      const answer = nextCandidates[0] ?? candidates[0];
      setPredictedNumber(answer);
      setStage('reveal');
      soundEngine.playRevealChord();
      onConfetti();
      onGameFinished();
      onMascot('shocked', `Boom! Your secret number is ${answer}! Admit it, your jaw just dropped.`);
      setLocked(false);
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    const upcoming = getNextNumberQuestion(nextCandidates, nextStep, MAX_NUM);
    if (!upcoming) {
      const answer = nextCandidates[0];
      setPredictedNumber(answer);
      setStage('reveal');
      soundEngine.playRevealChord();
      onConfetti();
      onGameFinished();
      onMascot('shocked', `Boom! Your secret number is ${answer}!`);
      setLocked(false);
    } else {
      onMascot('thinking', `Down to ${nextCandidates.length} possibilities... ${upcoming.prompt}`);
      window.setTimeout(() => setLocked(false), 160);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-400/25 bg-purple-950/60 hover:bg-purple-900/70 text-sm font-medium text-purple-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-xs font-mono text-fuchsia-300 tabular-nums">
          Range 1–50 · 100% Deterministic
        </span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'intro' && (
          <div className="text-center py-4 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-fuchsia-300">Number Mind Reader</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-balance">
                Think of any number between 1 and 50
              </h1>
              <p className="text-sm sm:text-base text-purple-200/85 max-w-lg mx-auto">
                Keep it completely secret. Answer 4 to 5 quick mathematical questions, and the
                crystal ball will isolate your exact number with zero guessing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="px-7 py-3.5 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
            >
              I Have My Number
            </button>
          </div>
        )}

        {stage === 'playing' && currentQuestion && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-mono text-purple-200/80 tabular-nums">
              <span>Question {step + 1}</span>
              <span>{candidates.length} numbers left</span>
            </div>

            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    96,
                    Math.max(12, Math.round(((MAX_NUM - candidates.length) / (MAX_NUM - 1)) * 100))
                  )}%`,
                }}
              />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {currentQuestion.prompt}
              </h2>
              <p className="text-sm text-purple-200/75">{currentQuestion.hint}</p>
            </div>

            <div
              className={`grid gap-3 ${
                currentQuestion.options.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  disabled={locked}
                  onClick={() => handleAnswer(opt)}
                  className="text-left p-5 rounded-2xl border border-purple-400/25 bg-[#150A30] hover:border-fuchsia-400 hover:bg-fuchsia-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="font-display text-lg font-semibold text-white">{opt.label}</div>
                  {opt.sublabel && (
                    <div className="mt-1 text-xs text-purple-300/80 font-mono">{opt.sublabel}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-400/15 flex justify-end">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'reveal' && predictedNumber !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-6"
          >
            <p className="text-xs font-mono text-fuchsia-300">Mind Connection Locked</p>
            <div className="space-y-1">
              <p className="text-sm text-purple-200">Your secret number is</p>
              <div
                className="font-display text-7xl sm:text-8xl font-extrabold text-white tabular-nums"
                style={{ textShadow: '0 0 42px rgba(217, 70, 239, 0.75)' }}
              >
                {predictedNumber}
              </div>
            </div>

            <div className="text-left rounded-2xl border border-purple-400/20 bg-[#120828] p-4 max-w-lg mx-auto">
              <p className="text-xs font-mono text-fuchsia-300 mb-2">Deduction Proof</p>
              <ol className="space-y-1 text-xs text-purple-200/90">
                {trail.map((line, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-mono text-fuchsia-400">{idx + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl border border-purple-400/30 bg-purple-950/60 hover:bg-purple-900/70 text-purple-100 font-medium text-sm cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
