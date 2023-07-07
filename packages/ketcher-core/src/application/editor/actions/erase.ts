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
  AtomDelete,
  BondDelete,
  CalcImplicitH,
  RxnArrowDelete,
  RxnPlusDelete,
  SimpleObjectDelete,
  TextDelete,
} from '../operations';
import { RGroup } from 'domain/entities';
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup';

import { Action } from './action';
import assert from 'assert';
import { atomGetDegree, formatSelection } from './utils';
import { fromBondStereoUpdate } from '../actions/bond';
import { fromFragmentSplit } from './fragment';

export function fromOneAtomDeletion(restruct, atomId: number) {
  return fromFragmentDeletion(restruct, { atoms: [atomId] });
}

function fromBondDeletion(restruct, bid: number, skipAtoms: Array<any> = []) {
  let action = new Action();
  const bond: any = restruct.molecule.bonds.get(bid);
  const atomsToRemove: Array<any> = [];

  action.addOp(new BondDelete(bid));

  if (
    !skipAtoms.includes(bond.begin) &&
    atomGetDegree(restruct, bond.begin) === 0
  ) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin)) {
      atomsToRemove.push(bond.begin);
    }

    action.addOp(new AtomDelete(bond.begin));
  }

  if (
    !skipAtoms.includes(bond.end) &&
    atomGetDegree(restruct, bond.end) === 0
  ) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end)) {
      atomsToRemove.push(bond.end);
    }

    action.addOp(new AtomDelete(bond.end));
  }

  removeSgroupIfNeeded(action, restruct, atomsToRemove);
  action = action.perform(restruct);
  action.addOp(new CalcImplicitH([bond.begin, bond.end]).perform(restruct));
  action.mergeWith(fromBondStereoUpdate(restruct, bond, false));

  action.operations.reverse();

  return action;
}

export function fromOneBondDeletion(restruct, id) {
  const frid = restruct.molecule.getBondFragment(id);
  let action = fromBondDeletion(restruct, id);

  action = fromFragmentSplit(restruct, frid).mergeWith(action);

  return action;
}

export function fromFragmentDeletion(restruct, rawSelection) {
  assert(!!rawSelection != null);

  let action = new Action();
  const atomsToRemove: Array<number> = [];
  const frids: Array<number> = [];

  const selection = formatSelection(rawSelection);

  selection.sgroups.forEach((sgroupId) => {
    const sgroup = restruct.sgroups.get(sgroupId);
    const sgroupAtoms = sgroup.item.atoms;

    selection.atoms = selection.atoms.concat(sgroupAtoms);

    restruct.molecule.bonds.forEach((bond, bondId) => {
      if (
        sgroupAtoms.indexOf(bond.begin) >= 0 &&
        sgroupAtoms.indexOf(bond.end) >= 0
      ) {
        selection.bonds.push(bondId);
      }
    });
  });

  selection.atoms = Array.from(new Set(selection.atoms));
  selection.bonds = Array.from(new Set(selection.bonds));

  selection.atoms.forEach((aid) => {
    restruct.molecule.atomGetNeighbors(aid).forEach((nei) => {
      if (selection.bonds.indexOf(nei.bid) === -1) {
        selection.bonds = selection.bonds.concat([nei.bid]);
      }
    });
  });

  const actionRemoveBonds = new Action();
  selection.bonds.forEach((bid) => {
    const frid = restruct.molecule.getBondFragment(bid);
    if (frids.indexOf(frid) < 0) frids.push(frid);

    actionRemoveBonds.mergeWith(
      fromBondDeletion(restruct, bid, selection.atoms)
    );
  });

  selection.atoms.forEach((aid) => {
    const frid3 = restruct.molecule.atoms.get(aid).fragment;
    if (frids.indexOf(frid3) < 0) frids.push(frid3);

    if (removeAtomFromSgroupIfNeeded(action, restruct, aid)) {
      atomsToRemove.push(aid);
    }

    action.addOp(new AtomDelete(aid));
  });

  removeSgroupIfNeeded(action, restruct, atomsToRemove);

  selection.rxnArrows.forEach((id) => {
    action.addOp(new RxnArrowDelete(id));
  });

  selection.rxnPluses.forEach((id) => {
    action.addOp(new RxnPlusDelete(id));
  });

  selection.simpleObjects.forEach((id) => {
    action.addOp(new SimpleObjectDelete(id));
  });

  selection.texts.forEach((id) => {
    action.addOp(new TextDelete(id));
  });

  action = action.perform(restruct);
  action.mergeWith(actionRemoveBonds);

  const rgForRemove: Array<number> = frids.map(
    (frid) => RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid)!
  );

  while (frids.length > 0) {
    action = fromFragmentSplit(restruct, frids.pop(), rgForRemove).mergeWith(
      action
    );
  }

  return action;
}
