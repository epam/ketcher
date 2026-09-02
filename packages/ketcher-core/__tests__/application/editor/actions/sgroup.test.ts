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

  it('preserves atom positions when collapsing a monomer', () => {
    const struct = new Struct();
    const firstMonomerAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondMonomerAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const outsideAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(2, 1) }),
    );
    const internalBond = new Bond({
      begin: firstMonomerAtomId,
      end: secondMonomerAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const internalBondId = struct.bonds.add(internalBond);
    const connectingBond = new Bond({
      begin: secondMonomerAtomId,
      end: outsideAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const connectingBondId = struct.bonds.add(connectingBond);
    struct.bondInitHalfBonds(internalBondId, internalBond);
    struct.bondInitHalfBonds(connectingBondId, connectingBond);
    struct.initNeighbors();

    const monomerSGroupId = createMonomerSGroup(struct, firstMonomerAtomId);
    struct.atomAddToSGroup(monomerSGroupId, secondMonomerAtomId);
    addAttachmentPoint(struct, monomerSGroupId, firstMonomerAtomId, 1);
    addAttachmentPoint(struct, monomerSGroupId, secondMonomerAtomId, 2);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const positionsBeforeCollapse = [...struct.atoms.values()].map(
      (atom) => new Vec2(atom.pp),
    );

    setExpandMonomerSGroup(restruct, monomerSGroupId, { expanded: false });

    expect([...struct.atoms.values()].map((atom) => atom.pp)).toEqual(
      positionsBeforeCollapse,
    );
    expect(
      struct.sgroups.get(monomerSGroupId)?.getContractedPosition(struct)
        .position,
    ).toEqual(struct.atoms.get(secondMonomerAtomId)?.pp);

    setExpandMonomerSGroup(restruct, monomerSGroupId, { expanded: true });

    expect([...struct.atoms.values()].map((atom) => atom.pp)).toEqual(
      positionsBeforeCollapse,
    );
  });

  it('keeps expansion spacing stable across undo and repeated toggles', () => {
    const struct = new Struct();
    const firstMonomerAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondMonomerAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const outsideAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(2, 0) }),
    );
    const internalBond = new Bond({
      begin: firstMonomerAtomId,
      end: secondMonomerAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const internalBondId = struct.bonds.add(internalBond);
    const connectingBond = new Bond({
      begin: secondMonomerAtomId,
      end: outsideAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const connectingBondId = struct.bonds.add(connectingBond);
    struct.bondInitHalfBonds(internalBondId, internalBond);
    struct.bondInitHalfBonds(connectingBondId, connectingBond);
    struct.initNeighbors();

    const monomerSGroupId = createMonomerSGroup(struct, firstMonomerAtomId);
    struct.atomAddToSGroup(monomerSGroupId, secondMonomerAtomId);
    addAttachmentPoint(struct, monomerSGroupId, secondMonomerAtomId, 1);
    const monomerSGroup = struct.sgroups.get(monomerSGroupId);
    const firstMonomerAtom = struct.atoms.get(firstMonomerAtomId);
    const secondMonomerAtom = struct.atoms.get(secondMonomerAtomId);
    const outsideAtom = struct.atoms.get(outsideAtomId);
    if (
      !monomerSGroup ||
      !firstMonomerAtom ||
      !secondMonomerAtom ||
      !outsideAtom
    ) {
      throw new Error('Expected the test structure to be initialized');
    }
    monomerSGroup.data.expanded = false;

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const monomerPositionsBeforeExpansion = [
      new Vec2(firstMonomerAtom.pp),
      new Vec2(secondMonomerAtom.pp),
    ];
    const outsidePositionBeforeExpansion = new Vec2(outsideAtom.pp);

    const undo = setExpandMonomerSGroup(restruct, monomerSGroupId, {
      expanded: true,
    });

    expect(struct.atoms.get(outsideAtomId)?.pp).toEqual(new Vec2(2.5, 0));
    expect([
      struct.atoms.get(firstMonomerAtomId)?.pp,
      struct.atoms.get(secondMonomerAtomId)?.pp,
    ]).toEqual(monomerPositionsBeforeExpansion);

    undo.perform(restruct);

    expect(struct.atoms.get(outsideAtomId)?.pp).toEqual(
      outsidePositionBeforeExpansion,
    );
    expect(monomerSGroup?.isContracted()).toBe(true);

    setExpandMonomerSGroup(restruct, monomerSGroupId, { expanded: true });
    const positionAfterFirstExpansion = new Vec2(outsideAtom.pp);
    setExpandMonomerSGroup(restruct, monomerSGroupId, { expanded: false });

    expect(outsideAtom.pp).toEqual(positionAfterFirstExpansion);

    setExpandMonomerSGroup(restruct, monomerSGroupId, { expanded: true });

    expect(outsideAtom.pp).toEqual(positionAfterFirstExpansion);
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
