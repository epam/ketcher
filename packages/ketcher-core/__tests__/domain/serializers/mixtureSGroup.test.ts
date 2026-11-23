import { vi } from 'vitest';
import { SGroup, type Struct } from 'domain/entities';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';

// Ethane and methanol as two separate structures. The ordered mixture (FOR)
// holds both, the unordered mixture (MIX) holds only methanol.
const ketWithMixtures = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }] },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
      { label: 'C', location: [3, 0, 0] },
      { label: 'O', location: [4, 0, 0] },
    ],
    bonds: [
      { type: 1, atoms: [0, 1] },
      { type: 1, atoms: [2, 3] },
    ],
    sgroups: [
      { type: 'FOR', atoms: [0, 1, 2, 3] },
      { type: 'MIX', atoms: [2, 3] },
    ],
  },
});

const mixturesOf = (struct: Struct) =>
  [...struct.sgroups.values()]
    .map((sgroup) => ({
      type: sgroup.type,
      atoms: [...sgroup.atoms].sort((a, b) => a - b),
    }))
    .sort((a, b) => a.type.localeCompare(b.type));

const expectedMixtures = [
  { type: 'FOR', atoms: [0, 1, 2, 3] },
  { type: 'MIX', atoms: [2, 3] },
];

describe('mixture S-groups', () => {
  // Writing bracket coordinates to a Molfile asks the editor's renderer for
  // the R-group attachment points next to the group. There are none here.
  beforeEach(() => {
    vi.stubGlobal('ketcher', {
      editor: {
        render: {
          ctab: { getRGroupAttachmentPointsVBoxByAtomIds: () => null },
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('names the abbreviation of each kind of mixture', () => {
    expect(SGroup.getMixtureAbbreviation({ type: 'FOR' })).toBe('f');
    expect(SGroup.getMixtureAbbreviation({ type: 'MIX' })).toBe('mix');
    expect(SGroup.getMixtureAbbreviation({ type: 'SRU' })).toBeNull();
    expect(SGroup.isMixtureSGroup({ type: 'FOR' })).toBe(true);
    expect(SGroup.isMixtureSGroup({ type: 'COP' })).toBe(false);
  });

  it('reads ordered and unordered mixtures from KET', () => {
    const struct = new KetSerializer().deserialize(ketWithMixtures);

    expect(mixturesOf(struct)).toEqual(expectedMixtures);
  });

  it('keeps the kind and the atoms of a mixture in a KET round trip', () => {
    const serializer = new KetSerializer();
    const saved = serializer.serialize(serializer.deserialize(ketWithMixtures));

    expect(mixturesOf(serializer.deserialize(saved))).toEqual(expectedMixtures);
  });

  it('writes mixtures to Molfile V2000 with their type', () => {
    const struct = new KetSerializer().deserialize(ketWithMixtures);
    const molfile = new MolSerializer().serialize(struct);

    expect(molfile).toMatch(/^M {2}STY +\d+ +\d+ FOR$/m);
    expect(molfile).toMatch(/^M {2}STY +\d+ +\d+ MIX$/m);
  });

  it('keeps the kind and the atoms of a mixture in a Molfile V2000 round trip', () => {
    const struct = new KetSerializer().deserialize(ketWithMixtures);
    const serializer = new MolSerializer();

    const reloaded = serializer.deserialize(serializer.serialize(struct));

    expect(mixturesOf(reloaded)).toEqual(expectedMixtures);
  });
});
