import React, { useState, useEffect, useRef } from 'react';
import { useDifficulty, useToast } from '../lib/context';
import { playClick, playMineStart } from '../lib/audio';

interface Props {
  onAudit: (text: string) => void;
  isLoading: boolean;
  loadingMsg?: string;
}

const DEMO_TEXT =
  'Albert Einstein was born in 1879 in Germany. He won the Nobel Prize in 1921 for his Theory of Relativity. Einstein developed the famous equation E=mc2. He moved to the United States in 1933 and worked at Princeton University. The Great Wall of China is visible from space with the naked eye. Humans only use about 10 percent of their brain capacity. Einstein passed away in 1955 in New Jersey at age 77.';

const DIFF_COLORS: Record<string, string> = {
  CREATIVE: '#5aaf2a',
  SURVIVAL: '#e5a100',
  HARDCORE: '#cc1111',
};

const DIFF_LABELS: Record<string, string> = {
  CREATIVE: '[ CREATIVE MODE — LENIENT ]',
  SURVIVAL: '[ SURVIVAL MODE — NORMAL ]',
  HARDCORE: '[ HARDCORE MODE — STRICT ]',
};

export function AuditorPanel({ onAudit, isLoading, loadingMsg }: Props) {
  const [text, setText] = useState('');
  const { difficulty } = useDifficulty();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listen for demo fill event from Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      setText(detail);
      setTimeout(() => textareaRef.current?.focus(), 100);
    };
    window.addEventListener('truthlens:fill-demo', handler);
    return () => window.removeEventListener('truthlens:fill-demo', handler);
  }, []);

  const handleAudit = () => {
    if (text.trim().length < 50) {
      showToast('INVENTORY EMPTY: ADD AT LEAST 50 CHARACTERS!', 'error');
      playClick();
      textareaRef.current?.focus();
      return;
    }
    if (text.length > 5000) {
      showToast('STACK OVERFLOW: MAX 5000 CHARACTERS!', 'error');
      playClick();
      return;
    }
    playMineStart();
    onAudit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAudit();
    }
  };

  const charPct = (text.length / 5000) * 100;
  const charColor = charPct > 90 ? '#cc1111' : charPct > 70 ? '#e5a100' : '#5aaf2a';
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const sentenceCount = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 4).length;

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16" id="auditor-section">
      {/* Panel outer wrapper */}
      <div className="mc-panel">
        {/* Title bar */}
        <div
          style={{
            background: '#111',
            borderBottom: '3px solid #000',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '11px',
              color: '#7a7a7a',
              letterSpacing: '0.06em',
            }}
          >
            📦 [ PASTE AI TEXT HERE ]
          </span>

          <div className="flex gap-3 items-center flex-wrap">
            {/* Difficulty badge */}
            <div
              style={{
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '9px',
                color: DIFF_COLORS[difficulty] || '#e5a100',
                background: '#1a1a1a',
                border: `2px solid ${DIFF_COLORS[difficulty] || '#e5a100'}`,
                padding: '3px 8px',
              }}
            >
              {DIFF_LABELS[difficulty]}
            </div>

            <button
              onClick={() => {
                setText(DEMO_TEXT);
                playClick();
                textareaRef.current?.focus();
              }}
              style={{
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '9px',
                color: '#4dd9e0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
              disabled={isLoading}
            >
              [ TRY EXAMPLE ]
            </button>
          </div>
        </div>

        {/* Input area */}
        <div style={{ padding: '16px', background: '#2d2d2d' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'Paste AI-generated text here to fact-check it...\n\nTip: Press Ctrl+Enter to audit instantly.'}
            className="mc-input"
            style={{ height: '220px', lineHeight: 1.9, fontSize: '11px' }}
            maxLength={5000}
            disabled={isLoading}
            aria-label="AI text input for auditing"
          />
          {/* Live stats bar */}
          {text.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              {[['📝', 'WORDS', wordCount], ['📄', 'SENTENCES~', sentenceCount], ['🔤', 'CHARS', text.length]].map(([ico, lbl, val]) => (
                <div key={String(lbl)} style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#555', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span>{ico}</span>
                  <span style={{ color: '#3a3a3a' }}>{lbl}:</span>
                  <span style={{ color: '#7a7a7a' }}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Character counter + Clear */}
            <div style={{ minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: '9px',
                    color: charColor,
                    letterSpacing: '0.04em',
                  }}
                >
                  BLOCKS USED: {text.length}/5000
                </div>
                {text.length > 0 && (
                  <button
                    onClick={() => { setText(''); textareaRef.current?.focus(); }}
                    disabled={isLoading}
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#cc1111', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                  >[ CLEAR ]</button>
                )}
              </div>
              {/* Mini progress bar */}
              <div
                style={{
                  height: '8px',
                  background: '#111',
                  border: '2px solid #000',
                  boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.8)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(charPct, 100)}%`,
                    height: '100%',
                    background: charColor,
                    transition: 'width 0.2s ease, background-color 0.3s',
                  }}
                />
              </div>
            </div>

            {/* Audit button */}
            <button
              onClick={handleAudit}
              disabled={isLoading}
              className="mc-button"
              style={{
                padding: '12px 20px',
                fontSize: '11px',
                background: isLoading ? '#5a5a5a' : '#7a7a7a',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '220px',
                justifyContent: 'center',
              }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '16px',
                      animation: 'mine 0.4s infinite alternate ease-in-out',
                      transformOrigin: 'bottom right',
                    }}
                  >
                    ⛏️
                  </span>
                  {loadingMsg || 'MINING FOR LIES...'}
                </>
              ) : (
                '>> AUDIT THIS TEXT <<'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helper hint */}
      <div
        style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '8px',
          color: '#3a3a3a',
          textAlign: 'center',
          marginTop: '8px',
          letterSpacing: '0.05em',
        }}
      >
        MIN 50 CHARS · MAX 5000 · CTRL+ENTER TO AUDIT · POWERED BY GEMINI 2.0 FLASH
      </div>
    </section>
  );
}

