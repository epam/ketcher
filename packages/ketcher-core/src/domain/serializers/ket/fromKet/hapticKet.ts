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
import { AttachmentGroup, Bond, type Struct, Vec2 } from 'domain/entities';
import { getConnectionType } from '../hapticKetConnection';
import type {
  HapticConnectionEndpoint,
  HapticKet,
  KetMolecule,
} from '../hapticKet.types';
import { moleculeToStruct } from './moleculeToStruct';

function getAttachmentGroupKey(moleculeId: string, attachmentGroupId: string) {
  return `${moleculeId}:${attachmentGroupId}`;
}

function getKetMolecule(ket: HapticKet, moleculeId: string) {
  const molecule = ket[moleculeId];

  return typeof molecule === 'object' && molecule !== null
    ? (molecule as KetMolecule)
    : undefined;
}

export function parseMoleculeNode(
  node: KetMolecule,
  resultingStruct: Struct,
  moleculeId: string,
  moleculeAtomIdMaps: Map<string, Map<number, number>>,
) {
  if (moleculeAtomIdMaps.has(moleculeId)) {
    return;
  }

  const currentStruct = moleculeToStruct(node);
  if (node.stereoFlagPosition) {
    const fragment = currentStruct.frags.get(0);
    if (fragment) {
      fragment.stereoFlagPosition = new Vec2(node.stereoFlagPosition);
    }
  }

  const atomIdMap = new Map<number, number>();
  currentStruct.mergeInto(resultingStruct, null, null, false, false, atomIdMap);
  moleculeAtomIdMaps.set(moleculeId, atomIdMap);
}

export function getHapticConnectionMoleculeIds(
  connection: IKetConnection,
): string[] {
  const moleculeIds = [
    connection.endpoint1.moleculeId,
    connection.endpoint2.moleculeId,
  ];

  return moleculeIds.filter((moleculeId): moleculeId is string =>
    Boolean(moleculeId),
  );
}

function resolveHapticConnectionEndpoint(
  endpoint: IKetConnectionEndPoint,
  moleculeAtomIdMaps: Map<string, Map<number, number>>,
  attachmentGroupEntityIdMap: Map<string, number>,
  struct: Struct,
): HapticConnectionEndpoint | null {
  const moleculeId = endpoint.moleculeId;
  if (!moleculeId) {
    return null;
  }

  const atomIdMap = moleculeAtomIdMaps.get(moleculeId);
  if (!atomIdMap) {
    return null;
  }

  if (endpoint.atomId !== undefined) {
    const atomId = atomIdMap.get(Number(endpoint.atomId));

    return atomId === undefined
      ? null
      : {
          type: 'atom',
          moleculeId,
          atomId,
        };
  }

  if (endpoint.attachmentGroupId !== undefined) {
    const attachmentGroupId = endpoint.attachmentGroupId.toString();
    const attachmentGroupEntityId = attachmentGroupEntityIdMap.get(
      getAttachmentGroupKey(moleculeId, attachmentGroupId),
    );
    const atomIds =
      attachmentGroupEntityId === undefined
        ? undefined
        : struct.attachmentGroups.get(attachmentGroupEntityId)?.atomIds;

    if (attachmentGroupEntityId === undefined || !atomIds?.length) {
      return null;
    }

    return {
      type: 'attachmentGroup',
      moleculeId,
      attachmentGroupId,
      attachmentGroupEntityId,
      atomIds,
    };
  }

  return null;
}

export function addAttachmentGroupsToStruct(
  ket: HapticKet,
  struct: Struct,
  moleculeAtomIdMaps: Map<string, Map<number, number>>,
) {
  const attachmentGroupEntityIdMap = new Map<string, number>();

  moleculeAtomIdMaps.forEach((atomIdMap, moleculeId) => {
    getKetMolecule(ket, moleculeId)?.attachmentGroups?.forEach(
      (attachmentGroup) => {
        const attachmentGroupId = attachmentGroup.id?.toString();
        const atomIds = attachmentGroup.atoms?.map((atomId) =>
          atomIdMap.get(Number(atomId)),
        );

        if (
          attachmentGroupId === undefined ||
          !atomIds ||
          atomIds.length < 2 ||
          atomIds.some((atomId) => atomId === undefined)
        ) {
          return;
        }

        const resolvedAtomIds = atomIds as number[];
        const key = getAttachmentGroupKey(moleculeId, attachmentGroupId);
        if (attachmentGroupEntityIdMap.has(key)) {
          return;
        }

        const fragment = struct.atoms.get(resolvedAtomIds[0])?.fragment ?? -1;
        const attachmentGroupEntity = new AttachmentGroup({
          atomIds: resolvedAtomIds,
          fragment,
        });
        attachmentGroupEntity.recalculatePosition(struct.atoms);
        const attachmentGroupEntityId = struct.addAttachmentGroup(
          attachmentGroupEntity,
        );

        attachmentGroupEntityIdMap.set(key, attachmentGroupEntityId);
      },
    );
  });

  return attachmentGroupEntityIdMap;
}

function addHapticBondToStruct(
  struct: Struct,
  atomEndpoint: Extract<HapticConnectionEndpoint, { type: 'atom' }>,
  attachmentGroupEndpoint: Extract<
    HapticConnectionEndpoint,
    { type: 'attachmentGroup' }
  >,
) {
  struct.bonds.add(
    new Bond({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: atomEndpoint.atomId,
      end: attachmentGroupEndpoint.attachmentGroupEntityId,
    }),
  );
}

export function addHapticConnectionsToStruct(
  ket: HapticKet,
  struct: Struct,
  moleculeAtomIdMaps: Map<string, Map<number, number>>,
  attachmentGroupEntityIdMap: Map<string, number>,
) {
  let hasHapticConnections = false;

  ket.root.connections?.forEach((connection: IKetConnection) => {
    if (getConnectionType(connection) !== KetConnectionType.HAPTIC) {
      return;
    }

    const endpoint1 = resolveHapticConnectionEndpoint(
      connection.endpoint1,
      moleculeAtomIdMaps,
      attachmentGroupEntityIdMap,
      struct,
    );
    const endpoint2 = resolveHapticConnectionEndpoint(
      connection.endpoint2,
      moleculeAtomIdMaps,
      attachmentGroupEntityIdMap,
      struct,
    );

    if (!endpoint1 || !endpoint2) {
      return;
    }

    if (endpoint1.type === 'atom' && endpoint2.type === 'atom') {
      struct.bonds.add(
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: endpoint1.atomId,
          end: endpoint2.atomId,
        }),
      );
      hasHapticConnections = true;
      return;
    }

    if (endpoint1.type === 'atom' && endpoint2.type === 'attachmentGroup') {
      addHapticBondToStruct(struct, endpoint1, endpoint2);
      hasHapticConnections = true;
      return;
    }

    if (endpoint1.type === 'attachmentGroup' && endpoint2.type === 'atom') {
      addHapticBondToStruct(struct, endpoint2, endpoint1);
      hasHapticConnections = true;
    }
  });

  if (hasHapticConnections) {
    struct.clearFragments();
    struct.markFragments();
  }
}
