import { AuditResult, WorldDomain } from './types';

export type DifficultyMode = 'CREATIVE' | 'SURVIVAL' | 'HARDCORE';

const DOMAIN_INSTRUCTIONS: Record<NonNullable<WorldDomain>, string> = {
  MEDICAL: `DOMAIN: MEDICAL/CLINICAL TEXT
Apply heightened scrutiny to all medical claims. Flag incorrect drug dosages, fabricated clinical trials, false drug interactions, incorrect mechanisms of action, and dangerous medical misinformation as FALSE. Patient safety is the highest priority.`,
  LEGAL: `DOMAIN: LEGAL TEXT
Apply heightened scrutiny to all legal citations. Flag non-existent case names, incorrect court rulings, fabricated statutes or regulations, and misrepresented legal principles as FALSE. Verify that case citations (e.g. "Smith v. Jones, 2019") are real and accurately described.`,
  JOURNALISM: `DOMAIN: JOURNALISM/NEWS TEXT
Apply heightened scrutiny to statistics, quotes, source attributions, and factual claims. Flag fabricated studies, misattributed quotes, incorrect statistics, and invented source organizations as FALSE. Journalistic accuracy is critical.`,
};

const DIFFICULTY_INSTRUCTIONS: Record<DifficultyMode, string> = {
  CREATIVE: `In LENIENT mode: Only flag claims as FALSE if there is direct, unambiguous evidence contradicting them. 
Mark everything else as VERIFIED unless clearly wrong. Give benefit of the doubt.`,
  SURVIVAL: `In NORMAL mode: Fact-check claims fairly. Mark clearly false claims as FALSE, 
unverifiable or questionable claims as UNCERTAIN, and confirmed facts as VERIFIED.`,
  HARDCORE: `In STRICT mode: Demand explicit primary source evidence for every claim. If you cannot find 
a reliable source citation, mark as UNCERTAIN. Treat numbers, dates, and statistics with extra scrutiny. 
Flag even slight inaccuracies as FALSE.`,
};

// ─── Shared Gemini caller ──────────────────────────────────────────────────────
const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];

async function callGemini(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey === 'your_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens, topK: 1, topP: 0.8 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  });

  let response: Response | null = null;
  let lastErr = '';
  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    );
    if (res.status === 429 || res.status === 404) {
      const b = await res.json().catch(() => ({}));
      lastErr = (b as any)?.error?.message || res.statusText;
      continue;
    }
    response = res;
    break;
  }
  if (!response) throw new Error(`GEMINI_API_ERROR: ${lastErr}`);
  if (!response.ok) {
    const b = await response.json().catch(() => ({}));
    throw new Error(`GEMINI_API_ERROR: ${(b as any)?.error?.message || response.statusText}`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('EMPTY_RESPONSE');
  return text.trim();
}

export async function auditText(
  inputText: string,
  difficulty: DifficultyMode = 'SURVIVAL',
  domain: WorldDomain = null
): Promise<AuditResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey === 'your_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const difficultyInstruction = DIFFICULTY_INSTRUCTIONS[difficulty];
  const domainInstruction = domain ? `\n\n${DOMAIN_INSTRUCTIONS[domain]}` : '';

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are TruthLens — a professional, deterministic AI hallucination auditor and fact-checker.

TODAY'S DATE: ${todayStr}. This is the PRESENT. Do NOT classify any statement about ${now.getFullYear()} events as a "future" claim — they are current.

${difficultyInstruction}${domainInstruction}

Analyze the following AI-generated text sentence by sentence. For EACH sentence, evaluate it against your knowledge and real-world facts.

For each sentence return:
- "sentence": the exact sentence text (string)
- "status": exactly one of: "VERIFIED", "UNCERTAIN", or "FALSE"
- "reason": a concise one-sentence explanation of your verdict (string)
- "source_url": a real, existing website URL that supports your verdict (string, or empty string "" if none)
- "confidence": integer 0-100 representing your confidence in the verdict
- "hallucination_type": exactly one of: "FABRICATED_FACT", "FALSE_SOURCE", "FALSE_CONNECTION", "CONTEXT_DISTORTION", "KNOWLEDGE_GAP", or "NONE"
  Use KNOWLEDGE_GAP for UNCERTAIN sentences where the only reason is that your training data doesn't cover the time period (not because the claim is wrong).
  Use NONE for VERIFIED sentences.

Also compute and return these top-level fields:
- "trust_score": integer 0-100
- "total_sentences": integer count
- "false_count": integer count of FALSE sentences
- "uncertain_count": integer count of UNCERTAIN sentences
- "heatmap": object with: "statistics", "historical", "scientific", "general" (each 0-100 risk %)

CRITICAL RULES:
1. Return ONLY a single valid JSON object. NO markdown, NO \`\`\`json blocks.
2. Every sentence in the input must appear in the "sentences" array.
3. source_url must be a real, accessible URL or empty string "".
4. Do NOT invent URLs.
5. KNOWLEDGE GAP RULE: If a sentence refers to recent events (2025-${now.getFullYear()}) that you cannot find in your training data, mark it as "UNCERTAIN" with hallucination_type "KNOWLEDGE_GAP" — NOT "FALSE". Your training data may simply not cover it yet. Only mark as FALSE if you can positively identify the claim contradicts known facts.
6. Do NOT flag a sentence as FALSE purely because its date is in ${now.getFullYear()} or recent past. Time references are only false if the underlying facts are wrong.
7. CONFIDENCE GUIDANCE: For KNOWLEDGE_GAP sentences where the claim is plausible given known trends (e.g. a company's valuation continuing near a previously known level), set confidence 85-95 to reflect high plausibility. Reserve low confidence (40-70) for claims that seem implausible even given known context.

TEXT TO ANALYZE:
${inputText}`;

  const rawText = await callGemini(prompt, 4096);

  const clean = rawText
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('INVALID_JSON_RESPONSE');

  try {
    const result = JSON.parse(clean.slice(jsonStart, jsonEnd + 1)) as AuditResult;
    if (!result.sentences) result.sentences = [];
    if (typeof result.trust_score !== 'number') result.trust_score = 80;
    if (typeof result.total_sentences !== 'number') result.total_sentences = result.sentences.length;
    if (typeof result.false_count !== 'number')
      result.false_count = result.sentences.filter(s => s.status === 'FALSE').length;
    if (typeof result.uncertain_count !== 'number')
      result.uncertain_count = result.sentences.filter(s => s.status === 'UNCERTAIN').length;
    if (!result.heatmap) result.heatmap = { statistics: 0, historical: 0, scientific: 0, general: 0 };
    return result;
  } catch {
    throw new Error('JSON_PARSE_FAILURE');
  }
}

// ─── Claim Rewriter ────────────────────────────────────────────────────────────
export async function rewriteClaim(falseSentence: string, reason: string): Promise<string> {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a fact-correction assistant. Today's date is ${todayStr}.
A claim was identified as FALSE or UNCERTAIN.

FALSE CLAIM: "${falseSentence}"
REASON IT IS FALSE/UNCERTAIN: ${reason}

Write a single complete, factually accurate corrected version of this sentence.
IMPORTANT:
- Write a complete sentence, do not cut off mid-sentence.
- If the issue is simply that you lack data for ${now.getFullYear()}, clarify that by adding "(as of [last known year])" phrasing.
- Return ONLY the corrected sentence — no explanation, no prefix like "Corrected:", no quotes, no extra text.`;

  const result = await callGemini(prompt, 512);
  return result
    .replace(/^(corrected:|here is|the corrected|rewritten:|note:)/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

// ─── Hallucination Summary Briefing ───────────────────────────────────────────
export async function generateSummary(result: AuditResult, inputText: string): Promise<string> {
  const falseOnes = result.sentences
    .filter(s => s.status === 'FALSE')
    .map((s, i) => `${i + 1}. "${s.sentence}" — ${s.reason}`)
    .join('\n');

  const prompt = `You are TruthLens, an AI hallucination auditor. You just audited the following text and found these results:

Trust Score: ${result.trust_score}/100
Total Sentences: ${result.total_sentences}
False Claims: ${result.false_count}
Uncertain Claims: ${result.uncertain_count ?? 0}
${falseOnes ? `\nFalse claims found:\n${falseOnes}` : '\nNo false claims found.'}

Write a 2-3 sentence plain-English briefing for a non-technical user explaining:
1. How trustworthy this text is overall
2. What the main issues are (if any)
3. What they should watch out for

Keep it conversational, concise, under 60 words. Do not use bullet points. Just plain paragraph text.`;

  return callGemini(prompt, 200);
}

