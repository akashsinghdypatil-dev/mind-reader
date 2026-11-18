import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Brain,
  Calendar,
  Flame,
  Mic,
  Palette,
  Search,
  Timer,
  Zap,
} from 'lucide-react';
import { AppView, UserProgress } from '../types/app';
import { getDailyMystery } from '../lib/gameEngines';
import { getBadgesWithStatus, getTodayKey } from '../lib/storage';

const HERO_BRAIN_IMG = '/src/assets/images/holographic_brain_hero_1794982972116.jpg';
const MIRA_ORB_IMG = '/src/assets/images/mira_voice_orb_1794982972338.jpg';

interface HomeViewProps {
  progress: UserProgress;
  onNavigate: (view: AppView) => void;
  onOpenMiraDrawer: () => void;
}

export function HomeView({ progress, onNavigate, onOpenMiraDrawer }: HomeViewProps) {
  const daily = getDailyMystery();
  const dailyDone = progress.dailyCompletedDate === getTodayKey();
  const badges = getBadgesWithStatus(progress);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  const games = [
    {
      view: 'number-game' as AppView,
      icon: Brain,
      title: 'Number Mind Reading',
      meta: '1–50 · 4–5 Questions',
      description: 'Hide a secret number and watch MIRA isolate it with mathematical precision.',
    },
    {
      view: 'colour-game' as AppView,
      icon: Palette,
      title: 'Colour Prediction',
      meta: '6 Hues · Visual Logic',
      description: 'Lock in one of six vivid colours and test whether MIRA can deduce your choice.',
    },
    {
      view: 'object-game' as AppView,
      icon: Search,
      title: 'Object & Animal Deduction',
      meta: '5 Categories · Decision Tree',
      description: 'Think of an animal, food, vehicle, object, or famous character.',
    },
    {
      view: 'memory-game' as AppView,
      icon: Zap,
      title: 'Neural Memory Test',
      meta: 'Sequence Recall',
      description: 'Track a glowing synaptic sequence and repeat it without a single slip.',
    },
    {
      view: 'quick-think' as AppView,
      icon: Timer,
      title: 'Quick Think Sprint',
      meta: '10 Seconds · Rapid Logic',
      description: 'Five lateral-thinking puzzles under an unforgiving 10-second countdown.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-24 pb-8">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <p className="text-sm font-medium text-blue-600 dark:text-cyan-400">
            Can I Guess What’s Inside Your Mind?
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.08] text-balance">
            Think It. Hide It.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 bg-clip-text text-transparent">
              I’ll Guess It.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            An extraordinary experiment where technology meets the mystery of your mind. Choose a
            secret thought, answer a handful of clever signals, and experience MIRA’s dramatic
            prediction reveal.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('number-game')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-[0_10px_30px_-10px_rgba(37,99,235,0.65)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Mind Reading
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('mira-chat')}
              className="px-5 py-3.5 rounded-xl border border-slate-300 dark:border-cyan-500/35 bg-white/75 dark:bg-white/5 hover:border-cyan-500 text-slate-900 dark:text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Talk to AI
            </button>
            <button
              type="button"
              onClick={() => onNavigate('games')}
              className="px-5 py-3.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Mind Games
            </button>
          </div>
        </motion.div>

        {/* Holographic Brain Focal Anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden border border-slate-200/80 dark:border-cyan-500/30 bg-[#050C1D] neural-glow animate-float-slow">
            <img
              src={HERO_BRAIN_IMG}
              alt="Glowing holographic human brain with electric blue neural pathways"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040812]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 inset-x-5 flex items-center justify-between text-xs text-slate-200">
              <span className="font-display font-medium">Neural Deduction Engine</span>
              <span className="font-mono text-cyan-300">MIRA Ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            No hidden tracking and no random guesses—every prediction is calculated from real
            decision trees and adaptive mathematical narrowing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01. Lock a Secret Thought',
              body: 'Silently pick a number, colour, animal, everyday object, or fictional character. Keep it entirely in your head.',
            },
            {
              step: '02. Answer 4–5 Clever Signals',
              body: 'Each answer eliminates half or more of the remaining search space using information-gain logic and voice guidance.',
            },
            {
              step: '03. Experience the Shock Reveal',
              body: 'Watch the neural brain ignite with a 3-2-1 countdown as MIRA announces your hidden answer aloud and shows her proof.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 space-y-2.5"
            >
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {item.step}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AVAILABLE MIND GAMES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Available Mind Games
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Five interactive experiments designed to test logic, memory, and deduction.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('games')}
            className="text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline self-start sm:self-auto cursor-pointer"
          >
            View All Experiments →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.view}
                type="button"
                onClick={() => onNavigate(g.view)}
                className="group text-left rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {g.meta}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {g.description}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                  Play Now
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI VOICE ASSISTANT SPOTLIGHT */}
      <section className="rounded-3xl border border-slate-200 dark:border-cyan-500/25 glass-surface p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border border-cyan-500/35 shadow-[0_0_60px_-10px_rgba(6,182,212,0.45)]">
            <img
              src={MIRA_ORB_IMG}
              alt="MIRA AI Voice Assistant"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
            Interactive AI Voice Agent
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Meet MIRA — Your Mysterious AI Mind Reader
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Speak naturally into your microphone or type in live mystery chat. MIRA listens,
            responds with natural spoken voice, remembers your conversation, and guides you through
            live mind games, riddles, and memory tests.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('mira-chat')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Open MIRA Studio
            </button>
            <button
              type="button"
              onClick={onOpenMiraDrawer}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Quick Voice Drawer
            </button>
          </div>
        </div>
      </section>

      {/* DAILY CHALLENGE & YOUR ACHIEVEMENTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenge */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-cyan-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Daily Challenge · {getTodayKey()}
              </span>
              <span>{dailyDone ? 'Completed' : '+100 XP'}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {daily.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {daily.riddle}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('daily-mystery')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              {dailyDone ? 'Review Today’s Mystery' : 'Solve Daily Mystery'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Your Achievements */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Your Achievements
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                <Flame className="w-4 h-4" />
                {progress.streak}-day streak
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl bg-slate-100/80 dark:bg-white/5 p-3.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Level</p>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {progress.level}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100/80 dark:bg-white/5 p-3.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">XP</p>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {progress.xp}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100/80 dark:bg-white/5 p-3.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Badges</p>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {unlockedBadges.length}/{badges.length}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-500 shrink-0" />
              {unlockedBadges.length > 0
                ? `Latest badge: ${unlockedBadges[unlockedBadges.length - 1].name}`
                : 'Complete any mind-reading game to unlock First Mind Connection.'}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
            >
              View Profile & History
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
