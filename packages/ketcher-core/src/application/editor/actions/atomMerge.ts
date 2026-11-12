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

import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import {
  AtomAttribute,
  AttachmentGroupAttribute,
  AtomDelete,
  BondAdd,
  BondAttribute,
  BondDelete,
} from '../operations';
import { SGroupAttachmentPointRemove } from '../operations/sgroup/sgroupAttachmentPoints';
import { atomGetDegree, atomGetSGroups } from './utilities';
import { mergeFragmentsIfNeeded } from './atom';
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup';
import { fromBondStereoUpdate } from './bondStereo';
import { Action } from './action';
import type ReStruct from 'application/render/restruct/restruct';
import { isAtomMergeAllowedByHapticBonds } from 'domain/helpers/hapticBond';

function replaceAttachmentGroupAtomId(
  atomIds: number[],
  sourceId: number,
  destinationId: number,
) {
  return Array.from(
    new Set(
      atomIds.map((atomId) => (atomId === sourceId ? destinationId : atomId)),
    ),
  );
}

function updateAttachmentGroupsAfterAtomMerge(
  action: Action,
  restruct: ReStruct,
  sourceId: number,
  destinationId: number,
) {
  restruct.molecule.attachmentGroups.forEach((attachmentGroup, id) => {
    if (!attachmentGroup.atomIds.includes(sourceId)) return;

    action.addOp(
      new AttachmentGroupAttribute(
        id,
        'atomIds',
        replaceAttachmentGroupAtomId(
          attachmentGroup.atomIds,
          sourceId,
          destinationId,
        ),
      ),
    );
  });
}

export function fromAtomMerge(
  restruct: ReStruct,
  sourceId: number,
  destinationId: number,
): Action {
  if (sourceId === destinationId) return new Action();
  if (!restruct.molecule.atoms.has(destinationId)) return new Action();

  const sourceAtom = restruct.molecule.atoms.get(sourceId);
  const destinationAtom = restruct.molecule.atoms.get(destinationId);
  if (sourceAtom && destinationAtom) {
    const mergedAtomLabel =
      atomGetDegree(restruct, sourceId) === 1 && sourceAtom.label === '*'
        ? 'C'
        : sourceAtom.label;
    if (
      !isAtomMergeAllowedByHapticBonds(
        restruct.molecule,
        sourceId,
        destinationId,
        mergedAtomLabel,
      )
    ) {
      return new Action();
    }
  }

  const fragAction = new Action();
  mergeFragmentsIfNeeded(fragAction, restruct, sourceId, destinationId);

  const action = new Action();

  const atomNeighbors = restruct.molecule.atomGetNeighbors(sourceId) ?? [];
  atomNeighbors.forEach((nei) => {
    const bond = restruct.molecule.bonds.get(nei.bid);
    if (!bond) return;

    if (destinationId === bond.begin || destinationId === bond.end) {
      // src & dst have one nei
      action.addOp(new BondDelete(nei.bid));
      return;
    }

    const begin = bond.begin === nei.aid ? nei.aid : destinationId;
    const end = bond.begin === nei.aid ? destinationId : nei.aid;

    const mergeBondId = restruct.molecule.findBondId(begin, end);

    if (mergeBondId === null) {
      action.addOp(new BondAdd(begin, end, bond));
    } else {
      // replace old bond with new bond
      const attributes = Bond.getAttrHash(bond);
      Object.keys(attributes).forEach((key) => {
        const attributeKey = key as keyof typeof attributes;
        action.addOp(
          new BondAttribute(
            mergeBondId,
            attributeKey,
            attributes[attributeKey],
          ),
        );
      });
    }

    action.addOp(new BondDelete(nei.bid));
  });

  if (!sourceAtom) {
    return action.perform(restruct).mergeWith(fragAction);
  }
  const attributes = Atom.getAttrHash(sourceAtom);

  if (atomGetDegree(restruct, sourceId) === 1 && attributes.label === '*') {
    attributes.label = 'C';
  }

  Object.keys(attributes).forEach((key) => {
    if (key !== 'stereoLabel' && key !== 'stereoParity') {
      action.addOp(new AtomAttribute(destinationId, key, attributes[key]));
    }
  });

  updateAttachmentGroupsAfterAtomMerge(
    action,
    restruct,
    sourceId,
    destinationId,
  );

  const sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, sourceId);

  if (sgChanged) removeSgroupIfNeeded(action, restruct, [sourceId]);

  const sgroups = atomGetSGroups(restruct, sourceId);
  sgroups.forEach((sgroupId: number) => {
    const sgroup = restruct.sgroups.get(sgroupId)?.item;
    if (!sgroup) return;
    for (const attachmentPoint of sgroup.getAttachmentPoints()) {
      if (attachmentPoint.atomId === sourceId) {
        action.addOp(
          new SGroupAttachmentPointRemove(sgroupId, attachmentPoint),
        );
        return;
      }
    }
  });

  action.addOp(new AtomDelete(sourceId));
  const destinationAtomNeighbors =
    restruct.molecule.atomGetNeighbors(destinationId) ?? [];
  const bond = restruct.molecule.bonds.get(
    destinationAtomNeighbors[0]?.bid ?? atomNeighbors[0]?.bid,
  );

  const stereoAction = bond
    ? fromBondStereoUpdate(restruct, bond)
    : new Action();
  return action.perform(restruct).mergeWith(fragAction).mergeWith(stereoAction);
}
