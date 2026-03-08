import React from 'react';
import { useDifficulty } from '../lib/context';
import { DifficultyMode } from '../lib/gemini';
import { playClick } from '../lib/audio';

const MODES: { key: DifficultyMode; label: string; desc: string; color: string; icon: string }[] = [
  { key: 'CREATIVE', label: 'CREATIVE', desc: 'Lenient: only flags blatant errors. Good for marketing copy.', color: '#5aaf2a', icon: '🎨' },
  { key: 'SURVIVAL', label: 'SURVIVAL', desc: 'Normal: balanced fact-checking. Recommended for most use cases.', color: '#e5a100', icon: '⚔️' },
  { key: 'HARDCORE', label: 'HARDCORE', desc: 'Strict: demands citations for everything. Use for legal or medical text.', color: '#cc1111', icon: '🔥' },
];

export function DomainSelector() {
  const { difficulty, setDifficulty } = useDifficulty();

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      <div style={{
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '11px',
        color: '#7a7a7a',
        textAlign: 'center',
        marginBottom: '6px',
        letterSpacing: '0.06em',
      }}>
        ⚔️ SELECT DIFFICULTY
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '8px',
        color: '#3a3a3a',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        AFFECTS HOW STRICTLY GEMINI AUDITS TEXT
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {MODES.map(mode => {
          const active = difficulty === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => { setDifficulty(mode.key); playClick(); }}
              style={{
                background: active ? '#1e1e1e' : '#7a7a7a',
                border: '3px solid #000',
                boxShadow: active
                  ? `inset 3px 3px 0 rgba(0,0,0,0.7), inset -3px -3px 0 rgba(255,255,255,0.2), 0 0 0 2px ${mode.color}`
                  : 'inset 3px 3px 0 rgba(255,255,255,0.4), inset -3px -3px 0 rgba(0,0,0,0.6)',
                cursor: 'pointer',
                padding: '16px 12px',
                minWidth: '160px',
                textAlign: 'center',
                transform: active ? 'translateY(3px)' : 'none',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              aria-pressed={active}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px', filter: 'drop-shadow(2px 2px 0 #000)' }}>{mode.icon}</div>
              <div style={{
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '10px',
                color: active ? mode.color : '#fff',
                marginBottom: '6px',
                letterSpacing: '0.05em',
              }}>
                [ {mode.label} ]
              </div>
              <div style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '10px',
                color: '#888',
                lineHeight: 1.5,
                maxWidth: '160px',
              }}>
                {mode.desc}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
