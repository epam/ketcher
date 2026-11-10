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

import { FunctionalGroup } from 'domain/entities/functionalGroup';
import {
  DEFAULT_SGROUP_BRACKET_TYPE,
  isSGroupBracketType,
  SGroup,
  SUPERATOM_CLASS,
} from 'domain/entities/sgroup';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';
import { SgContexts } from 'application/editor/shared/constants';
import ReDataSGroupData from './redatasgroupdata';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { toFixed } from 'utilities';
import BracketParams from '../bracket-params';
import type {
  Element as RaphaelElement,
  RaphaelPaper,
  RaphaelSet,
} from 'raphael';
import type { RenderOptions } from '../render.types';
import { uniteHoverPaths } from './hoverPath';
import {
  getSGroupBracketEndpoints,
  type SGroupBracketEndpoints,
} from '../sgroupBracketPath';
import type { SGroupBracketLayout } from '../sgroupBracketLayout';
import { getSGroupBracketLabels } from '../sgroupBracketLabels';
import {
  getPositionedSGroupBrackets,
  getSGroupBracketPositionState,
  includePositionedSGroupBrackets,
  type PositionedSGroupBrackets,
} from '../sgroupBracketPositions';
export { paperPathFromSVGElement } from './hoverPath';
interface SGroupdrawBracketsOptions {
  set: RaphaelSet;
  render: Render;
  sgroup: SGroup;
  bracketBox: Box2Abs;
  direction: Vec2;
  lowerIndexText?: string | null;
  upperIndexText?: string | null;
  indexAttribute?: Record<string, string>;
  superatomClass?: SUPERATOM_CLASS;
  positionedBrackets?: PositionedSGroupBrackets;
}

class ReSGroup extends ReObject {
  public item: SGroup | undefined;
  public render!: Render;
  public bracketBox?: Box2Abs;
  public hasBracketPeers = false;
  private expandedMonomerAttachmentPoints?: RaphaelSet; // Raphael paths

  constructor(sgroup: SGroup) {
    super('sgroup');
    /**
    @type {SGroup}
    */
    this.item = sgroup;
  }

  static isSelectable(): boolean {
    return false;
  }

  static hasVisibleBrackets(sgroup: SGroup): boolean {
    return (
      sgroup.data.fieldName !== 'MRV_IMPLICIT_H' &&
      sgroup.isExpanded() &&
      ['MUL', 'SRU', 'SUP', 'GEN', 'COP', 'queryComponent'].includes(
        sgroup.type,
      ) &&
      sgroup.atoms.length > 0 &&
      !sgroup.isSuperatomWithoutLabel &&
      !(sgroup instanceof MonomerMicromolecule) &&
      getSGroupBracketPositionState(sgroup) !== 'suppressed'
    );
  }

  static measureBracketExtents(render: Render, sgroup: SGroup): Vec2 {
    const bracketBox = new Box2Abs(0, 0, 2, 2);
    const set = render.paper.set();
    try {
      SGroupdrawBrackets({
        set,
        render,
        sgroup,
        bracketBox,
        direction: new Vec2(1, 0),
        ...getSGroupBracketLabels(sgroup),
      });
      const bounds = set.getBBox();
      const scale = render.options.microModeScale;
      return new Vec2(
        Math.max(0, (bounds.x + bounds.width) / scale - bracketBox.p1.x),
        Math.max(
          0,
          bracketBox.p0.y - bounds.y / scale,
          (bounds.y + bounds.height) / scale - bracketBox.p1.y,
        ),
      );
    } finally {
      set.remove();
    }
  }

  /**
   * @param remol {ReStruct}
   * @param sgroup {SGroup}
   * @returns {*}
   */
  draw(
    remol: ReStruct,
    sgroup: SGroup,
    layout?: SGroupBracketLayout,
  ): RaphaelSet {
    this.render = remol.render;
    let set = this.render.paper.set();
    this.bracketBox = undefined;
    this.hasBracketPeers = false;
    SGroup.bracketPos(sgroup, remol.molecule, remol, this.render);
    const originalBracketBox = sgroup.bracketBox;
    if (!originalBracketBox) {
      return set;
    }
    const offset = layout?.get(sgroup);
    const bracketBox = offset
      ? originalBracketBox.extend(offset, offset)
      : originalBracketBox;
    const direction = sgroup.bracketDirection;
    sgroup.areas = [originalBracketBox];
    const hasVisibleBrackets = ReSGroup.hasVisibleBrackets(sgroup);
    const positionedBrackets =
      hasVisibleBrackets &&
      getSGroupBracketPositionState(sgroup) === 'positioned'
        ? getPositionedSGroupBrackets(
            sgroup,
            remol.molecule,
            Math.min(0.25, bracketBox.sz().x * 0.3),
          )
        : undefined;
    if (hasVisibleBrackets) {
      this.bracketBox = positionedBrackets
        ? includePositionedSGroupBrackets(bracketBox, positionedBrackets)
        : bracketBox;
      this.hasBracketPeers = offset !== undefined;
    }
    if (sgroup.isExpanded()) {
      const SGroupdrawBracketsOptions: SGroupdrawBracketsOptions = {
        set,
        render: this.render,
        sgroup,
        bracketBox,
        direction,
        positionedBrackets,
        ...getSGroupBracketLabels(sgroup),
      };
      if (sgroup.type === 'DAT') {
        set = drawGroupDat(remol, sgroup);
      }

      if (hasVisibleBrackets) {
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
      if (sGroup?.isContracted()) {
        const { atomId } = sGroup.getContractedPosition(render.ctab.molecule);
        const reSGroupAtom = render.ctab.atoms.get(atomId);
        const sGroupTextBoundingBox =
          reSGroupAtom?.visel.boundingBox || reSGroupAtom?.visel.oldBoundingBox;
        if (sGroupTextBoundingBox) {
          const { p0, p1 } = sGroupTextBoundingBox;
          width = p1.x - p0.x + padding * 2;
          height = p1.y - p0.y + padding * 2;
          startX = p0.x - padding;
          startY = p0.y - padding;
        }
      }
    }

    return { startX, startY, width, height };
  }

  getContractedSelectionContour(render: Render): RaphaelElement {
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
    options: RenderOptions,
  ): RaphaelElement | undefined {
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
    const options = render.options;
    const paper = render.paper;
    const sGroupItem = this.item;
    if (sGroupItem) {
      const { a0, a1, b0, b1 } = getHighlighPathInfo(
        sGroupItem,
        render,
        this.bracketBox,
      );
      const functionalGroups = render.ctab.molecule.functionalGroups;
      const hoversToCombine: Array<RaphaelElement | null | undefined> = [];
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
            toFixed(a0.x),
            toFixed(a0.y),
            toFixed(a1.x),
            toFixed(a1.y),
            toFixed(b1.x),
            toFixed(b1.y),
            toFixed(b0.x),
            toFixed(b0.y),
          )
          .attr(options.hoverStyle);
        otherHovers.push(sGroupItem.hovering);
      }

      SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach((aid) => {
        const atom = render?.ctab?.atoms?.get(aid);

        hoversToCombine.push(atom?.makeHoverPlate(render));
      });
      SGroup.getBonds(render.ctab.molecule, sGroupItem).forEach((bid) => {
        hoversToCombine.push(
          render?.ctab?.bonds?.get(bid)?.makeHoverPlate(render),
        );
      });

      const combinedPathData = uniteHoverPaths(hoversToCombine);
      if (!combinedPathData) {
        return;
      }

      render.ctab.addReObjectPath(
        LayerMap.hovering,
        this.visel,
        paper.path(combinedPathData).attr(options.hoverStyle),
      );
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, otherHovers);
    }
  }

  setHover(isHovered: boolean, render: Render) {
    super.setHover(isHovered, render);

    if (!isHovered || this.selected) {
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
      });

      render.ctab.addReObjectPath(LayerMap.atom, this.visel, set);
      this.expandedMonomerAttachmentPoints = render.paper.setFinish();
    }
  }

  show(restruct: ReStruct, layout?: SGroupBracketLayout): void {
    const render = restruct.render;
    const sgroup = this.item;
    if (sgroup && sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const remol = render.ctab;
      const path = this.draw(remol, sgroup, layout);
      const shouldIncludeInBoundingBox = !(
        sgroup instanceof MonomerMicromolecule && sgroup.isExpanded()
      );
      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        path,
        null,
        shouldIncludeInBoundingBox,
      );
      this.setHover(this.hover, render); // TODO: fix this
    }
  }
}

function SGroupdrawBrackets({
  set,
  render,
  sgroup,
  bracketBox,
  direction,
  lowerIndexText,
  upperIndexText,
  indexAttribute,
  superatomClass,
  positionedBrackets,
}: SGroupdrawBracketsOptions): void {
  const brackets = positionedBrackets
    ? [positionedBrackets.opening, positionedBrackets.closing].map(
        (bracket) =>
          new BracketParams(
            bracket.center,
            bracket.angleDirection,
            bracket.width,
            bracket.height,
            bracket.direction,
          ),
      )
    : getBracketParameters(bracketBox, direction);
  const bracketType = isSGroupBracketType(sgroup.data.bracketType)
    ? sgroup.data.bracketType
    : DEFAULT_SGROUP_BRACKET_TYPE;
  const bracketEndpoints: SGroupBracketEndpoints[] = [];
  const rightBracketIndex = positionedBrackets
    ? 1
    : brackets.reduce(
        (rightIndex, bracket, index) =>
          brackets[rightIndex].bracketAngleDirection.x <
            bracket.bracketAngleDirection.x ||
          (brackets[rightIndex].bracketAngleDirection.x ===
            bracket.bracketAngleDirection.x &&
            brackets[rightIndex].bracketAngleDirection.y >
              bracket.bracketAngleDirection.y)
            ? index
            : rightIndex,
        0,
      );

  for (let i = 0; i < brackets.length; ++i) {
    const bracket = brackets[i];
    const shapeParams = {
      bracketAngleDirection: Scale.modelToCanvas(
        bracket.bracketAngleDirection,
        render.options,
      ),
      bracketDirection: Scale.modelToCanvas(
        bracket.bracketDirection,
        render.options,
      ),
      center: Scale.modelToCanvas(bracket.center, render.options),
      width: bracket.width || 0.25,
      height: bracket.height || 1,
    };
    const path = draw.bracket(
      render.paper,
      shapeParams.bracketAngleDirection,
      shapeParams.bracketDirection,
      shapeParams.center,
      bracket.width,
      bracket.height,
      render.options,
      bracketType,
    );
    path.node?.setAttribute('data-testid', 's-group-bracket');
    path.node?.setAttribute(
      'data-bracket-side',
      i === rightBracketIndex ? 'closing' : 'opening',
    );
    set.push(path);
    bracketEndpoints.push(getSGroupBracketEndpoints(shapeParams));
  }
  const bracketR = brackets[rightBracketIndex];
  function renderIndex(
    text: string,
    isLowerText = false,
    superatomClass?: SUPERATOM_CLASS,
  ): void {
    let path: Vec2;
    let lowerPath: Vec2;
    // Labels anchor to the bracket spine ends, independent of the bracket
    // shape, rounded the same way as the drawn square path coordinates.
    const { point0, point1 } = bracketEndpoints[rightBracketIndex];
    const bracketPoint1 = new Vec2(
      Number(toFixed(point0.x)),
      Number(toFixed(point0.y)),
      0,
    );
    const bracketPoint2 = new Vec2(
      Number(toFixed(point1.x)),
      Number(toFixed(point1.y)),
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
    if (isLowerText) {
      indexPath.node?.setAttribute('data-testid', 's-group-label');
      indexPath.node?.setAttribute('data-label-text', text);
    }
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
  value = sgroup.data.fieldValue,
): RaphaelSet {
  const text = paper.text(pos?.x, pos?.y, value).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
  });
  text.node?.setAttribute('data-testid', 's-group-label');
  text.node?.setAttribute('data-label-text', value);
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
  if (sgroup.pp === null) sgroup.calculatePP(restruct.molecule);

  return sgroup.data.attached
    ? drawAttachedDat(restruct, sgroup)
    : drawAbsoluteDat(restruct, sgroup);
}

function drawAbsoluteDat(restruct: ReStruct, sgroup: SGroup): RaphaelSet {
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

function drawAttachedDat(restruct: ReStruct, sgroup: SGroup): RaphaelSet {
  const render = restruct.render;
  const options = render.options;
  const paper = render.paper;
  const set = paper.set();

  SGroup.getAtoms(restruct.molecule, sgroup).forEach((aid) => {
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
  displayBracketBox = sgroup.bracketBox,
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
  const sGroupBracketBox = displayBracketBox;
  if (!sGroupBracketBox) {
    throw new Error('SGroup bracket box is not defined');
  }
  let bracketBox = sGroupBracketBox.transform(Scale.modelToCanvas, options);
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
