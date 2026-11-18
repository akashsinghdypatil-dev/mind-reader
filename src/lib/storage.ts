import { AppSettings, Badge, GameRecord, UserProgress } from '../types/app';

const PROGRESS_KEY = 'mind_reader_ai_progress_v1';
const SETTINGS_KEY = 'mind_reader_ai_settings_v1';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-connection',
    name: 'First Mind Connection',
    description: 'Complete your very first mind-reading experiment.',
  },
  {
    id: 'number-master',
    name: 'Number Master',
    description: 'Let MIRA accurately deduce your secret number.',
  },
  {
    id: 'colour-wizard',
    name: 'Colour Wizard',
    description: 'Complete a successful Colour Mind Reading reveal.',
  },
  {
    id: 'animal-detective',
    name: 'Animal Detective',
    description: 'Complete an Object & Animal deduction session.',
  },
  {
    id: 'mystery-champion',
    name: 'Mystery Champion',
    description: 'Reach Level 3 or complete 5 mind-reading games.',
  },
  {
    id: 'memory-architect',
    name: 'Memory Architect',
    description: 'Score 100% on a Neural Memory sequence test.',
  },
  {
    id: 'speed-thinker',
    name: 'Speed Thinker',
    description: 'Solve at least 3 Quick Think challenges in one run.',
  },
];

export const DEFAULT_PROGRESS: UserProgress = {
  totalGames: 0,
  correctPredictions: 0,
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: null,
  dailyCompletedDate: null,
  bestScore: 0,
  badges: {},
  history: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: true,
  ambientAudio: false,
  voiceMuted: false,
  theme: 'dark',
  difficulty: 'medium',
};

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      badges: parsed.badges ?? {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

export function recordGameOutcome(
  current: UserProgress,
  record: Omit<GameRecord, 'id' | 'timestamp'>,
  extraBadgeIds: string[] = []
): { updated: UserProgress; newlyUnlocked: string[] } {
  const today = getTodayKey();
  let nextStreak = current.streak;
  if (!current.lastPlayedDate) {
    nextStreak = 1;
  } else if (current.lastPlayedDate !== today) {
    const prev = new Date(current.lastPlayedDate + 'T00:00:00');
    const now = new Date(today + 'T00:00:00');
    const diffDays = Math.round((now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    nextStreak = diffDays === 1 ? current.streak + 1 : 1;
  }

  const nextXp = current.xp + record.xpEarned;
  const nextLevel = calculateLevel(nextXp);
  const nextTotal = current.totalGames + 1;
  const nextCorrect = current.correctPredictions + (record.correct ? 1 : 0);
  const nextBest = Math.max(current.bestScore, record.score);

  const fullRecord: GameRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const nextBadges = { ...current.badges };
  const newlyUnlocked: string[] = [];
  const unlock = (id: string) => {
    if (!nextBadges[id]) {
      nextBadges[id] = new Date().toISOString();
      newlyUnlocked.push(id);
    }
  };

  unlock('first-connection');
  if (record.game === 'number' && record.correct) unlock('number-master');
  if (record.game === 'colour' && record.correct) unlock('colour-wizard');
  if (record.game === 'object' && record.correct) unlock('animal-detective');
  if (nextLevel >= 3 || nextTotal >= 5) unlock('mystery-champion');
  extraBadgeIds.forEach(unlock);

  const updated: UserProgress = {
    totalGames: nextTotal,
    correctPredictions: nextCorrect,
    xp: nextXp,
    level: nextLevel,
    streak: nextStreak,
    lastPlayedDate: today,
    dailyCompletedDate: record.game === 'daily' ? today : current.dailyCompletedDate,
    bestScore: nextBest,
    badges: nextBadges,
    history: [fullRecord, ...current.history].slice(0, 40),
  };

  saveProgress(updated);
  return { updated, newlyUnlocked };
}

export function getBadgesWithStatus(progress: UserProgress): Badge[] {
  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: Boolean(progress.badges[def.id]),
    unlockedAt: progress.badges[def.id],
  }));
}
