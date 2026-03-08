import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AuditResult, SentenceResult } from '../lib/types';
import { playBlip, playFalse, playUncertain, playClick } from '../lib/audio';
import { useToast } from '../lib/context';
import { rewriteClaim, generateSummary } from '../lib/gemini';

type Filter = 'ALL' | 'FALSE' | 'UNCERTAIN' | 'VERIFIED';
interface Props { result: AuditResult; inputText?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusStyle(status: SentenceResult['status']) {
  switch (status) {
    case 'VERIFIED':  return { bar: '#5aaf2a', bg: '#0a1a08', badge: '✅ [ VERIFIED ]',   text: '#5aaf2a' };
    case 'FALSE':     return { bar: '#cc1111', bg: '#1a0000', badge: '❌ [ FALSE ]',       text: '#cc1111' };
    default:          return { bar: '#e5a100', bg: '#1a1200', badge: '⚠️ [ UNCERTAIN ]',  text: '#e5a100' };
  }
}

function getHeatmapColor(key: string): string {
  switch (key) {
    case 'statistics': return '#FFD700';
    case 'historical': return '#cc1111';
    case 'scientific': return '#4dd9e0';
    default:           return '#17dd62';
  }
}

function getHeatmapLabel(key: string): string {
  switch (key) {
    case 'statistics': return '> NUMBERS & STATS   ';
    case 'historical': return '> HISTORICAL FACTS  ';
    case 'scientific': return '> SCIENTIFIC CLAIMS ';
    default:           return '> GENERAL KNOWLEDGE ';
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function HeartBar({ score }: { score: number }) {
  const full = Math.round(score / 10);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= full) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [score, full]);

  const scoreColor = score >= 70 ? '#5aaf2a' : score >= 40 ? '#e5a100' : '#cc1111';

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '10px',
          color: '#7a7a7a',
          marginBottom: '12px',
          letterSpacing: '0.08em',
        }}
      >
        [ TRUTH SCORE ]
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: '24px',
              opacity: i < visible ? 1 : 0.2,
              filter: i < visible ? 'drop-shadow(2px 2px 0 #000)' : 'none',
              transition: 'opacity 0.1s, filter 0.1s',
              animation: i < visible ? `heartPop 0.4s ease-out ${i * 0.08}s both` : 'none',
            }}
          >
            {i < visible ? '❤️' : '🖤'}
          </span>
        ))}
      </div>
      <div
        style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 'clamp(14px, 3vw, 22px)',
          color: scoreColor,
          letterSpacing: '0.04em',
          textShadow: '3px 3px 0 #000',
        }}
      >
        TRUTH HEARTS: {full}/10
      </div>
      <div
        style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '10px',
          color: '#555',
          marginTop: '6px',
        }}
      >
        SCORE: {score}/100
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#1e1e1e',
        border: '3px solid #000',
        boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.1), inset -3px -3px 0 rgba(0,0,0,0.6)',
        padding: '16px',
        textAlign: 'center',
        minWidth: '120px',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px', filter: 'drop-shadow(2px 2px 0 #000)' }}>{icon}</div>
      <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#555', marginBottom: '8px', lineHeight: 1.6 }}>{label}</div>
      <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: 'clamp(18px, 3vw, 24px)', color, textShadow: '2px 2px 0 #000' }}>{value}</div>
    </div>
  );
}

function HeatmapRow({ label, value, color }: { label: string; value: number; color: string }) {
  const blocks = Math.round(value / 10);
  const empty = 10 - blocks;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#7a7a7a' }}>{label}</span>
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color }}>
          {'█'.repeat(blocks)}<span style={{ color: '#2a2a2a' }}>{'░'.repeat(empty)}</span>
        </span>
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color, minWidth: '40px', textAlign: 'right' }}>{value}%</span>
      </div>
      <div style={{ height: '10px', background: '#111', border: '2px solid #000', boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 8px)`,
            width: animated ? `${value}%` : '0%',
            transition: 'width 0.9s ease-out',
          }}
        />
      </div>
    </div>
  );
}

function SentenceCard({ data, index }: { data: SentenceResult; index: number }) {
  const style = getStatusStyle(data.status);
  const { showToast } = useToast();
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);

  const isKnowledgeGap =
    data.status === 'UNCERTAIN' &&
    (data.hallucination_type === 'KNOWLEDGE_GAP' ||
      /training data|knowledge cutoff|cannot verify|cannot be verified|beyond.*training|training.*cutoff/i.test(data.reason));

  useEffect(() => {
    const t = setTimeout(() => {
      if (data.status === 'FALSE') playFalse();
      else if (data.status === 'UNCERTAIN') playUncertain();
      else playBlip();
    }, index * 180);
    return () => clearTimeout(t);
  }, []);

  const handleRewrite = async () => {
    if (rewriting) return;
    setRewriting(true);
    playClick();
    try {
      const corrected = await rewriteClaim(data.sentence, data.reason);
      setRewritten(corrected);
    } catch {
      showToast('REWRITE FAILED — TRY AGAIN', 'error');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopyRewrite = () => {
    if (!rewritten) return;
    navigator.clipboard.writeText(rewritten);
    showToast('CORRECTED CLAIM COPIED!', 'success');
  };

  return (
    <div
      className="sentence-card"
      style={{
        display: 'flex',
        overflow: 'hidden',
        background: '#252525',
        border: '3px solid #000',
        boxShadow: 'inset 3px 3px 0 rgba(0,0,0,0.5)',
        animationDelay: `${index * 0.18}s`,
      }}
    >
      {/* Status sidebar */}
      <div style={{ width: '6px', background: style.bar, flexShrink: 0 }} />

      <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: style.text }}>
            {style.badge}
          </span>
          {data.hallucination_type !== 'NONE' && (
            <span style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: data.hallucination_type === 'KNOWLEDGE_GAP' ? '#4dd9e0' : '#7a7a7a',
              background: data.hallucination_type === 'KNOWLEDGE_GAP' ? 'rgba(77,217,224,0.08)' : '#1a1a1a',
              border: `2px solid ${data.hallucination_type === 'KNOWLEDGE_GAP' ? 'rgba(77,217,224,0.35)' : '#333'}`,
              padding: '2px 6px',
              whiteSpace: 'nowrap',
            }}>
              {data.hallucination_type === 'KNOWLEDGE_GAP' ? '⏰' : '🔥'} {data.hallucination_type.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Sentence text */}
        <p style={{
          color: '#e0e0e0',
          fontSize: '13px',
          lineHeight: 1.7,
          marginBottom: '10px',
          fontFamily: 'system-ui, sans-serif',
          borderLeft: `3px solid ${style.bar}`,
          paddingLeft: '12px',
          background: style.bg,
          padding: '8px 12px',
          border: `1px solid ${style.bar}33`,
        }}>
          "{data.sentence}"
        </p>

        {/* Knowledge gap callout for UNCERTAIN */}
        {isKnowledgeGap && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: 'rgba(77,217,224,0.05)',
            border: '2px solid rgba(77,217,224,0.3)',
            padding: '8px 12px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⏰</span>
            <div>
              <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#4dd9e0', marginBottom: '4px', letterSpacing: '0.06em' }}>
                BEYOND AI KNOWLEDGE WINDOW
              </div>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#6ab8c8', lineHeight: 1.5 }}>
                This claim cannot be independently verified because it's more recent than the AI's training data — not because it's wrong. High confidence means it's plausible given known context.
              </div>
            </div>
          </div>
        )}

        {/* Reason block */}
        <div style={{
          background: '#111',
          border: '2px solid #000',
          boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.8)',
          padding: '8px 12px',
          marginBottom: '10px',
        }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#fff' }}>REASON: </span>
          <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
            {data.reason}
          </span>
        </div>

        {/* Source link */}
        {data.source_url && (
          <a
            href={data.source_url}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'block',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: '#4dd9e0',
              textDecoration: 'none',
              marginBottom: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
            title={data.source_url}
          >
            &gt; SOURCE FOUND: {data.source_url}
          </a>
        )}

        {/* Confidence XP bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#555', whiteSpace: 'nowrap' }}>
            CONFIDENCE:
          </span>
          <div style={{ flex: 1, height: '10px', background: '#111', border: '2px solid #000', boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.8)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `repeating-linear-gradient(90deg, ${style.bar} 0, ${style.bar} 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 8px)`, width: `${data.confidence}%`, transition: 'width 0.7s ease-out' }} />
          </div>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: style.text, minWidth: '32px' }}>
            {data.confidence}%
          </span>
        </div>

        {/* AI Rewrite button — for FALSE and UNCERTAIN */}
        {(data.status === 'FALSE' || data.status === 'UNCERTAIN') && (
          <div style={{ marginTop: '12px' }}>
            {!rewritten && (
              <button
                onClick={handleRewrite}
                disabled={rewriting}
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '8px',
                  color: rewriting ? '#555' : '#4dd9e0',
                  background: '#111',
                  border: '2px solid ' + (rewriting ? '#333' : '#4dd9e0'),
                  padding: '5px 10px',
                  cursor: rewriting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {rewriting ? (
                  <><span style={{ animation: 'mine 0.4s infinite alternate ease-in-out', display: 'inline-block' }}>⛏️</span> REWRITING...</>
                ) : (
                  <>🔧 AI REWRITE THIS CLAIM</>
                )}
              </button>
            )}
            {rewritten && (
              <div style={{ background: '#0a1f0a', border: '2px solid #5aaf2a', padding: '10px 12px', marginTop: '8px' }}>
                <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#5aaf2a', marginBottom: '6px' }}>✅ AI CORRECTED VERSION:</div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#8adf6a', lineHeight: 1.6, marginBottom: '8px' }}>
                  {rewritten}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyRewrite}
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#5aaf2a', background: 'none', border: '1px solid #5aaf2a', padding: '3px 8px', cursor: 'pointer' }}
                  >[ COPY ]</button>
                  <button
                    onClick={() => setRewritten(null)}
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#555', background: 'none', border: '1px solid #333', padding: '3px 8px', cursor: 'pointer' }}
                  >[ DISMISS ]</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const { label, color, bg } = score >= 80
    ? { label: 'LOW RISK', color: '#5aaf2a', bg: '#0a1a08' }
    : score >= 55
    ? { label: 'MEDIUM RISK', color: '#e5a100', bg: '#1a1200' }
    : score >= 30
    ? { label: 'HIGH RISK', color: '#cc1111', bg: '#1a0000' }
    : { label: 'CRITICAL', color: '#ff3333', bg: '#2a0000' };

  return (
    <div style={{
      display: 'inline-block',
      background: bg,
      border: `3px solid ${color}`,
      boxShadow: `0 0 10px ${color}44, inset 2px 2px 0 rgba(0,0,0,0.6)`,
      padding: '6px 14px',
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '9px',
      color,
      letterSpacing: '0.1em',
      animation: score < 30 ? 'pulse-red 1.2s infinite' : 'none',
    }}>
      ⚠ {label}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ResultsDisplay({ result, inputText = '' }: Props) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Auto-generate AI summary when result changes
  useEffect(() => {
    setSummary(null);
    if (!result || result.total_sentences === 0) return;
    setSummaryLoading(true);
    generateSummary(result, inputText)
      .then(s => setSummary(s))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [result]);

  const handleShare = useCallback(() => {
    const payload = {
      ts: result.trust_score,
      fc: result.false_count,
      uc: result.sentences.filter(s => s.status === 'UNCERTAIN').length,
      tot: result.total_sentences,
      // strip non-ASCII to keep btoa safe
      preview: inputText.slice(0, 120).replace(/[^\x00-\x7F]/g, ''),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}${window.location.pathname}#audit=${encoded}`;
    navigator.clipboard.writeText(url).then(() => showToast('SHARE LINK COPIED!', 'success'));
  }, [result, inputText]);

  const sourcesCount = result.sentences.filter(s => s.source_url && s.source_url.length > 4).length;
  const uncertainCount = result.sentences.filter(s => s.status === 'UNCERTAIN').length;
  const verifiedCount = result.sentences.filter(s => s.status === 'VERIFIED').length;

  const mostDangerous = useMemo(() =>
    result.sentences
      .filter(s => s.status === 'FALSE')
      .sort((a, b) => b.confidence - a.confidence)[0] ?? null,
    [result]
  );

  const filtered = useMemo(() =>
    filter === 'ALL' ? result.sentences : result.sentences.filter(s => s.status === filter),
    [result, filter]
  );

  const FILTERS: { key: Filter; label: string; count: number; color: string }[] = [
    { key: 'ALL',       label: 'ALL',       count: result.sentences.length, color: '#7a7a7a' },
    { key: 'FALSE',     label: '❌ FALSE',   count: result.false_count,      color: '#cc1111' },
    { key: 'UNCERTAIN', label: '⚠ UNCERTAIN', count: uncertainCount,         color: '#e5a100' },
    { key: 'VERIFIED',  label: '✅ VERIFIED', count: verifiedCount,          color: '#5aaf2a' },
  ];

  const handleCopy = () => {
    const lines = result.sentences.map(s =>
      `[${s.status}] "${s.sentence}"\n  Reason: ${s.reason}\n  Confidence: ${s.confidence}%${s.source_url ? `\n  Source: ${s.source_url}` : ''}`
    ).join('\n\n');
    const header = `TRUTHLENS AUDIT REPORT\nTrust Score: ${result.trust_score}/100 | Sentences: ${result.total_sentences} | False: ${result.false_count} | Uncertain: ${uncertainCount}\n${'='.repeat(50)}\n\n`;
    navigator.clipboard.writeText(header + lines).then(() => {
      showToast('COPIED TO CLIPBOARD!', 'success');
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast('JSON REPORT EXPORTED!', 'success');
  };

  const handleExportMarkdown = () => {
    const lines = [
      `# TruthLens Audit Report`,
      `**Trust Score:** ${result.trust_score}/100 | **Sentences:** ${result.total_sentences} | **False:** ${result.false_count} | **Uncertain:** ${uncertainCount}`,
      `---`,
      ...result.sentences.map(s =>
        `### [${s.status}] ${s.hallucination_type !== 'NONE' ? `_(${s.hallucination_type})_` : ''}\n> ${s.sentence}\n\n**Reason:** ${s.reason}  \n**Confidence:** ${s.confidence}%${s.source_url ? `  \n**Source:** ${s.source_url}` : ''}`
      ),
    ];
    const blob = new Blob([lines.join('\n\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens-audit-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast('MARKDOWN REPORT EXPORTED!', 'success');
  };

  return (
    <section
      id="results-section"
      className="max-w-4xl mx-auto px-4 mb-16"
      style={{ animation: 'fadeInCard 0.5s ease-out' }}
    >
      {/* ── AI Summary Briefing ── */}
      {(summaryLoading || summary) && (
        <div style={{
          background: '#0d1a1f',
          border: '3px solid #4dd9e0',
          boxShadow: '0 0 12px rgba(77,217,224,0.15), inset 3px 3px 0 rgba(0,0,0,0.5)',
          padding: '18px 20px',
          marginBottom: '16px',
        }}>
          <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#4dd9e0', marginBottom: '12px', letterSpacing: '0.06em' }}>
            🤖 AI VERDICT BRIEFING
          </div>
          {summaryLoading ? (
            <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#555', animation: 'flicker 1.5s infinite' }}>
              GENERATING BRIEFING...
            </div>
          ) : (
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#a0d4dc', lineHeight: 1.8, margin: 0 }}>
              {summary}
            </p>
          )}
        </div>
      )}

      {/* ── Trust Score + Risk Badge ── */}
      <div className="mc-panel" style={{ padding: '28px 20px', marginBottom: '16px' }}>
        <HeartBar score={result.trust_score} />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <RiskBadge score={result.trust_score} />
        </div>
      </div>

      {/* ── Stat Blocks ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <StatBlock icon="⛏️" label="SENTENCES MINED" value={result.total_sentences} color="#7a7a7a" />
        <StatBlock icon="❌" label="LIES FOUND" value={result.false_count} color="#cc1111" />
        <StatBlock icon="⚠️" label="UNCERTAIN" value={uncertainCount} color="#e5a100" />
        <StatBlock icon="💎" label="SOURCES CITED" value={sourcesCount} color="#4dd9e0" />
      </div>

      {/* ── Most Dangerous Claim ── */}
      {mostDangerous && (
        <div style={{
          background: '#1a0000',
          border: '3px solid #cc1111',
          boxShadow: '0 0 16px rgba(204,17,17,0.3), inset 3px 3px 0 rgba(0,0,0,0.6)',
          padding: '16px 18px',
          marginBottom: '16px',
          animation: 'pulse-red 2s infinite',
        }}>
          <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px', color: '#cc1111', marginBottom: '10px', letterSpacing: '0.08em' }}>
            💀 MOST DANGEROUS CLAIM (CONFIDENCE: {mostDangerous.confidence}%)
          </div>
          <p style={{ color: '#ff6666', fontSize: '13px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6, marginBottom: '8px' }}>
            "{mostDangerous.sentence}"
          </p>
          <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#aa4444', lineHeight: 1.5 }}>
            ▶ {mostDangerous.reason}
          </div>
        </div>
      )}

      {/* ── Heatmap ── */}
      <div className="mc-panel" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '10px',
          color: '#7a7a7a',
          marginBottom: '16px',
          letterSpacing: '0.06em',
          borderBottom: '3px solid #111',
          paddingBottom: '10px',
        }}>
          📦 ORE DISTRIBUTION MAP
        </div>
        {(Object.entries(result.heatmap) as [string, number][]).map(([key, val]) => (
          <HeatmapRow
            key={key}
            label={getHeatmapLabel(key)}
            value={val}
            color={getHeatmapColor(key)}
          />
        ))}
      </div>

      {/* ── Filter buttons ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#3a3a3a', marginRight: '4px' }}>FILTER:</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: filter === f.key ? '#000' : f.color,
              background: filter === f.key ? f.color : '#1a1a1a',
              border: `2px solid ${f.color}`,
              padding: '5px 10px',
              cursor: 'pointer',
              transition: 'all 0.1s',
              boxShadow: filter === f.key ? `0 0 8px ${f.color}88` : 'none',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#3a3a3a', marginLeft: 'auto' }}>
          SHOWING {filtered.length}/{result.sentences.length}
        </span>
      </div>

      {/* ── Sentence cards ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '10px',
          color: '#7a7a7a',
          marginBottom: '14px',
          letterSpacing: '0.06em',
        }}>
          [ DETAILED BLOCK ANALYSIS ]
        </div>
        {filtered.length === 0 && (
          <div style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', color: '#3a3a3a', textAlign: 'center', padding: '32px' }}>
            NO SENTENCES MATCH THIS FILTER
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((s, i) => (
            <SentenceCard key={`${s.sentence.slice(0, 20)}-${i}`} data={s} index={i} />
          ))}
        </div>
      </div>

      {/* ── Export Buttons ── */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
        <button className="mc-button" onClick={handleCopy} style={{ padding: '10px 18px', fontSize: '9px' }}>
          [ 📋 COPY TEXT ]
        </button>
        <button className="mc-button" onClick={handleExportJSON} style={{ padding: '10px 18px', fontSize: '9px' }}>
          [ 📦 EXPORT JSON ]
        </button>
        <button className="mc-button" onClick={handleExportMarkdown} style={{ padding: '10px 18px', fontSize: '9px' }}>
          [ 📝 EXPORT MARKDOWN ]
        </button>
        <button className="mc-button" onClick={handleShare} style={{ padding: '10px 18px', fontSize: '9px' }}>
          [ 🔗 SHARE LINK ]
        </button>
      </div>
    </section>
  );
}

