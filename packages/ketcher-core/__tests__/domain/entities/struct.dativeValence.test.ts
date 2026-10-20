import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';

type AtomSpec = {
  label: string;
  charge?: number;
  explicitValence?: number;
  implicitHCount?: number;
};
type BondSpec = { begin: number; end: number; type: number };

function buildStruct(atomSpecs: AtomSpec[], bondSpecs: BondSpec[]) {
  const struct = new Struct();
  const ids = atomSpecs.map((spec, index) =>
    struct.atoms.add(
      new Atom({
        label: spec.label,
        charge: spec.charge ?? 0,
        explicitValence: spec.explicitValence ?? -1,
        implicitHCount: spec.implicitHCount ?? null,
        pp: new Vec2(index, 0),
      }),
    ),
  );
  bondSpecs.forEach(({ begin, end, type }) => {
    struct.bonds.add(new Bond({ begin: ids[begin], end: ids[end], type }));
  });
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.setImplicitHydrogen();
  return { struct, ids };
}

const SINGLE = Bond.PATTERN.TYPE.SINGLE;
const AROMATIC = Bond.PATTERN.TYPE.AROMATIC;
const DATIVE = Bond.PATTERN.TYPE.DATIVE;

describe('Struct dative bond valence', () => {
  describe('atoms without dative bonds keep the legacy path', () => {
    it('gives CH2 for carbon with two single bonds', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'C' }, { label: 'C' }],
        [
          { begin: 0, end: 1, type: SINGLE },
          { begin: 0, end: 2, type: SINGLE },
        ],
      );
      const atom = struct.atoms.get(ids[0]);
      expect(atom?.implicitH).toBe(2);
      expect(atom?.badConn).toBe(false);
    });

    it('keeps the legacy group 8 underline for nickel with a single bond', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'Ni' }, { label: 'C' }],
        [{ begin: 0, end: 1, type: SINGLE }],
      );
      const atom = struct.atoms.get(ids[0]);
      expect(atom?.badConn).toBe(true);
      expect(atom?.implicitH).toBe(0);
    });
  });

  describe('atoms with dative bonds', () => {
    it('gives donor N three implicit hydrogens and acceptor B three', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'N' }, { label: 'B' }],
        [{ begin: 0, end: 1, type: DATIVE }],
      );
      expect(struct.atoms.get(ids[0])?.implicitH).toBe(3);
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
      expect(struct.atoms.get(ids[1])?.implicitH).toBe(3);
      expect(struct.atoms.get(ids[1])?.badConn).toBe(false);
    });

    it('gives acceptor N one implicit hydrogen and donor B one', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'N' }, { label: 'B' }],
        [{ begin: 1, end: 0, type: DATIVE }],
      );
      expect(struct.atoms.get(ids[0])?.implicitH).toBe(1);
      expect(struct.atoms.get(ids[1])?.implicitH).toBe(1);
    });

    it('underlines a carbon with three acceptor bonds (limit is two)', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'N' }, { label: 'N' }, { label: 'N' }],
        [
          { begin: 1, end: 0, type: DATIVE },
          { begin: 2, end: 0, type: DATIVE },
          { begin: 3, end: 0, type: DATIVE },
        ],
      );
      const carbon = struct.atoms.get(ids[0]);
      expect(carbon?.badConn).toBe(true);
      expect(carbon?.implicitH).toBe(0);
      expect(struct.atoms.get(ids[1])?.badConn).toBe(false);
    });

    it('does not underline a carbon with two acceptor bonds', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'N' }, { label: 'N' }],
        [
          { begin: 1, end: 0, type: DATIVE },
          { begin: 2, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('cancels a donor against an acceptor on the same atom (req 3)', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'N' }, { label: 'N' }],
        [
          { begin: 0, end: 1, type: DATIVE },
          { begin: 2, end: 0, type: DATIVE },
        ],
      );
      const carbon = struct.atoms.get(ids[0]);
      expect(carbon?.badConn).toBe(false);
      expect(carbon?.implicitH).toBe(4);
    });

    it('does not underline a carbon with five single bonds when one donor and one acceptor cancel', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'C' },
          ...Array.from({ length: 5 }, () => ({ label: 'C' })),
          { label: 'N' },
          { label: 'N' },
        ],
        [
          ...Array.from({ length: 5 }, (_, index) => ({
            begin: 0,
            end: index + 1,
            type: SINGLE,
          })),
          { begin: 0, end: 6, type: DATIVE },
          { begin: 7, end: 0, type: DATIVE },
        ],
      );
      const carbon = struct.atoms.get(ids[0]);
      expect(carbon?.badConn).toBe(false);
      expect(carbon?.implicitH).toBe(0);
    });

    it('keeps nickel with one single bond and one dative acceptor unflagged', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'Ni' }, { label: 'C' }, { label: 'N' }],
        [
          { begin: 0, end: 1, type: SINGLE },
          { begin: 2, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('does not underline fluoride cation with one single bond and one dative donor', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'F', charge: 1 }, { label: 'C' }, { label: 'N' }],
        [
          { begin: 0, end: 1, type: SINGLE },
          { begin: 0, end: 2, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('does not underline chlorine cation with three single bonds and one dative donor', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'Cl', charge: 1 },
          { label: 'C' },
          { label: 'C' },
          { label: 'C' },
          { label: 'N' },
        ],
        [
          { begin: 0, end: 1, type: SINGLE },
          { begin: 0, end: 2, type: SINGLE },
          { begin: 0, end: 3, type: SINGLE },
          { begin: 0, end: 4, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('counts a user-set implicit hydrogen count as covalent bonds', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C', implicitHCount: 4 }, { label: 'N' }],
        [{ begin: 0, end: 1, type: DATIVE }],
      );
      const carbon = struct.atoms.get(ids[0]);
      expect(carbon?.badConn).toBe(true);
      expect(carbon?.implicitH).toBe(4);
    });

    it('sets valence from bond orders, radicals and implicit hydrogen for a phosphorus donor and acceptor', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'P' }, { label: 'P' }],
        [{ begin: 0, end: 1, type: DATIVE }],
      );
      expect(struct.atoms.get(ids[0])?.valence).toBe(3);
      expect(struct.atoms.get(ids[1])?.valence).toBe(1);
    });

    it('sets valence from bond orders, radicals and implicit hydrogen for a carbon donor and acceptor', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'C' }],
        [{ begin: 0, end: 1, type: DATIVE }],
      );
      expect(struct.atoms.get(ids[0])?.valence).toBe(2);
      expect(struct.atoms.get(ids[1])?.valence).toBe(2);
    });

    it('underlines an explicit valence atom over its dative capacity and keeps its implicit H', () => {
      const withDative = buildStruct(
        [{ label: 'N', explicitValence: 3 }, { label: 'N' }, { label: 'N' }],
        [
          { begin: 1, end: 0, type: DATIVE },
          { begin: 2, end: 0, type: DATIVE },
        ],
      );
      const withoutDative = buildStruct(
        [{ label: 'N', explicitValence: 3 }],
        [],
      );
      const nitrogen = withDative.struct.atoms.get(withDative.ids[0]);
      expect(nitrogen?.badConn).toBe(true);
      expect(nitrogen?.implicitH).toBe(
        withoutDative.struct.atoms.get(withoutDative.ids[0])?.implicitH,
      );
    });

    it('does not underline an explicit valence atom with one dative acceptor', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'N', explicitValence: 3 }, { label: 'N' }],
        [{ begin: 1, end: 0, type: DATIVE }],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('falls back to the legacy path when aromatic bonds cannot be kekulized', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'C' }, { label: 'C' }, { label: 'N' }],
        [
          { begin: 0, end: 1, type: AROMATIC },
          { begin: 0, end: 2, type: AROMATIC },
          { begin: 0, end: 3, type: DATIVE },
        ],
      );
      const carbon = struct.atoms.get(ids[0]);
      expect(carbon?.implicitH).toBeCloseTo(0);
      expect(carbon?.badConn).toBe(false);
    });
  });

  describe('dative capacity when bond orders are not exact', () => {
    it('underlines an aromatic carbon accepting three dative bonds when the ring has an unsupported element', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'C' },
          { label: 'C' },
          { label: 'Fe' },
          { label: 'C' },
          { label: 'C' },
          { label: 'C' },
          { label: 'N' },
          { label: 'N' },
          { label: 'N' },
        ],
        [
          ...[0, 1, 2, 3, 4, 5].map((index) => ({
            begin: index,
            end: (index + 1) % 6,
            type: AROMATIC,
          })),
          { begin: 6, end: 0, type: DATIVE },
          { begin: 7, end: 0, type: DATIVE },
          { begin: 8, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(true);
    });

    it('underlines an aromatic carbon accepting two dative bonds when the ring has an unsupported element', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'C' },
          { label: 'C' },
          { label: 'Fe' },
          { label: 'C' },
          { label: 'C' },
          { label: 'C' },
          { label: 'N' },
          { label: 'N' },
        ],
        [
          ...[0, 1, 2, 3, 4, 5].map((index) => ({
            begin: index,
            end: (index + 1) % 6,
            type: AROMATIC,
          })),
          { begin: 6, end: 0, type: DATIVE },
          { begin: 7, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(true);
    });

    it('does not underline an aromatic carbon accepting one dative bond when the ring has an unsupported element', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'C' },
          { label: 'C' },
          { label: 'Fe' },
          { label: 'C' },
          { label: 'C' },
          { label: 'C' },
          { label: 'N' },
        ],
        [
          ...[0, 1, 2, 3, 4, 5].map((index) => ({
            begin: index,
            end: (index + 1) % 6,
            type: AROMATIC,
          })),
          { begin: 6, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('underlines a carbon with a query bond neighbour accepting three dative bonds', () => {
      const { struct, ids } = buildStruct(
        [
          { label: 'C' },
          { label: 'C' },
          { label: 'N' },
          { label: 'N' },
          { label: 'N' },
        ],
        [
          { begin: 0, end: 1, type: Bond.PATTERN.TYPE.ANY },
          { begin: 2, end: 0, type: DATIVE },
          { begin: 3, end: 0, type: DATIVE },
          { begin: 4, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(true);
    });

    it('does not underline a carbon with a query bond neighbour accepting one dative bond', () => {
      const { struct, ids } = buildStruct(
        [{ label: 'C' }, { label: 'C' }, { label: 'N' }],
        [
          { begin: 0, end: 1, type: Bond.PATTERN.TYPE.ANY },
          { begin: 2, end: 0, type: DATIVE },
        ],
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });
  });

  describe('aromatic atoms with dative bonds (req 1.1)', () => {
    // Ring atoms are 0..n-1, the dative partner is atom n
    function buildRing(
      ringLabels: string[],
      partner: string,
      dativeDirection: 'donor' | 'acceptor',
      ringAtom = 0,
    ) {
      const size = ringLabels.length;
      const ringBonds = ringLabels.map((_label, index) => ({
        begin: index,
        end: (index + 1) % size,
        type: AROMATIC,
      }));
      const dativeBond =
        dativeDirection === 'donor'
          ? { begin: ringAtom, end: size, type: DATIVE }
          : { begin: size, end: ringAtom, type: DATIVE };
      return buildStruct(
        [...ringLabels.map((label) => ({ label })), { label: partner }],
        [...ringBonds, dativeBond],
      );
    }

    it('gives the pyridine nitrogen donor no hydrogen', () => {
      const { struct, ids } = buildRing(
        ['N', 'C', 'C', 'C', 'C', 'C'],
        'Ni',
        'donor',
      );
      expect(struct.atoms.get(ids[0])?.implicitH).toBe(0);
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('gives the pyrrole nitrogen donor one hydrogen (Example 4)', () => {
      const { struct, ids } = buildRing(
        ['N', 'C', 'C', 'C', 'C'],
        'Ni',
        'donor',
      );
      expect(struct.atoms.get(ids[0])?.implicitH).toBe(1);
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('treats the imidazole nitrogen donor as the pyridine-like nitrogen', () => {
      // Donor is N3 of imidazole (ring order N1, C2, N3, C4, C5)
      const { struct, ids } = buildRing(
        ['N', 'C', 'N', 'C', 'C'],
        'Ni',
        'donor',
        2,
      );
      expect(struct.atoms.get(ids[2])?.implicitH).toBe(0);
      expect(struct.atoms.get(ids[2])?.badConn).toBe(false);
    });

    it('gives the furan oxygen donor no hydrogen', () => {
      const { struct, ids } = buildRing(
        ['O', 'C', 'C', 'C', 'C'],
        'Ni',
        'donor',
      );
      expect(struct.atoms.get(ids[0])?.implicitH).toBe(0);
      expect(struct.atoms.get(ids[0])?.badConn).toBe(false);
    });

    it('underlines a benzene carbon accepting a dative bond', () => {
      const { struct, ids } = buildRing(
        ['C', 'C', 'C', 'C', 'C', 'C'],
        'N',
        'acceptor',
      );
      expect(struct.atoms.get(ids[0])?.badConn).toBe(true);
    });

    it('keeps aromatic atoms without dative bonds on the legacy path', () => {
      const { struct, ids } = buildRing(
        ['N', 'C', 'C', 'C', 'C'],
        'Ni',
        'donor',
      );
      ids.slice(1, 5).forEach((aid) => {
        expect(struct.atoms.get(aid)?.implicitH).toBe(1);
        expect(struct.atoms.get(aid)?.badConn).toBe(false);
      });
    });

    it('gives exactly one hydrogen to imidazole when both nitrogens donate', () => {
      // Ring order: N1, C2, N3, C4, C5; the partner Ni is atom 5
      const ringBonds = [0, 1, 2, 3, 4].map((index) => ({
        begin: index,
        end: (index + 1) % 5,
        type: AROMATIC,
      }));
      const { struct, ids } = buildStruct(
        [
          { label: 'N' },
          { label: 'C' },
          { label: 'N' },
          { label: 'C' },
          { label: 'C' },
          { label: 'Ni' },
        ],
        [
          ...ringBonds,
          { begin: 0, end: 5, type: DATIVE },
          { begin: 2, end: 5, type: DATIVE },
        ],
      );
      const nitrogens = [ids[0], ids[2]].map((aid) => struct.atoms.get(aid));
      expect(nitrogens.filter((atom) => atom?.implicitH === 1)).toHaveLength(1);
      expect(nitrogens.map((atom) => atom?.badConn)).toEqual([false, false]);
    });

    it('recalculates the other dative atoms of the aromatic system after a ring atom changes', () => {
      const { struct, ids } = buildRing(
        ['N', 'C', 'N', 'C', 'C'],
        'Ni',
        'donor',
        2,
      );
      const donor = struct.atoms.get(ids[2]) as Atom;
      const nitrogen = struct.atoms.get(ids[0]) as Atom;
      nitrogen.charge = 1;

      struct.setImplicitHydrogen([ids[0]]);
      const afterPartial = {
        implicitH: donor.implicitH,
        badConn: donor.badConn,
      };

      struct.setImplicitHydrogen();
      expect(afterPartial).toEqual({
        implicitH: donor.implicitH,
        badConn: donor.badConn,
      });
    });
  });
});

describe('Fe(CO)5 dative library template', () => {
  // Copied from packages/ketcher-react/src/templates/library.sdf ("Iron pentacarbonyl_dative")
  const molfile = `Iron pentacarbonyl_dative
  -INDIGO-03312515433D

 11 10  0  0  0  0  0  0  0  0999 V2000
   17.8272   -6.5434    0.0016 Fe  0  0  0  0  0  0  0  0  0  0  0  0
   16.5160   -6.5546    0.0060 C   0  0  0  0  0  0  0  0  0  0  0  0
   18.4365   -6.3526   -1.1017 C   0  0  0  0  0  0  0  0  0  0  0  0
   18.4929   -6.7351    1.0861 C   0  0  0  0  0  0  0  0  0  0  0  0
   17.8279   -4.9640    0.2302 C   0  0  0  0  0  0  0  0  0  0  0  0
   17.8265   -8.1106   -0.2271 C   0  0  0  0  0  0  0  0  0  0  0  0
   18.9473   -6.1954   -2.0026 O   0  0  0  0  0  0  0  0  0  0  0  0
   19.0125   -6.8785    1.9652 O   0  0  0  0  0  0  0  0  0  0  0  0
   15.4727   -6.5682    0.0394 O   0  0  0  0  0  0  0  0  0  0  0  0
   17.8279   -3.9110    0.3907 O   0  0  0  0  0  0  0  0  0  0  0  0
   17.8266   -9.1515   -0.3878 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  9  3  0  0  0  0
  3  7  3  0  0  0  0
  4  8  3  0  0  0  0
  6 11  3  0  0  0  0
  5 10  3  0  0  0  0
  2  1  9  0  0  0  0
  5  1  9  0  0  0  0
  6  1  9  0  0  0  0
  3  1  9  0  0  0  0
  4  1  9  0  0  0  0
M  CHG  8   2  -1   3  -1   4  -1   5  -1   6  -1   7   1   8   1   9   1
M  CHG  2  10   1  11   1
M  END`;

  it('does not underline any atom', () => {
    const struct = new MolSerializer().deserialize(molfile);
    expect(struct.atoms.get(9)?.charge).toBe(1);
    expect(struct.atoms.get(10)?.charge).toBe(1);
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    const badAtoms = Array.from(struct.atoms.values()).filter(
      (atom) => atom.badConn,
    );
    expect(badAtoms).toEqual([]);
  });

  it('gives carbonyl carbons and iron no implicit hydrogens', () => {
    const struct = new MolSerializer().deserialize(molfile);
    expect(struct.atoms.get(9)?.charge).toBe(1);
    expect(struct.atoms.get(10)?.charge).toBe(1);
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    struct.atoms.forEach((atom) => expect(atom.implicitH).toBe(0));
  });
});
