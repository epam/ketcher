import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import { Scale } from 'domain/helpers';
import { Box2Abs } from 'domain/entities/box2Abs';
import { SGroup, Vec2 } from 'domain/entities';
import type { SUPERATOM_CLASS } from 'domain/entities/sgroup';
import type { SGroupDrawingEntity } from 'domain/entities/SGroupDrawingEntity';
import { SgContexts } from 'application/editor/shared/constants';
import { SUPERATOM_CLASS_TEXT } from 'application/render/restruct/resgroup';
import type { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import type { BondRenderer } from 'application/render/renderers/BondRenderer';
import { editorEvents } from 'application/editor/editorEvents';
import paperjs from 'paper';

const BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
const DEFAULT_PADDING_VECTOR = new Vec2(0.2, 0.4);
const COP_PADDING_VECTOR = new Vec2(1.2, 1.2);
const BRACKET_STROKE = '#a9a9a9';
const DATA_SGROUP_BACKGROUND = '#F5F5F5';
const FONT_FAMILY = 'Arial';
// Matches AtomRenderer/BondRenderer label sizing: Math.ceil(1.9 * (macroModeScale / 6)).
const FONT_SIZE_SCALE_MULTIPLIER = 1.9;
const FONT_SIZE_SCALE_BASE = 6;
const LINE_WIDTH_SCALE_BASE = 20;
const ATTACHED_LABEL_VERTICAL_SHIFT_FACTOR = 0.8;
const INDEX_LABEL_VERTICAL_SHIFT = 4;
// Canvas-pixel margin used to make the hover contour cover both structure and brackets.
const HOVER_RECT_PADDING = 4;
const HOVER_RECT_RADIUS = 4;
const HOVER_STROKE = '#0097A8';
const HOVER_STROKE_WIDTH = 1.2;

interface BracketParams {
  center: Vec2;
  direction: Vec2;
  angleDirection: Vec2;
  width: number;
  height: number;
}

interface DrawBracketsOptions {
  lowerIndexText?: string | null;
  upperIndexText?: string | null;
  indexAttribute?: Record<string, string>;
}

export class SGroupRenderer extends BaseRenderer {
  private labelElements: D3SvgElementSelection<SVGElement, void>[] = [];
  private atomRenderers = new Map<number, AtomRenderer>();
  private bondRenderers = new Map<number, BondRenderer>();

  constructor(public sgroupDrawingEntity: SGroupDrawingEntity) {
    super(sgroupDrawingEntity);
    this.sgroupDrawingEntity.setRenderer(this);
  }

  private get struct() {
    return this.sgroupDrawingEntity.monomer.monomerItem.struct;
  }

  private get sgroup() {
    return this.sgroupDrawingEntity.sgroup;
  }

  private addLabelElement<ElementType extends SVGElement>(
    element: D3SvgElementSelection<ElementType, void>,
  ): D3SvgElementSelection<ElementType, void> {
    this.labelElements.push(
      element as never as D3SvgElementSelection<SVGElement, void>,
    );

    return element;
  }

  public show(): void {
    if (this.sgroup.data.fieldName === 'MRV_IMPLICIT_H') {
      return;
    }

    this.rootElement = this.canvas
      .insert('g', '.monomer')
      .data([this])
      .attr('data-testid', 's-group')
      .attr('data-sgroup-type', this.sgroup.type)
      .attr('data-sgroup-expanded', String(this.sgroup.isExpanded()))
      .attr(
        'data-sgroup-id',
        this.sgroupDrawingEntity.sgroupIdInMicroMode,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    if (this.sgroup.type === SGroup.TYPES.DAT) {
      this.drawDataSGroup();
    } else {
      this.drawBracketSGroup();
    }

    this.appendHoverAreaElement();
  }

  private drawBracketSGroup(): void {
    const bracketBox = this.calculateBracketBox();

    if (!bracketBox || this.sgroup.isSuperatomWithoutLabel) {
      return;
    }

    this.sgroup.bracketBox = bracketBox;
    this.sgroup.bracketDirection = new Vec2(1, 0);
    this.sgroup.areas = [bracketBox];

    if (this.sgroup.isContracted()) {
      this.drawContractedSGroupLabel();

      return;
    }

    const options: DrawBracketsOptions = {};
    switch (this.sgroup.type) {
      case SGroup.TYPES.MUL:
        options.lowerIndexText = String(this.sgroup.data.mul);
        break;
      case SGroup.TYPES.SRU: {
        const connectivity =
          this.sgroup.data.connectivity === 'ht'
            ? ''
            : this.sgroup.data.connectivity || 'eu';
        options.lowerIndexText = this.sgroup.data.subscript || 'n';
        options.upperIndexText = connectivity;
        break;
      }
      case SGroup.TYPES.COP:
        options.upperIndexText = this.sgroup.data.connectivity || 'eu';
        if (this.sgroup.data.subtype) {
          options.lowerIndexText = this.sgroup.data.subtype;
        }
        break;
      case SGroup.TYPES.SUP:
        options.lowerIndexText = this.getSuperatomLabel();
        options.indexAttribute = { 'font-style': 'italic' };
        break;
      default:
        break;
    }

    this.drawBrackets(bracketBox, options);
  }

  private getSuperatomLabel(): string | undefined {
    return (
      this.sgroup.data.name ||
      SUPERATOM_CLASS_TEXT[this.sgroup.data.class as SUPERATOM_CLASS]
    );
  }

  private drawContractedSGroupLabel(): void {
    const label = this.getSuperatomLabel();

    if (!label) {
      return;
    }

    const { position } = this.sgroup.getContractedPosition(this.struct);

    this.appendText(Scale.modelToCanvas(position, this.editorSettings), label, {
      'font-weight': 'bold',
    });
  }

  private getSGroupAtomIds(): Set<number> {
    return new Set(SGroup.getAtoms(this.struct, this.sgroup));
  }

  public applyExpandedStateToStructure(
    atomRenderers: Map<number, AtomRenderer>,
    bondRenderers: Map<number, BondRenderer>,
  ): void {
    this.atomRenderers = atomRenderers;
    this.bondRenderers = bondRenderers;

    if (this.sgroup.isExpanded()) {
      return;
    }

    const sgroupAtomIds = this.getSGroupAtomIds();

    atomRenderers.forEach((atomRenderer) => {
      if (
        atomRenderer.atom.monomer === this.sgroupDrawingEntity.monomer &&
        sgroupAtomIds.has(atomRenderer.atom.atomIdInMicroMode)
      ) {
        atomRenderer.setVisibility(false);
      }
    });

    bondRenderers.forEach((bondRenderer) => {
      const { firstAtom, secondAtom } = bondRenderer.bond;
      const isSameMonomer =
        firstAtom.monomer === this.sgroupDrawingEntity.monomer &&
        secondAtom.monomer === this.sgroupDrawingEntity.monomer;
      const isBondInsideSGroup =
        sgroupAtomIds.has(firstAtom.atomIdInMicroMode) &&
        sgroupAtomIds.has(secondAtom.atomIdInMicroMode);

      if (isSameMonomer && isBondInsideSGroup) {
        bondRenderer.setVisibility(false);
      }
    });
  }

  private drawDataSGroup(): void {
    this.sgroup.bracketBox = this.calculateBracketBox();

    if (this.sgroup.pp === null) {
      this.sgroup.calculatePP(this.struct);
    }

    if (this.sgroup.data.attached) {
      SGroup.getAtoms(this.struct, this.sgroup).forEach((atomId) => {
        const atom = this.struct.atoms.get(atomId);
        if (!atom) {
          return;
        }

        const position = Scale.modelToCanvas(atom.pp, this.editorSettings).add(
          new Vec2(
            this.editorSettings.microModeScale / LINE_WIDTH_SCALE_BASE,
            0,
          ),
        );
        this.appendValue(position, (bbox) =>
          this.getAttachedDataSGroupLabelShift(position, bbox),
        );
      });

      return;
    }

    if (this.sgroup.pp) {
      const position = Scale.modelToCanvas(this.sgroup.pp, this.editorSettings);

      this.appendValue(position, (bbox) =>
        this.sgroup.data.context === SgContexts.Bond
          ? this.getCenteredDataSGroupLabelShift(position, bbox)
          : this.getAbsoluteDataSGroupLabelShift(position, bbox),
      );
    }
  }

  private calculateBracketBox(): Box2Abs | null {
    const contentBoxes: Box2Abs[] = [];

    SGroup.getAtoms(this.struct, this.sgroup).forEach((atomId) => {
      const atom = this.struct.atoms.get(atomId);

      if (!atom) {
        return;
      }

      contentBoxes.push(
        new Box2Abs(atom.pp, atom.pp).extend(BORDER_EXT, BORDER_EXT),
      );
    });

    const bracketBox = contentBoxes.reduce<Box2Abs | null>(
      (box, contentBox) => (box ? Box2Abs.union(box, contentBox) : contentBox),
      null,
    );

    if (!bracketBox) {
      return null;
    }

    const paddingVector = SGroup.isCOPGroup(this.sgroup)
      ? COP_PADDING_VECTOR
      : DEFAULT_PADDING_VECTOR;

    return bracketBox.extend(paddingVector, paddingVector);
  }

  private drawBrackets(
    bracketBox: Box2Abs,
    { lowerIndexText, upperIndexText, indexAttribute }: DrawBracketsOptions,
  ): void {
    const brackets = this.getBracketParameters(bracketBox);
    const rightBracket = brackets.reduce(
      (currentRightBracket, bracket) =>
        this.isMoreRightwardBracket(bracket, currentRightBracket)
          ? bracket
          : currentRightBracket,
      brackets[0],
    );

    brackets.forEach((bracket) => this.appendBracket(bracket));

    if (lowerIndexText) {
      this.appendIndex(lowerIndexText, rightBracket, true, indexAttribute);
    }
    if (upperIndexText) {
      this.appendIndex(upperIndexText, rightBracket, false, indexAttribute);
    }
  }

  private isMoreRightwardBracket(
    bracket: BracketParams,
    rightBracket?: BracketParams,
  ): boolean {
    return (
      !rightBracket ||
      rightBracket.angleDirection.x < bracket.angleDirection.x ||
      (rightBracket.angleDirection.x === bracket.angleDirection.x &&
        rightBracket.angleDirection.y > bracket.angleDirection.y)
    );
  }

  private getBracketParameters(bracketBox: Box2Abs): BracketParams[] {
    const angleDirection = this.sgroup.bracketDirection;
    const bracketDirection = angleDirection.rotateSC(1, 0);
    const bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3);
    const leftCenter = Vec2.lc2(
      angleDirection,
      bracketBox.p0.x,
      bracketDirection,
      0.5 * (bracketBox.p0.y + bracketBox.p1.y),
    );
    const rightCenter = Vec2.lc2(
      angleDirection,
      bracketBox.p1.x,
      bracketDirection,
      0.5 * (bracketBox.p0.y + bracketBox.p1.y),
    );
    const bracketHeight = bracketBox.sz().y;

    return [
      {
        center: leftCenter,
        direction: angleDirection.negated().rotateSC(1, 0),
        angleDirection: angleDirection.negated(),
        width: bracketWidth,
        height: bracketHeight,
      },
      {
        center: rightCenter,
        direction: bracketDirection,
        angleDirection,
        width: bracketWidth,
        height: bracketHeight,
      },
    ];
  }

  private appendBracket({
    center,
    direction,
    angleDirection,
    width,
    height,
  }: BracketParams): void {
    const scaledCenter = Scale.modelToCanvas(center, this.editorSettings);
    const scaledDirection = Scale.modelToCanvas(direction, this.editorSettings);
    const scaledAngleDirection = Scale.modelToCanvas(
      angleDirection,
      this.editorSettings,
    );
    const bracketPoint0 = scaledCenter.addScaled(
      scaledDirection,
      -0.5 * height,
    );
    const bracketPoint1 = scaledCenter.addScaled(scaledDirection, 0.5 * height);
    const bracketArc0 = bracketPoint0.addScaled(scaledAngleDirection, -width);
    const bracketArc1 = bracketPoint1.addScaled(scaledAngleDirection, -width);

    this.rootElement
      ?.append('path')
      .attr(
        'd',
        `M${bracketArc0.x},${bracketArc0.y}L${bracketPoint0.x},${bracketPoint0.y}L${bracketPoint1.x},${bracketPoint1.y}L${bracketArc1.x},${bracketArc1.y}`,
      )
      .attr('fill', 'none')
      .attr('stroke', BRACKET_STROKE)
      .attr('stroke-width', 1);
  }

  private appendIndex(
    text: string,
    bracket: BracketParams,
    isLowerText: boolean,
    indexAttribute?: Record<string, string>,
  ): void {
    const bracketEdge = bracket.center.addScaled(
      bracket.direction,
      (isLowerText ? 0.5 : -0.5) * bracket.height,
    );
    const position = Scale.modelToCanvas(
      bracketEdge.addScaled(bracket.angleDirection, 0.05),
      this.editorSettings,
    ).add(new Vec2(0, INDEX_LABEL_VERTICAL_SHIFT));

    this.appendText(position, text, indexAttribute);
  }

  private getCenteredDataSGroupLabelShift(position: Vec2, bbox: SVGRect): Vec2 {
    return new Vec2(
      position.x - bbox.x - bbox.width / 2,
      position.y - bbox.y - bbox.height / 2,
    );
  }

  private getAbsoluteDataSGroupLabelShift(position: Vec2, bbox: SVGRect): Vec2 {
    return new Vec2(position.x - bbox.x, position.y - bbox.y - bbox.height);
  }

  private getAttachedDataSGroupLabelShift(position: Vec2, bbox: SVGRect): Vec2 {
    return new Vec2(
      position.x - bbox.x,
      position.y - bbox.y - ATTACHED_LABEL_VERTICAL_SHIFT_FACTOR * bbox.height,
    );
  }

  private appendValue(
    scaledPosition: Vec2,
    getLabelShift: (bbox: SVGRect) => Vec2,
  ): void {
    const valueGroup = this.addLabelElement(this.canvas.append('g'));
    const textElement = this.appendText(
      scaledPosition,
      this.sgroup.data.fieldValue,
      undefined,
      valueGroup,
    );
    const bbox = textElement?.node()?.getBBox();

    if (!bbox) {
      return;
    }

    const valueBackgroundColor = this.sgroup.selected
      ? SELECTION_COLOR
      : DATA_SGROUP_BACKGROUND;

    valueGroup
      .insert('rect', 'text')
      .attr('x', bbox.x - 1)
      .attr('y', bbox.y - 1)
      .attr('width', bbox.width + 2)
      .attr('height', bbox.height + 2)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', valueBackgroundColor)
      .attr('stroke', valueBackgroundColor);

    const valueBBox = valueGroup.node()?.getBBox();

    if (!valueBBox) {
      return;
    }

    const labelShift = getLabelShift(valueBBox);

    valueGroup.attr('transform', `translate(${labelShift.x},${labelShift.y})`);
  }

  private appendText(
    position: Vec2,
    text: string,
    attributes?: Record<string, string>,
    parent?: D3SvgElementSelection<SVGGElement, void>,
  ): D3SvgElementSelection<SVGTextElement, void> | undefined {
    const textElement = (parent || this.canvas)
      .append('text')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr(
        'font-size',
        Math.ceil(
          FONT_SIZE_SCALE_MULTIPLIER *
            (this.editorSettings.macroModeScale / FONT_SIZE_SCALE_BASE),
        ),
      )
      .attr('font-family', FONT_FAMILY)
      .attr('data-testid', 's-group-label')
      .attr('data-label-text', text)
      .text(text);

    if (!parent) {
      this.addLabelElement(textElement);
    }

    if (attributes) {
      Object.entries(attributes).forEach(([attribute, value]) => {
        textElement?.attr(attribute, value);
      });
    }

    return textElement as D3SvgElementSelection<SVGTextElement, void>;
  }

  public moveLabelsToFront(): void {
    this.labelElements.forEach((labelElement) => {
      labelElement.raise();
    });
  }

  public remove(): void {
    super.remove();
    this.labelElements.forEach((labelElement) => {
      labelElement.remove();
    });
    this.labelElements = [];
  }

  public setVisibility(isVisible: boolean): void {
    super.setVisibility(isVisible);
    this.labelElements.forEach((labelElement) => {
      labelElement.style('opacity', isVisible ? 1 : 0);
    });
  }

  public drawSelection(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  public moveSelection(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  private getScaledBracketBox(): Box2Abs | undefined {
    return this.sgroup.bracketBox?.transform(
      Scale.modelToCanvas,
      this.editorSettings,
    );
  }

  private setHoverRectAttributes(
    element: D3SvgElementSelection<SVGRectElement, void>,
  ): void {
    const scaledBracketBox = this.getScaledBracketBox();

    if (!scaledBracketBox) {
      return;
    }

    const size = scaledBracketBox.sz();

    element
      .attr('x', scaledBracketBox.p0.x - HOVER_RECT_PADDING)
      .attr('y', scaledBracketBox.p0.y - HOVER_RECT_PADDING)
      .attr('width', size.x + HOVER_RECT_PADDING * 2)
      .attr('height', size.y + HOVER_RECT_PADDING * 2)
      .attr('rx', HOVER_RECT_RADIUS)
      .attr('ry', HOVER_RECT_RADIUS);
  }

  private getSGroupAtomRenderers(): AtomRenderer[] {
    const sgroupAtomIds = this.getSGroupAtomIds();

    return [...this.atomRenderers.values()].filter(
      (atomRenderer) =>
        atomRenderer.atom.monomer === this.sgroupDrawingEntity.monomer &&
        sgroupAtomIds.has(atomRenderer.atom.atomIdInMicroMode),
    );
  }

  private getSGroupBondRenderers(): BondRenderer[] {
    const sgroupAtomIds = this.getSGroupAtomIds();

    return [...this.bondRenderers.values()].filter((bondRenderer) => {
      const { firstAtom, secondAtom } = bondRenderer.bond;
      const isSameMonomer =
        firstAtom.monomer === this.sgroupDrawingEntity.monomer &&
        secondAtom.monomer === this.sgroupDrawingEntity.monomer;

      return (
        isSameMonomer &&
        sgroupAtomIds.has(firstAtom.atomIdInMicroMode) &&
        sgroupAtomIds.has(secondAtom.atomIdInMicroMode)
      );
    });
  }

  private getAtomHoverPath(atomRenderer: AtomRenderer): paper.Path {
    const contour = atomRenderer.getHoverContour();

    if (contour.type === 'circle') {
      return new paperjs.Path.Circle(
        new paperjs.Point(contour.center.x, contour.center.y),
        contour.radius,
      );
    }

    return new paperjs.Path.Rectangle(
      new paperjs.Rectangle(
        contour.x,
        contour.y,
        contour.width,
        contour.height,
      ),
      new paperjs.Size(contour.radius, contour.radius),
    );
  }

  private getBondHoverPath(
    bondRenderer: BondRenderer,
  ): paper.CompoundPath | null {
    const pathData = bondRenderer.getHoverContourPath();

    return pathData ? new paperjs.CompoundPath(pathData) : null;
  }

  private getCombinedStructureHoverPathData(): string | undefined {
    paperjs.setup(document.createElement('canvas'));

    const hoverPaths = [
      ...this.getSGroupAtomRenderers().map((atomRenderer) =>
        this.getAtomHoverPath(atomRenderer),
      ),
      ...this.getSGroupBondRenderers()
        .map((bondRenderer) => this.getBondHoverPath(bondRenderer))
        .filter((path): path is paper.CompoundPath => Boolean(path)),
    ];

    let combinedPath: paper.PathItem | undefined;

    hoverPaths.forEach((path) => {
      if (!path.closed) {
        path.closePath();
      }

      combinedPath = combinedPath ? combinedPath.unite(path) : path;
    });

    return combinedPath?.pathData;
  }

  protected appendHover(): D3SvgElementSelection<SVGGElement, void> | void {
    if (!this.rootElement || this.hoverElement || !this.sgroup.bracketBox) {
      return;
    }

    const hoverGroup = this.rootElement
      .insert('g', ':first-child')
      .attr('pointer-events', 'none')
      .attr('class', 'dynamic-element') as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    const combinedPathData = this.getCombinedStructureHoverPathData();

    if (combinedPathData) {
      hoverGroup
        .append('path')
        .attr('d', combinedPathData)
        .attr('fill', 'none')
        .attr('stroke', HOVER_STROKE)
        .attr('stroke-width', HOVER_STROKE_WIDTH);
    }

    const hoverRect = hoverGroup
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', HOVER_STROKE)
      .attr('stroke-width', HOVER_STROKE_WIDTH);

    this.setHoverRectAttributes(hoverRect);
    this.hoverElement = hoverGroup;

    return this.hoverElement;
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement || !this.sgroup.bracketBox) {
      return;
    }

    this.hoverAreaElement = this.rootElement
      .insert('rect', ':first-child')
      .data([this])
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setHoverRectAttributes(this.hoverAreaElement);

    this.hoverAreaElement
      .on('mouseover', (event) => {
        editorEvents.mouseOverDrawingEntity.dispatch(event);
        this.appendHover();
      })
      .on('mouseleave', (event) => {
        editorEvents.mouseLeaveDrawingEntity.dispatch(event);
        this.removeHover();
      });
  }
}
