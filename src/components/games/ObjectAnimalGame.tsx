import { useState } from 'react';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import {
  DeductionDomain,
  DOMAIN_META,
  KnowledgeItem,
  scoreCandidates,
  selectBestTraitQuestion,
} from '../../lib/gameEngines';
import { soundEngine } from '../../lib/sound';
import { ShockRevealOverlay } from '../ShockRevealOverlay';

interface ObjectAnimalGameProps {
  speak: (text: string) => void;
  onComplete: (result: {
    prediction: string;
    correct: boolean;
    score: number;
    xpEarned: number;
  }) => void;
  onChallengeFriend: (score: number) => void;
  onBack: () => void;
}

const DOMAIN_KEYS: DeductionDomain[] = ['animals', 'objects', 'food', 'vehicles', 'characters'];

export function ObjectAnimalGame({
  speak,
  onComplete,
  onChallengeFriend,
  onBack,
}: ObjectAnimalGameProps) {
  const [domain, setDomain] = useState<DeductionDomain | null>(null);
  const [stage, setStage] = useState<'category' | 'playing' | 'needs-clue' | 'reveal'>('category');
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'unsure'>>({});
  const [askedTraits, setAskedTraits] = useState<string[]>([]);
  const [trail, setTrail] = useState<string[]>([]);
  const [logged, setLogged] = useState(false);

  const resetGame = () => {
    setDomain(null);
    setStage('category');
    setAnswers({});
    setAskedTraits([]);
    setTrail([]);
    setLogged(false);
  };

  const startDomain = (selected: DeductionDomain) => {
    soundEngine.playClick();
    setDomain(selected);
    setAnswers({});
    setAskedTraits([]);
    setTrail([]);
    setLogged(false);
    setStage('playing');

    const meta = DOMAIN_META[selected];
    const firstQ = selectBestTraitQuestion(selected, meta.items, []);
    speak(
      `Think of one from ${meta.label}. Don't say it out loud. ${
        firstQ?.question || 'Let us begin.'
      }`
    );
  };

  const meta = domain ? DOMAIN_META[domain] : null;
  const { ranked, confidence } = meta
    ? scoreCandidates(meta.items, answers)
    : { ranked: [], confidence: 0 };

  const activeItems: KnowledgeItem[] =
    ranked.length > 0
      ? ranked.filter((r) => r.score >= ranked[0].score - 2).map((r) => r.item)
      : meta?.items || [];

  const currentQuestion =
    domain && stage === 'playing'
      ? selectBestTraitQuestion(domain, activeItems, askedTraits)
      : null;

  const handleAnswer = (value: 'yes' | 'no' | 'unsure') => {
    if (!domain || !meta || !currentQuestion) return;
    soundEngine.playClick();

    const nextAnswers = { ...answers, [currentQuestion.trait]: value };
    const nextAsked = [...askedTraits, currentQuestion.trait];
    const label = value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Not Sure';
    const nextTrail = [...trail, `${currentQuestion.question} → ${label}`];

    setAnswers(nextAnswers);
    setAskedTraits(nextAsked);
    setTrail(nextTrail);

    const nextEval = scoreCandidates(meta.items, nextAnswers);
    const nextActive = nextEval.ranked
      .filter((r) => r.score >= nextEval.ranked[0].score - 2)
      .map((r) => r.item);

    const upcomingQ = selectBestTraitQuestion(domain, nextActive, nextAsked);

    // If we have strong certainty or reached 5+ questions and confident
    if (nextActive.length === 1 && nextAsked.length >= 3) {
      setStage('reveal');
      return;
    }

    if (nextAsked.length >= 5) {
      if (nextEval.confidence >= 68 || !upcomingQ) {
        if (nextEval.confidence < 60 && upcomingQ) {
          setStage('needs-clue');
          speak(
            'Your mind is well guarded. I have a few close possibilities and honestly need one more clue to be sure.'
          );
        } else {
          setStage('reveal');
        }
        return;
      }
      setStage('needs-clue');
      speak(
        'Interesting. My signals are split between a couple of possibilities. I need one more clue before I commit.'
      );
      return;
    }

    if (!upcomingQ) {
      setStage('reveal');
      return;
    }

    speak(upcomingQ.question);
  };

  const topCandidate = ranked[0]?.item || null;
  const score = Math.max(80, Math.round(confidence * 1.5));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mind Games
        </button>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {meta ? meta.label : '5 Knowledge Domains'}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 sm:p-8 neural-glow">
        {stage === 'category' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                Object & Animal Deduction
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-balance">
                Pick a category and secretly think of one item
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                MIRA uses an information-gain decision tree to narrow down your secret choice in 4–5
                yes/no questions. If she isn’t sure, she’ll honestly ask for another clue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOMAIN_KEYS.map((key) => {
                const info = DOMAIN_META[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => startDomain(key)}
                    className="text-left p-5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {info.label}
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        e.g. {info.examples}
                      </p>
                    </div>
                    <span className="mt-4 text-xs font-medium text-blue-600 dark:text-cyan-400">
                      Start Deduction →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stage === 'playing' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Question {askedTraits.length + 1}</span>
              <span className="tabular-nums">Confidence: {confidence}%</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(15, confidence)}%` }}
              />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white pt-1">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAnswer('yes')}
                className="py-4 px-5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-cyan-500 hover:bg-cyan-500/10 font-display text-lg font-semibold text-slate-900 dark:text-white transition-all cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('no')}
                className="py-4 px-5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-blue-500 hover:bg-blue-500/10 font-display text-lg font-semibold text-slate-900 dark:text-white transition-all cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('unsure')}
                className="py-4 px-5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-[#0B152E] hover:border-slate-400 font-display text-base font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                Not Sure
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Category
              </button>
            </div>
          </div>
        )}

        {stage === 'needs-clue' && (
          <div className="text-center py-4 space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-500 mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                I need one more clue to be sure
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                Right now my confidence is <span className="font-mono font-semibold">{confidence}%</span>{' '}
                between {activeItems.slice(0, 3).map((i) => i.name).join(', ')}. Would you like to
                answer one more question or see my best prediction now?
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStage('playing')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Give Another Clue
              </button>
              <button
                type="button"
                onClick={() => setStage('reveal')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
              >
                Reveal Best Prediction
              </button>
            </div>
          </div>
        )}
      </div>

      <ShockRevealOverlay
        open={stage === 'reveal' && topCandidate !== null}
        gameTitle={`${meta?.label || 'Object'} Deduction`}
        prediction={topCandidate?.name || ''}
        subtitle={
          topCandidate
            ? `${topCandidate.tagline}. Deduced with ${confidence}% confidence.`
            : ''
        }
        accentHex="#3B82F6"
        confidence={confidence}
        deductionSteps={trail}
        score={score}
        speak={speak}
        onConfirmAccuracy={(wasCorrect) => {
          if (logged) return;
          setLogged(true);
          onComplete({
            prediction: topCandidate?.name || '',
            correct: wasCorrect,
            score: wasCorrect ? score : 45,
            xpEarned: wasCorrect ? 85 : 35,
          });
        }}
        onPlayAgain={() => {
          soundEngine.playClick();
          resetGame();
        }}
        onChallengeFriend={() => onChallengeFriend(score)}
        onClose={() => resetGame()}
      />
    </div>
  );
}
