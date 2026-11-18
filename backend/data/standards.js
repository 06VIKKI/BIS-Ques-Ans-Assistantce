/**
 * BIS-Assist: registry of the Indian Standards covered by the demo corpus.
 * Clause text lives in ./clauses/*.js; this file only holds document-level metadata.
 */

export const CORPUS_NOTICE =
  'Demonstration corpus: clause text is a condensed reference summary, not a verbatim reproduction of the ' +
  'published standard. Clause numbers and page references are indicative. Always confirm against the ' +
  'official BIS publication before using a value in a design, test report or purchase specification.';

export const STANDARDS = [
  {
    code: 'IS 456',
    edition: '2000',
    title: 'Plain and Reinforced Concrete: Code of Practice',
    discipline: 'Structural concrete',
    summary:
      'Design and construction of plain and reinforced concrete: material grades, durability, cover, detailing, limit state design, shear and quality control.',
    keywords: ['concrete', 'rcc', 'reinforced concrete', 'beam', 'column', 'slab', 'cover', 'rebar', 'cube test'],
  },
  {
    code: 'IS 800',
    edition: '2007',
    title: 'General Construction in Steel: Code of Practice',
    discipline: 'Structural steel',
    summary:
      'Limit state design of hot-rolled structural steel: section classification, tension, compression and bending members, bolted and welded connections.',
    keywords: ['steel', 'bolt', 'weld', 'compression', 'tension', 'slenderness', 'beam', 'section'],
  },
  {
    code: 'IS 1786',
    edition: '2008',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement: Specification',
    discipline: 'Reinforcement material',
    summary:
      'Grades Fe 415 to Fe 600 (and ductile D grades): chemical composition, tensile properties, mass tolerances, bend tests and marking.',
    keywords: ['tmt', 'rebar', 'fe 500', 'fe 500d', 'yield', 'elongation', 'mass', 'tolerance'],
  },
  {
    code: 'IS 9873 (Part 1)',
    edition: '1999',
    title: 'Safety of Toys, Part 1: Safety Aspects Related to Mechanical and Physical Properties',
    discipline: 'Consumer product safety',
    summary:
      'Mechanical and physical safety of toys: small parts, cords, sharp edges and points, warnings and age labelling.',
    keywords: ['toy', 'small parts', 'choking', 'cord', 'age grading', 'children'],
  },
  {
    code: 'IS 9873 (Part 3)',
    edition: '2014',
    title: 'Safety of Toys, Part 3: Migration of Certain Elements',
    discipline: 'Consumer product safety',
    summary: 'Limits for migration of eight heavy elements (lead, cadmium, chromium and others) from toy materials.',
    keywords: ['toy', 'lead', 'cadmium', 'heavy metal', 'migration', 'paint', 'chemical'],
  },
];

export const getStandard = (code) => STANDARDS.find((s) => s.code === code);
