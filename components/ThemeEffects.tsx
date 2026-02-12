"use client";

import { useEffect, useRef } from "react";

type Props = {
  themeKey: string;
};

export default function ThemeEffects({ themeKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener("resize", onResize);

    const startMatrix = () => {
      const letters = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fontSize = 14;
      const columns = Math.floor(w / fontSize);
      const drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * h));
      const draw = () => {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#00ff00";
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
          const text = letters[Math.floor(Math.random() * letters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > h && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
      cleanupRef.current = () => {};
    };

    const startCarnaval = () => {
      const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; type: "confetti" | "serpentine"; life: number }[] = [];
      const colors = ["#E60012", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];
      const max = 200;
      for (let i = 0; i < max; i++) {
        const type = Math.random() < 0.7 ? "confetti" : "serpentine";
        particles.push({
          x: Math.random() * w,
          y: Math.random() * -h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random() * 2,
          size: type === "confetti" ? 3 + Math.random() * 3 : 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          type,
          life: 0,
        });
      }
      let mx = w / 2;
      let my = h / 2;
      const onMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
      };
      window.addEventListener("mousemove", onMove);
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          p.vx += (mx - p.x) * 0.00002;
          p.vy += (my - p.y) * 0.000005;
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;
          if (p.y > h + 10) {
            p.x = Math.random() * w;
            p.y = -10;
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = 1 + Math.random() * 2;
            p.life = 0;
          }
          ctx.fillStyle = p.color;
          if (p.type === "confetti") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.life % 360) * 0.02);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          } else {
            ctx.beginPath();
            const s = p.size;
            ctx.moveTo(p.x - s, p.y - s / 2);
            ctx.quadraticCurveTo(p.x, p.y + s, p.x + s, p.y - s / 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
      cleanupRef.current = () => {
        window.removeEventListener("mousemove", onMove);
      };
    };

    const startChuva = () => {
      const drops: { x: number; y: number; len: number; speed: number }[] = [];
      const max = 300;
      for (let i = 0; i < max; i++) {
        drops.push({
          x: Math.random() * w,
          y: Math.random() * h,
          len: 10 + Math.random() * 20,
          speed: 4 + Math.random() * 6,
        });
      }
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const d of drops) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x, d.y + d.len);
          d.y += d.speed;
          if (d.y > h) {
            d.y = -d.len;
            d.x = Math.random() * w;
          }
        }
        ctx.stroke();
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
      cleanupRef.current = () => {};
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (cleanupRef.current) cleanupRef.current();
    ctx.clearRect(0, 0, w, h);

    if (themeKey === "matrix") startMatrix();
    else if (themeKey === "carnaval") startCarnaval();
    else if (themeKey === "chuva") startChuva();

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [themeKey]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
