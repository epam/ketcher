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
  SGroup,
  Vec2,
  MonomerMicromolecule,
  SUPERATOM_CLASS,
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
import paperjs from 'paper';
interface SGroupdrawBracketsOptions {
  set: any;
  render: Render;
  sgroup: SGroup;
  bracketBox: Box2Abs;
  direction: Vec2;
  lowerIndexText?: string | null;
  upperIndexText?: string | null;
  indexAttribute?: object;
  superatomClass?: SUPERATOM_CLASS;
}

export const SUPERATOM_CLASS_TEXT = {
  [SUPERATOM_CLASS.BASE]: 'Base',
  [SUPERATOM_CLASS.SUGAR]: 'Sugar',
  [SUPERATOM_CLASS.PHOSPHATE]: 'Phosphate',
};

// Helper function to convert SVG elements into Paper.js paths
export function paperPathFromSVGElement(element) {
  const tagName = element.tagName;
  let path;

  if (tagName === 'circle') {
    // Convert circle to Paper.js Path.Circle
    const cx = parseFloat(element.getAttribute('cx'));
    const cy = parseFloat(element.getAttribute('cy'));
    const r = parseFloat(element.getAttribute('r'));
    path = new paperjs.Path.Circle(new paperjs.Point(cx, cy), r);
  } else if (tagName === 'rect') {
    // Convert rectangle to Paper.js Path.Rectangle
    const x = parseFloat(element.getAttribute('x'));
    const y = parseFloat(element.getAttribute('y'));
    const width = parseFloat(element.getAttribute('width'));
    const height = parseFloat(element.getAttribute('height'));
    path = new paperjs.Path.Rectangle(
      new paperjs.Rectangle(x, y, width, height),
      new paperjs.Size(
        parseFloat(element.getAttribute('rx') || '0'),
        parseFloat(element.getAttribute('ry') || '0'),
      ),
    );
  } else if (tagName === 'path') {
    // Use the `d` attribute directly for Path data
    const d = element.getAttribute('d');
    path = new paperjs.CompoundPath(d);
  }
  return path;
}

class ReSGroup extends ReObject {
  public item: SGroup | undefined;
  public render!: Render;
  private expandedMonomerAttachmentPoints?: any; // Raphael paths

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
    SGroup.bracketPos(sgroup, remol.molecule, remol, this.render);
    const bracketBox = sgroup.bracketBox;
    const direction = sgroup.bracketDirection;
    sgroup.areas = [bracketBox];
    if (sgroup.isExpanded()) {
      const SGroupdrawBracketsOptions: SGroupdrawBracketsOptions = {
        set,
        render: this.render,
        sgroup,
        bracketBox,
        direction,
      };
      switch (sgroup.type) {
        case 'MUL': {
          SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.mul;
          break;
        }
        case 'queryComponent': {
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
          SGroupdrawBracketsOptions.lowerIndexText =
            sgroup.data.name || SUPERATOM_CLASS_TEXT[sgroup.data.class];
          SGroupdrawBracketsOptions.upperIndexText = null;
          SGroupdrawBracketsOptions.indexAttribute = { 'font-style': 'italic' };
          SGroupdrawBracketsOptions.superatomClass = sgroup.data.class;
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
      const sgroupTypesWithBrackets = [
        'MUL',
        'SRU',
        'SUP',
        'GEN',
        'queryComponent',
      ];
      if (
        sgroupTypesWithBrackets.includes(sgroup.type) &&
        !sgroup.isSuperatomWithoutLabel &&
        !(sgroup instanceof MonomerMicromolecule)
      ) {
        SGroupdrawBrackets(SGroupdrawBracketsOptions);
      }
    }
    return set;
  }

  getTextHighlightDimensions(
    render: Render,
    padding = 0,
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
          const { x, y } = Scale.modelToCanvas(position, render.options);
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
    const { fontszInPx, radiusScaleFactor } = options;
    const radius = fontszInPx * radiusScaleFactor * 2;
    const { startX, startY, width, height } = this.getTextHighlightDimensions(
      render,
      fontszInPx / 2,
    );
    return paper.rect(startX, startY, width, height, radius);
  }

  makeSelectionPlate(
    restruct: ReStruct,
    _paper: RaphaelPaper,
    options: any,
  ): any {
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
      const hoversToCombine: Array<any> = [];
      const otherHovers = paper.set();

      if (
        FunctionalGroup.isContractedFunctionalGroup(
          sGroupItem.id,
          functionalGroups,
        )
      ) {
        sGroupItem.hovering = this.getContractedSelectionContour(render).attr(
          options.hoverStyle,
        );
        hoversToCombine.push(sGroupItem.hovering);
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
        otherHovers.push(sGroupItem.hovering);
      }

      SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach((aid) => {
        const atom = render?.ctab?.atoms?.get(aid);

        hoversToCombine.push(atom?.makeHoverPlate(render));
      }, this);
      SGroup.getBonds(render.ctab.molecule, sGroupItem).forEach((bid) => {
        hoversToCombine.push(
          render?.ctab?.bonds?.get(bid)?.makeHoverPlate(render),
        );
      }, this);

      const elements: Element[] = [];

      hoversToCombine.forEach((item) => {
        if (item?.node) {
          elements.push(item.node);
          item.node.remove();
        }
      });

      paperjs.setup(document.createElement('canvas')); // Paper.js works on an offscreen canvas

      // Generate Paper.js paths from all SVG elements
      let combinedPath: any = null;

      elements.forEach((el) => {
        const paperPath = paperPathFromSVGElement(el);

        if (!paperPath) {
          return;
        }

        if (!paperPath.closed) {
          paperPath.closePath();
        }

        if (!combinedPath) {
          combinedPath = paperPath;
        } else {
          combinedPath = combinedPath.unite(paperPath);
        }
      });

      if (!combinedPath) {
        return;
      }

      const combinedPathD = combinedPath.pathData;

      render.ctab.addReObjectPath(
        LayerMap.hovering,
        this.visel,
        paper.path(combinedPathD).attr(options.hoverStyle),
      );
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, otherHovers);
    }
  }

  setHover(hover: boolean, render: Render) {
    super.setHover(hover, render);

    if (!hover || this.selected) {
      this.expandedMonomerAttachmentPoints?.hide();

      return;
    }

    if (
      !this.expandedMonomerAttachmentPoints?.length ||
      this.expandedMonomerAttachmentPoints?.[0]?.removed
    ) {
      this.expandedMonomerAttachmentPoints = undefined;
    }

    if (this.expandedMonomerAttachmentPoints) {
      this.expandedMonomerAttachmentPoints.show();
    } else {
      const paper = render.paper;
      const sGroupItem = this.item;

      if (!sGroupItem) {
        return;
      }

      const set = paper.set();

      render.paper.setStart();

      SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach((aid) => {
        const atom = render?.ctab?.atoms?.get(aid);

        set.push(atom?.makeMonomerAttachmentPointHighlightPlate(render));
      }, this);

      render.ctab.addReObjectPath(LayerMap.atom, this.visel, set);
      this.expandedMonomerAttachmentPoints = render.paper.setFinish();
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
  bracketBox,
  direction,
  lowerIndexText,
  upperIndexText,
  indexAttribute,
  superatomClass,
}: SGroupdrawBracketsOptions): void {
  const brackets = getBracketParameters(bracketBox, direction);
  let rightBracketIndex = -1;

  for (let i = 0; i < brackets.length; ++i) {
    const bracket = brackets[i];
    const path = draw.bracket(
      render.paper,
      Scale.modelToCanvas(bracket.bracketAngleDirection, render.options),
      Scale.modelToCanvas(bracket.bracketDirection, render.options),
      Scale.modelToCanvas(bracket.center, render.options),
      bracket.width,
      bracket.height,
      render.options,
    );
    set.push(path);
    if (
      rightBracketIndex < 0 ||
      brackets[rightBracketIndex].bracketAngleDirection.x <
        bracket.bracketAngleDirection.x ||
      (brackets[rightBracketIndex].bracketAngleDirection.x ===
        bracket.bracketAngleDirection.x &&
        brackets[rightBracketIndex].bracketAngleDirection.y >
          bracket.bracketAngleDirection.y)
    ) {
      rightBracketIndex = i;
    }
  }
  const bracketR = brackets[rightBracketIndex];
  function renderIndex(
    text: string,
    isLowerText = false,
    superatomClass?: SUPERATOM_CLASS,
  ): void {
    let path: Vec2;
    let lowerPath: Vec2;
    const bracketPoint1 = new Vec2(
      set[rightBracketIndex].getPath()[1][1],
      set[rightBracketIndex].getPath()[1][2],
      0,
    );
    const bracketPoint2 = new Vec2(
      set[rightBracketIndex].getPath()[2][1],
      set[rightBracketIndex].getPath()[2][2],
      0,
    );
    if (bracketPoint2.y === bracketPoint1.y) {
      lowerPath =
        bracketPoint2.x > bracketPoint1.x ? bracketPoint1 : bracketPoint2;
    } else {
      lowerPath =
        bracketPoint2.y > bracketPoint1.y ? bracketPoint2 : bracketPoint1;
    }
    if (isLowerText) {
      path = lowerPath;
    } else {
      path =
        lowerPath.x === bracketPoint1.x && lowerPath.y === bracketPoint1.y
          ? bracketPoint2
          : bracketPoint1;
    }

    const indexPos = new Vec2(path.x, path.y);
    const iconSize = superatomClass === SUPERATOM_CLASS.BASE ? 14 : 12;
    const iconOffsetFromBracket = 8;
    const textOffsetFromBracket = 2;
    let icon;

    // Draw icon for superatom classes
    if (superatomClass === SUPERATOM_CLASS.SUGAR) {
      icon = render.paper.rect(
        indexPos.x + iconOffsetFromBracket,
        indexPos.y - iconSize / 2,
        iconSize,
        iconSize,
        2,
      );
    } else if (superatomClass === SUPERATOM_CLASS.PHOSPHATE) {
      icon = render.paper.circle(
        indexPos.x + iconSize / 2 + iconOffsetFromBracket,
        indexPos.y,
        iconSize / 2,
      );
    } else if (superatomClass === SUPERATOM_CLASS.BASE) {
      const rhombusPath = `M${
        indexPos.x + iconSize / 2 + iconOffsetFromBracket
      },${indexPos.y - iconSize / 2}
                         L${indexPos.x + iconSize + iconOffsetFromBracket},${
        indexPos.y
      }
                         L${
                           indexPos.x + iconSize / 2 + iconOffsetFromBracket
                         },${indexPos.y + iconSize / 2}
                         L${indexPos.x + iconOffsetFromBracket},${
        indexPos.y
      } Z`;
      icon = render.paper.path(rhombusPath);
    }

    if (icon && indexAttribute) {
      icon.attr({
        stroke: '#B4B9D6',
        strokeWidth: '1.4',
      });
      set.push(icon);
    }

    const textPosition = new Vec2(indexPos.x, indexPos.y);
    const indexPath = render.paper
      .text(textPosition.x, textPosition.y, text)
      .attr({
        font: render.options.font,
        'font-size': render.options.fontszsubInPx,
      });
    if (indexAttribute) indexPath.attr(indexAttribute);

    // Bounding box adjustment and final positioning
    const indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
    const t =
      Math.max(
        util.shiftRayBox(
          indexPos,
          bracketR.bracketAngleDirection.negated(),
          indexBox,
        ),
        3,
      ) + (icon ? iconOffsetFromBracket : textOffsetFromBracket);
    indexPath.translateAbs(
      t * bracketR.bracketAngleDirection.x +
        (icon ? iconSize + iconOffsetFromBracket / 2 : 0),
      t * bracketR.bracketAngleDirection.y,
    );
    set.push(indexPath);
  }
  if (lowerIndexText) {
    renderIndex(lowerIndexText, true, superatomClass);
  }
  if (upperIndexText) renderIndex(upperIndexText);
}

function showValue(
  paper: RaphaelPaper,
  pos: Vec2 | undefined,
  sgroup: SGroup,
  options: RenderOptions,
): any {
  const text = paper.text(pos?.x, pos?.y, sgroup.data.fieldValue).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
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

  const ps = sgroup?.pp?.scaled(options.microModeScale);
  const name = showValue(paper, ps, sgroup, options);

  if (sgroup.data.context !== SgContexts.Bond) {
    const box = util.relBox(name.getBBox());
    name.translateAbs(0.5 * box.width, -0.5 * box.height);
  }

  set.push(name);

  const sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
  sgroup.dataArea = sbox.transform(Scale.canvasToModel, render.options);

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
      const p = Scale.modelToCanvas(atom.a.pp, options);
      const bb = atom.visel.boundingBox;
      if (bb !== null) p.x = Math.max(p.x, bb.p1.x);
      p.x += options.lineWidth; // shift a bit to the right
      const nameI = showValue(paper, p, sgroup, options);
      const boxI = util.relBox(nameI.getBBox());
      nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height);
      set.push(nameI);
      let sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()));
      sboxI = sboxI.transform(Scale.canvasToModel, render.options);
      sgroup.areas.push(sboxI);
    }
  });

  return set;
}

function getBracketParameters(bracketBox: Box2Abs, direction: Vec2) {
  const brackets: BracketParams[] = [];
  const bracketDirection = direction.rotateSC(1, 0);
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
  let bracketBox = sgroup.bracketBox.transform(Scale.modelToCanvas, options);
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
