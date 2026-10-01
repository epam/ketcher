/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { fromAtomMerge } from 'application/editor/actions/atomMerge';
import { fromBondsMerge } from 'application/editor/actions/bond';
import { getItemsToFuse } from 'application/editor/actions/closelyFusing';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'domain/entities';
import {
  getAttachmentGroupIdForHapticBondHalf,
  getHapticBondEndPosition,
  HAPTIC_BOND_LENGTH_FACTOR,
  isAllowedNonAttachmentGroupHapticBondMetal,
  isAtomPartOfAttachmentGroup,
  isAttachmentGroup,
  isAttachmentGroupWithHapticBond,
  isHapticBondPairAllowed,
  isHapticBondWithAttachmentGroup,
} from 'domain/helpers/hapticBond';

function addAttachmentGroup(struct: Struct, atomIds: number[]) {
  const attachmentGroup = new AttachmentGroup({ atomIds });
  attachmentGroup.recalculatePosition(struct.atoms);
  const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);

  return { attachmentGroup, attachmentGroupId };
}

function createReStruct(struct: Struct) {
  struct.initHalfBonds();
  struct.initNeighbors();
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );

  return new ReStruct(struct, render);
}

describe('hapticBond helpers', () => {
  it('increases the distance to an automatically created haptic bond atom', () => {
    const start = new Vec2(1, 2);
    const end = new Vec2(2, 2);

    expect(getHapticBondEndPosition(start, end)).toEqual(
      new Vec2(1 + HAPTIC_BOND_LENGTH_FACTOR, 2),
    );
  });

  it('recognizes only Attachment Group entities as attachment groups', () => {
    expect(isAttachmentGroup(new AttachmentGroup({ atomIds: [1, 2] }))).toBe(
      true,
    );
    expect(isAttachmentGroup(new Atom({ label: '*' }))).toBe(false);
  });

  it('detects member atoms from the dedicated Attachment Group collection', () => {
    const struct = new Struct();
    const memberAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const unrelatedAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);

    expect(isAtomPartOfAttachmentGroup(struct, memberAtomId)).toBe(true);
    expect(isAtomPartOfAttachmentGroup(struct, unrelatedAtomId)).toBe(false);
    expect(isAtomPartOfAttachmentGroup(struct, attachmentGroupId)).toBe(false);
  });

  it('allows a haptic bond with exactly one Attachment Group endpoint', () => {
    const attachmentGroup = new AttachmentGroup({ atomIds: [1, 2] });
    const carbonAtom = new Atom({ label: 'C' });

    expect(isHapticBondPairAllowed(attachmentGroup, carbonAtom)).toBe(true);
    expect(isHapticBondPairAllowed(attachmentGroup, attachmentGroup)).toBe(
      false,
    );
  });

  it('allows atom-atom haptic bonds with exactly one supported metal', () => {
    expect(isAllowedNonAttachmentGroupHapticBondMetal({ label: 'Ti' })).toBe(
      true,
    );
    expect(isAllowedNonAttachmentGroupHapticBondMetal({ label: 'Al' })).toBe(
      false,
    );
    expect(isHapticBondPairAllowed({ label: 'Ti' }, { label: 'N' })).toBe(true);
    expect(isHapticBondPairAllowed({ label: 'Ti' }, { label: 'Au' })).toBe(
      false,
    );
    expect(isHapticBondPairAllowed({ label: 'Al' }, { label: 'N' })).toBe(
      false,
    );
  });

  it('detects whether an Attachment Group has a haptic bond', () => {
    const struct = new Struct();
    const memberAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const metalId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);

    expect(isAttachmentGroupWithHapticBond(struct, attachmentGroupId)).toBe(
      false,
    );

    struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: attachmentGroupId,
        end: metalId,
      }),
    );

    expect(isAttachmentGroupWithHapticBond(struct, attachmentGroupId)).toBe(
      true,
    );
    expect(isAttachmentGroupWithHapticBond(struct, metalId)).toBe(false);
  });

  it('distinguishes group haptic bonds from atom-atom haptic bonds', () => {
    const struct = new Struct();
    const memberAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const metalId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const carbonId = struct.atoms.add(new Atom({ label: 'C' }));
    const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);

    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: attachmentGroupId,
          end: metalId,
        }),
      ),
    ).toBe(true);
    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: metalId,
          end: carbonId,
        }),
      ),
    ).toBe(false);
    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.SINGLE,
          begin: attachmentGroupId,
          end: metalId,
        }),
      ),
    ).toBe(false);
  });

  it('resolves only the Attachment Group half of its haptic bond', () => {
    const struct = new Struct();
    const memberAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(2, 0) }),
    );
    const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);
    const hapticBond = new Bond({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: centralAtomId,
      end: attachmentGroupId,
    });

    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        hapticBond,
        new Vec2(0.25, 0),
      ),
    ).toBe(attachmentGroupId);
    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        hapticBond,
        new Vec2(1.75, 0),
      ),
    ).toBeNull();
    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: memberAtomId,
          end: centralAtomId,
        }),
        new Vec2(0.25, 0),
      ),
    ).toBeNull();
  });

  it.each([
    ['target', false],
    ['source', true],
  ])(
    'does not produce fusion items when a group haptic bond is the %s bond',
    (_, hapticBondIsSource) => {
      const struct = new Struct();
      const memberAtomId = struct.atoms.add(new Atom({ label: 'C' }));
      const metalId = struct.atoms.add(new Atom({ label: 'Fe' }));
      const regularBeginId = struct.atoms.add(new Atom({ label: 'C' }));
      const regularEndId = struct.atoms.add(new Atom({ label: 'C' }));
      const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);
      const hapticBondId = struct.bonds.add(
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: attachmentGroupId,
          end: metalId,
        }),
      );
      const regularBondId = struct.bonds.add(
        new Bond({
          type: Bond.PATTERN.TYPE.SINGLE,
          begin: regularBeginId,
          end: regularEndId,
        }),
      );
      const sourceBondId = hapticBondIsSource ? hapticBondId : regularBondId;
      const targetBondId = hapticBondIsSource ? regularBondId : hapticBondId;
      const sourceBond = struct.bonds.get(sourceBondId)!;
      const targetBond = struct.bonds.get(targetBondId)!;
      const editor = {
        render: { ctab: { molecule: struct } },
        findMerge: () => ({
          atoms: new Map([
            [sourceBond.begin, targetBond.begin],
            [sourceBond.end, targetBond.end],
          ]),
          bonds: new Map([[sourceBondId, targetBondId]]),
          atomToFunctionalGroup: new Map(),
        }),
      };

      expect(
        getItemsToFuse(editor, {
          atoms: [sourceBond.begin, sourceBond.end],
          bonds: [sourceBondId],
        }),
      ).toBeNull();
    },
  );

  it('does not merge an Attachment Group haptic bond directly', () => {
    const struct = new Struct();
    const memberAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const metalId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const regularBeginId = struct.atoms.add(new Atom({ label: 'C' }));
    const regularEndId = struct.atoms.add(new Atom({ label: 'C' }));
    const { attachmentGroupId } = addAttachmentGroup(struct, [memberAtomId]);
    const hapticBondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: attachmentGroupId,
        end: metalId,
      }),
    );
    const regularBondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: regularBeginId,
        end: regularEndId,
      }),
    );
    const reStruct = createReStruct(struct);

    const action = fromBondsMerge(
      reStruct,
      new Map([[regularBondId, hapticBondId]]),
    );

    expect(action.operations).toHaveLength(0);
    expect(struct.atoms.size).toBe(4);
    expect(struct.attachmentGroups.size).toBe(1);
    expect(struct.bonds.size).toBe(2);
  });

  it('remaps member atom ids when an Attachment Group is cloned', () => {
    const attachmentGroup = new AttachmentGroup({ atomIds: [1, 2, 99] });
    const clone = attachmentGroup.clone(
      undefined,
      new Map([
        [1, 10],
        [2, 20],
      ]),
    );

    expect(clone.atomIds).toEqual([10, 20]);
  });

  it('keeps the group center stable when a member atom is merged at the same position', () => {
    const struct = new Struct();
    const mergedAtomPosition = new Vec2(5, -9.2);
    const memberAtomIds = [
      mergedAtomPosition,
      new Vec2(4.065, -8.7),
      new Vec2(3.202, -8.2),
      new Vec2(4.065, -9.701),
      new Vec2(2.335, -9.705),
      new Vec2(3.204, -10.2),
    ].map((pp) => struct.atoms.add(new Atom({ label: 'C', pp })));
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: mergedAtomPosition }),
    );
    const { attachmentGroup, attachmentGroupId } = addAttachmentGroup(
      struct,
      memberAtomIds,
    );
    struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: centralAtomId,
        end: attachmentGroupId,
      }),
    );
    const initialPosition = new Vec2(attachmentGroup.pp);
    const reStruct = createReStruct(struct);
    reStruct.assignConnectedComponents();

    fromAtomMerge(reStruct, memberAtomIds[0], centralAtomId);

    expect(attachmentGroup.atomIds).toEqual([
      centralAtomId,
      ...memberAtomIds.slice(1),
    ]);
    expect(attachmentGroup.pp).toEqual(initialPosition);
  });
});
