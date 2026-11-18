/**
 * IS 456:2000 clause excerpts (condensed reference text).
 * `page` is the indicative page of the printed code.
 */

const base = { standard: 'IS 456', edition: '2000' };

export const IS456 = [
  {
    ...base, id: 'IS456-6.1', clause: '6.1', page: 14, topic: 'materials',
    heading: 'Grades of concrete',
    text:
      'Concrete is designated by grade, for example M25. The letter M denotes the mix and the number is the specified characteristic compressive strength, in N/mm2, of a 150 mm cube at 28 days. Table 2 groups the grades as ordinary concrete (M10, M15, M20), standard concrete (M25 to M55) and high strength concrete (M60 to M80).',
    keywords: ['grade', 'm20', 'm25', 'm30', 'characteristic strength', 'cube', 'fck'],
  },
  {
    ...base, id: 'IS456-6.2.2', clause: '6.2.2', page: 14, topic: 'materials',
    heading: 'Flexural strength of concrete',
    text:
      'Unless tests are carried out, the flexural strength (modulus of rupture) of concrete is taken as fcr = 0.7 sqrt(fck) N/mm2, where fck is the characteristic cube compressive strength in N/mm2.',
    keywords: ['flexural strength', 'modulus of rupture', 'fcr', 'cracking'],
  },
  {
    ...base, id: 'IS456-6.2.3.1', clause: '6.2.3.1', page: 14, topic: 'materials',
    heading: 'Modulus of elasticity of concrete',
    text:
      'The short term static modulus of elasticity of concrete is taken as Ec = 5000 sqrt(fck) N/mm2, where fck is the characteristic cube compressive strength in N/mm2. Actual values may differ by up to plus or minus 20 percent.',
    keywords: ['modulus of elasticity', 'young', 'ec', 'stiffness', 'fck'],
  },
  {
    ...base, id: 'IS456-8.2.2.1', clause: '8.2.2.1', page: 18, topic: 'durability',
    heading: 'Environmental exposure conditions (Table 3)',
    text:
      'Exposure is classified as mild (protected from weather and aggressive conditions, except coastal), moderate (sheltered from severe rain, condensation, continuously under water, or in contact with non-aggressive soil), severe (severe rain, alternate wetting and drying, coastal environment), very severe (sea water spray, corrosive fumes, aggressive sub-soil) and extreme (tidal zone, direct contact with aggressive liquids or solids).',
    keywords: ['exposure', 'mild', 'moderate', 'severe', 'very severe', 'extreme', 'coastal', 'marine', 'environment'],
  },
  {
    ...base, id: 'IS456-8.2.4.1', clause: '8.2.4.1', page: 20, topic: 'durability',
    heading: 'Minimum grade, cement content and water-cement ratio (Table 5)',
    text:
      'For reinforced concrete with 20 mm nominal maximum aggregate: mild exposure needs M20, minimum cement 300 kg/m3 and maximum free water-cement ratio 0.55; moderate needs M25, 300 kg/m3, 0.50; severe needs M30, 320 kg/m3, 0.45; very severe needs M35, 340 kg/m3, 0.45; extreme needs M40, 360 kg/m3, 0.40.',
    keywords: ['minimum grade', 'cement content', 'water cement ratio', 'w/c', 'exposure', 'durability', 'mix'],
  },
  {
    ...base, id: 'IS456-9.2.4.2', clause: '9.2.4.2', page: 21, topic: 'quality',
    heading: 'Assumed standard deviation (Table 8)',
    text:
      'Where no test data exist, the assumed standard deviation for mix design is 3.5 N/mm2 for M10 and M15, 4.0 N/mm2 for M20 and M25, and 5.0 N/mm2 for M30 to M50.',
    keywords: ['standard deviation', 'mix design', 'target strength', 'sigma'],
  },
  {
    ...base, id: 'IS456-15.2.2', clause: '15.2.2', page: 30, topic: 'quality',
    heading: 'Frequency of sampling',
    text:
      'Samples are taken from each concrete batch at the following minimum frequency: 1 sample for 1 to 5 m3, 2 samples for 6 to 15 m3, 3 samples for 16 to 30 m3, 4 samples for 31 to 50 m3, and 4 plus one additional sample for each additional 50 m3 or part thereof for quantities of 51 m3 and above. Each sample yields three test specimens.',
    keywords: ['sampling', 'frequency', 'cube', 'test specimens', 'quality control', 'batch'],
  },
  {
    ...base, id: 'IS456-16.1', clause: '16.1', page: 31, topic: 'quality',
    heading: 'Acceptance criteria for compressive strength',
    text:
      'Concrete complies when the mean of a group of four non-overlapping consecutive test results is not less than fck + 0.825 x the established standard deviation (rounded to the nearest 0.5 N/mm2), or fck + 3 N/mm2 for M15 and fck + 4 N/mm2 for M20 and above, whichever is greater, and each individual test result is not less than fck - 3 N/mm2.',
    keywords: ['acceptance', 'cube test', 'compressive strength', 'compliance', 'rejected', 'fck', 'quality'],
  },
  {
    ...base, id: 'IS456-23.2.1', clause: '23.2.1', page: 37, topic: 'serviceability',
    heading: 'Deflection: basic span to effective depth ratios',
    text:
      'Vertical deflection limits may be assumed satisfied when the span to effective depth ratio does not exceed 7 for cantilevers, 20 for simply supported members and 26 for continuous members, modified by the tension and compression steel factors. For spans above 10 m the values are multiplied by 10 / span in metres, except for cantilevers.',
    keywords: ['deflection', 'span depth ratio', 'l/d', 'cantilever', 'simply supported', 'continuous', 'serviceability'],
  },
  {
    ...base, id: 'IS456-25.1.2', clause: '25.1.2', page: 41, topic: 'column',
    heading: 'Short and slender compression members',
    text:
      'A compression member is short when both the slenderness ratios lex/D and ley/b are less than 12. Otherwise it is slender and must be designed for additional moments.',
    keywords: ['short column', 'slender column', 'slenderness', 'effective length', 'additional moment'],
  },
  {
    ...base, id: 'IS456-25.3.1', clause: '25.3.1', page: 41, topic: 'column',
    heading: 'Slenderness limits for columns',
    text:
      'The unsupported length between end restraints shall not exceed 60 times the least lateral dimension of the column.',
    keywords: ['slenderness', 'unsupported length', 'least lateral dimension', 'column', '60'],
  },
  {
    ...base, id: 'IS456-25.4', clause: '25.4', page: 42, topic: 'column',
    heading: 'Minimum eccentricity',
    text:
      'All columns shall be designed for a minimum eccentricity of unsupported length / 500 + lateral dimension / 30, subject to a minimum of 20 mm.',
    keywords: ['eccentricity', 'minimum eccentricity', 'column', 'emin', 'axial load'],
  },
  {
    ...base, id: 'IS456-26.2.1', clause: '26.2.1', page: 43, topic: 'detailing',
    heading: 'Development length of bars (design bond stress)',
    text:
      'The development length is Ld = (phi x sigma_s) / (4 x tau_bd), where phi is the bar diameter, sigma_s is the stress in the bar at the design load (0.87 fy at the section considered) and tau_bd is the design bond stress. For plain bars in tension tau_bd is 1.2, 1.4, 1.5, 1.7 and 1.9 N/mm2 for M20, M25, M30, M35 and M40 and above. For deformed bars these values are increased by 60 percent, and for bars in compression by a further 25 percent.',
    keywords: ['development length', 'bond stress', 'anchorage', 'ld', 'deformed bar', 'tau bd', 'rebar'],
  },
  {
    ...base, id: 'IS456-26.2.5.1', clause: '26.2.5.1', page: 45, topic: 'detailing',
    heading: 'Lap splices',
    text:
      'Lap length in flexural tension is not less than Ld or 30 phi, whichever is greater; in direct tension not less than 2 Ld or 30 phi; and in compression not less than the compression development length or 24 phi. Lap splices are not recommended for bars larger than 36 mm, which should be welded.',
    keywords: ['lap', 'lap length', 'splice', 'overlap', 'joint', 'rebar', 'development length'],
  },
  {
    ...base, id: 'IS456-26.3.2', clause: '26.3.2', page: 46, topic: 'detailing',
    heading: 'Minimum spacing of bars',
    text:
      'The horizontal distance between two parallel main bars is not less than the greatest of: the bar diameter (if equal), the larger bar diameter (if unequal), or 5 mm more than the nominal maximum size of coarse aggregate.',
    keywords: ['spacing', 'clear distance', 'minimum spacing', 'bar spacing', 'aggregate size'],
  },
  {
    ...base, id: 'IS456-26.3.3', clause: '26.3.3', page: 46, topic: 'detailing',
    heading: 'Maximum spacing of bars in slabs',
    text:
      'In slabs, the horizontal distance between parallel main reinforcement bars shall not exceed 3 times the effective depth or 300 mm, whichever is smaller. For distribution (secondary) reinforcement the limit is 5 times the effective depth or 450 mm, whichever is smaller.',
    keywords: ['slab', 'spacing', 'main bars', 'distribution steel', 'maximum spacing', '300 mm', '450 mm'],
  },
  {
    ...base, id: 'IS456-26.4.1', clause: '26.4.1', page: 46, topic: 'cover',
    heading: 'Nominal cover: general',
    text:
      'Nominal cover is the design depth of concrete cover to all steel reinforcement, including links. It is the dimension shown on drawings and shall be not less than the diameter of the bar.',
    keywords: ['nominal cover', 'cover', 'clear cover', 'links', 'stirrups'],
  },
  {
    ...base, id: 'IS456-26.4.2', clause: '26.4.2', page: 47, topic: 'cover',
    heading: 'Nominal cover to meet durability requirements (Table 16)',
    text:
      'Nominal concrete cover to reinforcement: 20 mm for mild exposure, 30 mm for moderate, 45 mm for severe, 50 mm for very severe and 75 mm for extreme. For mild exposure the cover may be reduced by 5 mm where the main bars do not exceed 12 mm diameter or where the concrete grade is M25 or above.',
    keywords: ['cover', 'nominal cover', 'durability', 'exposure', 'mild', 'moderate', 'severe', 'very severe', 'extreme', 'table 16'],
  },
  {
    ...base, id: 'IS456-26.4.2.1', clause: '26.4.2.1', page: 47, topic: 'cover',
    heading: 'Nominal cover for columns',
    text:
      'For longitudinal reinforcing bars in a column, nominal cover shall in any case not be less than 40 mm, or less than the diameter of such bar. For columns of minimum dimension of 200 mm or under, whose bars do not exceed 12 mm, a nominal cover of 25 mm may be used.',
    keywords: ['column cover', 'cover', 'column', '40 mm', '25 mm', 'longitudinal bars'],
  },
  {
    ...base, id: 'IS456-26.4.2.2', clause: '26.4.2.2', page: 47, topic: 'cover',
    heading: 'Nominal cover for footings',
    text: 'For footings, minimum cover shall be 50 mm.',
    keywords: ['footing', 'foundation', 'cover', '50 mm'],
  },
  {
    ...base, id: 'IS456-26.5.1.1', clause: '26.5.1.1', page: 47, topic: 'beam',
    heading: 'Tension reinforcement in beams',
    text:
      'The minimum area of tension reinforcement is As/(b d) = 0.85 / fy, where b is the breadth of the beam, d the effective depth and fy the characteristic strength of reinforcement in N/mm2. The maximum area of tension reinforcement shall not exceed 0.04 b D.',
    keywords: ['beam', 'minimum steel', 'tension reinforcement', 'maximum steel', '0.85', '4 percent', 'ast', 'as min'],
  },
  {
    ...base, id: 'IS456-26.5.1.3', clause: '26.5.1.3', page: 48, topic: 'beam',
    heading: 'Side face reinforcement in deep beams',
    text:
      'Where the depth of the web in a beam exceeds 750 mm, side face reinforcement totalling not less than 0.1 percent of the web area shall be provided, distributed equally on the two faces at a spacing not exceeding 300 mm or the web thickness, whichever is less.',
    keywords: ['side face', 'deep beam', '750 mm', 'web', 'skin reinforcement'],
  },
  {
    ...base, id: 'IS456-26.5.1.5', clause: '26.5.1.5', page: 48, topic: 'beam',
    heading: 'Maximum spacing of shear reinforcement',
    text:
      'The maximum spacing of shear reinforcement measured along the axis of the member shall not exceed 0.75 d for vertical stirrups and d for inclined stirrups at 45 degrees, where d is the effective depth, subject to an absolute limit of 300 mm.',
    keywords: ['stirrup', 'shear reinforcement', 'spacing', 'links', '0.75d', '300 mm', 'shear'],
  },
  {
    ...base, id: 'IS456-26.5.1.6', clause: '26.5.1.6', page: 48, topic: 'beam',
    heading: 'Minimum shear reinforcement',
    text:
      'Where the factored shear force is less than half the shear strength of the concrete, minimum shear reinforcement shall nevertheless be provided so that Asv / (b sv) is not less than 0.4 / (0.87 fy), where Asv is the total cross-sectional area of stirrup legs, sv the stirrup spacing and fy the characteristic strength of stirrup steel (not exceeding 415 N/mm2).',
    keywords: ['minimum shear reinforcement', 'stirrup', 'asv', 'shear', 'links', '0.4'],
  },
  {
    ...base, id: 'IS456-26.5.2.1', clause: '26.5.2.1', page: 48, topic: 'slab',
    heading: 'Minimum reinforcement in slabs',
    text:
      'The reinforcement in either direction in slabs shall not be less than 0.15 percent of the total cross-sectional area for Fe 250 and 0.12 percent for Fe 415 and Fe 500 high strength deformed bars or welded wire fabric. The diameter of bars shall not exceed one-eighth of the total thickness of the slab.',
    keywords: ['slab', 'minimum reinforcement', '0.12', '0.15', 'shrinkage', 'temperature', 'bar diameter'],
  },
  {
    ...base, id: 'IS456-26.5.3.1', clause: '26.5.3.1', page: 49, topic: 'column',
    heading: 'Longitudinal reinforcement in columns',
    text:
      '(a) The area of longitudinal reinforcement shall be not less than 0.8 percent and not more than 6 percent of the gross cross-sectional area of the column; where bars from the lower column are lapped, the percentage should usually not exceed 4. (b) The minimum number of longitudinal bars is four in rectangular columns and six in circular columns. (c) Bars shall not be less than 12 mm in diameter. (d) The spacing of bars measured along the periphery shall not exceed 300 mm.',
    keywords: ['column', 'longitudinal reinforcement', '0.8 percent', '6 percent', 'minimum bars', '12 mm', 'steel ratio', 'ast'],
  },
  {
    ...base, id: 'IS456-26.5.3.2', clause: '26.5.3.2', page: 49, topic: 'column',
    heading: 'Transverse reinforcement (ties) in columns',
    text:
      'The pitch of lateral ties shall not exceed the least of: the least lateral dimension of the column, 16 times the smallest diameter of longitudinal reinforcement bar, and 300 mm. The diameter of a tie shall be not less than one-quarter of the largest longitudinal bar and in no case less than 6 mm.',
    keywords: ['ties', 'lateral ties', 'transverse reinforcement', 'stirrups', 'column', 'pitch', '16 times', '6 mm', 'links'],
  },
  {
    ...base, id: 'IS456-36.4.1', clause: '36.4.1', page: 67, topic: 'design',
    heading: 'Partial safety factors for loads (Table 18)',
    text:
      'For limit state of collapse the design load is taken as 1.5 (DL + IL), 1.5 (DL + WL) or 0.9 DL + 1.5 WL where stability is critical, and 1.2 (DL + IL + WL). Wind and seismic loads are not considered to act together.',
    keywords: ['load factor', 'partial safety factor', 'dead load', 'live load', 'wind', 'factored load', '1.5', 'limit state'],
  },
  {
    ...base, id: 'IS456-36.4.2', clause: '36.4.2', page: 68, topic: 'design',
    heading: 'Partial safety factors for materials',
    text:
      'When assessing the strength of a structure, the partial safety factor gamma_m is 1.5 for concrete and 1.15 for steel.',
    keywords: ['partial safety factor', 'material factor', 'gamma m', '1.15', '1.5', 'concrete', 'steel', 'design strength'],
  },
  {
    ...base, id: 'IS456-38.1', clause: '38.1', page: 70, topic: 'design',
    heading: 'Flexure: limiting depth of neutral axis',
    text:
      'Maximum strain in concrete at the outermost compression fibre is 0.0035 in bending. The limiting ratio xu,max / d is 0.53 for Fe 250, 0.48 for Fe 415 and 0.46 for Fe 500 reinforcement, so that the section remains under-reinforced and fails in a ductile manner.',
    keywords: ['neutral axis', 'xu max', 'limiting depth', 'under reinforced', 'flexure', '0.48', '0.46', 'fe 415', 'fe 500', 'strain'],
  },
  {
    ...base, id: 'IS456-40.2.1', clause: '40.2.1', page: 72, topic: 'shear',
    heading: 'Design shear strength of concrete (Table 19)',
    text:
      'The design shear strength tau_c depends on the grade of concrete and the percentage of tension steel 100 As / (b d). For example, for M25 concrete tau_c is about 0.49 N/mm2 at 0.50 percent steel, 0.64 N/mm2 at 1.00 percent and 0.74 N/mm2 at 1.50 percent.',
    keywords: ['design shear strength', 'tau c', 'shear', 'table 19', 'percentage steel', 'concrete shear'],
  },
  {
    ...base, id: 'IS456-40.2.3', clause: '40.2.3', page: 72, topic: 'shear',
    heading: 'Maximum shear stress (Table 20)',
    text:
      'The nominal shear stress tau_v = Vu / (b d) in beams shall not exceed tau_c,max: 2.5 N/mm2 for M15, 2.8 for M20, 3.1 for M25, 3.5 for M30, 3.7 for M35 and 4.0 N/mm2 for M40 and above. Where it does, the section must be revised.',
    keywords: ['shear stress', 'tau c max', 'nominal shear', 'maximum shear', 'section size', 'table 20'],
  },
];
