import { useState } from 'react';
import { Check, Copy, Link2, Play, Swords, Trophy } from 'lucide-react';
import { Difficulty, FriendChallenge } from '../types/app';
import { decodeChallenge, encodeChallenge } from '../lib/gameEngines';
import { soundEngine } from '../lib/sound';

interface FriendChallengeViewProps {
  defaultDifficulty: Difficulty;
  prefillGame?: FriendChallenge['game'];
  prefillScore?: number;
  activeChallenge: FriendChallenge | null;
  challengerScore: number | null;
  onAcceptChallenge: (challenge: FriendChallenge) => void;
  onClearActiveChallenge: () => void;
}

const GAME_LABELS: Record<FriendChallenge['game'], string> = {
  number: 'Number Mind Reading',
  colour: 'Colour Prediction',
  object: 'Object & Animal Deduction',
  memory: 'Neural Memory Test',
  'quick-think': '10-Second Quick Think',
};

export function FriendChallengeView({
  defaultDifficulty,
  prefillGame = 'number',
  prefillScore = 140,
  activeChallenge,
  challengerScore,
  onAcceptChallenge,
  onClearActiveChallenge,
}: FriendChallengeViewProps) {
  const [creatorName, setCreatorName] = useState('Player One');
  const [game, setGame] = useState<FriendChallenge['game']>(prefillGame);
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [creatorScore, setCreatorScore] = useState<number>(prefillScore);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);

  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleGenerate = () => {
    soundEngine.playClick();
    const payload: FriendChallenge = {
      id: Math.random().toString(36).slice(2, 8).toUpperCase(),
      creatorName: creatorName.trim() || 'Mind Challenger',
      game,
      difficulty,
      creatorScore: Math.max(10, Number(creatorScore) || 100),
      createdAt: new Date().toISOString(),
    };
    setGeneratedCode(encodeChallenge(payload));
  };

  const shareUrl = generatedCode
    ? `${window.location.origin}${window.location.pathname}?challenge=${encodeURIComponent(
        generatedCode
      )}`
    : '';

  const copyText = async (text: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(kind);
      soundEngine.playClick();
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleJoin = () => {
    setJoinError(null);
    let raw = joinInput.trim();
    if (raw.includes('challenge=')) {
      try {
        const url = new URL(raw);
        raw = url.searchParams.get('challenge') || raw;
      } catch {
        // fallback to raw
      }
    }
    const decoded = decodeChallenge(raw);
    if (!decoded) {
      setJoinError('Invalid challenge code or link. Please paste the full code shared by your friend.');
      soundEngine.playError();
      return;
    }
    soundEngine.playSuccess();
    onAcceptChallenge(decoded);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Friend Challenge Mode</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Challenge Friends to Beat Your Mind Score
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
          Create a shareable challenge code or direct link. Your friend plays the exact same mind
          game, and we compare scores head-to-head.
        </p>
      </div>

      {/* Head-to-Head Result Banner when returning from an accepted challenge */}
      {activeChallenge && challengerScore !== null && (
        <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
              <Trophy className="w-4 h-4" />
              Head-to-Head Result · {GAME_LABELS[activeChallenge.game]}
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {challengerScore > activeChallenge.creatorScore
                ? 'You Won the Challenge!'
                : challengerScore === activeChallenge.creatorScore
                ? 'It’s a Dead Tie!'
                : `${activeChallenge.creatorName} Holds the Lead`}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-mono tabular-nums">
              You: {challengerScore} pts · {activeChallenge.creatorName}:{' '}
              {activeChallenge.creatorScore} pts
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onAcceptChallenge(activeChallenge)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
            >
              Replay Challenge
            </button>
            <button
              type="button"
              onClick={onClearActiveChallenge}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 text-sm font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create a Challenge */}
        <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Create a Challenge
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                maxLength={28}
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#060D1E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Game
                </label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value as FriendChallenge['game'])}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#060D1E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(GAME_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Target Score to Beat
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={creatorScore}
                  onChange={(e) => setCreatorScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#060D1E] px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
                {(['easy', 'medium', 'expert'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Generate Shareable Challenge
            </button>
          </div>

          {generatedCode && (
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                Challenge Ready — Send this link or code to a friend
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#060D1E] border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-700 dark:text-slate-200 break-all">
                {generatedCode}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyText(shareUrl, 'link')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  {copiedType === 'link' ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copiedType === 'link' ? 'Link Copied' : 'Copy Share Link'}
                </button>
                <button
                  type="button"
                  onClick={() => copyText(generatedCode, 'code')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  {copiedType === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'code' ? 'Code Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Join a Friend's Challenge */}
        <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Play className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Accept a Friend’s Challenge
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Paste a challenge code or link below. You’ll jump straight into the exact same game
              and difficulty, and see who wins at the end.
            </p>
            <textarea
              rows={4}
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder="Paste challenge code or full URL here..."
              className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#060D1E] p-3.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
            {joinError && <p className="text-xs text-rose-500">{joinError}</p>}
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={!joinInput.trim()}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-cyan-500 hover:bg-slate-800 dark:hover:bg-cyan-400 disabled:opacity-40 text-white dark:text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
          >
            Play Friend’s Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
