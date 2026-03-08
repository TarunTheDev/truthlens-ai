import React, { useEffect, useRef } from 'react';

export function ScrollIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      }),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="tl-intro-banner tl-scroll-reveal" ref={ref}>
      {/* CSS pixel logo */}
      <div className="tl-pixel-logo tl-intro-logo-css" aria-label="TruthLens">
        <span className="tl-pl-t">T</span><span className="tl-pl-l">L</span>
      </div>
      <div>
        <div className="tl-intro-text">
          TRUTHLENS — AI HALLUCINATION AUDITOR
        </div>
        <div className="tl-intro-sub">
          The only tool that sentence-by-sentence fact-checks AI output using Google Gemini, assigns a trust score, flags fabricated claims, and lets you rewrite or export the results — in seconds.
        </div>
      </div>
    </section>
  );
}
