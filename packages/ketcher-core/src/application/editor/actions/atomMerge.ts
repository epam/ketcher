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

import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import {
  AtomAttr,
  AtomDelete,
  BondAdd,
  BondAttr,
  BondDelete,
} from '../operations';
import { SGroupAttachmentPointRemove } from '../operations/sgroup/sgroupAttachmentPoints';
import { atomGetDegree, atomGetSGroups } from './utils';
import { mergeFragmentsIfNeeded } from './atom';
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup';
import { fromBondStereoUpdate } from './bondStereo';
import { Action } from './action';
import type ReStruct from 'application/render/restruct/restruct';

export function fromAtomMerge(
  restruct: ReStruct,
  srcId: number,
  dstId: number,
): Action {
  if (srcId === dstId) return new Action();

  const fragAction = new Action();
  mergeFragmentsIfNeeded(fragAction, restruct, srcId, dstId);

  const action = new Action();

  const atomNeighbors = restruct.molecule.atomGetNeighbors(srcId) ?? [];
  atomNeighbors.forEach((nei) => {
    const bond = restruct.molecule.bonds.get(nei.bid);
    if (!bond) return;

    if (dstId === bond.begin || dstId === bond.end) {
      // src & dst have one nei
      action.addOp(new BondDelete(nei.bid));
      return;
    }

    const begin = bond.begin === nei.aid ? nei.aid : dstId;
    const end = bond.begin === nei.aid ? dstId : nei.aid;

    const mergeBondId = restruct.molecule.findBondId(begin, end);

    if (mergeBondId === null) {
      action.addOp(new BondAdd(begin, end, bond));
    } else {
      // replace old bond with new bond
      const attrs = Bond.getAttrHash(bond);
      Object.keys(attrs).forEach((key) => {
        action.addOp(new BondAttr(mergeBondId, key, attrs[key]));
      });
    }

    action.addOp(new BondDelete(nei.bid));
  });

  const srcAtom = restruct.molecule.atoms.get(srcId);
  if (!srcAtom) {
    return action.perform(restruct).mergeWith(fragAction);
  }
  const attrs = Atom.getAttrHash(srcAtom);

  if (atomGetDegree(restruct, srcId) === 1 && attrs.label === '*') {
    attrs.label = 'C';
  }

  Object.keys(attrs).forEach((key) => {
    if (key !== 'stereoLabel' && key !== 'stereoParity') {
      action.addOp(new AtomAttr(dstId, key, attrs[key]));
    }
  });

  const sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, srcId);

  if (sgChanged) removeSgroupIfNeeded(action, restruct, [srcId]);

  const sgroups = atomGetSGroups(restruct, srcId);
  sgroups.forEach((sgroupId: number) => {
    const sgroup = restruct.sgroups.get(sgroupId)?.item;
    if (!sgroup) return;
    for (const attachmentPoint of sgroup.getAttachmentPoints()) {
      if (attachmentPoint.atomId === srcId) {
        action.addOp(
          new SGroupAttachmentPointRemove(
            sgroupId,
            new SGroupAttachmentPoint(srcId, undefined, undefined),
          ),
        );
        return;
      }
    }
  });

  action.addOp(new AtomDelete(srcId));
  const dstAtomNeighbors = restruct.molecule.atomGetNeighbors(dstId) ?? [];
  const bond = restruct.molecule.bonds.get(
    dstAtomNeighbors[0]?.bid ?? atomNeighbors[0]?.bid,
  );

  const stereoAction = bond
    ? fromBondStereoUpdate(restruct, bond)
    : new Action();
  return action.perform(restruct).mergeWith(fragAction).mergeWith(stereoAction);
}
