import { BaseRenderer } from './BaseRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';
import { editorEvents } from 'application/editor/editorEvents';

export class PolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionElement;

  constructor(public polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
  }

  public get rootBBox() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width() {
    return this.rootBBox?.width || 0;
  }

  public get height() {
    return this.rootBBox?.height || 0;
  }

  public appendBond(rootElement) {
    this.bodyElement = rootElement
      .append('line')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 2)
      .attr('class', 'selection-area')
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y)
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y)
      .attr('pointer-events', 'stroke');

    return this.bodyElement;
  }

  private appendRootElement() {
    return this.canvas
      .insert('g', '#polymer-editor-canvas defs')
      .data([this])
      .on('mouseover', (event) => {
        this.editorEvents.mouseOverPolymerBond.dispatch(event);
        this.editorEvents.mouseOverDrawingEntity.dispatch(event);
      })
      .on('mouseout', (event) => {
        this.editorEvents.mouseLeavePolymerBond.dispatch(event);
        this.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      })
      .attr('pointer-events', 'stroke') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }

  public show() {
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendHoverAreaElement();
    this.appendBond(this.rootElement);
    this.drawSelection();
  }

  public drawSelection() {
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      this.selectionElement = this.rootElement
        ?.insert('line', ':first-child')
        .attr('stroke', '#57FF8F')
        .attr('x1', this.polymerBond.startPosition.x)
        .attr('y1', this.polymerBond.startPosition.y)
        .attr('x2', this.polymerBond.endPosition.x)
        .attr('y2', this.polymerBond.endPosition.y)
        .attr('stroke-width', '10');
    } else {
      this.selectionElement?.remove();
    }
  }

  public moveEnd() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y);

    this.hoverAreaElement
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y);

    this.selectionElement
      ?.attr('x2', this.polymerBond.endPosition.x)
      ?.attr('y2', this.polymerBond.endPosition.y);
  }

  public moveStart() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y);

    this.hoverAreaElement
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y);

    this.selectionElement
      ?.attr('x1', this.polymerBond.startPosition.x)
      ?.attr('y1', this.polymerBond.startPosition.y);
  }

  protected appendHoverAreaElement() {
    (<D3SvgElementSelection<SVGLineElement, void> | undefined>(
      this.hoverAreaElement
    )) = this.rootElement
      ?.append('line')
      .attr('stroke', 'transparent')
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y)
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y)
      .attr('stroke-width', '10');
  }

  public appendHover() {
    assert(this.bodyElement);
    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected) {
      assert(this.hoverAreaElement);
      this.hoverAreaElement.attr('stroke', '#CCFFDD');
    }
  }

  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('stroke', '#333333').attr('pointer-events', 'stroke');

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }
}
