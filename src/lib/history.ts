import { AuditHistoryEntry, AuditResult } from './types';

const STORAGE_KEY = 'truthlens_history';
const MAX_ENTRIES = 8;

export function loadHistory(): AuditHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(result: AuditResult, inputText: string): void {
  try {
    const existing = loadHistory();
    const entry: AuditHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      inputPreview: inputText.slice(0, 80).trim() + (inputText.length > 80 ? '...' : ''),
      trust_score: result.trust_score,
      false_count: result.false_count,
      total_sentences: result.total_sentences,
      result,
      inputText,
    };
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}
