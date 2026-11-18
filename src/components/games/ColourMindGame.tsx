import { useState } from 'react';
import { ArrowLeft, EyeOff, RotateCcw } from 'lucide-react';
import {
  COLOURS,
  ColourItem,
  getNextColourQuestion,
} from '../../lib/gameEngines';
import { soundEngine } from '../../lib/sound';
import { ShockRevealOverlay } from '../ShockRevealOverlay';

interface ColourMindGameProps {
  speak: (text: string) => void;
  onComplete: (result: {
    prediction: string;
    correct: boolean;
    score: number;
    xpEarned: number;
  }) => void;
  onChallengeFriend: (score: number) => void;
  onBack: () => void;
}

export function ColourMindGame({
  speak,
  onComplete,
  onChallengeFriend,
  onBack,
}: ColourMindGameProps) {
  const [stage, setStage] = useState<'select' | 'playing' | 'reveal'>('select');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ColourItem[]>(COLOURS);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [trail, setTrail] = useState<string[]>([]);
  const [predicted, setPredicted] = useState<ColourItem | null>(null);
  const [logged, setLogged] = useState(false);

  const resetGame = () => {
    setStage('select');
    setPickedId(null);
    setCandidates(COLOURS);
    setAskedIds([]);
    setTrail([]);
    setPredicted(null);
    setLogged(false);
  };

  const handleLockAndStart = () => {
    soundEngine.playClick();
    setStage('playing');
    const firstQ = getNextColourQuestion(COLOURS, []);
    speak(
      `Your colour is hidden from view. Now focus on its energy. ${
        firstQ?.prompt || 'Does it feel warm or cool?'
      }`
    );
  };

  const currentQuestion =
    stage === 'playing' ? getNextColourQuestion(candidates, askedIds) : null;

  const handleAnswer = (
    optionLabel: string,
    matcher: (c: ColourItem) => boolean
  ) => {
    if (!currentQuestion) return;
    soundEngine.playClick();

    const filtered = candidates.filter(matcher);
    const nextCandidates = filtered.length > 0 ? filtered : candidates;
    const nextAsked = [...askedIds, currentQuestion.id];
    const nextTrail = [
      ...trail,
      `${currentQuestion.prompt} → ${optionLabel} (${nextCandidates.length} left)`,
    ];

    setCandidates(nextCandidates);
    setAskedIds(nextAsked);
    setTrail(nextTrail);

    if (nextCandidates.length <= 1) {
      setPredicted(nextCandidates[0]);
      setStage('reveal');
      return;
    }

    const upcoming = getNextColourQuestion(nextCandidates, nextAsked);
    if (!upcoming) {
      setPredicted(nextCandidates[0]);
      setStage('reveal');
    } else {
      speak(upcoming.prompt);
    }
  };

  const score = 120;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mind Games
        </button>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          6 Colours · Decision Narrowing
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 sm:p-8 neural-glow">
        {stage === 'select' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                Colour Prediction Experiment
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-balance">
                Secretly choose one of these six colours
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Tap a colour to commit it to memory (we hide it immediately and never peek—MIRA only
                uses your answers to deduce it).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {COLOURS.map((col) => {
                const isSelected = pickedId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPickedId(col.id);
                    }}
                    className={`group relative rounded-xl p-5 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-[1.01]'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30'
                    } bg-white/80 dark:bg-[#0B152E]`}
                  >
                    <div
                      className="w-full h-20 rounded-lg mb-3 transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{
                        backgroundColor: col.hex,
                        boxShadow: `0 10px 28px -8px ${col.glow}`,
                      }}
                    />
                    <div className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                      {col.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {col.vibe}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLockAndStart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                {pickedId ? 'Hide My Selection & Begin' : 'I Have One in Mind — Begin'}
              </button>
            </div>
          </div>
        )}

        {stage === 'playing' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Clue {askedIds.length + 1}</span>
              <span>{candidates.length} colours still possible</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {currentQuestion.prompt}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleAnswer(opt.label, opt.matches)}
                  className="text-left p-5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all cursor-pointer"
                >
                  <div className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {opt.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Choose Again
              </button>
            </div>
          </div>
        )}
      </div>

      <ShockRevealOverlay
        open={stage === 'reveal' && predicted !== null}
        gameTitle="Colour Mind Reading"
        prediction={predicted?.name || ''}
        subtitle={predicted ? `${predicted.vibe}. ${predicted.trait}` : ''}
        accentHex={predicted?.hex || '#06B6D4'}
        confidence={100}
        deductionSteps={trail}
        score={score}
        speak={speak}
        onConfirmAccuracy={(wasCorrect) => {
          if (logged) return;
          setLogged(true);
          onComplete({
            prediction: predicted?.name || '',
            correct: wasCorrect,
            score: wasCorrect ? score : 50,
            xpEarned: wasCorrect ? 75 : 30,
          });
        }}
        onPlayAgain={() => {
          soundEngine.playClick();
          resetGame();
        }}
        onChallengeFriend={() => onChallengeFriend(score)}
        onClose={() => resetGame()}
      />
    </div>
  );
}
