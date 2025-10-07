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
  FunctionalGroup,
  IMAGE_KEY,
  Struct,
  Vec2,
  ReStruct,
  MULTITAIL_ARROW_KEY,
} from 'ketcher-core';
import assert from 'assert';

function getElementsInRectangle(restruct: ReStruct, p0, p1) {
  const bondList: Array<number> = [];
  const atomList: Array<number> = [];
  const functionalGroups = restruct.molecule.functionalGroups;
  const struct: Struct = restruct.molecule;

  const x0 = Math.min(p0.x, p1.x);
  const x1 = Math.max(p0.x, p1.x);
  const y0 = Math.min(p0.y, p1.y);
  const y1 = Math.max(p0.y, p1.y);

  const topLeftPosition = new Vec2(x0, y0);
  const topRightPosition = new Vec2(x1, y0);
  const bottomRightPosition = new Vec2(x1, y1);
  const bottomLeftPosition = new Vec2(x0, y1);

  const polygon = [
    topLeftPosition,
    topRightPosition,
    bottomRightPosition,
    bottomLeftPosition,
  ];

  restruct.visibleBonds.forEach((bond, bid) => {
    const isSkippedBond = bond.b.isPreview;
    if (isSkippedBond) return;

    let center: Vec2;
    if (bond.b.isExternalBondBetweenMonomers(struct)) {
      const firstMonomer = struct.getGroupFromAtomId(bond.b.begin);
      const secondMonomer = struct.getGroupFromAtomId(bond.b.end);

      assert(firstMonomer);
      assert(secondMonomer);

      center =
        firstMonomer.pp && secondMonomer.pp
          ? Vec2.centre(firstMonomer.pp, secondMonomer.pp)
          : bond.b.center;
    } else {
      center = bond.b.center;
    }

    if (center.x > x0 && center.x < x1 && center.y > y0 && center.y < y1) {
      bondList.push(bid);
    }
  });

  restruct.visibleAtoms.forEach((atom, aid) => {
    const relatedFGId = FunctionalGroup.findFunctionalGroupByAtom(
      functionalGroups,
      aid,
    );
    const sGroup = struct.sgroups.get(relatedFGId as number);

    if (struct.isAtomFromMacromolecule(aid)) {
      if (
        sGroup &&
        sGroup.pp &&
        sGroup.pp.x > x0 &&
        sGroup.pp.x < x1 &&
        sGroup.pp.y > y0 &&
        sGroup.pp.y < y1
      ) {
        atomList.push(aid);
      }
    } else if (
      atom.a.pp.x > x0 &&
      atom.a.pp.x < x1 &&
      atom.a.pp.y > y0 &&
      atom.a.pp.y < y1
    ) {
      atomList.push(aid);
    }
  });

  const rxnArrowsList: Array<number> = [];
  const rxnPlusesList: Array<number> = [];
  const simpleObjectsList: Array<number> = [];

  // ReRxnArrow item doesn't have center method according to types but somehow it works
  restruct.rxnArrows.forEach((item: any, id) => {
    if (
      item.item.center().x > x0 &&
      item.item.center().x < x1 &&
      item.item.center().y > y0 &&
      item.item.center().y < y1
    ) {
      rxnArrowsList.push(id);
    }
  });

  restruct.rxnPluses.forEach((item, id) => {
    if (
      item.item.pp.x > x0 &&
      item.item.pp.x < x1 &&
      item.item.pp.y > y0 &&
      item.item.pp.y < y1
    ) {
      rxnPlusesList.push(id);
    }
  });

  restruct.simpleObjects.forEach((item, id) => {
    const referencePoints = item.getReferencePoints(true);
    const referencePointInRectangle = referencePoints.find(
      (point) => point.x > x0 && point.x < x1 && point.y > y0 && point.y < y1,
    );
    if (referencePointInRectangle) {
      simpleObjectsList.push(id);
    }
  });

  const enhancedFlagList: Array<number> = [];
  // ReEnhancedFlag doesn't have pp item according to types but somehow it works
  restruct.enhancedFlags.forEach((item: any, id) => {
    if (!item.pp) return;
    if (item.pp.x > x0 && item.pp.x < x1 && item.pp.y > y0 && item.pp.y < y1) {
      enhancedFlagList.push(id);
    }
  });

  const sgroupDataList: Array<number> = [];
  restruct.sgroupData.forEach((item, id) => {
    if (
      item.sgroup.pp.x > x0 &&
      item.sgroup.pp.x < x1 &&
      item.sgroup.pp.y > y0 &&
      item.sgroup.pp.y < y1
    ) {
      sgroupDataList.push(id);
    }
  });

  const textsList: Array<number> = [];
  restruct.texts.forEach((item, id) => {
    const referencePoints = item.getReferencePoints();
    const referencePointInRectangle = referencePoints.find((point) => {
      return point.x > x0 && point.x < x1 && point.y > y0 && point.y < y1;
    });

    if (referencePointInRectangle) {
      textsList.push(id);
    }
  });

  const rgroupAttachmentPointList: number[] = [];
  restruct.visibleRGroupAttachmentPoints.forEach((item, id) => {
    if (
      item.middlePoint.x > x0 &&
      item.middlePoint.x < x1 &&
      item.middlePoint.y > y0 &&
      item.middlePoint.y < y1
    ) {
      rgroupAttachmentPointList.push(id);
    }
  });

  const reImages = Array.from(restruct.images.entries()).reduce(
    (acc: Array<number>, [id, item]): Array<number> => {
      const isPointInside = Object.values(
        item.image.getReferencePositions(),
      ).some((point) => point.isInsidePolygon(polygon));
      return isPointInside ? acc.concat(id) : acc;
    },
    [],
  );

  const reMultitailArrows = Array.from(
    restruct.multitailArrows.entries(),
  ).reduce((acc: Array<number>, [id, item]): Array<number> => {
    const isPointInside = item.multitailArrow
      .getReferencePositionsArray()
      .some((point) => point.isInsidePolygon(polygon));
    return isPointInside ? acc.concat(id) : acc;
  }, []);

  return {
    atoms: atomList,
    bonds: bondList,
    rxnArrows: rxnArrowsList,
    rxnPluses: rxnPlusesList,
    enhancedFlags: enhancedFlagList,
    sgroupData: sgroupDataList,
    simpleObjects: simpleObjectsList,
    texts: textsList,
    rgroupAttachmentPoints: rgroupAttachmentPointList,
    [IMAGE_KEY]: reImages,
    [MULTITAIL_ARROW_KEY]: reMultitailArrows,
  };
}

function getElementsInPolygon(restruct: ReStruct, rr) {
  // eslint-disable-line max-statements
  const bondList: Array<number> = [];
  const atomList: Array<number> = [];
  const r: any = [];
  const sGroups = restruct.sgroups;
  const functionalGroups = restruct.molecule.functionalGroups;
  const struct: Struct = restruct.molecule;

  for (let i = 0; i < rr.length; ++i) {
    r[i] = new Vec2(rr[i].x, rr[i].y);
  }

  restruct.bonds.forEach((bond, bid) => {
    if (
      FunctionalGroup.isBondInContractedFunctionalGroup(
        bond.b,
        sGroups,
        functionalGroups,
      )
    ) {
      return;
    }

    let center: Vec2;
    if (bond.b.isExternalBondBetweenMonomers(struct)) {
      const firstMonomer = struct.getGroupFromAtomId(bond.b.begin);
      const secondMonomer = struct.getGroupFromAtomId(bond.b.end);

      assert(firstMonomer);
      assert(secondMonomer);

      center =
        firstMonomer?.pp && secondMonomer?.pp
          ? Vec2.centre(firstMonomer.pp, secondMonomer.pp)
          : bond.b.center;
    } else {
      center = bond.b.center;
    }

    if (isPointInPolygon(r, center)) {
      bondList.push(bid);
    }
  });

  restruct.atoms.forEach((atom, aid) => {
    const relatedFGId = FunctionalGroup.findFunctionalGroupByAtom(
      functionalGroups,
      aid,
    );
    const sGroup = struct.sgroups.get(relatedFGId as number);

    if (struct.isAtomFromMacromolecule(aid)) {
      if (sGroup && sGroup.pp && isPointInPolygon(r, sGroup.pp)) {
        atomList.push(aid);
      }
    } else if (
      isPointInPolygon(r, atom.a.pp) &&
      (!FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom.a,
        sGroups,
        functionalGroups,
      ) ||
        aid === sGroup?.atoms[0])
    ) {
      atomList.push(aid);
    }
  });

  const rxnArrowsList: Array<number> = [];
  const rxnPlusesList: Array<number> = [];
  const simpleObjectsList: Array<number> = [];
  const textsList: Array<number> = [];

  restruct.rxnArrows.forEach((item, id) => {
    const referencePoints = item.getReferencePoints();
    const referencePointInPolygon = referencePoints.find((point) =>
      isPointInPolygon(r, point),
    );
    if (referencePointInPolygon) {
      rxnArrowsList.push(id);
    }
  });

  restruct.rxnPluses.forEach((item, id) => {
    if (isPointInPolygon(r, item.item.pp)) {
      rxnPlusesList.push(id);
    }
  });

  restruct.simpleObjects.forEach((item, id) => {
    const referencePoints = item.getReferencePoints(true);
    const referencePointInPolygon = referencePoints.find((point) =>
      isPointInPolygon(r, point),
    );
    if (referencePointInPolygon) {
      simpleObjectsList.push(id);
    }
  });

  restruct.texts.forEach((item, id) => {
    const referencePoints = item.getReferencePoints();
    const referencePointInPolygon = referencePoints.find((point) =>
      isPointInPolygon(r, point),
    );

    if (referencePointInPolygon) {
      textsList.push(id);
    }
  });

  const enhancedFlagList: Array<number> = [];
  // ReEnhancedFlag doesn't have pp item according to types but somehow it works
  restruct.enhancedFlags.forEach((item: any, id) => {
    if (item.pp && isPointInPolygon(r, item.pp)) {
      enhancedFlagList.push(id);
    }
  });

  const sgroupDataList: Array<number> = [];
  restruct.sgroupData.forEach((item, id) => {
    if (isPointInPolygon(r, item.sgroup.pp)) {
      sgroupDataList.push(id);
    }
  });

  const rgroupAttachmentPointList: number[] = [];
  restruct.visibleRGroupAttachmentPoints.forEach((item, id) => {
    if (isPointInPolygon(r, item.middlePoint)) {
      rgroupAttachmentPointList.push(id);
    }
  });

  const reImages = Array.from(restruct.images.entries()).reduce(
    (acc: Array<number>, [id, item]) => {
      const isPointInside = Object.values(
        item.image.getReferencePositions(),
      ).some((point) => isPointInPolygon(r, point));
      return isPointInside ? acc.concat(id) : acc;
    },
    [],
  );

  const reMultitailArrows = Array.from(
    restruct.multitailArrows.entries(),
  ).reduce((acc: Array<number>, [id, item]) => {
    const isPointInside = item.multitailArrow
      .getReferencePositionsArray()
      .some((point) => isPointInPolygon(r, point));
    return isPointInside ? acc.concat(id) : acc;
  }, []);

  return {
    atoms: atomList,
    bonds: bondList,
    rxnArrows: rxnArrowsList,
    rxnPluses: rxnPlusesList,
    enhancedFlags: enhancedFlagList,
    sgroupData: sgroupDataList,
    simpleObjects: simpleObjectsList,
    texts: textsList,
    rgroupAttachmentPoints: rgroupAttachmentPointList,
    [IMAGE_KEY]: reImages,
    [MULTITAIL_ARROW_KEY]: reMultitailArrows,
  };
}

// TODO: test me see testPolygon from
// 'Remove unused methods from render' commit
function isPointInPolygon(r, p) {
  // eslint-disable-line max-statements
  const d = new Vec2(0, 1);
  const n = d.rotate(Math.PI / 2);
  let v0 = Vec2.diff(r[r.length - 1], p);
  let n0 = Vec2.dot(n, v0);
  let d0 = Vec2.dot(d, v0);
  let w0 = new Vec2(0, 0);
  let counter = 0;
  const eps = 1e-5;
  let flag1 = false;
  let flag0 = false;

  for (let i = 0; i < r.length; ++i) {
    const v1 = Vec2.diff(r[i], p);
    const w1 = Vec2.diff(v1, v0);
    const n1 = Vec2.dot(n, v1);
    const d1 = Vec2.dot(d, v1);
    flag1 = false;
    if (n1 * n0 < 0) {
      if (d1 * d0 > -eps) {
        if (d0 > -eps) flag1 = true;
        /* eslint-disable no-mixed-operators */
      } else if (
        (Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 >
        0
      ) {
        /* eslint-enable no-mixed-operators */
        flag1 = true;
      }
    }
    if (flag1 && flag0 && Vec2.dot(w1, n) * Vec2.dot(w0, n) >= 0) {
      flag1 = false;
    }
    if (flag1) {
      counter++;
    }
    v0 = v1;
    n0 = n1;
    d0 = d1;
    w0 = w1;
    flag0 = flag1;
  }
  return counter % 2 !== 0;
}

export default {
  inRectangle: getElementsInRectangle,
  inPolygon: getElementsInPolygon,
};
