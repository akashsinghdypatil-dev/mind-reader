export type AppView =
  | 'home'
  | 'games'
  | 'number-game'
  | 'colour-game'
  | 'object-game'
  | 'memory-game'
  | 'quick-think'
  | 'daily-mystery'
  | 'mira-chat'
  | 'challenges'
  | 'profile';

export type Difficulty = 'easy' | 'medium' | 'expert';

export type ThemeMode = 'dark' | 'light';

export type GameCategory =
  | 'number'
  | 'colour'
  | 'object'
  | 'memory'
  | 'quick-think'
  | 'daily';

export interface GameRecord {
  id: string;
  game: GameCategory;
  title: string;
  prediction: string;
  correct: boolean;
  score: number;
  xpEarned: number;
  difficulty: Difficulty;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  totalGames: number;
  correctPredictions: number;
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null;
  dailyCompletedDate: string | null;
  bestScore: number;
  badges: Record<string, string>; // badgeId -> ISO timestamp
  history: GameRecord[];
}

export interface AppSettings {
  soundEffects: boolean;
  ambientAudio: boolean;
  voiceMuted: boolean;
  theme: ThemeMode;
  difficulty: Difficulty;
}

export interface MiraMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FriendChallenge {
  id: string;
  creatorName: string;
  game: 'number' | 'colour' | 'object' | 'memory' | 'quick-think';
  difficulty: Difficulty;
  creatorScore: number;
  createdAt: string;
}
