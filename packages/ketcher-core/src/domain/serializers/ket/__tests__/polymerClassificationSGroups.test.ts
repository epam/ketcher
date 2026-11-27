import { Struct } from 'domain/entities/struct';
import { SGroup } from 'domain/entities/sgroup';
import { Atom } from 'domain/entities/atom';
import { Vec2 } from 'domain/entities/vec2';
import { KetSerializer } from '../ketSerializer';

function createStructWithSGroup(type: string, data: Record<string, unknown>) {
  const struct = new Struct();
  const atomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0, 0) }),
  );
  const sgroup = new SGroup(type);
  sgroup.atoms = [atomId];
  Object.assign(sgroup.data, data);
  struct.sgroups.add(sgroup);
  return struct;
}

function roundTrip(struct: Struct): SGroup {
  const serializer = new KetSerializer();
  const restored = serializer.deserialize(serializer.serialize(struct));
  return restored.sgroups.values().next().value as SGroup;
}

describe('polymer classification S-Groups survive KET round trip', () => {
  it.each(['ANY', 'MER'])(
    '%s keeps repeat pattern and bracket type',
    (type) => {
      const restored = roundTrip(
        createStructWithSGroup(type, { connectivity: 'hh', subtype: 'ran' }),
      );

      expect(restored.type).toBe(type);
      expect(restored.data.connectivity).toBe('hh');
      expect(restored.data.subtype).toBe('ran');
    },
  );

  it('MON keeps its bracket type', () => {
    const restored = roundTrip(
      createStructWithSGroup('MON', { subtype: 'alt' }),
    );

    expect(restored.type).toBe('MON');
    expect(restored.data.subtype).toBe('alt');
  });

  it('GEN keeps its type without extra properties', () => {
    const restored = roundTrip(createStructWithSGroup('GEN', {}));

    expect(restored.type).toBe('GEN');
  });
});
