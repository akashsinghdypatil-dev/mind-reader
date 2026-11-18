import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Lightbulb, RotateCcw } from 'lucide-react';
import {
  EMOJI_RIDDLES,
  EmojiRiddle,
  getRiddleRank,
  RIDDLE_RIGHT_LINES,
  RIDDLE_WRONG_LINES,
} from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface EmojiRiddleGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_RIDDLE = 20;

function pickTenRiddles(): EmojiRiddle[] {
  const pool = [...EMOJI_RIDDLES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUESTIONS_PER_GAME);
}

export function EmojiRiddleGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: EmojiRiddleGameProps) {
  const [riddles, setRiddles] = useState<EmojiRiddle[]>(() => pickTenRiddles());
  const [stage, setStage] = useState<'playing' | 'summary'>('playing');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_RIDDLE);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [feedbackLine, setFeedbackLine] = useState<string>('');

  const current = riddles[index];

  useEffect(() => {
    if (stage !== 'playing' || selectedIdx !== null) return;
    if (timeLeft <= 0) {
      soundEngine.playError();
      setSelectedIdx(-1);
      const line = 'Time’s up! The emojis vanished back into the crystal ball.';
      setFeedbackLine(line);
      onMascot('oops', line);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [stage, timeLeft, selectedIdx, onMascot]);

  const restartGame = () => {
    soundEngine.playClick();
    setRiddles(pickTenRiddles());
    setStage('playing');
    setIndex(0);
    setScore(0);
    setTimeLeft(SECONDS_PER_RIDDLE);
    setSelectedIdx(null);
    setHintUsed(false);
    setFeedbackLine('');
    onMascot('idle', '10 fresh emoji riddles loaded! 20 seconds per riddle. Good luck!');
  };

  const handleUseHint = () => {
    if (hintUsed || selectedIdx !== null) return;
    soundEngine.playClick();
    setHintUsed(true);
    setScore((s) => Math.max(0, s - 1));
    onMascot('thinking', `Hint unlocked (-1 pt): ${current.hint}`);
  };

  const handleChoose = (optIdx: number) => {
    if (selectedIdx !== null || stage !== 'playing') return;
    setSelectedIdx(optIdx);

    const isCorrect = optIdx === current.answerIndex;
    if (isCorrect) {
      soundEngine.playSuccess();
      setScore((s) => s + 1);
      const line = RIDDLE_RIGHT_LINES[index % RIDDLE_RIGHT_LINES.length];
      setFeedbackLine(line);
      onMascot('happy', line);
    } else {
      soundEngine.playError();
      const line = RIDDLE_WRONG_LINES[index % RIDDLE_WRONG_LINES.length];
      setFeedbackLine(line);
      onMascot('oops', `${line} Correct answer: ${current.options[current.answerIndex]}.`);
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (index + 1 >= riddles.length) {
      setStage('summary');
      onGameFinished();
      const rank = getRiddleRank(score);
      if (score >= 6) {
        soundEngine.playRevealChord();
        onConfetti();
        onMascot('happy', `${rank.title}! You scored ${score} out of 10!`);
      } else {
        onMascot('oops', `${rank.title} — ${score} out of 10. Try another batch of 10!`);
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelectedIdx(null);
    setHintUsed(false);
    setFeedbackLine('');
    setTimeLeft(SECONDS_PER_RIDDLE);
  };

  const rank = getRiddleRank(score);

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
          10 Random Riddles · 20s Each
        </span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'playing' && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-mono text-purple-200 tabular-nums">
              <span>
                Riddle {index + 1} / {QUESTIONS_PER_GAME} · Score: <strong className="text-white">{score}</strong>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                  timeLeft <= 5 ? 'text-rose-400' : 'text-cyan-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500'
                }`}
                style={{ width: `${(timeLeft / SECONDS_PER_RIDDLE) * 100}%` }}
              />
            </div>

            {/* Big Emoji Clue Box */}
            <div className="rounded-2xl border border-purple-400/25 bg-[#120828] py-8 px-4 text-center">
              <p className="text-xs font-mono text-purple-300 mb-3">DECODE THIS MOVIE OR PHRASE</p>
              <div className="text-5xl sm:text-6xl tracking-widest select-none">
                {current.emojis}
              </div>
              {hintUsed && (
                <p className="mt-4 text-xs text-amber-300">Hint: {current.hint}</p>
              )}
            </div>

            {/* 4 Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt, optIdx) => {
                const answered = selectedIdx !== null;
                const isAnswer = optIdx === current.answerIndex;
                const isPicked = optIdx === selectedIdx;
                let style =
                  'border-purple-400/25 bg-[#170C35] hover:border-fuchsia-400 text-white';
                if (answered && isAnswer) {
                  style = 'border-emerald-400 bg-emerald-500/20 text-emerald-200';
                } else if (answered && isPicked && !isAnswer) {
                  style = 'border-rose-400 bg-rose-500/20 text-rose-200';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={answered}
                    onClick={() => handleChoose(optIdx)}
                    className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all cursor-pointer disabled:cursor-default ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-purple-400/15 flex flex-wrap items-center justify-between gap-3">
              {selectedIdx === null ? (
                <button
                  type="button"
                  disabled={hintUsed}
                  onClick={handleUseHint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-400/35 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-medium disabled:opacity-40 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {hintUsed ? 'Hint Used (-1 pt)' : 'Show Hint (-1 pt)'}
                </button>
              ) : (
                <>
                  <p className="text-sm text-purple-100">{feedbackLine}</p>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl neon-button text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {index + 1 >= riddles.length ? 'See Final Rank' : 'Next Riddle'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {stage === 'summary' && (
          <div className="text-center py-4 space-y-5">
            <p className="text-xs font-mono text-fuchsia-300">Emoji Riddle Complete</p>
            <div className="font-display text-6xl font-extrabold text-white tabular-nums">
              {score} / {QUESTIONS_PER_GAME}
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-fuchsia-300">
                Rank: {rank.title}
              </h2>
              <p className="text-sm text-purple-200 max-w-md mx-auto">{rank.line}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={restartGame}
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
          </div>
        )}
      </div>
    </div>
  );
}
