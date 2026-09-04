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

import {
  fromAttachmentGroupDeletion,
  fromAtomsAttrs,
  fromBondsAttrs,
} from 'application/editor/actions';
import { fromAtomMerge } from 'application/editor/actions/atomMerge';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import {
  AttachmentGroup,
  Atom,
  Bond,
  Fragment,
  Struct,
  Vec2,
} from 'domain/entities';

function createReStruct(struct: Struct) {
  struct.initHalfBonds();
  struct.initNeighbors();

  const render = new Render(
    document as unknown as HTMLElement,
    {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions,
  );

  return new ReStruct(struct, render);
}

function createAtomPair(
  firstLabel: string,
  secondLabel: string,
  bondType: number,
) {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: firstLabel, pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: secondLabel, pp: new Vec2(1, 0) }),
  );
  const bondId = struct.bonds.add(
    new Bond({
      begin: firstAtomId,
      end: secondAtomId,
      type: bondType,
    }),
  );

  return {
    struct,
    reStruct: createReStruct(struct),
    firstAtomId,
    secondAtomId,
    bondId,
  };
}

describe('haptic bond editing rules', () => {
  it('reduces carbon implicit hydrogens from four to three when a haptic bond is added', () => {
    const struct = new Struct();
    const metalAtomId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const carbonAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    struct.bonds.add(
      new Bond({
        begin: metalAtomId,
        end: carbonAtomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();

    struct.setImplicitHydrogen([metalAtomId, carbonAtomId]);

    expect(struct.atoms.get(carbonAtomId)?.implicitH).toBe(3);
    expect(struct.atoms.get(metalAtomId)?.implicitH).toBe(0);
    expect(struct.atoms.get(metalAtomId)?.badConn).toBe(false);
  });

  it('does not convert an ineligible atom-atom bond to haptic', () => {
    const { struct, reStruct, bondId } = createAtomPair(
      'C',
      'N',
      Bond.PATTERN.TYPE.SINGLE,
    );

    const action = fromBondsAttrs(reStruct, bondId, {
      type: Bond.PATTERN.TYPE.HAPTIC,
    });

    expect(struct.bonds.get(bondId)?.type).toBe(Bond.PATTERN.TYPE.SINGLE);
    expect(action.isDummy()).toBe(true);
  });

  it('converts a metal-nonmetal bond to haptic', () => {
    const { struct, reStruct, bondId } = createAtomPair(
      'Fe',
      'C',
      Bond.PATTERN.TYPE.SINGLE,
    );

    fromBondsAttrs(reStruct, bondId, {
      type: Bond.PATTERN.TYPE.HAPTIC,
    });

    expect(struct.bonds.get(bondId)?.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
  });

  it('converts a bond with one Attachment Group endpoint to haptic', () => {
    const struct = new Struct();
    const memberAtomIds = [0, 1].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(3, 0) }),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds: memberAtomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const bondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: atomId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const reStruct = createReStruct(struct);

    fromBondsAttrs(reStruct, bondId, {
      type: Bond.PATTERN.TYPE.HAPTIC,
    });

    expect(struct.bonds.get(bondId)?.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
  });

  it('does not convert an Attachment Group haptic bond to a regular bond', () => {
    const struct = new Struct();
    const memberAtomIds = [0, 1].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const atomId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const attachmentGroup = new AttachmentGroup({ atomIds: memberAtomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const bondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: atomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    const reStruct = createReStruct(struct);

    const action = fromBondsAttrs(reStruct, bondId, {
      type: Bond.PATTERN.TYPE.SINGLE,
    });

    expect(struct.bonds.get(bondId)?.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
    expect(action.isDummy()).toBe(true);
  });

  it('does not change the only metal endpoint of a haptic bond to a nonmetal', () => {
    const { struct, reStruct, firstAtomId } = createAtomPair(
      'Fe',
      'C',
      Bond.PATTERN.TYPE.HAPTIC,
    );

    const action = fromAtomsAttrs(reStruct, firstAtomId, { label: 'N' }, false);

    expect(struct.atoms.get(firstAtomId)?.label).toBe('Fe');
    expect(action.isDummy()).toBe(true);
  });

  it('allows edits that keep an atom-atom haptic bond eligible', () => {
    const { struct, reStruct, secondAtomId } = createAtomPair(
      'Fe',
      'C',
      Bond.PATTERN.TYPE.HAPTIC,
    );

    fromAtomsAttrs(reStruct, secondAtomId, { label: 'N' }, false);

    expect(struct.atoms.get(secondAtomId)?.label).toBe('N');
  });

  it('does not change the nonmetal endpoint of a haptic bond to another metal', () => {
    const { struct, reStruct, secondAtomId } = createAtomPair(
      'Fe',
      'C',
      Bond.PATTERN.TYPE.HAPTIC,
    );

    fromAtomsAttrs(reStruct, secondAtomId, { label: 'Au' }, false);

    expect(struct.atoms.get(secondAtomId)?.label).toBe('C');
  });

  it('allows changing the atom endpoint of an Attachment Group haptic bond', () => {
    const struct = new Struct();
    const memberAtomIds = [0, 1].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const atomId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const attachmentGroup = new AttachmentGroup({ atomIds: memberAtomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: atomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    const reStruct = createReStruct(struct);

    fromAtomsAttrs(reStruct, atomId, { label: 'N' }, false);

    expect(struct.atoms.get(atomId)?.label).toBe('N');
  });

  it('updates implicit hydrogens and fragments when an Attachment Group is deleted', () => {
    const struct = new Struct();
    const fragmentId = struct.frags.add(new Fragment());
    const firstMemberId = struct.atoms.add(
      new Atom({ label: 'C', fragment: fragmentId, pp: new Vec2(0, 0) }),
    );
    const secondMemberId = struct.atoms.add(
      new Atom({ label: 'C', fragment: fragmentId, pp: new Vec2(1, 0) }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'C', fragment: fragmentId, pp: new Vec2(2, 0) }),
    );
    struct.bonds.add(
      new Bond({
        begin: firstMemberId,
        end: secondMemberId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const attachmentGroup = new AttachmentGroup({
      atomIds: [firstMemberId, secondMemberId],
      fragment: fragmentId,
    });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const hapticBondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: centralAtomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    const reStruct = createReStruct(struct);
    struct.setImplicitHydrogen([centralAtomId]);
    expect(struct.atoms.get(centralAtomId)?.implicitH).toBe(3);

    const undoAction = fromAttachmentGroupDeletion(reStruct, attachmentGroupId);

    expect(struct.attachmentGroups.has(attachmentGroupId)).toBe(false);
    expect(struct.bonds.has(hapticBondId)).toBe(false);
    expect(struct.atoms.get(centralAtomId)?.implicitH).toBe(4);
    expect(struct.atoms.get(firstMemberId)?.fragment).toBe(
      struct.atoms.get(secondMemberId)?.fragment,
    );
    expect(struct.atoms.get(centralAtomId)?.fragment).not.toBe(
      struct.atoms.get(firstMemberId)?.fragment,
    );

    undoAction.perform(reStruct);

    expect(struct.attachmentGroups.has(attachmentGroupId)).toBe(true);
    expect(struct.bonds.has(hapticBondId)).toBe(true);
    expect(struct.atoms.get(centralAtomId)?.implicitH).toBe(3);
    expect(struct.atoms.get(centralAtomId)?.fragment).toBe(
      struct.atoms.get(firstMemberId)?.fragment,
    );
  });

  it('does not merge a nonmetal atom onto the metal endpoint of a haptic bond', () => {
    const { struct, firstAtomId } = createAtomPair(
      'Fe',
      'C',
      Bond.PATTERN.TYPE.HAPTIC,
    );
    const sourceAtomId = struct.atoms.add(new Atom({ label: 'N' }));
    const reStruct = createReStruct(struct);

    const action = fromAtomMerge(reStruct, sourceAtomId, firstAtomId);

    expect(action.isDummy()).toBe(true);
    expect(struct.atoms.get(firstAtomId)?.label).toBe('Fe');
    expect(struct.atoms.has(sourceAtomId)).toBe(true);
  });
});
