import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { FOODS, FoodItem } from '../../data/magicGameData';
import { soundEngine } from '../../lib/sound';
import { MascotMood } from '../WizardMascot';

interface FoodMindGameProps {
  onBack: () => void;
  onGameFinished: () => void;
  onConfetti: () => void;
  onMascot: (mood: MascotMood, msg: string) => void;
}

export function FoodMindGame({
  onBack,
  onGameFinished,
  onConfetti,
  onMascot,
}: FoodMindGameProps) {
  const [stage, setStage] = useState<'intro' | 'question' | 'reveal'>('intro');
  const [bitIndex, setBitIndex] = useState(0); // 0, 1, 2, 3
  const [binarySum, setBinarySum] = useState(0);
  const [locked, setLocked] = useState(false);

  const resetGame = () => {
    soundEngine.playClick();
    setStage('intro');
    setBitIndex(0);
    setBinarySum(0);
    setLocked(false);
    onMascot('idle', 'Pick one of the 16 delicious foods in your head. Do not whisper it!');
  };

  const handleStart = () => {
    soundEngine.playClick();
    setStage('question');
    setBitIndex(0);
    setBinarySum(0);
    setLocked(false);
    onMascot('thinking', 'Question 1 of 4: Scan these 8 foods carefully. Is your secret favourite here?');
  };

  const currentGroup: FoodItem[] = FOODS.filter((f) => ((f.id >> bitIndex) & 1) === 1);

  const handleAnswer = (isYes: boolean) => {
    if (locked || stage !== 'question') return;
    setLocked(true);
    soundEngine.playClick();

    const nextSum = isYes ? binarySum | (1 << bitIndex) : binarySum;

    if (bitIndex >= 3) {
      setBinarySum(nextSum);
      setStage('reveal');
      soundEngine.playRevealChord();
      onConfetti();
      onGameFinished();
      const match = FOODS[nextSum];
      onMascot('shocked', `Aha! My crystal ball smells ${match.name} from a mile away!`);
      setLocked(false);
      return;
    }

    const nextBit = bitIndex + 1;
    setBinarySum(nextSum);
    setBitIndex(nextBit);
    const lines = [
      'Interesting! My stomach—I mean my crystal ball—is narrowing it down.',
      'Half the menu just vanished in a puff of neon smoke!',
      'Final question! One last YES or NO and your craving is mine.',
    ];
    onMascot('thinking', lines[bitIndex] || 'Scanning your taste buds...');
    window.setTimeout(() => setLocked(false), 180);
  };

  const revealedFood = FOODS[binarySum] ?? FOODS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          16 Foods · 4 Binary Questions
        </span>
      </div>

      <div className="rounded-3xl magic-card magic-glow p-6 sm:p-8">
        {stage === 'intro' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-fuchsia-300">Guess My Favourite Food</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-balance">
                Secretly pick ONE food from this menu
              </h1>
              <p className="text-sm text-purple-200/85 max-w-xl mx-auto">
                Keep it locked in your mind. I will ask you exactly 4 YES/NO questions and reveal
                your exact craving with 100% accuracy.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FOODS.map((food) => (
                <div
                  key={food.id}
                  className="rounded-2xl border border-purple-400/20 bg-[#140A2D]/85 p-3.5 flex items-center gap-3"
                >
                  <span className="text-2xl shrink-0" role="img" aria-label={food.name}>
                    {food.emoji}
                  </span>
                  <span className="text-sm font-medium text-purple-50 truncate">{food.name}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="px-7 py-3.5 rounded-xl neon-button text-white font-semibold text-sm cursor-pointer"
              >
                I Picked My Food — Read My Mind
              </button>
            </div>
          </div>
        )}

        {stage === 'question' && (
          <motion.div
            key={bitIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-mono text-purple-200/80">
              <span>Question {bitIndex + 1} of 4</span>
              <span>8 of 16 foods shown</span>
            </div>

            <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
                style={{ width: `${((bitIndex + 1) / 4) * 100}%` }}
              />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center">
              Is your secret food in this group?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentGroup.map((food) => (
                <div
                  key={food.id}
                  className="rounded-2xl border border-fuchsia-400/30 bg-purple-950/70 p-4 flex flex-col items-center justify-center text-center gap-1.5"
                >
                  <span className="text-4xl" role="img" aria-label={food.name}>
                    {food.emoji}
                  </span>
                  <span className="text-sm font-semibold text-white">{food.name}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 max-w-md mx-auto">
              <button
                type="button"
                disabled={locked}
                onClick={() => handleAnswer(true)}
                className="py-4 px-6 rounded-xl neon-button text-white font-display text-lg font-bold cursor-pointer disabled:opacity-50"
              >
                YES, It’s Here
              </button>
              <button
                type="button"
                disabled={locked}
                onClick={() => handleAnswer(false)}
                className="py-4 px-6 rounded-xl border border-purple-400/35 bg-purple-950/80 hover:bg-purple-900/80 text-purple-100 font-display text-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                NO, Not Here
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-5"
          >
            <p className="text-xs font-mono text-fuchsia-300">Mind Reading Complete</p>
            <div className="text-7xl sm:text-8xl" role="img" aria-label={revealedFood.name}>
              {revealedFood.emoji}
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
              {revealedFood.name}!
            </h2>
            <p className="text-base sm:text-lg text-purple-100 max-w-lg mx-auto leading-relaxed">
              {revealedFood.roast}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
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
