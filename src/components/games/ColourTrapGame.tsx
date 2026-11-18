import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, RotateCcw, Trophy } from 'lucide-react';
import {
  COLOUR_TRAP_COLOURS,
  getColourTrapRank,
  TrapColour,
} from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface ColourTrapGameProps {
  sessionHighScore: number;
  onUpdateHighScore: (score: number) => void;
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

interface TrapRound {
  word: TrapColour;
  ink: TrapColour;
  options: TrapColour[];
}

function generateRound(): TrapRound {
  const pool = [...COLOUR_TRAP_COLOURS];
  const wordIndex = Math.floor(Math.random() * pool.length);
  const word = pool[wordIndex];

  // Ink colour MUST differ from the written word
  const inkCandidates = pool.filter((c) => c.id !== word.id);
  const ink = inkCandidates[Math.floor(Math.random() * inkCandidates.length)];

  // Build 4 unique buttons containing ink + word + 2 distractors
  const others = pool.filter((c) => c.id !== word.id && c.id !== ink.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const options = [ink, word, others[0], others[1]];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { word, ink, options };
}

export function ColourTrapGame({
  sessionHighScore,
  onUpdateHighScore,
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: ColourTrapGameProps) {
  const [stage, setStage] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState<TrapRound>(() => generateRound());
  const [roundProgress, setRoundProgress] = useState(100);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const endGame = useCallback(
    (finalScore: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStage('over');
      onUpdateHighScore(finalScore);
      onGameFinished();
      const rank = getColourTrapRank(finalScore);
      if (finalScore >= 13) {
        soundEngine.playRevealChord();
        onConfetti();
        onMascot('happy', `Rank unlocked: ${rank.title}! ${rank.line}`);
      } else {
        soundEngine.playSuccess();
        onMascot('oops', `Time’s up! You earned "${rank.title}". Ready for revenge?`);
      }
    },
    [onConfetti, onGameFinished, onMascot, onUpdateHighScore]
  );

  // Main 30-second countdown timer
  useEffect(() => {
    if (stage !== 'playing') return;
    if (timeLeft <= 0) {
      endGame(scoreRef.current);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [stage, timeLeft, endGame]);

  // Speed-scaling per-word timer (gets faster as score rises!)
  useEffect(() => {
    if (stage !== 'playing') return;
    const durationMs = Math.max(1250, 3800 - score * 115);
    const startTime = performance.now();
    setRoundProgress(100);

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setRoundProgress(pct);
      if (elapsed >= durationMs) {
        window.clearInterval(interval);
        soundEngine.playError();
        const nextLives = livesRef.current - 1;
        livesRef.current = nextLives;
        setLives(nextLives);
        setFeedback('wrong');
        onMascot('oops', 'Too slow! The colour trap snagged a life!');
        if (nextLives <= 0) {
          endGame(scoreRef.current);
        } else {
          setRound(generateRound());
        }
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [stage, round, score, endGame, onMascot]);

  const startGame = () => {
    soundEngine.playClick();
    finishedRef.current = false;
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setFeedback('none');
    setRound(generateRound());
    setStage('playing');
    onMascot('thinking', 'Tap the INK colour, NOT the word! Speed increases as you score.');
  };

  const handleTap = (choice: TrapColour) => {
    if (stage !== 'playing' || finishedRef.current) return;

    if (choice.id === round.ink.id) {
      soundEngine.playSuccess();
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
      setFeedback('correct');
      if (nextScore === 10) {
        onMascot('happy', '10 points! Turning up the magic speed!');
      } else if (nextScore === 21) {
        onMascot('shocked', '21+! You have entered Colour Wizard territory!');
      }
      setRound(generateRound());
    } else {
      soundEngine.playError();
      const nextLives = livesRef.current - 1;
      livesRef.current = nextLives;
      setLives(nextLives);
      setFeedback('wrong');
      onMascot('oops', `Trapped! The ink was ${round.ink.name}, not ${choice.name}.`);
      if (nextLives <= 0) {
        endGame(scoreRef.current);
      } else {
        setRound(generateRound());
      }
    }
  };

  const rank = getColourTrapRank(score);
  const speedMultiplier = (1 + score * 0.08).toFixed(1);

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
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 tabular-nums">
          <Trophy className="w-3.5 h-3.5" />
          Session Best: {sessionHighScore}
        </span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'ready' && (
          <div className="text-center py-4 space-y-5">
            <p className="text-xs font-medium text-fuchsia-300">Colour Trap</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-balance">
              Tap the INK colour — ignore the word!
            </h1>
            <p className="text-sm text-purple-200/85 max-w-md mx-auto">
              You have 30 seconds and 3 lives. Every correct tap gives +1 point and speeds up the
              trap. Don’t let your brain read the word!
            </p>
            <div className="py-4 rounded-2xl bg-[#13082A] border border-purple-400/20 max-w-xs mx-auto">
              <p className="text-xs text-purple-300 mb-1">Example: Tap BLUE</p>
              <p className="font-display text-4xl font-extrabold" style={{ color: '#38BDF8' }}>
                RED
              </p>
            </div>
            <button
              type="button"
              onClick={startGame}
              className="px-7 py-3.5 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
            >
              Start 30-Second Challenge
            </button>
          </div>
        )}

        {stage === 'playing' && (
          <div className="space-y-6">
            {/* HUD */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-1.5" aria-label={`${lives} lives remaining`}>
                {[0, 1, 2].map((idx) => (
                  <Heart
                    key={idx}
                    className={`w-5 h-5 transition-all ${
                      idx < lives ? 'text-rose-500 fill-rose-500' : 'text-purple-900'
                    }`}
                  />
                ))}
              </div>
              <div className="font-mono text-xs text-purple-200 tabular-nums">
                Score: <strong className="text-white text-base">{score}</strong> · Speed{' '}
                {speedMultiplier}x
              </div>
              <div
                className={`font-mono text-base font-bold tabular-nums ${
                  timeLeft <= 6 ? 'text-rose-400' : 'text-cyan-300'
                }`}
              >
                {timeLeft}s
              </div>
            </div>

            {/* Per-word speed bar */}
            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-rose-500 transition-all duration-75"
                style={{ width: `${roundProgress}%` }}
              />
            </div>

            {/* Word Display */}
            <motion.div
              key={`${round.word.id}-${round.ink.id}-${score}-${lives}`}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.14 }}
              className={`rounded-2xl py-10 px-4 text-center border bg-[#110726] transition-colors ${
                feedback === 'wrong'
                  ? 'border-rose-500/60'
                  : feedback === 'correct'
                  ? 'border-emerald-400/50'
                  : 'border-purple-400/20'
              }`}
            >
              <p className="text-xs font-mono text-purple-300/80 mb-2">TAP THE INK COLOUR</p>
              <div
                className="font-display text-6xl sm:text-7xl font-extrabold tracking-wide select-none"
                style={{ color: round.ink.hex }}
              >
                {round.word.name}
              </div>
            </motion.div>

            {/* 4 Colour Buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              {round.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTap(opt)}
                  className="py-4 px-5 rounded-xl font-display text-lg font-bold text-white border border-white/15 shadow-lg transition-transform active:scale-95 hover:brightness-110 cursor-pointer"
                  style={{ backgroundColor: opt.buttonBg }}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'over' && (
          <div className="text-center py-4 space-y-5">
            <p className="text-xs font-mono text-fuchsia-300">Colour Trap Complete</p>
            <div className="font-display text-6xl font-extrabold text-white tabular-nums">
              {score} pts
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-fuchsia-300">
                Rank: {rank.title}
              </h2>
              <p className="text-sm text-purple-200 max-w-md mx-auto">{rank.line}</p>
            </div>
            <p className="text-xs font-mono text-amber-300 tabular-nums">
              Session High Score: {Math.max(sessionHighScore, score)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startGame}
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
