import { useEffect, useRef } from 'react';
import { ThemeMode } from '../types/app';

interface NeuralBackgroundProps {
  theme: ThemeMode;
}

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function NeuralBackground({ theme }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const nodeCount = Math.min(52, Math.max(24, Math.floor((width * height) / 28000)));
    const nodes: NodePoint[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.6 + 1.1,
    }));

    const mouse = { x: -1000, y: -1000 };
    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const nodeColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.55)' : 'rgba(37, 99, 235, 0.35)';
      const lineBase = theme === 'dark' ? '6, 182, 212' : '37, 99, 235';
      const maxDist = 155;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reducedMotion) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > width) a.vx *= -1;
          if (a.y < 0 || a.y > height) a.vy *= -1;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (theme === 'dark' ? 0.2 : 0.12);
            ctx.strokeStyle = `rgba(${lineBase}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 180) {
          const alpha = (1 - mdist / 180) * (theme === 'dark' ? 0.32 : 0.18);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
    />
  );
}
