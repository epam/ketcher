import {
  findKekuleDoubleBondAtoms,
  getKekuleRole,
  type KekuleAtom,
} from 'domain/entities/aromaticKekulization';

type AtomSpec = Partial<Omit<KekuleAtom, 'aromaticNeighbors'>> & {
  label: string;
};

function ring(specs: AtomSpec[]): Map<number, KekuleAtom> {
  const size = specs.length;
  return new Map(
    specs.map((spec, index) => [
      index,
      {
        charge: 0,
        radicalCount: 0,
        externalBondOrderSum: 0,
        fixedHydrogenCount: 0,
        preferDoubleBond: false,
        ...spec,
        aromaticNeighbors: [(index + size - 1) % size, (index + 1) % size],
      },
    ]),
  );
}

const carbons = (count: number): AtomSpec[] =>
  Array.from({ length: count }, () => ({ label: 'C' }));

describe('getKekuleRole', () => {
  const aromaticAtom = (spec: AtomSpec): KekuleAtom => ({
    charge: 0,
    radicalCount: 0,
    externalBondOrderSum: 0,
    fixedHydrogenCount: 0,
    preferDoubleBond: false,
    aromaticNeighbors: [1, 2],
    ...spec,
  });

  it.each([
    ['ring carbon', { label: 'C' }, 'mandatory'],
    ['pyridinium nitrogen', { label: 'N', charge: 1 }, 'mandatory'],
    ['pyridine nitrogen', { label: 'N' }, 'optional'],
    ['cyclopentadienyl anion carbon', { label: 'C', charge: -1 }, 'optional'],
    ['tropylium carbon', { label: 'C', charge: 1 }, 'optional'],
    ['furan oxygen', { label: 'O' }, 'forbidden'],
    ['thiophene sulfur', { label: 'S' }, 'forbidden'],
    ['N-methyl nitrogen', { label: 'N', externalBondOrderSum: 1 }, 'forbidden'],
    [
      'NH nitrogen with set hydrogen',
      { label: 'N', fixedHydrogenCount: 1 },
      'forbidden',
    ],
    [
      'carbon with exocyclic double bond',
      { label: 'C', externalBondOrderSum: 2 },
      'forbidden',
    ],
  ] as const)('classifies a %s as %s', (_name, spec, role) => {
    expect(getKekuleRole(aromaticAtom(spec))).toBe(role);
  });

  it.each(['Fe', 'H', 'R#', 'Mg'])('does not describe %s', (label) => {
    expect(getKekuleRole(aromaticAtom({ label }))).toBeNull();
  });
});

describe('findKekuleDoubleBondAtoms', () => {
  it('matches every atom of benzene', () => {
    expect(findKekuleDoubleBondAtoms(ring(carbons(6)))?.size).toBe(6);
  });

  it('gives the pyridine nitrogen a double bond', () => {
    const result = findKekuleDoubleBondAtoms(
      ring([{ label: 'N' }, ...carbons(5)]),
    );
    expect(result?.has(0)).toBe(true);
  });

  it('leaves the pyrrole nitrogen without a double bond (Example 4)', () => {
    const result = findKekuleDoubleBondAtoms(
      ring([{ label: 'N', preferDoubleBond: true }, ...carbons(4)]),
    );
    expect(result?.has(0)).toBe(false);
    expect(result?.size).toBe(4);
  });

  it('gives the preferred imidazole nitrogen the double bond', () => {
    // Ring order: N1, C2, N3, C4, C5
    const imidazole = (preferred: number) =>
      ring([
        { label: 'N', preferDoubleBond: preferred === 0 },
        { label: 'C' },
        { label: 'N', preferDoubleBond: preferred === 2 },
        { label: 'C' },
        { label: 'C' },
      ]);
    expect(findKekuleDoubleBondAtoms(imidazole(0))?.has(0)).toBe(true);
    expect(findKekuleDoubleBondAtoms(imidazole(0))?.has(2)).toBe(false);
    expect(findKekuleDoubleBondAtoms(imidazole(2))?.has(2)).toBe(true);
    expect(findKekuleDoubleBondAtoms(imidazole(2))?.has(0)).toBe(false);
  });

  it('matches as many preferred atoms as possible', () => {
    // Five-membered ring: three preferred nitrogens and two carbons. Only two of
    // the nitrogens can share the double bonds with the carbons.
    const result = findKekuleDoubleBondAtoms(
      ring([
        { label: 'N', preferDoubleBond: true },
        { label: 'N', preferDoubleBond: true },
        { label: 'N', preferDoubleBond: true },
        ...carbons(2),
      ]),
    );
    const matchedPreferred = [0, 1, 2].filter((atomId) => result?.has(atomId));
    expect(matchedPreferred).toHaveLength(2);
  });

  it('kekulizes fused rings (naphthalene)', () => {
    // Two six-membered rings sharing atoms 0 and 5
    const neighbors = [
      [1, 5, 6],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 0, 9],
      [0, 7],
      [6, 8],
      [7, 9],
      [8, 5],
    ];
    const naphthalene = new Map<number, KekuleAtom>(
      neighbors.map((aromaticNeighbors, index) => [
        index,
        {
          label: 'C',
          charge: 0,
          radicalCount: 0,
          externalBondOrderSum: 0,
          fixedHydrogenCount: 0,
          preferDoubleBond: false,
          aromaticNeighbors,
        },
      ]),
    );
    expect(findKekuleDoubleBondAtoms(naphthalene)?.size).toBe(10);
  });

  it('returns null when no Kekulé structure exists', () => {
    expect(findKekuleDoubleBondAtoms(ring(carbons(5)))).toBeNull();
  });

  it('returns null when an atom is not supported', () => {
    expect(
      findKekuleDoubleBondAtoms(ring([{ label: 'Fe' }, ...carbons(5)])),
    ).toBeNull();
  });
});
