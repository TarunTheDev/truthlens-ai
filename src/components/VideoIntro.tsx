import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onDone: () => void;
}

export function VideoIntro({ onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [fading, setFading] = useState(false);

  const finish = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onDone, 900);
  };

  useEffect(() => {
    // Show skip button after 1.2 s
    const t1 = setTimeout(() => setShowSkip(true), 1200);

    const vid = videoRef.current;
    if (!vid) {
      clearTimeout(t1);
      return;
    }

    vid.play().catch(() => finish()); // if autoplay blocked, skip immediately

    const onEnd = () => finish();
    vid.addEventListener('ended', onEnd);

    return () => {
      clearTimeout(t1);
      vid.removeEventListener('ended', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.85s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
      onClick={finish}
      title="Click to skip"
    >
      {/* Pixel scanlines overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <video
        ref={videoRef}
        src="/intro.mp4"
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* TruthLens brand overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 3,
          pointerEvents: 'none',
          animation: 'introFadeUp 1.2s ease 0.4s both',
        }}
      >
        <div
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: 'clamp(10px, 2.5vw, 18px)',
            color: '#4dd9e0',
            letterSpacing: '0.25em',
            textShadow: '0 0 30px #4dd9e0aa, 4px 4px 0 #000',
            marginBottom: '10px',
          }}
        >
          TRUTHLENS
        </div>
        <div
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: 'clamp(6px, 1.2vw, 9px)',
            color: '#555',
            letterSpacing: '0.2em',
          }}
        >
          AI HALLUCINATION AUDITOR
        </div>
      </div>

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={e => { e.stopPropagation(); finish(); }}
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '4%',
            zIndex: 4,
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid #333',
            color: '#555',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '8px',
            padding: '8px 14px',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            transition: 'color 0.2s, border-color 0.2s',
            animation: 'introFadeUp 0.5s ease both',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#4dd9e0';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#555';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#333';
          }}
        >
          SKIP ▶
        </button>
      )}
    </div>
  );
}
