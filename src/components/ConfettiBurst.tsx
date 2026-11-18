import { useEffect, useRef } from 'react';

interface ConfettiBurstProps {
  triggerKey: number;
}

const COLORS = ['#C084FC', '#E879F9', '#38BDF8', '#FACC15', '#4ADE80', '#FB7185'];

export function ConfettiBurst({ triggerKey }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (triggerKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const pieces = Array.from({ length: 110 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = Math.random() * 11 + 6;
      return {
        x: w / 2 + (Math.random() - 0.5) * 140,
        y: h * 0.48,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 7 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1,
      };
    });

    let frame = 0;
    let rafId = 0;

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, w, h);

      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.vx *= 0.99;
        p.rotation += p.vRot;
        if (frame > 55) p.alpha = Math.max(0, p.alpha - 0.025);

        if (p.alpha > 0.01 && p.y < h + 30) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          ctx.restore();
        }
      }

      if (alive && frame < 140) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, w, h);
    };
  }, [triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
