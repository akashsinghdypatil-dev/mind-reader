import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { computeFutureResult, FUTURE_QUESTIONS } from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface FuturePredictorGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

const SCAN_STEPS = [
  { pct: 23, text: 'Scanning your future... 23%... checking midnight snack history...' },
  { pct: 47, text: 'Scanning your future... 47%... found only snacks...' },
  { pct: 76, text: 'Scanning your future... 76%... negotiating with your WiFi router...' },
  { pct: 99, text: 'Scanning your future... 99%... destiny locked!' },
];

export function FuturePredictorGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: FuturePredictorGameProps) {
  const [step, setStep] = useState(0); // 0, 1, 2
  const [answers, setAnswers] = useState<number[]>([]);
  const [stage, setStage] = useState<'questions' | 'scanning' | 'reveal'>('questions');
  const [scanIndex, setScanIndex] = useState(0);

  useEffect(() => {
    if (stage !== 'scanning') return;
    setScanIndex(0);
    soundEngine.playSuspenseBuild();

    const t1 = window.setTimeout(() => setScanIndex(1), 650);
    const t2 = window.setTimeout(() => setScanIndex(2), 1350);
    const t3 = window.setTimeout(() => setScanIndex(3), 2050);
    const t4 = window.setTimeout(() => {
      setStage('reveal');
      soundEngine.playRevealChord();
      onConfetti();
      onGameFinished();
      onMascot('shocked', 'The crystal ball has spoken! Screenshot this prophecy immediately.');
    }, 2650);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [stage, onConfetti, onGameFinished, onMascot]);

  const resetGame = () => {
    soundEngine.playClick();
    setStep(0);
    setAnswers([]);
    setStage('questions');
    setScanIndex(0);
    onMascot('idle', 'Answer 3 deeply scientific questions about snacks, sleep, and battery.');
  };

  const handlePick = (optionIndex: number) => {
    if (stage !== 'questions') return;
    soundEngine.playClick();
    const nextAnswers = [...answers, optionIndex];
    setAnswers(nextAnswers);

    if (step >= 2) {
      setStage('scanning');
      onMascot('thinking', 'Hold still! Consulting the neon crystal ball...');
    } else {
      setStep(step + 1);
      onMascot(
        'thinking',
        step === 0
          ? 'Interesting snack choice... now confess your real bedtime.'
          : 'Almost there! Your battery habit reveals everything.'
      );
    }
  };

  const currentQuestion = FUTURE_QUESTIONS[step];
  const result =
    answers.length === 3 ? computeFutureResult(answers[0], answers[1], answers[2]) : null;

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
        <span className="text-xs font-mono text-fuchsia-300">27 Fixed Prophecies</span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'questions' && currentQuestion && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-mono text-purple-200/80">
              <span>Question {step + 1} of 3</span>
              <span>Deterministic Oracle</span>
            </div>

            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {currentQuestion.prompt}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handlePick(idx)}
                  className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-purple-400/25 bg-[#150A30] hover:border-fuchsia-400 hover:bg-fuchsia-500/10 text-left transition-all cursor-pointer"
                >
                  <span className="text-3xl shrink-0" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className="font-display text-lg font-semibold text-white">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'scanning' && (
          <div className="text-center py-10 space-y-6">
            <div className="text-6xl animate-float-orb" aria-hidden="true">
              🔮
            </div>
            <div className="space-y-2">
              <p className="font-mono text-sm text-fuchsia-300">{SCAN_STEPS[scanIndex].text}</p>
              <div className="max-w-md mx-auto h-2.5 rounded-full bg-purple-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${SCAN_STEPS[scanIndex].pct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {stage === 'reveal' && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-fuchsia-300">
              <Sparkles className="w-4 h-4" />
              Prophecy #{result.index + 1} of 27
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug max-w-xl mx-auto">
              “{result.prediction}”
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              <div className="rounded-2xl border border-purple-400/25 bg-[#140A2D] p-4">
                <p className="text-xs text-purple-300">Lucky Number</p>
                <p className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
                  {result.luckyNumber}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-400/25 bg-[#140A2D] p-4">
                <p className="text-xs text-purple-300">Lucky Colour</p>
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                    style={{ backgroundColor: result.luckyColour.hex }}
                  />
                  <span className="font-display text-lg font-bold text-white">
                    {result.luckyColour.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
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
