import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { CoreEditor, SequenceMode } from 'application/editor';

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  public textElement?: D3SvgElementSelection<SVGTextElement, void>;
  public counterElement?: D3SvgElementSelection<SVGTextElement, void>;
  public spacerElement?: D3SvgElementSelection<SVGGElement, void>;

  constructor(
    protected node: SubChainNode,
    private firstNodeInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private isLastMonomerInChain: boolean,
    private _isEditting: boolean,
  ) {
    super(node.monomer);
  }

  public get isEditting(): boolean {
    return this._isEditting;
  }

  public set isEditting(value: boolean) {
    this._isEditting = value;
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {}

  public get scaledMonomerPosition() {
    const indexInRow = this.monomerIndexInChain % this.symbolsInRow;
    const rowIndex = Math.floor(this.monomerIndexInChain / this.symbolsInRow);

    return new Vec2(
      this.firstNodeInChainPosition.x +
        indexInRow * 20 +
        Math.floor(indexInRow / this.nthSeparationInRow) * 10,
      this.firstNodeInChainPosition.y + 47 * rowIndex,
    );
  }

  private get isSequenceEditModeTurnedOn() {
    const editor = CoreEditor.provideEditorInstance();

    return editor.mode instanceof SequenceMode && editor.mode.isEditMode;
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

  private appendBackgroundElement() {
    return this.rootElement
      ?.append('rect')
      .attr('width', 16)
      .attr('height', 20)
      .attr('y', -16)
      .attr('x', -2)
      .attr('rx', 2)
      .attr('cursor', 'text')
      .attr('fill', this.isEditting ? '#FF7A0033' : '#FF7A001A');
  }

  private appendSpacerElement() {
    const spacerGroupElement = this.rootElement
      ?.append('g')
      .attr('transform', 'translate(14, -16)');

    spacerGroupElement
      ?.append('rect')
      .attr('width', 4)
      .attr('height', 20)
      .attr('cursor', 'text')
      .attr('fill', 'transparent');

    return spacerGroupElement;
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

  public appendCaretElement() {
    this.spacerElement
      ?.append('line')
      .attr('x1', 4)
      .attr('y1', -1)
      .attr('x2', 4)
      .attr('y2', 21)
      .attr('stroke', '#333')
      .attr('class', 'blinking');
  }

  show(): void {
    this.rootElement = this.appendRootElement();
    if (this.isSequenceEditModeTurnedOn) {
      this.appendBackgroundElement();
      this.spacerElement = this.appendSpacerElement();
    }

    if (this.isEditting) {
      this.appendCaretElement();
    }

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

  abstract get symbolToDisplay(): string;

  public setEnumeration() {}
  public redrawEnumeration() {}
  public redrawAttachmentPoints() {}
}
