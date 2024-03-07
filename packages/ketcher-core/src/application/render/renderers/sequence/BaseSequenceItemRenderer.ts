import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { CoreEditor } from 'application/editor/internal';
import { SequenceMode } from 'application/editor/modes';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';

const CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  public textElement?: D3SvgElementSelection<SVGTextElement, void>;
  public counterElement?: D3SvgElementSelection<SVGTextElement, void>;
  private selectionRectangle?: D3SvgElementSelection<SVGRectElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;
  public spacerElement?: D3SvgElementSelection<SVGGElement, void>;
  public backgroundElement?: D3SvgElementSelection<SVGRectElement, void>;

  constructor(
    public node: SubChainNode,
    private firstNodeInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private isLastMonomerInChain: boolean,
    private subChain: BaseSubChain,
    private _isEditingSymbol: boolean,
    public monomerSize: { width: number; height: number },
    public scaledMonomerPosition: Vec2,
  ) {
    super(node.monomer);
  }

  abstract get symbolToDisplay(): string;

  public get isEditingSymbol() {
    return this._isEditingSymbol;
  }

  public set isEditingSymbol(isEditingSymbol: boolean) {
    this._isEditingSymbol = isEditingSymbol;
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}
  moveSelection(): void {}

  public get currentSubChain() {
    return this.subChain;
  }

  public get scaledMonomerPositionForSequence() {
    const indexInRow = this.monomerIndexInChain % this.symbolsInRow;
    const rowIndex = Math.floor(this.monomerIndexInChain / this.symbolsInRow);

    return new Vec2(
      this.firstNodeInChainPosition.x +
        indexInRow * 20 +
        Math.floor(indexInRow / this.nthSeparationInRow) * 10,
      this.firstNodeInChainPosition.y + 47 * rowIndex,
    );
  }

  public get center() {
    return this.scaledMonomerPositionForSequence.add(new Vec2(4.5, 0, 0));
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
        `translate(${this.scaledMonomerPositionForSequence.x}, ${this.scaledMonomerPositionForSequence.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  private appendBackgroundElement() {
    const backgroundElement = this.rootElement
      ?.append('rect')
      .attr('width', 16)
      .attr('height', 20)
      .attr('y', -16)
      .attr('x', -2)
      .attr('rx', 2)
      .attr('cursor', 'text');

    backgroundElement?.attr(
      'fill',
      this.isSequenceEditModeTurnedOn ? '#FF7A001A' : 'transparent',
    );

    return backgroundElement;
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
      ((this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0 ||
        this.isLastMonomerInChain) &&
      !(this.node instanceof EmptySequenceNode)
    );
  }

  private get isBeginningOfChain() {
    return this.monomerIndexInChain === 0;
  }

  public appendCaretElement() {
    this.spacerElement
      ?.append('line')
      .attr('x1', -16)
      .attr('y1', -1)
      .attr('x2', -16)
      .attr('y2', 21)
      .attr('stroke', '#333')
      .attr('class', 'blinking');
  }

  private drawHover() {
    this.backgroundElement?.attr(
      'fill',
      this.isSequenceEditModeTurnedOn ? '#FF7A0033' : '#EFF2F5',
    );
  }

  protected removeHover() {
    this.backgroundElement?.attr(
      'fill',
      this.isSequenceEditModeTurnedOn ? '#FF7A001A' : 'transparent',
    );
  }

  private appendChainStartArrow() {
    this.rootElement
      ?.append('use')
      .attr('x', -17)
      .attr('y', -27)
      .attr('href', `#${CHAIN_START_ARROW_SYMBOL_ID}`);
  }

  show(): void {
    this.rootElement = this.appendRootElement();
    if (this.isBeginningOfChain && this.isSequenceEditModeTurnedOn) {
      this.appendChainStartArrow();
    }
    this.spacerElement = this.appendSpacerElement();
    this.backgroundElement = this.appendBackgroundElement();

    if (this.isSequenceEditModeTurnedOn) {
      if (this.isEditingSymbol) {
        this.appendCaretElement();
      }
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
      if (!this.node.monomer.selected) {
        this.drawHover();
      }
    });

    this.rootElement.on('mouseleave', () => {
      this.removeHover();
    });
  }

  drawSelection(): void {
    if (!this.rootElement || this.isSequenceEditModeTurnedOn) {
      return;
    }
    if (this.node.monomer.selected) {
      this.appendSelection();
      this.removeHover();
      this.raiseElement();
    } else {
      this.removeSelection();
    }
  }

  public appendSelection() {
    if (this.selectionRectangle) {
      this.selectionRectangle
        .attr('x', this.scaledMonomerPositionForSequence.x - 4)
        .attr('y', this.scaledMonomerPositionForSequence.y - 16)
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
        .attr('x', this.scaledMonomerPositionForSequence.x - 4)
        .attr('y', this.scaledMonomerPositionForSequence.y - 16)
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

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
    this.removeSelection();
  }

  public setEnumeration() {}
  public redrawEnumeration() {}
  public redrawAttachmentPoints() {}
  public redrawAttachmentPointsCoordinates() {}
  public get enumeration() {
    return null;
  }

  public hoverAttachmenPoint() {}
  public updateAttachmentPoints() {}
}
