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
  AtomAttr,
  AtomMove,
  SGroupAddToHierarchy,
  SGroupAtomAdd,
  SGroupAtomRemove,
  SGroupAttr,
  SGroupCreate,
  SGroupDataMove,
  SGroupDelete,
  SGroupRemoveFromHierarchy,
} from '../operations';
import { Pile, SGroup, SGroupAttachmentPoint, Vec2 } from 'domain/entities';
import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils';

import { Action } from './action';
import { Coordinates, SgContexts } from '..';
import { uniq } from 'lodash/fp';
import { fromAtomsAttrs } from './atom';
import {
  SGroupAttachmentPointAdd,
  SGroupAttachmentPointRemove,
} from 'application/editor/operations/sgroup/sgroupAttachmentPoints';
import Restruct from 'application/render/restruct/restruct';
import assert from 'assert';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { isNumber } from 'lodash';

export function fromSeveralSgroupAddition(
  restruct: Restruct,
  type,
  atoms,
  attrs,
) {
  const attachmentPoints = [];

  const descriptors = attrs.fieldValue;
  if (typeof descriptors === 'string' || type !== 'DAT') {
    return fromSgroupAddition(
      restruct,
      type,
      atoms,
      attrs,
      restruct.molecule.sgroups.newId(),
      attachmentPoints,
    );
  }

  return descriptors.reduce((acc, fValue) => {
    const localAttrs = Object.assign({}, attrs);
    localAttrs.fieldValue = fValue;

    return acc.mergeWith(
      fromSgroupAddition(
        restruct,
        type,
        atoms,
        localAttrs,
        restruct.molecule.sgroups.newId(),
        attachmentPoints,
      ),
    );
  }, new Action());
}

export function fromSgroupAttrs(restruct, id, attrs) {
  const action = new Action();

  Object.keys(attrs).forEach((key) => {
    action.addOp(new SGroupAttr(id, key, attrs[key]));
  });

  return action.perform(restruct);
}

export function setExpandSGroup(
  restruct: Restruct,
  sgid: number,
  attrs: { expanded: boolean },
) {
  const action = new Action();

  Object.keys(attrs).forEach((key) => {
    action.addOp(new SGroupAttr(sgid, key, attrs[key]));
  });

  const sgroup = restruct.molecule.sgroups.get(sgid);
  assert(sgroup != null);
  const atoms = SGroup.getAtoms(restruct, sgroup);

  atoms.forEach((aid) => {
    action.mergeWith(
      fromAtomsAttrs(restruct, aid, restruct.atoms.get(aid)?.a, false),
    );
  });

  return action.perform(restruct);
}

export function setExpandMonomerSGroup(
  restruct: Restruct,
  sgid: number,
  attrs: { expanded: boolean },
) {
  const action = new Action();

  const sGroup = restruct.molecule.sgroups.get(sgid);
  assert(sGroup != null);

  if (attrs.expanded === sGroup.isExpanded()) {
    return action;
  }

  Object.keys(attrs).forEach((key) => {
    action.addOp(new SGroupAttr(sgid, key, attrs[key]));
  });

  const sGroupAtoms = SGroup.getAtoms(restruct, sGroup);
  const attachmentPoints = sGroup.getAttachmentPoints();
  const bondsToOutside = restruct.molecule.bonds.filter((_, bond) => {
    return (
      (sGroupAtoms.includes(bond.begin) && !sGroupAtoms.includes(bond.end)) ||
      (sGroupAtoms.includes(bond.end) && !sGroupAtoms.includes(bond.begin))
    );
  });

  const attachmentAtomsFromOutside: number[] = [];

  for (const bond of bondsToOutside.values()) {
    if (
      attachmentPoints.some(
        (attachmentPoint) => attachmentPoint.atomId === bond.begin,
      )
    ) {
      attachmentAtomsFromOutside.push(bond.end);
    } else {
      attachmentAtomsFromOutside.push(bond.begin);
    }
  }

  const sGroupBBox = SGroup.getObjBBox(sGroupAtoms, restruct.molecule);
  const sGroupWidth = sGroupBBox.p1.x - sGroupBBox.p0.x;
  const sGroupHeight = sGroupBBox.p1.y - sGroupBBox.p0.y;


  // const canvas = document.querySelector('.Ketcher-root svg');
  // const structureRectangle = document.createElementNS(
  //   'http://www.w3.org/2000/svg',
  //   'rect',
  // );
  // const p0x = sgroup?.pp?.x - 0.5;
  // const p0y = sgroup?.pp?.y - 0.5;
  // structureRectangle.setAttribute('x', `${p0x * 40}`);
  // structureRectangle.setAttribute('y', `${p0y * 40}`);
  // structureRectangle.setAttribute(
  //   'width',
  //   `${(p0x + 1) * 40}`,
  // );
  // structureRectangle.setAttribute(
  //   'height',
  //   `${(p0y + 0.5) * 40}`,
  // );
  // structureRectangle.setAttribute('fill', 'none');
  // structureRectangle.setAttribute('stroke', 'red');
  // structureRectangle.setAttribute('stroke-width', '2');
  // canvas?.appendChild(structureRectangle);

  const visitedAtoms = new Set<number>();
  const visitedSGroups = new Set<number>();

  const atomsToMove = new Map<number, number[]>();
  const sGroupsToMove = new Map<number, number[]>();

  const prepareSubStructure = (atomId: number, subStructureKey: number) => {
    if (visitedAtoms.has(atomId)) {
      return;
    }
    visitedAtoms.add(atomId);

    const atomSGroups = restruct.atoms.get(atomId)?.a.sgs;
    const atomInSGroup = atomSGroups && atomSGroups.size > 0;
    if (atomInSGroup) {
      for (const anotherSGroupId of atomSGroups.values()) {
        if (visitedSGroups.has(anotherSGroupId) || anotherSGroupId === sgid) {
          continue;
        }
        visitedSGroups.add(anotherSGroupId);

        const anotherSGroup = restruct.molecule.sgroups.get(anotherSGroupId);
        if (!anotherSGroup) {
          continue;
        }

        const previousArray = sGroupsToMove.get(subStructureKey) ?? [];
        sGroupsToMove.set(
          subStructureKey,
          previousArray.concat(anotherSGroupId),
        );
      }
    }

    const atom = restruct.atoms.get(atomId);
    if (atom) {
      const previousArray = atomsToMove.get(subStructureKey) ?? [];
      atomsToMove.set(subStructureKey, previousArray.concat(atomId));

      atom.a.neighbors.forEach((halfBondId) => {
        const neighborAtomId =
          restruct.molecule?.halfBonds?.get(halfBondId)?.end;
        if (
          neighborAtomId === undefined ||
          sGroupAtoms.includes(neighborAtomId)
        ) {
          return;
        }

        // TODO: Rewrite recursion to iteration approach as it leads to incorrect movement order for RNA bases
        prepareSubStructure(neighborAtomId, subStructureKey);
      });
    }
  };

  attachmentAtomsFromOutside.forEach((atomId, index) => {
    prepareSubStructure(atomId, index);
  });

  const handledAtoms = new Set<number>();
  const handledBonds = new Set<number>();

  let expandedMonomersInLine = [...sGroupsToMove.values()].some((sGroupIds) => {
    return sGroupIds.some((sGroupId) => {
      const anotherSGroup = restruct.molecule.sgroups.get(sGroupId);
      if (!anotherSGroup) {
        return false;
      }

      const sGroupCenter = sGroup.isContracted() ? sGroup.getContractedPosition(
        restruct.molecule,
      ).position : sGroup.pp;
      const anotherSGroupCenter = anotherSGroup.isContracted() ? anotherSGroup.getContractedPosition(
        restruct.molecule,
      ).position : anotherSGroup?.pp;
      if (!anotherSGroupCenter || !sGroupCenter) {
        return false;
      }

      const MOVE_THRESHOLD = 0.5;
      const inOneLine = (anotherSGroupCenter.y < sGroupCenter.y + MOVE_THRESHOLD &&
        anotherSGroupCenter.y > sGroupCenter.y - MOVE_THRESHOLD);

      return inOneLine && anotherSGroup.isExpanded();
    });
  });

  sGroupsToMove.forEach((sGroupIds) => {
    if (sGroupsToMove.size === 1) {
      return;
    }

    let isVerticalMovementStarted = false;
    sGroupIds.forEach((sGroupId) => {
      const movableSGroup = restruct.molecule.sgroups.get(sGroupId);
      if (!movableSGroup) {
        return;
      }

      const sGroupCenter = sGroup.isContracted() ? sGroup.getContractedPosition(
        restruct.molecule,
      ).position : sGroup.pp;
      const movableSGroupCenter = movableSGroup.isContracted() ? movableSGroup.getContractedPosition(
        restruct.molecule,
      ).position : movableSGroup?.pp;
      if (!movableSGroupCenter || !sGroupCenter) {
        return;
      }

      const movableSGroupAtoms = SGroup.getAtoms(restruct, movableSGroup);
      const movableSGroupBondsToOutside = restruct.molecule.bonds.filter((_, bond) => {
        return (
          (movableSGroupAtoms.includes(bond.begin) && !movableSGroupAtoms.includes(bond.end)) ||
          (movableSGroupAtoms.includes(bond.end) && !movableSGroupAtoms.includes(bond.begin))
        );
      });

      const movableSGroupBBox = SGroup.getObjBBox(sGroupAtoms, restruct.molecule);
      const movableSGroupWidth = movableSGroupBBox.p1.x - movableSGroupBBox.p0.x;
      const movableSGroupHeight = movableSGroupBBox.p1.y - movableSGroupBBox.p0.y;

      // console.log(movableSGroup.data, movableSGroupBondsToOutside);
      // movableSGroupBondsToOutside.forEach(bond => handledBonds.add(bond.));

      const MOVE_THRESHOLD = 0.5;
      const BIG_THRESHOLD = 2;

      const movableSGroupAbove = movableSGroupCenter.y < sGroupCenter.y;
      const movableSGroupHeightToUse = movableSGroupAbove ? movableSGroupHeight : -movableSGroupHeight;
      // For collapsing move vertically always if there is still expanded monomer in line
      const isMoveVertically = attrs.expanded ?
        ((movableSGroup.isContracted() ? movableSGroupCenter.y : movableSGroupCenter.y + movableSGroupHeightToUse / 2) <
          sGroupCenter.y + movableSGroupHeight / 2 + MOVE_THRESHOLD) &&
        ((movableSGroup.isContracted() ? movableSGroupCenter.y : movableSGroupCenter.y + movableSGroupHeightToUse / 2) >
          sGroupCenter.y - movableSGroupHeight / 2 - MOVE_THRESHOLD) :
      !expandedMonomersInLine;

      // Move horizontally if monomer is in wide area and not having any other connections (for RNAs/DNAs)
      const inOneLine = (movableSGroupCenter.y < sGroupCenter.y + MOVE_THRESHOLD &&
        movableSGroupCenter.y > sGroupCenter.y - MOVE_THRESHOLD);
      const inLargeLine = (movableSGroupCenter.y < sGroupCenter.y + BIG_THRESHOLD &&
        movableSGroupCenter.y > sGroupCenter.y - BIG_THRESHOLD);
      const hasAdditionalConnections = [...movableSGroupBondsToOutside.keys()].some((bondId) => !handledBonds.has(bondId));
      movableSGroupBondsToOutside.forEach((_, bondId) => handledBonds.add(bondId));
      console.log(movableSGroup.data);
      console.log('moveVertically', isMoveVertically);
      console.log('handledBonds', handledBonds, 'bondsToOutside', movableSGroupBondsToOutside);
      console.log('oneLine', inOneLine, 'largeLine', inLargeLine, 'additionalConnections', hasAdditionalConnections);
      // const isMoveHorizontally =
      //   (movableSGroupCenter.y < sGroupCenter.y + MOVE_THRESHOLD &&
      //   movableSGroupCenter.y > sGroupCenter.y - MOVE_THRESHOLD) || (
      //     movableSGroupCenter.y < sGroupCenter.y + BIG_THRESHOLD &&
      //     movableSGroupCenter.y > sGroupCenter.y - BIG_THRESHOLD &&
      //       ![...movableSGroupBondsToOutside.keys()].some((bondId) => handledBonds.has(bondId))
      //   );
      const isMoveHorizontally = inOneLine || (inLargeLine && !hasAdditionalConnections);
      console.log('moveHorizontally', isMoveHorizontally);
      const isMoveDown = movableSGroupCenter.y > sGroupCenter.y;
      const isMoveUp = movableSGroupCenter.y < sGroupCenter.y;
      const isMoveRight =
        movableSGroupCenter.x > sGroupCenter.x + MOVE_THRESHOLD;
      const isMoveLeft =
        movableSGroupCenter.x < sGroupCenter.x - MOVE_THRESHOLD;
      if (!isVerticalMovementStarted) {
        isVerticalMovementStarted = !isMoveHorizontally && isMoveVertically;
      }
      console.log('isVerticalMovementStarted', isVerticalMovementStarted);

      const moveVector = new Vec2(
        ((!isMoveHorizontally || isVerticalMovementStarted ? 0 : 1) *
          (isMoveRight ? 1 : isMoveLeft ? -1 : 0) *
          sGroupWidth) /
          2,
        ((isVerticalMovementStarted ? 1 : 0) *
          (isMoveDown ? 1 : isMoveUp ? -1 : 0) *
          sGroupHeight) /
          2,
      );
      const finalMoveVector = attrs.expanded
        ? moveVector
        : moveVector.negated();

      movableSGroupAtoms.forEach((aid) => {
        action.addOp(new AtomMove(aid, finalMoveVector));
        handledAtoms.add(aid);
      });
      action.addOp(new SGroupDataMove(sGroupId, finalMoveVector));
    });
  });

  atomsToMove.forEach((atomIds, key) => {
    // if (handledAtoms.has(key)) {
    //   return;
    // }

    const sGroups = sGroupsToMove.get(key) ?? [];
    const subStructBBox = SGroup.getObjBBox(atomIds, restruct.molecule, true);
    const subStructCenter =
      sGroups.length === -100
        ? restruct.molecule.sgroups.get(sGroups[0]).pp
        : new Vec2(
            subStructBBox.p0.x + (subStructBBox.p1.x - subStructBBox.p0.x) / 2,
            subStructBBox.p0.y + (subStructBBox.p1.y - subStructBBox.p0.y) / 2,
          );
    const sGroupCenter = new Vec2(
      sGroupBBox.p0.x + (sGroupBBox.p1.x - sGroupBBox.p0.x) / 2,
      sGroupBBox.p0.y + (sGroupBBox.p1.y - sGroupBBox.p0.y) / 2,
    );
    const direction = subStructCenter.sub(sGroupCenter).normalized();
    const moveVector = new Vec2(
      (direction.x * sGroupWidth) / 2,
      (direction.y * sGroupHeight) / 2,
    );

    const canvas = document.querySelector('.Ketcher-root svg');
    // const structureRectangle = document.createElementNS(
    //   'http://www.w3.org/2000/svg',
    //   'rect',
    // );
    // structureRectangle.setAttribute('x', `${subStructBBox.p0.x * 40}`);
    // structureRectangle.setAttribute('y', `${subStructBBox.p0.y * 40}`);
    // structureRectangle.setAttribute(
    //   'width',
    //   `${(subStructBBox.p1.x - subStructBBox.p0.x) * 40}`,
    // );
    // structureRectangle.setAttribute(
    //   'height',
    //   `${(subStructBBox.p1.y - subStructBBox.p0.y) * 40}`,
    // );
    // structureRectangle.setAttribute('fill', 'none');
    // structureRectangle.setAttribute('stroke', 'red');
    // structureRectangle.setAttribute('stroke-width', '2');
    // canvas?.appendChild(structureRectangle);
    //
    // const structureCenter = document.createElementNS(
    //   'http://www.w3.org/2000/svg',
    //   'circle',
    // );
    // structureCenter.setAttribute('cx', `${subStructCenter.x * 40}`);
    // structureCenter.setAttribute('cy', `${subStructCenter.y * 40}`);
    // structureCenter.setAttribute('r', '5');
    // structureCenter.setAttribute('fill', 'red');
    // canvas?.appendChild(structureCenter);

    // const sgroupRectangle = document.createElementNS(
    //   'http://www.w3.org/2000/svg',
    //   'rect',
    // );
    // sgroupRectangle.setAttribute('x', `${sGroupBBox.p0.x * 40}`);
    // sgroupRectangle.setAttribute('y', `${sGroupBBox.p0.y * 40}`);
    // sgroupRectangle.setAttribute(
    //   'width',
    //   `${(sGroupBBox.p1.x - sGroupBBox.p0.x) * 40}`,
    // );
    // sgroupRectangle.setAttribute(
    //   'height',
    //   `${(sGroupBBox.p1.y - sGroupBBox.p0.y) * 40}`,
    // );
    // sgroupRectangle.setAttribute('fill', 'none');
    // sgroupRectangle.setAttribute('stroke', 'blue');
    // sgroupRectangle.setAttribute('stroke-width', '2');
    // canvas?.appendChild(sgroupRectangle);
    //
    // const sgroupCenter = document.createElementNS(
    //   'http://www.w3.org/2000/svg',
    //   'circle',
    // );
    // sgroupCenter.setAttribute('cx', `${sGroupCenter.x * 40}`);
    // sgroupCenter.setAttribute('cy', `${sGroupCenter.y * 40}`);
    // sgroupCenter.setAttribute('r', '5');
    // sgroupCenter.setAttribute('fill', 'blue');
    // canvas?.appendChild(sgroupCenter);
    //
    // const sgroupPP = document.createElementNS(
    //   'http://www.w3.org/2000/svg',
    //   'circle',
    // );
    // sgroupPP.setAttribute('cx', `${sGroup.pp.x * 40}`);
    // sgroupPP.setAttribute('cy', `${sGroup.pp.y * 40}`);
    // sgroupPP.setAttribute('r', '5');
    // sgroupPP.setAttribute('fill', 'green');
    // canvas?.appendChild(sgroupPP);

    const finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();

    if (handledAtoms.has(key)) {
      return;
    }

    atomIds.forEach((atomId) => {
      action.addOp(new AtomMove(atomId, finalMoveVector));
    });
    sGroups.forEach((sGroupId) => {
      action.addOp(new SGroupDataMove(sGroupId, finalMoveVector));
    });
  });

  sGroupAtoms.forEach((aid) => {
    action.mergeWith(
      fromAtomsAttrs(restruct, aid, restruct.atoms.get(aid)?.a, false),
    );
  });

  return action.perform(restruct);
}

// todo delete after supporting expand - collapse for 2 attachment points
export function expandSGroupWithMultipleAttachmentPoint(restruct) {
  const action = new Action();

  const struct = restruct.molecule;

  struct.sgroups.forEach((sgroup: SGroup) => {
    if (
      sgroup.isNotContractible(struct) &&
      !(sgroup instanceof MonomerMicromolecule)
    ) {
      action.mergeWith(
        setExpandSGroup(restruct, sgroup.id, {
          expanded: true,
        }),
      );
    }
  });

  return action;
}

export function sGroupAttributeAction(id, attrs) {
  const action = new Action();

  Object.keys(attrs).forEach((key) => {
    action.addOp(new SGroupAttr(id, key, attrs[key]));
  });

  return action;
}

export function fromSgroupDeletion(restruct, id, needPerform = true) {
  let action = new Action();
  const struct = restruct.molecule;

  const sG = restruct.sgroups.get(id).item;

  if (sG.type === 'SRU') {
    struct.sGroupsRecalcCrossBonds();

    sG.neiAtoms.forEach((aid) => {
      if (atomGetAttr(restruct, aid, 'label') === '*') {
        action.addOp(new AtomAttr(aid, 'label', 'C'));
      }
    });
  }

  const sg = struct.sgroups.get(id) as SGroup;
  const atoms = SGroup.getAtoms(struct, sg);
  const attrs = sg.getAttrs();

  action.addOp(new SGroupRemoveFromHierarchy(id));

  atoms.forEach((atom) => {
    action.addOp(new SGroupAtomRemove(id, atom));
  });

  sg.getAttachmentPoints().forEach((attachmentPoint) => {
    action.addOp(new SGroupAttachmentPointRemove(id, attachmentPoint));
  });

  action.addOp(new SGroupDelete(id));

  if (needPerform) {
    action = action.perform(restruct);
  }

  action.mergeWith(sGroupAttributeAction(id, attrs));

  return action;
}

export function fromSgroupAddition(
  restruct,
  type,
  atoms,
  attrs,
  sgid,
  attachmentPoints,
  pp?,
  expanded?,
  name?,
  oldSgroup?,
) {
  // eslint-disable-line
  let action = new Action();

  // TODO: shoud the id be generated when OpSGroupCreate is executed?
  //      if yes, how to pass it to the following operations?
  sgid = sgid - 0 === sgid ? sgid : restruct.molecule.sgroups.newId();

  if (type === 'SUP') {
    action.addOp(new SGroupCreate(sgid, type, pp, expanded, name, oldSgroup));
  } else {
    action.addOp(new SGroupCreate(sgid, type, pp));
  }

  atoms.forEach((atom) => {
    action.addOp(new SGroupAtomAdd(sgid, atom));
  });

  if (type === 'SUP') {
    attachmentPoints.forEach((attachmentPoint) => {
      action.addOp(new SGroupAttachmentPointAdd(sgid, attachmentPoint));
    });
  }

  action.addOp(
    type !== 'DAT'
      ? new SGroupAddToHierarchy(sgid)
      : new SGroupAddToHierarchy(sgid, -1, []),
  );

  action = action.perform(restruct);

  if (type === 'SRU') {
    restruct.molecule.sGroupsRecalcCrossBonds();
    let asteriskAction = new Action();

    restruct.sgroups.get(sgid).item.neiAtoms.forEach((aid) => {
      const plainCarbon = restruct.atoms.get(aid).a.isPlainCarbon();

      if (atomGetDegree(restruct, aid) === 1 && plainCarbon) {
        asteriskAction.addOp(new AtomAttr(aid, 'label', '*'));
      }
    });

    asteriskAction = asteriskAction.perform(restruct);
    asteriskAction.mergeWith(action);
    action = asteriskAction;
  }

  return fromSgroupAttrs(restruct, sgid, attrs).mergeWith(action);
}

export function fromSgroupAction(
  context,
  restruct,
  newSg,
  sourceAtoms,
  selection,
) {
  if (context === SgContexts.Bond) {
    return fromBondAction(restruct, newSg, sourceAtoms, selection);
  }

  const atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
  const newSourceAtoms = uniq(sourceAtoms.concat(atomsFromBonds));

  if (context === SgContexts.Fragment) {
    return fromGroupAction(
      restruct,
      newSg,
      newSourceAtoms,
      Array.from(restruct.atoms.keys()),
    );
  }

  if (context === SgContexts.Multifragment) {
    return fromMultiFragmentAction(restruct, newSg, newSourceAtoms);
  }

  if (context === SgContexts.Group) {
    return fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);
  }

  if (context === SgContexts.Atom) {
    return fromAtomAction(restruct, newSg, newSourceAtoms);
  }

  if (SGroup.isQuerySGroup(newSg)) {
    return fromQueryComponentSGroupAction(
      restruct,
      newSg,
      newSourceAtoms as number[],
      Array.from(restruct.atoms.keys()),
    );
  }

  return {
    action: fromSeveralSgroupAddition(
      restruct,
      newSg.type,
      newSourceAtoms,
      newSg.attrs,
    ),
  };
}

function fromAtomAction(restruct, newSg, sourceAtoms) {
  return sourceAtoms.reduce(
    (acc, atom) => {
      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(restruct, newSg.type, [atom], newSg.attrs),
      );
      return acc;
    },
    {
      action: new Action(),
      selection: {
        atoms: sourceAtoms,
        bonds: [],
      },
    },
  );
}

function fromQueryComponentSGroupAction(
  restruct: Restruct,
  newSg: {
    type: string;
    attrs: object;
  },
  sourceAtoms: number[],
  targetAtoms: number[],
) {
  const selection: {
    atoms: number[];
    bonds: number[];
  } = {
    atoms: [],
    bonds: [],
  };

  const allFragments = new Pile(
    sourceAtoms.map((aid) => restruct.atoms.get(aid)?.a.fragment),
  );

  Array.from(allFragments).forEach((fragId) => {
    const atoms = targetAtoms.reduce((res: number[], aid: number) => {
      const atom = restruct.atoms.get(aid)?.a;
      if (fragId === atom?.fragment) res.push(aid);

      return res;
    }, []);

    const bonds = getAtomsBondIds(restruct.molecule, atoms) as number[];

    selection.atoms = selection.atoms.concat(atoms);
    selection.bonds = selection.bonds.concat(bonds);
  });

  return {
    action: fromSeveralSgroupAddition(
      restruct,
      newSg.type,
      selection.atoms,
      newSg.attrs,
    ),
    selection,
  };
}

function fromGroupAction(restruct, newSg, sourceAtoms, targetAtoms) {
  const allFragments = new Pile(
    sourceAtoms.map((aid) => restruct.atoms.get(aid).a.fragment),
  );

  return Array.from(allFragments).reduce(
    (acc, fragId) => {
      const atoms = targetAtoms.reduce((res, aid) => {
        const atom = restruct.atoms.get(aid).a;
        if (fragId === atom.fragment) res.push(aid);

        return res;
      }, []);

      const bonds = getAtomsBondIds(restruct.molecule, atoms);

      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs),
      );

      acc.selection.atoms = acc.selection.atoms.concat(atoms);
      acc.selection.bonds = acc.selection.bonds.concat(bonds);

      return acc;
    },
    {
      action: new Action(),
      selection: {
        atoms: [],
        bonds: [],
      },
    },
  );
}

function fromBondAction(restruct, newSg, sourceAtoms, currSelection) {
  const struct = restruct.molecule;
  let bonds = getAtomsBondIds(struct, sourceAtoms);

  if (currSelection.bonds) bonds = uniq(bonds.concat(currSelection.bonds));

  return bonds.reduce(
    (acc: any, bondid) => {
      const bond = struct.bonds.get(bondid);

      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(
          restruct,
          newSg.type,
          [bond.begin, bond.end],
          newSg.attrs,
        ),
      );

      acc.selection.bonds.push(bondid);

      return acc;
    },
    {
      action: new Action(),
      selection: {
        atoms: sourceAtoms,
        bonds: [],
      },
    },
  );
}

function fromMultiFragmentAction(restruct, newSg, atoms) {
  const bonds = getAtomsBondIds(restruct.molecule, atoms);
  return {
    action: fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs),
    selection: {
      atoms,
      bonds,
    },
  };
}

// Add action operation to remove atom from s-group if needed
export function removeAtomFromSgroupIfNeeded(action, restruct, id) {
  const sgroups = atomGetSGroups(restruct, id);

  if (sgroups.length > 0) {
    sgroups.forEach((sid) => {
      action.addOp(new SGroupAtomRemove(sid, id));
    });

    return true;
  }

  return false;
}

// Add action operations to remove whole s-group if needed
export function removeSgroupIfNeeded(action, restruct: Restruct, atoms) {
  const struct = restruct.molecule;
  const sgCounts = new Map();

  atoms.forEach((atomId) => {
    const sgroups = atomGetSGroups(restruct, atomId);

    sgroups.forEach((sid) => {
      sgCounts.set(sid, sgCounts.has(sid) ? sgCounts.get(sid) + 1 : 1);
    });
  });

  sgCounts.forEach((count, sid) => {
    const sGroup = restruct.sgroups.get(sid)?.item;
    const sgAtoms = SGroup.getAtoms(restruct.molecule, sGroup);

    if (sgAtoms.length === count && !sGroup?.isSuperatomWithoutLabel) {
      // delete whole s-group
      const sgroup = struct.sgroups.get(sid) as SGroup;
      action.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
      action.addOp(new SGroupRemoveFromHierarchy(sid));
      sgroup.getAttachmentPoints().forEach((attachmentPoint) => {
        action.addOp(new SGroupAttachmentPointRemove(sid, attachmentPoint));
      });
      action.addOp(new SGroupDelete(sid));
    }

    if (
      sGroup?.isSuperatomWithoutLabel &&
      sGroup.getAttachmentPoints().length === 0
    ) {
      action.mergeWith(fromSgroupDeletion(restruct, sid, false));
    }
  });
}

function getAtomsBondIds(struct, atoms) {
  const atomSet = new Pile(atoms);

  return Array.from(struct.bonds.keys()).filter((bid) => {
    const bond = struct.bonds.get(bid);
    return atomSet.has(bond.begin) && atomSet.has(bond.end);
  });
}

function getAtomsFromBonds(struct, bonds) {
  bonds = bonds || [];
  return bonds.reduce((acc, bondid) => {
    const bond = struct.bonds.get(bondid);
    acc = acc.concat([bond.begin, bond.end]);
    return acc;
  }, []);
}

export function fromSgroupAttachmentPointAddition(
  restruct: Restruct,
  sgroupId: number,
  attachmentPoint: SGroupAttachmentPoint,
) {
  let action = new Action();

  action.addOp(new SGroupAttachmentPointAdd(sgroupId, attachmentPoint));
  action = action.perform(restruct);

  return action;
}

export function fromSgroupAttachmentPointRemove(
  restruct: Restruct,
  sgroupId: number,
  atomId: number,
  leaveAtomId?: number,
  needPerform = true,
) {
  let action = new Action();
  const struct = restruct.molecule;
  const sgroup = struct.sgroups.get(sgroupId);
  const atomAttachmentPoints = sgroup
    ?.getAttachmentPoints()
    .filter((attachmentPoint) => attachmentPoint.atomId === atomId);
  atomAttachmentPoints?.forEach((attachmentPoint) => {
    if (
      sgroup &&
      (!isNumber(attachmentPoint.leaveAtomId) ||
        attachmentPoint.leaveAtomId === leaveAtomId)
    ) {
      action.addOp(new SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
    }
  });

  if (needPerform) {
    action = action.perform(restruct);
  }

  return action;
}
