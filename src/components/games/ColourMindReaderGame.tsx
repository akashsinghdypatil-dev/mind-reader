import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  FlaskConical,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import {
  MIND_READER_COLOURS,
  MindReaderColour,
  runColourMindReaderTests,
} from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface ColourMindReaderGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
  onRevealBgChange: (hex: string | null) => void;
}

const BIT_VALUES = [1, 2, 4, 8] as const;

export function ColourMindReaderGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
  onRevealBgChange,
}: ColourMindReaderGameProps) {
  const [stage, setStage] = useState<'intro' | 'question' | 'scanning' | 'reveal'>('intro');
  const [step, setStep] = useState(0); // 0, 1, 2, 3
  const [answers, setAnswers] = useState<boolean[]>([]); // tracks each YES/NO for Back support
  const [locked, setLocked] = useState(false);
  const [lieBanner, setLieBanner] = useState<string | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Reset full-page background whenever leaving or unmounting
  useEffect(() => {
    return () => {
      onRevealBgChange(null);
    };
  }, [onRevealBgChange]);

  // Scanning animation before reveal
  useEffect(() => {
    if (stage !== 'scanning') return;
    soundEngine.playSuspenseBuild();
    const timer = window.setTimeout(() => {
      const idx = answers.reduce((sum, isYes, i) => sum + (isYes ? BIT_VALUES[i] : 0), 0);
      const match = MIND_READER_COLOURS[idx] ?? MIND_READER_COLOURS[0];
      setStage('reveal');
      onRevealBgChange(match.hex);
      soundEngine.playRevealChord();
      onConfetti();
      onGameFinished();
      onMascot('shocked', `${match.name}! The crystal ball never misses!`);
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [stage, answers, onConfetti, onGameFinished, onMascot, onRevealBgChange]);

  const resetGame = (funnyRestartMsg?: string) => {
    soundEngine.playClick();
    onRevealBgChange(null);
    setStage('intro');
    setStep(0);
    setAnswers([]);
    setLocked(false);
    setLieBanner(funnyRestartMsg ?? null);
    onMascot(
      funnyRestartMsg ? 'oops' : 'idle',
      funnyRestartMsg ?? 'Secretly pick ONE of the 16 colours and keep it locked in your head!'
    );
  };

  const handleStart = () => {
    soundEngine.playClick();
    setLieBanner(null);
    setStage('question');
    setStep(0);
    setAnswers([]);
    setLocked(false);
    onMascot('thinking', 'Question 1 of 4: Look closely at these 8 colours. Is yours here?');
  };

  const handleAnswer = (isYes: boolean) => {
    if (locked || stage !== 'question') return;
    setLocked(true);
    soundEngine.playClick();

    const nextAnswers = [...answers.slice(0, step), isYes];
    setAnswers(nextAnswers);

    if (step >= 3) {
      setStage('scanning');
      onMascot('thinking', 'Scanning your brain... detecting colour vibes...');
      setLocked(false);
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    const quips = [
      'Aha! Half the rainbow just disappeared!',
      'Getting warmer... my neon orb is glowing brighter!',
      'Final question! One last YES or NO and your colour is mine.',
    ];
    onMascot('thinking', quips[step] ?? 'Reading your colour aura...');
    window.setTimeout(() => setLocked(false), 180);
  };

  const handlePrevQuestion = () => {
    if (locked || stage !== 'question') return;
    soundEngine.playClick();
    if (step === 0) {
      setStage('intro');
      setAnswers([]);
      onMascot('idle', 'Changed your mind? Pick any of the 16 colours and start again!');
      return;
    }
    const prevStep = step - 1;
    setStep(prevStep);
    setAnswers((prev) => prev.slice(0, prevStep));
    onMascot('thinking', `No problem! Back to Question ${prevStep + 1} of 4.`);
  };

  const handleLeaveHome = () => {
    onRevealBgChange(null);
    onBack();
  };

  const currentBitValue = BIT_VALUES[step] ?? 1;
  const currentGroup: MindReaderColour[] = MIND_READER_COLOURS.filter(
    (c) => (c.id & currentBitValue) !== 0
  );

  const computedIndex = answers.reduce((sum, isYes, i) => sum + (isYes ? BIT_VALUES[i] : 0), 0);
  const revealedColour = MIND_READER_COLOURS[computedIndex] ?? MIND_READER_COLOURS[0];
  const testReport = showTestPanel ? runColourMindReaderTests() : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleLeaveHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-400/30 bg-[#140A2D]/85 hover:bg-purple-900/80 text-sm font-medium text-purple-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowTestPanel((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-400/35 bg-emerald-950/70 hover:bg-emerald-900/70 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {showTestPanel ? 'Hide Test Mode' : 'Test Mode (16/16)'}
          </button>
          <span className="hidden sm:inline text-xs font-mono text-fuchsia-200 bg-[#140A2D]/75 px-3 py-2 rounded-xl border border-purple-400/20 tabular-nums">
            16 Colours · 4 YES/NO
          </span>
        </div>
      </div>

      {/* Inline 16-Colour Automated Test Mode Panel */}
      {showTestPanel && testReport && (
        <div className="rounded-3xl magic-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {testReport.allPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Colour Mind Reader Test Mode —{' '}
                  {testReport.allPassed ? 'All 16 Colours Passed!' : 'Error Detected'}
                </h2>
                <p className="text-xs text-purple-200/80">
                  Simulated every 4-bit YES/NO path (bits 1, 2, 4, 8) to confirm unique signatures
                  and exact reveals.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTestPanel(false)}
              aria-label="Close test mode panel"
              className="p-1.5 rounded-lg text-purple-200 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {testReport.results.map((r) => (
              <div
                key={r.colour.id}
                className="rounded-xl border border-emerald-400/25 bg-[#120828]/90 px-3 py-2 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-4 h-4 rounded-md border border-white/25 shrink-0"
                    style={{ backgroundColor: r.colour.hex }}
                  />
                  <span className="text-xs font-medium text-white truncate">{r.colour.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-purple-300">{r.binarySignature}</span>
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funny "You lied!" Banner if user clicked That's Wrong */}
      {lieBanner && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100 text-center font-medium">
          🔮 {lieBanner}
        </div>
      )}

      {/* Main Game Card */}
      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'intro' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-fuchsia-300">Colour Mind Reader</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-balance">
                Secretly pick ONE colour and don’t tell me.
              </h1>
              <p className="text-sm text-purple-200/85 max-w-xl mx-auto">
                Answer 4 quick YES/NO questions. Every colour has a unique name label underneath so
                everyone—including colour-blind players—can play with 100% accuracy.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MIND_READER_COLOURS.map((col) => (
                <div
                  key={col.id}
                  className="rounded-2xl border border-purple-400/20 bg-[#140A2D]/90 p-3 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full h-14 sm:h-16 rounded-xl border border-white/20 shadow-inner"
                    style={{ backgroundColor: col.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-white">{col.name}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="px-7 py-3.5 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
              >
                I Picked My Colour — Read My Mind
              </button>
            </div>
          </div>
        )}

        {stage === 'question' && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-mono text-purple-200/85 tabular-nums">
              <span>Question {step + 1} of 4</span>
              <span>8 of 16 colours shown</span>
            </div>

            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center">
              Is your colour in this group?
            </h2>

            {/* 8 Large Colour Swatches with Names */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {currentGroup.map((col) => (
                <div
                  key={col.id}
                  className="rounded-2xl border border-fuchsia-400/30 bg-[#140A2D]/90 p-3 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full h-16 sm:h-20 rounded-xl border border-white/25 shadow-md"
                    style={{ backgroundColor: col.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-white tracking-wide">{col.name}</span>
                </div>
              ))}
            </div>

            {/* Big YES / NO Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2 max-w-md mx-auto">
              <button
                type="button"
                disabled={locked}
                onClick={() => handleAnswer(true)}
                className="py-4 px-6 rounded-xl neon-button text-white font-display text-lg font-bold cursor-pointer disabled:opacity-50"
              >
                YES
              </button>
              <button
                type="button"
                disabled={locked}
                onClick={() => handleAnswer(false)}
                className="py-4 px-6 rounded-xl border border-purple-400/35 bg-purple-950/85 hover:bg-purple-900/85 text-purple-100 font-display text-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                NO
              </button>
            </div>

            {/* Previous Question & Restart */}
            <div className="pt-4 border-t border-purple-400/15 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={locked}
                onClick={handlePrevQuestion}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-200 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 0 ? 'Back to All 16 Colours' : 'Previous Question'}
              </button>
              <button
                type="button"
                onClick={() => resetGame()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'scanning' && (
          <div className="text-center py-12 space-y-5">
            <div className="text-6xl animate-float-orb" aria-hidden="true">
              🔮
            </div>
            <p className="font-mono text-sm sm:text-base text-fuchsia-200">
              Scanning your brain... detecting colour vibes...
            </p>
            <div className="max-w-sm mx-auto h-2 rounded-full bg-purple-950 overflow-hidden">
              <motion.div
                initial={{ width: '10%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500"
              />
            </div>
          </div>
        )}

        {stage === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-6"
          >
            <p className="text-xs font-mono text-fuchsia-300">Mind Reading Complete</p>

            {/* Giant Glowing Swatch */}
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mx-auto border-2 border-white/40 shadow-2xl"
              style={{ backgroundColor: revealedColour.hex }}
              aria-label={revealedColour.name}
            />

            <div className="space-y-2">
              <p className="text-sm text-purple-200">You are thinking of</p>
              <h2 className="font-display text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                {revealedColour.name}!
              </h2>
              <p className="text-base sm:text-lg text-purple-100 max-w-lg mx-auto leading-relaxed pt-1">
                {revealedColour.roast}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => resetGame()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                type="button"
                onClick={() =>
                  resetGame('You lied to the crystal ball! Try again and answer honestly this time.')
                }
                className="px-5 py-3 rounded-xl border border-amber-400/45 bg-amber-500/15 hover:bg-amber-500/25 text-amber-100 font-semibold text-sm transition-colors cursor-pointer"
              >
                That’s wrong!
              </button>
              <button
                type="button"
                onClick={handleLeaveHome}
                className="px-5 py-3 rounded-xl border border-purple-400/30 bg-purple-950/70 hover:bg-purple-900/75 text-purple-100 font-medium text-sm cursor-pointer"
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
