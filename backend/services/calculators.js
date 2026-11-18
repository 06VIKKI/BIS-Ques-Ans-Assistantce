/**
 * Small, deterministic calculators that let the assistant answer numeric questions with a
 * worked example. Each calculator returns null unless the question supplies every input,
 * so the assistant never guesses a missing value.
 *
 * Returned text uses {{clauseId}} placeholders that the answer engine converts to [n] markers.
 */

import { normalise } from './tokenizer.js';

/** Design bond stress for plain bars in tension (N/mm2), IS 456 Cl. 26.2.1.1. */
const TAU_BD_PLAIN = { 20: 1.2, 25: 1.4, 30: 1.5, 35: 1.7, 40: 1.9 };

const num = (v) => Number.parseFloat(v);
const round = (v, dp = 1) => Math.round(v * 10 ** dp) / 10 ** dp;

function parseInputs(q) {
  const text = normalise(q);
  const dia = text.match(/(\d+(?:\.\d+)?)\s*mm\b/);
  const fe = text.match(/\bfe(\d{3})d?\b/);
  const m = text.match(/\bm(\d{2})\b/);
  return {
    text,
    dia: dia ? num(dia[1]) : null,
    fy: fe ? num(fe[1]) : null,
    fck: m ? num(m[1]) : null,
  };
}

function bondStress(fck) {
  if (fck < 20) return null;
  const key = fck >= 40 ? 40 : fck;
  const plain = TAU_BD_PLAIN[key];
  return plain ? { plain, deformed: plain * 1.6 } : null;
}

function developmentLength({ dia, fy, fck }) {
  const tau = bondStress(fck);
  const sigma = 0.87 * fy;
  const ld = (dia * sigma) / (4 * tau.deformed);
  return { tau, sigma, ld };
}

const calculators = [
  {
    id: 'development-length',
    test: (q, i) => /(development length|\bld\b|anchorage)/.test(i.text) && i.dia && i.fy && i.fck,
    run: (q, i) => {
      const tau = bondStress(i.fck);
      if (!tau) {
        return {
          text: `Design bond stress in {{IS456-26.2.1}} is tabulated for M20 and above, so M${i.fck} is outside the tabulated range.`,
        };
      }
      const { sigma, ld } = developmentLength(i);
      return {
        text:
          `For a **${i.dia} mm Fe ${i.fy}** deformed bar in **M${i.fck}** concrete, the development length in tension follows {{IS456-26.2.1}}:\n\n` +
          `- Design bond stress for plain bars in M${i.fck} is ${tau.plain} N/mm2; deformed bars get a 60 percent increase, so tau_bd = ${round(tau.deformed, 2)} N/mm2.\n` +
          `- Bar stress at design load: sigma_s = 0.87 x ${i.fy} = ${round(sigma, 1)} N/mm2.\n` +
          `- Ld = (phi x sigma_s) / (4 x tau_bd) = (${i.dia} x ${round(sigma, 1)}) / (4 x ${round(tau.deformed, 2)}) = **${Math.ceil(ld)} mm** (about ${round(ld / i.dia, 0)} phi).\n\n` +
          `For bars in compression, tau_bd is a further 25 percent higher, which shortens the length. Round up to a practical value on the drawing.`,
        calc: { name: 'Development length', result: `${Math.ceil(ld)} mm`, inputs: { phi: i.dia, fy: i.fy, fck: i.fck } },
        followUps: ['What lap length applies to the same bar?', 'What is the minimum cover for a column?'],
      };
    },
  },
  {
    id: 'lap-length',
    test: (q, i) => /\blap\b|splice|overlap/.test(i.text) && i.dia && i.fy && i.fck,
    run: (q, i) => {
      const tau = bondStress(i.fck);
      if (!tau) return { text: `Design bond stress in {{IS456-26.2.1}} is tabulated for M20 and above, so M${i.fck} is outside the tabulated range.` };
      const { ld } = developmentLength(i);
      const lap = Math.max(ld, 30 * i.dia);
      return {
        text:
          `For a **${i.dia} mm Fe ${i.fy}** bar in **M${i.fck}** concrete, the tension lap length comes from {{IS456-26.2.5.1}}:\n\n` +
          `- Development length Ld = ${Math.ceil(ld)} mm (from {{IS456-26.2.1}}).\n` +
          `- 30 phi = ${30 * i.dia} mm.\n` +
          `- Lap in flexural tension = greater of the two = **${Math.ceil(lap)} mm**.\n` +
          `- Lap in direct tension = greater of 2 Ld and 30 phi = ${Math.ceil(Math.max(2 * ld, 30 * i.dia))} mm.`,
        calc: { name: 'Lap length (flexural tension)', result: `${Math.ceil(lap)} mm`, inputs: { phi: i.dia, fy: i.fy, fck: i.fck } },
        followUps: ['What is the development length for this bar?'],
      };
    },
  },
  {
    id: 'modulus',
    test: (q, i) => /(modulus of elasticity|young|\bec\b)/.test(i.text) && i.fck && !/steel|is800/.test(i.text),
    run: (q, i) => {
      const ec = 5000 * Math.sqrt(i.fck);
      return {
        text: `For **M${i.fck}** concrete the short term modulus is Ec = 5000 sqrt(fck) = 5000 x sqrt(${i.fck}) = **${Math.round(ec).toLocaleString('en-IN')} N/mm2** ({{IS456-6.2.3.1}}).`,
        calc: { name: 'Modulus of elasticity', result: `${Math.round(ec)} N/mm2`, inputs: { fck: i.fck } },
        followUps: ['What is the flexural strength of M25 concrete?'],
      };
    },
  },
  {
    id: 'flexural-strength',
    test: (q, i) => /(flexural strength|modulus of rupture|\bfcr\b)/.test(i.text) && i.fck,
    run: (q, i) => {
      const fcr = 0.7 * Math.sqrt(i.fck);
      return {
        text: `For **M${i.fck}** concrete, fcr = 0.7 sqrt(fck) = 0.7 x sqrt(${i.fck}) = **${round(fcr, 2)} N/mm2** ({{IS456-6.2.2}}).`,
        calc: { name: 'Flexural strength', result: `${round(fcr, 2)} N/mm2`, inputs: { fck: i.fck } },
        followUps: ['What is the modulus of elasticity of M25 concrete?'],
      };
    },
  },
  {
    id: 'bar-mass',
    test: (q, i) => /(mass|weight|kg\s*m|per metre|per meter)/.test(i.text) && /(bar|rebar|tmt|is1786|fe\d{3})/.test(i.text) && i.dia,
    run: (q, i) => {
      const mass = (i.dia * i.dia) / 162;
      return {
        text:
          `The nominal mass of a **${i.dia} mm** bar is d^2 / 162 = ${i.dia}^2 / 162 = **${round(mass, 3)} kg/m** ({{IS1786-8.1}}).\n\n` +
          `Tolerance on mass for a ${i.dia} mm bar is ${i.dia <= 10 ? '7 percent per batch and 8 percent per sample' : i.dia <= 16 ? '5 percent per batch and 6 percent per sample' : '3 percent per batch and 4 percent per sample'} ({{IS1786-8.2}}), so an acceptable measured mass lies between ` +
          `${round(mass * (1 - (i.dia <= 10 ? 0.08 : i.dia <= 16 ? 0.06 : 0.04)), 3)} and ${round(mass * (1 + (i.dia <= 10 ? 0.08 : i.dia <= 16 ? 0.06 : 0.04)), 3)} kg/m for an individual sample.`,
        calc: { name: 'Nominal bar mass', result: `${round(mass, 3)} kg/m`, inputs: { d: i.dia } },
        followUps: ['What are the tensile requirements for Fe 500D?'],
      };
    },
  },
];

/** @returns {{text: string, calc?: object, followUps?: string[], id: string} | null} */
export function runCalculators(query) {
  const inputs = parseInputs(query);
  for (const calc of calculators) {
    if (calc.test(query, inputs)) return { id: calc.id, ...calc.run(query, inputs) };
  }
  return null;
}
