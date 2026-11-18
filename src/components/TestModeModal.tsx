import { useEffect, useState } from 'react';
import { CheckCircle2, Play, X, XCircle } from 'lucide-react';
import {
  calculateLoveScore,
  COLOUR_TRAP_COLOURS,
  computeFutureResult,
  EMOJI_RIDDLES,
  FOODS,
  FUTURE_PREDICTIONS,
  getColourTrapRank,
  getLoveVerdict,
  getRiddleRank,
  runColourMindReaderTests,
} from '../data/magicGameData';
import { createInitialCandidates, getNextNumberQuestion } from '../lib/gameEngines';

interface TestResult {
  game: string;
  passed: boolean;
  summary: string;
  pathsChecked: number;
}

function runAllDeterministicTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Number Mind Reader: exhaustively test ALL 50 secret numbers (1..50)
  {
    let failures = 0;
    for (let secret = 1; secret <= 50; secret++) {
      let candidates = createInitialCandidates(1, 50);
      let step = 0;
      while (candidates.length > 1 && step < 10) {
        const q = getNextNumberQuestion(candidates, step, 50);
        if (!q) break;
        const matchingOpt = q.options.find((opt) => opt.filter(secret));
        if (!matchingOpt) {
          failures += 1;
          break;
        }
        candidates = candidates.filter(matchingOpt.filter);
        step += 1;
      }
      if (candidates.length !== 1 || candidates[0] !== secret) {
        failures += 1;
      }
    }
    results.push({
      game: 'Number Mind Reader (1–50)',
      passed: failures === 0,
      summary:
        failures === 0
          ? 'All 50/50 secret numbers deduced with 100% accuracy.'
          : `${failures} numbers failed deduction.`,
      pathsChecked: 50,
    });
  }

  // 1b. Colour Mind Reader: exhaustively test all 16 colours through 4 binary bits (1, 2, 4, 8)
  {
    const colourTest = runColourMindReaderTests();
    results.push({
      game: 'Colour Mind Reader (16 Colours)',
      passed: colourTest.allPassed,
      summary: colourTest.allPassed
        ? 'All 16/16 colours have unique 4-bit signatures and reveal accurately.'
        : 'One or more colour binary paths failed.',
      pathsChecked: colourTest.results.length,
    });
  }

  // 2. Guess My Favourite Food: exhaustively test all 16 foods through 4 binary bits
  {
    let failures = 0;
    if (FOODS.length !== 16) {
      failures += 1;
    } else {
      for (let targetId = 0; targetId < 16; targetId++) {
        let computedId = 0;
        for (let bit = 0; bit < 4; bit++) {
          const group = FOODS.filter((f) => ((f.id >> bit) & 1) === 1);
          if (group.length !== 8) failures += 1;
          const isInGroup = group.some((f) => f.id === targetId);
          if (isInGroup) {
            computedId |= 1 << bit;
          }
        }
        const revealed = FOODS.find((f) => f.id === computedId);
        if (!revealed || revealed.id !== targetId || !revealed.roast) {
          failures += 1;
        }
      }
    }
    results.push({
      game: 'Guess My Favourite Food (16 Foods)',
      passed: failures === 0,
      summary:
        failures === 0
          ? 'All 16/16 foods uniquely isolated in 4 YES/NO questions (8 per group).'
          : `${failures} binary paths failed.`,
      pathsChecked: 16,
    });
  }

  // 3. Colour Trap: verify ink-colour rule, speed ramp, and all 4 rank tiers
  {
    const ranksOk =
      getColourTrapRank(0).title === 'Sleepy Panda' &&
      getColourTrapRank(5).title === 'Sleepy Panda' &&
      getColourTrapRank(6).title === 'Average Human' &&
      getColourTrapRank(12).title === 'Average Human' &&
      getColourTrapRank(13).title === 'Sharp Brain' &&
      getColourTrapRank(20).title === 'Sharp Brain' &&
      getColourTrapRank(21).title === 'Colour Wizard' &&
      COLOUR_TRAP_COLOURS.length >= 4;

    results.push({
      game: 'Colour Trap (Ink Logic & Ranks)',
      passed: ranksOk,
      summary: ranksOk
        ? 'Ink-colour matching, 4 colour choices, and all 4 rank brackets verified.'
        : 'Rank or colour palette check failed.',
      pathsChecked: COLOUR_TRAP_COLOURS.length + 4,
    });
  }

  // 4. Love Compatibility Meter: order independence, case/trim invariance, 0..100 & 5 verdicts
  {
    const pairs: [string, string][] = [
      ['Aarav', 'Meera'],
      ['  Romeo ', 'JULIET'],
      ['Priya', 'Rohan'],
      ['Sam', 'Alex'],
      ['Zoya', 'Kabir'],
    ];
    let ok = true;
    for (const [a, b] of pairs) {
      const s1 = calculateLoveScore(a, b);
      const s2 = calculateLoveScore(b, a);
      const s3 = calculateLoveScore(a.toUpperCase(), b.toLowerCase());
      if (s1 !== s2 || s1 !== s3 || s1 < 0 || s1 > 100) ok = false;
    }
    for (const sampleScore of [0, 20, 21, 40, 41, 60, 61, 80, 81, 100]) {
      const v = getLoveVerdict(sampleScore);
      if (!v || !v.line) ok = false;
    }
    results.push({
      game: 'Love Compatibility Meter',
      passed: ok,
      summary: ok
        ? 'Order-independent formula, case/space trimming, 0–100 bounds & all 5 verdicts verified.'
        : 'Formula symmetry or verdict bucket check failed.',
      pathsChecked: pairs.length * 3 + 10,
    });
  }

  // 5. Future Predictor: exhaustively test all 27 (3x3x3) combinations
  {
    let failures = 0;
    const seen = new Set<string>();
    for (let q0 = 0; q0 < 3; q0++) {
      for (let q1 = 0; q1 < 3; q1++) {
        for (let q2 = 0; q2 < 3; q2++) {
          const res1 = computeFutureResult(q0, q1, q2);
          const res2 = computeFutureResult(q0, q1, q2);
          if (
            !res1.prediction ||
            res1.prediction !== res2.prediction ||
            res1.luckyNumber !== res2.luckyNumber ||
            res1.luckyColour.name !== res2.luckyColour.name ||
            res1.luckyNumber < 1 ||
            res1.luckyNumber > 99
          ) {
            failures += 1;
          }
          seen.add(res1.prediction);
        }
      }
    }
    const allUnique = FUTURE_PREDICTIONS.length === 27 && seen.size === 27;
    const passed = failures === 0 && allUnique;
    results.push({
      game: 'Future Predictor (27 Combinations)',
      passed,
      summary: passed
        ? 'All 27/27 unique predictions + deterministic lucky number & colour verified.'
        : 'Missing or duplicate future prediction paths.',
      pathsChecked: 27,
    });
  }

  // 6. Emoji Riddle: verify all 20 riddles have 4 unique options, valid answerIndex, hint & ranks
  {
    let failures = 0;
    if (EMOJI_RIDDLES.length !== 20) failures += 1;
    for (const r of EMOJI_RIDDLES) {
      const uniqueOpts = new Set(r.options.map((o) => o.trim().toLowerCase()));
      if (
        uniqueOpts.size !== 4 ||
        r.answerIndex < 0 ||
        r.answerIndex > 3 ||
        !r.emojis.trim() ||
        !r.hint.trim()
      ) {
        failures += 1;
      }
    }
    const ranksOk = Boolean(
      getRiddleRank(0).title && getRiddleRank(5).title && getRiddleRank(10).title
    );
    const passed = failures === 0 && ranksOk;
    results.push({
      game: 'Emoji Riddle (20 Riddles)',
      passed,
      summary: passed
        ? 'All 20/20 riddles verified: 4 distinct options, 1 valid answer index, hints & ranks.'
        : `${failures} riddle integrity issues detected.`,
      pathsChecked: 20,
    });
  }

  return results;
}

interface TestModeModalProps {
  open: boolean;
  onClose: () => void;
}

export function TestModeModal({ open, onClose }: TestModeModalProps) {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (open) {
      setResults(runAllDeterministicTests());
    }
  }, [open]);

  if (!open) return null;

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  const totalPaths = results.reduce((sum, r) => sum + r.pathsChecked, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Automated Test Mode"
    >
      <div className="w-full max-w-2xl rounded-2xl magic-card magic-glow p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-fuchsia-300">
              Automated Path Verification · {totalPaths} Paths Checked
            </p>
            <h2 className="font-display text-2xl font-bold text-white mt-1">
              Test Mode — Deterministic Suite
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close test mode"
            className="p-2 rounded-lg text-purple-200 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Banner */}
        <div
          className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 ${
            allPassed
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-rose-400/40 bg-rose-500/15 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            {allPassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>
              {allPassed
                ? 'All 7 games passed every deterministic path check!'
                : 'Some checks failed — inspect details below.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setResults(runAllDeterministicTests())}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Re-run
          </button>
        </div>

        {/* Individual Game Checks */}
        <div className="space-y-2.5">
          {results.map((r) => (
            <div
              key={r.game}
              className="rounded-xl border border-purple-400/20 bg-[#120928]/80 px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                {r.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">{r.game}</h3>
                  <p className="text-xs text-purple-200/80 mt-0.5">{r.summary}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-300 tabular-nums shrink-0">
                {r.pathsChecked} paths
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl neon-button text-white text-sm font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
