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
type FindMapFunction = (
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
  options: ClosestFunctionOptions,
) => ClosestItem<unknown> | null;

const SELECTION_DISTANCE_COEFFICIENT = 0.4;
const SELECTION_WITHIN_TEXT = 0;
const SELECTION_DISTANCE_COEFFICIENT_FOR_ATTACHMENT_GROUP = 0.5;

const findMaps: Record<string, FindMapFunction> = {
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

type ClosestReturnType<T = Vec2> = ClosestItem<T> | null;
type ReferencePoint = Vec2 | null;

function isPointInRectangle(
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
  let minDistribution = Number.POSITIVE_INFINITY;
  let returnValue: ClosestReturnType = null;

  restruct.texts.forEach((text, id) => {
    const distribution = calculateDistanceToText(
      cursorPosition,
      text.getReferencePoints(),
    );

    if (
      distribution < SELECTION_DISTANCE_COEFFICIENT &&
      (!returnValue || distribution < minDistribution)
    ) {
      minDistribution = distribution;
      returnValue = { id, dist: minDistribution };
    }
  });
  return returnValue;
}

function findClosestSimpleObject(restruct: ReStruct, pos: Vec2) {
  let minDistribution = Number.POSITIVE_INFINITY;
  let referencePoint: ReferencePoint = null;
  let returnValue: ClosestReturnType = null;

  restruct.simpleObjects.forEach((simpleObject, id) => {
    const distribution = simpleObject.calcDistance(
      pos,
      restruct.render.options.microModeScale,
    );

    if (
      distribution.minDist < 0.3 &&
      (!returnValue || distribution.minDist < minDistribution)
    ) {
      minDistribution = distribution.minDist;
      referencePoint = distribution.refPoint;

      returnValue = { id, dist: minDistribution, ref: referencePoint };
    }
  });
  return returnValue;
}

function findClosestAtom(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
) {
  let closestAtom: null | number = null;
  const maxMinDistribution = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'atoms' ? skip.id : null;
  const sGroups = restruct.sgroups;
  const functionalGroups = restruct.molecule.functionalGroups;

  let effectiveMinDistribution: number = Math.min(
    minDistribution ?? maxMinDistribution,
    maxMinDistribution,
  );

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

    const distribution = Vec2.dist(pos, atom.a.pp);

    if (distribution < effectiveMinDistribution) {
      closestAtom = aid;
      effectiveMinDistribution = distribution;
    }
  });

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: effectiveMinDistribution,
    };
  }

  return null;
}

function findClosestAttachmentGroup(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
) {
  let closestId: number | null = null;
  const maxMinDistribution =
    SELECTION_DISTANCE_COEFFICIENT_FOR_ATTACHMENT_GROUP;
  const skipId = skip?.map === 'attachmentGroups' ? skip.id : null;
  let effectiveMinDistribution = Math.min(
    minDistribution ?? maxMinDistribution,
    maxMinDistribution,
  );

  restruct.visibleAttachmentGroups.forEach((attachmentGroup, id) => {
    if (id === skipId) return;
    const distribution = Vec2.dist(pos, attachmentGroup.a.pp);
    if (
      distribution < effectiveMinDistribution ||
      (minDistribution !== null && distribution === effectiveMinDistribution)
    ) {
      closestId = id;
      effectiveMinDistribution = distribution;
    }
  });

  return closestId === null
    ? null
    : { id: closestId, dist: effectiveMinDistribution };
}

function findClosestBond(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
  options: ClosestFunctionOptions,
) {
  let closestBond: number | null = null;
  let closestBondCenter: number | null = null;
  const maxMinDistribution = 0.8 * SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'bonds' ? skip.id : null;

  let effectiveMinDistribution: number = Math.min(
    minDistribution ?? maxMinDistribution,
    maxMinDistribution,
  );

  let minCDistribution = effectiveMinDistribution;
  let minFoundCDistribution = Infinity;

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

    if (isPosInsidePolygon && cdist < minFoundCDistribution) {
      minCDistribution = cdist;
      minFoundCDistribution = cdist;
      closestBondCenter = bid;
    }

    const hb = restruct.molecule.halfBonds.get(bond.b.hb1 as number);
    if (!hb) {
      KetcherLogger.warn(`Half-bond ${bond.b.hb1} for bond ${bid} not found`);
      return;
    }
    const direction = hb.dir;
    const norm = hb.norm;

    const isInStripe =
      Vec2.dot(pos.sub(p1), direction) * Vec2.dot(pos.sub(p2), direction) < 0;

    if (isInStripe) {
      const distribution = Math.abs(Vec2.dot(pos.sub(p1), norm));

      if (distribution < effectiveMinDistribution) {
        closestBond = bid;
        effectiveMinDistribution = distribution;
      }
    }
  });

  if (closestBondCenter !== null) {
    return {
      id: closestBondCenter,
      dist: minCDistribution,
    };
  }

  if (
    closestBond !== null &&
    effectiveMinDistribution >
      SELECTION_DISTANCE_COEFFICIENT * options.microModeScale
  ) {
    return {
      id: closestBond,
      dist: effectiveMinDistribution,
    };
  }

  return null;
}

function findClosestEnhancedFlag(
  restruct: ReStruct,
  pos: Vec2,
  _skip: SkipItem | null,
  _minDistribution: number | null,
  options: ClosestFunctionOptions,
) {
  let minDistribution;
  let returnValue: ClosestReturnType = null;
  restruct.enhancedFlags.forEach((_item, id) => {
    const fragment = restruct.molecule.frags.get(id);

    if (!fragment?.enhancedStereoFlag || !options.showStereoFlags) return;

    const p = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, id);
    if (!p || Math.abs(pos.x - p.x) >= 1) return;

    const distribution = Math.abs(pos.y - p.y);

    if (
      distribution < 0.3 &&
      (!returnValue || distribution < minDistribution)
    ) {
      minDistribution = distribution;
      returnValue = { id, dist: minDistribution };
    }
  });
  return returnValue;
}

function findClosestDataSGroupData(restruct: ReStruct, pos: Vec2) {
  let minDistribution = Number.POSITIVE_INFINITY;
  let returnValue: ClosestReturnType = null;

  restruct.sgroupData.forEach((item, id) => {
    if (item.sgroup.type !== 'DAT') throw new Error('Data group expected');

    if (item.sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const box = item.sgroup.dataArea;
      if (!box) {
        return;
      }
      const isInBox =
        box.p0.y < pos.y &&
        box.p1.y > pos.y &&
        box.p0.x < pos.x &&
        box.p1.x > pos.x;
      const xDistribution = Math.min(
        Math.abs(box.p0.x - pos.x),
        Math.abs(box.p1.x - pos.x),
      );

      if (
        isInBox &&
        (returnValue === null || xDistribution < minDistribution)
      ) {
        returnValue = { id, dist: xDistribution };
        minDistribution = xDistribution;
      }
    }
  });

  return returnValue;
}

function findClosestFrag(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
  options: ClosestFunctionOptions,
) {
  minDistribution = Math.min(
    minDistribution ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  const struct = restruct.molecule;

  const closestAtom = findClosestAtom(restruct, pos, skip, minDistribution);

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

  const closestBond = findClosestBond(
    restruct,
    pos,
    skip,
    minDistribution,
    options,
  );

  if (closestBond) {
    const fragmentId = struct.getBondFragment(closestBond.id);
    if (fragmentId === undefined) {
      KetcherLogger.warn(`Fragment for bond ${closestBond.id} not found`);
      return null;
    }
    return {
      id: fragmentId,
      dist: closestBond.dist,
    };
  }

  return null;
}

function findClosestRGroup(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDistribution: number | null,
) {
  let effectiveMinDistribution: number = Math.min(
    minDistribution ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  let returnValue: ClosestReturnType = null;
  const skipId = skip?.map === 'rgroups' ? skip.id : null;

  restruct.rgroups.forEach((rgroup, rgid) => {
    if (rgid !== skipId && rgroup.labelBox?.contains(pos, 0.5)) {
      const distribution = Vec2.dist(rgroup.labelBox.centre(), pos);

      if (!returnValue || distribution < effectiveMinDistribution) {
        effectiveMinDistribution = distribution;
        returnValue = { id: rgid, dist: effectiveMinDistribution };
      }
    }
  });

  return returnValue;
}

/**
 * @param {ReStruct} restruct
 * @param {Vec2} cursorPosition
 * @param {number} minDistributionToOtherItems
 */
function findClosestRgroupAttachmentPoints(
  restruct: ReStruct,
  cursorPosition: Vec2,
  _skip: SkipItem | null,
  minDistributionToOtherItems: number | null,
) {
  let minDistribution = minDistributionToOtherItems ?? Number.POSITIVE_INFINITY;
  /**
  @type {number | undefined}
  */
  let closestItemId;

  restruct.visibleRGroupAttachmentPoints.forEach((reItem, id) => {
    // Remove readonly from getOutlinePoints return type
    const itemOutlinePoints = [...reItem.getOutlinePoints()];
    const isCursorInsideOutline =
      cursorPosition.isInsidePolygon(itemOutlinePoints);
    if (isCursorInsideOutline) {
      const distribution = reItem.getDistanceTo(cursorPosition);
      if (distribution < minDistribution) {
        minDistribution = distribution;
        closestItemId = id;
      }
    }
  });

  return closestItemId === undefined
    ? null
    : {
        id: closestItemId,
        dist: minDistribution,
      };
}

function findClosestRxnArrow(restruct: ReStruct, pos: Vec2) {
  let minDistribution = Number.POSITIVE_INFINITY;
  let referencePoint: ReferencePoint = null;
  let returnValue: ClosestReturnType = null;

  restruct.rxnArrows.forEach((rxnArrow, id) => {
    const distribution = rxnArrow.calcDistance(
      pos,
      restruct.render.options.microModeScale,
    );

    if (
      distribution.minDist < 0.3 &&
      (!returnValue || distribution.minDist < minDistribution)
    ) {
      minDistribution = distribution.minDist;
      referencePoint = distribution.refPoint;

      returnValue = { id, dist: minDistribution, ref: referencePoint };
    }
  });
  return returnValue;
}

function findClosestRxnPlus(restruct: ReStruct, pos: Vec2) {
  let minDistribution = Number.POSITIVE_INFINITY;
  let returnValue: ClosestReturnType = null;

  restruct.rxnPluses.forEach((plus, id) => {
    const p = plus.item.pp;
    const distribution = Math.max(Math.abs(pos.x - p.x), Math.abs(pos.y - p.y));

    if (
      distribution < 0.3 &&
      (!returnValue || distribution < minDistribution)
    ) {
      minDistribution = distribution;
      returnValue = { id, dist: minDistribution };
    }
  });

  return returnValue;
}

function findClosestSGroup(restruct: ReStruct, pos: Vec2) {
  let returnValue: number | null = null;
  let minDistribution = SELECTION_DISTANCE_COEFFICIENT;

  restruct.molecule.sgroups.forEach((sg, sgid) => {
    if (sg.isSuperatomWithoutLabel) {
      return;
    }

    if (sg.isContracted()) {
      const sGroupPosition = sg.pp;
      if (sGroupPosition) {
        const distribution = Vec2.dist(pos, sGroupPosition);
        if (distribution < minDistribution) {
          returnValue = sgid;
          minDistribution = distribution;
        }
      }

      return;
    }

    const d = sg.bracketDirection;
    const n = d.rotateSC(1, 0);
    const pg = new Vec2(Vec2.dot(pos, d), Vec2.dot(pos, n));

    sg.areas.forEach((box) => {
      const isInBox =
        box.p0.y < pg.y &&
        box.p1.y > pg.y &&
        box.p0.x < pg.x &&
        box.p1.x > pg.x;
      const xDistribution = Math.min(
        Math.abs(box.p0.x - pg.x),
        Math.abs(box.p1.x - pg.x),
      );

      if (
        isInBox &&
        (returnValue === null || xDistribution < minDistribution)
      ) {
        returnValue = sgid;
        minDistribution = xDistribution;
      }
    });
  });

  if (returnValue !== null) {
    return {
      id: returnValue,
      dist: minDistribution,
    };
  }

  return null;
}

function findClosestFG(restruct: ReStruct, pos: Vec2, skip: SkipItem | null) {
  const sGroups = restruct.sgroups;
  const skipId = skip?.map === 'functionalGroups' ? skip.id : null;
  for (const [reSGroupId, reSGroup] of sGroups.entries()) {
    if (reSGroupId === skipId) continue;

    const { startX, startY, width, height } =
      reSGroup.getTextHighlightDimensions(restruct.render, 0);
    const { x, y } = Scale.modelToCanvas(pos, restruct.render.options);
    if (isPointInRectangle(startX, startY, width, height, x, y)) {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const rectangleCenter = new Vec2(centerX, centerY);
      const cursorPosition = new Vec2(x, y);

      const distribution = Vec2.dist(rectangleCenter, cursorPosition);
      const sGroupItem = reSGroup.item;
      assert(sGroupItem, `ReSGroup ${reSGroupId} has no item`);
      const { id } = sGroupItem;
      return { id, dist: distribution };
    }
  }
  return null;
}

function findClosestItem(
  restruct: ReStruct,
  pos: Vec2,
  maps: string[] | null | undefined,
  skip: SkipItem | null,
  options: ClosestFunctionOptions,
): ClosestItemWithMap | null {
  maps = maps ?? Object.keys(findMaps);
  if (maps.includes('atoms') && !maps.includes('attachmentGroups')) {
    maps = [...maps, 'attachmentGroups'];
  }

  let priorityItem: ClosestItemWithMap | null = null;

  const closestItem = maps.reduce<ClosestItemWithMap | null>((result, mp) => {
    const minDistribution = result?.dist ?? null;
    const item = findMaps[mp](restruct, pos, skip, minDistribution, options);

    if (item !== null) {
      const enrichedItem: ClosestItemWithMap = {
        map: mp,
        ...item,
      };

      if (mp === 'sgroupData') {
        priorityItem = enrichedItem;
      } else if (
        result === null ||
        item.dist < result.dist ||
        (mp === 'attachmentGroups' && item.dist === result.dist)
      ) {
        return enrichedItem;
      }
    }

    return result;
  }, null);

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
      [...pos.atoms.keys()].forEach((atomId) => {
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
          didMergeAtomToFunctionalGroup(atomId, restruct, atomPosition, result);
        }
      });
    } else {
      const posMap = (pos as Record<string, Map<number, Vec2>>)[map];
      result[map] = [...posMap.keys()].reduce<Map<number, number>>(
        (result_, sourceId) => {
          const skip: SkipItem = { map, id: sourceId };
          const sourcePos = posMap.get(sourceId);
          if (!sourcePos) return result_;
          const item = findMaps[map](restruct, sourcePos, skip, null, options);

          if (item && !selected[map].includes(item.id)) {
            result_.set(sourceId, item.id);
          }

          return result_;
        },
        new Map(),
      );
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
  const closestAtom = findClosestAtom(restruct, atomPosition, skip, null);
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
function didMergeAtomToFunctionalGroup(
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

  const closestFunctionalGroup = findClosestFG(restruct, atomPosition, null);
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
  return [...reStruct.images.entries()].reduce(
    (
      accumulator: ClosestReturnType<ImageReferencePositionInfo>,
      [id, item],
    ) => {
      const distanceToPoint = item.calculateDistanceToPoint(
        canvasScaledPosition,
        renderOptions,
      );
      if (distanceToPoint <= maxDistance) {
        if (accumulator && accumulator.dist < distanceToPoint) {
          return accumulator;
        }
        // We would like to grab items under the images and those items should have higher priority then images
        // So we wanna make sure that those items can be grabbed without pixel-perfect pixel-hunting
        const distribution = Math.max(distanceToPoint, maxDistance / 3);
        const closestPosition = item.calculateClosestReferencePosition(
          canvasScaledPosition,
          renderOptions,
        );
        const shouldIncludeReference = closestPosition.distance < maxDistance;
        return {
          id,
          dist: distribution / renderOptions.microModeScale,
          ref: shouldIncludeReference ? closestPosition.ref : null,
        };
      }
      return accumulator;
    },
    null,
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

  return [...reStruct.multitailArrows.entries()].reduce(
    (accumulator: ClosestReturnType<unknown>, [id, item]) => {
      const { distance, ref } = item.calculateDistanceToPoint(
        canvasScaledPosition,
        renderOptions,
        maxDistance,
      );
      if (
        distance <= maxDistance &&
        (!accumulator || accumulator.dist > distance)
      ) {
        return { id, dist: distance / renderOptions.microModeScale, ref };
      }
      return accumulator;
    },
    null,
  );
}

export default {
  atom: findClosestAtom, // used in Actions
  item: findClosestItem,
  merge: findCloseMerge,
};
