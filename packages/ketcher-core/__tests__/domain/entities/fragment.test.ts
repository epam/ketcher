import { Struct } from 'domain/entities/struct';
import { Fragment } from 'domain/entities/fragment';
import { Atom } from 'domain/entities/atom';
import { Text } from 'domain/entities/text';
import { SimpleObject, SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

const buildStructWithFragment = () => {
  const struct = new Struct();
  const fragmentId = struct.frags.add(new Fragment());
  struct.atoms.add(
    new Atom({ label: 'C', fragment: fragmentId, pp: new Vec2(1, 1) }),
  );
  struct.atoms.add(
    new Atom({ label: 'C', fragment: fragmentId, pp: new Vec2(3, 2) }),
  );
  return { struct, fragmentId };
};

describe('Fragment.getDefaultStereoFlagPosition', () => {
  it('places the flag above the fragment top-right corner', () => {
    const { struct, fragmentId } = buildStructWithFragment();
    expect(Fragment.getDefaultStereoFlagPosition(struct, fragmentId)).toEqual(
      new Vec2(3, 0),
    );
  });

  it('is not affected by unrelated text on the canvas (#6004)', () => {
    const { struct, fragmentId } = buildStructWithFragment();
    struct.texts.add(
      new Text({ content: '', position: new Vec2(50, -50), pos: [] }),
    );
    expect(Fragment.getDefaultStereoFlagPosition(struct, fragmentId)).toEqual(
      new Vec2(3, 0),
    );
  });

  it('is not affected by unrelated shapes on the canvas (#6004)', () => {
    const { struct, fragmentId } = buildStructWithFragment();
    struct.simpleObjects.add(
      new SimpleObject({
        mode: SimpleObjectMode.rectangle,
        pos: [new Vec2(40, -40), new Vec2(60, -20)],
      }),
    );
    expect(Fragment.getDefaultStereoFlagPosition(struct, fragmentId)).toEqual(
      new Vec2(3, 0),
    );
  });

  it('returns undefined for a fragment without atoms', () => {
    const struct = new Struct();
    const fragmentId = struct.frags.add(new Fragment());
    expect(
      Fragment.getDefaultStereoFlagPosition(struct, fragmentId),
    ).toBeUndefined();
  });
});
