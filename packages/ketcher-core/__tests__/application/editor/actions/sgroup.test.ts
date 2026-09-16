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

  it('restores monomer geometry after a contracted label is moved', () => {
    const struct = new Struct();
    const monomerSGroupIds: number[] = [];
    const atomIds: number[] = [];

    [0, 3, 6].forEach((x) => {
      const firstAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(x, 0) }),
      );
      const secondAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(x + 1, 0) }),
      );
      const monomer = new Peptide(peptideMonomerItem);
      monomer.monomerItem.expanded = true;
      const sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
      const sgroupId = struct.sgroups.add(sgroup);
      sgroup.id = sgroupId;
      sgroup.data.expanded = true;
      sgroup.pp = new Vec2(x + 0.5, 0);
      struct.atomAddToSGroup(sgroupId, firstAtomId);
      struct.atomAddToSGroup(sgroupId, secondAtomId);
      addAttachmentPoint(struct, sgroupId, firstAtomId, 1);
      addAttachmentPoint(struct, sgroupId, secondAtomId, 2);
      monomerSGroupIds.push(sgroupId);
      atomIds.push(firstAtomId, secondAtomId);
    });

    for (let index = 0; index < atomIds.length - 1; index += 2) {
      const bond = new Bond({
        begin: atomIds[index],
        end: atomIds[index + 1],
        type: Bond.PATTERN.TYPE.SINGLE,
      });
      const bondId = struct.bonds.add(bond);
      struct.bondInitHalfBonds(bondId, bond);
    }
    [
      [atomIds[1], atomIds[2]],
      [atomIds[3], atomIds[4]],
    ].forEach(([begin, end]) => {
      const bond = new Bond({
        begin,
        end,
        type: Bond.PATTERN.TYPE.SINGLE,
      });
      const bondId = struct.bonds.add(bond);
      struct.bondInitHalfBonds(bondId, bond);
    });
    struct.initNeighbors();

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const initialPositions = atomIds.map((atomId) => {
      const atom = struct.atoms.get(atomId);
      if (!atom) {
        throw new Error(`Atom ${atomId} is not found`);
      }
      return new Vec2(atom.pp);
    });

    monomerSGroupIds.forEach((sgroupId) => {
      setExpandMonomerSGroup(restruct, sgroupId, { expanded: false });
    });
    struct.sgroups.get(monomerSGroupIds[1])?.pp?.add_(new Vec2(0, 4));
    monomerSGroupIds.forEach((sgroupId) => {
      setExpandMonomerSGroup(restruct, sgroupId, { expanded: true });
    });

    atomIds.forEach((atomId, index) => {
      expect(struct.atoms.get(atomId)?.pp.x).toBeCloseTo(
        initialPositions[index].x,
      );
      expect(struct.atoms.get(atomId)?.pp.y).toBeCloseTo(
        initialPositions[index].y,
      );
    });
  });
});
