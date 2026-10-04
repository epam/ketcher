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
  type AtomAttributes,
  type AtomQueryProperties,
  Atom,
} from 'domain/entities/atom';
import { Bond, type BondAttributes } from 'domain/entities/bond';
import type { SGroup } from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { KetcherLogger } from 'utilities';

import closest from '../shared/closest';
import type { ReStruct } from 'application/render';
import { selectionKeys } from '../shared/constants';
import type { EditorSelection } from '../editor.types';
export type AtomType = 'single' | 'list' | 'pseudo';
export type AtomAttributeName = keyof AtomAttributes;
export type AtomQueryPropertiesName = keyof AtomQueryProperties;
export type AtomAllAttributeName = AtomAttributeName | AtomQueryPropertiesName;
export type AtomAllAttributeValue =
  | AtomAttributes[AtomAttributeName]
  | AtomQueryProperties[AtomQueryPropertiesName];
type NormalizedEditorSelection = Record<
  (typeof selectionKeys)[number],
  number[]
>;
type ClosestAtom = {
  id: number;
  dist: number;
};
type ClosestSkip = {
  map: 'atoms';
  id: number;
} | null;
type FindClosestAtom = (
  restruct: ReStruct,
  pos: Vec2,
  skip: ClosestSkip,
  minDist: number,
) => ClosestAtom | null;
type AtomForNewBondResult = {
  atom: number | AtomAttributes;
  pos: Vec2;
};
/** Default bond type used when no previous bond type is available as a reference. */
const DEFAULT_BOND_TYPE = Bond.PATTERN.TYPE.SINGLE;
const findClosestAtom: FindClosestAtom = closest.atom;

function throwLoggedError(message: string): never {
  KetcherLogger.error(message);
  throw new Error(message);
}

function getReAtom(restruct: ReStruct, atomId: number) {
  const atom = restruct.atoms.get(atomId);
  if (!atom) {
    throwLoggedError(`Atom ${atomId} not found in restruct`);
  }

  return atom;
}

function getAtom(restruct: ReStruct, atomId: number): Atom {
  const atom = restruct.molecule.atoms.get(atomId);
  if (!atom) {
    throwLoggedError(`Atom ${atomId} not found in struct`);
  }

  return atom;
}

function getAtomNeighbors(struct: Struct, atomId: number) {
  const neighbors = struct.atomGetNeighbors(atomId);
  if (!neighbors) {
    throwLoggedError(`Atom ${atomId} not found in struct`);
  }

  return neighbors;
}

function getBondAngle(struct: Struct, bondId: number | null) {
  if (bondId === null) {
    throwLoggedError('Previous bond is required');
  }

  const bond = struct.bonds.get(bondId);
  if (!bond) {
    throwLoggedError(`Bond ${bondId} not found in struct`);
  }

  return bond.angle;
}

function ensureAtomId(atom: number | AtomAttributes): number {
  if (typeof atom !== 'number') {
    throwLoggedError('Expected atom id (number), but received atom attributes');
  }

  return atom;
}

export function atomGetAttr(
  restruct: ReStruct,
  aid: number,
  name: AtomAttributeName,
) {
  const atom = restruct.molecule.atoms.get(aid);
  if (!atom) return null;
  return atom[name];
}

export function atomGetDegree(restruct: ReStruct, aid: number): number {
  return getReAtom(restruct, aid).a.neighbors.length;
}

export function atomGetSGroups(restruct: ReStruct, atomId: number): number[] {
  return Array.from(getReAtom(restruct, atomId).a.sgs);
}

export function atomGetPos(restruct: ReStruct, id: number): Vec2 {
  return getAtom(restruct, id).pp;
}

export function findStereoAtoms(
  struct: Struct,
  atomIds: number[] | undefined,
): number[] {
  let monomerAtoms = 0;
  if (struct.sgroups && struct.sgroups.size > 0) {
    struct.sgroups.forEach((sgroup) => {
      monomerAtoms += sgroup.atoms.length;
    });
  }

  // no atoms, or only monomers present
  if (!atomIds || struct.atoms.size === monomerAtoms) {
    return [] as number[];
  }

  return atomIds.filter((atomId: number) => {
    const atom = struct.atoms.get(atomId);
    if (atom?.stereoLabel !== null) {
      return true;
    }
    const connectedBonds = Atom.getConnectedBondIds(struct, atomId);
    const connectedWithStereoBond = connectedBonds.some((bondId: number) => {
      const bond = struct.bonds.get(bondId);
      return bond?.begin === atomId && bond?.stereo;
    });
    return connectedWithStereoBond;
  });
}

export function structSelection(struct: Struct): EditorSelection {
  return selectionKeys.reduce<EditorSelection>((res, key) => {
    res[key] = Array.from(struct[key].keys());
    return res;
  }, {});
}

export function getSelectionFromStruct(struct: Struct): EditorSelection {
  const selection: EditorSelection = {};

  selectionKeys.forEach((entityType) => {
    if (struct?.[entityType]) {
      const selected: number[] = [];
      struct[entityType].forEach((value, key) => {
        if (
          typeof value.getInitiallySelected === 'function' &&
          value.getInitiallySelected()
        ) {
          selected.push(key);
        }
      });
      if (selected.length > 0) {
        selection[entityType] = selected;
      }
    }
  });
  return selection;
}

export function formatSelection(
  selection: EditorSelection,
): NormalizedEditorSelection {
  return selectionKeys.reduce<NormalizedEditorSelection>((res, key) => {
    res[key] = selection[key] || [];

    return res;
  }, {} as NormalizedEditorSelection);
}

const TWO_PI = 2 * Math.PI;
// New-bond placement uses model coordinates where the proposed bond vector has
// unit length, so distance values below are fractions/multiples of one bond.
const BOND_PLACEMENT_SCORING = {
  environmentRadius: 2.5,
  atomCollisionDistance: 0.9,
  bondCollisionDistance: 0.35,
  atomCollisionWeight: 6,
  bondCollisionWeight: 4,
  halfBlockedSectorAngle: Math.PI / 8,
  angleSearchStep: Math.PI / 36,
  angleSearchSpan: Math.PI,
  blockedAngleWeight: 100,
  spatialWeight: 20,
} as const;

function normalizeAngle(angle: number): number {
  let normalized = angle % TWO_PI;
  if (normalized < 0) {
    normalized += TWO_PI;
  }
  return normalized;
}

function shortestAngularDistance(from: number, to: number): number {
  const diff = Math.abs(normalizeAngle(from) - normalizeAngle(to));
  return Math.min(diff, TWO_PI - diff);
}

function pointToSegmentDistance(point: Vec2, start: Vec2, end: Vec2): number {
  const segment = Vec2.diff(end, start);
  const segmentLengthSq = segment.x * segment.x + segment.y * segment.y;

  if (segmentLengthSq < 1e-8) {
    return Vec2.dist(point, start);
  }

  const toPoint = Vec2.diff(point, start);
  const projection =
    (toPoint.x * segment.x + toPoint.y * segment.y) / segmentLengthSq;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closestPoint = new Vec2(
    start.x + segment.x * clampedProjection,
    start.y + segment.y * clampedProjection,
  );

  return Vec2.dist(point, closestPoint);
}

function getSpatialPenalty(
  origin: Vec2,
  candidateAngle: number,
  nearbyAtoms: Vec2[],
  nearbyBonds: Array<{ begin: Vec2; end: Vec2 }>,
): number {
  const candidatePos = new Vec2(
    Math.cos(candidateAngle),
    Math.sin(candidateAngle),
  );
  candidatePos.add_(origin); // eslint-disable-line no-underscore-dangle

  const atomPenalty = nearbyAtoms.reduce((score, atomPos) => {
    const distance = Vec2.dist(candidatePos, atomPos);
    if (distance >= BOND_PLACEMENT_SCORING.atomCollisionDistance) {
      return score;
    }

    const overlap =
      (BOND_PLACEMENT_SCORING.atomCollisionDistance - distance) /
      BOND_PLACEMENT_SCORING.atomCollisionDistance;
    return score + overlap * overlap;
  }, 0);

  const bondPenalty = nearbyBonds.reduce((score, bondSegment) => {
    const distance = pointToSegmentDistance(
      candidatePos,
      bondSegment.begin,
      bondSegment.end,
    );
    if (distance >= BOND_PLACEMENT_SCORING.bondCollisionDistance) {
      return score;
    }

    const overlap =
      (BOND_PLACEMENT_SCORING.bondCollisionDistance - distance) /
      BOND_PLACEMENT_SCORING.bondCollisionDistance;
    return score + overlap * overlap;
  }, 0);

  return (
    atomPenalty * BOND_PLACEMENT_SCORING.atomCollisionWeight +
    bondPenalty * BOND_PLACEMENT_SCORING.bondCollisionWeight
  );
}

function optimizeDirectionAngle(
  origin: Vec2,
  preferredAngle: number,
  blockedAngles: number[],
  nearbyAtoms: Vec2[],
  nearbyBonds: Array<{ begin: Vec2; end: Vec2 }>,
): number {
  if (
    blockedAngles.length === 0 &&
    nearbyAtoms.length === 0 &&
    nearbyBonds.length === 0
  ) {
    return preferredAngle;
  }

  const steps = Math.round(
    (2 * BOND_PLACEMENT_SCORING.angleSearchSpan) /
      BOND_PLACEMENT_SCORING.angleSearchStep,
  );
  let bestAngle = preferredAngle;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let stepIndex = 0; stepIndex <= steps; stepIndex++) {
    const offset =
      -BOND_PLACEMENT_SCORING.angleSearchSpan +
      stepIndex * BOND_PLACEMENT_SCORING.angleSearchStep;
    const candidate = preferredAngle + offset;
    const overlapPenalty = blockedAngles.reduce((score, blockedAngle) => {
      const distance = shortestAngularDistance(candidate, blockedAngle);
      if (distance >= BOND_PLACEMENT_SCORING.halfBlockedSectorAngle) {
        return score;
      }
      const overlapFactor =
        (BOND_PLACEMENT_SCORING.halfBlockedSectorAngle - distance) /
        BOND_PLACEMENT_SCORING.halfBlockedSectorAngle;
      return score + overlapFactor * overlapFactor;
    }, 0);

    const deviationPenalty =
      shortestAngularDistance(candidate, preferredAngle) / Math.PI;
    const spatialPenalty = getSpatialPenalty(
      origin,
      candidate,
      nearbyAtoms,
      nearbyBonds,
    );
    const totalScore =
      overlapPenalty * BOND_PLACEMENT_SCORING.blockedAngleWeight +
      spatialPenalty * BOND_PLACEMENT_SCORING.spatialWeight +
      deviationPenalty;

    if (totalScore < bestScore) {
      bestScore = totalScore;
      bestAngle = candidate;
    }
  }

  return bestAngle;
}

// Get new atom id/label and pos for bond being added to existing atom
export function atomForNewBond(
  restruct: ReStruct,
  atom: number | AtomAttributes,
  bond?: Partial<BondAttributes>,
): AtomForNewBondResult {
  const id = ensureAtomId(atom);
  const neighbours: Array<{ id: number; v: Vec2 }> = [];
  const blockedAngles: number[] = [];
  const nearbyAtoms: Vec2[] = [];
  const nearbyBonds: Array<{ begin: Vec2; end: Vec2 }> = [];
  const pos = atomGetPos(restruct, id);
  const atomNeighbours = getAtomNeighbors(restruct.molecule, id);

  const prevBondId = atomNeighbours.length
    ? restruct.molecule.findBondId(id, atomNeighbours[0].aid)
    : null;
  const prevBond =
    prevBondId === null ? undefined : restruct.molecule.bonds.get(prevBondId);
  let prevBondType = DEFAULT_BOND_TYPE;
  if (prevBond) {
    prevBondType = prevBond.type;
  } else if (bond) {
    prevBondType = bond.type ?? DEFAULT_BOND_TYPE;
  }

  getAtomNeighbors(restruct.molecule, id).forEach((nei) => {
    const neiPos = atomGetPos(restruct, nei.aid);

    if (Vec2.dist(pos, neiPos) < 0.1) return;

    const neiDirection = Vec2.diff(neiPos, pos);
    neighbours.push({ id: nei.aid, v: neiDirection });
    blockedAngles.push(Math.atan2(neiDirection.y, neiDirection.x));

    restruct.molecule.atomGetNeighbors(nei.aid).forEach((neiNei) => {
      if (neiNei.aid === id) {
        return;
      }

      const neiNeiPos = atomGetPos(restruct, neiNei.aid);
      if (Vec2.dist(pos, neiNeiPos) < 0.1) {
        return;
      }

      const nearbyDirection = Vec2.diff(neiNeiPos, pos);
      blockedAngles.push(Math.atan2(nearbyDirection.y, nearbyDirection.x));
    });
  });

  restruct.visibleAtoms.forEach((atom, aid) => {
    if (aid === id) {
      return;
    }

    const atomPos = atom.a.pp;
    const distance = Vec2.dist(pos, atomPos);
    if (distance > BOND_PLACEMENT_SCORING.environmentRadius || distance < 0.1) {
      return;
    }

    nearbyAtoms.push(atomPos);
    blockedAngles.push(Math.atan2(atomPos.y - pos.y, atomPos.x - pos.x));
  });

  restruct.visibleBonds.forEach((bond) => {
    const bondItem = bond.b;

    if (bondItem.begin === id || bondItem.end === id) {
      return;
    }

    const beginPos = restruct.visibleAtoms.get(bondItem.begin)?.a.pp;
    const endPos = restruct.visibleAtoms.get(bondItem.end)?.a.pp;
    if (!beginPos || !endPos) {
      return;
    }

    if (
      Vec2.dist(pos, beginPos) > BOND_PLACEMENT_SCORING.environmentRadius &&
      Vec2.dist(pos, endPos) > BOND_PLACEMENT_SCORING.environmentRadius
    ) {
      return;
    }

    nearbyBonds.push({ begin: beginPos, end: endPos });
  });

  neighbours.sort(
    (nei1, nei2) =>
      Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x),
  );

  let i;
  let maxI = 0;
  let angle;
  let maxAngle = 0;

  for (i = 0; i < neighbours.length; i++) {
    angle = Vec2.angle(
      neighbours[i].v,
      neighbours[(i + 1) % neighbours.length].v,
    );

    if (angle < 0) angle += 2 * Math.PI;

    if (angle > maxAngle) {
      maxI = i;
      maxAngle = angle;
    }
  }

  let v = new Vec2(1, 0);

  if (neighbours.length === 1) {
    maxAngle = -((4 * Math.PI) / 3);

    // zig-zag
    const nei = getAtomNeighbors(restruct.molecule, id)[0];
    if (atomGetDegree(restruct, nei.aid) > 1) {
      const neiNeighborAngles: number[] = [];
      const neiPos = atomGetPos(restruct, nei.aid);
      const neiV = Vec2.diff(pos, neiPos);
      const neiAngle = Math.atan2(neiV.y, neiV.x);

      getAtomNeighbors(restruct.molecule, nei.aid).forEach((neiNei) => {
        const neiNeiPos = atomGetPos(restruct, neiNei.aid);

        if (neiNei.bid === nei.bid || Vec2.dist(neiPos, neiNeiPos) < 0.1) {
          return;
        }

        const vDiff = Vec2.diff(neiNeiPos, neiPos);
        let ang = Math.atan2(vDiff.y, vDiff.x) - neiAngle;

        if (ang < 0) ang += 2 * Math.PI;

        neiNeighborAngles.push(ang);
      });
      neiNeighborAngles.sort((nei1, nei2) => nei1 - nei2);

      if (
        neiNeighborAngles[0] <= Math.PI * 1.01 &&
        neiNeighborAngles[neiNeighborAngles.length - 1] <= 1.01 * Math.PI
      ) {
        maxAngle *= -1;
      }
    }
  }

  const shallBe180DegToPrevBond =
    neighbours.length === 1 &&
    ((prevBondType === bond?.type &&
      (bond?.type === Bond.PATTERN.TYPE.DOUBLE ||
        bond?.type === Bond.PATTERN.TYPE.TRIPLE)) ||
      (prevBondType === Bond.PATTERN.TYPE.SINGLE &&
        bond?.type === Bond.PATTERN.TYPE.TRIPLE) ||
      (prevBondType === Bond.PATTERN.TYPE.TRIPLE &&
        bond?.type === Bond.PATTERN.TYPE.SINGLE));

  if (shallBe180DegToPrevBond) {
    const prevBondAngle = getBondAngle(restruct.molecule, prevBondId);
    if (prevBondAngle > -90 && prevBondAngle < 90 && neighbours[0].v.x > 0) {
      angle = (prevBondAngle * Math.PI) / 180 + Math.PI;
    } else {
      angle = (prevBondAngle * Math.PI) / 180;
    }
  } else {
    let preferredAngle = 0;
    if (neighbours.length > 0) {
      preferredAngle =
        maxAngle / 2 + Math.atan2(neighbours[maxI].v.y, neighbours[maxI].v.x);
    }
    angle = optimizeDirectionAngle(
      pos,
      preferredAngle,
      blockedAngles,
      nearbyAtoms,
      nearbyBonds,
    );
  }

  v = v.rotate(angle);

  v.add_(pos);

  const closestAtom = findClosestAtom(restruct, v, null, 0.1);
  const a = closestAtom === null ? { label: 'C' } : closestAtom.id;

  return { atom: a, pos: v };
}

export function getRelSGroupsBySelection(
  struct: Struct,
  selectedAtoms: number[],
) {
  const sgroups = new Set<SGroup>();

  selectedAtoms.forEach((atom) => {
    struct.atoms.get(atom)?.sgs.forEach((sgid) => {
      const sgroup = struct.sgroups.get(sgid);
      if (sgroup && !sgroup.data.attached && !sgroup.data.absolute) {
        sgroups.add(sgroup);
      }
    });
  });

  return sgroups;
}

export function isAttachmentBond(
  { begin, end }: Bond,
  selection: EditorSelection,
) {
  if (!selection.atoms) {
    return false;
  }
  const isBondStartsInSelectionAndEndsOutside =
    selection.atoms.includes(begin) && !selection.atoms.includes(end);
  const isBondEndsInSelectionAndStartsOutside =
    selection.atoms.includes(end) && !selection.atoms.includes(begin);
  return (
    isBondStartsInSelectionAndEndsOutside ||
    isBondEndsInSelectionAndStartsOutside
  );
}
