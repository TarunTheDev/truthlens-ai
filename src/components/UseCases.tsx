import React from 'react';
import { useDomain, useDifficulty, useToast } from '../lib/context';
import { playClick } from '../lib/audio';
import type { WorldDomain } from '../lib/types';

// ─── Domain Sample Texts (with deliberate hallucinations for demo) ─────────────
const DOMAIN_SAMPLES: Record<NonNullable<WorldDomain>, string> = {
  MEDICAL: `Ibuprofen and aspirin can be safely combined at any dose — clinical studies show no interaction risk in healthy adults. The recommended daily intake of Vitamin C for adults is 5,000 mg, as recommended by the WHO in 2022. Penicillin was discovered by Alexander Fleming in 1928. The human body contains 206 bones in adulthood. Metformin is commonly prescribed for Type 2 diabetes and works by directly stimulating insulin secretion from the pancreas. COVID-19 mRNA vaccines alter the patient's DNA and have been linked to permanent immune suppression in 12% of recipients according to a 2023 Cambridge study. The appendix serves no biological function and is considered vestigial in modern humans.`,
  LEGAL: `In Miranda v. Arizona (1966), the Supreme Court ruled that suspects must be informed of their right to remain silent and their right to an attorney. In the landmark case of Johnson v. Google LLC (2021), a federal court held that AI-generated content is protected under the First Amendment regardless of accuracy. The GDPR Article 17 grants EU citizens the right to erasure of their personal data upon request. Under the Digital Millennium Copyright Act of 1998, AI-generated works are automatically copyrighted and assigned to the company that trained the model. In Roe v. Wade (1973), the Supreme Court held that the Constitution's right to privacy encompasses a woman's decision to terminate a pregnancy. The Sixth Amendment guarantees the right to a speedy trial, public trial, and right to counsel in criminal prosecutions.`,
  JOURNALISM: `According to a 2024 Reuters Institute report, 67% of news consumers cannot reliably distinguish AI-generated articles from human-written ones. Elon Musk acquired Twitter in October 2022 for approximately $44 billion and rebranded it as X in July 2023. A Stanford AI Lab study published in March 2024 found that large language models hallucinate factual data in 34% of responses. The BBC was founded in 1922 and is the world's oldest national public broadcaster, funded entirely by advertising revenue. According to WHO data, social media misinformation contributed directly to over 800,000 COVID-19 deaths globally between 2020 and 2022. ChatGPT reached one million users within five days of its launch in November 2022, making it the fastest-growing consumer application in history.`,
};

const WORLD_DIFFICULTY: Record<NonNullable<WorldDomain>, 'HARDCORE' | 'SURVIVAL'> = {
  MEDICAL: 'HARDCORE',
  LEGAL: 'HARDCORE',
  JOURNALISM: 'SURVIVAL',
};

const WORLDS_DATA: {
  key: NonNullable<WorldDomain>;
  icon: string;
  title: string;
  desc: string;
  color: string;
  accent: string;
  badge: string;
  tip: string;
}[] = [
  {
    key: 'MEDICAL',
    icon: '🏥',
    title: 'MEDICAL WORLD',
    desc: 'Audit AI-generated medical advice, drug interaction claims, and clinical research summaries. Catch dangerous hallucinations before they harm patients.',
    color: '#cc1111',
    accent: '#ff4444',
    badge: 'HARDCORE MODE',
    tip: 'Loads medical sample text with embedded hallucinations. Auto-sets HARDCORE difficulty.',
  },
  {
    key: 'LEGAL',
    icon: '⚖️',
    title: 'LEGAL WORLD',
    desc: 'Verify case law citations, statutes, and legal briefs. Catch non-existent case citations before they get submitted to court.',
    color: '#FFD700',
    accent: '#ffd700',
    badge: 'HARDCORE MODE',
    tip: 'Loads legal text with fabricated case citations. Auto-sets HARDCORE difficulty.',
  },
  {
    key: 'JOURNALISM',
    icon: '📰',
    title: 'JOURNALISM WORLD',
    desc: 'Fact-check AI-drafted news articles, statistics, and source attributions. Preserve editorial integrity with real-time verification.',
    color: '#4dd9e0',
    accent: '#4dd9e0',
    badge: 'SURVIVAL MODE',
    tip: 'Loads journalism text with false statistics. Auto-sets SURVIVAL difficulty.',
  },
];

export function UseCases() {
  const { world, setWorld } = useDomain();
  const { setDifficulty } = useDifficulty();
  const { showToast } = useToast();

  const handleWorldSelect = (key: NonNullable<WorldDomain>) => {
    playClick();
    if (world === key) {
      setWorld(null);
      showToast('WORLD DESELECTED — BACK TO GENERAL MODE', 'info');
      return;
    }
    setWorld(key);
    setDifficulty(WORLD_DIFFICULTY[key]);
    window.dispatchEvent(new CustomEvent('truthlens:fill-demo', { detail: DOMAIN_SAMPLES[key] }));
    setTimeout(() => {
      document.getElementById('auditor-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    const labels: Record<NonNullable<WorldDomain>, string> = {
      MEDICAL: '🏥 MEDICAL WORLD LOADED — HARDCORE MODE SET',
      LEGAL: '⚖️ LEGAL WORLD LOADED — HARDCORE MODE SET',
      JOURNALISM: '📰 JOURNALISM WORLD LOADED — SAMPLE TEXT READY',
    };
    showToast(labels[key], 'success');
  };

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
        🌍 CHOOSE YOUR WORLD
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '8px',
        color: '#3a3a3a',
        textAlign: 'center',
        marginBottom: '8px',
      }}>
        SELECT A DEPLOYMENT ENVIRONMENT
      </div>
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#555',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        Click a world to load domain-specific sample text, auto-configure difficulty, and jump to the auditor.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {WORLDS_DATA.map(w => {
          const isActive = world === w.key;
          return (
            <button
              key={w.key}
              onClick={() => handleWorldSelect(w.key)}
              style={{
                background: isActive ? '#1a1a1a' : '#252525',
                border: `3px solid ${isActive ? w.accent : '#000'}`,
                boxShadow: isActive
                  ? `inset 3px 3px 0 rgba(255,255,255,0.08), inset -3px -3px 0 rgba(0,0,0,0.5), 0 0 18px ${w.accent}55`
                  : 'inset 3px 3px 0 rgba(255,255,255,0.06), inset -3px -3px 0 rgba(0,0,0,0.5)',
                cursor: 'pointer',
                padding: '0',
                textAlign: 'left',
                overflow: 'hidden',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = w.accent;
                  el.style.boxShadow = `inset 3px 3px 0 rgba(255,255,255,0.1), inset -3px -3px 0 rgba(0,0,0,0.5), 0 0 12px ${w.accent}44`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = '#000';
                  el.style.boxShadow = 'inset 3px 3px 0 rgba(255,255,255,0.06), inset -3px -3px 0 rgba(0,0,0,0.5)';
                }
              }}
              aria-pressed={isActive}
              title={w.tip}
            >
              {/* ACTIVE badge */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '7px',
                  color: '#000',
                  background: w.accent,
                  padding: '3px 6px',
                  zIndex: 2,
                }}>
                  ▶ ACTIVE
                </div>
              )}

              {/* Thumbnail */}
              <div style={{
                height: '110px',
                background: isActive ? '#0f0f0f' : '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                borderBottom: `3px solid ${isActive ? w.accent : '#000'}`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(to right, #181818 1px, transparent 1px), linear-gradient(to bottom, #181818 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  opacity: isActive ? 0.8 : 0.5,
                }} />
                <span style={{
                  position: 'relative', zIndex: 1,
                  filter: `drop-shadow(3px 3px 0 rgba(0,0,0,0.8))${isActive ? ` drop-shadow(0 0 8px ${w.accent})` : ''}`,
                }}>
                  {w.icon}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '14px' }}>
                <div style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '9px',
                  color: isActive ? w.accent : w.color,
                  marginBottom: '6px',
                  letterSpacing: '0.04em',
                }}>
                  {w.title}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '7px',
                  color: '#000',
                  background: w.color,
                  padding: '2px 6px',
                  marginBottom: '8px',
                }}>
                  {w.badge}
                </div>
                <div style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '11px',
                  color: isActive ? '#888' : '#666',
                  lineHeight: 1.6,
                  marginBottom: '10px',
                }}>
                  {w.desc}
                </div>
                <div style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '8px',
                  color: isActive ? w.accent : '#444',
                }}>
                  {isActive ? '[ ✓ LOADED — SCROLL UP TO AUDIT ]' : '[ CLICK TO LOAD SAMPLE ]'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active world info bar */}
      {world && (() => {
        const active = WORLDS_DATA.find(w => w.key === world)!;
        return (
          <div style={{
            marginTop: '16px',
            background: '#1a1a1a',
            border: `2px solid ${active.accent}`,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: active.accent }}>
              ▶ {world} WORLD ACTIVE — DOMAIN-SPECIFIC AUDITING ENABLED
            </div>
            <button
              onClick={() => { setWorld(null); playClick(); showToast('WORLD DESELECTED', 'info'); }}
              style={{
                fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#555',
                background: 'transparent', border: '2px solid #333', padding: '4px 8px', cursor: 'pointer',
              }}
            >
              [ CLEAR WORLD ]
            </button>
          </div>
        );
      })()}
    </section>
  );
}
