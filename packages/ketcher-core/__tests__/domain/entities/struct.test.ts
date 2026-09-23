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
  Atom,
  Bond,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Peptide } from 'domain/entities/Peptide';
import { getAttachmentPointStereoBond } from 'domain/helpers/getAttachmentPointStereoBond';
import { peptideMonomerItem } from '../../mock-data';

jest.mock('domain/helpers/getAttachmentPointStereoBond', () => ({
  getAttachmentPointStereoBond: jest.fn(),
}));

const createExpandedMonomerSGroup = (struct: Struct, atomId: number) => {
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
  leaveAtomId?: number,
) => {
  struct.sgroups
    .get(sgroupId)
    ?.addAttachmentPoint(
      new SGroupAttachmentPoint(
        atomId,
        leaveAtomId,
        undefined,
        attachmentPointNumber,
      ),
    );
};

describe('applyStereoBondsToExpandedMonomers', () => {
  afterEach(() => {
    (getAttachmentPointStereoBond as jest.Mock).mockReset();
  });

  it('draws the opposite stereo bond on the second attachment point of a chiral phosphate', () => {
    const struct = new Struct();
    const phosphorusId = struct.atoms.add(
      new Atom({ label: 'P', pp: new Vec2(0, 0) }),
    );
    const leftNeighborId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(-1, 0) }),
    );
    const rightNeighborId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(1, 0) }),
    );
    const firstBondId = struct.bonds.add(
      new Bond({
        begin: leftNeighborId,
        end: phosphorusId,
        type: Bond.PATTERN.TYPE.SINGLE,
        beginSuperatomAttachmentPointNumber: 1,
        endSuperatomAttachmentPointNumber: 1,
      }),
    );
    const secondBondId = struct.bonds.add(
      new Bond({
        begin: rightNeighborId,
        end: phosphorusId,
        type: Bond.PATTERN.TYPE.SINGLE,
        beginSuperatomAttachmentPointNumber: 1,
        endSuperatomAttachmentPointNumber: 2,
      }),
    );
    struct.bondInitHalfBonds(firstBondId);
    struct.bondInitHalfBonds(secondBondId);
    struct.initNeighbors();

    const phosphateSGroupId = createExpandedMonomerSGroup(struct, phosphorusId);
    const leftMonomerSGroupId = createExpandedMonomerSGroup(
      struct,
      leftNeighborId,
    );
    const rightMonomerSGroupId = createExpandedMonomerSGroup(
      struct,
      rightNeighborId,
    );
    // Both attachment points of a chiral phosphate sit on the phosphorus
    addAttachmentPoint(struct, phosphateSGroupId, phosphorusId, 1, 1);
    addAttachmentPoint(struct, phosphateSGroupId, phosphorusId, 2, 2);
    addAttachmentPoint(struct, leftMonomerSGroupId, leftNeighborId, 1);
    addAttachmentPoint(struct, rightMonomerSGroupId, rightNeighborId, 1);

    const phosphateSGroup = struct.sgroups.get(phosphateSGroupId);
    (getAttachmentPointStereoBond as jest.Mock).mockImplementation(
      (sgroup, attachmentPoint) =>
        sgroup === phosphateSGroup &&
        attachmentPoint.attachmentPointNumber === 1
          ? Bond.PATTERN.STEREO.UP
          : null,
    );

    struct.applyStereoBondsToExpandedMonomers();

    // Both bonds are flipped so that their narrow end sits at the phosphorus
    const getBond = (neighborId: number) => {
      const bondId = struct.findBondId(phosphorusId, neighborId);
      return bondId === null ? undefined : struct.bonds.get(bondId);
    };
    const firstAttachmentPointBond = getBond(leftNeighborId);
    const secondAttachmentPointBond = getBond(rightNeighborId);

    expect(firstAttachmentPointBond?.stereo).toBe(Bond.PATTERN.STEREO.UP);
    expect(firstAttachmentPointBond?.begin).toBe(phosphorusId);
    expect(secondAttachmentPointBond?.stereo).toBe(Bond.PATTERN.STEREO.DOWN);
    expect(secondAttachmentPointBond?.begin).toBe(phosphorusId);
  });
});
