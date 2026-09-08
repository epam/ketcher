import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';

function createOversizedSupStruct(): Struct {
  const struct = new Struct();
  let lastAtomId = 0;

  for (let i = 0; i < 1000; i++) {
    lastAtomId = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(i, 0) }));
  }

  const sgroup = new SGroup(SGroup.TYPES.SUP);
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  struct.atomAddToSGroup(sgroupId, lastAtomId);

  return struct;
}

describe('MolSerializer V2000 size limit', () => {
  it('still throws when serializing an oversized SUP struct', () => {
    expect(() =>
      new MolSerializer().serialize(createOversizedSupStruct()),
    ).toThrow('number does not fit');
  });
});
