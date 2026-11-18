import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';
import { RenderStruct } from '../renderStruct';

function createLabeledSuperatomStruct(): Struct {
  const struct = new Struct();
  const superatom = new SGroup(SGroup.TYPES.SUP);
  superatom.data.name = 'TFA';
  const superatomId = struct.sgroups.add(superatom);
  superatom.id = superatomId;

  const atomId = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  struct.atomAddToSGroup(superatomId, atomId);

  return struct;
}

describe('RenderStruct.prepareStruct', () => {
  it('preserves labeled S-Groups when expansion is disabled', () => {
    const struct = createLabeledSuperatomStruct();

    const preparedStruct = RenderStruct.prepareStruct(struct, false);

    expect(preparedStruct.sgroups.size).toBe(1);
    expect(struct.sgroups.size).toBe(1);
  });

  it('continues expanding S-Groups by default', () => {
    const struct = createLabeledSuperatomStruct();

    const preparedStruct = RenderStruct.prepareStruct(struct);

    expect(preparedStruct.sgroups.size).toBe(0);
    expect(struct.sgroups.size).toBe(1);
  });
});
