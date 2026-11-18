/**
 * Curated intents: hand-written answers for the questions engineers ask most often.
 *
 * Each intent lists the clauses it is grounded in. Answer text uses {{clauseId}} placeholders;
 * the answer engine turns them into numbered [n] markers and returns the matching citations.
 * An intent can only cite clauses that exist in the corpus, which is checked by the test suite.
 */

const EXPOSURES = ['very severe', 'severe', 'moderate', 'mild', 'extreme'];

/** Table 16 nominal cover and Table 5 mix limits, IS 456. */
const COVER = { mild: 20, moderate: 30, severe: 45, 'very severe': 50, extreme: 75 };
const MIX = {
  mild: { grade: 'M20', cement: 300, wc: 0.55 },
  moderate: { grade: 'M25', cement: 300, wc: 0.5 },
  severe: { grade: 'M30', cement: 320, wc: 0.45 },
  'very severe': { grade: 'M35', cement: 340, wc: 0.45 },
  extreme: { grade: 'M40', cement: 360, wc: 0.4 },
};

const findExposure = (q) => EXPOSURES.find((e) => q.includes(e)) || null;

export const INTENTS = [
  {
    id: 'column-cover',
    match: (q) => /cover/.test(q) && /column/.test(q),
    clauses: ['IS456-26.4.2.1', 'IS456-26.4.2', 'IS456-26.4.1'],
    build: (q) => {
      const exp = findExposure(q);
      const governing = exp ? Math.max(40, COVER[exp]) : null;
      return (
        `For columns, nominal cover to the longitudinal bars must be **at least 40 mm, and never less than the bar diameter** {{IS456-26.4.2.1}}. ` +
        `A cover of 25 mm is allowed only for columns of 200 mm or smaller dimension with bars of 12 mm or less.\n\n` +
        `Cover must also satisfy the durability table for the exposure class: 20 mm mild, 30 mm moderate, 45 mm severe, 50 mm very severe, 75 mm extreme {{IS456-26.4.2}}. ` +
        (exp
          ? `For **${exp}** exposure the table gives ${COVER[exp]} mm, so the governing column cover is the larger value: **${governing} mm**.`
          : `Use whichever of the two is larger. Tell me the exposure class and I will give the governing figure.`) +
        `\n\nNominal cover applies to all steel including links, and is the dimension shown on drawings {{IS456-26.4.1}}.`
      );
    },
    followUps: ['What is the cover for footings?', 'What mix limits apply to severe exposure?'],
  },
  {
    id: 'footing-cover',
    match: (q) => /(footing|foundation)/.test(q) && /cover/.test(q),
    clauses: ['IS456-26.4.2.2', 'IS456-26.4.2'],
    build: () =>
      `Footings need a minimum cover of **50 mm** {{IS456-26.4.2.2}}. If the exposure class demands more, the durability table governs: 45 mm severe, 50 mm very severe, 75 mm extreme {{IS456-26.4.2}}.`,
    followUps: ['What is the minimum cover for a column?'],
  },
  {
    id: 'cover-durability',
    match: (q) => /cover/.test(q) && /(exposure|durab|beam|slab|mild|moderate|severe|extreme|coastal|marine)/.test(q),
    clauses: ['IS456-26.4.2', 'IS456-26.4.1', 'IS456-8.2.2.1'],
    build: (q) => {
      const exp = findExposure(q);
      return (
        `Nominal cover to meet durability requirements is **20 mm for mild, 30 mm for moderate, 45 mm for severe, 50 mm for very severe and 75 mm for extreme** exposure {{IS456-26.4.2}}.` +
        (exp ? `\n\nFor **${exp}** exposure that is **${COVER[exp]} mm**.` : '') +
        `\n\nFor mild exposure the cover may be reduced by 5 mm where bars are 12 mm or smaller or the grade is M25 or above. Cover is never less than the bar diameter {{IS456-26.4.1}}. ` +
        `Exposure classes are defined by the environment of the member, for example coastal sites are at least severe {{IS456-8.2.2.1}}.`
      );
    },
    followUps: ['What is the minimum cover for a column?', 'What mix limits apply to severe exposure?'],
  },
  {
    id: 'exposure-mix',
    match: (q) => /(cement content|water cement|minimum grade|mix limit)/.test(q) || (/exposure/.test(q) && /(grade|cement|mix|ratio)/.test(q)),
    clauses: ['IS456-8.2.4.1', 'IS456-8.2.2.1'],
    build: (q) => {
      const exp = findExposure(q);
      const row = exp ? MIX[exp] : null;
      return (
        `For reinforced concrete with 20 mm aggregate, the durability table sets a minimum grade, minimum cement content and maximum free water-cement ratio for each exposure class {{IS456-8.2.4.1}}:\n\n` +
        Object.entries(MIX)
          .map(([k, v]) => `- ${k}: ${v.grade}, ${v.cement} kg/m3, w/c ${v.wc}${exp === k ? '  (your case)' : ''}`)
          .join('\n') +
        (row ? `\n\nFor **${exp}** exposure: **${row.grade}, at least ${row.cement} kg/m3 cement, w/c not above ${row.wc}**.` : '') +
        `\n\nThe exposure classes themselves are described in {{IS456-8.2.2.1}}.`
      );
    },
    followUps: ['What is the nominal cover for severe exposure?'],
  },
  {
    id: 'column-steel',
    match: (q) => /column/.test(q) && /(reinforc|steel|longitudinal|bars?|percent|minimum|maximum|limit)/.test(q) && !/(cover)/.test(q) && !/\b(ties?|lateral|transverse)\b/.test(q),
    clauses: ['IS456-26.5.3.1', 'IS456-26.5.3.2', 'IS456-25.4'],
    build: () =>
      `Longitudinal reinforcement in columns {{IS456-26.5.3.1}}:\n\n` +
      `- Area between **0.8 percent and 6 percent** of the gross cross-section (keep to about 4 percent where bars are lapped).\n` +
      `- At least **4 bars** in a rectangular column and **6** in a circular column.\n` +
      `- Bar diameter **not less than 12 mm**.\n` +
      `- Spacing along the periphery **not more than 300 mm**.\n\n` +
      `Lateral ties are covered separately {{IS456-26.5.3.2}}, and every column is designed for a minimum eccentricity {{IS456-25.4}}.`,
    followUps: ['What are the tie spacing rules for columns?', 'What is the minimum cover for a column?'],
  },
  {
    id: 'column-ties',
    match: (q) => /\b(ties?|lateral|transverse|stirrups?|links?)\b/.test(q) && /column/.test(q),
    clauses: ['IS456-26.5.3.2', 'IS456-26.5.3.1'],
    build: () =>
      `Lateral ties in columns {{IS456-26.5.3.2}}:\n\n` +
      `- Pitch not more than the **least of**: the least lateral dimension of the column, 16 times the smallest longitudinal bar diameter, and 300 mm.\n` +
      `- Tie diameter **not less than one-quarter of the largest longitudinal bar, and never under 6 mm**.\n\n` +
      `Example: a 400 x 400 column with 16 mm main bars needs ties at no more than min(400, 256, 300) = 256 mm, and at least 6 mm diameter (16 / 4 = 4 mm, so the 6 mm floor governs). ` +
      `Main bar limits are in {{IS456-26.5.3.1}}.`,
    followUps: ['What are the longitudinal reinforcement limits for columns?'],
  },
  {
    id: 'beam-steel',
    match: (q) => /beam/.test(q) && /(minimum|maximum|tension|reinforc|steel|ast)/.test(q) && !/(stirrup|shear|deflect)/.test(q),
    clauses: ['IS456-26.5.1.1', 'IS456-26.5.1.3', 'IS456-38.1'],
    build: () =>
      `Tension reinforcement in beams {{IS456-26.5.1.1}}:\n\n` +
      `- **Minimum:** As / (b d) = 0.85 / fy. For Fe 500 that is 0.17 percent of b d; for Fe 415 it is 0.20 percent.\n` +
      `- **Maximum:** 0.04 b D (4 percent of the gross section).\n\n` +
      `Where the web depth exceeds 750 mm, add side face steel of 0.1 percent of web area, split over both faces {{IS456-26.5.1.3}}. ` +
      `Flexural design also limits the neutral axis depth so the section stays under-reinforced {{IS456-38.1}}.`,
    followUps: ['What is the maximum stirrup spacing?', 'Span to depth ratio limits for deflection'],
  },
  {
    id: 'stirrups',
    match: (q) => /(stirrup|shear reinforcement|shear spacing|links?)/.test(q) && !/column/.test(q),
    clauses: ['IS456-26.5.1.5', 'IS456-26.5.1.6', 'IS456-40.2.3'],
    build: () =>
      `Shear reinforcement in beams:\n\n` +
      `- **Maximum spacing:** 0.75 d for vertical stirrups, d for inclined ones, and never more than 300 mm {{IS456-26.5.1.5}}.\n` +
      `- **Minimum quantity:** Asv / (b sv) not less than 0.4 / (0.87 fy) {{IS456-26.5.1.6}}.\n` +
      `- **Section size check:** nominal shear stress Vu / (b d) must stay below tau_c,max, for example 3.1 N/mm2 for M25 {{IS456-40.2.3}}.\n\n` +
      `Example: a beam with d = 450 mm needs stirrups at no more than min(0.75 x 450, 300) = 300 mm centres.`,
    followUps: ['What is the design shear strength of concrete?'],
  },
  {
    id: 'shear-strength',
    match: (q) => /(shear stress|tau|nominal shear|design shear strength|shear strength)/.test(q) && !/(steel|bolt|is800)/.test(q),
    clauses: ['IS456-40.2.1', 'IS456-40.2.3'],
    build: () =>
      `The design shear strength of concrete tau_c depends on grade and tension steel percentage, for example about 0.64 N/mm2 for M25 at 1.00 percent steel {{IS456-40.2.1}}. ` +
      `The nominal shear stress Vu / (b d) can never exceed tau_c,max: 2.8 N/mm2 for M20, 3.1 for M25, 3.5 for M30, 3.7 for M35 and 4.0 for M40 and above {{IS456-40.2.3}}.`,
    followUps: ['What is the maximum stirrup spacing?'],
  },
  {
    id: 'deflection-steel',
    match: (q) => /deflect/.test(q) && /(steel|is800|purlin|girt|cladding)/.test(q),
    clauses: ['IS800-5.6.1'],
    build: () =>
      `Recommended vertical deflection limits for steel members {{IS800-5.6.1}}:\n\n` +
      `- Purlins and girts with elastic cladding: span/150.\n` +
      `- Simply supported beams: span/240 (elastic cladding) or span/300 (brittle cladding).\n` +
      `- Cantilevers: span/120 (elastic cladding) or span/150 (brittle cladding).`,
    followUps: ['Slenderness limits for steel members'],
  },
  {
    id: 'deflection-concrete',
    match: (q) => /(deflect|span depth|ld ratio|serviceab)/.test(q),
    clauses: ['IS456-23.2.1'],
    build: () =>
      `Deflection is deemed satisfied when the span to effective depth ratio stays within **7 for cantilevers, 20 for simply supported and 26 for continuous** members, before the steel modification factors {{IS456-23.2.1}}. ` +
      `For spans over 10 m (other than cantilevers) multiply by 10 / span in metres.\n\nExample: a simply supported beam spanning 6 m needs an effective depth of at least 6000 / 20 = 300 mm before modification factors.`,
    followUps: ['Deflection limits for steel beams'],
  },
  {
    id: 'slenderness',
    match: (q) => /(slender|klr|kl r)/.test(q),
    clauses: ['IS800-3.8', 'IS456-25.3.1', 'IS456-25.1.2'],
    build: (q) =>
      (/(concrete|rcc|is456)/.test(q) && !/steel/.test(q)
        ? ''
        : `Maximum effective slenderness ratio KL/r for steel members {{IS800-3.8}}:\n\n` +
          `- **180** for members carrying compression from dead and imposed loads.\n` +
          `- **250** for compression members resisting only wind or seismic loads, and for tension members that can reverse stress.\n` +
          `- **350** for a tie in a roof truss.\n` +
          `- **400** for other tension members.\n\n`) +
      `For reinforced concrete columns the unsupported length may not exceed 60 times the least lateral dimension {{IS456-25.3.1}}, and a column is short when lex/D and ley/b are both below 12 {{IS456-25.1.2}}.`,
    followUps: ['Effective length factors for steel columns'],
  },
  {
    id: 'effective-length',
    match: (q) => /(effective length|k factor)/.test(q),
    clauses: ['IS800-7.2.2', 'IS800-7.1.2'],
    build: () =>
      `Effective length factors K for steel compression members {{IS800-7.2.2}}: **0.65** fixed-fixed, **0.80** fixed at one end and pinned at the other, **1.00** pinned-pinned, **2.00** cantilever. ` +
      `KL feeds the slenderness used to find the design compressive strength {{IS800-7.1.2}}.`,
    followUps: ['Slenderness limits for steel members'],
  },
  {
    id: 'section-class',
    match: (q) => /(section classification|compact|semi compact|plastic section|slender section|b tf|d tw)/.test(q),
    clauses: ['IS800-3.7.2'],
    build: () =>
      `Sections are classified using epsilon = sqrt(250 / fy) {{IS800-3.7.2}}:\n\n` +
      `- **Flange outstand b/tf:** plastic at most 8.4 epsilon, compact 9.4 epsilon, semi-compact 13.6 epsilon.\n` +
      `- **Web d/tw (neutral axis at mid-depth):** plastic at most 84 epsilon, compact 105 epsilon, semi-compact 126 epsilon.\n\n` +
      `For E250 steel epsilon = 1.0, so a rolled flange is compact up to b/tf = 9.4.`,
    followUps: ['Design bending strength of a steel beam'],
  },
  {
    id: 'bolts',
    match: (q) => /(bolt|pitch|edge distance|end distance|fastener)/.test(q) && !/(capacity|bearing|strength)/.test(q),
    clauses: ['IS800-10.2.2', 'IS800-10.2.3', 'IS800-10.2.4.2', 'IS800-10.2.4.3', 'IS800-10.2.1'],
    build: () =>
      `Bolt layout rules in IS 800:\n\n` +
      `- **Minimum pitch:** 2.5 x nominal bolt diameter {{IS800-10.2.2}}.\n` +
      `- **Maximum pitch:** 32 t or 300 mm, whichever is less (12 t or 200 mm in compression) {{IS800-10.2.3}}.\n` +
      `- **Minimum edge and end distance:** 1.7 x hole diameter for sheared or hand flame-cut edges; 1.5 x for rolled, machine flame-cut, sawn or planed edges {{IS800-10.2.4.2}}.\n` +
      `- **Maximum edge distance:** 12 t epsilon {{IS800-10.2.4.3}}.\n` +
      `- **Hole diameter:** bolt diameter plus 1.5 mm for 16 to 22 mm bolts {{IS800-10.2.1}}.\n\n` +
      `Example: M20 bolt, hole 21.5 mm, rolled edge: minimum pitch 50 mm, minimum edge distance 1.5 x 21.5 = 32.3 mm.`,
    followUps: ['Shear and bearing capacity of bolts', 'Minimum fillet weld size'],
  },
  {
    id: 'bolt-capacity',
    match: (q) => /bolt/.test(q) && /(shear capacity|bearing|capacity|strength)/.test(q),
    clauses: ['IS800-10.3.3', 'IS800-10.3.4', 'IS800-5.4.1'],
    build: () =>
      `Bearing-type bolt capacity:\n\n` +
      `- **Shear:** Vdsb = (fu / sqrt(3)) (n_n A_nb + n_s A_sb) / gamma_mb {{IS800-10.3.3}}.\n` +
      `- **Bearing:** Vdpb = 2.5 kb d t fu / gamma_mb {{IS800-10.3.4}}.\n\n` +
      `gamma_mb is 1.25 for bolts {{IS800-5.4.1}}. The capacity of the bolt is the smaller of the two.`,
    followUps: ['Bolt pitch and edge distance rules'],
  },
  {
    id: 'welds',
    match: (q) => /weld/.test(q),
    clauses: ['IS800-10.5.2.3', 'IS800-10.5.3.2', 'IS800-10.5.4.1', 'IS800-10.5.7.1'],
    build: () =>
      `Fillet weld rules in IS 800:\n\n` +
      `- **Minimum size** by thicker part: 3 mm up to 10 mm, 5 mm up to 20 mm, 6 mm up to 32 mm, 8 mm up to 50 mm {{IS800-10.5.2.3}}.\n` +
      `- **Effective throat:** 0.7 x size for 60 to 90 degree fusion faces {{IS800-10.5.3.2}}.\n` +
      `- **Minimum length:** four times the weld size {{IS800-10.5.4.1}}.\n` +
      `- **Design strength:** fu / (sqrt(3) gamma_mw), with gamma_mw 1.25 shop and 1.50 field {{IS800-10.5.7.1}}.`,
    followUps: ['Bolt pitch and edge distance rules'],
  },
  {
    id: 'steel-grades',
    match: (q) => /(is ?800|steel|structural)/.test(q) && /(yield|fy|e250|e350|e410|grade|property|properties|modulus)/.test(q) && !/(rebar|is1786|fe\d{3})/.test(q),
    clauses: ['IS800-2.2.4.2', 'IS800-2.2.4.1'],
    build: () =>
      `Structural steel yield and ultimate stress for rolled sections up to 20 mm thick {{IS800-2.2.4.2}}:\n\n` +
      `- **E250:** fy 250 N/mm2, fu 410 N/mm2\n- **E350:** fy 350 N/mm2, fu 490 N/mm2\n- **E410:** fy 410 N/mm2, fu 540 N/mm2\n\n` +
      `Design values for all grades: E = 2.0 x 10^5 N/mm2, Poisson ratio 0.3, density 7850 kg/m3 {{IS800-2.2.4.1}}.`,
    followUps: ['Section classification limits'],
  },
  {
    id: 'bending-steel',
    match: (q) => /(bending|moment capacity|md)/.test(q) && /(steel|beam|is800)/.test(q),
    clauses: ['IS800-8.2.1.2', 'IS800-8.4.1'],
    build: () =>
      `For laterally supported plastic or compact beams, Md = beta_b Zp fy / gamma_m0, capped at 1.2 Ze fy / gamma_m0 (1.5 for cantilevers) {{IS800-8.2.1.2}}. ` +
      `The shear capacity is Vd = Av fyw / (sqrt(3) gamma_m0), and moment capacity is unreduced while V stays under 0.6 Vd {{IS800-8.4.1}}.`,
    followUps: ['Section classification limits'],
  },
  {
    id: 'rebar-chemistry',
    match: (q) => /(carbon|sulphur|sulfur|phosph|chemical|weldab)/.test(q) && /(rebar|bar|is1786|fe\d{3}|tmt)/.test(q),
    clauses: ['IS1786-6.1'],
    build: () =>
      `Chemical limits for reinforcement bars {{IS1786-6.1}}, maximum percent:\n\n` +
      `- **Fe 415:** C 0.30, S 0.060, P 0.060, S+P 0.110\n- **Fe 500:** C 0.30, S 0.055, P 0.055, S+P 0.105\n- **Fe 500D:** C 0.25, S 0.040, P 0.040, S+P 0.075\n\n` +
      `The D grades are tighter, which supports their higher ductility and weldability.`,
    followUps: ['What are the tensile requirements for Fe 500D?'],
  },
  {
    id: 'rebar-tolerance',
    match: (q) => /(tolerance|mass|weight|underweight|unit weight)/.test(q) && /(rebar|bar|is1786|fe\d{3}|tmt)/.test(q),
    clauses: ['IS1786-8.2', 'IS1786-8.1'],
    build: () =>
      `Permitted variation from nominal mass {{IS1786-8.2}}:\n\n` +
      `- Up to 10 mm: 7 percent per batch, 8 percent per sample.\n- Over 10 mm up to 16 mm: 5 and 6 percent.\n- Over 16 mm: 3 and 4 percent.\n\n` +
      `Nominal mass is d^2 / 162 kg/m {{IS1786-8.1}}. Give me a bar diameter and I will compute the acceptable range.`,
    followUps: ['What is the mass per metre of a 12 mm rebar?'],
  },
  {
    id: 'rebar-grades',
    match: (q) => /(is ?1786|fe\d{3}|tmt|rebar|deformed bar|reinforcement bar|reinforcing bar)/.test(q) && /(grade|yield|tensile|elongation|strength|propert|proof|uts|cover|covered|ductile|seismic)/.test(q),
    clauses: ['IS1786-7.1', 'IS1786-1'],
    build: () =>
      `IS 1786 covers grades **Fe 415, 415D, 500, 500D, 550, 550D and 600** {{IS1786-1}}. Minimum tensile properties {{IS1786-7.1}}:\n\n` +
      `- **Fe 415:** yield 415, UTS 485, elongation 14.5 percent\n` +
      `- **Fe 415D:** yield 415, UTS 500, elongation 18.0 percent\n` +
      `- **Fe 500:** yield 500, UTS 545, elongation 12.0 percent\n` +
      `- **Fe 500D:** yield 500, UTS 565, elongation 16.0 percent\n` +
      `- **Fe 550:** yield 550, UTS 585, elongation 10.0 percent\n` +
      `- **Fe 550D:** yield 550, UTS 600, elongation 14.5 percent\n` +
      `- **Fe 600:** yield 600, UTS 660, elongation 10.0 percent\n\n` +
      `Stresses in N/mm2. In every grade UTS must be at least 10 percent above the actual yield. The D grades are the ductile options for seismic zones.`,
    followUps: ['Chemical composition limits for Fe 500D', 'What is the mass per metre of a 12 mm rebar?'],
  },
  {
    id: 'toy-small-parts',
    match: (q) => /(small part|choking|choke|cylinder|under (3|three) y|36 month|toddler)/.test(q),
    clauses: ['IS9873-1-5.2', 'IS9873-1-7'],
    build: () =>
      `Toys for children **under 36 months**, and any part that can detach from them, must **not fit entirely inside the small parts cylinder**: internal diameter **31.7 mm**, depth sloping from 25.4 mm to 57.1 mm {{IS9873-1-5.2}}.\n\n` +
      `A toy that is not suitable for that age group but contains small parts must carry a warning with the specific hazard {{IS9873-1-7}}.`,
    followUps: ['Cord length limits on toys', 'Heavy metal migration limits for toys'],
  },
  {
    id: 'toy-cords',
    match: (q) => /(cord|string|strangul|chain|elastic)/.test(q) && /(toy|child|cot|pram|18 month)/.test(q),
    clauses: ['IS9873-1-5.3'],
    build: () =>
      `On toys for children **under 18 months**, a free cord, chain or elastic must not exceed **220 mm** unloaded {{IS9873-1-5.3}}. Longer lengths and loops are a strangulation hazard.`,
    followUps: ['Small parts cylinder requirement for toys'],
  },
  {
    id: 'toy-metals',
    match: (q) => /(lead|cadmium|chromium|mercury|arsenic|antimony|barium|selenium|heavy metal|migration|toxic)/.test(q) && /(toy|child|paint|plastic|migration|heavy)/.test(q),
    clauses: ['IS9873-3-4', 'IS9873-3-5'],
    build: () =>
      `Migration limits for dry, brittle or pliable toy material, in mg/kg {{IS9873-3-4}}:\n\n` +
      `- Antimony 60, arsenic 25, barium 1000, cadmium 75\n- Chromium 60, **lead 90**, mercury 60, selenium 500\n\n` +
      `Liquid or sticky material is limited to one quarter of these values. The limits apply to accessible coatings, plastics, textiles and paper, reported per material or colour {{IS9873-3-5}}.`,
    followUps: ['Small parts cylinder requirement for toys'],
  },
  {
    id: 'toy-general',
    match: (q) => /\btoys?\b/.test(q) || /is ?9873/.test(q),
    clauses: ['IS9873-1-1', 'IS9873-1-5.2', 'IS9873-1-5.3', 'IS9873-1-4.5', 'IS9873-3-4'],
    build: () =>
      `IS 9873 covers toy safety for children under 14 {{IS9873-1-1}}. The main mechanical checks are:\n\n` +
      `- **Small parts** for under 36 months, using the 31.7 mm cylinder {{IS9873-1-5.2}}.\n` +
      `- **Cords** no longer than 220 mm on toys for under 18 months {{IS9873-1-5.3}}.\n` +
      `- **Edges and points** must not be hazardous {{IS9873-1-4.5}}.\n` +
      `- **Chemical safety** under Part 3, for example lead at most 90 mg/kg {{IS9873-3-4}}.\n\n` +
      `You can run these checks on a real toy in the Compliance Checker tab.`,
    followUps: ['Small parts cylinder requirement for toys', 'Heavy metal migration limits for toys'],
  },
  {
    id: 'safety-factors',
    match: (q) => /(partial safety|load factor|safety factor|gamma|factored load)/.test(q),
    clauses: ['IS456-36.4.1', 'IS456-36.4.2', 'IS800-5.3.3', 'IS800-5.4.1'],
    build: () =>
      `**Loads.** Both codes use 1.5 on dead and imposed load, 1.5 on dead plus wind or earthquake (0.9 dead load where it stabilises) and 1.2 when all three act together {{IS456-36.4.1}} {{IS800-5.3.3}}.\n\n` +
      `**Materials.** IS 456 uses 1.5 for concrete and 1.15 for steel {{IS456-36.4.2}}. IS 800 uses gamma_m0 = 1.10 for yielding and buckling, gamma_m1 = 1.25 for ultimate stress, and 1.25 or 1.50 for shop or field welds {{IS800-5.4.1}}.`,
    followUps: ['Design bending strength of a steel beam'],
  },
  {
    id: 'cube-acceptance',
    match: (q) => /(cube|acceptance|sampling|compressive strength test|compliance of concrete)/.test(q),
    clauses: ['IS456-15.2.2', 'IS456-16.1', 'IS456-9.2.4.2'],
    build: () =>
      `**Sampling** {{IS456-15.2.2}}: 1 sample for 1 to 5 m3, 2 for 6 to 15 m3, 3 for 16 to 30 m3, 4 for 31 to 50 m3, then one more per additional 50 m3.\n\n` +
      `**Acceptance** {{IS456-16.1}}: the mean of four consecutive results must reach fck + 0.825 x standard deviation (at least fck + 4 N/mm2 for M20 and above), and no single result may fall below fck - 3 N/mm2.\n\n` +
      `Where no site data exists, assume a standard deviation of 4.0 N/mm2 for M20 and M25, and 5.0 N/mm2 for M30 and above {{IS456-9.2.4.2}}.`,
    followUps: ['What mix limits apply to severe exposure?'],
  },
  {
    id: 'neutral-axis',
    match: (q) => /(neutral axis|xu ?max|under reinforced|limiting depth)/.test(q),
    clauses: ['IS456-38.1'],
    build: () =>
      `The limiting neutral axis ratio xu,max / d is **0.53 for Fe 250, 0.48 for Fe 415 and 0.46 for Fe 500**, with a maximum concrete strain of 0.0035 {{IS456-38.1}}. Staying below it keeps the beam under-reinforced so steel yields before the concrete crushes.`,
    followUps: ['Minimum and maximum tension steel in beams'],
  },
  {
    id: 'development-length-info',
    match: (q) => /(development length|anchorage|bond stress|\blap\b|splice|overlap)/.test(q),
    clauses: ['IS456-26.2.1', 'IS456-26.2.5.1'],
    build: () =>
      `Development length is Ld = phi x sigma_s / (4 tau_bd) {{IS456-26.2.1}}. tau_bd is 1.2, 1.4, 1.5, 1.7 and 1.9 N/mm2 for M20, M25, M30, M35 and M40+ plain bars, raised 60 percent for deformed bars.\n\n` +
      `Tension laps are at least Ld or 30 phi, whichever is greater {{IS456-26.2.5.1}}.\n\n` +
      `Give me a bar diameter, steel grade and concrete grade, for example "development length of 20 mm Fe 500 in M30", and I will work out the number.`,
    followUps: ['Development length for a 16 mm Fe 500 bar in M25 concrete'],
  },
  {
    id: 'slab-rules',
    match: (q) => /slab/.test(q) && /(reinforc|steel|spacing|minimum|bar|distribution)/.test(q),
    clauses: ['IS456-26.5.2.1', 'IS456-26.3.3'],
    build: () =>
      `Slab reinforcement:\n\n` +
      `- **Minimum steel:** 0.15 percent of gross area for Fe 250, 0.12 percent for Fe 415 and Fe 500; bar diameter not above one-eighth of slab thickness {{IS456-26.5.2.1}}.\n` +
      `- **Maximum spacing:** main bars 3d or 300 mm, distribution bars 5d or 450 mm, whichever is smaller {{IS456-26.3.3}}.\n\n` +
      `Example: a 150 mm slab with Fe 500 needs at least 0.0012 x 1000 x 150 = 180 mm2 per metre in each direction.`,
    followUps: ['What mix limits apply to severe exposure?'],
  },
  {
    id: 'concrete-properties',
    match: (q) => /(grade of concrete|concrete grade|\bm\d{2}\b.*mean|what does m\d{2}|fck|characteristic)/.test(q),
    clauses: ['IS456-6.1', 'IS456-6.2.3.1', 'IS456-6.2.2'],
    build: () =>
      `Concrete grades are named by characteristic cube strength at 28 days, so M25 means 25 N/mm2 on a 150 mm cube {{IS456-6.1}}. ` +
      `Derived properties: Ec = 5000 sqrt(fck) {{IS456-6.2.3.1}} and flexural strength fcr = 0.7 sqrt(fck) {{IS456-6.2.2}}.`,
    followUps: ['What is the modulus of elasticity of M30 concrete?'],
  },
];
