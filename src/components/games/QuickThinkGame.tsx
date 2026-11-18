import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import { QUICK_THINK_BANK } from '../../lib/gameEngines';
import { soundEngine } from '../../lib/sound';

interface QuickThinkGameProps {
  speak: (text: string) => void;
  onComplete: (result: {
    prediction: string;
    correct: boolean;
    score: number;
    xpEarned: number;
    solvedCount: number;
  }) => void;
  onChallengeFriend: (score: number) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;
const SECONDS_PER_QUESTION = 10;

export function QuickThinkGame({
  speak,
  onComplete,
  onChallengeFriend,
  onBack,
}: QuickThinkGameProps) {
  const [runSeed, setRunSeed] = useState(0);
  const questions = useMemo(() => {
    const copy = [...QUICK_THINK_BANK];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, TOTAL_ROUNDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runSeed]);

  const [stage, setStage] = useState<'ready' | 'playing' | 'summary'>('ready');
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  const current = questions[index];

  useEffect(() => {
    if (stage !== 'playing' || selected !== null) return;
    if (timeLeft <= 0) {
      soundEngine.playError();
      setSelected('__timeout__');
      return;
    }
    const timer = window.setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [stage, timeLeft, selected]);

  const startRun = () => {
    soundEngine.playClick();
    setRunSeed((s) => s + 1);
    setIndex(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setSelected(null);
    setCorrectCount(0);
    setScore(0);
    setStage('playing');
    speak('Quick Think activated. You have 10 seconds per challenge. Trust your sharp instinct.');
  };

  const handleChoose = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    const isCorrect = option === current.answer;
    if (isCorrect) {
      soundEngine.playSuccess();
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 30 + timeLeft * 4);
    } else {
      soundEngine.playError();
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (index + 1 >= TOTAL_ROUNDS) {
      setStage('summary');
      speak(`Time complete. You solved ${correctCount} out of ${TOTAL_ROUNDS} rapid-fire challenges.`);
      onComplete({
        prediction: `${correctCount}/${TOTAL_ROUNDS} solved`,
        correct: correctCount >= 3,
        score,
        xpEarned: 35 + correctCount * 20,
        solvedCount: correctCount,
      });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTimeLeft(SECONDS_PER_QUESTION);
    }
  };

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
          10-Second Logic Sprint
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 sm:p-8 neural-glow">
        {stage === 'ready' && (
          <div className="text-center py-6 space-y-5">
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Quick Think</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-balance">
              5 Logical Challenges · 10 Seconds Each
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Beat the clock on lateral thinking, number patterns, and sharp cognitive puzzles.
              Faster answers earn bonus points.
            </p>
            <button
              type="button"
              onClick={startRun}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Start 10-Second Sprint
            </button>
          </div>
        )}

        {stage === 'playing' && current && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Challenge {index + 1} of {TOTAL_ROUNDS} · Score {score}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums ${
                  timeLeft <= 3 ? 'text-rose-500' : 'text-cyan-600 dark:text-cyan-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  timeLeft <= 3 ? 'bg-rose-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
              />
            </div>

            <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {current.prompt}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => {
                const isRevealed = selected !== null;
                const isAnswer = opt === current.answer;
                const isPicked = opt === selected;
                let stateClass =
                  'border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-cyan-500';
                if (isRevealed && isAnswer) {
                  stateClass = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
                } else if (isRevealed && isPicked && !isAnswer) {
                  stateClass = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isRevealed}
                    onClick={() => handleChoose(opt)}
                    className={`p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${stateClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selected === '__timeout__' ? 'Time up! ' : ''}
                  {current.explanation}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {index + 1 >= TOTAL_ROUNDS ? 'See Final Score' : 'Next Challenge'}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'summary' && (
          <div className="text-center py-6 space-y-5">
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Sprint Complete</p>
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white tabular-nums">
              {score} Points
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You solved <span className="font-mono font-semibold">{correctCount}</span> out of{' '}
              <span className="font-mono font-semibold">{TOTAL_ROUNDS}</span> challenges under the
              10-second timer.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startRun}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                type="button"
                onClick={() => onChallengeFriend(score)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium cursor-pointer"
              >
                Challenge a Friend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
