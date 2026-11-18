import { Award, Flame, Moon, RotateCcw, Sun, Volume2, VolumeX } from 'lucide-react';
import { AppSettings, Difficulty, UserProgress } from '../types/app';
import { getBadgesWithStatus } from '../lib/storage';

interface ProfileViewProps {
  progress: UserProgress;
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetProgress: () => void;
}

export function ProfileView({
  progress,
  settings,
  onUpdateSettings,
  onResetProgress,
}: ProfileViewProps) {
  const badges = getBadgesWithStatus(progress);
  const accuracy =
    progress.totalGames > 0
      ? Math.round((progress.correctPredictions / progress.totalGames) * 100)
      : 0;
  const xpIntoLevel = progress.xp % 250;
  const xpPercent = Math.round((xpIntoLevel / 250) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header + Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
            Achievements & Mind Profile
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            Level {progress.level} Mind Explorer
          </h1>
          <div className="mt-3 max-w-sm">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 tabular-nums">
              <span>{progress.xp} XP Total</span>
              <span>{250 - xpIntoLevel} XP to Level {progress.level + 1}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-mono text-slate-600 dark:text-cyan-300 tabular-nums">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{progress.streak}-day streak</span>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Games Played</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {progress.totalGames}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Prediction Accuracy</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {accuracy}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Personal Best Score</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {progress.bestScore}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Badges Unlocked</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {badges.filter((b) => b.unlocked).length}/{badges.length}
          </p>
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 space-y-5">
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          Experience Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mystery Difficulty
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
              {(['easy', 'medium', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onUpdateSettings({ difficulty: d })}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer ${
                    settings.difficulty === d
                      ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme Mode</p>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
              className="w-full py-2 px-3.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B152E] text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between cursor-pointer"
            >
              <span>{settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sound Effects</p>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
              className="w-full py-2 px-3.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B152E] text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between cursor-pointer"
            >
              <span>{settings.soundEffects ? 'FX On' : 'FX Off'}</span>
              {settings.soundEffects ? (
                <Volume2 className="w-4 h-4 text-cyan-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Ambient Neural Hum
            </p>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ambientAudio: !settings.ambientAudio })}
              className="w-full py-2 px-3.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B152E] text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between cursor-pointer"
            >
              <span>{settings.ambientAudio ? 'Ambient On' : 'Ambient Off'}</span>
              {settings.ambientAudio ? (
                <Volume2 className="w-4 h-4 text-cyan-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          Achievement Badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 transition-colors ${
                badge.unlocked
                  ? 'border-cyan-500/35 bg-cyan-500/8 dark:bg-cyan-500/10'
                  : 'border-slate-200 dark:border-white/10 glass-surface opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Award
                    className={`w-5 h-5 shrink-0 ${
                      badge.unlocked ? 'text-cyan-500' : 'text-slate-400'
                    }`}
                  />
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {badge.name}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-cyan-300 shrink-0">
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mind Reading History */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Mind Reading History
          </h2>
          {progress.history.length > 0 && (
            <button
              type="button"
              onClick={onResetProgress}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Progress
            </button>
          )}
        </div>

        {progress.history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            No sessions recorded yet. Play any mind-reading game to log your first prediction!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Experiment</th>
                  <th className="pb-3 font-medium">Prediction</th>
                  <th className="pb-3 font-medium">Outcome</th>
                  <th className="pb-3 font-medium text-right">Score</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {progress.history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{item.prediction}</td>
                    <td className="py-3 text-xs font-medium">
                      <span
                        className={
                          item.correct
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }
                      >
                        {item.correct ? 'Matched' : 'Logged'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-900 dark:text-cyan-300">
                      {item.score}
                    </td>
                    <td className="py-3 text-right font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
