import React, { useEffect, useRef } from 'react';
import { HeroCanvas } from './HeroCanvas';

function StatBlock({
  icon, number, label, glowColor, delay = 0
}: {
  icon: string; number: string; label: string; glowColor: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="tl-stat-block"
      style={{ animationDelay: `${delay}s`, '--glow': glowColor } as React.CSSProperties}
      onMouseEnter={() => {
        if (ref.current) {
          ref.current.style.transform = 'translateY(-6px) scale(1.04)';
          ref.current.style.boxShadow = `0 0 28px ${glowColor}66, inset 2px 2px 0 rgba(255,255,255,0.12)`;
        }
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.transform = '';
          ref.current.style.boxShadow = '';
        }
      }}
    >
      <div className="tl-stat-icon">{icon}</div>
      <div className="tl-stat-num">{number}</div>
      <div className="tl-stat-lbl">{label}</div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rx = ((e.clientY / window.innerHeight) - 0.5) * 6;
      const ry = ((e.clientX / window.innerWidth) - 0.5) * -6;
      const content = el.querySelector<HTMLElement>('.hero-3d-content');
      if (content) content.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const handleLeave = () => {
      const content = el.querySelector<HTMLElement>('.hero-3d-content');
      if (content) content.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="tl-hero-section" id="hero-section">
      {/* Three.js 3D background canvas */}
      <HeroCanvas />
      <div className="hero-radial-glow" />

      {/* ── Floating decorative block images ── */}
      <img src="/mc-grass.png"   aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '8%',  left: '3%',  width: 'clamp(54px,7vw,90px)',  animationDelay: '0s',   opacity: 0.55 }} />
      <img src="/mc-diamond.png" aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '18%', left: '9%',  width: 'clamp(38px,5vw,64px)',  animationDelay: '1.1s', opacity: 0.45 }} />
      <img src="/mc-iron.png"    aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '55%', left: '5%',  width: 'clamp(32px,4vw,52px)',  animationDelay: '2.3s', opacity: 0.35 }} />
      <img src="/mc-gold.png"    aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '72%', left: '12%', width: 'clamp(44px,5.5vw,72px)', animationDelay: '0.7s', opacity: 0.40 }} />
      <img src="/mc-stone.png"   aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '12%', right: '5%', width: 'clamp(40px,5vw,66px)',  animationDelay: '1.8s', opacity: 0.40 }} />
      <img src="/mc-dirt.png"    aria-hidden="true" draggable={false} className="hero-deco-block" style={{ top: '65%', right: '4%', width: 'clamp(30px,4vw,48px)',  animationDelay: '3.0s', opacity: 0.30 }} />

      {/* ── Second character — left side ── */}
      <div className="hero-char2-wrap" aria-hidden="true">
        <img src="/mc-char2.png" alt="" draggable={false} className="hero-char2-img" />
      </div>

      {/* ── Main 3D-perspective content card ── */}
      <div className="hero-3d-content" style={{ transition: 'transform 0.12s ease-out' }}>

        {/* CSS pixel wordmark — no PNG */}
        <div className="hero-wordmark tl-reveal" style={{ animationDelay: '0.1s' }}>
          <span className="hero-wordmark-truth">TRUTH</span><span className="hero-wordmark-lens">LENS</span>
          <span className="hero-wordmark-cursor">_</span>
        </div>

        {/* Eye-brow */}
        <div className="hero-eyebrow tl-reveal" style={{ animationDelay: '0.25s' }}>
          🔍 AI HALLUCINATION AUDITOR
        </div>

        {/* Main headline */}
        <h1 className="hero-h1 tl-reveal" style={{ animationDelay: '0.4s' }}>
          DON'T<br />
          <span className="hero-h1-accent">TRUST AI</span><br />
          BLINDLY
        </h1>

        {/* Sub */}
        <p className="hero-sub tl-reveal" style={{ animationDelay: '0.55s' }}>
          Paste any AI-generated text.<br />
          <span style={{ color: '#4dd9e0' }}>We mine every sentence for lies.</span>
        </p>

        {/* CTA row */}
        <div className="hero-cta-row tl-reveal" style={{ animationDelay: '0.7s' }}>
          <button
            className="hero-btn-primary"
            onClick={() => document.getElementById('auditor-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>⛏️ START AUDITING</span>
          </button>
          <button
            className="hero-btn-ghost"
            onClick={() => {
              document.getElementById('auditor-section')?.scrollIntoView({ behavior: 'smooth' });
              const demo = "Albert Einstein was born in 1879 in Germany. He won the Nobel Prize in 1921 for his Theory of Relativity. Einstein developed the famous equation E=mc2. He moved to the United States in 1933 and worked at Princeton University. The Great Wall of China is visible from space. Humans only use about 10% of their brain. Einstein passed away in 1955.";
              window.dispatchEvent(new CustomEvent('truthlens:fill-demo', { detail: demo }));
            }}
          >
            <span>▶ TRY DEMO</span>
          </button>
        </div>

        {/* Powered-by strip */}
        <div className="hero-powered tl-reveal" style={{ animationDelay: '0.85s' }}>
          🤖 POWERED BY GOOGLE GEMINI · REAL-TIME · ZERO TRUST ASSUMED
        </div>

        {/* ── Stat blocks — in-flow, centered ── */}
        <div className="hero-stats-row tl-reveal" style={{ animationDelay: '1.0s' }}>
          <StatBlock icon="🌍" number="3.4B+" label="AI OUTPUTS DAILY"       glowColor="#5aaf2a" delay={0}   />
          <StatBlock icon="💎" number="67%"   label="CONTAIN FALSE CLAIMS"   glowColor="#4dd9e0" delay={0.1} />
          <StatBlock icon="💰" number="$67B"  label="LOST TO HALLUCINATIONS" glowColor="#FFD700" delay={0.2} />
        </div>
      </div>

      {/* Minecraft character — right side */}
      <div className="hero-char-wrap" id="heroChar">
        <img src="/hero-char.png" alt="TruthLens Hero" draggable={false} className="hero-char-img" />
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll-cue">
        <div className="hero-scroll-arrow" />
        <div className="hero-scroll-text">SCROLL DOWN</div>
      </div>
    </section>
  );
}

