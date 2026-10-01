/****************************************************************************
 * Copyright 2021 EPAM Systems
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
  type IKetConnection,
  type IKetConnectionEndPoint,
  KetConnectionType,
} from 'application/formatters/types/ket';
import { Bond, Pile, type Struct } from 'domain/entities';
import { isAllowedNonAttachmentGroupHapticBondMetal } from 'domain/helpers/hapticBond';
import type {
  AttachmentGroupLocation,
  KetAtomLocation,
  KetMolecule,
} from '../hapticKet.types';

function hasAttachmentGroupsOrHapticBonds(struct: Struct) {
  return (
    struct.attachmentGroups.size > 0 ||
    struct.bonds.some((bond) => bond.type === Bond.PATTERN.TYPE.HAPTIC)
  );
}

export function prepareStructForHapticKetSerialization(struct: Struct) {
  if (!hasAttachmentGroupsOrHapticBonds(struct)) {
    return {
      structForKet: struct,
      originalToKetStructAtomIdMap: new Map<number, number>(),
    };
  }

  const bondIds = new Pile<number>();
  const originalToKetStructAtomIdMap = new Map<number, number>();

  struct.bonds.forEach((bond, bondId) => {
    if (bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
      bondIds.add(bondId);
    }
  });

  const structForKet = struct.clone(
    null,
    bondIds,
    false,
    originalToKetStructAtomIdMap,
  );
  structForKet.clearFragments();
  structForKet.markFragments();

  return { structForKet, originalToKetStructAtomIdMap };
}

function getOrCreateAttachmentGroup(molecule: KetMolecule, atoms: number[]) {
  molecule.attachmentGroups ??= [];

  const existingAttachmentGroup = molecule.attachmentGroups.find((group) => {
    return (
      group.atoms.length === atoms.length &&
      group.atoms.every((atomId, index) => atomId === atoms[index])
    );
  });

  if (existingAttachmentGroup) {
    return existingAttachmentGroup.id;
  }

  const attachmentGroupId = molecule.attachmentGroups.length.toString();
  molecule.attachmentGroups.push({
    id: attachmentGroupId,
    atoms,
  });

  return attachmentGroupId;
}

export function buildAttachmentGroupsForKet(
  struct: Struct,
  fileContent: Record<string, unknown>,
  originalAtomToKetLocation: Map<number, KetAtomLocation>,
) {
  const attachmentGroupLocations = new Map<number, AttachmentGroupLocation>();

  struct.attachmentGroups.forEach((attachmentGroup, attachmentGroupId) => {
    if (attachmentGroup.atomIds.length < 2) {
      return;
    }

    const attachmentAtomLocations = attachmentGroup.atomIds.map(
      (endpointAtomId) => originalAtomToKetLocation.get(endpointAtomId),
    );
    const moleculeId = attachmentAtomLocations[0]?.moleculeId;

    if (
      !moleculeId ||
      !attachmentAtomLocations.every(
        (location) => location?.moleculeId === moleculeId,
      )
    ) {
      return;
    }

    const molecule = fileContent[moleculeId];
    if (typeof molecule !== 'object' || molecule === null) {
      return;
    }

    const ketAttachmentGroupId = getOrCreateAttachmentGroup(
      molecule as KetMolecule,
      attachmentAtomLocations.map((location) => Number(location?.atomId)),
    );
    attachmentGroupLocations.set(attachmentGroupId, {
      moleculeId,
      attachmentGroupId: ketAttachmentGroupId,
    });
  });

  return attachmentGroupLocations;
}

export function buildHapticConnectionsForKet(
  struct: Struct,
  originalAtomToKetLocation: Map<number, KetAtomLocation>,
  attachmentGroupLocations: Map<number, AttachmentGroupLocation>,
) {
  const connections: IKetConnection[] = [];

  struct.bonds.forEach((bond) => {
    if (bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
      return;
    }

    const beginAtom = struct.atoms.get(bond.begin);
    const endAtom = struct.atoms.get(bond.end);
    const beginIsAttachmentGroup = struct.attachmentGroups.has(bond.begin);
    const endIsAttachmentGroup = struct.attachmentGroups.has(bond.end);

    if (beginIsAttachmentGroup || endIsAttachmentGroup) {
      if (beginIsAttachmentGroup === endIsAttachmentGroup) return;
      const attachmentGroupId = beginIsAttachmentGroup ? bond.begin : bond.end;
      const centralAtomId = beginIsAttachmentGroup ? bond.end : bond.begin;
      const attachmentGroupLocation =
        attachmentGroupLocations.get(attachmentGroupId);
      const centralAtomLocation = originalAtomToKetLocation.get(centralAtomId);

      if (!centralAtomLocation || !attachmentGroupLocation) {
        return;
      }

      connections.push({
        type: KetConnectionType.HAPTIC,
        endpoint1: {
          moleculeId: centralAtomLocation.moleculeId,
          atomId: centralAtomLocation.atomId,
        } as IKetConnectionEndPoint,
        endpoint2: {
          moleculeId: attachmentGroupLocation.moleculeId,
          attachmentGroupId: attachmentGroupLocation.attachmentGroupId,
        } as IKetConnectionEndPoint,
      });

      return;
    }

    const beginAtomLocation = originalAtomToKetLocation.get(bond.begin);
    const endAtomLocation = originalAtomToKetLocation.get(bond.end);

    if (!beginAtomLocation || !endAtomLocation) {
      return;
    }

    const beginAtomIsMetal =
      isAllowedNonAttachmentGroupHapticBondMetal(beginAtom);
    const endAtomIsMetal = isAllowedNonAttachmentGroupHapticBondMetal(endAtom);
    const endpoint1 =
      !beginAtomIsMetal && endAtomIsMetal ? endAtomLocation : beginAtomLocation;
    const endpoint2 =
      !beginAtomIsMetal && endAtomIsMetal ? beginAtomLocation : endAtomLocation;

    connections.push({
      type: KetConnectionType.HAPTIC,
      endpoint1: {
        moleculeId: endpoint1.moleculeId,
        atomId: endpoint1.atomId,
      } as IKetConnectionEndPoint,
      endpoint2: {
        moleculeId: endpoint2.moleculeId,
        atomId: endpoint2.atomId,
      } as IKetConnectionEndPoint,
    });
  });

  return connections;
}
