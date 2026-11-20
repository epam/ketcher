import { KetSerializer } from 'domain/serializers';

// Ketcher writes the copolymer subtype upper case to KET (#10457)
const copolymerKet = (subtype: string) =>
  JSON.stringify({
    root: { nodes: [{ $ref: 'mol0' }] },
    mol0: {
      type: 'molecule',
      atoms: [
        { label: 'C', location: [0, 0, 0] },
        { label: 'C', location: [1, 0, 0] },
      ],
      bonds: [{ type: 1, atoms: [0, 1] }],
      sgroups: [{ type: 'COP', atoms: [0, 1], subtype, connectivity: 'EU' }],
    },
  });

describe('KET copolymer subtype', () => {
  it('is read in lower case, like the stored values', () => {
    const struct = new KetSerializer().deserialize(copolymerKet('BLO'));
    const [sgroup] = [...struct.sgroups.values()];

    expect(sgroup.data.subtype).toBe('blo');
  });

  it('is still written upper case', () => {
    const serializer = new KetSerializer();
    const ket = JSON.parse(
      serializer.serialize(serializer.deserialize(copolymerKet('RAN'))),
    );

    expect(ket.mol0.sgroups[0].subtype).toBe('RAN');
  });
});
