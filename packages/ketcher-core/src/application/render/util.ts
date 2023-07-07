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

import { RaphaelAxisAlignedBoundingBox, RaphaelPaper } from 'raphael';
import { Atom, Bond, Box2Abs, Vec2 } from 'domain/entities';
import assert from 'assert';
import { ReStruct, LayerMap } from './restruct';
import Visel from './restruct/visel';
import { RelativeBox, RenderOptions } from './render.types';

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
  /* eslint-disable no-mixed-operators */
  return (
    rd[id0] +
    (Math.abs(rc[id0]) * (rd[id1] - rd[id0])) /
      (Math.abs(rc[id0]) + Math.abs(rc[id1]))
  );
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
      'font-size': options.fontsz,
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

  const cipLabelPosition = position.scaled(options.scale);
  const cipValuePath = getCIPValuePath({
    paper,
    cipLabelPosition,
    atomOrBond,
    options,
  });
  const box = relBox(cipValuePath.path.getBBox());

  cipValuePath.path.translateAbs(0.5 * box.width, -0.5 * box.height);
  path.push(cipValuePath.path.toFront());

  restruct.addReObjectPath(LayerMap.additionalInfo, visel, path, null, true);

  return cipValuePath;
}

const util = {
  relBox,
  shiftRayBox,
  calcCoordinates,
  getCIPValuePath,
  drawCIPLabel,
};

export default util;
