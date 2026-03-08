import React from 'react';
import { AuditHistoryEntry } from '../lib/types';
import { clearHistory, formatTimeAgo } from '../lib/history';
import { playClick } from '../lib/audio';

interface Props {
  history: AuditHistoryEntry[];
  onRestore: (entry: AuditHistoryEntry) => void;
  onHistoryChange: () => void;
}

export function AuditHistory({ history, onRestore, onHistoryChange }: Props) {
  if (history.length === 0) return null;

  const handleClear = () => {
    clearHistory();
    playClick();
    onHistoryChange();
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '11px', color: '#7a7a7a', letterSpacing: '0.06em' }}>
          📜 AUDIT HISTORY
        </div>
        <button
          onClick={handleClear}
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '8px',
            color: '#cc1111',
            background: 'none',
            border: '2px solid #cc1111',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          [ CLEAR ALL ]
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((entry) => {
          const scoreColor = entry.trust_score >= 70 ? '#5aaf2a' : entry.trust_score >= 40 ? '#e5a100' : '#cc1111';
          return (
            <div
              key={entry.id}
              style={{
                background: '#1e1e1e',
                border: '3px solid #000',
                boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.06), inset -2px -2px 0 rgba(0,0,0,0.5)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onClick={() => { onRestore(entry); playClick(); }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#262626')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1e1e1e')}
            >
              {/* Score circle */}
              <div style={{
                width: '44px',
                height: '44px',
                background: '#111',
                border: `3px solid ${scoreColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: scoreColor }}>
                  {entry.trust_score}
                </span>
              </div>

              {/* Middle info */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '12px',
                  color: '#ccc',
                  marginBottom: '5px',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '400px',
                }}>
                  {entry.inputPreview}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#cc1111' }}>
                    ❌ {entry.false_count} FALSE
                  </span>
                  <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#555' }}>
                    📄 {entry.total_sentences} SENTENCES
                  </span>
                </div>
              </div>

              {/* Right: time + restore */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#3a3a3a' }}>
                  {formatTimeAgo(entry.timestamp)}
                </span>
                <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#4dd9e0', border: '1px solid #4dd9e0', padding: '2px 6px' }}>
                  [ RESTORE ]
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
