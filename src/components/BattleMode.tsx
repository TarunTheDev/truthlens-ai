import React, { useState, useEffect } from 'react';
import { auditText } from '../lib/gemini';
import { AuditResult } from '../lib/types';
import { playWinner, playDeath, playClick } from '../lib/audio';

const CHATGPT_DEMO = "The Great Wall of China is visible from space with the naked eye. Napoleon Bonaparte was very short, standing only 5 feet 2 inches tall. Albert Einstein failed mathematics in school as a child. Lightning never strikes the same place twice. Humans only use 10 percent of their brain capacity.";
const GEMINI_DEMO = "The Great Wall of China is actually not visible from low Earth orbit without aid. Napoleon was 5 feet 7 inches tall, average for his era. Einstein excelled at mathematics and physics from a young age. Lightning frequently strikes the same place multiple times, as tall buildings and towers are struck repeatedly. Modern neuroscience shows humans use virtually all of their brain, just different parts at different times.";

// ─── Fireworks ────────────────────────────────────────────────────────────────
function Fireworks() {
  const sparks = [
    { color: '#FFD700', x: '20%', y: '30%', delay: 0 },
    { color: '#4dd9e0', x: '70%', y: '20%', delay: 0.2 },
    { color: '#5aaf2a', x: '50%', y: '40%', delay: 0.1 },
    { color: '#cc1111', x: '35%', y: '60%', delay: 0.3 },
    { color: '#FFD700', x: '80%', y: '55%', delay: 0.15 },
    { color: '#4dd9e0', x: '15%', y: '70%', delay: 0.25 },
    { color: '#5aaf2a', x: '60%', y: '75%', delay: 0.05 },
    { color: '#FFD700', x: '90%', y: '35%', delay: 0.35 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {sparks.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: '12px',
            height: '12px',
            background: s.color,
            border: '2px solid #000',
            animation: `pixelFirework 1.2s ease-out ${s.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Player Panel ─────────────────────────────────────────────────────────────
function PlayerPanel({
  player, icon, text, setText, result, isLoading, disabled,
}: {
  player: string; icon: string; text: string; setText: (v: string) => void;
  result: AuditResult | null; isLoading: boolean; disabled: boolean;
}) {
  const score = result?.trust_score ?? null;
  const scoreColor = score === null ? '#555' : score >= 70 ? '#5aaf2a' : score >= 40 ? '#e5a100' : '#cc1111';

  return (
    <div style={{ flex: 1, minWidth: '260px' }}>
      {/* Header */}
      <div style={{
        background: '#111',
        border: '3px solid #000',
        borderBottom: 'none',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '22px', filter: 'drop-shadow(2px 2px 0 #000)' }}>{icon}</span>
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', color: '#7a7a7a' }}>
          [ PLAYER: {player} ]
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`Paste ${player} output here...`}
        disabled={disabled || isLoading}
        className="mc-input"
        style={{ height: '160px', fontSize: '11px', lineHeight: 1.7, display: 'block' }}
      />

      {/* Score bar */}
      {isLoading && !result && (
        <div style={{
          background: '#2a2a2a',
          border: '3px solid #000',
          borderTop: 'none',
          padding: '10px 14px',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '9px',
          color: '#e5a100',
          textAlign: 'center',
        }}>
          <span style={{ display: 'inline-block', animation: 'mine 0.4s infinite alternate ease-in-out', marginRight: '8px' }}>⛏️</span>
          AUDITING...
        </div>
      )}
      {result && (
        <div style={{
          background: '#1a1a1a',
          border: '3px solid #000',
          borderTop: 'none',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#555' }}>TRUST SCORE</span>
            <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', color: scoreColor }}>
              {score}/100
            </span>
          </div>
          <div style={{ height: '12px', background: '#111', border: '2px solid #000', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${score ?? 0}%`,
              background: `repeating-linear-gradient(90deg, ${scoreColor} 0, ${scoreColor} 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 8px)`,
              transition: 'width 0.8s ease-out',
            }} />
          </div>
          <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#555', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>FALSE: {result.false_count}</span>
            <span>SENTENCES: {result.total_sentences}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function BattleMode() {
  const [isOn, setIsOn] = useState(false);
  const [p1Text, setP1Text] = useState('');
  const [p2Text, setP2Text] = useState('');
  const [p1Result, setP1Result] = useState<AuditResult | null>(null);
  const [p2Result, setP2Result] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerScore, setWinnerScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const loadDemo = () => {
    setP1Text(CHATGPT_DEMO);
    setP2Text(GEMINI_DEMO);
    setP1Result(null);
    setP2Result(null);
    setWinner(null);
    playClick();
  };

  const startBattle = async () => {
    if (!p1Text.trim() || !p2Text.trim()) {
      setError('BOTH PLAYERS NEED TEXT!');
      return;
    }
    setLoading(true);
    setError(null);
    setP1Result(null);
    setP2Result(null);
    setWinner(null);

    try {
      const [r1, r2] = await Promise.all([
        auditText(p1Text, 'SURVIVAL'),
        auditText(p2Text, 'SURVIVAL'),
      ]);
      setP1Result(r1);
      setP2Result(r2);

      await new Promise(r => setTimeout(r, 400));

      if (r1.trust_score > r2.trust_score) {
        setWinner('PLAYER 1');
        setWinnerScore(r1.trust_score - r2.trust_score);
      } else if (r2.trust_score > r1.trust_score) {
        setWinner('PLAYER 2');
        setWinnerScore(r2.trust_score - r1.trust_score);
      } else {
        setWinner('DRAW');
        setWinnerScore(0);
      }
      playWinner();
    } catch (e: any) {
      const raw: string = e?.message || '';
      let friendlyError = 'BATTLE FAILED — TRY AGAIN';
      if (raw === 'API_KEY_MISSING') {
        friendlyError = 'API KEY MISSING! ADD VITE_GEMINI_API_KEY TO .ENV';
      } else if (raw.startsWith('GEMINI_API_ERROR:')) {
        const detail = raw.replace('GEMINI_API_ERROR:', '').trim();
        if (detail.toLowerCase().includes('quota') || detail.toLowerCase().includes('429')) {
          friendlyError = 'RATE LIMIT HIT! WAIT ~60 SECONDS AND TRY AGAIN.';
        } else {
          friendlyError = `API ERROR: ${detail.slice(0, 80)}`;
        }
      } else if (raw === 'JSON_PARSE_FAILURE' || raw === 'INVALID_JSON_RESPONSE') {
        friendlyError = 'FAILED TO PARSE RESPONSE — TRY AGAIN';
      } else if (raw === 'EMPTY_RESPONSE') {
        friendlyError = 'EMPTY RESPONSE — CHECK YOUR API KEY';
      }
      setError(friendlyError);
      playDeath();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      <div className="mc-panel" style={{ overflow: 'hidden' }}>
        {/* Header bar */}
        <div style={{
          background: '#111',
          borderBottom: '3px solid #000',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '11px', color: '#e5a100' }}>
            ⚔️ PVP BATTLE MODE
          </span>

          {/* Lever toggle */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => { setIsOn(!isOn); playClick(); }}
            role="switch"
            aria-checked={isOn}
          >
            <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: isOn ? '#5aaf2a' : '#555' }}>
              {isOn ? 'ON' : 'OFF'}
            </span>
            <div
              style={{
                width: '44px',
                height: '22px',
                background: isOn ? '#1a3a1a' : '#111',
                border: '3px solid #000',
                boxShadow: 'inset 3px 3px 0 rgba(0,0,0,0.8)',
                position: 'relative',
                transition: 'background 0.15s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  width: '16px',
                  height: '16px',
                  background: isOn ? '#5aaf2a' : '#7a7a7a',
                  border: '3px solid #000',
                  boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.4)',
                  transform: isOn ? 'translateX(22px)' : 'translateX(0)',
                  transition: 'transform 0.15s, background 0.15s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Battle content */}
        {isOn && (
          <div style={{ padding: '16px', animation: 'fadeInCard 0.4s ease-out' }}>
            {/* Demo fill */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <button
                className="mc-button"
                onClick={loadDemo}
                style={{ fontSize: '9px', padding: '6px 14px' }}
              >
                [ LOAD DEMO BATTLE ]
              </button>
            </div>

            {/* Player panels */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'flex-start' }}>
              <PlayerPanel
                player="CHATGPT" icon="🧑"
                text={p1Text} setText={setP1Text}
                result={p1Result} isLoading={loading} disabled={loading}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: 'clamp(16px, 4vw, 28px)',
                color: '#cc1111',
                textShadow: '3px 3px 0 #000',
                flexShrink: 0,
              }}>
                VS
              </div>
              <PlayerPanel
                player="GEMINI" icon="🤖"
                text={p2Text} setText={setP2Text}
                result={p2Result} isLoading={loading} disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#1a0000',
                border: '3px solid #cc1111',
                padding: '10px',
                textAlign: 'center',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '9px',
                color: '#cc1111',
                marginBottom: '12px',
              }}>
                {error}
              </div>
            )}

            {/* Battle button */}
            <div style={{ textAlign: 'center', marginBottom: winner ? '16px' : '0' }}>
              <button
                className="mc-button-red"
                onClick={startBattle}
                disabled={loading}
                style={{ padding: '12px 28px', fontSize: '11px', letterSpacing: '0.06em' }}
              >
                {loading ? '⏳ BATTLING...' : '>> START BATTLE <<'}
              </button>
            </div>

            {/* Winner banner */}
            {winner && (
              <div style={{ position: 'relative', marginTop: '16px' }}>
                <Fireworks />
                <div
                  style={{
                    background: winner === 'DRAW' ? '#2a2a00' : '#1a1200',
                    border: `4px solid ${winner === 'DRAW' ? '#7a7a7a' : '#FFD700'}`,
                    boxShadow: `inset 3px 3px 0 rgba(255,215,0,0.3), inset -3px -3px 0 rgba(0,0,0,0.5), 0 0 16px rgba(255,215,0,0.2)`,
                    padding: '20px',
                    textAlign: 'center',
                    animation: 'winnerDrop 0.5s ease-out',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div style={{
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: 'clamp(14px, 3vw, 22px)',
                    color: '#FFD700',
                    textShadow: '3px 3px 0 #000',
                    marginBottom: '8px',
                  }}>
                    {winner === 'DRAW' ? '🤝 IT\'S A DRAW!' : `🏆 ${winner} WINS!`}
                  </div>
                  {winner !== 'DRAW' && (
                    <div style={{
                      fontFamily: '"Press Start 2P", cursive',
                      fontSize: '10px',
                      color: '#5aaf2a',
                    }}>
                      +{winnerScore}% ACCURACY ADVANTAGE
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

