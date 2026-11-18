import { STATUS, makeCheck, passFail, numberField, selectField, fmt } from './helpers.js';

/** IS 1786 Table 3: minimum yield (0.2% proof), UTS and elongation per grade. */
const MECHANICAL = {
  'Fe 415': { ys: 415, uts: 485, el: 14.5 },
  'Fe 415D': { ys: 415, uts: 500, el: 18 },
  'Fe 500': { ys: 500, uts: 545, el: 12 },
  'Fe 500D': { ys: 500, uts: 565, el: 16 },
  'Fe 550': { ys: 550, uts: 585, el: 10 },
  'Fe 550D': { ys: 550, uts: 600, el: 14.5 },
  'Fe 600': { ys: 600, uts: 660, el: 10 },
};

/** Chemical limits that are present in the demo corpus (IS 1786 Table 1). Other grades are not checked. */
const CHEMISTRY = {
  'Fe 415': { c: 0.3, s: 0.06, p: 0.06, sp: 0.11 },
  'Fe 500': { c: 0.3, s: 0.055, p: 0.055, sp: 0.105 },
  'Fe 500D': { c: 0.25, s: 0.04, p: 0.04, sp: 0.075 },
};

const SIZES = [8, 10, 12, 16, 20, 25, 28, 32, 36, 40, 50];

export const rebar1786 = {
  id: 'rebar-1786',
  standard: 'IS 1786:2008',
  title: 'Rebar test report',
  description: 'Audits a mill or lab test certificate for TMT bars against grade requirements: tensile properties, mass tolerance and chemistry.',
  fields: [
    selectField('grade', 'Grade', Object.keys(MECHANICAL), 'Fe 500D', { group: 'Sample' }),
    selectField('dia', 'Nominal diameter', SIZES.map((s) => ({ value: String(s), label: `${s} mm` })), 16, { group: 'Sample' }),
    numberField('ys', '0.2% proof / yield stress', 'N/mm2', 538, { min: 100, max: 900, group: 'Tensile test' }),
    numberField('uts', 'Ultimate tensile strength', 'N/mm2', 620, { min: 100, max: 1100, group: 'Tensile test' }),
    numberField('elongation', 'Elongation', '%', 17.5, { min: 1, max: 40, step: 0.1, group: 'Tensile test' }),
    numberField('mass', 'Measured mass per metre', 'kg/m', 1.6, { min: 0.1, max: 20, step: 0.001, group: 'Dimensions' }),
    numberField('carbon', 'Carbon', '%', 0.22, { min: 0, max: 1, step: 0.001, group: 'Chemistry' }),
    numberField('sulphur', 'Sulphur', '%', 0.032, { min: 0, max: 0.5, step: 0.001, group: 'Chemistry' }),
    numberField('phosphorus', 'Phosphorus', '%', 0.034, { min: 0, max: 0.5, step: 0.001, group: 'Chemistry' }),
  ],
  samples: {
    pass: { label: 'Conforming Fe 500D sample', values: {} },
    fail: {
      label: 'Non-conforming Fe 500D sample',
      values: { ys: 492, uts: 530, elongation: 11.2, mass: 1.49, carbon: 0.27, sulphur: 0.052, phosphorus: 0.047 },
    },
  },
  validate: () => [],
  evaluate(v) {
    const checks = [];
    const req = MECHANICAL[v.grade];
    const dia = Number(v.dia);

    checks.push(passFail(v.ys >= req.ys, {
      id: 'yield', name: 'Yield / 0.2% proof stress', citationId: 'IS1786-7.1',
      requirement: `At least ${req.ys} N/mm2`, provided: `${fmt(v.ys)} N/mm2`,
      advice: 'Reject the heat or re-test on two further samples as per the sampling clause of the standard.',
    }));

    const utsFloor = Math.max(req.uts, 1.1 * v.ys);
    checks.push(passFail(v.uts >= req.uts, {
      id: 'uts', name: 'Ultimate tensile strength', citationId: 'IS1786-7.1',
      requirement: `At least ${req.uts} N/mm2`, provided: `${fmt(v.uts)} N/mm2`,
      advice: 'Reject the heat or re-test.',
    }));
    checks.push(passFail(v.uts >= 1.1 * v.ys, {
      id: 'uts-ys', name: 'UTS at least 10% above yield', citationId: 'IS1786-7.1',
      requirement: `UTS at least 1.10 x ${fmt(v.ys)} = ${fmt(1.1 * v.ys)} N/mm2`, provided: `UTS / YS = ${(v.uts / v.ys).toFixed(3)}`,
      advice: 'The ratio is a ductility indicator. A low ratio points to over-hardened or inconsistently quenched bars.',
    }));
    checks.push(passFail(v.elongation >= req.el, {
      id: 'elongation', name: 'Percentage elongation', citationId: 'IS1786-7.1',
      requirement: `At least ${req.el} %`, provided: `${fmt(v.elongation)} %`,
      advice: 'Low elongation means poor ductility. Do not use in seismic detailing.',
    }));

    const nominal = (dia * dia) / 162;
    const limit = dia <= 10 ? 8 : dia <= 16 ? 6 : 4;
    const dev = ((v.mass - nominal) / nominal) * 100;
    checks.push(passFail(Math.abs(dev) <= limit, {
      id: 'mass', name: 'Mass per metre tolerance', citationId: 'IS1786-8.2',
      requirement: `Within +/- ${limit} % of nominal ${nominal.toFixed(3)} kg/m (individual sample)`, provided: `${v.mass.toFixed(3)} kg/m (${dev >= 0 ? '+' : ''}${dev.toFixed(1)} %)`,
      advice: dev < 0 ? 'Under-weight bars mean less steel than designed. Reject the lot.' : 'Over-weight beyond tolerance. Check rolling and measurement.',
    }));

    const chem = CHEMISTRY[v.grade];
    const rows = [
      ['carbon', 'Carbon', v.carbon, chem?.c],
      ['sulphur', 'Sulphur', v.sulphur, chem?.s],
      ['phosphorus', 'Phosphorus', v.phosphorus, chem?.p],
      ['sp', 'Sulphur + phosphorus', v.sulphur + v.phosphorus, chem?.sp],
    ];
    for (const [key, name, value, max] of rows) {
      if (max === undefined) {
        checks.push(makeCheck({
          id: `chem-${key}`, name: `${name} (chemistry)`, citationId: 'IS1786-6.1',
          requirement: 'Limit for this grade is not loaded in the demo corpus', provided: `${value.toFixed(3)} %`, status: STATUS.NA,
          advice: 'Check the limit against Table 1 of the published standard.',
        }));
      } else {
        checks.push(passFail(value <= max, {
          id: `chem-${key}`, name: `${name} (chemistry)`, citationId: 'IS1786-6.1',
          requirement: `At most ${max.toFixed(3)} %`, provided: `${value.toFixed(3)} %`,
          advice: 'Excess carbon, sulphur or phosphorus reduces ductility and weldability.',
        }));
      }
    }

    return {
      checks,
      derived: [
        { label: 'Nominal mass', value: `${nominal.toFixed(3)} kg/m` },
        { label: 'Mass deviation', value: `${dev >= 0 ? '+' : ''}${dev.toFixed(2)} %` },
        { label: 'UTS / yield ratio', value: (v.uts / v.ys).toFixed(3) },
        { label: 'Effective minimum UTS', value: `${fmt(utsFloor)} N/mm2` },
      ],
    };
  },
};
