import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Download, RotateCcw, Share2, Swords, X } from 'lucide-react';
import { soundEngine } from '../lib/sound';

const HERO_BRAIN_IMG = '/src/assets/images/holographic_brain_hero_1794982972116.jpg';

export interface ShockRevealProps {
  open: boolean;
  gameTitle: string;
  prediction: string;
  subtitle: string;
  accentHex?: string;
  confidence?: number;
  deductionSteps: string[];
  score: number;
  speak: (text: string) => void;
  onConfirmAccuracy: (wasCorrect: boolean) => void;
  onPlayAgain: () => void;
  onChallengeFriend: () => void;
  onClose: () => void;
}

export function ShockRevealOverlay({
  open,
  gameTitle,
  prediction,
  subtitle,
  accentHex = '#06B6D4',
  confidence,
  deductionSteps,
  score,
  speak,
  onConfirmAccuracy,
  onPlayAgain,
  onChallengeFriend,
  onClose,
}: ShockRevealProps) {
  const [phase, setPhase] = useState<'countdown' | 'revealed'>('countdown');
  const [count, setCount] = useState(3);
  const [accuracyChoice, setAccuracyChoice] = useState<'yes' | 'no' | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhase('countdown');
    setCount(3);
    setAccuracyChoice(null);
    setCopied(false);

    soundEngine.playSuspenseBuild();
    speak('Mind connection established. I have a prediction. Your answer is...');

    const t1 = window.setTimeout(() => {
      setCount(2);
      soundEngine.playCountdownTick(2);
    }, 900);

    const t2 = window.setTimeout(() => {
      setCount(1);
      soundEngine.playCountdownTick(1);
    }, 1800);

    const t3 = window.setTimeout(() => {
      setPhase('revealed');
      soundEngine.playRevealChord();
      speak(`Your answer is ${prediction}!`);
    }, 2700);

    soundEngine.playCountdownTick(3);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [open, prediction, speak]);

  // Flashing particle burst behind reveal
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 68 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.4 + 0.6;
      return {
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.4 + 1,
        alpha: Math.random() * 0.7 + 0.3,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx * (phase === 'revealed' ? 1.8 : 0.7);
        p.y += p.vy * (phase === 'revealed' ? 1.8 : 0.7);
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = w / 2;
          p.y = h / 2;
        }
        ctx.fillStyle = accentHex;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [open, phase, accentHex]);

  const handleConfirm = (correct: boolean) => {
    if (accuracyChoice !== null) return;
    setAccuracyChoice(correct ? 'yes' : 'no');
    if (correct) {
      soundEngine.playSuccess();
    } else {
      soundEngine.playClick();
    }
    onConfirmAccuracy(correct);
  };

  const handleCopyShare = async () => {
    const text = `MIND READER AI — ${gameTitle}\nMIRA predicted: ${prediction}\nScore: ${score} pts\nCan MIRA read your mind too?`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      soundEngine.playClick();
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadCard = () => {
    const c = document.createElement('canvas');
    c.width = 960;
    c.height = 540;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 960, 540);
    grad.addColorStop(0, '#040812');
    grad.addColorStop(0.5, '#0B1633');
    grad.addColorStop(1, '#040812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 540);

    // Glow circle
    const rad = ctx.createRadialGradient(480, 250, 20, 480, 250, 280);
    rad.addColorStop(0, `${accentHex}55`);
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 960, 540);

    // Border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 904, 484);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '600 22px Outfit, sans-serif';
    ctx.fillText('MIND READER AI  ·  RESULT CARD', 64, 88);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 20px Plus Jakarta Sans, sans-serif';
    ctx.fillText(gameTitle, 64, 130);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 84px Outfit, sans-serif';
    ctx.fillText(prediction, 64, 275);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '400 22px Plus Jakarta Sans, sans-serif';
    ctx.fillText(subtitle.slice(0, 68), 64, 330);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '600 26px JetBrains Mono, monospace';
    ctx.fillText(`SCORE: ${score} PTS`, 64, 445);

    ctx.fillStyle = '#64748B';
    ctx.font = '400 18px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Think It. Hide It. I’ll Guess It.', 64, 480);

    const link = document.createElement('a');
    link.download = `mind-reader-result-${Date.now()}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
    soundEngine.playClick();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#02050E]/96 backdrop-blur-xl p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Prediction Reveal"
        >
          <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" />

          <button
            onClick={onClose}
            aria-label="Close reveal"
            className="fixed top-5 right-5 z-20 p-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 w-full max-w-2xl mx-auto text-center py-8">
            {phase === 'countdown' ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_80px_rgba(6,182,212,0.45)]">
                  <img
                    src={HERO_BRAIN_IMG}
                    alt="Glowing digital brain"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <p className="text-sm font-medium tracking-wide text-cyan-300">
                  Mind connection established · Locking prediction
                </p>
                <motion.div
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="font-display text-7xl sm:text-8xl font-bold text-white tabular-nums"
                  style={{ textShadow: `0 0 40px ${accentHex}` }}
                >
                  {count}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-cyan-400/25 bg-[#081126]/90 p-6 sm:p-8 shadow-[0_0_90px_-15px_rgba(6,182,212,0.45)] text-left"
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-cyan-300">
                    {gameTitle}
                    {typeof confidence === 'number' ? ` · ${confidence}% confidence` : ''}
                  </p>
                  <h2 className="mt-2 font-display text-xl text-slate-300">
                    I have a prediction. Your answer is
                  </h2>
                  <div
                    className="mt-3 font-display text-5xl sm:text-7xl font-bold tracking-tight text-white py-2"
                    style={{ textShadow: `0 0 42px ${accentHex}` }}
                  >
                    {prediction}
                  </div>
                  <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">{subtitle}</p>
                </div>

                {/* Accuracy Confirmation */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  {accuracyChoice === null ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-sm text-slate-200 font-medium">
                        Did MIRA read your mind correctly?
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleConfirm(true)}
                          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Yes, Spot On
                        </button>
                        <button
                          onClick={() => handleConfirm(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Not Quite
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-300 font-medium">
                        {accuracyChoice === 'yes'
                          ? 'Confirmed! Result saved to your Mind Reader profile.'
                          : 'Logged! Every round sharpens our deduction experiments.'}
                      </span>
                      <span className="font-mono text-white tabular-nums font-semibold">
                        +{score} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Deduction Trail */}
                {deductionSteps.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-xs font-medium text-slate-400 mb-2">
                      How MIRA narrowed it down
                    </p>
                    <ol className="space-y-1.5 text-xs text-slate-300">
                      {deductionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-mono text-cyan-400 tabular-nums">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Action Row */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={onPlayAgain}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                    <button
                      onClick={onChallengeFriend}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      Challenge a Friend
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyShare}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Share Result'}
                    </button>
                    <button
                      onClick={handleDownloadCard}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save Card
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
