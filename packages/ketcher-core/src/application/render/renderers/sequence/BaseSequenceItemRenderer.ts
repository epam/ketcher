import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  public textElement?: D3SvgElementSelection<SVGTextElement, void>;
  public counterElement?: D3SvgElementSelection<SVGTextElement, void>;
  private selectionRectangle?: D3SvgElementSelection<SVGRectElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;
  private indexInRow = 0;
  private _rowIndex = 0;
  private _isSequenceEditStart = false;

  constructor(
    public node: SubChainNode,
    private firstNodeInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private isLastMonomerInChain: boolean,
    private subChain: BaseSubChain,
  ) {
    super(node.monomer);
    this.indexInRow = this.monomerIndexInChain % this.symbolsInRow;
    this._rowIndex = Math.floor(this.monomerIndexInChain / this.symbolsInRow);
  }

  abstract get symbolToDisplay(): string;

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}
  protected removeHover(): void {}

  public get scaledMonomerPosition() {
    return new Vec2(
      this.firstNodeInChainPosition.x +
        this.indexInRow * 18 +
        Math.floor(this.indexInRow / this.nthSeparationInRow) * 10,
      this.firstNodeInChainPosition.y + 47 * this._rowIndex,
    );
  }

  public get rowIndex() {
    return this._rowIndex;
  }

  public get currentSubChain() {
    return this.subChain;
  }

  public get isSequenceEditStart() {
    return this._isSequenceEditStart;
  }

  private appendRootElement() {
    return this.canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.scaledMonomerPosition.x}, ${this.scaledMonomerPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  private get nthSeparationInRow() {
    return 10;
  }

  private get symbolsInRow() {
    return 30;
  }

  private appendCounterElement(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
  ) {
    return rootElement
      .append('text')
      .attr('x', '-2')
      .attr('y', '-24')
      .text(this.monomerIndexInChain + 1)
      .attr('font-family', 'Courier New')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('fill', '#7C7C7F');
  }

  private get needDisplayCounter() {
    return (
      (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0 ||
      this.isLastMonomerInChain
    );
  }

  private removeCounterElement() {
    this.counterElement
      ?.data([])
      .exit()
      .transition()
      .duration(100)
      .style('opacity', 0)
      .remove();
    this.counterElement = undefined;
  }

  show(): void {
    this.rootElement = this.appendRootElement();
    this.textElement = this.rootElement
      .append('text')
      .text(this.symbolToDisplay)
      .attr('font-family', 'Courier New')
      .attr('font-size', '20px')
      .attr('font-weight', '700')
      .attr('fill', '#333333');

    if (this.needDisplayCounter) {
      this.counterElement = this.appendCounterElement(this.rootElement);
    }

    this.rootElement.on('mouseover', () => {
      if (!this.rootElement || this.counterElement) {
        return;
      }
      this.counterElement = this.appendCounterElement(this.rootElement);
    });

    this.rootElement.on('mouseleave', () => {
      if (
        !this.rootElement ||
        !this.counterElement ||
        this.needDisplayCounter
      ) {
        return;
      }
      this.removeCounterElement();
    });
  }

  drawSelection(): void {
    if (!this.rootElement) {
      return;
    }
    if (this.node.monomer.selected) {
      this.appendSelection();
      this.raiseElement();
    } else {
      this.removeSelection();
    }
  }

  appendCursorLine() {
    this._isSequenceEditStart = true;
    return this.rootElement
      ?.insert('path', ':first-child')
      .attr('stroke', '#333333')
      .attr('stroke-width', 1)
      .attr('class', 'cursor-line')
      .attr('d', `M-2,-15 L-2,5`)
      .attr('fill-opacity', 0)
      .attr('pointer-events', 'none') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }

  removeCursorLine() {
    this._isSequenceEditStart = false;
    this.rootElement?.selectAll('path').remove();
  }

  moveSelection(): void {}

  public appendSelection() {
    if (this.selectionRectangle) {
      this.selectionRectangle
        .attr('x', this.scaledMonomerPosition.x - 4)
        .attr('y', this.scaledMonomerPosition.y - 14)
        .attr('width', 20)
        .attr('height', 20);
    } else {
      this.selectionBorder = this.rootElement
        ?.append('use')
        .attr('href', this.monomerIndexInChain)
        .attr('stroke', '#57FF8F')
        .attr('pointer-events', 'none');

      this.selectionRectangle = this.canvas
        ?.insert('rect', ':first-child')
        .attr('opacity', '0.7')
        .attr('fill', '#57FF8F')
        .attr('x', this.scaledMonomerPosition.x - 4)
        .attr('y', this.scaledMonomerPosition.y - 14)
        .attr('width', 20)
        .attr('height', 20);
    }
  }

  public removeSelection() {
    this.selectionRectangle?.remove();
    this.selectionBorder?.remove();
    this.selectionRectangle = undefined;
    this.selectionBorder = undefined;
  }

  private raiseElement() {
    this.selectionRectangle?.raise();
    this.rootElement?.raise();
  }

  public setEnumeration() {}
  public redrawEnumeration() {}
}
