/**
 * IS 800:2007 clause excerpts (condensed reference text).
 */

const base = { standard: 'IS 800', edition: '2007' };

export const IS800 = [
  {
    ...base, id: 'IS800-2.2.4.1', clause: '2.2.4.1', page: 16, topic: 'materials',
    heading: 'Physical properties of structural steel',
    text:
      'For the purpose of design, the following values are taken: density 7850 kg/m3, modulus of elasticity E = 2.0 x 10^5 N/mm2, Poisson ratio 0.3, modulus of rigidity G = 0.769 x 10^5 N/mm2 and coefficient of thermal expansion 12 x 10^-6 per degree Celsius.',
    keywords: ['modulus of elasticity', 'density', 'poisson', 'thermal expansion', 'properties', 'e'],
  },
  {
    ...base, id: 'IS800-2.2.4.2', clause: '2.2.4.2', page: 16, topic: 'materials',
    heading: 'Yield and ultimate stress of structural steel (Table 1)',
    text:
      'For rolled sections up to 20 mm thick: grade E250 has yield stress fy = 250 N/mm2 and ultimate tensile stress fu = 410 N/mm2; grade E350 has fy = 350 and fu = 490 N/mm2; grade E410 has fy = 410 and fu = 540 N/mm2. Yield stress reduces for thicker products.',
    keywords: ['yield stress', 'fy', 'fu', 'e250', 'e350', 'e410', 'grade', 'steel grade', 'is 2062'],
  },
  {
    ...base, id: 'IS800-3.7.2', clause: '3.7.2', page: 18, topic: 'classification',
    heading: 'Section classification (Table 2)',
    text:
      'With epsilon = sqrt(250 / fy), the outstand of a rolled I-section flange is plastic when b/tf is at most 8.4 epsilon, compact up to 9.4 epsilon and semi-compact up to 13.6 epsilon. For the web of an I-section with the neutral axis at mid-depth, d/tw is at most 84 epsilon for plastic, 105 epsilon for compact and 126 epsilon for semi-compact. Sections exceeding these limits are slender.',
    keywords: ['section classification', 'plastic', 'compact', 'semi-compact', 'slender', 'b/tf', 'd/tw', 'epsilon', 'flange', 'web'],
  },
  {
    ...base, id: 'IS800-3.8', clause: '3.8', page: 20, topic: 'slenderness',
    heading: 'Maximum effective slenderness ratio (Table 3)',
    text:
      'The effective slenderness ratio KL/r shall not exceed: 180 for a member carrying compressive loads from dead and imposed loads; 250 for a compression member that resists only wind or seismic loads; 350 for a member normally acting as a tie in a roof truss; and 400 for other tension members. A tension member that may reverse stress under wind or earthquake is limited to 250.',
    keywords: ['slenderness', 'kl/r', 'compression member', 'tension member', '180', '250', '350', '400', 'strut', 'tie'],
  },
  {
    ...base, id: 'IS800-5.3.3', clause: '5.3.3', page: 29, topic: 'design',
    heading: 'Partial safety factors for loads (Table 4)',
    text:
      'For the limit state of strength, principal combinations use a factor of 1.5 on dead and imposed loads, 1.5 on wind or earthquake with dead load (0.9 on dead load where it is stabilising), and 1.2 when dead, imposed and wind or earthquake loads act together.',
    keywords: ['load factor', 'partial safety factor', 'dead load', 'imposed load', 'wind', 'earthquake', 'combination', '1.5', '1.2'],
  },
  {
    ...base, id: 'IS800-5.4.1', clause: '5.4.1', page: 30, topic: 'design',
    heading: 'Partial safety factors for materials (Table 5)',
    text:
      'Resistance governed by yielding or buckling uses gamma_m0 = 1.10. Resistance governed by ultimate stress uses gamma_m1 = 1.25. Bolts in bearing-type connections use 1.25, and welds use gamma_mw = 1.25 for shop welding and 1.50 for field welding.',
    keywords: ['gamma m0', 'gamma m1', 'material factor', '1.10', '1.25', '1.50', 'weld', 'bolt', 'partial safety'],
  },
  {
    ...base, id: 'IS800-5.6.1', clause: '5.6.1', page: 31, topic: 'serviceability',
    heading: 'Deflection limits (Table 6)',
    text:
      'Recommended vertical deflection limits under imposed load: purlins and girts supporting elastic cladding span/150; simply supported beams span/240 with elastic cladding or span/300 with brittle cladding; cantilevers span/120 with elastic cladding or span/150 with brittle cladding.',
    keywords: ['deflection', 'serviceability', 'purlin', 'girt', 'simply supported', 'cantilever', 'span/240', 'span/300', 'span/150', 'limit'],
  },
  {
    ...base, id: 'IS800-6.2', clause: '6.2', page: 32, topic: 'tension',
    heading: 'Design strength due to yielding of gross section',
    text:
      'The design strength of a tension member governed by yielding of the gross section is Tdg = Ag fy / gamma_m0, where Ag is the gross area, fy the yield stress and gamma_m0 equals 1.10.',
    keywords: ['tension', 'yielding', 'gross section', 'tdg', 'design strength'],
  },
  {
    ...base, id: 'IS800-6.3', clause: '6.3', page: 32, topic: 'tension',
    heading: 'Design strength due to rupture of critical section',
    text:
      'For plates, the design strength governed by rupture of the net section is Tdn = 0.9 An fu / gamma_m1, where An is the net area after deducting holes, fu the ultimate stress and gamma_m1 equals 1.25.',
    keywords: ['tension', 'rupture', 'net section', 'tdn', 'net area', 'fu', 'bolt holes'],
  },
  {
    ...base, id: 'IS800-7.1.2', clause: '7.1.2', page: 34, topic: 'compression',
    heading: 'Design compressive strength of members',
    text:
      'The design compressive strength is Pd = Ae fcd, where Ae is the effective sectional area and fcd = (fy / gamma_m0) / (phi + sqrt(phi^2 - lambda^2)), not exceeding fy / gamma_m0. Here phi = 0.5 [1 + alpha (lambda - 0.2) + lambda^2], lambda is the non-dimensional slenderness and alpha is the imperfection factor: 0.21, 0.34, 0.49 and 0.76 for buckling classes a, b, c and d.',
    keywords: ['compression', 'buckling', 'column', 'pd', 'fcd', 'imperfection factor', 'buckling class', 'strut', 'design strength'],
  },
  {
    ...base, id: 'IS800-7.2.2', clause: '7.2.2', page: 36, topic: 'compression',
    heading: 'Effective length factors (Table 11)',
    text:
      'Recommended effective length factors K for prismatic compression members: 0.65 when held in position and restrained against rotation at both ends; 0.80 when held in position at both ends and restrained against rotation at one end; 1.00 when held in position at both ends but free to rotate; and 2.00 for a cantilever fixed at one end and free at the other.',
    keywords: ['effective length', 'k factor', 'kl', 'fixed', 'pinned', 'cantilever', '0.65', '0.80', '1.0', '2.0', 'end conditions'],
  },
  {
    ...base, id: 'IS800-8.2.1.2', clause: '8.2.1.2', page: 53, topic: 'bending',
    heading: 'Design bending strength of laterally supported beams',
    text:
      'For plastic and compact sections the design bending strength is Md = beta_b Zp fy / gamma_m0, limited to 1.2 Ze fy / gamma_m0 for simply supported beams and 1.5 Ze fy / gamma_m0 for cantilevers. Under low shear (V not exceeding 0.6 Vd) the moment capacity is not reduced for shear.',
    keywords: ['bending', 'moment capacity', 'md', 'plastic modulus', 'zp', 'ze', 'laterally supported', 'beam', 'low shear', '1.2'],
  },
  {
    ...base, id: 'IS800-8.4.1', clause: '8.4.1', page: 56, topic: 'bending',
    heading: 'Design shear strength',
    text:
      'The design shear strength is Vd = Vn / gamma_m0 with Vn = Av fyw / sqrt(3), where Av is the shear area and fyw the yield stress of the web. Shear buckling of unstiffened webs should be checked when d/tw exceeds 67 epsilon.',
    keywords: ['shear', 'vd', 'vn', 'shear area', 'web', 'shear buckling', 'beam'],
  },
  {
    ...base, id: 'IS800-10.2.1', clause: '10.2.1', page: 72, topic: 'bolts',
    heading: 'Bolt hole size (Table 19)',
    text:
      'The nominal hole diameter exceeds the bolt diameter by 1.0 mm for 12 to 14 mm bolts, 1.5 mm for 16 to 22 mm bolts, 2.0 mm for 24 mm bolts and 3.0 mm for bolts larger than 24 mm.',
    keywords: ['hole diameter', 'clearance', 'bolt hole', 'd0', 'bolt', 'oversize'],
  },
  {
    ...base, id: 'IS800-10.2.2', clause: '10.2.2', page: 72, topic: 'bolts',
    heading: 'Minimum pitch of bolts',
    text: 'The distance between centres of fasteners (pitch) shall not be less than 2.5 times the nominal diameter of the fastener.',
    keywords: ['pitch', 'bolt spacing', 'minimum pitch', '2.5', 'bolt', 'fastener', 'spacing'],
  },
  {
    ...base, id: 'IS800-10.2.3', clause: '10.2.3', page: 72, topic: 'bolts',
    heading: 'Maximum pitch of bolts',
    text:
      'The distance between centres of adjacent fasteners shall not exceed 32 t or 300 mm, whichever is less, where t is the thickness of the thinner outer plate. In compression members the limit is 12 t or 200 mm, whichever is less, in the direction of stress.',
    keywords: ['pitch', 'maximum pitch', 'bolt spacing', '32t', '300 mm', '12t', '200 mm', 'bolt'],
  },
  {
    ...base, id: 'IS800-10.2.4.2', clause: '10.2.4.2', page: 73, topic: 'bolts',
    heading: 'Minimum edge and end distance',
    text:
      'The minimum edge distance and end distance from the centre of a hole to the edge is 1.7 times the hole diameter for sheared or hand flame-cut edges, and 1.5 times the hole diameter for rolled, machine flame-cut, sawn or planed edges.',
    keywords: ['edge distance', 'end distance', 'bolt', '1.7', '1.5', 'hole diameter', 'sheared', 'flame cut'],
  },
  {
    ...base, id: 'IS800-10.2.4.3', clause: '10.2.4.3', page: 73, topic: 'bolts',
    heading: 'Maximum edge distance',
    text: 'The maximum edge distance shall not exceed 12 t epsilon, where t is the thickness of the thinner outer plate and epsilon = sqrt(250 / fy).',
    keywords: ['edge distance', 'maximum edge distance', '12t', 'epsilon', 'bolt'],
  },
  {
    ...base, id: 'IS800-10.3.3', clause: '10.3.3', page: 75, topic: 'bolts',
    heading: 'Shear capacity of bearing bolts',
    text:
      'The design shear strength of a bolt is Vdsb = Vnsb / gamma_mb with Vnsb = (fu / sqrt(3)) (n_n A_nb + n_s A_sb), where fu is the ultimate tensile strength of the bolt, n_n and n_s are the numbers of shear planes through the threaded and shank portions, and gamma_mb is 1.25.',
    keywords: ['bolt shear', 'vdsb', 'vnsb', 'bearing bolt', 'shear capacity', 'shear plane', 'bolt strength'],
  },
  {
    ...base, id: 'IS800-10.3.4', clause: '10.3.4', page: 76, topic: 'bolts',
    heading: 'Bearing capacity of bolts',
    text: 'The design bearing strength is Vdpb = Vnpb / gamma_mb with Vnpb = 2.5 kb d t fu, where kb depends on edge distance, pitch and hole diameter, d is the bolt diameter and t the summation of thicknesses of the connected plates.',
    keywords: ['bearing', 'vdpb', 'vnpb', 'kb', 'bolt', 'plate thickness'],
  },
  {
    ...base, id: 'IS800-10.5.2.3', clause: '10.5.2.3', page: 80, topic: 'welds',
    heading: 'Minimum size of fillet welds (Table 21)',
    text:
      'The minimum size of a fillet weld depends on the thickness of the thicker part joined: 3 mm up to 10 mm, 5 mm over 10 mm up to 20 mm, 6 mm over 20 mm up to 32 mm, and 8 mm (first run) over 32 mm up to 50 mm. The size shall not exceed the thickness of the thinner part.',
    keywords: ['fillet weld', 'weld size', 'minimum weld', 'table 21', '3 mm', '5 mm', '6 mm', '8 mm', 'weld'],
  },
  {
    ...base, id: 'IS800-10.5.3.2', clause: '10.5.3.2', page: 80, topic: 'welds',
    heading: 'Effective throat thickness',
    text: 'The effective throat thickness of a fillet weld is K x weld size, with K = 0.70 when the fusion faces meet at an angle between 60 and 90 degrees.',
    keywords: ['throat thickness', 'fillet weld', 'effective throat', '0.7', 'weld size'],
  },
  {
    ...base, id: 'IS800-10.5.4.1', clause: '10.5.4.1', page: 81, topic: 'welds',
    heading: 'Effective length of fillet welds',
    text: 'The effective length of a fillet weld designed to transmit load shall not be less than four times the weld size.',
    keywords: ['weld length', 'minimum length', 'fillet weld', '4 times', 'effective length'],
  },
  {
    ...base, id: 'IS800-10.5.7.1', clause: '10.5.7.1', page: 82, topic: 'welds',
    heading: 'Design strength of fillet welds',
    text: 'The design strength of a fillet weld is fwd = fu / (sqrt(3) gamma_mw), where fu is the smaller of the ultimate stress of the weld and the parent metal, and gamma_mw is 1.25 for shop welds and 1.50 for field welds.',
    keywords: ['weld strength', 'fwd', 'fillet weld', 'gamma mw', 'shop weld', 'field weld', 'design strength'],
  },
];
