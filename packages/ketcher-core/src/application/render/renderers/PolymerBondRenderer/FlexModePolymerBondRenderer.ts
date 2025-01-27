import { editorEvents } from 'application/editor/editorEvents';
import { Coordinates } from 'application/editor/shared/coordinates';
import { D3SvgElementSelection } from 'application/render/types';
import assert from 'assert';
import { Vec2 } from 'domain/entities';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseRenderer } from '../BaseRenderer';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

export class FlexModePolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  // TODO: Specify the types.
  private selectionElement;
  private previousStateOfIsMonomersOnSameHorizontalLine = false;
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
      console.log(this.polymerBond.id, 'bond is cyclic overlapping');
      this.appendEnvelopingBond(rootElement);
    } else {
      this.appendBondGraph(rootElement);
    }
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

  // TODO: Specify the types.
  public appendBondGraph(rootElement) {
    this.bodyElement = rootElement
      .append('line')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 1)
      .attr('class', 'selection-area')
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y)
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y)
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

  private appendEnvelopingBond(rootElement: any) {
    if (!this.polymerBond.secondMonomer) {
      return this.bodyElement;
    }

    const subStructureBBox = DrawingEntitiesManager.getStructureBbox([
      this.polymerBond.firstMonomer,
      this.polymerBond.secondMonomer,
    ]);
    const expandedBBox = this.getExpandedBoundingBox(subStructureBBox);

    // const canvasLeftTop = Coordinates.modelToCanvas(new Vec2(expandedBBox.left, expandedBBox.top));
    // const canvasRightBottom = Coordinates.modelToCanvas(new Vec2(expandedBBox.left + expandedBBox.width, expandedBBox.top + expandedBBox.height));

    // this.bodyElement = rootElement
    //   .append('rect')
    //   .attr('x', canvasLeftTop.x)
    //   .attr('y', canvasLeftTop.y)
    //   .attr('width', canvasRightBottom.x - canvasLeftTop.x)
    //   .attr('height', canvasRightBottom.y - canvasLeftTop.y)
    //   .attr('stroke', 'red')
    //   .attr('stroke-width', 1)
    //   .attr('fill', 'none');

    const startBorder = this.getBorderPoint(
      this.polymerBond.startPosition,
      expandedBBox,
      true,
    );
    const endBorder = this.getBorderPoint(
      this.polymerBond.endPosition,
      expandedBBox,
      false,
    );
    const intermediatePoint = new Vec2(startBorder.x, endBorder.y);

    const path = `
      M${this.scaledPosition.startPosition.x},${this.scaledPosition.startPosition.y}
      L${startBorder.x},${startBorder.y} 
      L${intermediatePoint.x},${intermediatePoint.y}
      L${endBorder.x},${endBorder.y}
      L${this.scaledPosition.endPosition.x},${this.scaledPosition.endPosition.y}
    `;

    this.bodyElement = rootElement
      .append('path')
      .attr('d', path)
      .attr('stroke', '#333333')
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    return this.bodyElement;
  }

  private getExpandedBoundingBox(bbox) {
    const expansionFactor = 0.75;
    let { left, top, width, height } = bbox;

    if (width < 2 * expansionFactor || height < 2 * expansionFactor) {
      if (width < height) {
        left -= expansionFactor;
        width += 2 * expansionFactor;
      } else {
        top -= expansionFactor;
        height += 2 * expansionFactor;
      }
    }

    return { left, top, width, height };
  }

  private getBorderPoint(position: Vec2, bbox, isStart: boolean): Vec2 {
    const { left, top, width, height } = bbox;
    const midX = left + width / 2;
    const midY = top + height / 2;

    let result: Vec2;

    if (Math.abs(position.x - midX) < Math.abs(position.y - midY)) {
      result = new Vec2(isStart ? left : left + width, position.y);
    } else {
      result = new Vec2(position.x, isStart ? top + height : top);
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
        ?.insert('line', ':first-child')
        .attr('stroke', '#57FF8F')
        .attr('x1', this.scaledPosition.startPosition.x)
        .attr('y1', this.scaledPosition.startPosition.y)
        .attr('x2', this.scaledPosition.endPosition.x)
        .attr('y2', this.scaledPosition.endPosition.y)
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
    this.bodyElement
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y);

    this.hoverAreaElement
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y);

    this.hoverCircleAreaElement
      ?.attr('cx', this.scaledPosition.endPosition.x)
      .attr('cy', this.scaledPosition.endPosition.y);

    this.selectionElement
      ?.attr('x2', this.scaledPosition.endPosition.x)
      ?.attr('y2', this.scaledPosition.endPosition.y);
  }

  public moveStart(): void {
    this.moveGraphBondStart();
  }

  private moveGraphBondStart(): void {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y);

    this.hoverAreaElement
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y);

    this.selectionElement
      ?.attr('x1', this.scaledPosition.startPosition.x)
      ?.attr('y1', this.scaledPosition.startPosition.y);
  }

  protected appendHoverAreaElement(): void {
    (<D3SvgElementSelection<SVGLineElement, void> | undefined>(
      this.hoverAreaElement
    )) = this.rootElement
      ?.append('line')
      .attr('stroke', 'transparent')
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y)
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y)
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
