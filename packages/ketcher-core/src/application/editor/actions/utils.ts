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
type FormattedEditorSelection = Record<typeof selectionKeys[number], number[]>;
type ClosestAtom = {
  id: number;
  dist: number;
};
type AtomForNewBondResult = {
  atom: number | AtomAttributes;
  pos: Vec2;
};
const DEFAULT_BOND_TYPE = Bond.PATTERN.TYPE.SINGLE;

function getReAtom(restruct: ReStruct, atomId: number) {
  const atom = restruct.atoms.get(atomId);
  if (!atom) {
    throw new Error(`Atom ${atomId} not found in restruct`);
  }

  return atom;
}

function getAtom(restruct: ReStruct, atomId: number): Atom {
  const atom = restruct.molecule.atoms.get(atomId);
  if (!atom) {
    throw new Error(`Atom ${atomId} not found in struct`);
  }

  return atom;
}

function getAtomNeighbors(struct: Struct, atomId: number) {
  const neighbors = struct.atomGetNeighbors(atomId);
  if (!neighbors) {
    throw new Error(`Atom ${atomId} not found in struct`);
  }

  return neighbors;
}

function getBondAngle(struct: Struct, bondId: number | null) {
  if (bondId === null) {
    throw new Error('Previous bond is required');
  }

  const bond = struct.bonds.get(bondId);
  if (!bond) {
    throw new Error(`Bond ${bondId} not found in struct`);
  }

  return bond.angle;
}

function getAtomId(atom: number | AtomAttributes): number {
  if (typeof atom !== 'number') {
    throw new Error('Expected atom id (number), but received atom attributes');
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
): FormattedEditorSelection {
  return selectionKeys.reduce<FormattedEditorSelection>((res, key) => {
    res[key] = selection[key] || [];

    return res;
  }, {} as FormattedEditorSelection);
}

// Get new atom id/label and pos for bond being added to existing atom
export function atomForNewBond(
  restruct: ReStruct,
  atom: number | AtomAttributes,
  bond?: Partial<BondAttributes>,
): AtomForNewBondResult {
  // eslint-disable-line max-statements
  const id = getAtomId(atom);
  const neighbours: Array<{ id: number; v: Vec2 }> = [];
  const pos = atomGetPos(restruct, id);
  const atomNeighbours = getAtomNeighbors(restruct.molecule, id);

  const prevBondId = atomNeighbours.length
    ? restruct.molecule.findBondId(id, atomNeighbours[0].aid)
    : null;
  const prevBond =
    prevBondId === null ? undefined : restruct.molecule.bonds.get(prevBondId);
  let prevBondType: number | undefined = DEFAULT_BOND_TYPE;
  if (prevBond) {
    prevBondType = prevBond.type;
  } else if (bond) {
    prevBondType = bond.type;
  }

  getAtomNeighbors(restruct.molecule, id).forEach((nei) => {
    const neiPos = atomGetPos(restruct, nei.aid);

    if (Vec2.dist(pos, neiPos) < 0.1) return;

    neighbours.push({ id: nei.aid, v: Vec2.diff(neiPos, pos) });
  });

  neighbours.sort(
    (nei1, nei2) =>
      Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x),
  );

  let i;
  let maxI = 0;
  let angle;
  let maxAngle = 0;

  // TODO: impove layout: tree, ...

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

  if (neighbours.length > 0) {
    if (neighbours.length === 1) {
      maxAngle = -((4 * Math.PI) / 3);

      // zig-zag
      const nei = getAtomNeighbors(restruct.molecule, id)[0];
      if (atomGetDegree(restruct, nei.aid) > 1) {
        const neiNeighbours: number[] = [];
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

          neiNeighbours.push(ang);
        });
        neiNeighbours.sort((nei1, nei2) => nei1 - nei2);

        if (
          neiNeighbours[0] <= Math.PI * 1.01 &&
          neiNeighbours[neiNeighbours.length - 1] <= 1.01 * Math.PI
        ) {
          maxAngle *= -1;
        }
      }
    }

    const shallBe180DegToPrevBond =
      (neighbours.length === 1 &&
        prevBondType === bond?.type &&
        (bond?.type === Bond.PATTERN.TYPE.DOUBLE ||
          bond?.type === Bond.PATTERN.TYPE.TRIPLE)) ||
      (prevBondType === Bond.PATTERN.TYPE.SINGLE &&
        bond?.type === Bond.PATTERN.TYPE.TRIPLE) ||
      (prevBondType === Bond.PATTERN.TYPE.TRIPLE &&
        bond?.type === Bond.PATTERN.TYPE.SINGLE);

    if (shallBe180DegToPrevBond) {
      const prevBondAngle = getBondAngle(restruct.molecule, prevBondId);
      if (prevBondAngle > -90 && prevBondAngle < 90 && neighbours[0].v.x > 0) {
        angle = (prevBondAngle * Math.PI) / 180 + Math.PI;
      } else {
        angle = (prevBondAngle * Math.PI) / 180;
      }
    } else {
      angle =
        maxAngle / 2 + Math.atan2(neighbours[maxI].v.y, neighbours[maxI].v.x);
    }

    v = v.rotate(angle);
  }

  v.add_(pos); // eslint-disable-line no-underscore-dangle

  const closestAtom = closest.atom(
    restruct,
    v,
    null,
    0.1,
  ) as ClosestAtom | null;
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
