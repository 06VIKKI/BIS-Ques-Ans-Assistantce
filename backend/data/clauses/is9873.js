/**
 * IS 9873 (Parts 1 and 3) clause excerpts (condensed reference text).
 */

const p1 = { standard: 'IS 9873 (Part 1)', edition: '1999' };
const p3 = { standard: 'IS 9873 (Part 3)', edition: '2014' };

export const IS9873 = [
  {
    ...p1, id: 'IS9873-1-1', clause: '1', page: 1, topic: 'scope',
    heading: 'Scope and regulatory context',
    text:
      'Part 1 specifies safety requirements and test methods for the mechanical and physical properties of toys designed for children under 14 years. In India, toys fall under the Toys (Quality Control) Order, which requires them to carry the BIS Standard Mark.',
    keywords: ['scope', 'toy', 'children', 'quality control order', 'bis mark', 'isi mark', 'regulation', 'qco', 'under 14'],
  },
  {
    ...p1, id: 'IS9873-1-5.2', clause: '5.2', page: 11, topic: 'small-parts',
    heading: 'Small parts for children under 36 months',
    text:
      'Toys intended for children under 36 months, and any detachable component of them, shall not fit entirely inside the small parts cylinder, which has an internal diameter of 31.7 mm and a depth sloping from 25.4 mm to 57.1 mm. Parts that fit are a choking hazard.',
    keywords: ['small parts', 'cylinder', '31.7', 'choking', 'under 36 months', 'under 3 years', 'detachable', 'infant', 'toddler'],
  },
  {
    ...p1, id: 'IS9873-1-5.3', clause: '5.3', page: 12, topic: 'cords',
    heading: 'Cords, chains and elastic',
    text:
      'On toys intended for children under 18 months, the free length of a cord, chain or elastic shall not exceed 220 mm when measured unloaded. Longer lengths and loops create a strangulation hazard.',
    keywords: ['cord', 'string', 'chain', 'elastic', 'strangulation', '220 mm', 'under 18 months', 'cot', 'pram'],
  },
  {
    ...p1, id: 'IS9873-1-4.5', clause: '4.5', page: 8, topic: 'edges',
    heading: 'Edges and points',
    text:
      'Accessible edges shall not be hazardously sharp and accessible points shall not be hazardously pointed, when tested with the prescribed sharp-edge and sharp-point test procedures, both as received and after the use and abuse tests.',
    keywords: ['sharp edge', 'sharp point', 'edges', 'points', 'cut', 'injury', 'accessible', 'burr'],
  },
  {
    ...p1, id: 'IS9873-1-7', clause: '7', page: 20, topic: 'warnings',
    heading: 'Warnings and age labelling',
    text:
      'Toys not suitable for children under 36 months that contain small parts shall carry a warning to that effect, together with a brief indication of the specific hazard. The manufacturer or importer name and address shall appear on the toy or its packaging.',
    keywords: ['warning', 'label', 'age grading', 'not suitable', 'under 36 months', 'marking', 'packaging', 'instructions', 'importer'],
  },
  {
    ...p3, id: 'IS9873-3-4', clause: '4', page: 5, topic: 'migration',
    heading: 'Maximum migration limits for dry, brittle or pliable material',
    text:
      'Migration limits in mg/kg of toy material: antimony 60, arsenic 25, barium 1000, cadmium 75, chromium 60, lead 90, mercury 60 and selenium 500. Limits for liquid or sticky material are one quarter of these values, and limits for scraped-off material are higher.',
    keywords: ['migration', 'lead', 'cadmium', 'chromium', 'mercury', 'arsenic', 'antimony', 'barium', 'selenium', 'heavy metal', 'mg/kg', 'paint', 'limits', 'toxic'],
  },
  {
    ...p3, id: 'IS9873-3-5', clause: '5', page: 7, topic: 'migration',
    heading: 'Accessible materials and sampling',
    text:
      'The limits apply to accessible materials: coatings, textiles, plastics, paper and similar materials a child can mouth, suck or swallow. Samples are taken from each distinct material or colour, and results are reported per material.',
    keywords: ['accessible', 'sampling', 'coating', 'plastic', 'textile', 'paint', 'colour', 'test report', 'material'],
  },
];
