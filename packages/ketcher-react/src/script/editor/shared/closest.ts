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
  type ReStruct,
  type ImageReferencePositionInfo,
  type RenderOptions,
  Fragment,
  Vec2,
  Scale,
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
  FunctionalGroup,
  getOrThrow,
  atomsForBondNotFoundMessage,
  entityNotFoundMessage,
  assert,
  KetcherLogger,
} from 'ketcher-core';
import type {
  ClosestItem,
  ClosestItemWithMap,
  MergeResult,
  SelectedItems,
  SkipItem,
} from './closest.types';

type ClosestFunctionOptions = RenderOptions & { showStereoFlags?: boolean };
type FindMapFn = (
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | undefined,
  minDist: number | undefined,
  options: ClosestFunctionOptions,
) => ClosestItem<unknown> | undefined;

const SELECTION_DISTANCE_COEFFICIENT = 0.4;
const SELECTION_WITHIN_TEXT = 0;
const SELECTION_DISTANCE_COEFFICIENT_FOR_ATTACHMENT_GROUP = 0.5;

const findMaps: Record<string, FindMapFn> = {
  atoms: findClosestAtom,
  attachmentGroups: findClosestAttachmentGroup,
  bonds: findClosestBond,
  enhancedFlags: findClosestEnhancedFlag,
  sgroupData: findClosestDataSGroupData,
  sgroups: findClosestSGroup,
  functionalGroups: findClosestFG,
  rxnArrows: findClosestRxnArrow,
  rxnPluses: findClosestRxnPlus,
  frags: findClosestFrag,
  rgroups: findClosestRGroup,
  rgroupAttachmentPoints: findClosestRgroupAttachmentPoints,
  simpleObjects: findClosestSimpleObject,
  texts: findClosestText,
  [MULTITAIL_ARROW_KEY]: findClosestMultitailArrow,
  [IMAGE_KEY]: findClosestImage,
};

type ClosestReturnType<T = Vec2> = ClosestItem<T> | undefined;
type RefPoint = Vec2 | null | undefined;

function rectangleContainsPoint(
  startX: number,
  startY: number,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  return (
    startX <= x && x <= startX + width && startY <= y && y <= startY + height
  );
}

function clampCoordinate(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculateDistanceToText(
  cursorPosition: Vec2,
  referencePoints: Vec2[],
) {
  const topLeft = referencePoints[0];
  const bottomRight = referencePoints[2]; // [top-left, bottom-left, bottom-right, top-right]
  // Use min/max in case reference points are provided in an unexpected order
  const minX = Math.min(topLeft.x, bottomRight.x);
  const maxX = Math.max(topLeft.x, bottomRight.x);
  const minY = Math.min(topLeft.y, bottomRight.y);
  const maxY = Math.max(topLeft.y, bottomRight.y);
  const clampedX = clampCoordinate(cursorPosition.x, minX, maxX);
  const clampedY = clampCoordinate(cursorPosition.y, minY, maxY);

  if (clampedX === cursorPosition.x && clampedY === cursorPosition.y) {
    return SELECTION_WITHIN_TEXT;
  }

  return Vec2.dist(new Vec2(clampedX, clampedY), cursorPosition);
}

function findClosestText(restruct: ReStruct, cursorPosition: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let ret: ClosestReturnType = undefined;

  restruct.texts.forEach((text, id) => {
    const dist = calculateDistanceToText(
      cursorPosition,
      text.getReferencePoints(),
    );

    if (dist < SELECTION_DISTANCE_COEFFICIENT && (!ret || dist < minDist)) {
      minDist = dist;
      ret = { id, dist: minDist };
    }
  });
  return ret;
}

function findClosestSimpleObject(restruct: ReStruct, pos: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let refPoint: RefPoint = undefined;
  let ret: ClosestReturnType = undefined;

  restruct.simpleObjects.forEach((simpleObject, id) => {
    const dist = simpleObject.calcDistance(
      pos,
      restruct.render.options.microModeScale,
    );

    if (dist.minDist < 0.3 && (!ret || dist.minDist < minDist)) {
      minDist = dist.minDist;
      refPoint = dist.refPoint;

      ret = { id, dist: minDist, ref: refPoint };
    }
  });
  return ret;
}

function findClosestAtom(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null | undefined,
  minDist: number | null | undefined,
) {
  let closestAtom: number | undefined = undefined;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'atoms' ? skip.id : undefined;
  const sGroups = restruct.sgroups;
  const functionalGroups = restruct.molecule.functionalGroups;

  let effectiveMinDist: number = Math.min(minDist ?? maxMinDist, maxMinDist);

  restruct.visibleAtoms.forEach((atom, aid) => {
    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom.a,
        sGroups,
        functionalGroups,
      )
    ) {
      return;
    }

    const isSkippedAtom = aid === skipId || atom.a.isPreview;
    if (isSkippedAtom) {
      return;
    }

    const dist = Vec2.dist(pos, atom.a.pp);

    if (dist < effectiveMinDist) {
      closestAtom = aid;
      effectiveMinDist = dist;
    }
  });

  if (closestAtom !== undefined) {
    return {
      id: closestAtom,
      dist: effectiveMinDist,
    };
  }

  return undefined;
}

function findClosestAttachmentGroup(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null | undefined,
  minDist: number | null | undefined,
) {
  let closestId: number | undefined = undefined;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT_FOR_ATTACHMENT_GROUP;
  const skipId = skip?.map === 'attachmentGroups' ? skip.id : undefined;
  let effectiveMinDist = Math.min(minDist ?? maxMinDist, maxMinDist);

  restruct.visibleAttachmentGroups.forEach((attachmentGroup, id) => {
    if (id === skipId) return;
    const dist = Vec2.dist(pos, attachmentGroup.a.pp);
    if (
      dist < effectiveMinDist ||
      (minDist !== undefined && dist === effectiveMinDist)
    ) {
      closestId = id;
      effectiveMinDist = dist;
    }
  });

  return closestId === undefined
    ? undefined
    : { id: closestId, dist: effectiveMinDist };
}

function findClosestBond(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | undefined,
  minDist: number | undefined,
  options: ClosestFunctionOptions,
) {
  let closestBond: number | undefined = undefined;
  let closestBondCenter: number | undefined = undefined;
  const maxMinDist = 0.8 * SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'bonds' ? skip.id : undefined;

  let effectiveMinDist: number = Math.min(minDist ?? maxMinDist, maxMinDist);

  let minCDist = effectiveMinDist;
  let minFoundCDist = Infinity;

  restruct.visibleBonds.forEach((bond, bid) => {
    const isSkippedBond = bid === skipId || bond.b.isPreview;
    if (isSkippedBond) {
      return;
    }

    const beginAtom = restruct.getBondEndpoint(bond.b.begin);
    const endAtom = restruct.getBondEndpoint(bond.b.end);
    if (!beginAtom || !endAtom) {
      // visibleBonds is a stale cache mid-batch-edit; skip instead of crashing.
      KetcherLogger.warn(
        atomsForBondNotFoundMessage(bid, bond.b.begin, bond.b.end),
      );
      return;
    }
    const p1 = beginAtom.a.pp;
    const p2 = endAtom.a.pp;

    const mid = Vec2.lc2(p1, 0.5, p2, 0.5);
    const cdist = Vec2.dist(pos, mid);

    const { render } = restruct;
    const hitboxPoints = bond.getSelectionPoints(render);
    const position = Scale.modelToCanvas(pos, options);
    const isPosInsidePolygon = position.isInsidePolygon(hitboxPoints);

    if (isPosInsidePolygon && cdist < minFoundCDist) {
      minCDist = cdist;
      minFoundCDist = cdist;
      closestBondCenter = bid;
    }

    const hb = restruct.molecule.halfBonds.get(bond.b.hb1 as number);
    if (!hb) {
      KetcherLogger.warn(`Half-bond ${bond.b.hb1} for bond ${bid} not found`);
      return;
    }
    const dir = hb.dir;
    const norm = hb.norm;

    const inStripe =
      Vec2.dot(pos.sub(p1), dir) * Vec2.dot(pos.sub(p2), dir) < 0;

    if (inStripe) {
      const dist = Math.abs(Vec2.dot(pos.sub(p1), norm));

      if (dist < effectiveMinDist) {
        closestBond = bid;
        effectiveMinDist = dist;
      }
    }
  });

  if (closestBondCenter !== undefined) {
    return {
      id: closestBondCenter,
      dist: minCDist,
    };
  }

  if (
    closestBond !== undefined &&
    effectiveMinDist > SELECTION_DISTANCE_COEFFICIENT * options.microModeScale
  ) {
    return {
      id: closestBond,
      dist: effectiveMinDist,
    };
  }

  return undefined;
}

function findClosestEnhancedFlag(
  restruct: ReStruct,
  pos: Vec2,
  _skip: SkipItem | undefined,
  _minDist: number | undefined,
  options: ClosestFunctionOptions,
) {
  let minDist;
  let ret: ClosestReturnType = undefined;
  restruct.enhancedFlags.forEach((_item, id) => {
    const fragment = restruct.molecule.frags.get(id);

    if (!fragment?.enhancedStereoFlag || !options.showStereoFlags) return;

    const p = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, id);
    if (!p || Math.abs(pos.x - p.x) >= 1) return;

    const dist = Math.abs(pos.y - p.y);

    if (dist < 0.3 && (!ret || dist < minDist)) {
      minDist = dist;
      ret = { id, dist: minDist };
    }
  });
  return ret;
}

function findClosestDataSGroupData(restruct: ReStruct, pos: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let ret: ClosestReturnType = undefined;

  restruct.sgroupData.forEach((item, id) => {
    if (item.sgroup.type !== 'DAT') throw new Error('Data group expected');

    if (item.sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const box = item.sgroup.dataArea;
      if (!box) {
        return;
      }
      const inBox =
        box.p0.y < pos.y &&
        box.p1.y > pos.y &&
        box.p0.x < pos.x &&
        box.p1.x > pos.x;
      const xDist = Math.min(
        Math.abs(box.p0.x - pos.x),
        Math.abs(box.p1.x - pos.x),
      );

      if (inBox && (ret === undefined || xDist < minDist)) {
        ret = { id, dist: xDist };
        minDist = xDist;
      }
    }
  });

  return ret;
}

function findClosestFrag(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | undefined,
  minDist: number | undefined,
  options: ClosestFunctionOptions,
) {
  minDist = Math.min(
    minDist ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  const struct = restruct.molecule;

  const closestAtom = findClosestAtom(restruct, pos, skip, minDist);

  if (closestAtom) {
    const atom = getOrThrow(
      struct.atoms,
      closestAtom.id,
      entityNotFoundMessage('Atom', closestAtom.id),
    );
    return {
      id: atom.fragment,
      dist: closestAtom.dist,
    };
  }

  const closestBond = findClosestBond(restruct, pos, skip, minDist, options);

  if (closestBond) {
    const fragmentId = struct.getBondFragment(closestBond.id);
    if (fragmentId === undefined) {
      KetcherLogger.warn(`Fragment for bond ${closestBond.id} not found`);
      return undefined;
    }
    return {
      id: fragmentId,
      dist: closestBond.dist,
    };
  }

  return undefined;
}

function findClosestRGroup(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | undefined,
  minDist: number | undefined,
) {
  let effectiveMinDist: number = Math.min(
    minDist ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  let ret: ClosestReturnType = undefined;
  const skipId = skip?.map === 'rgroups' ? skip.id : undefined;

  restruct.rgroups.forEach((rgroup, rgid) => {
    if (rgid !== skipId && rgroup.labelBox?.contains(pos, 0.5)) {
      const dist = Vec2.dist(rgroup.labelBox.centre(), pos);

      if (!ret || dist < effectiveMinDist) {
        effectiveMinDist = dist;
        ret = { id: rgid, dist: effectiveMinDist };
      }
    }
  });

  return ret;
}

/**
 * @param {ReStruct} restruct
 * @param {Vec2} cursorPosition
 * @param {number} minDistToOtherItems
 */
function findClosestRgroupAttachmentPoints(
  restruct: ReStruct,
  cursorPosition: Vec2,
  _skip: SkipItem | undefined,
  minDistToOtherItems: number | undefined,
) {
  let minDist = minDistToOtherItems ?? Number.POSITIVE_INFINITY;
  /** @type {number | undefined} */
  let closestItemId;

  restruct.visibleRGroupAttachmentPoints.forEach((reItem, id) => {
    // Remove readonly from getOutlinePoints return type
    const itemOutlinePoints = [...reItem.getOutlinePoints()];
    const isCursorInsideOutline =
      cursorPosition.isInsidePolygon(itemOutlinePoints);
    if (isCursorInsideOutline) {
      const dist = reItem.getDistanceTo(cursorPosition);
      if (dist < minDist) {
        minDist = dist;
        closestItemId = id;
      }
    }
  });

  return closestItemId === undefined
    ? undefined
    : {
        id: closestItemId,
        dist: minDist,
      };
}

function findClosestRxnArrow(restruct: ReStruct, pos: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let refPoint: RefPoint = undefined;
  let ret: ClosestReturnType = undefined;

  restruct.rxnArrows.forEach((rxnArrow, id) => {
    const dist = rxnArrow.calcDistance(
      pos,
      restruct.render.options.microModeScale,
    );

    if (dist.minDist < 0.3 && (!ret || dist.minDist < minDist)) {
      minDist = dist.minDist;
      refPoint = dist.refPoint;

      ret = { id, dist: minDist, ref: refPoint };
    }
  });
  return ret;
}

function findClosestRxnPlus(restruct: ReStruct, pos: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let ret: ClosestReturnType = undefined;

  restruct.rxnPluses.forEach((plus, id) => {
    const p = plus.item.pp;
    const dist = Math.max(Math.abs(pos.x - p.x), Math.abs(pos.y - p.y));

    if (dist < 0.3 && (!ret || dist < minDist)) {
      minDist = dist;
      ret = { id, dist: minDist };
    }
  });

  return ret;
}

function findClosestSGroup(restruct: ReStruct, pos: Vec2) {
  let ret: number | undefined = undefined;
  let minDist = SELECTION_DISTANCE_COEFFICIENT;

  restruct.molecule.sgroups.forEach((sg, sgid) => {
    if (sg.isSuperatomWithoutLabel) {
      return;
    }

    if (sg.isContracted()) {
      const sGroupPosition = sg.pp;
      if (sGroupPosition) {
        const dist = Vec2.dist(pos, sGroupPosition);
        if (dist < minDist) {
          ret = sgid;
          minDist = dist;
        }
      }

      return;
    }

    const d = sg.bracketDirection;
    const n = d.rotateSC(1, 0);
    const pg = new Vec2(Vec2.dot(pos, d), Vec2.dot(pos, n));

    sg.areas.forEach((box) => {
      const inBox =
        box.p0.y < pg.y &&
        box.p1.y > pg.y &&
        box.p0.x < pg.x &&
        box.p1.x > pg.x;
      const xDist = Math.min(
        Math.abs(box.p0.x - pg.x),
        Math.abs(box.p1.x - pg.x),
      );

      if (inBox && (ret === undefined || xDist < minDist)) {
        ret = sgid;
        minDist = xDist;
      }
    });
  });

  if (ret !== undefined) {
    return {
      id: ret,
      dist: minDist,
    };
  }

  return undefined;
}

function findClosestFG(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | undefined,
) {
  const sGroups = restruct.sgroups;
  const skipId = skip?.map === 'functionalGroups' ? skip.id : undefined;
  for (const [reSGroupId, reSGroup] of sGroups.entries()) {
    if (reSGroupId === skipId) continue;

    const { startX, startY, width, height } =
      reSGroup.getTextHighlightDimensions(restruct.render, 0);
    const { x, y } = Scale.modelToCanvas(pos, restruct.render.options);
    if (rectangleContainsPoint(startX, startY, width, height, x, y)) {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const rectangleCenter = new Vec2(centerX, centerY);
      const cursorPosition = new Vec2(x, y);

      const dist = Vec2.dist(rectangleCenter, cursorPosition);
      const sGroupItem = reSGroup.item;
      assert(sGroupItem, `ReSGroup ${reSGroupId} has no item`);
      const { id } = sGroupItem;
      return { id, dist };
    }
  }
  return undefined;
}

function findClosestItem(
  restruct: ReStruct,
  pos: Vec2,
  maps: string[] | null | undefined,
  skip: SkipItem | null | undefined,
  options: ClosestFunctionOptions,
): ClosestItemWithMap | undefined {
  maps = maps ?? Object.keys(findMaps);
  if (maps.includes('atoms') && !maps.includes('attachmentGroups')) {
    maps = [...maps, 'attachmentGroups'];
  }

  let priorityItem: ClosestItemWithMap | undefined = undefined;

  const closestItem = maps.reduce<ClosestItemWithMap | undefined>((res, mp) => {
    const minDist = res?.dist ?? undefined;
    const item = findMaps[mp](
      restruct,
      pos,
      skip ?? undefined,
      minDist,
      options,
    );

    if (item !== undefined) {
      const enrichedItem: ClosestItemWithMap = {
        map: mp,
        ...item,
      };

      if (mp === 'sgroupData') {
        priorityItem = enrichedItem;
      } else if (
        res === undefined ||
        item.dist < res.dist ||
        (mp === 'attachmentGroups' && item.dist === res.dist)
      ) {
        return enrichedItem;
      }
    }

    return res;
  }, undefined);

  return priorityItem ?? closestItem;
}

/**
 * @param restruct { ReStruct }
 * @param selected { object }
 * @param maps { Array<string> }
 * @param options { RenderOption }
 * @return {{
 * 		atoms: Map<number, number>?
 * 		bonds: Map<number, number>?
 *    atomToFunctionalGroup: Map<number, number>?
 * }}
 */
function findCloseMerge(
  restruct: ReStruct,
  selected: SelectedItems,
  options: ClosestFunctionOptions,
  maps: string[] = ['atoms', 'bonds'],
) {
  const pos: { atoms: Map<number, Vec2>; bonds: Map<number, Vec2> } = {
    atoms: new Map(), // aid -> position
    bonds: new Map(), // bid -> position
  };

  const struct = restruct.molecule;

  selected.atoms.forEach((aid) => {
    const atom = struct.atoms.get(aid);
    if (!atom) return;

    pos.atoms.set(aid, atom.pp);
  });

  selected.bonds.forEach((bid) => {
    const bond = struct.bonds.get(bid);
    if (bond) {
      const beginAtom = struct.getBondEndpoint(bond.begin);
      const endAtom = struct.getBondEndpoint(bond.end);
      if (!beginAtom || !endAtom) {
        // Same stale-cache scenario as findClosestBond: skip instead of crashing.
        KetcherLogger.warn(
          atomsForBondNotFoundMessage(bid, bond.begin, bond.end),
        );
        return;
      }
      pos.bonds.set(bid, Vec2.lc2(beginAtom.pp, 0.5, endAtom.pp, 0.5));
    }
  });

  const result: MergeResult & { [key: string]: Map<number, number> } = {
    atoms: new Map(),
    atomToFunctionalGroup: new Map(),
  };

  maps.forEach((map) => {
    if (map === 'atoms') {
      Array.from(pos.atoms.keys()).forEach((atomId) => {
        const atomPosition = pos.atoms.get(atomId);
        if (!atomPosition) return;
        const merged = mergeAtomToAtom(
          atomId,
          restruct,
          atomPosition,
          selected,
          result,
        );
        if (!merged) {
          mergeAtomToFunctionalGroup(atomId, restruct, atomPosition, result);
        }
      });
    } else {
      const posMap = (pos as Record<string, Map<number, Vec2>>)[map];
      result[map] = Array.from<number>(posMap.keys()).reduce<
        Map<number, number>
      >((res, srcId) => {
        const skip: SkipItem = { map, id: srcId };
        const srcPos = posMap.get(srcId);
        if (!srcPos) return res;
        const item = findMaps[map](restruct, srcPos, skip, undefined, options);

        if (item && !selected[map].includes(item.id)) {
          res.set(srcId, item.id);
        }

        return res;
      }, new Map());
    }
  });

  return result;
}

function mergeAtomToAtom(
  atomId: number,
  restruct: ReStruct,
  atomPosition: Vec2,
  selected: SelectedItems,
  result: MergeResult,
) {
  const skip = { map: 'atoms', id: atomId };
  const closestAtom = findClosestAtom(restruct, atomPosition, skip, undefined);
  if (closestAtom && !selected.atoms.includes(closestAtom.id)) {
    result.atoms.set(atomId, closestAtom.id);
    return true;
  }

  return false;
}

/**
 * @param atomId { number }
 * @param restruct { ReStruct }
 * @param atomPosition { Vec2 }
 * @param result { Object } Mutating arguments!!!
 * @return {boolean}
 */
function mergeAtomToFunctionalGroup(
  atomId: number,
  restruct: ReStruct,
  atomPosition: Vec2,
  result: MergeResult,
) {
  const sgroup = restruct.molecule.getGroupFromAtomId(atomId);
  const isAttachmentAtom = atomId === sgroup?.getAttachmentAtomId();
  if (isAttachmentAtom) {
    return false;
  }

  const closestFunctionalGroup = findClosestFG(
    restruct,
    atomPosition,
    undefined,
  );
  if (closestFunctionalGroup) {
    result.atomToFunctionalGroup.set(atomId, closestFunctionalGroup.id);
    return true;
  }

  return false;
}

function findClosestImage(reStruct: ReStruct, cursorPosition: Vec2) {
  const renderOptions = reStruct.render.options;
  const canvasScaledPosition = Scale.modelToCanvas(
    cursorPosition,
    renderOptions,
  );
  const maxDistance =
    renderOptions.microModeScale * SELECTION_DISTANCE_COEFFICIENT;
  return Array.from(reStruct.images.entries()).reduce(
    (acc: ClosestReturnType<ImageReferencePositionInfo>, [id, item]) => {
      const distanceToPoint = item.calculateDistanceToPoint(
        canvasScaledPosition,
        renderOptions,
      );
      if (distanceToPoint <= maxDistance) {
        if (acc && acc.dist < distanceToPoint) {
          return acc;
        }
        // We would like to grab items under the images and those items should have higher priority then images
        // So we wanna make sure that those items can be grabbed without pixel-perfect pixel-hunting
        const dist = Math.max(distanceToPoint, maxDistance / 3);
        const closestPosition = item.calculateClosestReferencePosition(
          canvasScaledPosition,
          renderOptions,
        );
        const includeRef = closestPosition.distance < maxDistance;
        return {
          id,
          dist: dist / renderOptions.microModeScale,
          ref: includeRef ? closestPosition.ref : undefined,
        };
      }
      return acc;
    },
    undefined,
  );
}

function findClosestMultitailArrow(reStruct: ReStruct, cursorPosition: Vec2) {
  const renderOptions = reStruct.render.options;
  const canvasScaledPosition = Scale.modelToCanvas(
    cursorPosition,
    renderOptions,
  );
  const maxDistance =
    renderOptions.microModeScale * SELECTION_DISTANCE_COEFFICIENT;

  return Array.from(reStruct.multitailArrows.entries()).reduce(
    (acc: ClosestReturnType<unknown>, [id, item]) => {
      const { distance, ref } = item.calculateDistanceToPoint(
        canvasScaledPosition,
        renderOptions,
        maxDistance,
      );
      if (distance <= maxDistance && (!acc || acc.dist > distance)) {
        return { id, dist: distance / renderOptions.microModeScale, ref };
      }
      return acc;
    },
    undefined,
  );
}

export default {
  atom: findClosestAtom, // used in Actions
  item: findClosestItem,
  merge: findCloseMerge,
};
