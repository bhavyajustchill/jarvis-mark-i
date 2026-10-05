"use client";

import React, { useEffect, useRef, useState } from "react";

// Boot terminal lines (after my-jarvis), one every 300ms
const BOOT_MESSAGES = [
  "STARK INDUSTRIES SECURE NETWORK",
  "INITIALIZING ARC REACTOR CORE...",
  "POWER LEVEL: 100%",
  "LOADING J.A.R.V.I.S. NEURAL MATRIX...",
  "CONNECTING TO AVENGERS DATABASE...",
  "SECURITY PROTOCOLS: ACTIVE",
  "HOLOGRAPHIC INTERFACE: READY",
  "VOICE RECOGNITION: CALIBRATED",
  "ALL SYSTEMS OPERATIONAL",
  "",
  "WELCOME BACK, SIR.",
];
const LINE_MS = 300;

const lineColor = (text) => {
  if (text.includes("WELCOME")) return "#ffcc00";
  if (/100%|READY|ACTIVE|OPERATIONAL/.test(text)) return "#00ff88";
  return "#00d4ff";
};

// Chevron "hex" grid tile (same SVG as my-jarvis)
const HEX_GRID =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='43.4' viewBox='0 0 50 43.4'%3E%3Cpolygon fill='none' stroke='%23003366' stroke-width='0.5' points='25,0 50,14.4 50,43.4 25,28.9 0,43.4 0,14.4'/%3E%3C/svg%3E\")";

/** Floating particle network behind the landing page (cyan and red dots, linked when close). */
function ParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Fewer particles on small screens keeps phones smooth
    const count = width < 640 ? 55 : 100;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.7 ? "#ff4444" : "#00d4ff",
    }));

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 8, 20, 0.1)";
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${1 - dist / 100})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-60" aria-hidden="true" />;
}

/** CSS arc reactor: outer ring, eight light spokes, a spinning inner ring, the core, and the white triangle. */
function ArcReactor() {
  return (
    <div className="relative shrink-0 w-[clamp(140px,min(36vw,30vh),300px)] aspect-square [animation:jarvisReactorPulse_3.14s_ease-in-out_infinite]">
      <div className="absolute inset-0 rounded-full border-[3px] border-[#334455] shadow-[0_0_30px_rgba(0,212,255,0.3)]" />
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 w-1/3 h-1 opacity-60 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] origin-[0_50%]"
          style={{ transform: `rotate(${i * 45}deg)` }}
        />
      ))}
      <div className="absolute inset-[13.3%] rounded-full border-2 border-[#00d4ff] border-t-transparent [animation:jarvisSpin_3s_linear_infinite]" />
      <div className="absolute inset-[26.6%] rounded-full bg-[radial-gradient(circle,#00ffff_0%,#00d4ff_30%,#0066ff_60%,transparent_70%)] shadow-[0_0_60px_#00d4ff,0_0_100px_#0066ff,inset_0_0_30px_rgba(255,255,255,0.3)] [animation:jarvisCorePulse_2s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[clamp(12px,2.8vmin,25px)] border-r-[clamp(12px,2.8vmin,25px)] border-b-[clamp(21px,4.8vmin,43px)] border-l-transparent border-r-transparent border-b-[rgba(255,255,255,0.8)] drop-shadow-[0_0_10px_#00ffff]" />
    </div>
  );
}

/**
 * Landing page (after my-jarvis): arc reactor, particle network, boot terminal, and INITIALIZE,
 * which enters the dashboard and starts the voice link (the click also lets the browser play audio).
 */
export function LandingPage({ onEnter }) {
  const [lines, setLines] = useState(0);
  const [showEnter, setShowEnter] = useState(false);
  const terminalRef = useRef(null);

  // One boot line every 300ms; the count comes from the timer, so a double-run effect cannot repeat lines
  useEffect(() => {
    const started = performance.now();
    const timer = setInterval(() => {
      const shown = Math.min(BOOT_MESSAGES.length, Math.floor((performance.now() - started) / LINE_MS) + 1);
      setLines(shown);
      if (shown >= BOOT_MESSAGES.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lines < BOOT_MESSAGES.length) return undefined;
    const timer = setTimeout(() => setShowEnter(true), 500);
    return () => clearTimeout(timer);
  }, [lines]);

  // Keep the newest line in view (after layout, once the cursor line is gone too)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [lines, showEnter]);

  // Enter also starts the system once the button is up
  useEffect(() => {
    if (!showEnter) return undefined;
    const onKey = (e) => {
      if (e.key === "Enter") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEnter, onEnter]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col items-center justify-center gap-[clamp(10px,3vh,40px)] px-4 pt-[calc(env(safe-area-inset-top)+56px)] pb-[calc(env(safe-area-inset-bottom)+72px)] bg-[linear-gradient(135deg,#000814_0%,#001d3d_50%,#000814_100%)] font-[family-name:var(--font-orbitron)] select-none">
      <ParticleNetwork />
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: HEX_GRID }} />

      <ArcReactor />

      <div className="relative z-10 flex flex-col items-center text-center max-w-full">
        <h1 className="m-0 font-bold text-[clamp(30px,8.5vw,72px)] tracking-[clamp(6px,2.6vw,20px)] pl-[clamp(6px,2.6vw,20px)] bg-[linear-gradient(180deg,#ffffff_0%,#00d4ff_50%,#0066ff_100%)] bg-clip-text text-transparent [text-shadow:0_0_30px_rgba(0,212,255,0.5)] whitespace-nowrap">
          J.A.R.V.I.S.
        </h1>
        <p className="mt-[clamp(8px,2vh,20px)] mb-0 text-[clamp(10px,2.6vw,14px)] tracking-[clamp(3px,1.4vw,8px)] text-[#668899] leading-relaxed">
          JUST A RATHER VERY INTELLIGENT SYSTEM
        </p>
      </div>

      {/* Boot sequence terminal */}
      <div
        ref={terminalRef}
        className="relative z-10 w-[min(500px,100%)] max-h-[min(200px,28vh)] overflow-y-auto rounded-lg border border-[#003366] bg-[rgba(0,20,40,0.8)] p-4 font-['Courier_New',monospace] text-[12px] text-[#00d4ff] shadow-[0_0_20px_rgba(0,100,200,0.3)]"
        aria-live="polite">
        {BOOT_MESSAGES.slice(0, lines).map((text, i) => (
          <div key={i} className="mb-1 min-h-[1em]" style={{ color: lineColor(text) }}>
            {text && <span className="text-[#ff4444]">{">"}</span>} {text}
          </div>
        ))}
        {lines < BOOT_MESSAGES.length && <span className="[animation:jarvisBlink_0.5s_infinite]">_</span>}
      </div>

      {/* INITIALIZE (keeps its space while hidden so nothing jumps) */}
      <div className="relative z-10 h-[clamp(48px,7vh,58px)] flex items-center">
        {showEnter && (
          <button
            type="button"
            onClick={onEnter}
            className="jarvis-enter-button px-[clamp(28px,8vw,48px)] py-[clamp(10px,1.8vh,16px)] text-[clamp(14px,3.6vw,18px)] font-bold tracking-[6px] pl-[calc(clamp(28px,8vw,48px)+6px)] text-white rounded-lg border-2 border-[#ff4444] bg-[linear-gradient(135deg,rgba(200,50,50,0.8),rgba(150,30,30,0.8))] shadow-[0_0_30px_rgba(255,68,68,0.5)] cursor-pointer"
            autoFocus>
            INITIALIZE
          </button>
        )}
      </div>

      {/* Stark Industries mark */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+24px)] flex items-center gap-3 text-[#445566] text-[12px] tracking-[4px]">
        <div className="w-[30px] h-[30px] border-2 border-[#445566] rounded flex items-center justify-center font-bold text-[16px] tracking-normal">S</div>
        STARK INDUSTRIES
      </div>

      {/* Avengers-style corner brackets */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-4 sm:top-5 sm:left-5 w-10 h-10 sm:w-[60px] sm:h-[60px] border-t-2 border-l-2 border-[#ff4444]" />
      <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-[60px] sm:h-[60px] border-t-2 border-r-2 border-[#ff4444]" />
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] left-4 sm:bottom-5 sm:left-5 w-10 h-10 sm:w-[60px] sm:h-[60px] border-b-2 border-l-2 border-[#ff4444]" />
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 sm:bottom-5 sm:right-5 w-10 h-10 sm:w-[60px] sm:h-[60px] border-b-2 border-r-2 border-[#ff4444]" />
    </div>
  );
}

export default LandingPage;
