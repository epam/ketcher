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

import { Vec2 } from 'domain/entities';

const SELECTION_DISTANCE_COEFFICIENT = 0.4;
const SELECTION_WITHIN_TEXT = 0;

const findMaps = {
  atoms: findClosestAtom,
  bonds: findClosestBond,
  enhancedFlags: findClosestEnhancedFlag,
  sgroupData: findClosestDataSGroupData,
  sgroups: findClosestSGroup,
  rxnArrows: findClosestRxnArrow,
  rxnPluses: findClosestRxnPlus,
  frags: findClosestFrag,
  rgroups: findClosestRGroup,
  simpleObjects: findClosestSimpleObject,
  texts: findClosestText,
};

function calculateTextDistances(cursorPosition, bounds) {
  const { topX, topY, bottomX, bottomY } = bounds;
  const distances = [];

  const isCursorWithinHorizontalBounds =
    cursorPosition.x >= topX && cursorPosition.x <= bottomX;
  const isCursorWithinVerticalBounds =
    cursorPosition.y >= topY && cursorPosition.y <= bottomY;

  if (isCursorWithinHorizontalBounds) {
    if (cursorPosition.y < topY) {
      distances.push(topY - cursorPosition.y);
    } else if (cursorPosition.y > bottomY) {
      distances.push(cursorPosition.y - bottomY);
    } else {
      distances.push(cursorPosition.y - topY, bottomY - cursorPosition.y);
    }
  }

  if (cursorPosition.x < topX && cursorPosition.y < topY) {
    distances.push(Vec2.dist(new Vec2(topX, topY), cursorPosition));
  }

  if (cursorPosition.x > bottomX && cursorPosition.y > bottomY) {
    distances.push(Vec2.dist(new Vec2(bottomX, bottomY), cursorPosition));
  }

  if (cursorPosition.x < topX && cursorPosition.y > bottomY) {
    distances.push(Vec2.dist(new Vec2(topX, bottomY), cursorPosition));
  }

  if (cursorPosition.x > bottomX && cursorPosition.y < topY) {
    distances.push(Vec2.dist(new Vec2(bottomX, topY), cursorPosition));
  }

  if (isCursorWithinVerticalBounds) {
    if (cursorPosition.x < topX) {
      distances.push(topX - cursorPosition.x);
    } else if (cursorPosition.x > bottomX) {
      distances.push(cursorPosition.x - bottomX);
    } else {
      distances.push(SELECTION_WITHIN_TEXT);
    }
  }

  return distances;
}

function findClosestText(restruct, cursorPosition) {
  let minDist = null;
  let ret = null;

  restruct.texts.forEach((text, id) => {
    const referencePoints = text.getReferencePoints(restruct);
    const bounds = {
      topX: referencePoints[0].x,
      topY: referencePoints[0].y,
      bottomX: referencePoints[2].x,
      bottomY: referencePoints[2].y,
    };

    const distances = calculateTextDistances(cursorPosition, bounds);
    const dist = Math.min(...distances);

    if (dist < SELECTION_DISTANCE_COEFFICIENT && (!ret || dist < minDist)) {
      minDist = dist;
      ret = { id, dist: minDist };
    }
  });
  return ret;
}

function findClosestSimpleObject(restruct, pos) {
  let minDist = null;
  let refPoint = null;
  let ret = null;

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

function findClosestAtom(restruct, pos, skip, minDist) {
  let closestAtom = null;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip && skip.map === 'atoms' ? skip.id : null;

  minDist = minDist || maxMinDist;
  minDist = Math.min(minDist, maxMinDist);

  restruct.visibleAtoms.forEach((atom, aid) => {
    if (aid === skipId) return;

    const dist = Vec2.dist(pos, atom.a.pp);

    if (dist < minDist) {
      closestAtom = aid;
      minDist = dist;
    }
  });

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: minDist,
    };
  }

  return null;
}

export default {
  atom: findClosestAtom, // used in Actions
};
