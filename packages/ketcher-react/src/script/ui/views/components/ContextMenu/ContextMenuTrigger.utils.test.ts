import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import {
  getAttachmentGroupTargetForBondHalf,
  getMenuPropsForSelection,
} from './ContextMenuTrigger.utils';
import { CONTEXT_MENU_ID } from './contextMenu.types';

describe('getMenuPropsForSelection', () => {
  it('uses the selection menu for a multi-atom selection', () => {
    expect(
      getMenuPropsForSelection({ atoms: [1, 2] }, new Map(), 'test'),
    ).toEqual({
      id: CONTEXT_MENU_ID.FOR_SELECTION + 'test',
      atomIds: [1, 2],
      bondIds: undefined,
      rgroupAttachmentPoints: undefined,
    });
  });

  it('keeps a single atom in the atom menu', () => {
    expect(getMenuPropsForSelection({ atoms: [1] }, new Map(), 'test')).toEqual(
      {
        id: CONTEXT_MENU_ID.FOR_ATOMS + 'test',
        atomIds: [1],
        extraItemsSelected: false,
      },
    );
  });

  it('uses the selection menu when atoms and another drawing item are selected', () => {
    expect(
      getMenuPropsForSelection(
        { atoms: [1, 2], rxnArrows: [3] },
        new Map(),
        'test',
      ),
    ).toMatchObject({
      id: CONTEXT_MENU_ID.FOR_SELECTION + 'test',
      atomIds: [1, 2],
    });
  });
});

describe('getAttachmentGroupTargetForBondHalf', () => {
  const createHapticBond = () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(-1, 0) }),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds: [endpointId] });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
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
    ).toEqual({ map: 'attachmentGroups', id: attachmentGroupId, dist: 0.1 });
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
