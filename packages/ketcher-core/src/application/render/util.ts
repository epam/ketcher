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

import type { RaphaelAxisAlignedBoundingBox, RaphaelPaper } from 'raphael';
import { Atom } from 'domain/entities/atom';
import type { Bond } from 'domain/entities/bond';
import { Box2Abs } from 'domain/entities/box2Abs';
import type { HalfBond } from 'domain/entities/halfBond';
import { Vec2 } from 'domain/entities/vec2';
import { assert } from 'utilities';
import { LayerMap } from './restruct/generalEnumTypes';
import type ReStruct from './restruct/restruct';
import type Visel from './restruct/visel';
import type { RelativeBox, RenderOptions } from './render.types';
import { UsageInMacromolecule } from './render.constants';

function relBox(box: RaphaelAxisAlignedBoundingBox): RelativeBox {
  return {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  };
}

/**
 * Finds intersection of a ray and a box and
 * Returns the shift magnitude to avoid it
 */
function shiftRayBox(p: Vec2, d: Vec2, bb: Box2Abs) {
  assert(!!p);
  assert(!!d);
  assert(!!bb);

  // four corner points of the box
  const b = [
    bb.p0,
    new Vec2(bb.p1.x, bb.p0.y),
    bb.p1,
    new Vec2(bb.p0.x, bb.p1.y),
  ];

  const r = b.map((v) => v.sub(p)); // b relative to p

  d = d.normalized();

  const rc = r.map((v) => Vec2.cross(v, d)); // cross prods
  const rd = r.map((v) => Vec2.dot(v, d)); // dot prods

  // find foremost points on the right and on the left of the ray
  let pid = -1;
  let nid = -1;

  for (let i = 0; i < 4; ++i) {
    if (rc[i] > 0) {
      if (pid < 0 || rd[pid] < rd[i]) pid = i;
    } else if (nid < 0 || rd[nid] < rd[i]) {
      nid = i;
    }
  }

  if (nid < 0 || pid < 0) {
    // no intersection, no shift
    return 0;
  }

  // check the order
  const id0 = rd[pid] > rd[nid] ? nid : pid;
  const id1 = rd[pid] > rd[nid] ? pid : nid;

  // simple proportion to calculate the shift

  return (
    rd[id0] +
    (Math.abs(rc[id0]) * (rd[id1] - rd[id0])) /
      (Math.abs(rc[id0]) + Math.abs(rc[id1]))
  );
}

function getPolygonCollisionBoxes(points: Vec2[], padding: number): Box2Abs[] {
  if (points.length === 0) return [];

  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const sliceCount = Math.max(1, Math.ceil(maxY - minY));
  const boxes: Box2Abs[] = [];
  const clearance = new Vec2(padding, padding);

  for (let slice = 0; slice < sliceCount; slice += 1) {
    const bottom = minY + ((maxY - minY) * slice) / sliceCount;
    const top = minY + ((maxY - minY) * (slice + 1)) / sliceCount;
    const intersections: number[] = [];

    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      if (point.y >= bottom && point.y <= top) intersections.push(point.x);
      for (const boundary of [bottom, top]) {
        if (
          point.y !== next.y &&
          boundary >= Math.min(point.y, next.y) &&
          boundary <= Math.max(point.y, next.y)
        ) {
          intersections.push(
            point.x +
              ((boundary - point.y) * (next.x - point.x)) / (next.y - point.y),
          );
        }
      }
    });

    if (intersections.length > 0) {
      boxes.push(
        new Box2Abs(
          Math.min(...intersections),
          bottom,
          Math.max(...intersections),
          top,
        ).extend(clearance, clearance),
      );
    }
  }

  return boxes;
}

function chooseNonOverlappingLabelPlacement(
  directions: Vec2[],
  getLabelBox: (direction: Vec2, additionalDistance: number) => Box2Abs,
  getLabelDistance: (direction: Vec2, additionalDistance: number) => number,
  occupiedBoxes: Box2Abs[],
): { direction: Vec2; additionalDistance: number } {
  assert(directions.length > 0);

  let selectedPlacement = {
    direction: directions[0],
    additionalDistance: Number.POSITIVE_INFINITY,
  };
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const direction of directions) {
    let additionalDistance = 0;

    for (let attempt = 0; attempt <= occupiedBoxes.length; attempt += 1) {
      const labelBox = getLabelBox(direction, additionalDistance);
      const overlappingBoxes = occupiedBoxes.filter(
        (occupiedBox) =>
          labelBox.p0.x < occupiedBox.p1.x &&
          labelBox.p1.x > occupiedBox.p0.x &&
          labelBox.p0.y < occupiedBox.p1.y &&
          labelBox.p1.y > occupiedBox.p0.y,
      );

      if (overlappingBoxes.length === 0) {
        const distance = getLabelDistance(direction, additionalDistance);
        if (distance < shortestDistance) {
          selectedPlacement = { direction, additionalDistance };
          shortestDistance = distance;
        }
        break;
      }

      const distanceToClear = Math.min(
        ...overlappingBoxes.map((occupiedBox) => {
          const horizontalDistance =
            direction.x > 0
              ? (occupiedBox.p1.x - labelBox.p0.x) / direction.x
              : direction.x < 0
                ? (labelBox.p1.x - occupiedBox.p0.x) / -direction.x
                : Number.POSITIVE_INFINITY;
          const verticalDistance =
            direction.y > 0
              ? (occupiedBox.p1.y - labelBox.p0.y) / direction.y
              : direction.y < 0
                ? (labelBox.p1.y - occupiedBox.p0.y) / -direction.y
                : Number.POSITIVE_INFINITY;

          return Math.min(horizontalDistance, verticalDistance);
        }),
      );
      additionalDistance += distanceToClear + 0.5;
    }
  }

  return selectedPlacement;
}

function calcCoordinates(aPoint: Vec2, bPoint: Vec2, lengthHyp: number) {
  const obj: {
    pos1: null | { x: number; y: number };
    pos2: null | { x: number; y: number };
  } = { pos1: null, pos2: null };
  const oPos2 = { x: bPoint.x - aPoint.x, y: bPoint.y - aPoint.y };
  const c =
    (lengthHyp ** 2 - oPos2.x * oPos2.x - oPos2.y * oPos2.y - lengthHyp ** 2) /
    -2;
  const a = oPos2.x * oPos2.x + oPos2.y * oPos2.y;
  if (oPos2.x !== 0) {
    const b = -2 * oPos2.y * c;
    const e = c * c - lengthHyp * lengthHyp * oPos2.x * oPos2.x;
    const D = b * b - 4 * a * e;
    if (D > 0) {
      obj.pos1 = { x: 0, y: 0 };
      obj.pos2 = { x: 0, y: 0 };
      obj.pos1.y = (-b + Math.sqrt(D)) / (2 * a);
      obj.pos2.y = (-b - Math.sqrt(D)) / (2 * a);
      obj.pos1.x = (c - obj.pos1.y * oPos2.y) / oPos2.x;
      obj.pos2.x = (c - obj.pos2.y * oPos2.y) / oPos2.x;
    }
  } else {
    obj.pos1 = { x: 0, y: 0 };
    obj.pos2 = { x: 0, y: 0 };
    obj.pos1.y = c / oPos2.y;
    obj.pos2.y = c / oPos2.y;
    obj.pos1.x = -Math.sqrt(lengthHyp ** 2 - c ** 2 / oPos2.y ** 2);
    obj.pos2.x = Math.sqrt(lengthHyp ** 2 - c ** 2 / oPos2.y ** 2);
  }
  if (obj.pos1 !== null) {
    obj.pos1.x += aPoint.x;
    obj.pos1.y += aPoint.y;
  }
  if (obj.pos2 !== null) {
    obj.pos2.x += aPoint.x;
    obj.pos2.y += aPoint.y;
  }
  return obj;
}

function getCIPValuePath({
  paper,
  cipLabelPosition,
  atomOrBond,
  options,
}: {
  paper: RaphaelPaper;
  cipLabelPosition: Vec2;
  atomOrBond: Atom | Bond;
  options: RenderOptions;
}) {
  const text = paper
    .text(cipLabelPosition.x, cipLabelPosition.y, `(${atomOrBond.cip})`)
    .attr({
      font: options.font,
      'font-size': options.fontszInPx,
    });
  const box = text.getBBox();
  const path = paper.set();
  const rect = paper
    .rect(box.x - 1, box.y - 1, box.width + 2, box.height + 2, 3, 3)
    .attr({ fill: '#fff', stroke: '#fff' });
  path.push(rect.toFront(), text.toFront());

  return {
    path,
    text,
    rectangle: rect,
  };
}

function drawCIPLabel({
  atomOrBond,
  position,
  restruct,
  visel,
}: {
  atomOrBond: Bond | Atom;
  position: Vec2;
  restruct: ReStruct;
  visel: Visel;
}) {
  const { options, paper } = restruct.render;
  const path = paper.set();

  const cipLabelPosition = position.scaled(options.microModeScale);
  const cipValuePath = getCIPValuePath({
    paper,
    cipLabelPosition,
    atomOrBond,
    options,
  });

  if (atomOrBond instanceof Atom) {
    const box = relBox(cipValuePath.path.getBBox());

    cipValuePath.path.translateAbs(0.5 * box.width, -0.5 * box.height);
  }

  path.push(cipValuePath.path.toFront());

  restruct.addReObjectPath(LayerMap.additionalInfo, visel, path, null, true);

  return cipValuePath;
}

function updateHalfBondCoordinates(
  hb1: HalfBond,
  hb2: HalfBond,
  xShift: number,
): [HalfBond, HalfBond] {
  if (hb1.p.y !== hb2.p.y) return [hb1, hb2];
  if (hb1.p.x < hb2.p.x && hb1.p.y === hb2.p.y) {
    hb1.p.x = hb1.p.x + xShift;
  } else if (hb1.p.x > hb2.p.x) {
    hb1.p.x = hb1.p.x - xShift;
  }

  return [hb1, hb2];
}

function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function useLabelStyles(
  attachmentPointSelected: boolean,
  attachmentPointUsed: boolean,
  usageInMacromolecule: UsageInMacromolecule,
): {
  color: string;
  fill: string;
  stroke: string;
} {
  let color = '#585858';
  let fill = '#FFF';
  let stroke = '#7C7C7F';

  switch (usageInMacromolecule) {
    case UsageInMacromolecule.MonomerPreview:
      stroke = 'none';
      if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
      }
      break;
    case UsageInMacromolecule.MonomerConnectionsModal:
      if (attachmentPointSelected) {
        fill = '#167782';
        color = '#FFF';
      } else if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
        stroke = '#B4B9D6';
      }
      break;
    case UsageInMacromolecule.BondPreview:
      if (attachmentPointSelected) {
        fill = '#CDF1FC';
      } else if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
      }
      stroke = 'none';
      break;
    default:
      break;
  }

  return { color, fill, stroke };
}

const util = {
  relBox,
  shiftRayBox,
  getPolygonCollisionBoxes,
  chooseNonOverlappingLabelPlacement,
  calcCoordinates,
  drawCIPLabel,
  updateHalfBondCoordinates,
  escapeHtml,
  useLabelStyles,
};

export default util;
