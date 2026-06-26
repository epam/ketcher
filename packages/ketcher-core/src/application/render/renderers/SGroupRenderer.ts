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

const BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
const DEFAULT_PADDING_VECTOR = new Vec2(0.2, 0.4);
const COP_PADDING_VECTOR = new Vec2(1.2, 1.2);
const BRACKET_STROKE = '#000';
const FONT_FAMILY = 'Arial';

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

  public show(): void {
    if (this.sgroup.data.fieldName === 'MRV_IMPLICIT_H') {
      return;
    }

    this.rootElement = this.canvas
      .insert('g', '.monomer')
      .data([this])
      .attr('data-testid', 's-group')
      .attr('data-sgroup-type', this.sgroup.type)
      .attr(
        'data-sgroup-id',
        this.sgroupDrawingEntity.sgroupIdInMicroMode,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    if (this.sgroup.type === SGroup.TYPES.DAT) {
      this.drawDataSGroup();
    } else {
      this.drawBracketSGroup();
    }
  }

  private drawBracketSGroup(): void {
    const bracketBox = this.calculateBracketBox();

    if (!bracketBox || this.sgroup.isSuperatomWithoutLabel) {
      return;
    }

    this.sgroup.bracketBox = bracketBox;
    this.sgroup.bracketDirection = new Vec2(1, 0);
    this.sgroup.areas = [bracketBox];

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
        options.lowerIndexText =
          this.sgroup.data.name ||
          SUPERATOM_CLASS_TEXT[this.sgroup.data.class as SUPERATOM_CLASS];
        options.indexAttribute = { 'font-style': 'italic' };
        break;
      default:
        break;
    }

    this.drawBrackets(bracketBox, options);
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

        const position = atom.pp.add(new Vec2(0.25, -0.1));
        this.appendValue(position);
      });

      return;
    }

    const position =
      this.sgroup.data.context === SgContexts.Bond
        ? this.sgroup.pp
        : this.sgroup.pp?.add(new Vec2(0.25, -0.1));

    if (position) {
      this.appendValue(position);
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
    const rightBracketIndex = brackets.reduce(
      (rightIndex, bracket, index) =>
        rightIndex < 0 ||
        brackets[rightIndex].angleDirection.x < bracket.angleDirection.x ||
        (brackets[rightIndex].angleDirection.x === bracket.angleDirection.x &&
          brackets[rightIndex].angleDirection.y > bracket.angleDirection.y)
          ? index
          : rightIndex,
      -1,
    );

    brackets.forEach((bracket) => this.appendBracket(bracket));

    const rightBracket = brackets[rightBracketIndex];
    if (lowerIndexText) {
      this.appendIndex(lowerIndexText, rightBracket, true, indexAttribute);
    }
    if (upperIndexText) {
      this.appendIndex(upperIndexText, rightBracket, false, indexAttribute);
    }
  }

  private getBracketParameters(bracketBox: Box2Abs): BracketParams[] {
    const direction = this.sgroup.bracketDirection;
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

    return [
      {
        center: leftCenter,
        direction: direction.negated(),
        angleDirection: bracketDirection,
        width: bracketWidth,
        height: bracketHeight,
      },
      {
        center: rightCenter,
        direction,
        angleDirection: bracketDirection,
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
    const bracketDirection = bracket.direction.rotateSC(1, 0);
    const bracketEdge = bracket.center.addScaled(
      bracketDirection,
      (isLowerText ? 0.5 : -0.5) * bracket.height,
    );
    const position = Scale.modelToCanvas(
      bracketEdge.addScaled(bracket.direction, 0.35),
      this.editorSettings,
    );

    this.appendText(position, text, indexAttribute);
  }

  private appendValue(position: Vec2): void {
    const scaledPosition = Scale.modelToCanvas(position, this.editorSettings);
    const valueGroup = this.rootElement?.append('g');
    const textElement = this.appendText(
      scaledPosition,
      this.sgroup.data.fieldValue,
      undefined,
      valueGroup,
    );
    const bbox = textElement?.node()?.getBBox();

    if (!bbox || !valueGroup) {
      return;
    }

    valueGroup
      .insert('rect', 'text')
      .attr('x', bbox.x - 1)
      .attr('y', bbox.y - 1)
      .attr('width', bbox.width + 2)
      .attr('height', bbox.height + 2)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', this.sgroup.selected ? SELECTION_COLOR : '#fff')
      .attr('stroke', this.sgroup.selected ? SELECTION_COLOR : '#fff');
  }

  private appendText(
    position: Vec2,
    text: string,
    attributes?: Record<string, string>,
    parent: D3SvgElementSelection<SVGGElement, void> | undefined = this
      .rootElement,
  ): D3SvgElementSelection<SVGTextElement, void> | undefined {
    const textElement = parent
      ?.append('text')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr(
        'font-size',
        Math.ceil(1.9 * (this.editorSettings.macroModeScale / 6)),
      )
      .attr('font-family', FONT_FAMILY)
      .attr('data-testid', 's-group-label')
      .attr('data-label-text', text)
      .text(text);

    if (attributes) {
      Object.entries(attributes).forEach(([attribute, value]) => {
        textElement?.attr(attribute, value);
      });
    }

    return textElement as D3SvgElementSelection<SVGTextElement, void>;
  }

  public drawSelection(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  public moveSelection(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  protected appendHover(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  protected removeHover(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }

  protected appendHoverAreaElement(): void {
    // S-groups are rendered as non-selectable macro overlays.
  }
}
