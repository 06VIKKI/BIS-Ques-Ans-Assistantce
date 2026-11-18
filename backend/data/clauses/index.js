import { IS456 } from './is456.js';
import { IS800 } from './is800.js';
import { IS1786 } from './is1786.js';
import { IS9873 } from './is9873.js';

/** Flat list of every clause in the corpus. */
export const CLAUSES = [...IS456, ...IS800, ...IS1786, ...IS9873];

const byId = new Map(CLAUSES.map((c) => [c.id, c]));

export const getClause = (id) => byId.get(id) || null;

/** Display label used in citation cards, e.g. "[IS 456: Clause 26.4.2, Page 47]". */
export const citationLabel = (c) => `[${c.standard}: Clause ${c.clause}, Page ${c.page}]`;
