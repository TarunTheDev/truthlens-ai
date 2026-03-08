import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AuditorPanel } from './components/AuditorPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { BattleMode } from './components/BattleMode';
import { TypesPanel } from './components/TypesPanel';
import { UseCases } from './components/UseCases';
import { DomainSelector } from './components/DomainSelector';
import { ComingSoon } from './components/ComingSoon';
import { Footer } from './components/Footer';
import { AuditHistory } from './components/AuditHistory';
import { VideoIntro } from './components/VideoIntro';
import { CursorGlow } from './components/CursorGlow';
import { ScrollIntro } from './components/ScrollIntro';
import { auditText, DifficultyMode } from './lib/gemini';
import { AuditResult, AuditHistoryEntry, WorldDomain } from './lib/types';
import { playDeath, playSuccess } from './lib/audio';
import { ToastContext, DifficultyContext, DomainContext, ToastPayload } from './lib/context';
import { saveToHistory, loadHistory } from './lib/history';

// ─── Floating Pixel Particle ───────────────────────────────────────────────────
const PARTICLE_COLORS = ['#4a7c59', '#8b6914', '#7a7a7a', '#4dd9e0', '#FFD700', '#cc1111'];
const PARTICLE_COUNT = 18;

// Generate once at module level so positions are stable across re-renders
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${8 + Math.floor(Math.random() * 14)}px`,
  duration: `${12 + Math.random() * 20}s`,
  delay: `${Math.random() * 16}s`,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  opacity: 0.06 + Math.random() * 0.1,
}));

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            imageRendering: 'pixelated',
            animation: `particleFloat ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Toast Component ───────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: ToastPayload & { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`mc-toast ${type === 'success' ? 'success' : ''}`}
      style={{ fontFamily: '"Press Start 2P", cursive' }}
      role="alert"
    >
      {type === 'error' && <span className="mr-2">💀</span>}
      {type === 'success' && <span className="mr-2">✅</span>}
      {type === 'info' && <span className="mr-2">📦</span>}
      {message}
    </div>
  );
}

// ─── Death Screen Overlay ──────────────────────────────────────────────────────
function DeathScreen({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        background: 'rgba(180, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
        animation: 'death-screen 0.3s ease-out',
      }}
      onClick={onDismiss}
    >
      <div
        className="text-center px-8 py-10 mc-panel"
        style={{ maxWidth: '480px', width: '90%', border: '4px solid #000' }}
      >
        <div
          className="text-mc-redstone mb-4 pixel-shadow"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: 'clamp(20px, 5vw, 36px)',
            lineHeight: 1.5,
          }}
        >
          YOU DIED
        </div>
        <div
          className="text-white mb-6"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '11px', lineHeight: 1.8 }}
        >
          {message}
        </div>
        <button
          className="mc-button"
          onClick={onDismiss}
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          [ RESPAWN ]
        </button>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
const LOADING_MSGS = [
  '⛏️ MINING FOR LIES...',
  '🔍 CROSS-REFERENCING SOURCES...',
  '🧱 BREAKING DOWN CLAIMS...',
  '📡 QUERYING GEMINI AI...',
  '🕵️ SCANNING FOR HALLUCINATIONS...',
  '💎 EXTRACTING TRUTH ORES...',
  '🗺️ MAPPING CLAIM DISTRIBUTION...',
  '⚗️ ANALYSING CONFIDENCE LEVELS...',
];

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [deathMessage, setDeathMessage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('SURVIVAL');
  const [world, setWorld] = useState<WorldDomain>(null);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [history, setHistory] = useState<AuditHistoryEntry[]>(() => loadHistory());

  const refreshHistory = useCallback(() => setHistory(loadHistory()), []);

  useEffect(() => {
    if (!isLoading) return;
    setLoadingMsg(LOADING_MSGS[0]);
    let i = 1;
    const id = setInterval(() => {
      setLoadingMsg(LOADING_MSGS[i % LOADING_MSGS.length]);
      i++;
    }, 1800);
    return () => clearInterval(id);
  }, [isLoading]);

  const showToast = useCallback((message: string, type: ToastPayload['type'] = 'info') => {
    setToast({ message, type });
  }, []);

  const handleAudit = useCallback(async (text: string) => {
    setIsLoading(true);
    setResult(null);
    setInputText(text);

    try {
      const data = await auditText(text, difficulty, world);
      setResult(data);
      saveToHistory(data, text);
      refreshHistory();

      if (data.trust_score >= 70) {
        playSuccess();
        showToast('AUDIT COMPLETE — HIGH TRUST SCORE!', 'success');
      } else {
        showToast('AUDIT COMPLETE — LIES DETECTED!', 'info');
      }

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      const raw: string = err?.message || '';
      let friendlyMsg = 'UNKNOWN ERROR OCCURRED';

      if (raw === 'API_KEY_MISSING') {
        friendlyMsg = 'API KEY MISSING! ADD VITE_GEMINI_API_KEY TO .ENV FILE';
      } else if (raw.startsWith('GEMINI_API_ERROR:')) {
        const detail = raw.replace('GEMINI_API_ERROR:', '').trim();
        if (detail.toLowerCase().includes('quota') || detail.toLowerCase().includes('429') || detail.toLowerCase().includes('rate')) {
          friendlyMsg = 'RATE LIMIT HIT! FREE TIER QUOTA EXCEEDED.\nWAIT ~60 SECONDS AND TRY AGAIN.';
        } else {
          friendlyMsg = `API ERROR: ${detail}`;
        }
      } else if (raw === 'JSON_PARSE_FAILURE' || raw === 'INVALID_JSON_RESPONSE') {
        friendlyMsg = 'FAILED TO PARSE GEMINI RESPONSE — TRY AGAIN';
      } else if (raw === 'EMPTY_RESPONSE') {
        friendlyMsg = 'EMPTY RESPONSE FROM GEMINI — TRY AGAIN';
      }

      playDeath();
      setDeathMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, world, showToast, refreshHistory]);

  return (
    <DifficultyContext.Provider value={{ difficulty, setDifficulty }}>
      <DomainContext.Provider value={{ world, setWorld }}>
        <ToastContext.Provider value={{ showToast }}>
          {/* Global cursor glow orb */}
          <div id="cursor-glow-orb" style={{
            position: 'fixed', width: '340px', height: '340px', borderRadius: '50%',
            pointerEvents: 'none', zIndex: 1, opacity: 0,
            background: 'radial-gradient(circle, rgba(77,217,224,0.055) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s',
            left: '-999px', top: '-999px',
          }} />
          <CursorGlow />
          {/* Video intro overlay */}
          {showIntro && <VideoIntro onDone={() => setShowIntro(false)} />}
          <div className="min-h-screen flex flex-col relative overflow-x-hidden pixel-bg">
          {/* Floating pixel particles */}
          <FloatingParticles />

          {/* Toast notifications */}
          {toast && (
            <Toast
              {...toast}
              onDone={() => setToast(null)}
            />
          )}

          {/* Death screen overlay */}
          {deathMessage && (
            <DeathScreen message={deathMessage} onDismiss={() => setDeathMessage(null)} />
          )}

          {/* Main content */}
          <div className="relative z-10 flex-1">
            <Navbar />

            <main className="pb-32">
              <Hero />

              <ScrollIntro />

              <div className="mc-divider max-w-4xl mx-auto" />

              <AuditorPanel onAudit={handleAudit} isLoading={isLoading} loadingMsg={loadingMsg} />

              {result && <ResultsDisplay result={result} inputText={inputText} />}

              {history.length > 0 && (
                <AuditHistory
                  history={history}
                  onRestore={(entry) => {
                    setResult(entry.result);
                    setInputText(entry.inputText);
                    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onHistoryChange={refreshHistory}
                />
              )}

              <div className="mc-divider max-w-4xl mx-auto" />

              <BattleMode />

              <div className="mc-divider max-w-4xl mx-auto" />

              <TypesPanel result={result} />
              <DomainSelector />
              <UseCases />
              <ComingSoon />
            </main>

            <Footer />
          </div>
          </div>
        </ToastContext.Provider>
      </DomainContext.Provider>
    </DifficultyContext.Provider>
  );
}

export default App;

