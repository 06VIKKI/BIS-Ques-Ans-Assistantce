import { STATUS, makeCheck, passFail, numberField, selectField, fmt, barArea, EXPOSURE_OPTIONS, EXPOSURE_RULES } from './helpers.js';

export const beam456 = {
  id: 'beam-456',
  standard: 'IS 456:2000',
  title: 'RC beam detailing',
  description: 'Checks grade, cover, tension and shear steel, stirrup spacing and span to depth ratio of a reinforced concrete beam.',
  fields: [
    numberField('b', 'Beam width b', 'mm', 300, { min: 100, max: 1500, group: 'Section' }),
    numberField('D', 'Overall depth D', 'mm', 550, { min: 150, max: 2500, group: 'Section' }),
    numberField('d', 'Effective depth d', 'mm', 500, { min: 100, max: 2400, group: 'Section' }),
    numberField('span', 'Span', 'm', 6, { min: 0.5, max: 30, step: 0.1, group: 'Section' }),
    selectField('support', 'Support condition', [
      { value: 'simple', label: 'Simply supported' },
      { value: 'continuous', label: 'Continuous' },
      { value: 'cantilever', label: 'Cantilever' },
    ], 'simple', { group: 'Section' }),
    selectField('fck', 'Concrete grade', [20, 25, 30, 35, 40].map((g) => ({ value: String(g), label: `M${g}` })), 25, { group: 'Materials' }),
    selectField('fy', 'Steel grade', [250, 415, 500].map((g) => ({ value: String(g), label: `Fe ${g}` })), 500, { group: 'Materials' }),
    selectField('exposure', 'Exposure class', EXPOSURE_OPTIONS, 'moderate', { group: 'Materials' }),
    numberField('cover', 'Nominal cover', 'mm', 30, { min: 5, max: 120, group: 'Reinforcement' }),
    numberField('barDia', 'Main bar diameter', 'mm', 20, { min: 8, max: 40, group: 'Reinforcement' }),
    numberField('ast', 'Tension steel provided Ast', 'mm2', 1257, { min: 50, max: 40000, group: 'Reinforcement' }),
    numberField('stirrupDia', 'Stirrup diameter', 'mm', 8, { min: 6, max: 16, group: 'Shear reinforcement' }),
    numberField('legs', 'Stirrup legs', '', 2, { min: 2, max: 6, step: 1, group: 'Shear reinforcement' }),
    numberField('stirrupSpacing', 'Stirrup spacing', 'mm', 200, { min: 50, max: 600, group: 'Shear reinforcement' }),
  ],
  samples: {
    pass: { label: 'Compliant beam', values: {} },
    fail: {
      label: 'Non-compliant beam',
      values: { fck: '20', exposure: 'severe', cover: 25, ast: 250, stirrupSpacing: 400, span: 9, d: 400, D: 450 },
    },
  },
  validate: (v) => (v.d >= v.D ? [{ field: 'd', message: 'Effective depth must be smaller than overall depth.' }] : []),
  evaluate(v) {
    const checks = [];
    const rules = EXPOSURE_RULES[v.exposure];
    const fck = Number(v.fck);
    const fy = Number(v.fy);

    checks.push(passFail(fck >= rules.minGrade, {
      id: 'grade', name: 'Concrete grade for exposure', citationId: 'IS456-8.2.4.1',
      requirement: `Minimum M${rules.minGrade} for ${v.exposure} exposure`, provided: `M${fck}`,
      advice: `Use M${rules.minGrade} or higher, with the cement content and water-cement ratio from the same table.`,
    }));

    const reduced = v.exposure === 'mild' && (v.barDia <= 12 || fck >= 25);
    const requiredCover = reduced ? rules.cover - 5 : rules.cover;
    checks.push(passFail(v.cover >= requiredCover, {
      id: 'cover', name: 'Nominal cover (durability)', citationId: 'IS456-26.4.2',
      requirement: `At least ${requiredCover} mm for ${v.exposure} exposure${reduced ? ' (5 mm reduction applied)' : ''}`, provided: `${fmt(v.cover)} mm`,
      advice: `Increase nominal cover to ${requiredCover} mm and update bar bending schedule and spacer details.`,
    }));

    checks.push(passFail(v.cover >= v.barDia, {
      id: 'cover-dia', name: 'Cover not less than bar diameter', citationId: 'IS456-26.4.1',
      requirement: `At least ${fmt(v.barDia)} mm (main bar diameter)`, provided: `${fmt(v.cover)} mm`,
      advice: 'Increase the cover or reduce the bar diameter.',
    }));

    const asMin = (0.85 * v.b * v.d) / fy;
    const asMax = 0.04 * v.b * v.D;
    checks.push(passFail(v.ast >= asMin, {
      id: 'as-min', name: 'Minimum tension steel', citationId: 'IS456-26.5.1.1',
      requirement: `Ast at least 0.85 b d / fy = ${fmt(asMin)} mm2`, provided: `${fmt(v.ast)} mm2`,
      advice: `Provide at least ${Math.ceil(asMin)} mm2 of tension reinforcement.`,
    }));
    checks.push(passFail(v.ast <= asMax, {
      id: 'as-max', name: 'Maximum tension steel', citationId: 'IS456-26.5.1.1',
      requirement: `Ast at most 0.04 b D = ${fmt(asMax)} mm2`, provided: `${fmt(v.ast)} mm2`,
      advice: 'Increase the section size instead of adding steel; congestion also hurts compaction.',
    }));

    const basic = { simple: 20, continuous: 26, cantilever: 7 }[v.support];
    const limit = v.span > 10 && v.support !== 'cantilever' ? (basic * 10) / v.span : basic;
    const ratio = (v.span * 1000) / v.d;
    let ldStatus = STATUS.PASS;
    if (ratio > limit) ldStatus = ratio <= limit * 2 ? STATUS.WARN : STATUS.FAIL;
    checks.push(makeCheck({
      id: 'deflection', name: 'Span to effective depth ratio', citationId: 'IS456-23.2.1',
      requirement: `Basic limit ${fmt(limit)} (modification factors can raise this, up to 2.0 for tension steel)`,
      provided: `L/d = ${fmt(ratio)}`, status: ldStatus,
      advice: ldStatus === STATUS.WARN
        ? 'Exceeds the basic ratio. Compute the tension steel modification factor to confirm, or increase depth.'
        : 'Exceeds even the maximum modified limit. Increase the effective depth.',
    }));

    const maxSpacing = Math.min(0.75 * v.d, 300);
    checks.push(passFail(v.stirrupSpacing <= maxSpacing, {
      id: 'stirrup-spacing', name: 'Maximum stirrup spacing', citationId: 'IS456-26.5.1.5',
      requirement: `At most min(0.75 d, 300) = ${fmt(maxSpacing)} mm`, provided: `${fmt(v.stirrupSpacing)} mm`,
      advice: `Reduce stirrup spacing to ${Math.floor(maxSpacing)} mm or less.`,
    }));

    const asv = v.legs * barArea(v.stirrupDia);
    const fyStirrup = Math.min(fy, 415);
    const minRatio = 0.4 / (0.87 * fyStirrup);
    const ratioProvided = asv / (v.b * v.stirrupSpacing);
    checks.push(passFail(ratioProvided >= minRatio, {
      id: 'shear-min', name: 'Minimum shear reinforcement', citationId: 'IS456-26.5.1.6',
      requirement: `Asv / (b sv) at least ${minRatio.toFixed(5)}`, provided: `${ratioProvided.toFixed(5)} (Asv = ${fmt(asv)} mm2)`,
      advice: 'Use a larger stirrup diameter, more legs, or a closer spacing.',
    }));

    checks.push(makeCheck({
      id: 'side-face', name: 'Side face reinforcement', citationId: 'IS456-26.5.1.3',
      requirement: 'Required when web depth exceeds 750 mm', provided: `D = ${fmt(v.D)} mm`,
      status: v.D > 750 ? STATUS.WARN : STATUS.NA,
      advice: v.D > 750 ? 'Add side face steel of 0.1 percent of web area, split over both faces.' : '',
    }));

    return {
      checks,
      derived: [
        { label: 'Tension steel ratio 100 Ast / (b d)', value: `${fmt((100 * v.ast) / (v.b * v.d), 2)} %` },
        { label: 'Minimum Ast', value: `${fmt(asMin)} mm2` },
        { label: 'Maximum Ast', value: `${fmt(asMax)} mm2` },
        { label: 'Span / effective depth', value: fmt(ratio) },
        { label: 'Asv provided', value: `${fmt(asv)} mm2` },
      ],
    };
  },
};
