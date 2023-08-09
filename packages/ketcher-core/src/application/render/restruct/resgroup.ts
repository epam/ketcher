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

import { Box2Abs, FunctionalGroup, Pile, SGroup, Vec2 } from 'domain/entities';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { tfx } from 'utilities';

interface SGroupdrawBracketsOptions {
  set: any;
  render: Render;
  sg: SGroup;
  crossBonds: { [key: number]: Array<any> };
  atomSet: Pile;
  bracketBox: Box2Abs;
  d: Vec2;
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
    const set = this.render.paper.set();
    const atomSet = new Pile(sgroup.atoms);
    const crossBonds = SGroup.getCrossBonds(remol.molecule, atomSet);
    SGroup.bracketPos(sgroup, remol.molecule, crossBonds, remol, this.render);
    const bracketBox = sgroup.bracketBox;
    const d = sgroup.bracketDir;
    sgroup.areas = [bracketBox];
    if (sgroup.isExpanded()) {
      const SGroupdrawBracketsOptions: SGroupdrawBracketsOptions = {
        set,
        render: this.render,
        sg: sgroup,
        crossBonds,
        atomSet,
        bracketBox,
        d,
      };
      switch (sgroup.type) {
        case 'MUL': {
          SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.mul;
          break;
        }
        case 'SRU': {
          let connectivity = sgroup.data.connectivity || 'eu';
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
          SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.fieldValue;
          break;
        }
        default:
          break;
      }

      const validSgroupTypes = ['MUL', 'SRU', 'SUP', 'GEN', 'DAT'];
      if (validSgroupTypes.includes(sgroup.type)) {
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
    _paper: any,
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
  sg,
  crossBonds,
  atomSet,
  bracketBox,
  d,
  lowerIndexText,
  upperIndexText,
  indexAttribute,
}: SGroupdrawBracketsOptions): void {
  // eslint-disable-line max-params
  const brackets = getBracketParameters(
    render.ctab.molecule,
    crossBonds,
    atomSet,
    bracketBox,
    d,
    render,
    sg.id,
  );
  let ir = -1;
  for (let i = 0; i < brackets.length; ++i) {
    const bracket = brackets[i];
    const path = draw.bracket(
      render.paper,
      Scale.obj2scaled(bracket.d, render.options),
      Scale.obj2scaled(bracket.n, render.options),
      Scale.obj2scaled(bracket.c, render.options),
      bracket.w,
      bracket.h,
      render.options,
    );
    set.push(path);
    if (
      ir < 0 ||
      brackets[ir].d.x < bracket.d.x ||
      (brackets[ir].d.x === bracket.d.x && brackets[ir].d.y > bracket.d.y)
    ) {
      ir = i;
    }
  }
  const bracketR = brackets[ir];
  function renderIndex(text: string, shift: number): void {
    const indexPos = Scale.obj2scaled(
      bracketR.c.addScaled(bracketR.n, shift * bracketR.h),
      render.options,
    );
    const indexPath = render.paper.text(indexPos.x, indexPos.y, text).attr({
      font: render.options.font,
      'font-size': render.options.fontszsub,
    });
    if (indexAttribute) indexPath.attr(indexAttribute);
    const indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
    const t =
      Math.max(util.shiftRayBox(indexPos, bracketR.d.negated(), indexBox), 3) +
      2;
    indexPath.translateAbs(t * bracketR.d.x, t * bracketR.d.y);
    set.push(indexPath);
  }
  if (lowerIndexText) renderIndex(lowerIndexText, 0.5);
  if (upperIndexText) renderIndex(upperIndexText, -0.5);
}

function getBracketParameters(
  mol: any,
  crossBonds: { [key: number]: Array<any> },
  atomSet: Pile,
  bracketBox: Box2Abs,
  d: Vec2,
  render: Render,
  id: number,
): Array<any> {
  // eslint-disable-line max-params
  const BracketParams = (c: Vec2, d: Vec2, w: number, h: number): any => {
    return {
      c,
      d,
      h,
      n: d.rotateSC(1, 0),
      w,
    };
  };
  const brackets: Array<any> = [];
  let n = d.rotateSC(1, 0);
  const crossBondsPerAtom = Object.values(crossBonds);
  const crossBondsValues = crossBondsPerAtom.flat();
  if (crossBondsValues.length < 2) {
    (function () {
      d = d || new Vec2(1, 0);
      n = n || d.rotateSC(1, 0);
      const bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3);
      const cl = Vec2.lc2(
        d,
        bracketBox.p0.x,
        n,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y),
      );
      const cr = Vec2.lc2(
        d,
        bracketBox.p1.x,
        n,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y),
      );
      const bracketHeight = bracketBox.sz().y;

      brackets.push(
        BracketParams(cl, d.negated(), bracketWidth, bracketHeight),
        BracketParams(cr, d, bracketWidth, bracketHeight),
      );
    })();
  } else if (crossBondsValues.length === 2 && crossBondsPerAtom.length === 2) {
    (function () {
      // eslint-disable-line max-statements
      const b1 = mol.bonds.get(crossBondsValues[0]);
      const b2 = mol.bonds.get(crossBondsValues[1]);
      const cl0 = b1.getCenter(mol);
      const cr0 = b2.getCenter(mol);
      let tl = -1;
      let tr = -1;
      let tt = -1;
      let tb = -1;
      const cc = Vec2.centre(cl0, cr0);
      const dr = Vec2.diff(cr0, cl0).normalized();
      const dl = dr.negated();
      const dt = dr.rotateSC(1, 0);
      const db = dt.negated();

      mol.sGroupForest.children.get(id).forEach((sgid) => {
        let bba = render?.ctab?.sgroups?.get(sgid)?.visel.boundingBox;
        bba =
          bba
            ?.translate((render.options.offset || new Vec2()).negated())
            .transform(Scale.scaled2obj, render.options) || new Box2Abs();
        tl = Math.max(tl, util.shiftRayBox(cl0, dl, bba));
        tr = Math.max(tr, util.shiftRayBox(cr0, dr, bba));
        tt = Math.max(tt, util.shiftRayBox(cc, dt, bba));
        tb = Math.max(tb, util.shiftRayBox(cc, db, bba));
      });
      tl = Math.max(tl + 0.2, 0);
      tr = Math.max(tr + 0.2, 0);
      tt = Math.max(Math.max(tt, tb) + 0.1, 0);
      const bracketWidth = 0.25;
      const bracketHeight = 1.5 + tt;
      brackets.push(
        BracketParams(cl0.addScaled(dl, tl), dl, bracketWidth, bracketHeight),
        BracketParams(cr0.addScaled(dr, tr), dr, bracketWidth, bracketHeight),
      );
    })();
  } else {
    (function () {
      for (let i = 0; i < crossBondsValues.length; ++i) {
        const b = mol.bonds.get(crossBondsValues[i]);
        const c = b.getCenter(mol);
        const d = atomSet.has(b.begin)
          ? b.getDir(mol)
          : b.getDir(mol).negated();
        brackets.push(BracketParams(c, d, 0.2, 1.0));
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
  const d = sgroup.bracketDir;
  const n = d.rotateSC(1, 0);
  const a0 = Vec2.lc2(d, bracketBox.p0.x, n, bracketBox.p0.y);
  const a1 = Vec2.lc2(d, bracketBox.p0.x, n, bracketBox.p1.y);
  const b0 = Vec2.lc2(d, bracketBox.p1.x, n, bracketBox.p0.y);
  const b1 = Vec2.lc2(d, bracketBox.p1.x, n, bracketBox.p1.y);
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
