import { ArrowRight, Brain, Calendar, Palette, Search, Timer, Zap } from 'lucide-react';
import { AppView, Difficulty } from '../types/app';

interface GamesHubViewProps {
  difficulty: Difficulty;
  onChangeDifficulty: (d: Difficulty) => void;
  onNavigate: (view: AppView) => void;
}

export function GamesHubView({
  difficulty,
  onChangeDifficulty,
  onNavigate,
}: GamesHubViewProps) {
  const catalog = [
    {
      view: 'number-game' as AppView,
      icon: Brain,
      title: 'Number Mind Reading',
      meta:
        difficulty === 'easy'
          ? '1–20 · 4 Questions'
          : difficulty === 'expert'
          ? '1–100 · 5–6 Questions'
          : '1–50 · 4–5 Questions',
      description:
        'Think of any secret number. MIRA narrows every single candidate mathematically and triggers Shock Reveal Mode.',
    },
    {
      view: 'colour-game' as AppView,
      icon: Palette,
      title: 'Colour Prediction',
      meta: '6 Colours · Hidden Lock',
      description:
        'Choose Red, Blue, Green, Yellow, Purple, or Orange. MIRA deduces your hidden colour through visual & emotional cues.',
    },
    {
      view: 'object-game' as AppView,
      icon: Search,
      title: 'Object & Animal Deduction',
      meta: '5 Categories · 50+ Items',
      description:
        'Pick from Animals, Everyday Objects, Food, Vehicles, or Famous Fictional Characters for entropy-guided questioning.',
    },
    {
      view: 'memory-game' as AppView,
      icon: Zap,
      title: 'Neural Memory Test',
      meta:
        difficulty === 'easy'
          ? '4 Nodes'
          : difficulty === 'expert'
          ? '7 Nodes'
          : '5 Nodes',
      description:
        'Memorize the glowing neural sequence and repeat it in exact order to earn the Memory Architect badge.',
    },
    {
      view: 'quick-think' as AppView,
      icon: Timer,
      title: '10-Second Quick Think',
      meta: '5 Rounds · 10s Timer',
      description:
        'High-speed logical and lateral-thinking sprint where every spare second adds bonus points.',
    },
    {
      view: 'daily-mystery' as AppView,
      icon: Calendar,
      title: 'Daily Mystery',
      meta: 'Refreshes Daily · +100 XP',
      description:
        'A fresh riddle and deduction puzzle every day to keep your Mind Reader streak alive.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
            Interactive Experiments
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Explore Mind Games
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Select your mystery difficulty and step into any prediction or cognitive challenge.
          </p>
        </div>

        {/* Difficulty Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/5 self-start md:self-auto">
          {(['easy', 'medium', 'expert'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDifficulty(d)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                difficulty === d
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {catalog.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className="group text-left rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-600/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {item.meta}
                  </span>
                </div>
                <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                Launch Experiment
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
