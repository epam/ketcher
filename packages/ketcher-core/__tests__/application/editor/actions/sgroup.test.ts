/****************************************************************************
 * Copyright 2025 EPAM Systems
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
  fromSgroupDeletion,
  setExpandMonomerSGroup,
} from 'application/editor/actions/sgroup';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  Bond,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { prepareStructForKet } from 'domain/serializers/ket/toKet/prepare';
import { Peptide } from 'domain/entities/Peptide';
import { getAttachmentPointStereoBond } from 'domain/helpers/getAttachmentPointStereoBond';
import { peptideMonomerItem } from '../../../mock-data';
import { SGroupCreate } from 'application/editor/operations/sgroup';

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
});

describe('setExpandMonomerSGroup for functional groups', () => {
  const createStructWithFunctionalGroup = (
    outsideAtomPositions: [Vec2, Vec2],
    expanded: boolean,
    withAttachmentPoint = true,
  ) => {
    const struct = new Struct();
    const addAtom = (label: string, pp: Vec2) =>
      struct.atoms.add(new Atom({ label, pp, fragment: 0 }));
    const addBond = (begin: number, end: number) => {
      const bond = new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE });
      const bondId = struct.bonds.add(bond);
      struct.bondInitHalfBonds(bondId, bond);
    };

    const outsideAtomIds = outsideAtomPositions.map((pp) => addAtom('C', pp));
    const attachmentAtomId = addAtom('C', new Vec2(1.866, -0.5));
    const groupAtomIds = [attachmentAtomId, addAtom('O', new Vec2(2.732, 0))];
    addBond(outsideAtomIds[0], outsideAtomIds[1]);
    addBond(outsideAtomIds[1], attachmentAtomId);
    addBond(groupAtomIds[0], groupAtomIds[1]);
    struct.initNeighbors();

    const sgroup = new SGroup(SGroup.TYPES.SUP);
    const sgroupId = struct.sgroups.add(sgroup);
    sgroup.id = sgroupId;
    sgroup.data.name = 'FG';
    sgroup.data.expanded = expanded;
    groupAtomIds.forEach((atomId) => struct.atomAddToSGroup(sgroupId, atomId));
    if (withAttachmentPoint) {
      sgroup.addAttachmentPoint(
        new SGroupAttachmentPoint(attachmentAtomId, undefined, undefined),
      );
    }

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    const getPositions = (atomIds: number[]) =>
      atomIds.map(
        (atomId) => new Vec2(struct.atoms.get(atomId)?.pp ?? new Vec2()),
      );
    const getOutsidePositions = () => getPositions(outsideAtomIds);
    const getGroupPositions = () => getPositions(groupAtomIds);

    return {
      restruct,
      struct,
      sgroupId,
      getOutsidePositions,
      getGroupPositions,
    };
  };

  it('keeps an attached structure in place when it does not collide with the expanded group', () => {
    const { restruct, struct, sgroupId, getOutsidePositions } =
      createStructWithFunctionalGroup([new Vec2(0, 0), new Vec2(1, 0)], false);
    const positionsBefore = getOutsidePositions();

    setExpandMonomerSGroup(restruct, sgroupId, { expanded: true });

    expect(struct.sgroups.get(sgroupId)?.isExpanded()).toBe(true);
    expect(getOutsidePositions()).toEqual(positionsBefore);
  });

  it('moves an attached structure away when it collides with the expanded group', () => {
    const { restruct, sgroupId, getOutsidePositions } =
      createStructWithFunctionalGroup(
        [new Vec2(2.7, 0.1), new Vec2(1, 0)],
        false,
      );
    const positionsBefore = getOutsidePositions();

    setExpandMonomerSGroup(restruct, sgroupId, { expanded: true });

    expect(getOutsidePositions()).not.toEqual(positionsBefore);
  });

  it('keeps an attached structure in place when contracting the group', () => {
    const { restruct, struct, sgroupId, getOutsidePositions } =
      createStructWithFunctionalGroup([new Vec2(0, 0), new Vec2(1, 0)], true);
    const positionsBefore = getOutsidePositions();

    setExpandMonomerSGroup(restruct, sgroupId, { expanded: false });

    expect(struct.sgroups.get(sgroupId)?.isExpanded()).toBe(false);
    expect(getOutsidePositions()).toEqual(positionsBefore);
  });

  it('keeps all atoms in place when expanding a superatom without attachment points', () => {
    const { restruct, sgroupId, getOutsidePositions, getGroupPositions } =
      createStructWithFunctionalGroup(
        [new Vec2(0, 0), new Vec2(1, 0)],
        false,
        false,
      );
    const outsidePositionsBefore = getOutsidePositions();
    const groupPositionsBefore = getGroupPositions();

    setExpandMonomerSGroup(restruct, sgroupId, { expanded: true });

    expect(getOutsidePositions()).toEqual(outsidePositionsBefore);
    expect(getGroupPositions()).toEqual(groupPositionsBefore);
  });
});
