/**
 * Text normalisation shared by the indexer and the query parser.
 * Engineering shorthand ("Fe 500D", "M 25", "IS456", "w/c") is folded into single tokens
 * so that it can be matched exactly.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'is', 'are', 'be', 'it', 'its',
  'what', 'which', 'who', 'how', 'does', 'do', 'did', 'can', 'could', 'should', 'would', 'shall', 'will',
  'me', 'my', 'we', 'you', 'your', 'tell', 'give', 'show', 'explain', 'about', 'when', 'where', 'there',
  'this', 'that', 'these', 'those', 'with', 'as', 'from', 'than', 'any', 'all', 'need', 'needed', 'require',
  'required', 'requirement', 'requirements', 'rule', 'rules', 'please', 'whats', 'if', 'i', 'used', 'use',
]);

export function normalise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/w\s*\/\s*c\b/g, 'water cement')
    .replace(/\bfe\s*-?\s*(\d{3})\s*d\b/g, 'fe$1d')
    .replace(/\bfe\s*-?\s*(\d{3})\b/g, 'fe$1')
    .replace(/\bm\s*-?\s*(\d{2})\b/g, 'm$1')
    .replace(/\bis\s*[:\-]?\s*(\d{3,5})\b/g, 'is$1')
    .replace(/\bkl\s*\/\s*r\b/g, 'klr')
    .replace(/\bl\s*\/\s*d\b/g, 'ld ratio')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\.(?=\s|$)/g, ' ');
}

/** Very light plural stripper: "bars" -> "bar", "stirrups" -> "stirrup". */
export function stem(token) {
  if (token.length > 4 && token.endsWith('ies')) return token.slice(0, -3) + 'y';
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) return token.slice(0, -1);
  return token;
}

export function tokenize(text, { keepStopwords = false } = {}) {
  return normalise(text)
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => keepStopwords || !STOPWORDS.has(t))
    .map(stem);
}
