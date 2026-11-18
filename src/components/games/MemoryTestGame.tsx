import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Difficulty } from '../../types/app';
import { soundEngine } from '../../lib/sound';

const SYMBOLS = [
  { id: 1, label: '01', name: 'Orbit' },
  { id: 2, label: '02', name: 'Prism' },
  { id: 3, label: '03', name: 'Pulse' },
  { id: 4, label: '04', name: 'Nova' },
  { id: 5, label: '05', name: 'Cipher' },
  { id: 6, label: '06', name: 'Vector' },
  { id: 7, label: '07', name: 'Helix' },
  { id: 8, label: '08', name: 'Apex' },
  { id: 9, label: '09', name: 'Zenith' },
];

interface MemoryTestGameProps {
  difficulty: Difficulty;
  speak: (text: string) => void;
  onComplete: (result: {
    prediction: string;
    correct: boolean;
    score: number;
    xpEarned: number;
    perfect: boolean;
  }) => void;
  onChallengeFriend: (score: number) => void;
  onBack: () => void;
}

export function MemoryTestGame({
  difficulty,
  speak,
  onComplete,
  onChallengeFriend,
  onBack,
}: MemoryTestGameProps) {
  const sequenceLength = difficulty === 'expert' ? 7 : difficulty === 'medium' ? 5 : 4;
  const [stage, setStage] = useState<'ready' | 'showing' | 'recall' | 'result'>('ready');
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (stage !== 'showing' || sequence.length === 0) return;

    let step = 0;
    const stepMs = difficulty === 'expert' ? 620 : difficulty === 'medium' ? 760 : 900;
    const timers: number[] = [];

    const showNext = () => {
      if (step >= sequence.length) {
        setActiveIndex(null);
        setStage('recall');
        speak('Now tap the nodes in the exact order they lit up.');
        return;
      }
      setActiveIndex(sequence[step]);
      soundEngine.playCountdownTick((step % 3) + 1);
      timers.push(
        window.setTimeout(() => {
          setActiveIndex(null);
        }, stepMs * 0.65)
      );
      step += 1;
      timers.push(window.setTimeout(showNext, stepMs));
    };

    timers.push(window.setTimeout(showNext, 450));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stage, sequence, difficulty, speak]);

  const startTest = () => {
    soundEngine.playClick();
    const nextSeq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      nextSeq.push(Math.floor(Math.random() * 9) + 1);
    }
    setSequence(nextSeq);
    setUserInput([]);
    setCorrectCount(0);
    setStage('showing');
    speak(`Watch carefully. Memorize this ${sequenceLength}-step neural sequence.`);
  };

  const handleTileTap = (id: number) => {
    if (stage !== 'recall') return;
    soundEngine.playClick();
    const nextInput = [...userInput, id];
    setUserInput(nextInput);

    if (nextInput.length === sequence.length) {
      let matches = 0;
      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] === nextInput[i]) matches += 1;
      }
      setCorrectCount(matches);
      const perfect = matches === sequence.length;
      const score = Math.round((matches / sequence.length) * (difficulty === 'expert' ? 200 : 150));
      if (perfect) {
        soundEngine.playSuccess();
        speak('Flawless recall! Your short-term memory is razor sharp.');
      } else {
        soundEngine.playError();
        speak(`You remembered ${matches} out of ${sequence.length} nodes correctly.`);
      }
      setStage('result');
      onComplete({
        prediction: `${matches}/${sequence.length} sequence`,
        correct: perfect,
        score,
        xpEarned: perfect ? 90 : Math.max(25, matches * 12),
        perfect,
      });
    }
  };

  const finalScore = Math.round(
    (correctCount / Math.max(1, sequence.length)) * (difficulty === 'expert' ? 200 : 150)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mind Games
        </button>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          {sequenceLength} Nodes · {difficulty}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 sm:p-8 neural-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
              Neural Memory Test
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {stage === 'ready' && 'Memorize the Glowing Sequence'}
              {stage === 'showing' && 'Watch the Pattern Closely...'}
              {stage === 'recall' &&
                `Repeat the Sequence (${userInput.length}/${sequence.length})`}
              {stage === 'result' &&
                (correctCount === sequence.length
                  ? 'Perfect Memory Recall!'
                  : `You Recalled ${correctCount} of ${sequence.length}`)}
            </h1>
          </div>
          {stage !== 'ready' && (
            <button
              type="button"
              onClick={startTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/15 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Sequence
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
          {SYMBOLS.map((sym) => {
            const isLit = activeIndex === sym.id;
            return (
              <button
                key={sym.id}
                type="button"
                disabled={stage !== 'recall'}
                onClick={() => handleTileTap(sym.id)}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-150 ${
                  isLit
                    ? 'bg-cyan-400 border-cyan-300 text-slate-950 scale-[1.03] shadow-[0_0_32px_rgba(6,182,212,0.75)]'
                    : 'bg-white/80 dark:bg-[#0B152E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-cyan-500/60'
                } ${stage === 'recall' ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
              >
                <span className="font-mono text-2xl font-bold tabular-nums">{sym.label}</span>
                <span className="text-[11px] opacity-75 mt-0.5">{sym.name}</span>
              </button>
            );
          })}
        </div>

        {stage === 'ready' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={startTest}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Start Memory Sequence
            </button>
          </div>
        )}

        {stage === 'result' && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Correct sequence:{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-cyan-300">
                {sequence.map((n) => String(n).padStart(2, '0')).join(' → ')}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={startTest}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => onChallengeFriend(finalScore)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
              >
                Challenge Friend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
