import { D3SvgElementSelection } from 'application/render/types';
import { LinkerSequenceNode, UnresolvedMonomer, Vec2 } from 'domain/entities';
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
import { Phosphate } from 'domain/entities/Phosphate';
import { SequenceMode } from 'application/editor';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { MONOMER_CONST } from 'domain/constants';
import { SettingsManager } from 'utilities';

const CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';

export abstract class BaseSequenceItemRenderer extends BaseSequenceRenderer {
  private readonly editorEvents: typeof editorEvents;
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
    public readonly node: SubChainNode | BackBoneSequenceNode,
    private readonly firstNodeInChainPosition: Vec2,
    private readonly monomerIndexInChain: number,
    private readonly isLastMonomerInChain: boolean,
    private readonly chain: Chain,
    private readonly nodeIndexOverall: number,
    private readonly editingNodeIndexOverall: number,
    public readonly monomerSize: { width: number; height: number },
    public readonly scaledMonomerPosition: Vec2,
    private readonly previousRowsWithAntisense = 0,
    public readonly twoStrandedNode: ITwoStrandedChainItem,
  ) {
    super(node.monomer);
    this.editorEvents = editorEvents;
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
    return CoreEditor.provideEditorInstance().isSequenceEditMode;
  }

  protected get isSequenceEditInRnaBuilderModeTurnedOn() {
    return CoreEditor.provideEditorInstance().isSequenceEditInRNABuilderMode;
  }

  private get isAntisenseEditMode() {
    const editorMode = CoreEditor.provideEditorInstance().mode;

    return editorMode instanceof SequenceMode && editorMode.isAntisenseEditMode;
  }

  private get isSyncEditMode() {
    const editorMode = CoreEditor.provideEditorInstance().mode;

    return editorMode instanceof SequenceMode && editorMode.isSyncEditMode;
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

  public get isAntisenseNode() {
    return this.node === this.twoStrandedNode?.antisenseNode;
  }

  private get hasAntisenseInChain() {
    return Boolean(this.twoStrandedNode.antisenseNode);
  }

  // Subchain is splitted by LinkerSequenceNode,
  // each node coming after LinkerSequenceNode must start new number sequence:
  // for example, subChain:
  // 1   3   1     4
  // A A A @ A A A A
  private getNodeIndexInSubgroup() {
    let nodeIndex = 0;

    this.chain.subChains.some((subChain) => {
      if (!this.isSubChainNode(this.node)) return false;

      const nodeIndexInSubChain = subChain.nodes.indexOf(this.node);
      if (nodeIndexInSubChain === -1) return false;

      // Split subchain into arrays of non-linker nodes
      const nonLinkerNodeGroups = subChain.nodes.reduce(
        (groups, node) => {
          if (
            node instanceof LinkerSequenceNode ||
            node.monomer instanceof Phosphate ||
            this.checkIfNodeIsAmbiguousMonomerNotPeptide(node)
          ) {
            if (groups[groups.length - 1].length > 0) {
              groups.push([]);
            }
          } else {
            groups[groups.length - 1].push(node);
          }
          return groups;
        },
        [[]] as (SubChainNode | BackBoneSequenceNode)[][],
      );

      // Find the group containing the current node
      const currentGroup = nonLinkerNodeGroups.find((group) =>
        group.includes(this.node),
      );

      if (!currentGroup) return false;

      // Calculate the index within the group
      nodeIndex = currentGroup.indexOf(this.node) + 1;
      return true;
    });

    return nodeIndex;
  }

  private get counterNumber() {
    const antisenseNodeIndex = this.twoStrandedNode?.antisenseNodeIndex;
    const senseNodeIndex = this.twoStrandedNode?.senseNodeIndex;
    let numberToDisplay;
    const caclulateNumberToDisplay = (subChain) => {
      if (!this.isSubChainNode(this.node)) return false;

      const nodeIndex = subChain.nodes.indexOf(this.node);
      if (nodeIndex === -1) return false;
      if (this.node.monomer instanceof Phosphate) return false;

      const linkerNodeIndex = subChain.nodes.findIndex(
        (node) => node instanceof LinkerSequenceNode,
      );
      const phosphateNodeIndex = subChain.nodes.findIndex(
        ({ monomer }) => monomer instanceof Phosphate,
      );
      const ambiguousMonomerNonPeptideNodeIndex = subChain.nodes.findIndex(
        this.checkIfNodeIsAmbiguousMonomerNotPeptide,
      );
      if (
        linkerNodeIndex !== -1 ||
        phosphateNodeIndex !== -1 ||
        ambiguousMonomerNonPeptideNodeIndex !== -1
      ) {
        if (
          linkerNodeIndex < nodeIndex ||
          phosphateNodeIndex < nodeIndex ||
          ambiguousMonomerNonPeptideNodeIndex < nodeIndex
        ) {
          numberToDisplay = this.getNodeIndexInSubgroup();
        } else {
          numberToDisplay = nodeIndex + 1;
        }
      } else if (
        nodeIndex === 0 ||
        nodeIndex === subChain.nodes.length - 1 ||
        (nodeIndex === subChain.nodes.length - 2 &&
          subChain.nodes[subChain.nodes.length - 1].monomer instanceof
            Phosphate) ||
        this.isNthNodeInChain
      ) {
        numberToDisplay = nodeIndex + 1;
      }

      return numberToDisplay !== undefined;
    };

    this.chain.subChains.some(caclulateNumberToDisplay);

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
            this.isNextSymbolEditing(editingNodeIndexOverall)
          )) &&
          (this.isNthNodeInChain || this.isLastMonomerInChain)))
    );
  }

  // in snake/flex layout mode is represented as % in hexagon
  private checkIfNodeIsAmbiguousMonomerPeptide(node) {
    return (
      node instanceof AmbiguousMonomerSequenceNode &&
      node.monomer.monomerClass === MONOMER_CONST.AMINO_ACID
    );
  }

  // in snake/flex layout mode is represented as % in:
  // rectangle, circle, diamond, rounded rectangle, etc. (not hexagon)
  private checkIfNodeIsAmbiguousMonomerNotPeptide(node) {
    return (
      node instanceof AmbiguousMonomerSequenceNode &&
      node.monomer.monomerClass !== MONOMER_CONST.AMINO_ACID
    );
  }

  // returns true if it is first node in subchain after LinkerSequenceNode
  private get currentNodeNearBreakingNode() {
    return this.chain.subChains.some((subChain) => {
      if (
        !this.isSubChainNode(this.node) ||
        this.checkIfNodeIsAmbiguousMonomerPeptide(this.node)
      )
        return false;

      const nodeIndex = subChain.nodes.indexOf(this.node);
      if (nodeIndex === -1) return false;

      return (
        (nodeIndex > 0 &&
          subChain.nodes[nodeIndex - 1] instanceof LinkerSequenceNode) ||
        (nodeIndex < subChain.nodes.length - 1 &&
          subChain.nodes[nodeIndex + 1] instanceof LinkerSequenceNode) ||
        (nodeIndex > 0 &&
          this.checkIfNodeIsAmbiguousMonomerNotPeptide(
            subChain.nodes[nodeIndex - 1],
          )) ||
        (nodeIndex < subChain.nodes.length - 1 &&
          this.checkIfNodeIsAmbiguousMonomerNotPeptide(
            subChain.nodes[nodeIndex + 1],
          ))
      );
    });
  }

  private inIgnoreList(node: SubChainNode | BackBoneSequenceNode): boolean {
    return (
      // @ LinkerSequenceNode (ex. CHEM)
      // for example, subChain:
      // 1   3   1
      // A A A @ A
      // or (if Linker is phosphate)
      // 1   3   4
      // A A A @ A
      node instanceof LinkerSequenceNode ||
      // empty sequence node and backbone sequence node
      node instanceof EmptySequenceNode ||
      node instanceof BackBoneSequenceNode ||
      // Ambiguous monomer not peptide
      this.checkIfNodeIsAmbiguousMonomerNotPeptide(this.node) ||
      // Phosphate
      // for example, subChain:
      //  1   3
      // pA A Ap
      node.monomer instanceof Phosphate ||
      // (!(node instanceof LinkerSequenceNode) &&
      //   node.monomer instanceof Phosphate) ||
      // Unknown monomer
      // for example, subChain:
      // 1   3
      // A A A ?
      node.monomer instanceof UnresolvedMonomer
    );
  }

  // returns subchain with node
  private get subChainWithNode() {
    if (!this.isSubChainNode(this.node)) return null;

    const subChain = this.chain.subChains.find((subChain) => {
      if (!this.isSubChainNode(this.node)) return false;
      return subChain.nodes.includes(this.node);
    });

    if (!subChain) return null;
    return subChain;
  }

  // returns non-breaking sequence of ignored nodes before first node in subchain
  private get ignoredNodesBeforeFirstNodeInSubChain():
    | (SubChainNode | BackBoneSequenceNode)[] {
    if (!this.isSubChainNode(this.node)) return [];

    if (!this.subChainWithNode) return [];

    const nodeIndex = this.subChainWithNode.nodes.indexOf(this.node);
    if (nodeIndex === -1) return [];

    const nodesBefore = this.subChainWithNode.nodes.slice(0, nodeIndex);
    if (nodesBefore.some((node) => !this.inIgnoreList(node))) {
      return [];
    }

    return nodesBefore;
  }

  private get hasOnlyIgnoredNodesBeforeNodeInSubChain() {
    return !!this.ignoredNodesBeforeFirstNodeInSubChain.length;
  }

  // returns non-breaking sequence of ignored nodes after last non-ignored node in subchain
  private get ignoredNodesAfterLastNodeInSubChain():
    | (SubChainNode | BackBoneSequenceNode)[] {
    if (!this.isSubChainNode(this.node)) return [];

    if (!this.subChainWithNode) return [];

    const nodeIndex = this.subChainWithNode.nodes.indexOf(this.node);
    if (nodeIndex === -1) return [];

    const nodesAfter = this.subChainWithNode.nodes.slice(nodeIndex + 1);
    if (nodesAfter.some((node) => !this.inIgnoreList(node))) {
      return [];
    }

    return nodesAfter;
  }

  private get hasOnlyIgnoredNodesAfterNodeInChain() {
    return !!this.ignoredNodesAfterLastNodeInSubChain.length;
  }

  // returns true if node is not in ignore list and is first node in chain
  // or has only ignored nodes before it in subchain
  private get isSubChainNodeBeginningOfChain() {
    return (
      this.isSubChainNode(this.node) &&
      !this.inIgnoreList(this.node) &&
      this.isNodeInFirstSubChain &&
      this.isBeginningOfSubChain
    );
  }

  private get isBeginningOfChain() {
    return this.monomerIndexInChain === 0;
  }

  private get isNodeInFirstSubChain(): boolean {
    if (!this.isSubChainNode(this.node)) return false;
    return this.chain.subChains[0].nodes.indexOf(this.node) !== -1;
  }

  // returns true if node is not in ignore list and is first node in subchain
  // or has only ignored nodes before it in subchain
  private get isBeginningOfSubChain() {
    return this.chain.subChains.some((subChain) => {
      const firstNode = subChain.nodes[0];
      return (
        !this.inIgnoreList(this.node) &&
        (firstNode === this.node ||
          this.hasOnlyIgnoredNodesBeforeNodeInSubChain)
      );
    });
  }

  // returns true if node is not in ignore list and is last node in subchain
  // or has only ignored nodes after it in subchain
  private get isLastInSubChain() {
    return this.chain.subChains.some((subChain) => {
      const lastNode = subChain.nodes[subChain.nodes.length - 1];

      return (
        !this.inIgnoreList(this.node) &&
        (this.node === lastNode || this.hasOnlyIgnoredNodesAfterNodeInChain)
      );
    });
  }

  private get isNthNodeInChain() {
    return this.isAntisenseNode
      ? (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 1
      : (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0;
  }

  public showCaret() {
    this.caretElement = this.spacerElement?.append('g');

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

  public redrawCaret(editingNodeIndexOverall?: number) {
    this.removeCaret();

    if (
      (this.isSequenceEditModeTurnedOn &&
        this.isEditingSymbol(editingNodeIndexOverall)) ||
      this.isSingleEmptyNode
    ) {
      this.showCaret();
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
    this.rootElement
      ?.append('use')
      .attr('x', -17)
      .attr('y', -27)
      .attr('data-testid', 'sequence-start-arrow')
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
      .attr(
        'cursor',
        this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode
          ? 'text'
          : 'default',
      );

    this.appendEvents();
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

  private isSubChainNode(
    node: SubChainNode | BackBoneSequenceNode,
  ): node is SubChainNode {
    return node?.monomers !== undefined;
  }

  public setAntisenseNodeRenderer(antisenseNodeRenderer: this) {
    this.antisenseNodeRenderer = antisenseNodeRenderer;
  }
}
