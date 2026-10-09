import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';

type AtomSpec = { label: string; charge?: number; explicitValence?: number };
type BondSpec = { begin: number; end: number; type: number };

function buildStruct(atomSpecs: AtomSpec[], bondSpecs: BondSpec[]) {
  const struct = new Struct();
  const ids = atomSpecs.map((spec, index) =>
    struct.atoms.add(
      new Atom({
        label: spec.label,
        charge: spec.charge ?? 0,
        explicitValence: spec.explicitValence ?? -1,
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

    it('keeps explicit valence atoms on the legacy path', () => {
      const withDative = buildStruct(
        [{ label: 'N', explicitValence: 3 }, { label: 'C' }],
        [{ begin: 0, end: 1, type: DATIVE }],
      );
      const withoutDative = buildStruct(
        [{ label: 'N', explicitValence: 3 }, { label: 'C' }],
        [],
      );
      expect(withDative.struct.atoms.get(withDative.ids[0])?.implicitH).toBe(
        withoutDative.struct.atoms.get(withoutDative.ids[0])?.implicitH,
      );
    });

    it('keeps aromatic atoms with a dative bond on the legacy path', () => {
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
    // The V2000 reader keeps only the first "M  CHG" line, so the +1 charges of the last two oxygens
    // (second "M  CHG" line in the template) are not loaded. Restore them so the template is checked as drawn.
    struct.atoms.get(9)!.charge = 1;
    struct.atoms.get(10)!.charge = 1;
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
    struct.atoms.get(9)!.charge = 1;
    struct.atoms.get(10)!.charge = 1;
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    struct.atoms.forEach((atom) => expect(atom.implicitH).toBe(0));
  });
});
