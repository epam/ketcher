/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  AtomMove,
  AttachmentGroupAttr,
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
  ImageMove,
  MultitailArrowMove,
} from '../operations';
import { Pile } from 'domain/entities/pile';
import { RGroup } from 'domain/entities/rgroup';
import { Vec2 } from 'domain/entities/vec2';
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup';

import { Action } from './action';
import { fromAtomsFragmentAttr } from './atom';
import { getRelSGroupsBySelection } from './utils';
import { IMAGE_KEY, MULTITAIL_ARROW_KEY } from 'domain/constants';

export function fromMultipleMove(restruct, lists, d: Vec2) {
  d = new Vec2(d);

  const action = new Action();
  const struct = restruct.molecule;
  const loops = new Pile<number>();
  const atomsToInvalidate = new Pile<number>();

  if (lists.atoms) {
    const atomSet = new Pile<number>(lists.atoms);
    const bondlist: Array<number> = [];
    const relatedSgroups = getRelSGroupsBySelection(struct, lists.atoms);

    for (const [bid, bond] of restruct.bonds) {
      if (atomSet.has(bond.b.begin) && atomSet.has(bond.b.end)) {
        bondlist.push(bid);
        // add all adjacent loops
        // those that are not completely inside the structure will get redrawn anyway
        for (const hb of ['hb1', 'hb2']) {
          const loop = struct.halfBonds.get(bond.b[hb]).loop;
          if (loop >= 0) loops.add(loop);
        }
        continue;
      }

      if (atomSet.has(bond.b.begin)) {
        atomsToInvalidate.add(bond.b.begin);
        continue;
      }

      if (atomSet.has(bond.b.end)) atomsToInvalidate.add(bond.b.end);
    }

    for (const bond of bondlist) {
      action.addOp(new BondMove(bond, d));
    }

    loops.forEach((loopId) => {
      const loop = restruct.reloops.get(loopId);
      if (loop?.visel) {
        // hack
        action.addOp(new LoopMove(loopId, d));
      }
    });

    for (const aid of lists.atoms) {
      action.addOp(new AtomMove(aid, d, !atomsToInvalidate.has(aid)));
    }

    relatedSgroups.forEach((sgroup) => {
      for (const aid of sgroup?.atoms ?? []) {
        if (!atomSet.has(aid)) {
          action.addOp(new AtomMove(aid, d, true));
        }
      }
    });

    if (lists.sgroupData?.length === 0) {
      relatedSgroups.forEach((sg) => {
        action.addOp(new SGroupDataMove(sg.id, d));
      });
    }
  }

  if (lists.rxnArrows) {
    for (const rxnArrow of lists.rxnArrows) {
      action.addOp(new RxnArrowMove(rxnArrow, d, true));
    }
  }

  if (lists.rxnPluses) {
    for (const rxnPulse of lists.rxnPluses) {
      action.addOp(new RxnPlusMove(rxnPulse, d, true));
    }
  }

  if (lists.simpleObjects) {
    for (const simpleObject of lists.simpleObjects) {
      action.addOp(new SimpleObjectMove(simpleObject, d, true));
    }
  }

  if (lists.sgroupData) {
    for (const sgData of lists.sgroupData) {
      action.addOp(new SGroupDataMove(sgData, d));
    }
  }

  if (lists.enhancedFlags) {
    for (const fid of lists.enhancedFlags) {
      action.addOp(new EnhancedFlagMove(fid, d));
    }
  }

  if (lists.texts) {
    for (const text of lists.texts) {
      action.addOp(new TextMove(text, d, true));
    }
  }

  if (lists[IMAGE_KEY]) {
    for (const image of lists[IMAGE_KEY]) {
      action.addOp(new ImageMove(image, d));
    }
  }

  if (lists[MULTITAIL_ARROW_KEY]) {
    for (const multitailArrow of lists[MULTITAIL_ARROW_KEY]) {
      action.addOp(new MultitailArrowMove(multitailArrow, d));
    }
  }

  return action.perform(restruct);
}

export function fromStereoFlagUpdate(restruct, frid, flag = null) {
  const action = new Action();

  if (!flag) {
    const struct = restruct.molecule;
    const frag = restruct.molecule.frags.get(frid);
    if (frag) {
      for (const aid of frag.stereoAtoms) {
        if (struct.atoms.get(aid).stereoLabel === null) {
          action.addOp(new FragmentDeleteStereoAtom(frid, aid));
        }
      }
    }
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
  const struct = restruct.molecule;
  const atomIds = struct
    .findConnectedComponent(aid)
    .filter((id) => struct.atoms.get(id).fragment === frid);
  const atomAction = fromAtomsFragmentAttr(restruct, atomIds, newfrid);
  const action = new Action();

  for (const [groupId, group] of struct.attachmentGroups) {
    if (group.atomIds.some((id) => atomIds.has(id))) {
      action.addOp(
        new AttachmentGroupAttr(groupId, 'fragment', newfrid).perform(restruct),
      );
    }
  }

  // fromFragmentSplit reverses these operations so undo restores atoms before
  // the group recalculates its fragment from its members.
  return action.mergeWith(atomAction);
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
  rgForRemove: Array<number> = [],
) {
  const action = new Action();
  const rgid = RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);

  for (const [aid, atom] of restruct.molecule.atoms) {
    if (atom.fragment === frid) {
      const newfrid = (
        action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd
      ).frid;

      action.mergeWith(processAtom(restruct, aid, frid, newfrid));

      if (rgid) action.mergeWith(fromRGroupFragment(restruct, rgid, newfrid));
    }
  }

  if (frid !== -1) {
    action.mergeWith(fromRGroupFragment(restruct, 0, frid));
    action.addOp(new FragmentDelete(frid).perform(restruct));
    action.mergeWith(fromUpdateIfThen(restruct, 0, rgid, rgForRemove));
  }

  action.operations.reverse();
  return action;
}
