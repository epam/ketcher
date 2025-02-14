import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { CoreEditor } from 'application/editor/internal';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { editorEvents } from 'application/editor/editorEvents';
import assert from 'assert';
import { SequenceRenderer } from 'application/render';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { isNumber } from 'lodash';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import { PolymerBond } from 'domain/entities/PolymerBond';

const CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  private editorEvents: typeof editorEvents;
  public textElement?: D3SvgElementSelection<SVGTextElement, void>;
  public counterElement?: D3SvgElementSelection<SVGTextElement, void>;
  private selectionRectangle?: D3SvgElementSelection<SVGRectElement, void>;
  public spacerElement?: D3SvgElementSelection<SVGGElement, void>;
  public backgroundElement?: D3SvgElementSelection<SVGRectElement, void>;
  public caretElement?:
    | D3SvgElementSelection<SVGLineElement, void>
    | D3SvgElementSelection<SVGGElement, void>;

  public antisenseNodeRenderer?: this | undefined;

  constructor(
    public node: SubChainNode | BackBoneSequenceNode,
    private firstNodeInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private isLastMonomerInChain: boolean,
    private chain: Chain,
    private _isEditingSymbol: boolean,
    public monomerSize: { width: number; height: number },
    public scaledMonomerPosition: Vec2,
    private previousRowsWithAntisense = 0,
    public twoStrandedNode: ITwoStrandedChainItem,
  ) {
    super(node.monomer);
    this.editorEvents = editorEvents;
  }

  abstract get symbolToDisplay(): string;

  public get isEditingSymbol() {
    return this._isEditingSymbol;
  }

  public set isEditingSymbol(isEditingSymbol: boolean) {
    this._isEditingSymbol = isEditingSymbol;
  }

  private get isSingleEmptyNode() {
    return (
      SequenceRenderer.sequenceViewModel.length === 1 &&
      this.node instanceof EmptySequenceNode
    );
  }

  protected abstract drawModification(): void;

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}
  moveSelection(): void {}

  public get currentChain() {
    return this.chain;
  }

  public get currentChainNodesWithoutEmptyNodes() {
    return this.chain.nodes.filter(
      (node) => !(node instanceof EmptySequenceNode),
    );
  }

  public get scaledMonomerPositionForSequence() {
    const indexInRow = this.monomerIndexInChain % this.symbolsInRow;
    const rowIndex = Math.floor(this.monomerIndexInChain / this.symbolsInRow);

    return new Vec2(
      this.firstNodeInChainPosition.x +
        indexInRow * 20 +
        Math.floor(indexInRow / this.nthSeparationInRow) * 10,
      this.firstNodeInChainPosition.y +
        47 * rowIndex +
        53 * this.previousRowsWithAntisense,
    );
  }

  public get center() {
    return this.scaledMonomerPositionForSequence.add(new Vec2(4.5, 0, 0));
  }

  protected get isSequenceEditModeTurnedOn() {
    return CoreEditor.provideEditorInstance().isSequenceEditMode;
  }

  protected get isSequenceEditInRnaBuilderModeTurnedOn() {
    return CoreEditor.provideEditorInstance().isSequenceEditInRNABuilderMode;
  }

  protected appendRootElement() {
    const rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('data-testid', 'sequence-item')
      .attr('data-symbol-id', this.node.monomer.id)
      .attr('data-chain-id', this.chain.id)
      // .attr('data-symbol-count', this.chain.id)
      .attr(
        'data-side-connection-number',
        this.node.monomers.reduce(
          (acc, monomer) =>
            acc +
            monomer.covalentBonds.filter(
              (bond) =>
                bond instanceof PolymerBond &&
                (bond as PolymerBond).isSideChainConnection,
            ).length,
          0,
        ),
      )
      .attr(
        'data-has-left-connection',
        Boolean(this.node.firstMonomerInNode.attachmentPointsToBonds.R1),
      )
      .attr(
        'data-has-right-connection',
        Boolean(this.node.lastMonomerInNode.attachmentPointsToBonds.R2),
      )
      .attr(
        'data-hydrogen-connection-number',
        this.node.monomers.reduce(
          (acc, monomer) => acc + monomer.hydrogenBonds.length,
          0,
        ),
      )
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.scaledMonomerPositionForSequence.x}, ${this.scaledMonomerPositionForSequence.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    if (this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
      rootElement.attr('pointer-events', 'all').attr('cursor', 'text');
    }

    return rootElement;
  }

  private appendBackgroundElement() {
    const backgroundElement = this.rootElement
      ?.append('rect')
      .attr('width', 16)
      .attr('height', 20)
      .attr('y', -16)
      .attr('x', -2)
      .attr('rx', 2)
      .attr(
        'cursor',
        this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode
          ? 'text'
          : 'default',
      );

    backgroundElement?.attr('fill', 'transparent');

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
      .attr(
        'cursor',
        this.isSequenceEditInRnaBuilderModeTurnedOn ? 'default' : 'text',
      )
      .attr('fill', 'transparent');

    return spacerGroupElement;
  }

  private get nthSeparationInRow() {
    return 10;
  }

  private get symbolsInRow() {
    return 30;
  }

  private get isAntisenseNode() {
    return this.node === this.twoStrandedNode?.antisenseNode;
  }

  private appendCounterElement(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
  ) {
    const antisenseNodeIndex = this.twoStrandedNode?.antisenseNodeIndex;
    const senseNodeIndex = this.twoStrandedNode?.senseNodeIndex;

    return rootElement
      .append('text')
      .attr('x', '2')
      .attr('y', this.node.monomer.monomerItem.isAntisense ? '24' : '-24')
      .text(
        this.isAntisenseNode && isNumber(antisenseNodeIndex)
          ? this.currentChainNodesWithoutEmptyNodes.length - antisenseNodeIndex
          : senseNodeIndex + 1,
      )
      .attr('font-family', 'Courier New')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('style', 'user-select: none')
      .attr('fill', '#7C7C7F');
  }

  private get needDisplayCounter() {
    const antisenseNodeIndex = this.twoStrandedNode?.antisenseNodeIndex;

    // For simple chains or sense chains counter appears above each 10th symbol
    // For antisense same but in opposite direction, that's why we compare division remainder with 1
    return (
      !(this.node instanceof EmptySequenceNode) &&
      !(this.node instanceof BackBoneSequenceNode) &&
      (this.isAntisenseNode && isNumber(antisenseNodeIndex)
        ? (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 1 ||
          antisenseNodeIndex === 0
        : (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0 ||
          this.isLastMonomerInChain)
    );
  }

  private get isBeginningOfChain() {
    return this.monomerIndexInChain === 0;
  }

  public showCaret() {
    if (
      this.isAntisenseNode ||
      (this.node instanceof BackBoneSequenceNode &&
        this.node.firstConnectedNode.monomer.monomerItem.isAntisense)
    ) {
      this.caretElement = this.spacerElement?.append('g');
      this.caretElement
        ?.append('path')
        .attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z')
        .attr('fill', '#fff')
        .attr(
          'transform',
          `translate(
          ${-21},
          ${18}
          )`,
        )
        .attr('stroke', '#7C7C7F');
      this.caretElement
        ?.append('path')
        .attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z')
        .attr('fill', '#fff')
        .attr('transform', 'translate(-12 4) rotate(180)')
        .attr('stroke', '#7C7C7F');
    } else {
      this.caretElement = this.spacerElement
        ?.append('line')
        .attr('x1', -17)
        .attr('y1', -1)
        .attr('x2', -17)
        .attr('y2', 21)
        .attr('stroke', '#333')
        .attr('class', 'blinking');
    }
  }

  public removeCaret() {
    this.caretElement?.remove();
    this.caretElement = undefined;
  }

  protected redrawBackgroundElementColor() {
    this.backgroundElement?.attr(
      'fill',
      this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode
        ? '#FF7A001A'
        : 'transparent',
    );
  }

  private appendChainStartArrow() {
    this.rootElement
      ?.append('use')
      .attr('x', -17)
      .attr('y', -27)
      .attr('href', `#${CHAIN_START_ARROW_SYMBOL_ID}`);
  }

  private drawGreyOverlay() {
    this.rootElement?.attr('opacity', '0.2');
  }

  show(): void {
    this.rootElement = this.appendRootElement();
    if (
      (this.isBeginningOfChain && this.isSequenceEditModeTurnedOn) ||
      this.isSingleEmptyNode
    ) {
      this.appendChainStartArrow();
    }
    this.spacerElement = this.appendSpacerElement();
    this.backgroundElement = this.appendBackgroundElement();

    if (
      (this.isSequenceEditModeTurnedOn && this.isEditingSymbol) ||
      this.isSingleEmptyNode
    ) {
      this.showCaret();
    }

    this.textElement = this.rootElement
      .append('text')
      .text(this.symbolToDisplay)
      .attr('font-family', 'Courier New')
      .attr('font-size', '20px')
      .attr('font-weight', '700')
      .attr(
        'fill',
        this.isSequenceEditInRnaBuilderModeTurnedOn ? '24545A' : '#333333',
      )
      .attr('style', 'user-select: none;')
      .attr(
        'cursor',
        this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode
          ? 'text'
          : 'default',
      );

    this.appendEvents();
    if (this.needDisplayCounter) {
      this.counterElement = this.appendCounterElement(this.rootElement);
    }

    this.drawSelection();

    if (
      this.isSequenceEditInRnaBuilderModeTurnedOn &&
      !this.node.monomer.selected
    ) {
      this.drawGreyOverlay();
    }
  }

  drawSelection(): void {
    if (!this.rootElement) {
      return;
    }
    if (this.node.monomer.selected && !this.isSingleEmptyNode) {
      this.appendSelection();
      this.raiseElement();
    } else {
      this.removeSelection();
    }

    if (this.node.modified) {
      this.drawModification();
    }
  }

  public appendSelection() {
    this.selectionRectangle =
      this.selectionRectangle ||
      this.rootElement?.insert('rect', ':first-child');

    if (this.isSequenceEditInRnaBuilderModeTurnedOn) {
      this.selectionRectangle
        ?.attr('fill', '#99D6DC')
        .attr('x', -3)
        .attr('y', -21)
        .attr('width', 18)
        .attr('height', 30)
        .attr('rx', 3)
        .attr('class', 'dynamic-element');
    } else {
      this.selectionRectangle
        ?.attr('fill', '#57FF8F')
        .attr('x', -4)
        .attr('y', -16)
        .attr('width', 20)
        .attr('height', 20)
        .attr('class', 'dynamic-element');
    }
    this.backgroundElement?.attr('fill', 'none');
  }

  public removeSelection() {
    this.selectionRectangle?.remove();
    this.selectionRectangle = undefined;
  }

  private raiseElement() {
    this.selectionRectangle?.lower();
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

  public redrawChainBeginning() {}
  public hoverAttachmentPoint(): void {}
  public updateAttachmentPoints() {}

  private drawBackgroundElementHover() {
    if (this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
      return;
    }

    this.backgroundElement?.attr(
      'fill',
      this.node.monomer.selected ? 'none' : '#E1E8E9',
    );

    if (this.node.modified) {
      this.drawModification();
    }
  }

  private removeBackgroundElementHover() {
    this.backgroundElement?.attr('fill', 'none');

    if (this.node.modified) {
      this.drawModification();
    }
  }

  private appendEvents() {
    assert(this.textElement);

    this.textElement.on('mouseover', (event) => {
      this.drawBackgroundElementHover();
      this.editorEvents.mouseOverSequenceItem.dispatch(event);
    });
    this.textElement.on('mousemove', (event) => {
      this.editorEvents.mouseOnMoveSequenceItem.dispatch(event);
    });
    this.textElement.on('mouseleave', (event) => {
      this.removeBackgroundElementHover();
      this.editorEvents.mouseLeaveSequenceItem.dispatch(event);
    });
    this.spacerElement?.on('mousedown', (event) => {
      this.editorEvents.mousedownBetweenSequenceItems.dispatch(event);
    });
    this.backgroundElement?.on('click', (event) => {
      this.editorEvents.clickOnSequenceItem.dispatch(event);
    });
    this.backgroundElement?.on('mousedown', (event) => {
      this.editorEvents.mouseDownOnSequenceItem.dispatch(event);
    });
    this.backgroundElement?.on('dblclick', (event) => {
      this.editorEvents.doubleClickOnSequenceItem.dispatch(event);
    });
    this.textElement.on('dblclick', (event) => {
      this.editorEvents.doubleClickOnSequenceItem.dispatch(event);
    });
    this.backgroundElement?.on('mouseover', () => {
      this.drawBackgroundElementHover();
    });
    this.backgroundElement?.on('mouseleave', () => {
      this.removeBackgroundElementHover();
    });
  }

  public setAntisenseNodeRenderer(antisenseNodeRenderer: this) {
    this.antisenseNodeRenderer = antisenseNodeRenderer;
  }
}
