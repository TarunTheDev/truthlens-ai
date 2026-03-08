export type WorldDomain = 'MEDICAL' | 'LEGAL' | 'JOURNALISM' | null;

export interface SentenceResult {
  sentence: string;
  status: 'VERIFIED' | 'UNCERTAIN' | 'FALSE';
  reason: string;
  source_url: string;
  confidence: number;
  hallucination_type: 'FABRICATED_FACT' | 'FALSE_SOURCE' | 'FALSE_CONNECTION' | 'CONTEXT_DISTORTION' | 'KNOWLEDGE_GAP' | 'NONE';
}

export interface AuditHistoryEntry {
  id: string;
  timestamp: number;
  inputPreview: string;
  trust_score: number;
  false_count: number;
  total_sentences: number;
  result: AuditResult;
  inputText: string;
}

export interface AuditResult {
  trust_score: number;
  total_sentences: number;
  false_count: number;
  uncertain_count?: number;
  heatmap: {
    statistics: number;
    historical: number;
    scientific: number;
    general: number;
  };
  sentences: SentenceResult[];
}

