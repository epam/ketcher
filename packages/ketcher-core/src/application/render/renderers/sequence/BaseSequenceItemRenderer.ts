import { provideEditorInstance } from 'application/editor/editorSingleton';
import type { D3SvgElementSelection } from 'application/render/types';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import {
  LinkerSequenceNode,
  Nucleotide,
  Nucleoside,
  UnresolvedMonomer,
  Vec2,
} from 'domain/entities';
import type {
  SequenceNode,
  SubChainNode,
} from 'domain/entities/monomer-chains/types';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { sequenceRendererStore } from 'application/render/renderers/sequence/SequenceRendererStore';
import type { Chain } from 'domain/entities/monomer-chains/Chain';
import { isNumber } from 'lodash';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import type { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Phosphate } from 'domain/entities/Phosphate';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { MONOMER_CONST } from 'domain/constants';
import { SettingsManager } from 'utilities';

const CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';
const CARET_X_OFFSET_BEFORE_NODE = -17;
const CARET_X_OFFSET_AFTER_NODE = 3;

type SequenceNodeRenderMetadata = {
  subChainIndex: number;
  nodeIndex: number;
  subChainLength: number;
  firstBreakingNodeIndex: number;
  subgroupIndex: number;
  isBeginningOfSubChain: boolean;
  isLastInSubChain: boolean;
  isNearBreakingNode: boolean;
  lastNodeIsPhosphate: boolean;
};

type ChainRenderMetadata = {
  byNode: Map<SequenceNode, SequenceNodeRenderMetadata>;
};

let chainRenderMetadata = new WeakMap<Chain, ChainRenderMetadata>();

function isAmbiguousMonomerNotPeptide(node: SequenceNode) {
  return (
    node instanceof AmbiguousMonomerSequenceNode &&
    node.monomer.monomerClass !== MONOMER_CONST.AMINO_ACID
  );
}

function isAmbiguousMonomerPeptide(node: SequenceNode) {
  return (
    node instanceof AmbiguousMonomerSequenceNode &&
    node.monomer.monomerClass === MONOMER_CONST.AMINO_ACID
  );
}

function isIgnoredSequenceNode(node: SequenceNode) {
  return (
    node instanceof LinkerSequenceNode ||
    node instanceof EmptySequenceNode ||
    node instanceof BackBoneSequenceNode ||
    isAmbiguousMonomerNotPeptide(node) ||
    node.monomer instanceof Phosphate ||
    node.monomer instanceof UnresolvedMonomer
  );
}

function isIgnoredForSubChainBoundary(node: SequenceNode) {
  // Match the previous boundary scan, which did not ignore ambiguous neighbors.
  return (
    node instanceof LinkerSequenceNode ||
    node instanceof EmptySequenceNode ||
    node instanceof BackBoneSequenceNode ||
    node.monomer instanceof Phosphate ||
    node.monomer instanceof UnresolvedMonomer
  );
}

function isCounterBreakingNode(node: SequenceNode) {
  return (
    node instanceof LinkerSequenceNode ||
    node.monomer instanceof Phosphate ||
    isAmbiguousMonomerNotPeptide(node)
  );
}

function isBreakingNeighbor(node: SequenceNode) {
  return (
    node instanceof LinkerSequenceNode || isAmbiguousMonomerNotPeptide(node)
  );
}

function getChainRenderMetadata(chain: Chain) {
  const cachedMetadata = chainRenderMetadata.get(chain);
  if (cachedMetadata) {
    return cachedMetadata.byNode;
  }

  const byNode = new Map<SequenceNode, SequenceNodeRenderMetadata>();
  chain.subChains.forEach((subChain, subChainIndex) => {
    const subChainNodes = subChain.nodes;
    const firstNonIgnoredNodeIndex = subChainNodes.findIndex(
      (node) => !isIgnoredForSubChainBoundary(node),
    );
    const subgroupIndices: number[] = [];
    let lastNonIgnoredNodeIndex = -1;
    let firstBreakingNodeIndex = -1;
    let subgroupIndex = 0;

    subChainNodes.forEach((node, nodeIndex) => {
      if (isCounterBreakingNode(node)) {
        subgroupIndex = 0;
        if (firstBreakingNodeIndex === -1) {
          firstBreakingNodeIndex = nodeIndex;
        }
      } else {
        subgroupIndex++;
      }
      subgroupIndices[nodeIndex] = subgroupIndex;

      if (!isIgnoredForSubChainBoundary(node)) {
        lastNonIgnoredNodeIndex = nodeIndex;
      }
    });

    const lastNodeIsPhosphate =
      subChainNodes.at(-1)?.monomer instanceof Phosphate;

    subChainNodes.forEach((node, nodeIndex) => {
      byNode.set(node, {
        subChainIndex,
        nodeIndex,
        subChainLength: subChainNodes.length,
        firstBreakingNodeIndex,
        subgroupIndex: subgroupIndices[nodeIndex],
        isBeginningOfSubChain:
          !isIgnoredSequenceNode(node) &&
          nodeIndex === firstNonIgnoredNodeIndex,
        isLastInSubChain:
          !isIgnoredSequenceNode(node) && nodeIndex === lastNonIgnoredNodeIndex,
        isNearBreakingNode:
          !isAmbiguousMonomerPeptide(node) &&
          ((nodeIndex > 0 &&
            isBreakingNeighbor(subChainNodes[nodeIndex - 1])) ||
            (nodeIndex < subChainNodes.length - 1 &&
              isBreakingNeighbor(subChainNodes[nodeIndex + 1]))),
        lastNodeIsPhosphate,
      });
    });
  });

  chainRenderMetadata.set(chain, { byNode });
  return byNode;
}

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  public static clearChainRenderMetadata() {
    chainRenderMetadata = new WeakMap();
  }

  private positionalEnumeration: number | null = null;
  public textElement?: D3SvgElementSelection<SVGTextElement, void>;
  public counterElement?: D3SvgElementSelection<SVGTextElement, void>;
  private selectionRectangle?: D3SvgElementSelection<SVGRectElement, void>;
  public spacerElement?: D3SvgElementSelection<SVGGElement, void>;
  public backgroundElement?: D3SvgElementSelection<SVGRectElement, void>;
  public caretElement?:
    | D3SvgElementSelection<SVGLineElement, void>
    | D3SvgElementSelection<SVGGElement, void>;

  public antisenseNodeRenderer?: this;

  constructor(
    public readonly node: SequenceNode,
    private readonly firstNodeInChainPosition: Vec2,
    private readonly monomerIndexInChain: number,
    private readonly isLastMonomerInChain: boolean,
    private readonly chain: Chain,
    private readonly nodeIndexOverall: number,
    private readonly editingNodeIndexOverall: number,
    public readonly monomerSize: { width: number; height: number },
    public readonly scaledMonomerPosition: Vec2,
    public readonly twoStrandedNode: ITwoStrandedChainItem,
    private readonly previousRowsWithAntisense = 0,
  ) {
    super(node.monomer);
  }

  abstract get symbolToDisplay(): string;

  public isEditingSymbol(editingNodeIndexOverall?: number) {
    return (
      this.nodeIndexOverall ===
      (isNumber(editingNodeIndexOverall)
        ? editingNodeIndexOverall
        : this.editingNodeIndexOverall)
    );
  }

  public isNextSymbolEditing(editingNodeIndexOverall?: number) {
    return (
      this.nodeIndexOverall + 1 ===
      (isNumber(editingNodeIndexOverall)
        ? editingNodeIndexOverall
        : this.editingNodeIndexOverall)
    );
  }

  private get isSingleEmptyNode() {
    return (
      this.node instanceof EmptySequenceNode &&
      sequenceRendererStore.sequenceViewModel.length === 1
    );
  }

  protected abstract drawModification(): void;

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {
    // intentional no-op: this renderer type does not require a hover area element
  }

  moveSelection(): void {
    // intentional no-op: this renderer type does not support selection movement
  }

  public get currentChain() {
    return this.chain;
  }

  public get currentChainNodesWithoutEmptyNodes() {
    return this.chain.nodes.filter(
      (node) => !(node instanceof EmptySequenceNode),
    );
  }

  public get scaledPosition() {
    return this.scaledMonomerPosition;
  }

  public get scaledMonomerPositionForSequence() {
    const lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
    const indexInRow = this.monomerIndexInChain % lineLength;
    const rowIndex = Math.floor(this.monomerIndexInChain / lineLength);

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
    return provideEditorInstance().isSequenceEditMode;
  }

  protected get isSequenceEditInRnaBuilderModeTurnedOn() {
    return provideEditorInstance().isSequenceEditInRNABuilderMode;
  }

  private get isAntisenseEditMode() {
    return provideEditorInstance().mode.isAntisenseEditMode;
  }

  private get isSyncEditMode() {
    return provideEditorInstance().mode.isSyncEditMode;
  }

  protected appendRootElement() {
    const rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('class', 'sequence-item')
      .attr('data-testid', 'sequence-item')
      .attr('data-symbol-id', this.node.monomer.id)
      .attr('data-chain-id', this.chain.id)
      .attr('data-symbol-alias', this.symbolToDisplay)
      .attr(
        'data-side-connection-number',
        this.node.monomers.reduce(
          (acc, monomer) =>
            acc +
            monomer.covalentBonds.filter(
              (bond) =>
                bond instanceof PolymerBond && bond.isSideChainConnection,
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
      .attr('data-isAntisense', this.isAntisenseNode)
      .attr('data-nodeIndexOverall', this.nodeIndexOverall)
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
      .attr('data-element-type', 'background')
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
      .attr('transform', 'translate(14, -16)')
      .attr('data-element-type', 'spacer');

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

  private get nodeRenderMetadata() {
    if (!this.isSubChainNode(this.node)) return undefined;
    return getChainRenderMetadata(this.chain).get(this.node);
  }

  public get isAntisenseNode() {
    return this.node === this.twoStrandedNode?.antisenseNode;
  }

  private get hasAntisenseInChain() {
    return Boolean(this.twoStrandedNode.antisenseNode);
  }

  private get sequenceId() {
    const monomer =
      this.node instanceof Nucleotide || this.node instanceof Nucleoside
        ? this.node.rnaBase
        : this.node.monomer;
    return monomer.monomerItem.seqId;
  }

  private get counterNumber() {
    if (this.sequenceId !== undefined) return this.sequenceId;
    const antisenseNodeIndex = this.twoStrandedNode?.antisenseNodeIndex;
    const senseNodeIndex = this.twoStrandedNode?.senseNodeIndex;
    let numberToDisplay;
    const metadata = this.nodeRenderMetadata;
    if (metadata && !(this.node.monomer instanceof Phosphate)) {
      if (metadata.firstBreakingNodeIndex !== -1) {
        numberToDisplay =
          metadata.firstBreakingNodeIndex < metadata.nodeIndex
            ? metadata.subgroupIndex
            : metadata.nodeIndex + 1;
      } else if (
        metadata.nodeIndex === 0 ||
        metadata.nodeIndex === metadata.subChainLength - 1 ||
        (metadata.nodeIndex === metadata.subChainLength - 2 &&
          metadata.lastNodeIsPhosphate) ||
        this.isNthNodeInChain
      ) {
        numberToDisplay = metadata.nodeIndex + 1;
      }
    }

    if (isNumber(numberToDisplay)) {
      return numberToDisplay;
    }

    if (this.isAntisenseNode && isNumber(antisenseNodeIndex)) {
      return antisenseNodeIndex + 1;
    }

    return senseNodeIndex + 1;
  }

  private appendCounterElement(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
  ) {
    return rootElement
      .append('text')
      .attr('x', '2')
      .attr('y', this.node.monomer.monomerItem.isAntisense ? '24' : '-24')
      .text(this.counterNumber)
      .attr('font-family', 'Courier New')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('style', 'user-select: none')
      .attr('fill', '#7C7C7F');
  }

  public redrawCounter(editingNodeIndexOverall?: number) {
    if (!this.rootElement) {
      return;
    }

    this.counterElement?.remove();
    this.counterElement = undefined;

    if (this.needDisplayCounter(editingNodeIndexOverall)) {
      this.counterElement = this.appendCounterElement(this.rootElement);
    }
  }

  private needDisplayCounter(editingNodeIndexOverall?: number) {
    return (
      !this.inIgnoreList(this.node) &&
      // don't display counters for first node in chain even if it is last node
      // for example, chain:
      //     3   1     4
      // A A A @ A A A A
      !this.isSubChainNodeBeginningOfChain &&
      // display for first and last in subchain (except last MonomerSequenceNode)
      // for second last in subchain if last is MonomerSequenceNode (ex. Phosphate)
      // for every nth node in row (10th) in chain
      (this.isBeginningOfSubChain ||
        this.isLastInSubChain ||
        this.currentNodeNearBreakingNode ||
        ((!this.isSyncEditMode ||
          !this.hasAntisenseInChain ||
          !(
            this.counterNumber > 9 &&
            (this.isNextSymbolEditing(editingNodeIndexOverall) ||
              this.isEditingSymbol(editingNodeIndexOverall))
          )) &&
          (this.isNthNodeInChain || this.isLastMonomerInChain)))
    );
  }

  // in snake/flex layout mode is represented as % in hexagon
  private get currentNodeNearBreakingNode() {
    return this.nodeRenderMetadata?.isNearBreakingNode ?? false;
  }

  private inIgnoreList(node: SequenceNode): boolean {
    return isIgnoredSequenceNode(node);
  }

  private get isSubChainNodeBeginningOfChain() {
    const metadata = this.nodeRenderMetadata;
    return metadata?.subChainIndex === 0 && metadata.isBeginningOfSubChain;
  }

  private get isBeginningOfChain() {
    return this.monomerIndexInChain === 0;
  }

  private get isBeginningOfSubChain() {
    return this.nodeRenderMetadata?.isBeginningOfSubChain ?? false;
  }

  private get isLastInSubChain() {
    return this.nodeRenderMetadata?.isLastInSubChain ?? false;
  }

  private get isNthNodeInChain() {
    return this.isAntisenseNode
      ? (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 1
      : (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0;
  }

  public showCaret(xOffset = CARET_X_OFFSET_BEFORE_NODE) {
    // The caret only marks the edit position, so it stays out of exported images
    this.caretElement = this.spacerElement
      ?.append('g')
      .attr('class', 'dynamic-element');

    if (this.isSyncEditMode && this.isAntisenseNode) {
      this.caretElement
        ?.append('path')
        .attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z')
        .attr('fill', '#fff')
        .attr(
          'transform',
          `translate(
          ${-21},
          ${20}
          )`,
        )
        .attr('stroke', '#7C7C7F');
      this.caretElement
        ?.append('path')
        .attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z')
        .attr('fill', '#fff')
        .attr('transform', 'translate(-12 -34) rotate(180)')
        .attr('stroke', '#7C7C7F');
    }

    if (
      this.isAntisenseEditMode ? this.isAntisenseNode : !this.isAntisenseNode
    ) {
      this.caretElement
        ?.append('line')
        .attr('x1', xOffset)
        .attr('y1', -1)
        .attr('x2', xOffset)
        .attr('y2', 21)
        .attr('stroke', '#333')
        .attr('class', 'blinking');
    }
  }

  public showCaretAfterNode() {
    this.showCaret(CARET_X_OFFSET_AFTER_NODE);
  }

  public removeCaret() {
    this.caretElement?.remove();
    this.caretElement = undefined;
  }

  public redrawCaret(editingNodeIndexOverall?: number, isAfterRowEnd = false) {
    this.removeCaret();

    if (
      (this.isSequenceEditModeTurnedOn &&
        this.isEditingSymbol(editingNodeIndexOverall)) ||
      this.isSingleEmptyNode
    ) {
      if (isAfterRowEnd) {
        this.showCaretAfterNode();
      } else {
        this.showCaret();
      }
    }
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
    const arrowElement = this.rootElement
      ?.append('use')
      .attr('x', -17)
      .attr('y', -27)
      .attr('data-testid', 'sequence-start-arrow')
      .attr('href', `#${CHAIN_START_ARROW_SYMBOL_ID}`)
      // Shown only while editing, so it stays out of exported images
      .attr('class', 'dynamic-element');

    if (this.isAntisenseNode) {
      // Rotate around the arrow glyph's own center (not the whole use/symbol box,
      // whose fill-box is computed unreliably for use+symbol), keeping it in place.
      arrowElement?.attr('transform', 'rotate(180, -11, -6)');
    }
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

    this.redrawCaret();

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
      .attr('data-element-type', 'text')
      .attr(
        'cursor',
        this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode
          ? 'text'
          : 'default',
      );

    this.redrawCounter();

    this.drawSelection();

    if (
      (this.isSequenceEditInRnaBuilderModeTurnedOn &&
        !this.node.monomer.selected) ||
      (!this.isSyncEditMode &&
        this.isSequenceEditModeTurnedOn &&
        this.hasAntisenseInChain &&
        ((this.isAntisenseNode && !this.isAntisenseEditMode) ||
          (!this.isAntisenseNode && this.isAntisenseEditMode)))
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
        ?.attr('fill', SELECTION_COLOR)
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

  public setEnumeration(enumeration: number | null) {
    this.positionalEnumeration = enumeration;
  }

  public redrawEnumeration() {
    if (this.positionalEnumeration !== null) {
      this.counterElement?.text(this.sequenceId ?? this.positionalEnumeration);
    }
  }

  public redrawAttachmentPoints() {
    // intentional no-op: default base implementation; subclasses override when behavior is needed
  }

  public redrawAttachmentPointsCoordinates() {
    // intentional no-op: default base implementation; subclasses override when behavior is needed
  }

  public get enumeration() {
    return null;
  }

  public redrawChainBeginning() {
    // intentional no-op: default base implementation; subclasses override when behavior is needed
  }

  public hoverAttachmentPoint(): void {
    // intentional no-op: default base implementation; subclasses override when behavior is needed
  }

  public updateAttachmentPoints() {
    // intentional no-op: default base implementation; subclasses override when behavior is needed
  }

  public drawBackgroundElementHover() {
    if (this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
      return;
    }

    if (this.node.monomer.selected) {
      this.selectionRectangle?.attr('fill', '#35f073');
    } else {
      this.backgroundElement?.attr('fill', '#E1E8E9');
    }

    if (this.node.modified) {
      this.drawModification();
    }
  }

  public removeBackgroundElementHover() {
    if (this.node.monomer.selected) {
      this.selectionRectangle?.attr(
        'fill',
        this.isSequenceEditInRnaBuilderModeTurnedOn
          ? '#99D6DC'
          : SELECTION_COLOR,
      );
    } else {
      this.backgroundElement?.attr('fill', 'none');
    }

    if (this.node.modified) {
      this.drawModification();
    }
  }

  private isSubChainNode(node: SequenceNode): node is SubChainNode {
    return node?.monomers !== undefined;
  }

  public setAntisenseNodeRenderer(antisenseNodeRenderer: this) {
    this.antisenseNodeRenderer = antisenseNodeRenderer;
  }
}
