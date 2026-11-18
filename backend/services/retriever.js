/**
 * Lightweight BM25 retriever over the clause corpus.
 *
 * No embeddings or network calls are needed: the corpus is small and domain specific, so a
 * field-weighted BM25 index with synonym expansion gives precise, explainable matches.
 * Every result carries the query terms that matched so the UI can highlight the evidence.
 */

import { CLAUSES } from '../data/clauses/index.js';
import { tokenize } from './tokenizer.js';

const K1 = 1.4;
const B = 0.75;

/** Query-side expansion: engineers rarely use the exact words of the code. */
const SYNONYMS = {
  rebar: ['reinforcement', 'bar'],
  tmt: ['fe500', 'fe415', 'deformed', 'bar'],
  stirrup: ['link', 'tie', 'shear'],
  link: ['stirrup', 'tie'],
  tie: ['stirrup', 'link', 'transverse'],
  cover: ['nominal'],
  weight: ['mass'],
  thickness: ['depth'],
  rcc: ['concrete', 'reinforced'],
  toy: ['child'],
  kid: ['child', 'toy'],
  choke: ['small', 'part', 'choking'],
  strangle: ['cord', 'strangulation'],
  rope: ['cord'],
  string: ['cord'],
  buckling: ['compression', 'slenderness'],
  strut: ['compression'],
  girder: ['beam'],
  joint: ['connection', 'bolt', 'weld'],
  weld: ['fillet'],
  nut: ['bolt'],
  anchorage: ['development', 'bond'],
  overlap: ['lap', 'splice'],
  sag: ['deflection'],
  cement: ['water', 'grade'],
  strength: ['grade'],
  seismic: ['ductile', 'earthquake'],
  earthquake: ['seismic'],
  heavy: ['migration'],
  toxic: ['migration', 'lead'],
};

const documents = CLAUSES.map((clause) => {
  const weighted = [
    ...Array(3).fill(tokenize(clause.heading)).flat(),
    ...Array(3).fill(tokenize(clause.keywords.join(' '))).flat(),
    ...Array(2).fill(tokenize(`${clause.standard} ${clause.standard.replace(/\s/g, '')} ${clause.topic}`)).flat(),
    ...tokenize(clause.clause),
    ...tokenize(clause.text),
  ];
  const tf = new Map();
  for (const t of weighted) tf.set(t, (tf.get(t) || 0) + 1);
  const plain = new Set([...tokenize(clause.heading), ...tokenize(clause.keywords.join(' ')), ...tokenize(clause.text)]);
  return { clause, tf, length: weighted.length, plain };
});

const N = documents.length;
const avgLen = documents.reduce((s, d) => s + d.length, 0) / N;
const df = new Map();
for (const d of documents) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
const idf = (t) => Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));

/** Words that should boost one standard when the user names it or its subject. */
function standardBoosts(rawTokens) {
  const boost = {};
  const has = (re) => rawTokens.some((t) => re.test(t));
  if (has(/^is456$/) || has(/^(concrete|rcc|cube|slab)$/)) boost['IS 456'] = 1.35;
  if (has(/^is800$/) || has(/^(steel|bolt|weld|girder|truss|fillet)$/)) boost['IS 800'] = 1.35;
  if (has(/^is1786$/) || has(/^(tmt|rebar|fe\d{3}d?)$/)) boost['IS 1786'] = 1.35;
  if (has(/^is9873$/) || has(/^(toy|child|children|kid)$/)) {
    boost['IS 9873 (Part 1)'] = 1.35;
    boost['IS 9873 (Part 3)'] = 1.35;
  }
  return boost;
}

/**
 * @param {string} query
 * @param {{limit?: number, standard?: string}} opts
 * @returns {{clause: object, score: number, confidence: number, terms: string[]}[]}
 */
export function search(query, { limit = 5, standard } = {}) {
  const base = tokenize(query);
  if (!base.length) return [];
  const expanded = new Set(base);
  for (const t of base) for (const s of SYNONYMS[t] || []) expanded.add(s);

  const boosts = standardBoosts(base);
  const queryTerms = [...expanded].filter((t) => df.has(t));
  if (!queryTerms.length) return [];

  // Words the corpus has never seen count against coverage, so "weather in delhi" cannot
  // look well-grounded just because "weather" appears once in an unrelated clause.
  const unknown = base.filter((t) => !df.has(t));
  const unknownWeight = unknown.length * 0.6 * idf('\u0000never-indexed') * (K1 + 1);
  const maxPossible =
    queryTerms.reduce((s, t) => s + idf(t) * (K1 + 1) * (base.includes(t) ? 1 : 0.5), 0) + unknownWeight;

  const scored = documents
    .filter((d) => !standard || d.clause.standard.startsWith(standard))
    .map((d) => {
      let score = 0;
      let covered = 0;
      const matched = [];
      for (const t of queryTerms) {
        const f = d.tf.get(t);
        if (!f) continue;
        const weight = base.includes(t) ? 1 : 0.5;
        const part = idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / avgLen)));
        score += part * weight;
        covered += idf(t) * (K1 + 1) * weight;
        if (d.plain.has(t)) matched.push(t);
      }
      score *= boosts[d.clause.standard] || 1;
      return { clause: d.clause, score, confidence: Math.min(1, covered / maxPossible), terms: matched };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

/** Query words suitable for highlighting inside a clause excerpt. */
export const highlightTerms = (query) => [...new Set(tokenize(query).filter((t) => t.length > 2))];
