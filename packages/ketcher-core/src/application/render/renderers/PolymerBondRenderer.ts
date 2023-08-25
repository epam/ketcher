import { BaseRenderer } from './BaseRenderer';
import { Selection } from 'd3';
import { PolymerBond } from 'domain/entities/PolymerBond';

export class PolymerBondRenderer extends BaseRenderer {
  protected rootElement:
    | Selection<SVGGElement, this, HTMLElement, never>
    | undefined;

  private bondElement;

  constructor(public polymerBond: PolymerBond) {
    super();
    this.polymerBond.setRenderer(this);
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
    this.bondElement = rootElement
      .append('line')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 2)
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y)
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y)
      .on('mouseleave', () => {
        this.bondElement.attr('stroke', '#333333');
      })
      .on('mouseenter', () => {
        this.bondElement.attr('stroke', '#0097A8');
      });

    return this.bondElement;
  }

  private appendRootElement() {
    return this.canvas.insert('g', ':first-child').data([this]);
  }

  public show() {
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendBond(this.rootElement);
  }
}
