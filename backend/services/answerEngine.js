/**
 * Answer engine: turns a question into a grounded answer plus the exact clauses behind it.
 *
 * Resolution order:
 *   1. calculators      numeric questions with every input present (worked examples)
 *   2. curated intents  hand-written answers for common compliance questions
 *   3. retrieval        BM25 over the corpus, answer assembled only from retrieved clause text
 *   4. no-match         explicit refusal, so the assistant never answers without evidence
 *
 * Every answer returns the citation objects it relied on. Nothing is cited that was not used.
 */

import { INTENTS } from '../data/intents.js';
import { QUICK_PROMPTS } from '../data/quickPrompts.js';
import { STANDARDS } from '../data/standards.js';
import { getClause, citationLabel } from '../data/clauses/index.js';
import { runCalculators } from './calculators.js';
import { search, highlightTerms } from './retriever.js';
import { normalise, tokenize } from './tokenizer.js';

const MIN_SCORE = 8;
const MIN_COVERAGE = 0.4;
const MAX_QUERY_LENGTH = 500;

/** Replace {{clauseId}} placeholders with [n] markers; return ordered clause ids. */
function numberMarkers(template) {
  const order = [];
  const text = template.replace(/\{\{([A-Za-z0-9.\-]+)\}\}/g, (_, id) => {
    if (!getClause(id)) return '';
    if (!order.includes(id)) order.push(id);
    return `[${order.indexOf(id) + 1}]`;
  });
  return { text: text.replace(/[ \t]+\n/g, '\n').replace(/ {2,}/g, ' ').trim(), order };
}

function buildCitations(ids, query, relevance, matchedTerms = {}) {
  const generic = highlightTerms(query);
  return ids.map((id, i) => {
    const c = getClause(id);
    return {
      ref: i + 1,
      id: c.id,
      standard: c.standard,
      edition: c.edition,
      clause: c.clause,
      heading: c.heading,
      page: c.page,
      topic: c.topic,
      label: citationLabel(c),
      text: c.text,
      relevance: Number((relevance.get(id) ?? 0.4).toFixed(2)),
      terms: matchedTerms[id] || generic,
    };
  });
}

function bestSentences(text, queryTokens, count = 2) {
  const sentences = text.match(/[^.;]+(?:\.\d+[^.;]*)*[.;]?/g)?.map((s) => s.trim()).filter((s) => s.length > 20) || [text];
  return sentences
    .map((s, idx) => {
      const tokens = new Set(tokenize(s));
      const overlap = queryTokens.filter((t) => tokens.has(t)).length;
      return { s, idx, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || a.idx - b.idx)
    .slice(0, count)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s.replace(/[.;]$/, ''));
}

function relatedPrompts(standardCodes, exclude) {
  const prefixes = new Set(standardCodes.map((c) => c.split(' (')[0]));
  const hits = QUICK_PROMPTS.filter((p) => prefixes.has(p.standard) && p.query !== exclude);
  return (hits.length ? hits : QUICK_PROMPTS).slice(0, 3).map((p) => p.query);
}

function noMatch(query) {
  return {
    mode: 'no-match',
    intent: null,
    confidence: 0,
    answer:
      "I could not find a clause in the loaded standards that answers this with enough confidence, so I won't guess.\n\n" +
      `I currently cover ${STANDARDS.map((s) => s.code).join(', ')}. ` +
      'Try naming the member or product and the property you need, for example "minimum cover for a column in severe exposure" or "lead limit in toy paint".',
    citations: [],
    followUps: QUICK_PROMPTS.slice(0, 3).map((p) => p.query),
    query,
  };
}

/**
 * @param {string} rawQuery
 * @returns {{mode: string, intent: string|null, confidence: number, answer: string, citations: object[], followUps: string[], calc?: object}}
 */
export function answerQuery(rawQuery) {
  const query = String(rawQuery || '').trim().slice(0, MAX_QUERY_LENGTH);
  if (!query) return noMatch(query);

  const q = normalise(query);
  const ranked = search(query, { limit: 120 });
  const relevance = new Map(ranked.map((r) => [r.clause.id, r.confidence]));
  const matched = Object.fromEntries(ranked.map((r) => [r.clause.id, r.terms]));

  // 1. Calculators
  const calc = runCalculators(query);
  if (calc) {
    const { text, order } = numberMarkers(calc.text);
    return {
      mode: 'calculation',
      intent: calc.id,
      confidence: 0.97,
      answer: text,
      citations: buildCitations(order, query, relevance, matched),
      followUps: calc.followUps || [],
      calc: calc.calc,
      query,
    };
  }

  // 2. Curated intents
  const intent = INTENTS.find((i) => i.match(q));
  if (intent) {
    const { text, order } = numberMarkers(intent.build(q));
    return {
      mode: 'curated',
      intent: intent.id,
      confidence: 0.92,
      answer: text,
      citations: buildCitations(order, query, relevance, matched),
      followUps: intent.followUps || [],
      query,
    };
  }

  // 3. Retrieval
  const top = ranked[0];
  if (!top || top.score < MIN_SCORE || top.confidence < MIN_COVERAGE) return noMatch(query);

  const picks = ranked.filter((r) => r.score >= top.score * 0.45).slice(0, 3);
  const queryTokens = tokenize(query);
  const lines = picks.map(
    (r) =>
      `- **${r.clause.standard}, Clause ${r.clause.clause} (${r.clause.heading}):** ${bestSentences(r.clause.text, queryTokens).join('. ')}. {{${r.clause.id}}}`,
  );
  const { text, order } = numberMarkers(
    `These are the closest provisions I found. Each point is taken directly from the cited clause:\n\n${lines.join('\n')}\n\n` +
      'Open the evidence panel to read the full excerpt for each clause.',
  );
  return {
    mode: 'retrieval',
    intent: null,
    confidence: Number(Math.min(0.85, top.confidence).toFixed(2)),
    answer: text,
    citations: buildCitations(order, query, relevance, matched),
    followUps: relatedPrompts(picks.map((r) => r.clause.standard), query),
    query,
  };
}

/** Split an answer into small chunks for the streaming typing effect (keeps whitespace). */
export function chunkAnswer(text, wordsPerChunk = 2) {
  const words = text.match(/\S+\s*/g) || [];
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) chunks.push(words.slice(i, i + wordsPerChunk).join(''));
  return chunks;
}
