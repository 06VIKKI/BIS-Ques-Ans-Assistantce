import { STATUS, makeCheck, passFail, numberField, selectField, fmt } from './helpers.js';

const MEMBER_TYPES = [
  { value: 'comp-dl-ll', label: 'Compression member (dead and imposed load)' },
  { value: 'comp-wind', label: 'Compression member (wind or seismic only)' },
  { value: 'tension-reversal', label: 'Tension member with possible stress reversal' },
  { value: 'tie-roof', label: 'Tie in a roof truss' },
  { value: 'tension-other', label: 'Other tension member' },
];
const SLENDERNESS_LIMIT = { 'comp-dl-ll': 180, 'comp-wind': 250, 'tension-reversal': 250, 'tie-roof': 350, 'tension-other': 400 };

const DEFLECTION_CASES = [
  { value: 'purlin', label: 'Purlin or girt, elastic cladding (L/150)', limit: 150 },
  { value: 'simple-elastic', label: 'Simply supported beam, elastic cladding (L/240)', limit: 240 },
  { value: 'simple-brittle', label: 'Simply supported beam, brittle cladding (L/300)', limit: 300 },
  { value: 'cantilever-elastic', label: 'Cantilever, elastic cladding (L/120)', limit: 120 },
  { value: 'cantilever-brittle', label: 'Cantilever, brittle cladding (L/150)', limit: 150 },
];

/** IS 800 Cl. 10.2.1 Table 19: hole clearance. */
const holeDia = (d) => d + (d <= 14 ? 1 : d <= 22 ? 1.5 : d <= 24 ? 2 : 3);
/** IS 800 Cl. 10.5.2.3 Table 21: minimum fillet weld size from the thicker part. */
const minWeld = (t) => (t <= 10 ? 3 : t <= 20 ? 5 : t <= 32 ? 6 : 8);

export const steel800 = {
  id: 'steel-800',
  standard: 'IS 800:2007',
  title: 'Steel member and connection',
  description: 'Checks slenderness, section class, deflection, bolt layout and fillet weld size for a hot-rolled steel member and its connections.',
  fields: [
    selectField('fy', 'Steel grade', [{ value: '250', label: 'E250 (fy 250)' }, { value: '350', label: 'E350 (fy 350)' }, { value: '410', label: 'E410 (fy 410)' }], 250, { group: 'Member' }),
    selectField('memberType', 'Member type', MEMBER_TYPES, 'comp-dl-ll', { group: 'Member' }),
    numberField('kl', 'Effective length KL', 'mm', 3600, { min: 100, max: 40000, group: 'Member' }),
    numberField('r', 'Radius of gyration r', 'mm', 28, { min: 1, max: 500, step: 0.1, group: 'Member' }),
    numberField('bTf', 'Flange outstand ratio b/tf', '', 8.5, { min: 1, max: 60, step: 0.1, group: 'Section class' }),
    numberField('dTw', 'Web ratio d/tw', '', 60, { min: 1, max: 300, step: 0.1, group: 'Section class' }),
    selectField('deflCase', 'Deflection case', DEFLECTION_CASES, 'simple-elastic', { group: 'Deflection' }),
    numberField('spanMm', 'Span', 'mm', 6000, { min: 500, max: 40000, group: 'Deflection' }),
    numberField('deflection', 'Calculated deflection', 'mm', 22, { min: 0, max: 500, step: 0.1, group: 'Deflection' }),
    selectField('boltDia', 'Bolt diameter', [12, 16, 20, 24, 30].map((d) => ({ value: String(d), label: `M${d}` })), 20, { group: 'Bolted joint' }),
    numberField('pitch', 'Pitch', 'mm', 60, { min: 10, max: 500, group: 'Bolted joint' }),
    numberField('edge', 'Edge or end distance', 'mm', 36, { min: 5, max: 200, group: 'Bolted joint' }),
    numberField('plateT', 'Thinner outer plate thickness t', 'mm', 10, { min: 2, max: 60, step: 0.5, group: 'Bolted joint' }),
    selectField('edgeType', 'Edge type', [
      { value: 'rolled', label: 'Rolled, machine flame-cut, sawn or planed' },
      { value: 'sheared', label: 'Sheared or hand flame-cut' },
    ], 'rolled', { group: 'Bolted joint' }),
    numberField('weldSize', 'Fillet weld size', 'mm', 6, { min: 1, max: 30, step: 0.5, group: 'Fillet weld' }),
    numberField('thicker', 'Thicker part joined', 'mm', 12, { min: 2, max: 80, step: 0.5, group: 'Fillet weld' }),
    numberField('thinner', 'Thinner part joined', 'mm', 10, { min: 2, max: 80, step: 0.5, group: 'Fillet weld' }),
    numberField('weldLength', 'Effective weld length', 'mm', 120, { min: 5, max: 2000, group: 'Fillet weld' }),
  ],
  samples: {
    pass: { label: 'Compliant steel member', values: {} },
    fail: {
      label: 'Non-compliant steel member',
      values: { kl: 6500, r: 22, bTf: 15, dTw: 90, deflection: 34, pitch: 40, edge: 28, edgeType: 'sheared', weldSize: 3, thicker: 14, weldLength: 10 },
    },
  },
  validate: () => [],
  evaluate(v) {
    const checks = [];
    const fy = Number(v.fy);
    const eps = Math.sqrt(250 / fy);

    const lambda = v.kl / v.r;
    const lim = SLENDERNESS_LIMIT[v.memberType];
    checks.push(passFail(lambda <= lim, {
      id: 'slenderness', name: 'Effective slenderness ratio', citationId: 'IS800-3.8',
      requirement: `KL/r at most ${lim} for this member type`, provided: `KL/r = ${fmt(lambda)}`,
      advice: 'Choose a section with a larger radius of gyration or add bracing to shorten the effective length.',
    }));

    const flange = v.bTf <= 8.4 * eps ? 'plastic' : v.bTf <= 9.4 * eps ? 'compact' : v.bTf <= 13.6 * eps ? 'semi-compact' : 'slender';
    const web = v.dTw <= 84 * eps ? 'plastic' : v.dTw <= 105 * eps ? 'compact' : v.dTw <= 126 * eps ? 'semi-compact' : 'slender';
    const order = ['plastic', 'compact', 'semi-compact', 'slender'];
    const cls = order[Math.max(order.indexOf(flange), order.indexOf(web))];
    checks.push(makeCheck({
      id: 'class', name: 'Section classification', citationId: 'IS800-3.7.2',
      requirement: 'Plastic, compact or semi-compact for full section capacity',
      provided: `Flange ${flange} (b/tf ${fmt(v.bTf)}), web ${web} (d/tw ${fmt(v.dTw)}), overall ${cls}`,
      status: cls === 'slender' ? STATUS.FAIL : STATUS.PASS,
      advice: cls === 'slender' ? 'Slender sections need effective-width design for local buckling. Choose a stockier section.' : '',
    }));

    const dc = DEFLECTION_CASES.find((c) => c.value === v.deflCase);
    const allowed = v.spanMm / dc.limit;
    checks.push(passFail(v.deflection <= allowed, {
      id: 'deflection', name: 'Deflection limit', citationId: 'IS800-5.6.1',
      requirement: `At most span/${dc.limit} = ${fmt(allowed)} mm`, provided: `${fmt(v.deflection)} mm`,
      advice: 'Increase the section stiffness (moment of inertia) or reduce the span.',
    }));

    const d = Number(v.boltDia);
    const d0 = holeDia(d);
    checks.push(passFail(v.pitch >= 2.5 * d, {
      id: 'pitch-min', name: 'Minimum bolt pitch', citationId: 'IS800-10.2.2',
      requirement: `At least 2.5 d = ${fmt(2.5 * d)} mm`, provided: `${fmt(v.pitch)} mm`,
      advice: `Increase pitch to at least ${Math.ceil(2.5 * d)} mm.`,
    }));
    const pitchMax = Math.min(32 * v.plateT, 300);
    checks.push(passFail(v.pitch <= pitchMax, {
      id: 'pitch-max', name: 'Maximum bolt pitch', citationId: 'IS800-10.2.3',
      requirement: `At most min(32 t, 300) = ${fmt(pitchMax)} mm`, provided: `${fmt(v.pitch)} mm`,
      advice: `Reduce pitch to ${Math.floor(pitchMax)} mm or less to prevent plate separation.`,
    }));
    const edgeFactor = v.edgeType === 'sheared' ? 1.7 : 1.5;
    checks.push(passFail(v.edge >= edgeFactor * d0, {
      id: 'edge-min', name: 'Minimum edge distance', citationId: 'IS800-10.2.4.2',
      requirement: `At least ${edgeFactor} x hole dia ${fmt(d0)} = ${fmt(edgeFactor * d0)} mm`, provided: `${fmt(v.edge)} mm`,
      advice: `Increase edge distance to at least ${Math.ceil(edgeFactor * d0)} mm.`,
    }));
    const edgeMax = 12 * v.plateT * eps;
    checks.push(passFail(v.edge <= edgeMax, {
      id: 'edge-max', name: 'Maximum edge distance', citationId: 'IS800-10.2.4.3',
      requirement: `At most 12 t epsilon = ${fmt(edgeMax)} mm`, provided: `${fmt(v.edge)} mm`,
      advice: 'Reduce the edge distance to limit corrosion and plate lifting at the edge.',
    }));

    const minSize = minWeld(v.thicker);
    checks.push(passFail(v.weldSize >= minSize, {
      id: 'weld-size', name: 'Minimum fillet weld size', citationId: 'IS800-10.5.2.3',
      requirement: `At least ${minSize} mm for a ${fmt(v.thicker)} mm thicker part`, provided: `${fmt(v.weldSize)} mm`,
      advice: `Use a weld size of at least ${minSize} mm to avoid rapid cooling and cracking.`,
    }));
    checks.push(passFail(v.weldSize <= v.thinner, {
      id: 'weld-max', name: 'Maximum fillet weld size', citationId: 'IS800-10.5.2.3',
      requirement: `At most the thinner part, ${fmt(v.thinner)} mm`, provided: `${fmt(v.weldSize)} mm`,
      advice: 'Reduce weld size; it cannot exceed the thinner plate.',
    }));
    checks.push(passFail(v.weldLength >= 4 * v.weldSize, {
      id: 'weld-length', name: 'Minimum weld length', citationId: 'IS800-10.5.4.1',
      requirement: `At least 4 x size = ${fmt(4 * v.weldSize)} mm`, provided: `${fmt(v.weldLength)} mm`,
      advice: 'Lengthen the weld or reduce its size.',
    }));

    return {
      checks,
      derived: [
        { label: 'Epsilon sqrt(250 / fy)', value: eps.toFixed(3) },
        { label: 'KL / r', value: fmt(lambda) },
        { label: 'Bolt hole diameter', value: `${fmt(d0)} mm` },
        { label: 'Weld effective throat (0.7 x size)', value: `${fmt(0.7 * v.weldSize)} mm` },
      ],
    };
  },
};
