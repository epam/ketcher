import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { AtomCIP } from 'domain/entities/types';
import {
  findUndefinedStereocenters,
  markUndefinedStereocenters,
} from 'domain/helpers/undefinedStereocenters';

function buildStruct(
  labels: string[],
  bondDefs: Array<[number, number, number?]>,
): Struct {
  const struct = new Struct();
  labels.forEach((label, i) =>
    struct.atoms.add(new Atom({ label, pp: new Vec2(i, 0) })),
  );
  bondDefs.forEach(([begin, end, stereo]) =>
    struct.bonds.add(
      new Bond({
        begin,
        end,
        type: Bond.PATTERN.TYPE.SINGLE,
        stereo: stereo ?? Bond.PATTERN.STEREO.NONE,
      }),
    ),
  );
  return struct;
}

// C(0) with Br(1), Cl(2), F(3) and one implicit H
const chbrclf = (stereo?: number) =>
  buildStruct(
    ['C', 'Br', 'Cl', 'F'],
    [
      [0, 1, stereo],
      [0, 2],
      [0, 3],
    ],
  );

describe('undefined stereocenters', () => {
  it('finds a chiral center without stereo bonds', () => {
    expect(findUndefinedStereocenters(chbrclf())).toEqual([0]);
  });

  it('marks the chiral center with the "?" label', () => {
    const struct = markUndefinedStereocenters(chbrclf());
    expect(struct.atoms.get(0)?.cip).toBe(AtomCIP.Undefined);
    expect(struct.atoms.get(1)?.cip).toBeNull();
  });

  it('ignores chiral centers that have a stereo bond', () => {
    expect(findUndefinedStereocenters(chbrclf(Bond.PATTERN.STEREO.UP))).toEqual(
      [],
    );
  });

  it('ignores centers with two identical substituents', () => {
    const struct = buildStruct(
      ['C', 'Br', 'Cl', 'Cl'],
      [
        [0, 1],
        [0, 2],
        [0, 3],
      ],
    );
    expect(findUndefinedStereocenters(struct)).toEqual([]);
  });

  it('keeps an already assigned CIP label', () => {
    const struct = chbrclf();
    struct.atoms.get(0)!.cip = AtomCIP.R;
    expect(findUndefinedStereocenters(struct)).toEqual([]);
  });
});
