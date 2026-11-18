import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Copy, Heart, RotateCcw } from 'lucide-react';
import { calculateLoveScore, getLoveVerdict } from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface LoveMeterGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

export function LoveMeterGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: LoveMeterGameProps) {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    a: string;
    b: string;
    score: number;
    title: string;
    line: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    const cleanA = nameA.trim();
    const cleanB = nameB.trim();

    if (!cleanA && !cleanB) {
      soundEngine.playError();
      const msg = 'Both boxes are empty! My crystal ball cannot ship thin air with thin air.';
      setError(msg);
      onMascot('oops', msg);
      return;
    }
    if (!cleanA || !cleanB) {
      soundEngine.playError();
      const msg = 'Love takes two! Typing only one name is just a solo self-care journey.';
      setError(msg);
      onMascot('oops', msg);
      return;
    }

    setError(null);
    const score = calculateLoveScore(cleanA, cleanB);
    const verdict = getLoveVerdict(score);

    setResult({
      a: cleanA,
      b: cleanB,
      score,
      title: verdict.title,
      line: verdict.line,
    });
    setCopied(false);
    onGameFinished();

    if (score >= 61) {
      soundEngine.playRevealChord();
      onConfetti();
      onMascot('happy', `${score}%! ${verdict.title} — the neon stars approve!`);
    } else {
      soundEngine.playSuccess();
      onMascot('shocked', `${score}%! ${verdict.title} — hey, opposites attract, right?`);
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setNameA('');
    setNameB('');
    setError(null);
    setResult(null);
    setCopied(false);
    onMascot('idle', 'Type two names to calculate their exact cosmic compatibility!');
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `💖 Love Compatibility Meter: ${result.a} + ${result.b} = ${result.score}% (${result.title}) — "${result.line}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      soundEngine.playClick();
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
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
        <span className="text-xs font-mono text-fuchsia-300">
          Order-Independent · Deterministic Formula
        </span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-fuchsia-300">Love Compatibility Meter</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Calculate Your Cosmic Chemistry
          </h1>
          <p className="text-sm text-purple-200/85 max-w-lg mx-auto">
            Enter two names. The same pair always produces the exact same percentage—whichever
            order you type them in.
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                maxLength={32}
                placeholder="e.g. Aarav"
                className="w-full rounded-xl border border-purple-400/30 bg-[#120828] px-4 py-3 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                Second Name
              </label>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                maxLength={32}
                placeholder="e.g. Meera"
                className="w-full rounded-xl border border-purple-400/30 bg-[#120828] px-4 py-3 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div className="text-center pt-1">
            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl neon-button text-white font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              Measure Compatibility
            </button>
          </div>
        </form>

        {result && (
          <motion.div
            key={`${result.a}-${result.b}-${result.score}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 border-t border-purple-400/20 text-center space-y-5"
          >
            {/* Animated Heart Fill Meter */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_24px_rgba(236,72,153,0.55)]">
                <defs>
                  <clipPath id="heartClip">
                    <path d="M50 88 C20 66 8 50 8 33 C8 19 19 10 32 10 C40 10 46 14 50 20 C54 14 60 10 68 10 C81 10 92 19 92 33 C92 50 80 66 50 88 Z" />
                  </clipPath>
                  <linearGradient id="heartFillGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="55%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 88 C20 66 8 50 8 33 C8 19 19 10 32 10 C40 10 46 14 50 20 C54 14 60 10 68 10 C81 10 92 19 92 33 C92 50 80 66 50 88 Z"
                  fill="#1C0E3D"
                  stroke="#F472B6"
                  strokeWidth="2.5"
                />
                <motion.rect
                  x="0"
                  width="100"
                  height="100"
                  fill="url(#heartFillGrad)"
                  clipPath="url(#heartClip)"
                  initial={{ y: 95 }}
                  animate={{ y: 92 - result.score * 0.84 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-extrabold text-white tabular-nums drop-shadow">
                {result.score}%
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-mono text-fuchsia-300">
                {result.a} + {result.b}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {result.title}
              </h2>
              <p className="text-sm sm:text-base text-purple-100 max-w-md mx-auto">
                {result.line}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Result Copied!' : 'Share Result'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-400/30 bg-purple-950/60 hover:bg-purple-900/70 text-purple-100 text-sm font-medium cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
