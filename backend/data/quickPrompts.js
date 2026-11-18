/** Suggestion pills shown above the chat input. Each one is answerable from the corpus. */
export const QUICK_PROMPTS = [
  { id: 'qp-col-cover', label: 'Column cover, moderate exposure', query: 'What is the minimum cover for a column in moderate exposure?', standard: 'IS 456' },
  { id: 'qp-ld', label: 'Development length of 16 mm Fe 500', query: 'Development length for a 16 mm Fe 500 bar in M25 concrete', standard: 'IS 456' },
  { id: 'qp-exposure', label: 'Mix limits for severe exposure', query: 'Minimum cement content and water-cement ratio for severe exposure', standard: 'IS 456' },
  { id: 'qp-col-steel', label: 'Column steel limits', query: 'What are the longitudinal reinforcement limits for columns?', standard: 'IS 456' },
  { id: 'qp-bolt', label: 'Bolt pitch and edge distance', query: 'Bolt pitch and edge distance rules in IS 800', standard: 'IS 800' },
  { id: 'qp-slender', label: 'Steel slenderness limits', query: 'Slenderness limits for steel compression and tension members', standard: 'IS 800' },
  { id: 'qp-fe500d', label: 'Fe 500D properties', query: 'What are the yield, tensile and elongation requirements for Fe 500D rebar?', standard: 'IS 1786' },
  { id: 'qp-mass', label: 'Mass of a 12 mm bar', query: 'What is the mass per metre of a 12 mm rebar and its tolerance?', standard: 'IS 1786' },
  { id: 'qp-toy-small', label: 'Toy small parts rule', query: 'Small parts cylinder requirement for toys for children under 3 years', standard: 'IS 9873' },
  { id: 'qp-toy-lead', label: 'Heavy metal limits in toys', query: 'Heavy metal migration limits for toys', standard: 'IS 9873' },
];

export const WELCOME_FOLLOW_UPS = [
  'What is the minimum cover for a column in moderate exposure?',
  'Which grades does IS 1786 cover?',
  'Small parts cylinder requirement for toys',
];
