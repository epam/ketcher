/****************************************************************************
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  fromSeveralSgroupAddition,
  fromSgroupAttrs,
  fromSgroupDeletion,
  setExpandMonomerSGroup,
} from 'application/editor/actions/sgroup';
import { fromMultipleMove } from 'application/editor/actions/fragment';
import { Action } from 'application/editor/actions/action';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  Bond,
  SGroup,
  SGroupBracketType,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { prepareStructForKet } from 'domain/serializers/ket/toKet/prepare';
import { Peptide } from 'domain/entities/Peptide';
import { getAttachmentPointStereoBond } from 'domain/helpers/getAttachmentPointStereoBond';
import { peptideMonomerItem } from '../../../mock-data';
import {
  SGroupAtomAdd,
  SGroupAtomRemove,
  SGroupCreate,
} from 'application/editor/operations/sgroup';

jest.mock('domain/helpers/getAttachmentPointStereoBond', () => ({
  getAttachmentPointStereoBond: jest.fn(),
}));

const createMonomerSGroup = (struct: Struct, atomId: number) => {
  const monomer = new Peptide(peptideMonomerItem);
  monomer.monomerItem.expanded = true;
  const sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  sgroup.data.expanded = true;
  const atom = struct.atoms.get(atomId);
  sgroup.pp = atom ? new Vec2(atom.pp) : new Vec2();
  struct.atomAddToSGroup(sgroupId, atomId);
  return sgroupId;
};

const createRestruct = (struct: Struct) => {
  const options = {
    scale: 40,
    width: 100,
    height: 100,
  } as unknown as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(struct, render);
};

/**
 * Builds a plain zig-zag carbon chain of unit bond length, the micromolecules
 * equivalent of drawing `CCCCCCCC` on the canvas.
 */
const createZigZagChain = (struct: Struct, atomsCount: number) => {
  const atomIds: number[] = [];
  for (let index = 0; index < atomsCount; index++) {
    atomIds.push(
      struct.atoms.add(
        new Atom({
          label: 'C',
          pp: new Vec2(
            index * Math.cos(Math.PI / 6),
            index % 2 === 0 ? 0 : -0.5,
          ),
        }),
      ),
    );
  }

  for (let index = 0; index < atomsCount - 1; index++) {
    const bond = new Bond({
      begin: atomIds[index],
      end: atomIds[index + 1],
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const bondId = struct.bonds.add(bond);
    struct.bondInitHalfBonds(bondId, bond);
  }

  return atomIds;
};

const addAttachmentPoint = (
  struct: Struct,
  sgroupId: number,
  atomId: number,
  attachmentPointNumber: number,
) => {
  const sgroup = struct.sgroups.get(sgroupId);
  if (!sgroup) {
    return;
  }
  sgroup.addAttachmentPoint(
    new SGroupAttachmentPoint(
      atomId,
      undefined,
      undefined,
      attachmentPointNumber,
    ),
  );
};

describe('setExpandMonomerSGroup', () => {
  afterEach(() => {
    (getAttachmentPointStereoBond as jest.Mock).mockReset();
  });

  it('preserves explicit false expanded state when creating monomer S-groups', () => {
    const struct = new Struct();
    const monomer = new Peptide(peptideMonomerItem);
    monomer.monomerItem.expanded = true;
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const createSGroup = new SGroupCreate(
      0,
      SGroup.TYPES.SUP,
      new Vec2(0, 0),
      false,
      'A',
      undefined,
      monomer,
    );

    createSGroup.execute(restruct);

    expect(struct.sgroups.get(0)?.data.expanded).toBe(false);
    expect(monomer.monomerItem.expanded).toBe(false);
  });

  it('preserves stereo bonds when collapsing monomers', () => {
    const struct = new Struct();
    const atom1Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const bond = new Bond({
      begin: atom1Id,
      end: atom2Id,
      type: Bond.PATTERN.TYPE.SINGLE,
      stereo: Bond.PATTERN.STEREO.UP,
    });
    const bondId = struct.bonds.add(bond);
    struct.bondInitHalfBonds(bondId, bond);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, atom1Id);
    createMonomerSGroup(struct, atom2Id);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    setExpandMonomerSGroup(restruct, firstMonomerSGroupId, { expanded: false });

    expect(struct.bonds.get(bondId)?.stereo).toBe(Bond.PATTERN.STEREO.UP);
  });

  it('keeps stereo from expanded monomer when collapsing another', () => {
    const struct = new Struct();
    const atom1Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const bond = new Bond({
      begin: atom2Id,
      end: atom1Id,
      type: Bond.PATTERN.TYPE.SINGLE,
      stereo: Bond.PATTERN.STEREO.NONE,
    });
    const bondId = struct.bonds.add(bond);
    struct.bondInitHalfBonds(bondId, bond);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, atom1Id);
    const secondMonomerSGroupId = createMonomerSGroup(struct, atom2Id);
    addAttachmentPoint(struct, firstMonomerSGroupId, atom1Id, 1);
    addAttachmentPoint(struct, secondMonomerSGroupId, atom2Id, 1);

    const firstMonomerSGroup = struct.sgroups.get(firstMonomerSGroupId);
    const secondMonomerSGroup = struct.sgroups.get(secondMonomerSGroupId);
    const stereoBondMock = getAttachmentPointStereoBond as jest.Mock;
    stereoBondMock.mockImplementation((sgroup) => {
      if (sgroup === firstMonomerSGroup) {
        return Bond.PATTERN.STEREO.UP;
      }
      if (sgroup === secondMonomerSGroup) {
        return Bond.PATTERN.STEREO.DOWN;
      }
      return null;
    });

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    setExpandMonomerSGroup(restruct, firstMonomerSGroupId, { expanded: false });

    expect(struct.bonds.get(bondId)?.stereo).toBe(Bond.PATTERN.STEREO.DOWN);
  });

  describe('repositioning of the neighbour structures', () => {
    /*
     * Reproduces creating a monomer out of the middle of a plain chain: the
     * monomer covers atoms 2..4 plus a branch that makes it taller than the
     * chain, so its label is not centred between its attachment points.
     */
    const createChainWithMonomerInTheMiddle = () => {
      const struct = new Struct();
      const atomIds = createZigZagChain(struct, 8);
      const branchAtomId = struct.atoms.add(
        new Atom({ label: 'O', pp: new Vec2(2 * Math.cos(Math.PI / 6), -1.5) }),
      );
      const branchBond = new Bond({
        begin: atomIds[3],
        end: branchAtomId,
        type: Bond.PATTERN.TYPE.SINGLE,
      });
      const branchBondId = struct.bonds.add(branchBond);
      struct.bondInitHalfBonds(branchBondId, branchBond);
      struct.initNeighbors();

      const monomer = new Peptide(peptideMonomerItem);
      monomer.monomerItem.expanded = true;
      const sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
      const sgroupId = struct.sgroups.add(sgroup);
      sgroup.id = sgroupId;
      sgroup.data.expanded = true;
      [atomIds[2], atomIds[3], atomIds[4], branchAtomId].forEach((atomId) =>
        struct.atomAddToSGroup(sgroupId, atomId),
      );
      sgroup.pp = new Vec2(2 * Math.cos(Math.PI / 6), -0.5);
      addAttachmentPoint(struct, sgroupId, atomIds[2], 1);
      addAttachmentPoint(struct, sgroupId, atomIds[4], 2);

      return {
        struct,
        sgroup,
        sgroupId,
        // The two atoms outside the monomer that its bonds to outside reach.
        leftNeighbourId: atomIds[1],
        rightNeighbourId: atomIds[5],
        leftAttachmentId: atomIds[2],
        rightAttachmentId: atomIds[4],
        atomIds,
      };
    };

    it('keeps bonds to outside at their original length and angle when collapsing', () => {
      const {
        struct,
        sgroup,
        sgroupId,
        leftNeighbourId,
        rightNeighbourId,
        leftAttachmentId,
        rightAttachmentId,
      } = createChainWithMonomerInTheMiddle();
      const pairs = [
        [leftNeighbourId, leftAttachmentId],
        [rightNeighbourId, rightAttachmentId],
      ];
      // Bond vectors while expanded, measured from the attachment atom.
      const expandedBondVectors = pairs.map(([neighbourId, attachmentId]) =>
        Vec2.diff(
          struct.atoms.get(neighbourId)!.pp,
          struct.atoms.get(attachmentId)!.pp,
        ),
      );

      setExpandMonomerSGroup(createRestruct(struct), sgroupId, {
        expanded: false,
      });

      // Collapsed, the same bonds end on the label, so they are measured from it.
      pairs.forEach(([neighbourId], index) => {
        const collapsedBondVector = Vec2.diff(
          struct.atoms.get(neighbourId)!.pp,
          sgroup.getContractedPosition(struct).position,
        );

        expect(collapsedBondVector.x).toBeCloseTo(expandedBondVectors[index].x);
        expect(collapsedBondVector.y).toBeCloseTo(expandedBondVectors[index].y);
      });
    });

    describe('S-group bracket style actions', () => {
      const setup = () => {
        const struct = new Struct();
        const atoms = createZigZagChain(struct, 3);
        struct.initNeighbors();
        return { struct, atoms, restruct: createRestruct(struct) };
      };

      const geometry = (struct: Struct) => ({
        atoms: [...struct.atoms.values()].map(({ label, pp }) => ({
          label,
          x: pp.x,
          y: pp.y,
        })),
        bonds: [...struct.bonds.values()].map(({ begin, end, type }) => ({
          begin,
          end,
          type,
        })),
      });

      const onlyGroup = (struct: Struct) => {
        const groups = [...struct.sgroups.values()];
        expect(groups).toHaveLength(1);
        return groups[0];
      };

      it('invalidates stored positions when a member moves and restores them on undo', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
          bracketType: SGroupBracketType.Round,
        });
        const group = onlyGroup(struct);
        const brackets = {
          opening: {
            type: SGroupBracketType.Round,
            position: { start: { x: -1, y: -2 }, end: { x: -1, y: 2 } },
          },
          closing: {
            type: SGroupBracketType.Round,
            position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
          },
        };
        group.data.brackets = brackets;

        const undo = fromMultipleMove(
          restruct,
          { atoms: [atoms[0]] },
          new Vec2(1, 0),
        );
        expect(group.data.brackets).toEqual({
          opening: { type: SGroupBracketType.Round },
          closing: { type: SGroupBracketType.Round },
        });
        const redo = undo.perform(restruct);
        expect(group.data.brackets).toEqual(brackets);
        redo.perform(restruct);
        expect(group.data.brackets).toEqual({
          opening: { type: SGroupBracketType.Round },
          closing: { type: SGroupBracketType.Round },
        });
      });

      it('restores positions when several group atoms move in one action', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
          bracketType: SGroupBracketType.Round,
        });
        const group = onlyGroup(struct);
        const brackets = {
          opening: {
            type: SGroupBracketType.Round,
            position: { start: { x: -1, y: -2 }, end: { x: -1, y: 2 } },
          },
          closing: {
            type: SGroupBracketType.Round,
            position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
          },
        };
        group.data.brackets = brackets;

        const undo = fromMultipleMove(restruct, { atoms }, new Vec2(2, 1));
        expect(group.data.brackets?.opening.position).toBeUndefined();
        const redo = undo.perform(restruct);
        expect(group.data.brackets).toEqual(brackets);
        redo.perform(restruct);
        expect(group.data.brackets?.closing.position).toBeUndefined();
      });

      it('keeps positions when an unrelated atom or a zero-distance move is used', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(
          restruct,
          SGroup.TYPES.MUL,
          atoms.slice(0, 2),
          { mul: 3 },
        );
        const group = onlyGroup(struct);
        const brackets = {
          opening: {
            position: { start: { x: -1, y: -2 }, end: { x: -1, y: 2 } },
          },
          closing: {
            position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
          },
        };
        group.data.brackets = brackets;

        fromMultipleMove(restruct, { atoms: [atoms[0]] }, new Vec2(0, 0));
        fromMultipleMove(restruct, { atoms: [atoms[2]] }, new Vec2(1, 0));

        expect(group.data.brackets).toEqual(brackets);
      });

      it.each(['add', 'remove'])(
        'invalidates positions after membership %s and restores them on undo',
        (change) => {
          const { struct, atoms, restruct } = setup();
          fromSeveralSgroupAddition(
            restruct,
            SGroup.TYPES.MUL,
            atoms.slice(0, 2),
            { mul: 3, bracketType: SGroupBracketType.Curly },
          );
          const group = onlyGroup(struct);
          const brackets = {
            opening: {
              type: SGroupBracketType.Curly,
              position: { start: { x: 1, y: 1 }, end: { x: 1, y: 1 } },
            },
            closing: {
              type: SGroupBracketType.Curly,
              position: { start: { x: 3, y: 0 }, end: { x: 3, y: 1 } },
            },
          };
          group.data.brackets = brackets;
          const operation =
            change === 'add'
              ? new SGroupAtomAdd(group.id, atoms[2])
              : new SGroupAtomRemove(group.id, atoms[1]);

          const undo = new Action([operation]).perform(restruct);
          expect(group.data.brackets).toEqual({
            opening: { type: SGroupBracketType.Curly },
            closing: { type: SGroupBracketType.Curly },
          });
          const redo = undo.perform(restruct);
          expect(group.data.brackets).toEqual(brackets);
          redo.perform(restruct);
          expect(group.data.brackets).toEqual({
            opening: { type: SGroupBracketType.Curly },
            closing: { type: SGroupBracketType.Curly },
          });
        },
      );

      it('restores stored positions when an entire S-group is deleted and undone', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
          bracketType: SGroupBracketType.Round,
        });
        const group = onlyGroup(struct);
        const brackets = {
          opening: {
            type: SGroupBracketType.Round,
            position: { start: { x: -1, y: -2 }, end: { x: -1, y: 2 } },
          },
          closing: {
            type: SGroupBracketType.Round,
            position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
          },
        };
        group.data.brackets = brackets;

        const undo = fromSgroupDeletion(restruct, group.id);
        expect(struct.sgroups.size).toBe(0);
        const redo = undo.perform(restruct);
        expect(onlyGroup(struct).data.brackets).toEqual(brackets);
        const secondUndo = redo.perform(restruct);
        expect(struct.sgroups.size).toBe(0);
        secondUndo.perform(restruct);
        expect(onlyGroup(struct).data.brackets).toEqual(brackets);
      });

      it('creates a styled group and restores it through undo and redo', () => {
        const { struct, atoms, restruct } = setup();
        const originalGeometry = geometry(struct);
        const undo = fromSeveralSgroupAddition(
          restruct,
          SGroup.TYPES.MUL,
          atoms,
          {
            mul: 3,
            bracketType: SGroupBracketType.Curly,
          },
        );

        expect(onlyGroup(struct)).toEqual(
          expect.objectContaining({
            atoms,
            data: expect.objectContaining({
              mul: 3,
              bracketType: SGroupBracketType.Curly,
            }),
          }),
        );
        const redo = undo.perform(restruct);
        expect(struct.sgroups.size).toBe(0);
        redo.perform(restruct);

        expect(onlyGroup(struct).getAttrs()).toEqual(
          expect.objectContaining({
            mul: 3,
            bracketType: SGroupBracketType.Curly,
          }),
        );
        expect(onlyGroup(struct).atoms).toEqual(atoms);
        expect(geometry(struct)).toEqual(originalGeometry);
      });

      it('undoes and redoes style edits without changing membership or other attributes', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
          bracketType: SGroupBracketType.Round,
        });
        const originalGeometry = geometry(struct);
        const group = onlyGroup(struct);
        const originalAttributes = group.getAttrs();

        const undo = fromSgroupAttrs(restruct, group.id, {
          bracketType: SGroupBracketType.Curly,
        });
        expect(group.getAttrs()).toEqual({
          ...originalAttributes,
          bracketType: SGroupBracketType.Curly,
          brackets: {
            opening: { type: SGroupBracketType.Curly },
            closing: { type: SGroupBracketType.Curly },
          },
        });
        const redo = undo.perform(restruct);
        expect(group.getAttrs()).toEqual(originalAttributes);
        redo.perform(restruct);

        expect(group.getAttrs()).toEqual({
          ...originalAttributes,
          bracketType: SGroupBracketType.Curly,
          brackets: {
            opening: { type: SGroupBracketType.Curly },
            closing: { type: SGroupBracketType.Curly },
          },
        });
        expect(group.atoms).toEqual(atoms);
        expect(geometry(struct)).toEqual(originalGeometry);
      });

      it('restores an absent bracket pair after undoing a style edit', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
        });
        const group = onlyGroup(struct);
        expect(group.data.brackets).toBeUndefined();

        const undo = fromSgroupAttrs(restruct, group.id, {
          bracketType: SGroupBracketType.Round,
        });
        expect(group.data.brackets).toEqual({
          opening: { type: SGroupBracketType.Round },
          closing: { type: SGroupBracketType.Round },
        });

        const redo = undo.perform(restruct);
        expect(group.data.brackets).toBeUndefined();
        redo.perform(restruct);
        expect(group.data.brackets).toEqual({
          opening: { type: SGroupBracketType.Round },
          closing: { type: SGroupBracketType.Round },
        });
      });

      it('restores omitted square types and positions after undoing a style edit', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
        });
        const group = onlyGroup(struct);
        const brackets = {
          opening: {
            position: { start: { x: -1, y: -2 }, end: { x: -1, y: 2 } },
          },
          closing: {
            type: SGroupBracketType.Square,
            position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
          },
        };
        group.data.brackets = brackets;

        const undo = fromSgroupAttrs(restruct, group.id, {
          bracketType: SGroupBracketType.Curly,
        });
        const changed = {
          opening: { ...brackets.opening, type: SGroupBracketType.Curly },
          closing: { ...brackets.closing, type: SGroupBracketType.Curly },
        };
        expect(group.data.brackets).toEqual(changed);
        const redo = undo.perform(restruct);
        expect(group.data.brackets).toEqual(brackets);
        redo.perform(restruct);
        expect(group.data.brackets).toEqual(changed);
      });

      it('restores styles and unrelated fields when a group replacement is undone and redone', () => {
        const { struct, atoms, restruct } = setup();
        fromSeveralSgroupAddition(restruct, SGroup.TYPES.MUL, atoms, {
          mul: 3,
          bracketType: SGroupBracketType.Round,
        });
        const originalGeometry = geometry(struct);
        const oldGroup = onlyGroup(struct);
        const oldAttributes = oldGroup.getAttrs();
        const undo = fromSeveralSgroupAddition(
          restruct,
          SGroup.TYPES.MUL,
          atoms,
          { ...oldAttributes, mul: 4, bracketType: SGroupBracketType.Curly },
        ).mergeWith(fromSgroupDeletion(restruct, oldGroup.id));

        const replacementAttributes = onlyGroup(struct).getAttrs();
        expect(replacementAttributes).toEqual({
          ...oldAttributes,
          mul: 4,
          bracketType: SGroupBracketType.Curly,
          brackets: {
            opening: { type: SGroupBracketType.Curly },
            closing: { type: SGroupBracketType.Curly },
          },
        });
        const redo = undo.perform(restruct);
        expect(onlyGroup(struct).getAttrs()).toEqual(oldAttributes);
        expect(onlyGroup(struct).atoms).toEqual(atoms);
        redo.perform(restruct);

        expect(onlyGroup(struct).getAttrs()).toEqual(replacementAttributes);
        expect(onlyGroup(struct).atoms).toEqual(atoms);
        expect(geometry(struct)).toEqual(originalGeometry);
      });
    });

    it('restores the original positions when expanding back', () => {
      const { struct, sgroupId, atomIds } = createChainWithMonomerInTheMiddle();
      const positionsBefore = atomIds.map(
        (atomId) => new Vec2(struct.atoms.get(atomId)!.pp),
      );

      setExpandMonomerSGroup(createRestruct(struct), sgroupId, {
        expanded: false,
      });
      setExpandMonomerSGroup(createRestruct(struct), sgroupId, {
        expanded: true,
      });

      atomIds.forEach((atomId, index) => {
        expect(struct.atoms.get(atomId)!.pp.x).toBeCloseTo(
          positionsBefore[index].x,
        );
        expect(struct.atoms.get(atomId)!.pp.y).toBeCloseTo(
          positionsBefore[index].y,
        );
      });
    });

    it('moves the whole outside fragment as one piece', () => {
      const { struct, sgroupId, atomIds } = createChainWithMonomerInTheMiddle();
      const outsideFragment = [atomIds[5], atomIds[6], atomIds[7]];
      const positionsBefore = outsideFragment.map(
        (atomId) => new Vec2(struct.atoms.get(atomId)!.pp),
      );

      setExpandMonomerSGroup(createRestruct(struct), sgroupId, {
        expanded: false,
      });

      const shifts = outsideFragment.map((atomId, index) =>
        Vec2.diff(struct.atoms.get(atomId)!.pp, positionsBefore[index]),
      );
      shifts.forEach((shift) => {
        expect(shift.x).toBeCloseTo(shifts[0].x);
        expect(shift.y).toBeCloseTo(shifts[0].y);
      });
    });
  });

  it('keeps connected monomers in one fragment after removing abbreviations', () => {
    const struct = new Struct();
    const atom1Id = struct.atoms.add(
      new Atom({ label: 'P', pp: new Vec2(0, 0) }),
    );
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'P', pp: new Vec2(1, 0) }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: atom1Id,
        end: atom2Id,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    struct.bondInitHalfBonds(bondId);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, atom1Id);
    const secondMonomerSGroupId = createMonomerSGroup(struct, atom2Id);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    fromSgroupDeletion(restruct, firstMonomerSGroupId);
    fromSgroupDeletion(restruct, secondMonomerSGroupId);

    expect(struct.atoms.get(atom1Id)?.fragment).toBe(
      struct.atoms.get(atom2Id)?.fragment,
    );

    const moleculeNodes = prepareStructForKet(struct).filter(
      (item) => item.type === 'molecule',
    );

    expect(moleculeNodes).toHaveLength(1);
    expect(moleculeNodes[0].fragment?.atoms.size).toBe(2);
    expect(moleculeNodes[0].fragment?.bonds.size).toBe(1);
  });

  it('keeps the connected monomer intact when removing grouping is undone', () => {
    const struct = new Struct();
    const atom1Id = struct.atoms.add(
      new Atom({ label: 'P', pp: new Vec2(0, 0) }),
    );
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'P', pp: new Vec2(1, 0) }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: atom1Id,
        end: atom2Id,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    struct.bondInitHalfBonds(bondId);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, atom1Id);
    const secondMonomerSGroupId = createMonomerSGroup(struct, atom2Id);
    const restruct = createRestruct(struct);

    const undoAction = fromSgroupDeletion(restruct, firstMonomerSGroupId);
    undoAction.perform(restruct);

    expect(struct.sgroups.get(secondMonomerSGroupId)?.atoms).toEqual([atom2Id]);
    expect(struct.getGroupFromAtomId(atom2Id)?.id).toBe(secondMonomerSGroupId);
    expect(struct.getGroupFromAtomId(atom1Id)).toBeInstanceOf(
      MonomerMicromolecule,
    );
    expect(struct.frags.has(-1)).toBe(false);
  });
});
