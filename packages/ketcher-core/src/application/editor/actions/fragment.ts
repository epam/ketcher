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
  AtomMove,
  BondMove,
  EnhancedFlagMove,
  FragmentAdd,
  FragmentDelete,
  FragmentDeleteStereoAtom,
  FragmentStereoFlag,
  LoopMove,
  RxnArrowMove,
  RxnPlusMove,
  SGroupDataMove,
  SimpleObjectMove,
  TextMove,
} from '../operations';
import { Pile, RGroup, Vec2 } from 'domain/entities';
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup';

import { Action } from './action';
import { fromAtomsFragmentAttr } from './atom';
import { getRelSGroupsBySelection } from './utils';

export function fromMultipleMove(restruct, lists, d) {
  d = new Vec2(d);

  const action = new Action();
  const struct = restruct.molecule;
  const loops = new Pile();
  const atomsToInvalidate = new Pile();

  if (lists.atoms) {
    const atomSet = new Pile(lists.atoms);
    const bondlist: Array<number> = [];

    restruct.bonds.forEach((bond, bid) => {
      if (atomSet.has(bond.b.begin) && atomSet.has(bond.b.end)) {
        bondlist.push(bid);
        // add all adjacent loops
        // those that are not completely inside the structure will get redrawn anyway
        ['hb1', 'hb2'].forEach((hb) => {
          const loop = struct.halfBonds.get(bond.b[hb]).loop;
          if (loop >= 0) loops.add(loop);
        });
        return;
      }

      if (atomSet.has(bond.b.begin)) {
        atomsToInvalidate.add(bond.b.begin);
        return;
      }

      if (atomSet.has(bond.b.end)) atomsToInvalidate.add(bond.b.end);
    });

    bondlist.forEach((bond) => {
      action.addOp(new BondMove(bond, d));
    });

    loops.forEach((loopId) => {
      if (restruct.reloops.get(loopId) && restruct.reloops.get(loopId).visel) {
        // hack
        action.addOp(new LoopMove(loopId, d));
      }
    });

    lists.atoms.forEach((aid) => {
      action.addOp(new AtomMove(aid, d, !atomsToInvalidate.has(aid)));
    });

    if (lists.sgroupData && lists.sgroupData.length === 0) {
      const sgroups = getRelSGroupsBySelection(struct, lists.atoms);
      sgroups.forEach((sg) => {
        action.addOp(new SGroupDataMove(sg.id, d));
      });
    }
  }

  if (lists.rxnArrows) {
    lists.rxnArrows.forEach((rxnArrow) => {
      action.addOp(new RxnArrowMove(rxnArrow, d, true));
    });
  }

  if (lists.rxnPluses) {
    lists.rxnPluses.forEach((rxnPulse) => {
      action.addOp(new RxnPlusMove(rxnPulse, d, true));
    });
  }

  if (lists.simpleObjects) {
    lists.simpleObjects.forEach((simpleObject) => {
      action.addOp(new SimpleObjectMove(simpleObject, d, true));
    });
  }

  if (lists.sgroupData) {
    lists.sgroupData.forEach((sgData) => {
      action.addOp(new SGroupDataMove(sgData, d));
    });
  }

  if (lists.enhancedFlags) {
    lists.enhancedFlags.forEach((fid) => {
      action.addOp(new EnhancedFlagMove(fid, d));
    });
  }

  if (lists.texts) {
    lists.texts.forEach((text) => {
      action.addOp(new TextMove(text, d, true));
    });
  }

  return action.perform(restruct);
}

export function fromStereoFlagUpdate(restruct, frid, flag = null) {
  const action = new Action();

  if (!flag) {
    const struct = restruct.molecule;
    const frag = restruct.molecule.frags.get(frid);
    frag.stereoAtoms.forEach((aid) => {
      if (struct.atoms.get(aid).stereoLabel === null) {
        action.addOp(new FragmentDeleteStereoAtom(frid, aid));
      }
    });
  }

  action.addOp(new FragmentStereoFlag(frid));
  return action.perform(restruct);
}

/**
 * @param restruct { ReStruct }
 * @param aid { number }
 * @param frid { number }
 * @param newfrid { number }
 * @returns { Action }
 */
function processAtom(restruct, aid, frid, newfrid) {
  const queue = [aid];
  const usedIds = new Pile(queue);

  while (queue.length > 0) {
    const id = queue.shift();

    restruct.molecule.atomGetNeighbors(id).forEach((nei) => {
      if (
        restruct.molecule.atoms.get(nei.aid).fragment === frid &&
        !usedIds.has(nei.aid)
      ) {
        usedIds.add(nei.aid);
        queue.push(nei.aid);
      }
    });
  }

  return fromAtomsFragmentAttr(restruct, usedIds, newfrid);
}

/**
 * @param restruct { ReStruct }
 * @param frid { number }
 * @param rgForRemove
 * @return { Action }
 */
// TODO [RB] the thing is too tricky :) need something else in future
export function fromFragmentSplit(
  restruct,
  frid,
  rgForRemove: Array<number> = []
) {
  const action = new Action();
  const rgid = RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);

  restruct.molecule.atoms.forEach((atom, aid) => {
    if (atom.fragment === frid) {
      const newfrid = (
        action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd
      ).frid;

      action.mergeWith(processAtom(restruct, aid, frid, newfrid));

      if (rgid) action.mergeWith(fromRGroupFragment(restruct, rgid, newfrid));
    }
  });

  if (frid !== -1) {
    action.mergeWith(fromRGroupFragment(restruct, 0, frid));
    action.addOp(new FragmentDelete(frid).perform(restruct));
    action.mergeWith(fromUpdateIfThen(restruct, 0, rgid, rgForRemove));
  }

  action.operations.reverse();
  return action;
}
