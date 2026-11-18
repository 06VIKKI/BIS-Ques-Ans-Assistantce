import { STATUS, makeCheck, passFail, numberField, selectField, fmt, barArea, EXPOSURE_OPTIONS, EXPOSURE_RULES } from './helpers.js';

export const column456 = {
  id: 'column-456',
  standard: 'IS 456:2000',
  title: 'RC column detailing',
  description: 'Checks grade, cover, longitudinal steel percentage, bar count and spacing, ties and slenderness of a reinforced concrete column.',
  fields: [
    selectField('shape', 'Shape', [{ value: 'rectangular', label: 'Rectangular' }, { value: 'circular', label: 'Circular' }], 'rectangular', { group: 'Section' }),
    numberField('b', 'Width b (or diameter)', 'mm', 400, { min: 150, max: 2000, group: 'Section' }),
    numberField('D', 'Depth D (ignored if circular)', 'mm', 400, { min: 150, max: 2000, group: 'Section' }),
    numberField('length', 'Unsupported length', 'mm', 3200, { min: 500, max: 20000, group: 'Section' }),
    selectField('fck', 'Concrete grade', [20, 25, 30, 35, 40].map((g) => ({ value: String(g), label: `M${g}` })), 30, { group: 'Materials' }),
    selectField('exposure', 'Exposure class', EXPOSURE_OPTIONS, 'moderate', { group: 'Materials' }),
    numberField('cover', 'Nominal cover', 'mm', 40, { min: 5, max: 120, group: 'Reinforcement' }),
    numberField('bars', 'Number of longitudinal bars', '', 8, { min: 2, max: 60, step: 1, group: 'Reinforcement' }),
    numberField('barDia', 'Longitudinal bar diameter', 'mm', 20, { min: 8, max: 40, group: 'Reinforcement' }),
    numberField('tieDia', 'Tie diameter', 'mm', 8, { min: 4, max: 16, group: 'Ties' }),
    numberField('tieSpacing', 'Tie spacing', 'mm', 250, { min: 50, max: 600, group: 'Ties' }),
  ],
  samples: {
    pass: { label: 'Compliant column', values: {} },
    fail: {
      label: 'Non-compliant column',
      values: { b: 300, D: 300, bars: 3, barDia: 10, cover: 25, tieDia: 5, tieSpacing: 350, length: 19000, fck: '20', exposure: 'severe' },
    },
  },
  validate: () => [],
  evaluate(v) {
    const checks = [];
    const fck = Number(v.fck);
    const circular = v.shape === 'circular';
    const dimD = circular ? v.b : v.D;
    const least = Math.min(v.b, dimD);
    const gross = circular ? (Math.PI * v.b * v.b) / 4 : v.b * v.D;
    const ast = v.bars * barArea(v.barDia);
    const pct = (100 * ast) / gross;
    const rules = EXPOSURE_RULES[v.exposure];

    checks.push(passFail(fck >= rules.minGrade, {
      id: 'grade', name: 'Concrete grade for exposure', citationId: 'IS456-8.2.4.1',
      requirement: `Minimum M${rules.minGrade} for ${v.exposure} exposure`, provided: `M${fck}`,
      advice: `Use M${rules.minGrade} or higher.`,
    }));

    const small = least <= 200 && v.barDia <= 12;
    const colCover = small ? 25 : 40;
    const needed = Math.max(colCover, rules.cover, v.barDia);
    checks.push(passFail(v.cover >= needed, {
      id: 'cover', name: 'Nominal cover for column', citationId: 'IS456-26.4.2.1',
      requirement: `At least ${needed} mm (column minimum ${colCover} mm, ${v.exposure} exposure ${rules.cover} mm, bar diameter ${fmt(v.barDia)} mm)`,
      provided: `${fmt(v.cover)} mm`, advice: `Increase nominal cover to ${needed} mm.`,
    }));

    checks.push(passFail(pct >= 0.8, {
      id: 'ast-min', name: 'Minimum longitudinal steel', citationId: 'IS456-26.5.3.1',
      requirement: 'At least 0.8 percent of gross area', provided: `${fmt(pct, 2)} % (${fmt(ast)} mm2)`,
      advice: `Provide at least ${Math.ceil(0.008 * gross)} mm2 of longitudinal steel.`,
    }));
    checks.push(makeCheck({
      id: 'ast-max', name: 'Maximum longitudinal steel', citationId: 'IS456-26.5.3.1',
      requirement: 'At most 6 percent (about 4 percent where bars are lapped)',
      provided: `${fmt(pct, 2)} %`,
      status: pct > 6 ? STATUS.FAIL : pct > 4 ? STATUS.WARN : STATUS.PASS,
      advice: pct > 6 ? 'Enlarge the column section.' : pct > 4 ? 'Above 4 percent, lapping bars from the column below becomes congested. Consider a larger section.' : '',
    }));

    const minBars = circular ? 6 : 4;
    checks.push(passFail(v.bars >= minBars, {
      id: 'bar-count', name: 'Minimum number of bars', citationId: 'IS456-26.5.3.1',
      requirement: `At least ${minBars} bars in a ${v.shape} column`, provided: `${v.bars} bars`,
      advice: `Provide at least ${minBars} longitudinal bars.`,
    }));
    checks.push(passFail(v.barDia >= 12, {
      id: 'bar-dia', name: 'Minimum bar diameter', citationId: 'IS456-26.5.3.1',
      requirement: 'At least 12 mm', provided: `${fmt(v.barDia)} mm`, advice: 'Use bars of 12 mm or larger.',
    }));

    const c = v.cover + v.tieDia + v.barDia / 2;
    const perimeter = circular ? Math.PI * (v.b - 2 * c) : 2 * (v.b - 2 * c + (v.D - 2 * c));
    const spacing = perimeter / Math.max(v.bars, 1);
    checks.push(passFail(spacing <= 300, {
      id: 'bar-spacing', name: 'Spacing of bars along periphery', citationId: 'IS456-26.5.3.1',
      requirement: 'At most 300 mm (average centre to centre)', provided: `about ${fmt(spacing, 0)} mm`,
      advice: 'Add bars to reduce spacing to 300 mm or less.',
    }));

    const minTie = Math.max(6, v.barDia / 4);
    checks.push(passFail(v.tieDia >= minTie, {
      id: 'tie-dia', name: 'Tie diameter', citationId: 'IS456-26.5.3.2',
      requirement: `At least max(6 mm, bar dia / 4) = ${fmt(minTie)} mm`, provided: `${fmt(v.tieDia)} mm`,
      advice: `Use ties of at least ${Math.ceil(minTie)} mm diameter.`,
    }));
    const maxPitch = Math.min(least, 16 * v.barDia, 300);
    checks.push(passFail(v.tieSpacing <= maxPitch, {
      id: 'tie-spacing', name: 'Tie spacing', citationId: 'IS456-26.5.3.2',
      requirement: `At most min(${fmt(least, 0)}, ${fmt(16 * v.barDia, 0)}, 300) = ${fmt(maxPitch, 0)} mm`, provided: `${fmt(v.tieSpacing)} mm`,
      advice: `Reduce tie spacing to ${Math.floor(maxPitch)} mm or less.`,
    }));

    checks.push(passFail(v.length <= 60 * least, {
      id: 'slenderness-limit', name: 'Unsupported length limit', citationId: 'IS456-25.3.1',
      requirement: `At most 60 x least dimension = ${fmt(60 * least, 0)} mm`, provided: `${fmt(v.length, 0)} mm`,
      advice: 'Add intermediate restraint or enlarge the section.',
    }));
    const ratio = v.length / least;
    checks.push(makeCheck({
      id: 'short-column', name: 'Short or slender column', citationId: 'IS456-25.1.2',
      requirement: 'Short when effective length / dimension is below 12', provided: `unsupported length / least dimension = ${fmt(ratio)}`,
      status: ratio < 12 ? STATUS.PASS : STATUS.WARN,
      advice: ratio < 12 ? '' : 'Likely a slender column once effective length is applied. Design for additional moments.',
    }));

    const eMin = Math.max(v.length / 500 + least / 30, 20);
    return {
      checks,
      derived: [
        { label: 'Gross area', value: `${fmt(gross, 0)} mm2` },
        { label: 'Steel provided', value: `${fmt(ast, 0)} mm2 (${fmt(pct, 2)} %)` },
        { label: 'Minimum eccentricity (IS 456 Cl. 25.4)', value: `${fmt(eMin)} mm` },
        { label: 'Unsupported length / least dimension', value: fmt(ratio) },
      ],
    };
  },
};
