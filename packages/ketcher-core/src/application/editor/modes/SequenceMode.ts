import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  NodesSelection,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { BaseMonomer, SequenceType, Vec2 } from 'domain/entities';
import { BaseRenderer } from 'application/render/renderers/internal';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import {
  ReinitializeModeCommand,
  RestoreSequenceCaretPositionCommand,
} from 'application/editor/operations/modes';
import assert from 'assert';
import {
  getPeptideLibraryItem,
  getRnaPartLibraryItem,
} from 'domain/helpers/rna';
import {
  peptideNaturalAnalogues,
  RNA_DNA_NON_MODIFIED_PART,
  rnaDnaNaturalAnalogues,
} from 'domain/constants/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { isNumber, uniq } from 'lodash';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { PolymerBond } from 'domain/entities/PolymerBond';

const naturalAnalogues = uniq([
  ...rnaDnaNaturalAnalogues,
  ...peptideNaturalAnalogues,
]);

export class SequenceMode extends BaseMode {
  private _isEditMode = false;
  private selectionStarted = false;
  private selectionStartCaretPosition = -1;

  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  public get isEditMode() {
    return this._isEditMode;
  }

  public set isEditMode(isEditMode) {
    this._isEditMode = isEditMode;
  }

  public initialize(needScroll = true) {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.clearCanvas();

    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
      false,
    );
    const zoom = ZoomTool.instance;

    editor.renderersContainer.update(modelChanges);

    const chainsCollection =
      editor.drawingEntitiesManager.applyMonomersSequenceLayout();
    const firstMonomerPosition =
      chainsCollection.firstNode?.monomer.renderer?.scaledMonomerPosition;

    if (firstMonomerPosition && needScroll) {
      zoom.scrollTo(firstMonomerPosition);
    }

    modelChanges.merge(command);

    return modelChanges;
  }

  public turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer) {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditMode = true;
    this.initialize(false);
    if (sequenceItemRenderer) {
      SequenceRenderer.setCaretPositionByMonomer(
        sequenceItemRenderer.node.monomer,
      );
      SequenceRenderer.moveCaretForward();
    }
    editor.events.toggleSequenceEditMode.dispatch(true);
  }

  public turnOffEditMode() {
    if (!this.isEditMode) return;
    const editor = CoreEditor.provideEditorInstance();

    this.isEditMode = false;
    this.initialize(false);
    editor.events.toggleSequenceEditMode.dispatch(false);
  }

  public startNewSequence() {
    if (!this.isEditMode) {
      this.turnOnEditMode();
    }

    if (!SequenceRenderer.hasNewChain) {
      SequenceRenderer.startNewSequence();
    }

    SequenceRenderer.moveCaretToNewChain();
  }

  public click(event: MouseEvent) {
    const eventData = event.target?.__data__;
    const isClickedOnEmptyPlace = !(eventData instanceof BaseRenderer);
    const isClickedOnSequenceItem =
      eventData instanceof BaseSequenceItemRenderer;

    if (isClickedOnEmptyPlace) {
      this.turnOffEditMode();
    }

    if (this.isEditMode && isClickedOnSequenceItem) {
      SequenceRenderer.setCaretPositionBySequenceItemRenderer(
        eventData as BaseSequenceItemRenderer,
      );
      this.unselectAllEntities();
    }
  }

  public mousedown(event: MouseEvent) {
    const eventData = event.target?.__data__;
    const isEventOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;
    if (this.isEditMode && isEventOnSequenceItem && !event.shiftKey) {
      SequenceRenderer.setCaretPositionBySequenceItemRenderer(
        eventData as BaseSequenceItemRenderer,
      );
      this.unselectAllEntities();
      this.selectionStarted = true;
      this.selectionStartCaretPosition = SequenceRenderer.caretPosition;
    }
  }

  public mousemove(event: MouseEvent) {
    const eventData = event.target?.__data__;
    const isEventOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;
    if (this.isEditMode && isEventOnSequenceItem && this.selectionStarted) {
      const editor = CoreEditor.provideEditorInstance();
      SequenceRenderer.setCaretPositionBySequenceItemRenderer(
        eventData as BaseSequenceItemRenderer,
      );

      let startCaretPosition = this.selectionStartCaretPosition;
      let endCaretPosition = SequenceRenderer.caretPosition;
      if (this.selectionStartCaretPosition > SequenceRenderer.caretPosition) {
        startCaretPosition = SequenceRenderer.caretPosition;
        endCaretPosition = this.selectionStartCaretPosition;
      }
      const monomers = SequenceRenderer.getMonomersByCaretPositionRange(
        startCaretPosition,
        endCaretPosition,
      );
      this.unselectAllEntities();
      const { command: modelChanges } =
        editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(
          monomers,
        );
      const moveCaretOperation = new RestoreSequenceCaretPositionCommand(
        this.selectionStartCaretPosition,
        SequenceRenderer.caretPosition,
      );
      modelChanges.addOperation(moveCaretOperation);
      editor.renderersContainer.update(modelChanges);
    }
  }

  mouseup() {
    if (this.selectionStarted) {
      this.selectionStarted = false;
    }
  }

  private bondNodesThroughNewPhosphate(
    position: Vec2,
    previousMonomer: BaseMonomer,
    nextMonomer: BaseMonomer,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );

    assert(phosphateLibraryItem);

    const modelChanges = editor.drawingEntitiesManager.addMonomer(
      phosphateLibraryItem,
      position,
    );

    const additionalPhosphate = modelChanges.operations[0]
      .monomer as BaseMonomer;

    modelChanges.merge(
      editor.drawingEntitiesManager.createPolymerBond(
        previousMonomer,
        additionalPhosphate,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ),
    );

    modelChanges.merge(
      editor.drawingEntitiesManager.createPolymerBond(
        additionalPhosphate,
        nextMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ),
    );

    return modelChanges;
  }

  private handlePeptideNodeAddition(
    enteredSymbol: string,
    currentNode: SubChainNode,
    previousNodeInSameChain: SubChainNode,
    newNodePosition: Vec2,
  ) {
    if (!peptideNaturalAnalogues.includes(enteredSymbol)) {
      this.unsupportedSymbolsError(enteredSymbol);
      return undefined;
    }

    const modelChanges = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const newPeptideLibraryItem = getPeptideLibraryItem(editor, enteredSymbol);

    assert(newPeptideLibraryItem);

    const peptideAddCommand = editor.drawingEntitiesManager.addMonomer(
      newPeptideLibraryItem,
      newNodePosition,
    );

    const newPeptide = peptideAddCommand.operations[0].monomer as BaseMonomer;

    modelChanges.merge(peptideAddCommand);

    const deletedBond = this.deleteBond(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
    );

    this.handleConnectionWithCurrentNode(
      currentNode,
      modelChanges,
      newPeptide,
      deletedBond,
    );

    this.handleConnectionWithPreviousNodeInSameChain(
      previousNodeInSameChain,
      modelChanges,
      newPeptide,
      newNodePosition,
      deletedBond,
    );

    return modelChanges;
  }

  private handleRnaDnaNodeAddition(
    enteredSymbol: string,
    currentNode: SubChainNode,
    previousNodeInSameChain: SubChainNode,
    newNodePosition: Vec2,
  ) {
    if (!rnaDnaNaturalAnalogues.includes(enteredSymbol)) {
      this.unsupportedSymbolsError(enteredSymbol);
      return undefined;
    }

    const modelChanges = new Command();
    const { modelChanges: addedNodeModelChanges, node: nodeToAdd } =
      currentNode instanceof Nucleotide || currentNode instanceof Nucleoside
        ? Nucleotide.createOnCanvas(enteredSymbol, newNodePosition)
        : Nucleoside.createOnCanvas(enteredSymbol, newNodePosition);

    modelChanges.merge(addedNodeModelChanges);

    const deletedBond = this.deleteBond(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
    );

    this.handleConnectionWithCurrentNode(
      currentNode,
      modelChanges,
      nodeToAdd.lastMonomerInNode,
      deletedBond,
    );

    this.handleConnectionWithPreviousNodeInSameChain(
      previousNodeInSameChain,
      modelChanges,
      nodeToAdd.lastMonomerInNode,
      newNodePosition,
      deletedBond,
    );
    return modelChanges;
  }

  private handleConnectionWithCurrentNode(
    currentNode: SubChainNode,
    modelChanges: Command,
    monomerToAdd: BaseMonomer,
    deletedBond: PolymerBond,
  ) {
    if (currentNode && !(currentNode instanceof EmptySequenceNode)) {
      const editor = CoreEditor.provideEditorInstance();
      const r1BondOfCurrentNode =
        currentNode?.firstMonomerInNode?.attachmentPointsToBonds.R1;
      const r2BondOfMonomerToAdd = monomerToAdd.attachmentPointsToBonds.R2;

      // in case the currentNode has no R1 attachment point left for merging
      if (
        (!r1BondOfCurrentNode || deletedBond === r1BondOfCurrentNode) &&
        !r2BondOfMonomerToAdd
      ) {
        modelChanges.merge(
          editor.drawingEntitiesManager.createPolymerBond(
            monomerToAdd,
            currentNode?.firstMonomerInNode as BaseMonomer,
            AttachmentPointName.R2,
            AttachmentPointName.R1,
          ),
        );
      } else {
        editor.events.error.dispatch(
          'No available attachment points to establish bonds for merge.',
        );
      }
    }
  }

  private deleteBond(
    currentNode: SubChainNode,
    previousNodeInSameChain: SubChainNode,
    modelChanges: Command,
  ) {
    let r2BondOfPreviousNodeInSameChain;
    if (currentNode && !(currentNode instanceof EmptySequenceNode)) {
      const editor = CoreEditor.provideEditorInstance();
      if (previousNodeInSameChain) {
        r2BondOfPreviousNodeInSameChain =
          previousNodeInSameChain?.lastMonomerInNode.attachmentPointsToBonds.R2;
        assert(r2BondOfPreviousNodeInSameChain);
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(
            r2BondOfPreviousNodeInSameChain,
          ),
        );
      }
    }
    return r2BondOfPreviousNodeInSameChain;
  }

  private handleConnectionWithPreviousNodeInSameChain(
    previousNodeInSameChain: SubChainNode,
    modelChanges: Command,
    monomerToAdd: BaseMonomer,
    newNodePosition: Vec2,
    deletedBond: PolymerBond,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const r2BondOfPreviousNodeInSameChain =
      previousNodeInSameChain?.lastMonomerInNode?.attachmentPointsToBonds.R2;
    const r1BondOfMonomerToAdd = monomerToAdd.attachmentPointsToBonds.R1;
    if (
      previousNodeInSameChain &&
      !(previousNodeInSameChain instanceof Nucleoside)
    ) {
      if (
        (!r2BondOfPreviousNodeInSameChain ||
          deletedBond === r2BondOfPreviousNodeInSameChain) &&
        !r1BondOfMonomerToAdd
      ) {
        modelChanges.merge(
          editor.drawingEntitiesManager.createPolymerBond(
            previousNodeInSameChain.lastMonomerInNode,
            monomerToAdd,
            AttachmentPointName.R2,
            AttachmentPointName.R1,
          ),
        );
      } else {
        editor.events.error.dispatch(
          'No available attachment points to establish bonds for merge.',
        );
      }
    }

    if (
      editor.sequenceTypeEnterMode !== SequenceType.PEPTIDE &&
      previousNodeInSameChain instanceof Nucleoside
    ) {
      if (!r1BondOfMonomerToAdd) {
        modelChanges.merge(
          this.bondNodesThroughNewPhosphate(
            newNodePosition,
            previousNodeInSameChain.lastMonomerInNode,
            monomerToAdd,
          ),
        );
      } else {
        editor.events.error.dispatch(
          'No available attachment points to establish bonds for merge.',
        );
      }
    }
  }

  private finishNodesDeletion(
    modelChanges: Command,
    previousCaretPosition: number,
    newCaretPosition?: number,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const moveCaretOperation = new RestoreSequenceCaretPositionCommand(
      previousCaretPosition,
      isNumber(newCaretPosition)
        ? newCaretPosition
        : SequenceRenderer.caretPosition,
    );
    modelChanges.addOperation(new ReinitializeModeCommand());
    editor.renderersContainer.update(modelChanges);
    modelChanges.addOperation(moveCaretOperation);
    history.update(modelChanges);
    this.selectionStartCaretPosition = -1;
  }

  private handleNodesDeletion(selections: NodesSelection) {
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      const selectionStartNode = selectionRange[0].node;
      const selectionEndNode = selectionRange[selectionRange.length - 1].node;
      let isPhosphateAdditionalyDeleted = false;

      const nodeBeforeSelection =
        SequenceRenderer.getPreviousNode(selectionStartNode);
      const nodeAfterSelection = SequenceRenderer.getNextNode(selectionEndNode);
      const nodeInSameChainBeforeSelection =
        SequenceRenderer.getPreviousNodeInSameChain(selectionStartNode);

      if (
        !nodeInSameChainBeforeSelection &&
        nodeAfterSelection &&
        !(nodeAfterSelection instanceof EmptySequenceNode)
      ) {
        modelChanges.merge(
          editor.drawingEntitiesManager.moveMonomer(
            nodeAfterSelection.monomer,
            selectionStartNode.monomer.position,
          ),
        );
      }

      if (
        !nodeBeforeSelection ||
        nodeBeforeSelection instanceof EmptySequenceNode
      ) {
        return;
      }

      if (
        nodeBeforeSelection instanceof Nucleotide &&
        !(nodeAfterSelection instanceof Nucleotide) &&
        !(nodeAfterSelection instanceof Nucleoside)
      ) {
        // delete phosphate from last nucleotide
        modelChanges.merge(
          editor.drawingEntitiesManager.deleteMonomer(
            nodeBeforeSelection.lastMonomerInNode,
          ),
        );
        // TODO get rid of this boolean
        isPhosphateAdditionalyDeleted = true;
      }

      if (
        !nodeAfterSelection ||
        nodeAfterSelection instanceof EmptySequenceNode
      ) {
        return;
      }

      if (
        nodeBeforeSelection instanceof Nucleoside &&
        (nodeAfterSelection instanceof Nucleotide ||
          nodeAfterSelection instanceof Nucleoside)
      ) {
        modelChanges.merge(
          this.bondNodesThroughNewPhosphate(
            this.getNewSequenceItemPosition(nodeBeforeSelection),
            nodeBeforeSelection.lastMonomerInNode,
            nodeAfterSelection.firstMonomerInNode,
          ),
        );
      } else {
        modelChanges.merge(
          editor.drawingEntitiesManager.createPolymerBond(
            isPhosphateAdditionalyDeleted
              ? nodeBeforeSelection.firstMonomerInNode
              : nodeBeforeSelection.lastMonomerInNode,
            nodeAfterSelection.firstMonomerInNode,
            AttachmentPointName.R2,
            AttachmentPointName.R1,
          ),
        );
      }
    });

    return modelChanges;
  }

  get keyboardEventHandlers() {
    return {
      delete: {
        shortcut: ['Backspace', 'Delete'],
        handler: () => {
          if (!this.isEditMode) {
            return;
          }
          const editor = CoreEditor.provideEditorInstance();
          const previousNode = SequenceRenderer.previousNode;
          const previousCaretPosition = SequenceRenderer.caretPosition;
          const selections = SequenceRenderer.selections;
          const modelChanges = new Command();
          let nodesToDelete: NodesSelection;

          if (selections.length) {
            modelChanges.merge(this.deleteSelectedDrawingEntities());
            nodesToDelete = selections;
          } else if (previousNode) {
            previousNode.monomers.forEach((monomer) => {
              modelChanges.merge(
                editor.drawingEntitiesManager.deleteMonomer(monomer),
              );
            });
            nodesToDelete = [
              [
                {
                  node: previousNode,
                  nodeIndexOverall:
                    SequenceRenderer.previousCaretPosition as number,
                },
              ],
            ];
          } else {
            return;
          }

          modelChanges.merge(this.handleNodesDeletion(nodesToDelete));

          this.finishNodesDeletion(
            modelChanges,
            previousCaretPosition,
            nodesToDelete[0][0].nodeIndexOverall,
          );

          if (
            SequenceRenderer.caretPosition === 0 &&
            SequenceRenderer.chainsCollection.chains.length === 0
          ) {
            this.startNewSequence();
          }
        },
      },
      'turn-off-edit-mode': {
        shortcut: ['Escape'],
        handler: () => {
          this.turnOffEditMode();
        },
      },
      'start-new-sequence': {
        shortcut: ['Enter'],
        handler: () => {
          this.unselectAllEntities();
          this.startNewSequence();
        },
      },
      'move-caret-forward': {
        shortcut: ['ArrowRight'],
        handler: () => {
          if (!this.isEditMode) {
            return;
          }
          SequenceRenderer.moveCaretForward();
        },
      },
      'move-caret-back': {
        shortcut: ['ArrowLeft'],
        handler: () => {
          if (!this.isEditMode) {
            return;
          }
          SequenceRenderer.moveCaretBack();
        },
      },
      'add-sequence-item': {
        shortcut: [
          ...naturalAnalogues,
          ...naturalAnalogues.map((naturalAnalogue) =>
            naturalAnalogue.toLowerCase(),
          ),
        ],
        handler: (event) => {
          if (!this.isEditMode) {
            return;
          }
          if (!this.deleteSelection()) {
            return;
          }
          const enteredSymbol = event.code.replace('Key', '');
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const modelChanges = this.insertNewSequenceItem(
            editor,
            enteredSymbol,
          );

          // Case when user type symbol that does not exist in current sequence type mode
          if (!modelChanges) {
            return;
          }

          modelChanges.addOperation(new ReinitializeModeCommand());
          editor.renderersContainer.update(modelChanges);
          modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          history.update(modelChanges);
        },
      },
      'sequence-edit-select': {
        shortcut: ['Shift+ArrowLeft', 'Shift+ArrowRight'],
        handler: (event) => {
          const arrowKey = event.key;

          if (
            SequenceRenderer.caretPosition === 0 &&
            arrowKey === 'ArrowLeft'
          ) {
            return;
          }

          this.selectionStartCaretPosition =
            this.selectionStartCaretPosition !== -1
              ? this.selectionStartCaretPosition
              : SequenceRenderer.caretPosition;
          SequenceRenderer.shiftArrowSelectionInEditMode(event);
        },
      },
    };
  }

  private deleteSelection() {
    const selections = SequenceRenderer.selections;

    if (selections.length > 1) {
      return false;
    }

    if (selections.length === 1) {
      const deletionModelChanges = this.deleteSelectedDrawingEntities();

      deletionModelChanges.merge(this.handleNodesDeletion(selections));
      this.finishNodesDeletion(
        deletionModelChanges,
        SequenceRenderer.caretPosition,
        selections[0][0].nodeIndexOverall,
      );
    }
    return true;
  }

  checkPasteConditions(drawingEntitiesManager: DrawingEntitiesManager) {
    const editor = CoreEditor.provideEditorInstance();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManager.monomers.values(),
    ]);
    if (this.isEditMode) {
      if (chainsCollection.chains.length > 1) {
        editor.events.error.dispatch(
          'Paste of several fragments is prohibited in text-editing mode.',
        );
        return false;
      }
      if (chainsCollection.chains.length === 0) {
        editor.events.error.dispatch('No copied fragments.');
        return false;
      }
      if (!this.deleteSelection()) {
        return false;
      }
    }
    return true;
  }

  getExtraOperations(
    drawingEntitiesManager: DrawingEntitiesManager,
    monomerToNewMonomer: Map<BaseMonomer, BaseMonomer>,
  ) {
    if (this.isEditMode) {
      const chainsCollection = ChainsCollection.fromMonomers([
        ...drawingEntitiesManager.monomers.values(),
      ]);
      // need to use the created monomer to init polymerbond, otherwise the bond and monomer will not match in rearrange process
      return this.insertNewSequenceFragment(
        chainsCollection,
        monomerToNewMonomer,
      );
    }
    return null;
  }

  private insertNewSequenceItem(editor: CoreEditor, enteredSymbol: string) {
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
    const newNodePosition = this.getNewNodePosition();
    let modelChanges;

    if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
      modelChanges = this.handlePeptideNodeAddition(
        enteredSymbol,
        currentNode,
        previousNodeInSameChain,
        newNodePosition,
      );
    } else {
      modelChanges = this.handleRnaDnaNodeAddition(
        enteredSymbol,
        currentNode,
        previousNodeInSameChain,
        newNodePosition,
      );
    }
    return modelChanges;
  }

  private insertNewSequenceFragment(
    chainsCollection: ChainsCollection,
    monomerToNewMonomer: Map<BaseMonomer, BaseMonomer>,
  ) {
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
    const modelChanges = new Command();
    const lastMonomerOfNewFragment = monomerToNewMonomer.get(
      chainsCollection.chains[0].lastSubChain.lastNode.lastMonomerInNode,
    );
    assert(lastMonomerOfNewFragment);
    const deletedBond = this.deleteBond(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
    );
    this.handleConnectionWithCurrentNode(
      currentNode,
      modelChanges,
      lastMonomerOfNewFragment,
      deletedBond,
    );
    const firstMonomerOfNewFragment = monomerToNewMonomer.get(
      chainsCollection.firstNode.firstMonomerInNode,
    );
    assert(firstMonomerOfNewFragment);
    const newNodePosition = this.getNewNodePosition();
    this.handleConnectionWithPreviousNodeInSameChain(
      previousNodeInSameChain,
      modelChanges,
      firstMonomerOfNewFragment,
      newNodePosition,
      deletedBond,
    );
    return modelChanges;
  }

  getNewNodePosition() {
    if (this.isEditMode) {
      const previousNode = SequenceRenderer.previousFromCurrentEdittingMonomer;
      const nodeBeforePreviousNode = previousNode
        ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
        : undefined;
      const newNodePosition = this.getNewSequenceItemPosition(
        previousNode,
        nodeBeforePreviousNode,
      );
      return newNodePosition;
    } else {
      return SequenceRenderer.chainsCollection.chains.length > 0
        ? SequenceRenderer.getNextChainPosition(
            SequenceRenderer.lastChainStartPosition,
            SequenceRenderer.lastChain,
          )
        : new Vec2(0, 0);
    }
  }

  private deleteSelectedDrawingEntities() {
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = new Command();
    editor.drawingEntitiesManager.selectedEntities.forEach(([, entity]) => {
      modelChanges.merge(
        editor.drawingEntitiesManager.deleteDrawingEntity(entity),
      );
    });

    return modelChanges;
  }

  private getNewSequenceItemPosition(
    previousNode?: SubChainNode,
    nodeBeforePreviousNode?: SubChainNode,
  ) {
    const offsetFromPrevious = new Vec2(1, 1);

    if (previousNode && !(previousNode instanceof EmptySequenceNode)) {
      return previousNode.lastMonomerInNode.position.add(offsetFromPrevious);
    } else if (nodeBeforePreviousNode) {
      return nodeBeforePreviousNode.lastMonomerInNode.position.add(
        offsetFromPrevious,
      );
    } else {
      return new Vec2(0, 0);
    }
  }

  scrollForView(needCenterStructure = false) {
    if (!this.isEditMode) {
      const zoom = ZoomTool.instance;
      if (needCenterStructure) {
        const structCenterY = SequenceRenderer.getSequenceStructureCenterY();
        zoom.scrollToVerticalCenter(structCenterY);
      } else {
        zoom.scrollToVerticalBottom();
      }
    }
  }

  private unselectAllEntities() {
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges =
      editor.drawingEntitiesManager.unselectAllDrawingEntities();
    modelChanges.merge(SequenceRenderer.unselectEmptySequenceNodes());
    editor.renderersContainer.update(modelChanges);
  }

  public destroy() {
    this.turnOffEditMode();
  }
}
