import { fromAtomsAttrs } from 'application/editor/actions/atom';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { createReStruct } from './dativeTestUtils';

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
