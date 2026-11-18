import { STATUS, makeCheck, passFail, numberField, selectField, yesNo, fmt } from './helpers.js';

/** IS 9873 (Part 3) migration limits, mg/kg, dry, brittle or pliable material. */
const LIMITS = [
  { key: 'antimony', label: 'Antimony', max: 60 },
  { key: 'arsenic', label: 'Arsenic', max: 25 },
  { key: 'barium', label: 'Barium', max: 1000 },
  { key: 'cadmium', label: 'Cadmium', max: 75 },
  { key: 'chromium', label: 'Chromium', max: 60 },
  { key: 'lead', label: 'Lead', max: 90 },
  { key: 'mercury', label: 'Mercury', max: 60 },
  { key: 'selenium', label: 'Selenium', max: 500 },
];

export const toy9873 = {
  id: 'toy-9873',
  standard: 'IS 9873 (Parts 1 and 3)',
  title: 'Toy safety',
  description: 'Audits a toy test record for small parts, cord length, edges, warnings and heavy element migration.',
  fields: [
    selectField('age', 'Intended age group', [
      { value: 'under18', label: 'Under 18 months' },
      { value: 'under36', label: '18 to 36 months' },
      { value: 'over36', label: '36 months and above' },
    ], 'under36', { group: 'Product' }),
    selectField('smallParts', 'Detachable part fits entirely in small parts cylinder', yesNo, 'no', { group: 'Mechanical' }),
    numberField('cord', 'Longest free cord, chain or elastic', 'mm', 0, { min: 0, max: 5000, group: 'Mechanical' }),
    selectField('edgesOk', 'Sharp edge test passed', yesNo, 'yes', { group: 'Mechanical' }),
    selectField('pointsOk', 'Sharp point test passed', yesNo, 'yes', { group: 'Mechanical' }),
    selectField('warning', 'Small parts warning on pack', yesNo, 'no', { group: 'Marking' }),
    ...LIMITS.map((l) =>
      numberField(l.key, `${l.label} migration`, 'mg/kg', { lead: 12, cadmium: 6, chromium: 9, antimony: 4, arsenic: 3, barium: 140, mercury: 2, selenium: 20 }[l.key], {
        min: 0, max: 100000, step: 0.1, group: 'Migration of elements',
      }),
    ),
  ],
  samples: {
    pass: { label: 'Compliant toy', values: {} },
    fail: {
      label: 'Non-compliant toy',
      values: { age: 'under18', smallParts: 'yes', cord: 340, edgesOk: 'no', lead: 210, cadmium: 40, chromium: 85 },
    },
  },
  validate: () => [],
  evaluate(v) {
    const checks = [];
    const young = v.age === 'under18' || v.age === 'under36';
    const hasParts = v.smallParts === 'yes';

    if (young) {
      checks.push(passFail(!hasParts, {
        id: 'small-parts', name: 'Small parts (under 36 months)', citationId: 'IS9873-1-5.2',
        requirement: 'No detachable part may fit entirely inside the 31.7 mm cylinder', provided: hasParts ? 'A part fits the cylinder' : 'No part fits',
        advice: 'Redesign the part so it cannot detach, or enlarge it beyond the cylinder, before this toy can be marketed for this age group.',
      }));
    } else {
      checks.push(makeCheck({
        id: 'small-parts', name: 'Small parts warning', citationId: 'IS9873-1-7',
        requirement: 'Toys with small parts need a warning if not suitable for under 36 months',
        provided: hasParts ? `Small parts present, warning ${v.warning === 'yes' ? 'shown' : 'missing'}` : 'No small parts',
        status: !hasParts || v.warning === 'yes' ? STATUS.PASS : STATUS.FAIL,
        advice: 'Print the small parts warning with the specific hazard on the packaging.',
      }));
    }

    checks.push(
      v.age === 'under18'
        ? passFail(v.cord <= 220, {
            id: 'cord', name: 'Cord length (under 18 months)', citationId: 'IS9873-1-5.3',
            requirement: 'Free length at most 220 mm', provided: `${fmt(v.cord, 0)} mm`,
            advice: 'Shorten the cord or fix it so no free length exceeds 220 mm.',
          })
        : makeCheck({
            id: 'cord', name: 'Cord length (under 18 months)', citationId: 'IS9873-1-5.3',
            requirement: 'Applies to toys for under 18 months', provided: `${fmt(v.cord, 0)} mm`, status: STATUS.NA,
          }),
    );

    checks.push(passFail(v.edgesOk === 'yes', {
      id: 'edges', name: 'Accessible edges', citationId: 'IS9873-1-4.5',
      requirement: 'No hazardous sharp edges', provided: v.edgesOk === 'yes' ? 'Test passed' : 'Test failed',
      advice: 'Round or deburr the edge and repeat the sharp edge test.',
    }));
    checks.push(passFail(v.pointsOk === 'yes', {
      id: 'points', name: 'Accessible points', citationId: 'IS9873-1-4.5',
      requirement: 'No hazardous sharp points', provided: v.pointsOk === 'yes' ? 'Test passed' : 'Test failed',
      advice: 'Blunt or guard the point and repeat the sharp point test.',
    }));

    for (const l of LIMITS) {
      checks.push(passFail(v[l.key] <= l.max, {
        id: `mig-${l.key}`, name: `${l.label} migration`, citationId: 'IS9873-3-4',
        requirement: `At most ${l.max} mg/kg`, provided: `${fmt(v[l.key])} mg/kg`,
        advice: `Reformulate the coating or material to cut ${l.label.toLowerCase()} below ${l.max} mg/kg, then re-test.`,
      }));
    }

    const worst = LIMITS.map((l) => ({ ...l, ratio: v[l.key] / l.max })).sort((a, b) => b.ratio - a.ratio)[0];
    return {
      checks,
      derived: [
        { label: 'Closest element to its limit', value: `${worst.label} at ${Math.round(worst.ratio * 100)} % of limit` },
        { label: 'Age group', value: { under18: 'Under 18 months', under36: '18 to 36 months', over36: '36 months and above' }[v.age] },
      ],
    };
  },
};
