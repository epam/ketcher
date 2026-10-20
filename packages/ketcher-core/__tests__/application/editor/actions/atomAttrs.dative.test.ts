import { fromAtomsAttrs } from 'application/editor/actions/atom';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

const createReStruct = (struct: Struct) => {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(struct, render);
};

describe('editing an atom in an aromatic system with a dative bond', () => {
  const buildImidazoleWithNickel = () => {
    const struct = new Struct();
    const labels = ['N', 'C', 'N', 'C', 'C'];
    const ringIds = labels.map((label, index) =>
      struct.atoms.add(
        new Atom({ label, pp: new Vec2(index, 0), fragment: 0 }),
      ),
    );
    ringIds.forEach((begin, index) => {
      struct.bonds.add(
        new Bond({
          begin,
          end: ringIds[(index + 1) % ringIds.length],
          type: Bond.PATTERN.TYPE.AROMATIC,
        }),
      );
    });
    const nickelId = struct.atoms.add(
      new Atom({ label: 'Ni', pp: new Vec2(2, 1), fragment: 0 }),
    );
    struct.bonds.add(
      new Bond({
        begin: ringIds[2],
        end: nickelId,
        type: Bond.PATTERN.TYPE.DATIVE,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();
    return { struct, ringIds, donorId: ringIds[2] };
  };

  it('recalculates the dative donor elsewhere in the ring when another ring atom changes charge', () => {
    const { struct, ringIds, donorId } = buildImidazoleWithNickel();
    const reStruct = createReStruct(struct);
    const donor = struct.atoms.get(donorId) as Atom;

    fromAtomsAttrs(reStruct, ringIds[0], { charge: 1 }, false);

    const afterEdit = {
      implicitH: donor.implicitH,
      badConn: donor.badConn,
    };

    struct.setImplicitHydrogen();
    expect(afterEdit).toEqual({
      implicitH: donor.implicitH,
      badConn: donor.badConn,
    });
  });
});
