import { Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import { getAttachmentGroupTargetForBondHalf } from './ContextMenuTrigger.utils';

jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');

  return {
    ...actual,
    getAttachmentGroupIdForHapticBondHalf: (
      struct: Struct,
      bond: Bond,
      pointer: Vec2,
    ) => {
      if (bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
        return null;
      }

      const attachmentGroupId = [bond.begin, bond.end].find((atomId) => {
        const atom = struct.atoms.get(atomId);
        return atom?.label === '*' && atom.endpoints.length > 0;
      });
      if (attachmentGroupId === undefined) {
        return null;
      }

      const otherAtomId =
        attachmentGroupId === bond.begin ? bond.end : bond.begin;
      const attachmentGroup = struct.atoms.get(attachmentGroupId);
      const otherAtom = struct.atoms.get(otherAtomId);

      return attachmentGroup &&
        otherAtom &&
        Vec2.dist(pointer, attachmentGroup.pp) <=
          Vec2.dist(pointer, otherAtom.pp)
        ? attachmentGroupId
        : null;
    },
  };
});

describe('getAttachmentGroupTargetForBondHalf', () => {
  const createHapticBond = () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(-1, 0) }),
    );
    const attachmentGroupId = struct.atoms.add(
      new Atom({
        label: '*',
        pp: new Vec2(0, 0),
        endpoints: [endpointId],
      }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(2, 0) }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: attachmentGroupId,
        end: centralAtomId,
      }),
    );

    return { struct, attachmentGroupId, bondId };
  };

  it('routes the Attachment Group half of a haptic bond to the AG marker', () => {
    const { struct, attachmentGroupId, bondId } = createHapticBond();

    expect(
      getAttachmentGroupTargetForBondHalf(
        struct,
        { map: 'bonds', id: bondId, dist: 0.1 },
        new Vec2(0.25, 0),
      ),
    ).toEqual({ map: 'atoms', id: attachmentGroupId, dist: 0.1 });
  });

  it('keeps the central-atom half on the regular bond context menu', () => {
    const { struct, bondId } = createHapticBond();

    expect(
      getAttachmentGroupTargetForBondHalf(
        struct,
        { map: 'bonds', id: bondId, dist: 0.1 },
        new Vec2(1.75, 0),
      ),
    ).toBeNull();
  });

  it('does not reroute regular bonds', () => {
    const struct = new Struct();
    const firstAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: firstAtomId,
        end: secondAtomId,
      }),
    );

    expect(
      getAttachmentGroupTargetForBondHalf(
        struct,
        { map: 'bonds', id: bondId, dist: 0.1 },
        new Vec2(0.25, 0),
      ),
    ).toBeNull();
  });
});
