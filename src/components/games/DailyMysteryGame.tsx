import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react';
import { getDailyMystery } from '../../lib/gameEngines';
import { getTodayKey } from '../../lib/storage';
import { soundEngine } from '../../lib/sound';

interface DailyMysteryGameProps {
  alreadyCompleted: boolean;
  speak: (text: string) => void;
  onComplete: (result: {
    prediction: string;
    correct: boolean;
    score: number;
    xpEarned: number;
  }) => void;
  onBack: () => void;
}

export function DailyMysteryGame({
  alreadyCompleted,
  speak,
  onComplete,
  onBack,
}: DailyMysteryGameProps) {
  const puzzle = getDailyMystery();
  const [clueCount, setClueCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const handleRevealClue = () => {
    if (clueCount < puzzle.clues.length) {
      soundEngine.playClick();
      const next = clueCount + 1;
      setClueCount(next);
      speak(puzzle.clues[next - 1]);
    }
  };

  const handleSelect = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    const isCorrect = option === puzzle.answer;
    if (isCorrect) {
      soundEngine.playSuccess();
      speak(`Brilliant! The answer to today's mystery is ${puzzle.answer}.`);
    } else {
      soundEngine.playError();
      speak(`Close! Today's mystery answer was ${puzzle.answer}.`);
    }
    const score = isCorrect ? Math.max(80, 150 - clueCount * 25) : 30;
    onComplete({
      prediction: puzzle.title,
      correct: isCorrect,
      score,
      xpEarned: isCorrect ? 100 : 35,
    });
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
          Back
        </button>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          Daily Mystery · {getTodayKey()}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 sm:p-8 neural-glow space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
              Today’s Mind Mystery
            </p>
            {alreadyCompleted && selected === null && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed Today
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {puzzle.title}
          </h1>
          <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed pt-2">
            {puzzle.riddle}
          </p>
        </div>

        {/* Clues */}
        {clueCount > 0 && (
          <div className="space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            {puzzle.clues.slice(0, clueCount).map((clue, idx) => (
              <p key={idx} className="text-sm text-slate-700 dark:text-cyan-200">
                <span className="font-mono text-xs mr-2 text-cyan-600 dark:text-cyan-400">
                  Clue {idx + 1}:
                </span>
                {clue}
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {puzzle.options.map((opt) => {
            const isRevealed = selected !== null;
            const isAnswer = opt === puzzle.answer;
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
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          {selected === null ? (
            <button
              type="button"
              onClick={handleRevealClue}
              disabled={clueCount >= puzzle.clues.length}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 disabled:opacity-40 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              {clueCount < puzzle.clues.length
                ? `Reveal Clue (${puzzle.clues.length - clueCount} left)`
                : 'All Clues Revealed'}
            </button>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">{puzzle.explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}
