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
import { Atom, Bond, Pile, type Struct, Vec2 } from 'domain/entities';
import type { Point } from 'domain/entities/vec2';
import {
  isAllowedNonSapHapticBondMetal,
  isSuperAttachmentPointAtom,
} from 'domain/helpers/hapticBond';
import { moleculeToStruct } from './fromKet/moleculeToStruct';

export type KetAtomLocation = {
  moleculeId: string;
  atomId: string;
};

type KetAttachmentGroup = {
  id: string;
  atoms: number[];
};

type KetMolecule = {
  stereoFlagPosition?: Point;
  attachmentGroups?: KetAttachmentGroup[];
};

type HapticKet = {
  root: {
    connections?: IKetConnection[];
  };
  [key: string]: unknown;
};

type HapticConnectionEndpoint =
  | {
      type: 'atom';
      moleculeId: string;
      atomId: number;
    }
  | {
      type: 'attachmentGroup';
      moleculeId: string;
      attachmentGroupId: string;
      superAttachmentPointAtomId: number;
      atomIds: number[];
    };

type AttachmentGroupLocation = {
  moleculeId: string;
  attachmentGroupId: string;
};

function getAttachmentGroupKey(moleculeId: string, attachmentGroupId: string) {
  return `${moleculeId}:${attachmentGroupId}`;
}

function getKetMolecule(ket: HapticKet, moleculeId: string) {
  const molecule = ket[moleculeId];

  return typeof molecule === 'object' && molecule !== null
    ? (molecule as KetMolecule)
    : undefined;
}

export function getConnectionType(connection: IKetConnection) {
  return connection.type ?? connection.connectionType;
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
  attachmentGroupAtomIdMap: Map<string, number>,
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
    const superAttachmentPointAtomId = attachmentGroupAtomIdMap.get(
      getAttachmentGroupKey(moleculeId, attachmentGroupId),
    );
    const atomIds =
      superAttachmentPointAtomId === undefined
        ? undefined
        : struct.atoms.get(superAttachmentPointAtomId)?.endpoints;

    if (superAttachmentPointAtomId === undefined || !atomIds?.length) {
      return null;
    }

    return {
      type: 'attachmentGroup',
      moleculeId,
      attachmentGroupId,
      superAttachmentPointAtomId,
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
  const attachmentGroupAtomIdMap = new Map<string, number>();

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
        if (attachmentGroupAtomIdMap.has(key)) {
          return;
        }

        const positions = resolvedAtomIds.map(
          (atomId) => struct.atoms.get(atomId)?.pp ?? Vec2.ZERO,
        );
        const superAttachmentPointPosition = positions
          .reduce((acc, position) => acc.add(position), Vec2.ZERO)
          .scaled(1 / positions.length);
        const fragment = struct.atoms.get(resolvedAtomIds[0])?.fragment ?? -1;
        const superAttachmentPointAtomId = struct.atoms.add(
          new Atom({
            label: '*',
            pp: superAttachmentPointPosition,
            endpoints: resolvedAtomIds,
            fragment,
          }),
        );

        attachmentGroupAtomIdMap.set(key, superAttachmentPointAtomId);
      },
    );
  });

  return attachmentGroupAtomIdMap;
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
      end: attachmentGroupEndpoint.superAttachmentPointAtomId,
      endpoints: attachmentGroupEndpoint.atomIds,
      attach: 'ALL',
    }),
  );
}

export function addHapticConnectionsToStruct(
  ket: HapticKet,
  struct: Struct,
  moleculeAtomIdMaps: Map<string, Map<number, number>>,
  attachmentGroupAtomIdMap: Map<string, number>,
) {
  let hasHapticConnections = false;

  ket.root.connections?.forEach((connection: IKetConnection) => {
    if (getConnectionType(connection) !== KetConnectionType.HAPTIC) {
      return;
    }

    const endpoint1 = resolveHapticConnectionEndpoint(
      connection.endpoint1,
      moleculeAtomIdMaps,
      attachmentGroupAtomIdMap,
      struct,
    );
    const endpoint2 = resolveHapticConnectionEndpoint(
      connection.endpoint2,
      moleculeAtomIdMaps,
      attachmentGroupAtomIdMap,
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

function hasAttachmentGroupsOrHapticBonds(struct: Struct) {
  return (
    struct.atoms.some((atom) => isSuperAttachmentPointAtom(atom)) ||
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

  const atomIds = new Pile<number>();
  const bondIds = new Pile<number>();
  const originalToKetStructAtomIdMap = new Map<number, number>();

  struct.atoms.forEach((atom, atomId) => {
    if (!isSuperAttachmentPointAtom(atom)) {
      atomIds.add(atomId);
    }
  });

  struct.bonds.forEach((bond, bondId) => {
    if (bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
      bondIds.add(bondId);
    }
  });

  const structForKet = struct.clone(
    atomIds,
    bondIds,
    false,
    originalToKetStructAtomIdMap,
  );
  structForKet.clearFragments();
  structForKet.markFragments();

  return { structForKet, originalToKetStructAtomIdMap };
}

function getAtomLocationForHapticConnection(
  atomId: number,
  originalAtomToKetLocation: Map<number, KetAtomLocation>,
) {
  return originalAtomToKetLocation.get(atomId);
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
  fileContent: Record<string, KetMolecule>,
  originalAtomToKetLocation: Map<number, KetAtomLocation>,
) {
  const attachmentGroupLocations = new Map<number, AttachmentGroupLocation>();

  struct.atoms.forEach((atom, atomId) => {
    if (!isSuperAttachmentPointAtom(atom) || atom.endpoints.length < 2) {
      return;
    }

    const attachmentAtomLocations = atom.endpoints.map((endpointAtomId) =>
      getAtomLocationForHapticConnection(
        endpointAtomId,
        originalAtomToKetLocation,
      ),
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

    const attachmentGroupId = getOrCreateAttachmentGroup(
      fileContent[moleculeId],
      attachmentAtomLocations.map((location) => Number(location?.atomId)),
    );
    attachmentGroupLocations.set(atomId, {
      moleculeId,
      attachmentGroupId,
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
    const beginAtomIsSap = isSuperAttachmentPointAtom(beginAtom);
    const endAtomIsSap = isSuperAttachmentPointAtom(endAtom);

    if (beginAtomIsSap || endAtomIsSap) {
      const superAttachmentPointAtomId = beginAtomIsSap ? bond.begin : bond.end;
      const centralAtomId = beginAtomIsSap ? bond.end : bond.begin;
      const attachmentGroupLocation = attachmentGroupLocations.get(
        superAttachmentPointAtomId,
      );
      const centralAtomLocation = getAtomLocationForHapticConnection(
        centralAtomId,
        originalAtomToKetLocation,
      );

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

    const beginAtomLocation = getAtomLocationForHapticConnection(
      bond.begin,
      originalAtomToKetLocation,
    );
    const endAtomLocation = getAtomLocationForHapticConnection(
      bond.end,
      originalAtomToKetLocation,
    );

    if (!beginAtomLocation || !endAtomLocation) {
      return;
    }

    const beginAtomIsMetal = isAllowedNonSapHapticBondMetal(beginAtom);
    const endAtomIsMetal = isAllowedNonSapHapticBondMetal(endAtom);
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
