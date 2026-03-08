import React, { useState, useEffect } from 'react';

const DEMO_TEXT = "Albert Einstein was born in 1879 in Germany. He won the Nobel Prize in 1921 for his Theory of Relativity. Einstein developed the famous equation E=mc2. He moved to the United States in 1933 and worked at Princeton University. The Great Wall of China is visible from space with the naked eye. Humans only use about 10 percent of their brain capacity. Einstein passed away in 1955 in New Jersey.";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDemo = () => {
    document.getElementById('auditor-section')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('truthlens:fill-demo', { detail: DEMO_TEXT }));
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: scrolled ? 'rgba(8,10,16,0.97)' : 'rgba(8,10,16,0.75)',
        backdropFilter: scrolled ? 'blur(18px)' : 'blur(8px)',
        borderBottom: scrolled ? '2px solid rgba(77,217,224,0.18)' : '2px solid rgba(255,255,255,0.04)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.7)' : 'none',
        transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
      }}
    >
      {/* Top pixel accent strip */}
      <div style={{
        height: '3px',
        background: 'repeating-linear-gradient(90deg, #4a7c59 0px, #4a7c59 8px, #8b6914 8px, #8b6914 16px, #4dd9e0 16px, #4dd9e0 24px, #cc1111 24px, #cc1111 32px, #FFD700 32px, #FFD700 40px)',
      }} />

      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="#hero-section"
          className="flex items-center gap-3 shrink-0"
          style={{ textDecoration: 'none' }}
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          {/* CSS pixel logo — no PNG */}
          <div className="tl-pixel-logo" aria-label="TruthLens logo">
            <span className="tl-pl-t">T</span><span className="tl-pl-l">L</span>
          </div>
          <span
            className="text-white"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: 'clamp(9px, 2vw, 14px)',
              letterSpacing: '0.05em',
            }}
          >
            <span style={{ color: '#fff' }}>Truth</span><span style={{ color: '#4dd9e0', textShadow: '0 0 10px #4dd9e0aa' }}>Lens</span>
          </span>
        </a>

        {/* Center badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1"
          style={{
            background: 'rgba(77,217,224,0.07)',
            border: '1px solid rgba(77,217,224,0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ color: '#4dd9e0', fontFamily: '"Press Start 2P", cursive', fontSize: '8px' }}>
            💎 AI HALLUCINATION AUDITOR
          </span>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-2 md:gap-3 shrink-0">
          <button
            onClick={handleDemo}
            className="mc-button"
            style={{ padding: '6px 10px', fontSize: '9px' }}
            aria-label="Load demo text"
          >
            [ DEMO ]
          </button>
          <a
            href="https://github.com/TarunTheDev/truthlens-ai"
            target="_blank"
            rel="noreferrer"
            className="mc-button"
            style={{ padding: '6px 10px', fontSize: '9px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            aria-label="GitHub repository"
          >
            [ GITHUB ]
          </a>
        </div>
      </div>
    </nav>
  );
}