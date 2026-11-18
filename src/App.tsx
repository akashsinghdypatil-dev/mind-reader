import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from './lib/sound';
import { ConfettiBurst } from './components/ConfettiBurst';
import { MascotMood, WizardMascot } from './components/WizardMascot';
import { TestModeModal } from './components/TestModeModal';
import { NumberMindGame } from './components/games/NumberMindGame';
import { FoodMindGame } from './components/games/FoodMindGame';
import { ColourTrapGame } from './components/games/ColourTrapGame';
import { LoveMeterGame } from './components/games/LoveMeterGame';
import { FuturePredictorGame } from './components/games/FuturePredictorGame';
import { EmojiRiddleGame } from './components/games/EmojiRiddleGame';

import { ColourMindReaderGame } from './components/games/ColourMindReaderGame';

type Screen =
  | 'home'
  | 'number'
  | 'colour-mind'
  | 'food'
  | 'colour-trap'
  | 'love-meter'
  | 'future'
  | 'emoji-riddle';

const GAMES_PLAYED_KEY = 'mind_reader_games_played_v2';

const GAME_CARDS: {
  id: Screen;
  emoji: string;
  title: string;
  meta: string;
  description: string;
}[] = [
  {
    id: 'number',
    emoji: '🔢',
    title: 'Number Mind Reader',
    meta: '1–50 · 4–5 Questions',
    description: 'Secretly pick any number from 1 to 50. Watch deterministic math lock onto it.',
  },
  {
    id: 'colour-mind',
    emoji: '🌈',
    title: 'Colour Mind Reader',
    meta: '16 Colours · 4 YES/NO',
    description: 'Hide 1 of 16 colours in your head. 4 binary groups reveal it & transform the screen.',
  },
  {
    id: 'food',
    emoji: '🍕',
    title: 'Guess My Favourite Food',
    meta: '16 Foods · 4 YES/NO',
    description: 'Hide your favourite snack from 16 dishes. 4 binary groups reveal it + a roast.',
  },
  {
    id: 'colour-trap',
    emoji: '🎨',
    title: 'Colour Trap',
    meta: '30s · 3 Lives · Speed Ramp',
    description: 'Tap the INK colour, never the written word! Earn ranks up to Colour Wizard.',
  },
  {
    id: 'love-meter',
    emoji: '💖',
    title: 'Love Compatibility Meter',
    meta: 'Fixed Formula · Shareable',
    description: 'Enter two names in any order for a deterministic percentage & funny verdict.',
  },
  {
    id: 'future',
    emoji: '🔮',
    title: 'Future Predictor',
    meta: '27 Prophecies · Lucky Stats',
    description: 'Answer 3 silly life questions for a suspiciously specific prophecy & lucky colour.',
  },
  {
    id: 'emoji-riddle',
    emoji: '🎬',
    title: 'Emoji Riddle',
    meta: '20 Riddles · 10 Per Game',
    description: 'Decode Bollywood, Hollywood & famous phrases in 20 seconds with hints & ranks.',
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [muted, setMuted] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GAMES_PLAYED_KEY);
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });
  const [colourHighScore, setColourHighScore] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [testModeOpen, setTestModeOpen] = useState(false);
  const [revealBgHex, setRevealBgHex] = useState<string | null>(null);
  const [mascot, setMascot] = useState<{ mood: MascotMood; message: string }>({
    mood: 'idle',
    message: 'Welcome! Pick any of the 7 magic games below—zero fake AI guessing, 100% logic!',
  });

  useEffect(() => {
    soundEngine.setEnabled(!muted);
  }, [muted]);

  const handleMascot = useCallback((mood: MascotMood, message: string) => {
    setMascot({ mood, message });
  }, []);

  const triggerConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  const incrementGamesPlayed = useCallback(() => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(GAMES_PLAYED_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const openScreen = (next: Screen) => {
    soundEngine.playClick();
    setRevealBgHex(null);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (next === 'home') {
      handleMascot('idle', 'Back at the magic arcade! Which mind trick shall we try next?');
    } else if (next === 'number') {
      handleMascot('idle', 'Think of a number between 1 and 50. Keep it secret!');
    } else if (next === 'colour-mind') {
      handleMascot('idle', 'Secretly pick ONE of the 16 colours and keep it locked in your head!');
    } else if (next === 'food') {
      handleMascot('idle', 'Stare at the 16 foods and secretly pick your #1 favourite!');
    } else if (next === 'colour-trap') {
      handleMascot('idle', 'Ready to outsmart your own eyes? Remember: tap the INK colour!');
    } else if (next === 'love-meter') {
      handleMascot('idle', 'Enter two names and let pure math measure the sparks!');
    } else if (next === 'future') {
      handleMascot('idle', '3 quick questions stand between you and your hilarious destiny.');
    } else if (next === 'emoji-riddle') {
      handleMascot('idle', '10 random emoji riddles! 20 seconds each—use a hint if you get stuck.');
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col text-purple-50 overflow-x-hidden transition-colors duration-700 ease-out"
      style={{ backgroundColor: revealBgHex ?? '#0B061A' }}
    >
      {/* Subtle Neon Magic Ambient Gradients (hidden during colour reveal so the revealed colour shines cleanly) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          revealBgHex ? 'opacity-20' : 'opacity-100'
        }`}
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(168, 85, 247, 0.22), transparent 42%), radial-gradient(circle at 82% 20%, rgba(236, 72, 153, 0.16), transparent 38%), radial-gradient(circle at 50% 90%, rgba(56, 189, 248, 0.12), transparent 45%)',
        }}
      />

      <ConfettiBurst triggerKey={confettiKey} />

      {/* Top Navigation Bar — Clean 3-Zone Layout */}
      <header className="sticky top-0 z-30 border-b border-purple-400/15 bg-[#0B061A]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand */}
          <button
            type="button"
            onClick={() => openScreen('home')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="text-2xl" aria-hidden="true">
              🔮
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              MIND READER
            </span>
          </button>

          {/* Zone 2: Clean Nav Actions */}
          <nav className="flex items-center gap-5 text-sm font-medium">
            <button
              type="button"
              onClick={() => openScreen('home')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                screen === 'home' ? 'text-fuchsia-300' : 'text-purple-200 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setTestModeOpen(true);
              }}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Test Mode
            </button>
          </nav>

          {/* Zone 3: Mute Toggle */}
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-400/25 bg-purple-950/70 hover:bg-purple-900/70 text-xs font-semibold text-purple-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-fuchsia-300" />}
            <span className="hidden sm:inline">{muted ? 'Muted' : 'Sound On'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Reactive Wizard Mascot */}
        <WizardMascot mood={mascot.mood} message={mascot.message} />

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {screen === 'home' && (
              <div className="space-y-8">
                {/* Hero Header */}
                <section className="text-center space-y-4 pt-2">
                  <p className="text-xs font-mono text-fuchsia-300 tabular-nums">
                    Games played: {gamesPlayed} · 100% Deterministic Magic
                  </p>
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance">
                    Think It. Hide It.{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                      I’ll Guess It.
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-purple-200/85 max-w-xl mx-auto">
                    Seven mind-bending games powered by binary elimination, fixed formulas, and
                    verified riddles—zero backend, zero API keys, instant fun on mobile & desktop.
                  </p>
                </section>

                {/* 6 Big Game Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {GAME_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => openScreen(card.id)}
                      className="group text-left rounded-3xl magic-card p-6 hover:border-fuchsia-400/60 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span
                            className="w-12 h-12 rounded-2xl bg-purple-900/70 border border-purple-400/25 flex items-center justify-center text-2xl"
                            aria-hidden="true"
                          >
                            {card.emoji}
                          </span>
                          <span className="text-xs font-mono text-purple-300/80">{card.meta}</span>
                        </div>
                        <h2 className="font-display text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                          {card.title}
                        </h2>
                        <p className="mt-2 text-sm text-purple-200/80 leading-relaxed">
                          {card.description}
                        </p>
                      </div>

                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-fuchsia-300">
                        Play Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {screen === 'number' && (
              <NumberMindGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}

            {screen === 'colour-mind' && (
              <ColourMindReaderGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
                onRevealBgChange={setRevealBgHex}
              />
            )}

            {screen === 'food' && (
              <FoodMindGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}

            {screen === 'colour-trap' && (
              <ColourTrapGame
                sessionHighScore={colourHighScore}
                onUpdateHighScore={(s) => setColourHighScore((prev) => Math.max(prev, s))}
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}

            {screen === 'love-meter' && (
              <LoveMeterGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}

            {screen === 'future' && (
              <FuturePredictorGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}

            {screen === 'emoji-riddle' && (
              <EmojiRiddleGame
                onBack={() => openScreen('home')}
                onGameFinished={incrementGamesPlayed}
                onConfetti={triggerConfetti}
                onMascot={handleMascot}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 border-t border-purple-400/15 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-300/75">
          <span>MIND READER · 7 Deterministic Magic Games</span>
          <span className="font-mono tabular-nums">Games played: {gamesPlayed}</span>
        </div>
      </footer>

      <TestModeModal open={testModeOpen} onClose={() => setTestModeOpen(false)} />
    </div>
  );
}
