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
  AtomDelete,
  BondDelete,
} from '../operations';
import {
  BaseMonomer,
  Pile,
  SGroup,
  SGroupAttachmentPoint,
  Vec2,
  BondAttributes,
} from 'domain/entities';
import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils';

import { Action } from './action';
import { SgContexts } from '..';
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
  const sGroupCenter = sGroup.isContracted()
    ? sGroup.getContractedPosition(restruct.molecule).position
    : sGroup.pp;

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

  const sameLine = new Set<number>();
  const complementaryLine = new Set<number>();

  sGroupsToMove.forEach((sGroupIds) => {
    sGroupIds.forEach((sGroupId) => {
      const movableSGroup = restruct.molecule.sgroups.get(sGroupId);
      if (!movableSGroup) {
        return;
      }

      const movableSGroupCenter = movableSGroup.isContracted()
        ? movableSGroup.getContractedPosition(restruct.molecule).position
        : movableSGroup?.pp;
      if (!sGroupCenter || !movableSGroupCenter) {
        return;
      }

      const SAME_LINE_THRESHOLD = 0.5;
      const inOneLine =
        movableSGroupCenter.y < sGroupCenter.y + SAME_LINE_THRESHOLD &&
        movableSGroupCenter.y > sGroupCenter.y - SAME_LINE_THRESHOLD;

      if (inOneLine) {
        sameLine.add(sGroupId);
        return;
      }

      const WIDE_LINE_THRESHOLD = 2;
      const inWideLine =
        movableSGroupCenter.y < sGroupCenter.y + WIDE_LINE_THRESHOLD &&
        movableSGroupCenter.y > sGroupCenter.y - WIDE_LINE_THRESHOLD;

      const movableSGroupAtoms = SGroup.getAtoms(restruct, movableSGroup);
      const movableSGroupBondsToOutside = restruct.molecule.bonds.filter(
        (_, bond) => {
          return (
            (movableSGroupAtoms.includes(bond.begin) &&
              !movableSGroupAtoms.includes(bond.end)) ||
            (movableSGroupAtoms.includes(bond.end) &&
              !movableSGroupAtoms.includes(bond.begin))
          );
        },
      );

      const hasComplementaryBondToMainLine =
        movableSGroupBondsToOutside.size === 1 &&
        [...sameLine.values()].some((sGroupId) => {
          const mainLineSGroup = restruct.molecule.sgroups.get(sGroupId);
          if (!mainLineSGroup) {
            return false;
          }

          const mainLineSGroupAtoms = SGroup.getAtoms(restruct, mainLineSGroup);
          const bond = [...movableSGroupBondsToOutside.values()][0];
          return (
            mainLineSGroupAtoms.includes(bond.begin) ||
            mainLineSGroupAtoms.includes(bond.end)
          );
        });

      if (inWideLine && hasComplementaryBondToMainLine) {
        sameLine.add(sGroupId);
      }
    });
  });

  const largestHeightInLine = [...sameLine.values()].reduce((acc, sGroupId) => {
    const sGroupInLine = restruct.molecule.sgroups.get(sGroupId);
    if (!sGroupInLine) {
      return acc;
    }

    if (sGroupInLine.isContracted()) {
      return acc;
    }

    const sGroupInLineAtoms = SGroup.getAtoms(restruct, sGroupInLine);
    const sGroupInLineBBox = SGroup.getObjBBox(
      sGroupInLineAtoms,
      restruct.molecule,
    );
    const sGroupInLineHeight = sGroupInLineBBox.p1.y - sGroupInLineBBox.p0.y;

    return Math.max(acc, sGroupInLineHeight);
  }, 0);
  const baseVerticalOffset =
    largestHeightInLine > sGroupHeight
      ? 0
      : (sGroupHeight - largestHeightInLine) / 2;
  const horizontalOffset = sGroupWidth / 2;

  const handledAtoms = new Set<number>();
  sGroupsToMove.forEach((sGroupIds) => {
    sGroupIds.forEach((sGroupId) => {
      const movableSGroup = restruct.molecule.sgroups.get(sGroupId);
      if (!movableSGroup) {
        return;
      }

      const movableSGroupCenter = movableSGroup.isContracted()
        ? movableSGroup.getContractedPosition(restruct.molecule).position
        : movableSGroup?.pp;
      if (!sGroupCenter || !movableSGroupCenter) {
        return;
      }

      const moveDown = movableSGroupCenter.y > sGroupCenter.y;
      const moveUp = movableSGroupCenter.y < sGroupCenter.y;
      const moveRight = movableSGroupCenter.x > sGroupCenter.x;
      const moveLeft = movableSGroupCenter.x < sGroupCenter.x;
      const moveHorizontally =
        sameLine.has(sGroupId) || complementaryLine.has(sGroupId);
      const moveVertically = !moveHorizontally;

      let horizontalDirection = 0;
      if (moveRight) {
        horizontalDirection = 1;
      } else if (moveLeft) {
        horizontalDirection = -1;
      }

      let verticalDirection = 0;
      if (moveDown) {
        verticalDirection = 1;
      } else if (moveUp) {
        verticalDirection = -1;
      }

      const moveVector = new Vec2(
        (moveHorizontally ? 1 : 0) * horizontalDirection * horizontalOffset,
        (moveVertically ? 1 : 0) * verticalDirection * baseVerticalOffset,
      );
      const finalMoveVector = attrs.expanded
        ? moveVector
        : moveVector.negated();

      const movableSGroupAtoms = SGroup.getAtoms(restruct, movableSGroup);
      movableSGroupAtoms.forEach((aid) => {
        action.addOp(new AtomMove(aid, finalMoveVector));
        handledAtoms.add(aid);
      });
      action.addOp(new SGroupDataMove(sGroupId, finalMoveVector));
    });
  });

  atomsToMove.forEach((atomIds) => {
    const intactAtoms = atomIds.filter((aid) => !handledAtoms.has(aid));
    if (intactAtoms.length === 0) {
      return;
    }

    const subStructBBox = SGroup.getObjBBox(
      intactAtoms,
      restruct.molecule,
      true,
    );
    const subStructCenter = new Vec2(
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

    const finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();

    intactAtoms.forEach((atomId) => {
      action.addOp(new AtomMove(atomId, finalMoveVector));
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

export function fromSgroupDeletion(restruct: Restruct, id, needPerform = true) {
  let action = new Action();
  const struct = restruct.molecule;

  const sG = restruct.sgroups.get(id)?.item;

  if (sG?.type === 'SRU') {
    struct.sGroupsRecalcCrossBonds();

    sG.neiAtoms.forEach((aid) => {
      if (atomGetAttr(restruct, aid, 'label') === '*') {
        action.addOp(new AtomAttr(aid, 'label', 'C'));
      }
    });
  }

  const atoms = SGroup.getAtoms(struct, sG);
  const attrs = sG?.getAttrs();

  // cache attachment points before any structural changes
  const cachedAttachmentPoints = sG?.getAttachmentPoints().map((ap) => ({
    atomId: ap.atomId,
    leaveAtomId: ap.leaveAtomId,
    attachmentPointNumber: ap.attachmentPointNumber,
  }));

  action.addOp(new SGroupRemoveFromHierarchy(id));

  atoms.forEach((atom) => {
    action.addOp(new SGroupAtomRemove(id, atom));
  });

  sG?.getAttachmentPoints().forEach((attachmentPoint) => {
    action.addOp(new SGroupAttachmentPointRemove(id, attachmentPoint));
  });

  action.addOp(new SGroupDelete(id));

  // After SGroup is deleted, resolve leaving groups on plain structure
  if (sG instanceof MonomerMicromolecule) {
    const monomerCaps = sG.monomer?.monomerItem?.props?.MonomerCaps || {};
    cachedAttachmentPoints?.forEach((attachmentPoint) => {
      const leaveAtomId = attachmentPoint.leaveAtomId;
      const attachmentAtomId = attachmentPoint.atomId;

      if (isNumber(leaveAtomId) && isNumber(attachmentAtomId)) {
        const isOccupied = Array.from(struct.bonds.values()).some(
          ({ begin: bondBegin, end: bondEnd }: BondAttributes) => {
            const isAttached =
              bondBegin === attachmentAtomId || bondEnd === attachmentAtomId;
            if (!isAttached) return false;
            const otherAtomId =
              bondBegin === attachmentAtomId ? bondEnd : bondBegin;
            if (otherAtomId === leaveAtomId) return false;
            return !atoms.includes(otherAtomId);
          },
        );

        if (isOccupied) {
          struct.bonds.forEach(
            (
              { begin: bondBegin, end: bondEnd }: BondAttributes,
              bondId: number,
            ) => {
              if (bondBegin === leaveAtomId || bondEnd === leaveAtomId) {
                action.addOp(new BondDelete(bondId));
              }
            },
          );
          action.addOp(new AtomDelete(leaveAtomId));
        } else {
          const apLabel = `R${attachmentPoint.attachmentPointNumber ?? 0}`;
          const newLabel = monomerCaps?.[apLabel] || 'H';
          action.addOp(new AtomAttr(leaveAtomId, 'label', newLabel));
          action.addOp(new AtomAttr(leaveAtomId, 'rglabel', null));
        }
      }
    });
  }

  action.mergeWith(sGroupAttributeAction(id, attrs));

  if (needPerform) {
    action = action.perform(restruct);
  }

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
  monomer?: BaseMonomer,
) {
  // eslint-disable-line
  let action = new Action();

  // TODO: shoud the id be generated when OpSGroupCreate is executed?
  //      if yes, how to pass it to the following operations?
  sgid = sgid - 0 === sgid ? sgid : restruct.molecule.sgroups.newId();

  if (type === 'SUP') {
    action.addOp(
      new SGroupCreate(sgid, type, pp, expanded, name, oldSgroup, monomer),
    );
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
