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

import { Atom, type AtomAttributes } from 'domain/entities/atom';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { RGroup } from 'domain/entities/rgroup';
import type { Point } from 'domain/entities/vec2';
import {
  AtomAdd,
  AtomAttr,
  CalcImplicitH,
  FragmentAdd,
  FragmentAddStereoAtom,
  FragmentDelete,
  FragmentDeleteStereoAtom,
  SGroupAtomAdd,
} from '../operations';
import { atomGetAttr, atomGetSGroups } from './utils';
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup';
import { fromBondStereoUpdate } from './bondStereo';

import { Action } from './action';
import { without } from 'lodash/fp';
import type ReStruct from 'application/render/restruct/restruct';
import { assert } from 'utilities';

export function fromAtomAddition(
  restruct: ReStruct,
  pos: Point,
  atom?: Partial<AtomAttributes>,
) {
  atom = { ...(atom || {}) };
  const action = new Action();
  atom.fragment = (
    action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd
  ).frid as number;

  const aid = (
    action.addOp(new AtomAdd(atom, pos).perform(restruct)) as AtomAdd
  ).data.aid;
  action.addOp(new CalcImplicitH([aid as number]).perform(restruct));

  return action;
}

export function fromAtomsAttrs(
  restruct: ReStruct,
  ids: Array<number> | number,
  attrs: Partial<AtomAttributes> | null | undefined,
  reset: boolean | null,
) {
  const action = new Action();
  const aids = Array.isArray(ids) ? ids : [ids];
  const atomAttrs = attrs ?? {};

  aids.forEach((atomId) => {
    Object.keys(Atom.attrlist).forEach((key) => {
      if (key === 'attachmentPoints' && !(key in atomAttrs)) return;
      if (!(key in atomAttrs) && !reset) return;

      const value =
        key in atomAttrs
          ? atomAttrs[key as keyof AtomAttributes]
          : Atom.attrGetDefault(key);

      switch (key) {
        case 'stereoLabel':
        case 'stereoParity':
          if (key in atomAttrs && value) {
            action.addOp(new AtomAttr(atomId, key, value).perform(restruct));
          }
          break;
        default:
          action.addOp(new AtomAttr(atomId, key, value).perform(restruct));
          break;
      }
    });

    if (
      !reset &&
      'label' in atomAttrs &&
      atomAttrs.label !== null &&
      atomAttrs.label !== 'L#' &&
      !('atomList' in atomAttrs)
    ) {
      action.addOp(new AtomAttr(atomId, 'atomList', null).perform(restruct));
    }

    action.addOp(new CalcImplicitH([atomId]).perform(restruct));

    const atomNeighbors = restruct.molecule.atomGetNeighbors(atomId);
    const bond = restruct.molecule.bonds.get(atomNeighbors?.[0]?.bid as number);
    if (bond) {
      action.mergeWith(fromBondStereoUpdate(restruct, bond));
    }
    // when a heteroatom connects to an aromatic ring it's necessary to add a ImplicitHCount
    // property to this atom to specify the number of hydrogens on it.
    const atom = restruct.molecule.atoms.get(atomId);
    assert(atom != null);

    if (Atom.isInAromatizedRing(restruct.molecule, atomId)) {
      action.addOp(
        new AtomAttr(atomId, 'implicitHCount', atom.implicitH).perform(
          restruct,
        ),
      );
    }
  });

  return action;
}

export { fromStereoAtomAttrs } from './bondStereo';

export function fromAtomsFragmentAttr(
  restruct: ReStruct,
  aids: Iterable<number>,
  newfrid: number,
) {
  const action = new Action();

  Array.from(aids).forEach((aid) => {
    const atom = restruct.molecule.atoms.get(aid);
    assert(atom != null);
    const sgroup = restruct.molecule.getGroupFromAtomId(aid);
    const oldfrid = atom.fragment;

    if (sgroup instanceof MonomerMicromolecule) {
      return;
    }

    action.addOp(new AtomAttr(aid, 'fragment', newfrid));

    if (atom.stereoLabel !== null) {
      action.addOp(new FragmentAddStereoAtom(newfrid, aid));
      action.addOp(new FragmentDeleteStereoAtom(oldfrid, aid));
    }
  });

  return action.perform(restruct);
}

export function mergeFragmentsIfNeeded(
  action: Action,
  restruct: ReStruct,
  srcId: number,
  dstId: number,
) {
  const frid = atomGetAttr(restruct, srcId, 'fragment') as number;
  const frid2 = atomGetAttr(restruct, dstId, 'fragment');

  if (frid2 !== frid && typeof frid === 'number' && typeof frid2 === 'number') {
    const struct = restruct.molecule;

    const rgid = RGroup.findRGroupByFragment(struct.rgroups, frid2);
    if (typeof rgid !== 'undefined') {
      action
        .mergeWith(fromRGroupFragment(restruct, null, frid2))
        .mergeWith(fromUpdateIfThen(restruct, 0, rgid));
    }

    const fridAtoms = struct.getFragmentIds(frid);

    const atomsToNewFrag: number[] = [];
    struct.atoms.forEach((atom, aid) => {
      if (atom.fragment === frid2) atomsToNewFrag.push(aid);
    });
    const moveAtomsAction = fromAtomsFragmentAttr(
      restruct,
      atomsToNewFrag,
      frid,
    );

    mergeSgroups(action, restruct, fridAtoms, dstId);
    action.addOp(new FragmentDelete(frid2).perform(restruct));
    action.mergeWith(moveAtomsAction);
  }

  return frid;
}

export function mergeSgroups(
  action: Action,
  restruct: ReStruct,
  srcAtoms: Iterable<number>,
  dstAtom: number,
) {
  const sgroups = atomGetSGroups(restruct, dstAtom);
  const srcAtomIds = Array.from(srcAtoms);

  sgroups.forEach((sid) => {
    const sgroup = restruct.molecule.sgroups.get(sid);
    assert(sgroup != null);
    const notExpandedContexts = ['Atom', 'Bond', 'Group'];
    const context = sgroup.data.context;
    if (
      sgroup.type === 'DAT' &&
      typeof context === 'string' &&
      notExpandedContexts.includes(context)
    ) {
      return;
    }
    const atomsToSgroup = without(sgroup.atoms, srcAtomIds);
    atomsToSgroup.forEach((aid) =>
      action.addOp(new SGroupAtomAdd(sid, aid).perform(restruct)),
    );
  });
}

export function checkAtomValence(restruct: ReStruct, atomId: number) {
  const action = new Action();

  if (!restruct.atoms.has(atomId)) return action;

  action.addOp(new CalcImplicitH([atomId]));

  return action.perform(restruct);
}
