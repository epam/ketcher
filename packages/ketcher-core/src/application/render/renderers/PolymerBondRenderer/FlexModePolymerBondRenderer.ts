import { editorEvents } from 'application/editor/editorEvents';
import { Coordinates } from 'application/editor/shared/coordinates';
import { D3SvgElementSelection } from 'application/render/types';
import assert from 'assert';
import { Vec2 } from 'domain/entities';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseRenderer } from '../BaseRenderer';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

const CORNER_LENGTH = 4;

export class FlexModePolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  // TODO: Specify the types.
  private selectionElement;
  private previousStateOfIsMonomersOnSameHorizontalLine = false;
  private path = '';
  public declare bodyElement?: D3SvgElementSelection<SVGLineElement, this>;

  constructor(public readonly polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
  }

  public get rootBBox(): DOMRect | undefined {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width(): number {
    return this.rootBBox?.width || 0;
  }

  public get height(): number {
    return this.rootBBox?.height || 0;
  }

  private get scaledPosition(): {
    readonly endPosition: Vec2;
    readonly startPosition: Vec2;
  } {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const startPositionInPixels = Coordinates.modelToCanvas(
      this.polymerBond.startPosition,
    );

    const endPositionInPixels = Coordinates.modelToCanvas(
      this.polymerBond.endPosition,
    );

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  public moveSelection(): void {
    if (
      this.previousStateOfIsMonomersOnSameHorizontalLine !==
      this.isMonomersOnSameHorizontalLine()
    ) {
      this.remove();
      this.show();
    } else {
      assert(this.rootElement);
      this.moveStart();
      this.moveEnd();
    }
    this.previousStateOfIsMonomersOnSameHorizontalLine =
      this.isMonomersOnSameHorizontalLine();
  }

  // TODO: Specify the types.
  public appendBond(rootElement) {
    if (this.polymerBond.isCyclicOverlappingBond) {
      this.generateEnvelopingBondPath();
    } else {
      this.generateBondPath();
    }

    this.appendBondGraph(rootElement);

    return this.bodyElement;
  }

  public isMonomersOnSameHorizontalLine(): boolean {
    if (!this.polymerBond.secondMonomer) {
      return false;
    }

    return (
      Math.abs(
        this.polymerBond.firstMonomer.position.y -
          this.polymerBond.secondMonomer.position.y,
      ) < 0.5
    );
  }

  public generateBondPath() {
    const { startPosition, endPosition } = this.scaledPosition;
    this.path = `
      M${startPosition.x},${startPosition.y}
      L${endPosition.x},${endPosition.y}
    `;
  }

  public generateEnvelopingBondPath() {
    if (!this.polymerBond.secondMonomer) {
      return;
    }

    const subStructureBBox = DrawingEntitiesManager.getStructureBbox([
      this.polymerBond.firstMonomer,
      this.polymerBond.secondMonomer,
    ]);
    const expandedBBox = this.getExpandedBoundingBox(subStructureBBox);

    const { left, top, width, height } = expandedBBox;
    const midX = left + width / 2;
    const midY = top + height / 2;

    const isBoundingBoxVertical =
      Math.abs(this.polymerBond.startPosition.x - midX) <
      Math.abs(this.polymerBond.startPosition.y - midY);

    const firstPoint = this.getPointOnBBox(
      this.polymerBond.startPosition,
      expandedBBox,
    );
    const secondPoint = this.getPointOnBBox(
      this.polymerBond.endPosition,
      expandedBBox,
    );

    let thirdPoint: Vec2;

    if (isBoundingBoxVertical) {
      thirdPoint = new Vec2(firstPoint.x, secondPoint.y);
    } else {
      thirdPoint = new Vec2(secondPoint.x, firstPoint.y);
    }

    this.path = `M${this.scaledPosition.startPosition.x},${this.scaledPosition.startPosition.y} `;

    const adjustedFirstPoint = this.adjustPointForCorner(
      this.scaledPosition.startPosition,
      firstPoint,
    );
    this.path += `L${adjustedFirstPoint.x},${adjustedFirstPoint.y} `;
    this.addCornerBasedOnDirection(
      this.scaledPosition.startPosition,
      firstPoint,
      thirdPoint,
    );

    const adjustedThirdPoint = this.adjustPointForCorner(
      firstPoint,
      thirdPoint,
    );
    this.path += `L${adjustedThirdPoint.x},${adjustedThirdPoint.y} `;
    this.addCornerBasedOnDirection(
      firstPoint,
      thirdPoint,
      this.scaledPosition.endPosition,
    );

    this.path += `L${this.scaledPosition.endPosition.x},${this.scaledPosition.endPosition.y}`;
  }

  private addCornerBasedOnDirection(
    prevPoint: Vec2,
    cornerPoint: Vec2,
    nextPoint: Vec2,
  ) {
    if (prevPoint.x !== cornerPoint.x && cornerPoint.y !== nextPoint.y) {
      if (prevPoint.x < cornerPoint.x) {
        if (cornerPoint.y < nextPoint.y) {
          this.addLineFromLeftToBottom();
        } else {
          this.addLineFromLeftToTop();
        }
      } else {
        if (cornerPoint.y < nextPoint.y) {
          this.addLineFromRightToBottom();
        } else {
          this.addLineFromRightToTop();
        }
      }
    } else if (prevPoint.y !== cornerPoint.y && cornerPoint.x !== nextPoint.x) {
      if (prevPoint.y < cornerPoint.y) {
        if (cornerPoint.x < nextPoint.x) {
          this.addLineFromTopToRight();
        } else {
          this.addLineFromTopToLeft();
        }
      } else {
        if (cornerPoint.x < nextPoint.x) {
          this.addLineFromBottomToRight();
        } else {
          this.addLineFromBottomToLeft();
        }
      }
    }
  }

  private adjustPointForCorner(startPoint: Vec2, endPoint: Vec2): Vec2 {
    const adjustedPoint = new Vec2(endPoint.x, endPoint.y);

    if (startPoint.x > endPoint.x) {
      adjustedPoint.x += CORNER_LENGTH;
    } else if (startPoint.x < endPoint.x) {
      adjustedPoint.x -= CORNER_LENGTH;
    }

    if (startPoint.y > endPoint.y) {
      adjustedPoint.y += CORNER_LENGTH;
    } else if (startPoint.y < endPoint.y) {
      adjustedPoint.y -= CORNER_LENGTH;
    }

    return adjustedPoint;
  }

  // TODO: Specify the types.
  public appendBondGraph(rootElement) {
    this.bodyElement = rootElement
      .append('path')
      .attr('d', this.path)
      .attr('fill', 'none')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 1)
      .attr('class', 'selection-area')
      .attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none')
      .attr('data-testid', 'bond')
      .attr('data-bondtype', 'covalent')
      .attr('data-bondid', this.polymerBond.id)
      .attr('data-frommonomerid', this.polymerBond.firstMonomer.id)
      .attr('data-tomonomerid', this.polymerBond.secondMonomer?.id)
      .attr(
        'data-fromconnectionpoint',
        this.polymerBond.firstMonomer.getAttachmentPointByBond(
          this.polymerBond,
        ),
      )
      .attr(
        'data-toconnectionpoint',
        this.polymerBond.secondMonomer?.getAttachmentPointByBond(
          this.polymerBond,
        ),
      );

    return this.bodyElement;
  }

  private addLineFromTopToRight(): void {
    this.path = `${this.path} c 0,4.418 3.582,${CORNER_LENGTH} ${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromLeftToTop(): void {
    this.path = `${this.path} c 4.418,0 ${CORNER_LENGTH},-3.582 ${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromBottomToRight(): void {
    this.path = `${this.path} c 0,-4.418 3.582,-${CORNER_LENGTH} ${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromBottomToLeft(): void {
    this.path = `${this.path} c 0,-4.418 -3.582,-${CORNER_LENGTH} -${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromLeftToBottom(): void {
    this.path = `${this.path} c 4.418,0 ${CORNER_LENGTH},3.582 ${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromTopToLeft(): void {
    this.path = `${this.path} c 0,4.418 -3.582,${CORNER_LENGTH} -${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromRightToTop(): void {
    this.path = `${this.path} c -4.418,0 -${CORNER_LENGTH},-3.582 -${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromRightToBottom(): void {
    this.path = `${this.path} c -4.418,0 -${CORNER_LENGTH},3.582 -${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private getExpandedBoundingBox(bbox) {
    const expansionFactor = this.polymerBond.isSideChainConnection
      ? 0.65
      : 0.75;
    let { left, top, width, height } = bbox;

    if (width < height) {
      left -= expansionFactor;
      width += 2 * expansionFactor;
    } else {
      top -= expansionFactor;
      height += 2 * expansionFactor;
    }

    return { left, top, width, height };
  }

  private getPointOnBBox(position: Vec2, bbox): Vec2 {
    const { left, top, width, height } = bbox;
    const midX = left + width / 2;
    const midY = top + height / 2;

    let result: Vec2;

    if (Math.abs(position.x - midX) < Math.abs(position.y - midY)) {
      result = new Vec2(position.x > midX ? left : left + width, position.y);
    } else {
      result = new Vec2(position.x, position.y > midY ? top + height : top);
    }

    return Coordinates.modelToCanvas(result);
  }

  // TODO: Specify the types.
  private appendRootElement() {
    return this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .on('mouseover', (event) => {
        this.editorEvents.mouseOverPolymerBond.dispatch(event);
        this.editorEvents.mouseOverDrawingEntity.dispatch(event);
      })
      .on('mousemove', (event) => {
        this.editorEvents.mouseOnMovePolymerBond.dispatch(event);
      })
      .on('mouseout', (event) => {
        this.editorEvents.mouseLeavePolymerBond.dispatch(event);
        this.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      })
      .attr(
        'pointer-events',
        this.polymerBond.finished ? 'stroke' : 'none',
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  public show(): void {
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendBond(this.rootElement);
    this.appendHoverAreaElement();
    this.drawSelection();
  }

  public drawSelection(): void {
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      this.selectionElement = this.rootElement
        ?.insert('path', ':first-child')
        .attr('d', this.path)
        .attr('fill', 'none')
        .attr('stroke', '#57FF8F')
        .attr('stroke-width', '5')
        .attr('class', 'dynamic-element');
    } else {
      this.selectionElement?.remove();
    }
  }

  public moveEnd(): void {
    this.moveGraphBondEnd();
  }

  private moveGraphBondEnd(): void {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    const path = `
      M${this.scaledPosition.endPosition.x},${this.scaledPosition.endPosition.y}
      L${this.scaledPosition.startPosition.x},${this.scaledPosition.startPosition.y}
    `;

    this.bodyElement.attr('d', path);
    this.hoverAreaElement?.attr('d', path);
    this.selectionElement?.attr('d', path);

    this.hoverCircleAreaElement
      ?.attr('cx', this.scaledPosition.endPosition.x)
      .attr('cy', this.scaledPosition.endPosition.y);
  }

  public moveStart(): void {
    this.moveGraphBondStart();
  }

  private moveGraphBondStart(): void {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    const path = `
      M${this.scaledPosition.startPosition.x},${this.scaledPosition.startPosition.y}
      L${this.scaledPosition.endPosition.x},${this.scaledPosition.endPosition.y}
    `;

    this.bodyElement.attr('d', path);
    this.hoverAreaElement.attr('d', path);
    this.selectionElement.attr('d', path);
  }

  protected appendHoverAreaElement(): void {
    (<D3SvgElementSelection<SVGPathElement, void> | undefined>(
      this.hoverAreaElement
    )) = this.rootElement
      ?.append('path')
      .attr('d', this.path)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', '10');

    (<D3SvgElementSelection<SVGCircleElement, void> | undefined>(
      this.hoverCircleAreaElement
    )) = this.rootElement
      ?.append('circle')
      .attr('cursor', 'pointer')
      .attr('r', '1')
      .attr('fill', 'transparent')
      .attr('pointer-events', 'none')
      .attr('stroke-width', '10')
      .attr('cx', this.scaledPosition.endPosition.x)
      .attr('cy', this.scaledPosition.endPosition.y);
  }

  public appendHover(): void {
    assert(this.bodyElement);

    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#CCFFDD');
    }
  }

  // TODO: Specify the types.
  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    this.bodyElement
      .attr('stroke', '#333333')
      .attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#57FF8F');
    }

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }

  public remove(): void {
    super.remove();
    if (this.polymerBond.hovered) {
      this.editorEvents.mouseLeaveMonomer.dispatch();
    }
  }
}
