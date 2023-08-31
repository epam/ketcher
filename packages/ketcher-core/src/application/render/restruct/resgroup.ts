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
  Box2Abs,
  FunctionalGroup,
  Pile,
  SGroup,
  Vec2,
  Bond,
} from 'domain/entities';
import { SgContexts } from 'application/editor/shared/constants';
import ReDataSGroupData from './redatasgroupdata';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { tfx } from 'utilities';
import BracketParams from '../bracket-params';
import { RaphaelPaper } from 'raphael';
import { RenderOptions } from '../render.types';
interface SGroupdrawBracketsOptions {
  set: any;
  render: Render;
  sgroup: SGroup;
  crossBonds: { [key: number]: Array<Bond> };
  atomSet: Pile;
  bracketBox: Box2Abs;
  direction: Vec2;
  lowerIndexText?: string | null;
  upperIndexText?: string | null;
  indexAttribute?: object;
}

class ReSGroup extends ReObject {
  public item: SGroup | undefined;
  public render!: Render;

  constructor(sgroup: SGroup) {
    super('sgroup');
    /** @type {SGroup} */
    this.item = sgroup;
  }

  static isSelectable(): boolean {
    return false;
  }

  /**
   * @param remol {ReStruct}
   * @param sgroup {SGroup}
   * @returns {*}
   */
  draw(remol: ReStruct, sgroup: SGroup): any {
    this.render = remol.render;
    let set = this.render.paper.set();
    const atomSet = new Pile(sgroup.atoms);
    const crossBonds = SGroup.getCrossBonds(remol.molecule, atomSet);
    SGroup.bracketPos(sgroup, remol.molecule, crossBonds, remol, this.render);
    const bracketBox = sgroup.bracketBox;
    const direction = sgroup.bracketDirection;
    sgroup.areas = [bracketBox];
    if (sgroup.isExpanded()) {
      const SGroupdrawBracketsOptions: SGroupdrawBracketsOptions = {
        set,
        render: this.render,
        sgroup,
        crossBonds,
        atomSet,
        bracketBox,
        direction,
      };
      switch (sgroup.type) {
        case 'MUL': {
          SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.mul;
          break;
        }
        case 'SRU': {
          let connectivity: string = sgroup.data.connectivity || 'eu';
          if (connectivity === 'ht') connectivity = '';
          const subscript = sgroup.data.subscript || 'n';
          SGroupdrawBracketsOptions.lowerIndexText = subscript;
          SGroupdrawBracketsOptions.upperIndexText = connectivity;
          break;
        }
        case 'SUP': {
          SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.name;
          SGroupdrawBracketsOptions.upperIndexText = null;
          SGroupdrawBracketsOptions.indexAttribute = { 'font-style': 'italic' };
          break;
        }
        case 'GEN': {
          break;
        }
        case 'DAT': {
          set = drawGroupDat(remol, sgroup);
          break;
        }
        default:
          break;
      }

      // DAT S-Groups do not have brackets
      const sgroupTypesWithBrackets = ['MUL', 'SRU', 'SUP', 'GEN'];
      if (sgroupTypesWithBrackets.includes(sgroup.type)) {
        SGroupdrawBrackets(SGroupdrawBracketsOptions);
      }
    }
    return set;
  }

  getTextHighlightDimensions(
    padding = 0,
    render: Render,
  ): { startX: number; startY: number; width: number; height: number } {
    let startX = 0;
    let startY = 0;
    let width = 0;
    let height = 0;
    const sGroup = this.item;
    if (sGroup) {
      const { atomId, position } = sGroup.getContractedPosition(
        render.ctab.molecule,
      );

      if (sGroup?.isContracted() && position) {
        const reSGroupAtom = render.ctab.atoms.get(atomId);
        const sGroupTextBoundingBox =
          reSGroupAtom?.visel.boundingBox || reSGroupAtom?.visel.oldBoundingBox;
        if (sGroupTextBoundingBox) {
          const { x, y } = Scale.obj2scaled(position, render.options);
          const { p0, p1 } = sGroupTextBoundingBox;
          width = p1.x - p0.x + padding * 2;
          height = p1.y - p0.y + padding * 2;
          startX = x - width / 2;
          startY = y - height / 2;
        }
      }
    }

    return { startX, startY, width, height };
  }

  getContractedSelectionContour(render: Render): any {
    const { paper, options } = render;
    const { fontsz, radiusScaleFactor } = options;
    const radius = fontsz * radiusScaleFactor * 2;
    const { startX, startY, width, height } = this.getTextHighlightDimensions(
      fontsz / 2,
      render,
    );
    return paper.rect(startX, startY, width, height, radius);
  }

  makeSelectionPlate(
    restruct: ReStruct,
    _paper: RaphaelPaper,
    options: any,
  ): any | void {
    const sgroup = this.item;
    const functionalGroups = restruct.molecule.functionalGroups;
    const render = restruct.render;
    if (
      FunctionalGroup.isContractedFunctionalGroup(sgroup?.id, functionalGroups)
    ) {
      return this.getContractedSelectionContour(render).attr(
        options.selectionStyle,
      );
    }
  }

  drawHover(render: Render): void {
    // eslint-disable-line max-statements
    const options = render.options;
    const paper = render.paper;
    const sGroupItem = this.item;
    if (sGroupItem) {
      const { a0, a1, b0, b1 } = getHighlighPathInfo(sGroupItem, render);
      const functionalGroups = render.ctab.molecule.functionalGroups;
      const set = paper.set();
      if (
        FunctionalGroup.isContractedFunctionalGroup(
          sGroupItem.id,
          functionalGroups,
        )
      ) {
        sGroupItem.hovering = this.getContractedSelectionContour(render).attr(
          options.hoverStyle,
        );
      } else if (!this.selected) {
        sGroupItem.hovering = paper
          .path(
            'M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}',
            tfx(a0.x),
            tfx(a0.y),
            tfx(a1.x),
            tfx(a1.y),
            tfx(b1.x),
            tfx(b1.y),
            tfx(b0.x),
            tfx(b0.y),
          )
          .attr(options.hoverStyle);
      }
      set.push(sGroupItem.hovering);

      SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach((aid) => {
        set.push(render?.ctab?.atoms?.get(aid)?.makeHoverPlate(render));
      }, this);
      SGroup.getBonds(render.ctab.molecule, sGroupItem).forEach((bid) => {
        set.push(render?.ctab?.bonds?.get(bid)?.makeHoverPlate(render));
      }, this);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, set);
    }
  }

  show(restruct: ReStruct): void {
    const render = restruct.render;
    const sgroup = this.item;
    if (sgroup && sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const remol = render.ctab;
      const path = this.draw(remol, sgroup);
      restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true);
      this.setHover(this.hover, render); // TODO: fix this
    }
  }
}

function SGroupdrawBrackets({
  set,
  render,
  sgroup,
  crossBonds,
  atomSet,
  bracketBox,
  direction,
  lowerIndexText,
  upperIndexText,
  indexAttribute,
}: SGroupdrawBracketsOptions): void {
  const attachmentPoints = [...atomSet].reduce((arr, atomId) => {
    const rgroupAttachmentPointIds =
      render.ctab.molecule.getRGroupAttachmentPointsByAtomId(atomId);
    return [...arr, ...rgroupAttachmentPointIds];
  }, []);
  const crossBondsPerAtom = Object.values(crossBonds);
  const crossBondsValues = crossBondsPerAtom.flat();
  const brackets = getBracketParameters(
    render.ctab,
    crossBondsPerAtom,
    crossBondsValues,
    attachmentPoints,
    bracketBox,
    direction,
    render,
    sgroup.id,
  );
  let ir = -1;
  const isBracketContainAttachment =
    crossBondsValues.length === 2 &&
    crossBondsPerAtom.length === 1 &&
    !!attachmentPoints.length;
  for (let i = 0; i < brackets.length; ++i) {
    const bracket = brackets[i];
    const path = draw.bracket(
      render.paper,
      Scale.obj2scaled(bracket.bracketAngleDirection, render.options),
      Scale.obj2scaled(bracket.bracketDirection, render.options),
      Scale.obj2scaled(bracket.center, render.options),
      bracket.width,
      bracket.height,
      render.options,
      isBracketContainAttachment,
    );
    set.push(path);
    if (
      ir < 0 ||
      brackets[ir].bracketAngleDirection.x < bracket.bracketAngleDirection.x ||
      (brackets[ir].bracketAngleDirection.x ===
        bracket.bracketAngleDirection.x &&
        brackets[ir].bracketAngleDirection.y > bracket.bracketAngleDirection.y)
    ) {
      ir = i;
    }
  }
  const bracketR = brackets[ir];
  function renderIndex(text: string, shift: number): void {
    const indexPos = Scale.obj2scaled(
      bracketR.center.addScaled(
        bracketR.bracketDirection,
        shift * bracketR.height,
      ),
      render.options,
    );
    const indexPath = render.paper.text(indexPos.x, indexPos.y, text).attr({
      font: render.options.font,
      'font-size': render.options.fontszsub,
    });
    if (indexAttribute) indexPath.attr(indexAttribute);
    const indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
    const t =
      Math.max(
        util.shiftRayBox(
          indexPos,
          bracketR.bracketAngleDirection.negated(),
          indexBox,
        ),
        3,
      ) + 2;
    indexPath.translateAbs(
      t * bracketR.bracketAngleDirection.x,
      t * bracketR.bracketAngleDirection.y,
    );
    set.push(indexPath);
  }
  if (lowerIndexText) renderIndex(lowerIndexText, 0.5);
  if (upperIndexText) renderIndex(upperIndexText, -0.5);
}

function showValue(
  paper: RaphaelPaper,
  pos: Vec2 | undefined,
  sgroup: SGroup,
  options: RenderOptions,
): any {
  const text = paper.text(pos?.x, pos?.y, sgroup.data.fieldValue).attr({
    font: options.font,
    'font-size': options.fontsz,
  });
  const box = text.getBBox();
  let rect = paper.rect(
    box.x - 1,
    box.y - 1,
    box.width + 2,
    box.height + 2,
    3,
    3,
  );
  rect = sgroup.selected
    ? rect.attr(options.selectionStyle)
    : rect.attr({ fill: '#fff', stroke: '#fff' });
  const set = paper.set();
  set.push(rect, text.toFront());
  return set;
}

function drawGroupDat(restruct: ReStruct, sgroup: SGroup) {
  SGroup.bracketPos(sgroup, restruct.molecule);
  sgroup.areas = sgroup.bracketBox ? [sgroup.bracketBox] : [];

  if (sgroup.pp === null) sgroup.calculatePP(restruct.molecule);

  return sgroup.data.attached
    ? drawAttachedDat(restruct, sgroup)
    : drawAbsoluteDat(restruct, sgroup);
}

function drawAbsoluteDat(restruct: ReStruct, sgroup: SGroup): any {
  const render = restruct.render;
  const options = render.options;
  const paper = render.paper;
  const set = paper.set();

  const ps = sgroup?.pp?.scaled(options.scale);
  const name = showValue(paper, ps, sgroup, options);

  if (sgroup.data.context !== SgContexts.Bond) {
    const box = util.relBox(name.getBBox());
    name.translateAbs(0.5 * box.width, -0.5 * box.height);
  }

  set.push(name);

  const sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
  sgroup.dataArea = sbox.transform(Scale.scaled2obj, render.options);

  if (!restruct.sgroupData.has(sgroup.id)) {
    restruct.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup));
  }

  return set;
}

function drawAttachedDat(restruct: ReStruct, sgroup: SGroup): any {
  const render = restruct.render;
  const options = render.options;
  const paper = render.paper;
  const set = paper.set();

  SGroup.getAtoms(restruct, sgroup).forEach((aid) => {
    const atom = restruct.atoms.get(aid);
    if (atom) {
      const p = Scale.obj2scaled(atom.a.pp, options);
      const bb = atom.visel.boundingBox;
      if (bb !== null) p.x = Math.max(p.x, bb.p1.x);
      p.x += options.lineWidth; // shift a bit to the right
      const nameI = showValue(paper, p, sgroup, options);
      const boxI = util.relBox(nameI.getBBox());
      nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height);
      set.push(nameI);
      let sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()));
      sboxI = sboxI.transform(Scale.scaled2obj, render.options);
      sgroup.areas.push(sboxI);
    }
  });

  return set;
}

function getBracketParameters(
  ctab,
  crossBondsPerAtom,
  crossBondsValues,
  attachmentPoints,
  bracketBox,
  direction,
  render,
  id,
) {
  const mol = ctab.molecule;
  const brackets: BracketParams[] = [];
  let bracketDirection = direction.rotateSC(1, 0);

  if (crossBondsValues.length < 2) {
    (function () {
      direction = direction || new Vec2(1, 0);
      bracketDirection = bracketDirection || direction.rotateSC(1, 0);
      const bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3);
      const leftCenter = Vec2.lc2(
        direction,
        bracketBox.p0.x,
        bracketDirection,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y),
      );
      const rightCenter = Vec2.lc2(
        direction,
        bracketBox.p1.x,
        bracketDirection,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y),
      );
      const bracketHeight = bracketBox.sz().y;

      brackets.push(
        new BracketParams(
          leftCenter,
          direction.negated(),
          bracketWidth,
          bracketHeight,
        ),
        new BracketParams(rightCenter, direction, bracketWidth, bracketHeight),
      );
    })();
  } else if (crossBondsValues.length === 2 && crossBondsPerAtom.length === 2) {
    (() => {
      // eslint-disable-line max-statements
      const bond1 = mol.bonds.get(crossBondsValues[0]);
      const bond2 = mol.bonds.get(crossBondsValues[1]);
      const leftCenter = bond1.getCenter(mol);
      const rightCenter = bond2.getCenter(mol);
      let tl = -1;
      let tr = -1;
      let tt = -1;
      let tb = -1;
      const cc = Vec2.centre(leftCenter, rightCenter);
      const rightDirection = Vec2.diff(rightCenter, leftCenter).normalized();
      const leftDirection = rightDirection.negated();
      const bracketDirection = rightDirection.rotateSC(1, 0);
      const bracketDirectionNegated = bracketDirection.negated();

      mol.sGroupForest.children.get(id).forEach((sgid) => {
        let boundingBox = render.ctab.sgroups.get(sgid).visel.boundingBox;
        boundingBox = boundingBox
          .translate((render.options.offset || new Vec2()).negated())
          .transform(Scale.scaled2obj, render.options);
        tl = Math.max(
          tl,
          util.shiftRayBox(leftCenter, leftDirection, boundingBox),
        );
        tr = Math.max(
          tr,
          util.shiftRayBox(rightCenter, rightDirection, boundingBox),
        );
        tt = Math.max(tt, util.shiftRayBox(cc, bracketDirection, boundingBox));
        tb = Math.max(
          tb,
          util.shiftRayBox(cc, bracketDirectionNegated, boundingBox),
        );
      });
      tl = Math.max(tl + 0.2, 0);
      tr = Math.max(tr + 0.2, 0);
      tt = Math.max(Math.max(tt, tb) + 0.1, 0);
      const bracketWidth = 0.25;
      let bracketHeight;
      if (!attachmentPoints.length) {
        bracketHeight = 1.5 + tt;
      } else {
        bracketHeight = 2 + 2 * Math.sin(Math.PI / 6) + tt;
      }
      brackets.push(
        new BracketParams(
          leftCenter.addScaled(leftDirection, tl),
          leftDirection,
          bracketWidth,
          bracketHeight,
        ),
        new BracketParams(
          rightCenter.addScaled(rightDirection, tr),
          rightDirection,
          bracketWidth,
          bracketHeight,
        ),
      );
    })();
  } else {
    (function () {
      const bondDirections: Vec2[] = [];
      let notTemplateShapeFirstAtom = false;
      for (let i = 0; i < crossBondsValues.length; ++i) {
        const bond = mol.bonds.get(crossBondsValues[i]);
        bondDirections.push(bond.getDir(mol));
      }
      // if bonds direction is clockwise, then negated
      const needNegated =
        Vec2.crossProduct(bondDirections[0], bondDirections[1]) > 0;
      crossBondsValues = crossBondsValues.sort((id1, id2) => {
        notTemplateShapeFirstAtom = Math.abs(id1 - id2) === 1;
        return notTemplateShapeFirstAtom && !needNegated ? -1 : 0;
      });
      for (let i = 0; i < crossBondsValues.length; ++i) {
        const bond = mol.bonds.get(crossBondsValues[i]);
        let bondDirection = bond.getDir(mol);
        let bracketDirection;
        let bracketAngleDirection;
        let attachmentDirection;
        if (attachmentPoints.length !== 2) {
          if (needNegated && notTemplateShapeFirstAtom) {
            bondDirection = bondDirection.negated();
          }
          bondDirection = i === 0 ? bondDirection : bondDirection.negated();
          bracketDirection =
            i === 0
              ? bondDirection.rotateSC(1, 0)
              : bondDirection.rotateSC(1, 0).negated();
          bracketAngleDirection = bondDirection;
        }
        // if there are 2 attachment points then make brackets parallel to attachments
        if (
          attachmentPoints.length === 2 &&
          attachmentPoints[i] !== undefined
        ) {
          attachmentDirection = ctab.rgroupAttachmentPoints.get(
            attachmentPoints[i],
          )?.lineDirectionVector;
          bracketDirection = attachmentDirection;
          bracketAngleDirection =
            i === 0
              ? bracketDirection.rotateSC(1, 0).negated()
              : bracketDirection.rotateSC(1, 0);
        }
        brackets.push(
          new BracketParams(
            bond.getCenter(mol),
            bracketAngleDirection,
            0.2,
            attachmentPoints.length ? 1.8 : bracketBox.sz().y,
            bracketDirection,
          ),
        );
      }
    })();
  }
  return brackets;
}

/**
 * @param sgroup {SGroup}
 * @param render {Render}
 * @returns {{a1: Vec2, size: number | number, startY: number, startX: number, b0: Vec2, a0: Vec2, b1: Vec2}}
 */
function getHighlighPathInfo(
  sgroup: SGroup,
  render: Render,
): {
  a0: Vec2;
  a1: Vec2;
  b0: Vec2;
  b1: Vec2;
  startX: number;
  startY: number;
  size: number;
} {
  const options = render.options;
  let bracketBox = sgroup.bracketBox.transform(Scale.obj2scaled, options);
  const lineWidth = options.lineWidth;
  const vext = new Vec2(lineWidth * 4, lineWidth * 6);
  bracketBox = bracketBox.extend(vext, vext);
  const direction = sgroup.bracketDirection;
  const bracketDirection = direction.rotateSC(1, 0);
  const a0 = Vec2.lc2(
    direction,
    bracketBox.p0.x,
    bracketDirection,
    bracketBox.p0.y,
  );
  const a1 = Vec2.lc2(
    direction,
    bracketBox.p0.x,
    bracketDirection,
    bracketBox.p1.y,
  );
  const b0 = Vec2.lc2(
    direction,
    bracketBox.p1.x,
    bracketDirection,
    bracketBox.p0.y,
  );
  const b1 = Vec2.lc2(
    direction,
    bracketBox.p1.x,
    bracketDirection,
    bracketBox.p1.y,
  );
  const size = options.contractedFunctionalGroupSize;
  let startX = (b0.x + a0.x) / 2 - size / 2;
  let startY = (a1.y + a0.y) / 2 - size / 2;
  const { position: contractedPosition } = sgroup.getContractedPosition(
    render.ctab.molecule,
  );
  if (contractedPosition) {
    const shift = new Vec2(size / 2, size / 2, 0);
    const hoverPp = Vec2.diff(contractedPosition.scaled(40), shift);
    startX = hoverPp.x;
    startY = hoverPp.y;
  }
  return {
    a0,
    a1,
    b0,
    b1,
    startX,
    startY,
    size,
  };
}

export default ReSGroup;
