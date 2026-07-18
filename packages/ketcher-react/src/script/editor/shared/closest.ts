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
  skip: SkipItem | null,
  minDist: number | null,
  options: ClosestFunctionOptions,
) => ClosestItem<unknown> | null;

const SELECTION_DISTANCE_COEFFICIENT = 0.4;
const SELECTION_WITHIN_TEXT = 0;

const findMaps: Record<string, FindMapFn> = {
  atoms: findClosestAtom,
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
type RefPoint = Vec2 | null;

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
  let ret: ClosestReturnType = null;

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
  let refPoint: RefPoint = null;
  let ret: ClosestReturnType = null;

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
  skip: SkipItem | null,
  minDist: number | null,
) {
  let closestAtom: null | number = null;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'atoms' ? skip.id : null;
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

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: effectiveMinDist,
    };
  }

  return null;
}

function findClosestBond(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDist: number | null,
  options: ClosestFunctionOptions,
) {
  // eslint-disable-line max-params
  let closestBond: number | null = null;
  let closestBondCenter: number | null = null;
  const maxMinDist = 0.8 * SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'bonds' ? skip.id : null;

  let effectiveMinDist: number = Math.min(minDist ?? maxMinDist, maxMinDist);

  let minCDist = effectiveMinDist;
  let minFoundCDist = Infinity;

  restruct.visibleBonds.forEach((bond, bid) => {
    const isSkippedBond = bid === skipId || bond.b.isPreview;
    if (isSkippedBond) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p1 = restruct.atoms.get(bond.b.begin)!.a.pp;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p2 = restruct.atoms.get(bond.b.end)!.a.pp;

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hb = restruct.molecule.halfBonds.get(bond.b.hb1 as number)!;
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

  if (closestBondCenter !== null) {
    return {
      id: closestBondCenter,
      dist: minCDist,
    };
  }

  if (
    closestBond !== null &&
    effectiveMinDist > SELECTION_DISTANCE_COEFFICIENT * options.microModeScale
  ) {
    return {
      id: closestBond,
      dist: effectiveMinDist,
    };
  }

  return null;
}

function findClosestEnhancedFlag(
  restruct: ReStruct,
  pos: Vec2,
  _skip: SkipItem | null,
  _minDist: number | null,
  options: ClosestFunctionOptions,
) {
  let minDist;
  let ret: ClosestReturnType = null;
  restruct.enhancedFlags.forEach((_item, id) => {
    const fragment = restruct.molecule.frags.get(id);

    if (!fragment?.enhancedStereoFlag || !options.showStereoFlags) return;

    const p = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, id);
    if (!p || Math.abs(pos.x - p.x) >= 1.0) return;

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
  let ret: ClosestReturnType = null;

  restruct.sgroupData.forEach((item, id) => {
    if (item.sgroup.type !== 'DAT') throw new Error('Data group expected');

    if (item.sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const box = item.sgroup.dataArea;
      const inBox =
        box.p0.y < pos.y &&
        box.p1.y > pos.y &&
        box.p0.x < pos.x &&
        box.p1.x > pos.x;
      const xDist = Math.min(
        Math.abs(box.p0.x - pos.x),
        Math.abs(box.p1.x - pos.x),
      );

      if (inBox && (ret === null || xDist < minDist)) {
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
  skip: SkipItem | null,
  minDist: number | null,
  options: ClosestFunctionOptions,
) {
  minDist = Math.min(
    minDist ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  const struct = restruct.molecule;

  const closestAtom = findClosestAtom(restruct, pos, skip, minDist);

  if (closestAtom) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: struct.atoms.get(closestAtom.id)!.fragment,
      dist: closestAtom.dist,
    };
  }

  const closestBond = findClosestBond(restruct, pos, skip, minDist, options);

  if (closestBond) {
    // eslint-disable-next-line
    const atomId = struct.bonds.get(closestBond.id)!.begin;
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: struct.atoms.get(atomId)!.fragment,
      dist: closestBond.dist,
    };
  }

  return null;
}

function findClosestRGroup(
  restruct: ReStruct,
  pos: Vec2,
  skip: SkipItem | null,
  minDist: number | null,
) {
  let effectiveMinDist: number = Math.min(
    minDist ?? SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT,
  );

  let ret: ClosestReturnType = null;
  const skipId = skip?.map === 'rgroups' ? skip.id : null;

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
  _skip: SkipItem | null,
  minDistToOtherItems: number | null,
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
    ? null
    : {
        id: closestItemId,
        dist: minDist,
      };
}

function findClosestRxnArrow(restruct: ReStruct, pos: Vec2) {
  let minDist = Number.POSITIVE_INFINITY;
  let refPoint: RefPoint = null;
  let ret: ClosestReturnType = null;

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
  let ret: ClosestReturnType = null;

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
  let ret: number | null = null;
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

      if (inBox && (ret === null || xDist < minDist)) {
        ret = sgid;
        minDist = xDist;
      }
    });
  });

  if (ret !== null) {
    return {
      id: ret,
      dist: minDist,
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
    if (rectangleContainsPoint(startX, startY, width, height, x, y)) {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const rectangleCenter = new Vec2(centerX, centerY);
      const cursorPosition = new Vec2(x, y);

      const dist = Vec2.dist(rectangleCenter, cursorPosition);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { id } = reSGroup.item!;
      return { id, dist };
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
  // eslint-disable-line max-params
  maps = maps ?? Object.keys(findMaps);

  let priorityItem: ClosestItemWithMap | null = null;

  const closestItem = maps.reduce<ClosestItemWithMap | null>((res, mp) => {
    const minDist = res?.dist ?? null;
    const item = findMaps[mp](restruct, pos, skip, minDist, options);

    if (item !== null) {
      const enrichedItem: ClosestItemWithMap = {
        map: mp,
        ...item,
      };

      if (mp === 'sgroupData') {
        priorityItem = enrichedItem;
      } else if (res === null || item.dist < res.dist) {
        return enrichedItem;
      }
    }

    return res;
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
      pos.bonds.set(
        bid,
        Vec2.lc2(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          struct.atoms.get(bond.begin)!.pp,
          0.5,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          struct.atoms.get(bond.end)!.pp,
          0.5,
        ),
      );
    }
  });

  const result: MergeResult & { [key: string]: Map<number, number> } = {
    atoms: new Map(),
    atomToFunctionalGroup: new Map(),
  };

  maps.forEach((map) => {
    if (map === 'atoms') {
      Array.from(pos.atoms.keys()).forEach((atomId) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const atomPosition = pos.atoms.get(atomId)!;
        mergeAtomToAtom(atomId, restruct, atomPosition, selected, result) ||
          mergeAtomToFunctionalGroup(atomId, restruct, atomPosition, result);
      });
    } else {
      const posMap = (pos as Record<string, Map<number, Vec2>>)[map];
      result[map] = Array.from<number>(posMap.keys()).reduce<
        Map<number, number>
      >((res, srcId) => {
        const skip: SkipItem = { map, id: srcId };
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const srcPos = posMap.get(srcId)!;
        const item = findMaps[map](restruct, srcPos, skip, null, options);

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
          ref: includeRef ? closestPosition.ref : null,
        };
      }
      return acc;
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
    null,
  );
}

export default {
  atom: findClosestAtom, // used in Actions
  item: findClosestItem,
  merge: findCloseMerge,
};
