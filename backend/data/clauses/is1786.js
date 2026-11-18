/**
 * IS 1786:2008 clause excerpts (condensed reference text).
 */

const base = { standard: 'IS 1786', edition: '2008' };

export const IS1786 = [
  {
    ...base, id: 'IS1786-1', clause: '1', page: 1, topic: 'scope',
    heading: 'Scope and grades',
    text:
      'The standard covers cold-worked and thermo-mechanically treated high strength deformed bars and wires for concrete reinforcement in grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D and Fe 600. The suffix D denotes the ductile variant with higher elongation and a higher ultimate to yield ratio, which suits seismic detailing.',
    keywords: ['scope', 'grades', 'fe 415', 'fe 500', 'fe 500d', 'fe 550', 'fe 600', 'tmt', 'ductile', 'seismic', 'rebar'],
  },
  {
    ...base, id: 'IS1786-6.1', clause: '6.1', page: 4, topic: 'chemistry',
    heading: 'Chemical composition (Table 1)',
    text:
      'Maximum percentages: Fe 415 and Fe 500 carbon 0.30, sulphur 0.060 and 0.055, phosphorus 0.060 and 0.055, sulphur plus phosphorus 0.110 and 0.105. Fe 500D carbon 0.25, sulphur 0.040, phosphorus 0.040, sulphur plus phosphorus 0.075. Fe 550 and Fe 600 are tighter still. Lower sulphur and phosphorus improve ductility and weldability.',
    keywords: ['chemical composition', 'carbon', 'sulphur', 'phosphorus', 'weldability', 'fe 500', 'fe 500d', 'fe 415', 'chemistry', 'table 1'],
  },
  {
    ...base, id: 'IS1786-7.1', clause: '7.1', page: 6, topic: 'mechanical',
    heading: 'Tensile properties (Table 3)',
    text:
      'Minimum 0.2 percent proof stress, ultimate to yield ratio and elongation: Fe 415 is 415 N/mm2 with ultimate not less than 485 N/mm2 and 14.5 percent elongation; Fe 415D is 415 with 500 N/mm2 and 18.0 percent; Fe 500 is 500 with 545 N/mm2 and 12.0 percent; Fe 500D is 500 with 565 N/mm2 and 16.0 percent; Fe 550 is 550 with 585 N/mm2 and 10.0 percent; Fe 550D is 550 with 600 N/mm2 and 14.5 percent; Fe 600 is 600 with 660 N/mm2 and 10.0 percent. In every grade the ultimate stress shall be at least 10 percent above the actual 0.2 percent proof stress.',
    keywords: ['yield', 'proof stress', 'tensile strength', 'ultimate', 'elongation', 'fe 415', 'fe 500', 'fe 500d', 'fe 550', 'fe 600', 'mechanical', 'table 3', 'uts'],
  },
  {
    ...base, id: 'IS1786-7.2', clause: '7.2', page: 7, topic: 'mechanical',
    heading: 'Bend and rebend tests',
    text:
      'Bars shall withstand bending and rebending around a mandrel of the diameter prescribed for the grade and size without fracture or visible cracking on the outside of the bend. The rebend test follows ageing of the bent sample.',
    keywords: ['bend test', 'rebend', 'mandrel', 'cracking', 'ductility', 'bending'],
  },
  {
    ...base, id: 'IS1786-8.1', clause: '8.1', page: 8, topic: 'dimensions',
    heading: 'Nominal sizes and mass',
    text:
      'Nominal diameters are 8, 10, 12, 16, 20, 25, 28, 32, 36, 40 and 50 mm. The nominal mass per metre is taken as d^2 / 162 kg, where d is the nominal diameter in millimetres.',
    keywords: ['nominal size', 'diameter', 'mass per metre', 'unit weight', 'weight', 'd2/162', '162', 'sizes', 'kg/m'],
  },
  {
    ...base, id: 'IS1786-8.2', clause: '8.2', page: 9, topic: 'dimensions',
    heading: 'Tolerance on nominal mass (Table 2)',
    text:
      'Permissible variation from nominal mass, for a batch and for an individual sample: 7 and 8 percent for sizes up to and including 10 mm; 5 and 6 percent for sizes over 10 mm up to 16 mm; 3 and 4 percent for sizes over 16 mm.',
    keywords: ['tolerance', 'mass', 'weight tolerance', 'variation', 'batch', 'sample', 'underweight', 'table 2'],
  },
  {
    ...base, id: 'IS1786-12', clause: '12', page: 12, topic: 'marking',
    heading: 'Marking and certification',
    text:
      'Bars carry rolled-in identification of the manufacturer and the grade, and each bundle carries a tag. Material may bear the Standard Mark of BIS only when produced under a licence, with the product conforming to this specification.',
    keywords: ['marking', 'bis mark', 'isi mark', 'standard mark', 'licence', 'identification', 'certification', 'tag'],
  },
];
