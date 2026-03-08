import React from 'react';
import { AuditResult } from '../lib/types';

interface Props {
  result: AuditResult | null;
}

const BLOCK_TYPES = [
  { key: 'FABRICATED_FACT',    icon: '🪨', title: 'FABRICATED FACT',    desc: 'Completely invented facts with no basis in reality.', bg: '#3a3a3a', border: '#666',    color: '#aaaaaa' },
  { key: 'FALSE_SOURCE',       icon: '🔗', title: 'FALSE SOURCE',       desc: 'Invented URLs or citations that lead nowhere.', bg: '#2a2a3a', border: '#4455aa',       color: '#6677cc' },
  { key: 'FALSE_CONNECTION',   icon: '⛓️', title: 'FALSE CONNECTION',   desc: 'Real facts combined in a logically wrong way.', bg: '#3a2a2a', border: '#cc6644',       color: '#dd8866' },
  { key: 'CONTEXT_DISTORTION', icon: '📜', title: 'CONTEXT DISTORTION', desc: 'True facts applied to the wrong context.', bg: '#2a3a2a', border: '#44aa66',            color: '#55cc77' },
  { key: 'KNOWLEDGE_GAP',      icon: '⏰', title: 'KNOWLEDGE GAP',      desc: 'Too recent for AI to verify — beyond its training window.', bg: '#0d2a2e', border: '#4dd9e0', color: '#4dd9e0' },
];

export function TypesPanel({ result }: Props) {
  const total = result
    ? result.sentences.filter(s => s.hallucination_type !== 'NONE').length
    : 0;

  const getCounts = (key: string) => {
    if (!result) return null;
    return result.sentences.filter(s => s.hallucination_type === key).length;
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      {/* Title */}
      <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '11px', color: '#7a7a7a', textAlign: 'center', marginBottom: '6px', letterSpacing: '0.06em' }}>
        📦 BLOCK CLASSIFICATION
      </div>
      {result && (
        <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: total > 0 ? '#cc1111' : '#5aaf2a', textAlign: 'center', marginBottom: '18px' }}>
          {total > 0 ? `${total} HALLUCINATION${total !== 1 ? 'S' : ''} IDENTIFIED` : '✅ NO HALLUCINATIONS DETECTED'}
        </div>
      )}
      {!result && (
        <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#3a3a3a', textAlign: 'center', marginBottom: '18px' }}>
          [ AUDIT TEXT TO SEE LIVE COUNTS ]
        </div>
      )}

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {BLOCK_TYPES.map(block => {
          const count = getCounts(block.key);
          const pct = total > 0 && count !== null ? Math.round((count / total) * 100) : 0;
          return (
            <div
              key={block.key}
              style={{
                background: block.bg,
                border: `3px solid #000`,
                boxShadow: `inset 3px 3px 0 rgba(255,255,255,0.12), inset -3px -3px 0 rgba(0,0,0,0.5)`,
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'transform 0.1s',
                cursor: 'default',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px', filter: 'drop-shadow(2px 2px 0 #000)' }}>
                {block.icon}
              </div>
              <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#ccc', marginBottom: '10px', lineHeight: 1.6, minHeight: '32px' }}>
                {block.title}
              </div>
              <div style={{
                fontFamily: '"Press Start 2P", cursive',
                fontSize: 'clamp(22px, 5vw, 32px)',
                color: count !== null && count > 0 ? '#cc1111' : count === 0 ? '#5aaf2a' : '#555',
                textShadow: '3px 3px 0 #000',
                marginBottom: '10px',
              }}>
                {count !== null ? count : '--'}
              </div>

              {/* Percentage bar — only shows after audit */}
              {count !== null && total > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ height: '6px', background: '#111', border: '2px solid #000', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `repeating-linear-gradient(90deg, ${block.color} 0, ${block.color} 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 6px)`,
                      transition: 'width 0.8s ease-out',
                    }} />
                  </div>
                  <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: block.color }}>{pct}% of issues</div>
                </div>
              )}

              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#555', lineHeight: 1.5 }}>
                {block.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

