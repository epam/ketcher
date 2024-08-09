import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  NodeSelection,
  NodesSelection,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Command } from 'domain/entities/Command';
import {
  BaseMonomer,
  LinkerSequenceNode,
  Phosphate,
  RNABase,
  SequenceType,
  Sugar,
  Vec2,
} from 'domain/entities';
import { BaseRenderer } from 'application/render/renderers/internal';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import {
  ReinitializeModeOperation,
  RestoreSequenceCaretPositionOperation,
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
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import {
  IRnaPreset,
  LabeledNodesWithPositionInSequence,
} from 'application/editor/tools/Tool';
import { NewSequenceButton } from 'application/render/renderers/sequence/ui-controls/NewSequenceButton';
import { PolymerBond } from 'domain/entities/PolymerBond';

const naturalAnalogues = uniq([
  ...rnaDnaNaturalAnalogues,
  ...peptideNaturalAnalogues,
]);

enum Direction {
  Left = 'left',
  Right = 'right',
}

export interface StartNewSequenceEventData {
  indexOfRowBefore: number;
}

export class SequenceMode extends BaseMode {
  private _isEditMode = false;
  private _isEditInRNABuilderMode = false;
  private selectionStarted = false;
  private selectionStartCaretPosition = -1;
  private mousemoveCounter = 0;

  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  public get isEditMode() {
    return this._isEditMode;
  }

  public set isEditMode(isEditMode) {
    this._isEditMode = isEditMode;
  }

  public get isEditInRNABuilderMode() {
    return this._isEditInRNABuilderMode;
  }

  public set isEditInRNABuilderMode(isEditInRNABuilderMode) {
    this._isEditInRNABuilderMode = isEditInRNABuilderMode;
  }

  public initialize(needScroll = true, needRemoveSelection = true) {
    const command = super.initialize(needRemoveSelection);
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

  public turnOnEditMode(
    sequenceItemRenderer?: BaseSequenceItemRenderer,
    needToRemoveSelection = true,
  ) {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditMode = true;
    this.initialize(false, needToRemoveSelection);
    if (sequenceItemRenderer) {
      SequenceRenderer.setCaretPositionByMonomer(
        sequenceItemRenderer.node.monomer,
      );
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

  public turnOnSequenceEditInRNABuilderMode() {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditInRNABuilderMode = true;
    this.initialize(false, false);

    editor.events.toggleSequenceEditInRNABuilderMode.dispatch(true);
  }

  public turnOffSequenceEditInRNABuilderMode() {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditInRNABuilderMode = false;
    this.initialize(false);
    editor.events.toggleSequenceEditInRNABuilderMode.dispatch(false);
  }

  public startNewSequence(eventData?: StartNewSequenceEventData) {
    const currentChainIndex = this.isEditMode
      ? SequenceRenderer.currentChainIndex
      : SequenceRenderer.chainsCollection.chains.length - 1;
    const indexOfRowBefore = isNumber(eventData?.indexOfRowBefore)
      ? eventData?.indexOfRowBefore
      : currentChainIndex;

    if (!this.isEditMode) {
      this.turnOnEditMode();
    }

    SequenceRenderer.startNewSequence(indexOfRowBefore);
  }

  public modifySequenceInRnaBuilder(
    updatedSelection: LabeledNodesWithPositionInSequence[],
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();

    // Update Nucleotides one by one
    for (const labeledNucleoelement of updatedSelection) {
      const nodeIndexOverall = labeledNucleoelement.nodeIndexOverall;

      if (nodeIndexOverall === undefined) return;

      // Create monomerItem(s) based on label
      let sugarMonomerItem;
      let baseMonomerItem;
      let phosphateMonomerItem;
      if (labeledNucleoelement.sugarLabel) {
        sugarMonomerItem = getRnaPartLibraryItem(
          editor,
          labeledNucleoelement.sugarLabel,
        );
      }
      if (labeledNucleoelement.baseLabel) {
        baseMonomerItem = getRnaPartLibraryItem(
          editor,
          labeledNucleoelement.baseLabel,
        );
      }
      if (labeledNucleoelement.phosphateLabel) {
        phosphateMonomerItem = getRnaPartLibraryItem(
          editor,
          labeledNucleoelement.phosphateLabel,
        );
      }

      const currentNode = SequenceRenderer.getNodeByPointer(nodeIndexOverall);

      // Update Sugar monomerItem object
      if (currentNode.sugar && sugarMonomerItem) {
        modelChanges.merge(
          editor.drawingEntitiesManager.modifyMonomerItem(
            currentNode.sugar,
            sugarMonomerItem,
          ),
        );
      }
      // Update Base monomerItem object
      if (currentNode.rnaBase && baseMonomerItem) {
        modelChanges.merge(
          editor.drawingEntitiesManager.modifyMonomerItem(
            currentNode.rnaBase,
            baseMonomerItem,
          ),
        );
      }

      // Update monomerItem object or add Phosphate
      if (phosphateMonomerItem) {
        // Update Phosphate monomerItem object for Nucleotide
        if (currentNode instanceof Nucleotide) {
          modelChanges.merge(
            editor.drawingEntitiesManager.modifyMonomerItem(
              currentNode.phosphate,
              phosphateMonomerItem,
            ),
          );
          // Add Phosphate to Nucleoside
        } else if (currentNode instanceof Nucleoside) {
          const sugarR2 = currentNode.sugar.attachmentPointsToBonds.R2;
          const nextMonomerInSameChain = sugarR2?.secondMonomer;

          // Remove existing bond connection between Nucleoside Sugar and next node in case of any
          if (sugarR2) {
            modelChanges.merge(
              editor.drawingEntitiesManager.deletePolymerBond(sugarR2),
            );
          }

          modelChanges.merge(
            this.bondNodesThroughNewPhosphate(
              new Vec2(0, 0),
              currentNode.sugar,
              nextMonomerInSameChain,
              labeledNucleoelement.phosphateLabel,
            ),
          );
          // Update Phosphate monomerItem object
        } else if (currentNode.monomer instanceof Phosphate) {
          modelChanges.merge(
            editor.drawingEntitiesManager.modifyMonomerItem(
              currentNode.monomer,
              phosphateMonomerItem,
            ),
          );
        }
      }
    }

    // Refresh UI
    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
  }

  public click(event: MouseEvent) {
    const eventData = event.target?.__data__;
    const isClickedOnSequenceItem =
      eventData instanceof BaseSequenceItemRenderer;

    if (this.isEditMode && isClickedOnSequenceItem) {
      this.unselectAllEntities();
    }
  }

  public doubleClickOnSequenceItem(event: MouseEvent) {
    if (this.isEditInRNABuilderMode) {
      return;
    }

    const eventData = event.target?.__data__ as BaseSequenceItemRenderer;

    this.turnOnEditMode(eventData, false);
  }

  public mousedownBetweenSequenceItems(event: MouseEvent) {
    if (this.isEditInRNABuilderMode) {
      return;
    }

    const eventData = event.target?.__data__ as BaseSequenceItemRenderer;

    this.turnOnEditMode(eventData);
    SequenceRenderer.moveCaretForward();
  }

  public mousedown(event: MouseEvent) {
    const eventData: BaseRenderer | NewSequenceButton | undefined =
      event.target?.__data__;
    const isClickedOnEmptyPlace = !(
      eventData instanceof NewSequenceButton ||
      eventData instanceof BaseRenderer
    );
    const isEventOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;

    if (isClickedOnEmptyPlace) {
      this.turnOffEditMode();

      return;
    }

    if (this.isEditMode && isEventOnSequenceItem && !event.shiftKey) {
      let sequenceItemBoundingBox = eventData.rootBoundingClientRect;

      // Case when user clicks between symbols. In this case renderer stored in eventData
      // is already destroyed during rerender in mousedownBetweenSequenceItems handler
      if (!sequenceItemBoundingBox) {
        sequenceItemBoundingBox = SequenceRenderer.getRendererByMonomer(
          eventData.node.monomer,
        )?.rootBoundingClientRect;
      }

      const isRightSideOfSequenceItemClicked = sequenceItemBoundingBox
        ? event.clientX >
          sequenceItemBoundingBox.x + sequenceItemBoundingBox.width / 2
        : false;

      SequenceRenderer.setCaretPositionByMonomer(eventData.node.monomer);

      if (isRightSideOfSequenceItemClicked) {
        SequenceRenderer.moveCaretForward();
      }

      SequenceRenderer.resetLastUserDefinedCaretPosition();

      this.unselectAllEntities();
      this.selectionStarted = true;
      this.selectionStartCaretPosition = SequenceRenderer.caretPosition;
    }
  }

  public mousemove(event: MouseEvent) {
    const eventData = event.target?.__data__;
    const isEventOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;
    // this.mousemoveCounter > 1 used here to prevent selection of single monomer
    // when user just clicked on it during the mousemove event
    if (
      this.isEditMode &&
      isEventOnSequenceItem &&
      this.selectionStarted &&
      this.mousemoveCounter > 1
    ) {
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
      const moveCaretOperation = new RestoreSequenceCaretPositionOperation(
        this.selectionStartCaretPosition,
        SequenceRenderer.caretPosition,
      );
      modelChanges.addOperation(moveCaretOperation);
      editor.renderersContainer.update(modelChanges);
    }

    if (this.selectionStarted) {
      this.mousemoveCounter++;
    }
  }

  mouseup() {
    if (this.selectionStarted) {
      this.selectionStarted = false;
    }

    if (this.isEditMode) {
      SequenceRenderer.resetLastUserDefinedCaretPosition();
    }
    this.mousemoveCounter = 0;
  }

  private bondNodesThroughNewPhosphate(
    position: Vec2,
    previousMonomer: BaseMonomer,
    nextMonomer?: BaseMonomer,
    phosphate?: string,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      phosphate || RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );

    assert(phosphateLibraryItem);

    const modelChanges = editor.drawingEntitiesManager.addMonomer(
      phosphateLibraryItem,
      position,
    );

    const additionalPhosphate = modelChanges.operations[0]
      .monomer as BaseMonomer;

    modelChanges.merge(
      this.tryToCreatePolymerBond(previousMonomer, additionalPhosphate),
    );

    if (nextMonomer) {
      modelChanges.merge(
        this.tryToCreatePolymerBond(additionalPhosphate, nextMonomer),
      );
    }

    return modelChanges;
  }

  private handlePeptideNodeAddition(
    enteredSymbol: string,
    newNodePosition: Vec2,
  ) {
    if (!peptideNaturalAnalogues.includes(enteredSymbol)) {
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
    const newPeptideNode = new MonomerSequenceNode(newPeptide);

    modelChanges.merge(peptideAddCommand);

    modelChanges.merge(this.insertNewSequenceFragment(newPeptideNode));

    return modelChanges;
  }

  private handleRnaDnaNodeAddition(
    enteredSymbol: string,
    currentNode: SubChainNode,
    newNodePosition: Vec2,
  ) {
    if (!rnaDnaNaturalAnalogues.includes(enteredSymbol)) {
      return undefined;
    }

    const modelChanges = new Command();
    const { modelChanges: addedNodeModelChanges, node: nodeToAdd } =
      currentNode instanceof Nucleotide || currentNode instanceof Nucleoside
        ? Nucleotide.createOnCanvas(enteredSymbol, newNodePosition)
        : Nucleoside.createOnCanvas(enteredSymbol, newNodePosition);

    modelChanges.merge(addedNodeModelChanges);

    modelChanges.merge(this.insertNewSequenceFragment(nodeToAdd));

    return modelChanges;
  }

  private connectNodes(
    firstNodeToConnect: SubChainNode | undefined,
    secondNodeToConnect: SubChainNode | undefined,
    modelChanges: Command,
    newNodePosition: Vec2,
    nextNodeInSameChain?: SubChainNode,
  ) {
    if (
      !firstNodeToConnect ||
      firstNodeToConnect instanceof EmptySequenceNode ||
      !secondNodeToConnect ||
      secondNodeToConnect instanceof EmptySequenceNode
    ) {
      return;
    }

    const editor = CoreEditor.provideEditorInstance();
    const nodeR2Bond =
      firstNodeToConnect.lastMonomerInNode.attachmentPointsToBonds?.R2;
    const nextNodeR1Bond =
      secondNodeToConnect?.firstMonomerInNode?.attachmentPointsToBonds.R1;

    if (nodeR2Bond || nextNodeR1Bond) {
      editor.events.error.dispatch(
        'No available attachment points to establish bonds for merge.',
      );

      return;
    }

    if (
      nextNodeInSameChain instanceof EmptySequenceNode &&
      firstNodeToConnect instanceof Nucleoside &&
      (secondNodeToConnect instanceof Nucleotide ||
        secondNodeToConnect instanceof Nucleoside)
    ) {
      modelChanges.merge(
        this.bondNodesThroughNewPhosphate(
          newNodePosition,
          firstNodeToConnect.lastMonomerInNode,
          secondNodeToConnect.firstMonomerInNode,
        ),
      );
    } else {
      modelChanges.merge(
        this.tryToCreatePolymerBond(
          firstNodeToConnect.lastMonomerInNode,
          secondNodeToConnect.firstMonomerInNode,
        ),
      );
    }
  }

  private deleteBondToNextNodeInChain(
    node: SubChainNode | undefined,
    modelChanges: Command,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nodeR2Bond = node?.lastMonomerInNode.attachmentPointsToBonds.R2;

    if (!nodeR2Bond) {
      return;
    }

    modelChanges.merge(
      editor.drawingEntitiesManager.deletePolymerBond(nodeR2Bond),
    );
  }

  private finishNodesDeletion(
    modelChanges: Command,
    previousCaretPosition: number,
    newCaretPosition?: number,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const moveCaretOperation = new RestoreSequenceCaretPositionOperation(
      previousCaretPosition,
      isNumber(newCaretPosition)
        ? newCaretPosition
        : SequenceRenderer.caretPosition,
    );
    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    modelChanges.addOperation(moveCaretOperation);
    history.update(modelChanges);
    this.selectionStartCaretPosition = -1;
    SequenceRenderer.resetLastUserDefinedCaretPosition();
  }

  private tryToCreatePolymerBond(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
  ) {
    const editor = CoreEditor.provideEditorInstance();

    const isConnectionPossible = this.areR1R2Free(secondMonomer, firstMonomer);

    if (!isConnectionPossible) {
      this.showMergeWarningModal();
      return new Command();
    }

    return editor.drawingEntitiesManager.createPolymerBond(
      firstMonomer,
      secondMonomer,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
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
      const nodeInSameChainAfterSelection =
        SequenceRenderer.getNextNodeInSameChain(selectionEndNode);

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
        nodeBeforeSelection === nodeInSameChainBeforeSelection &&
        nodeBeforeSelection instanceof Nucleotide &&
        !(nodeInSameChainAfterSelection instanceof Nucleotide) &&
        !(nodeInSameChainAfterSelection instanceof Nucleoside)
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
        nodeAfterSelection instanceof EmptySequenceNode ||
        (!this.isEditMode &&
          (nodeAfterSelection !== nodeInSameChainAfterSelection ||
            nodeBeforeSelection !== nodeInSameChainBeforeSelection))
      ) {
        return;
      }

      if (
        nodeBeforeSelection instanceof Nucleoside &&
        nodeAfterSelection instanceof Nucleotide
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
          this.tryToCreatePolymerBond(
            isPhosphateAdditionalyDeleted
              ? nodeBeforeSelection.firstMonomerInNode
              : nodeBeforeSelection.lastMonomerInNode,
            nodeAfterSelection.firstMonomerInNode,
          ),
        );
      }
    });

    return modelChanges;
  }

  get keyboardEventHandlers() {
    const deleteNode = (direction: Direction) => {
      const editor = CoreEditor.provideEditorInstance();
      const nodeToDelete =
        direction === Direction.Left
          ? SequenceRenderer.previousNode
          : SequenceRenderer.getNodeByPointer(SequenceRenderer.caretPosition);
      const caretPosition =
        direction === Direction.Left
          ? (SequenceRenderer.previousCaretPosition as number)
          : SequenceRenderer.caretPosition;
      const selections = SequenceRenderer.selections;
      const modelChanges = new Command();
      let nodesToDelete: NodesSelection;

      if (selections.length) {
        modelChanges.merge(this.deleteSelectedDrawingEntities());
        nodesToDelete = selections;
      } else if (nodeToDelete) {
        nodeToDelete.monomers.forEach((monomer) => {
          modelChanges.merge(
            editor.drawingEntitiesManager.deleteMonomer(monomer),
          );
        });
        nodesToDelete = [
          [
            {
              node: nodeToDelete,
              nodeIndexOverall: caretPosition,
            },
          ],
        ];
      } else {
        return;
      }

      modelChanges.merge(this.handleNodesDeletion(nodesToDelete));

      this.finishNodesDeletion(
        modelChanges,
        nodesToDelete[0][0].nodeIndexOverall,
        nodesToDelete[0][0].nodeIndexOverall,
      );

      if (
        SequenceRenderer.caretPosition === 0 &&
        SequenceRenderer.chainsCollection.chains.length === 0
      ) {
        this.startNewSequence();
      }
    };

    return {
      delete: {
        shortcut: ['Delete'],
        handler: () => deleteNode(Direction.Right),
      },
      backspace: {
        shortcut: ['Backspace'],
        handler: () => deleteNode(Direction.Left),
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
      'move-caret-up': {
        shortcut: ['ArrowUp'],
        handler: () => {
          SequenceRenderer.moveCaretUp();
        },
      },
      'move-caret-down': {
        shortcut: ['ArrowDown'],
        handler: () => {
          SequenceRenderer.moveCaretDown();
        },
      },
      'move-caret-forward': {
        shortcut: ['ArrowRight'],
        handler: () => {
          if (!this.isEditMode) {
            return;
          }
          SequenceRenderer.moveCaretForward();
          SequenceRenderer.resetLastUserDefinedCaretPosition();
        },
      },
      'move-caret-back': {
        shortcut: ['ArrowLeft'],
        handler: () => {
          if (!this.isEditMode) {
            return;
          }
          SequenceRenderer.moveCaretBack();
          SequenceRenderer.resetLastUserDefinedCaretPosition();
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
          if (
            SequenceRenderer.chainsCollection.length === 1 &&
            SequenceRenderer.chainsCollection.firstNode instanceof
              EmptySequenceNode &&
            !this.isEditMode
          ) {
            this.turnOnEditMode();
            SequenceRenderer.setCaretPosition(0);
          }

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

          modelChanges.addOperation(new ReinitializeModeOperation());
          editor.renderersContainer.update(modelChanges);
          modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          history.update(modelChanges);
        },
      },
      'sequence-edit-select': {
        shortcut: [
          'Shift+ArrowLeft',
          'Shift+ArrowRight',
          'Shift+ArrowUp',
          'Shift+ArrowDown',
        ],
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

          if (arrowKey === 'ArrowLeft' || arrowKey === 'ArrowRight') {
            SequenceRenderer.resetLastUserDefinedCaretPosition();
          }
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

  isPasteAllowedByMode(drawingEntitiesManager: DrawingEntitiesManager) {
    const editor = CoreEditor.provideEditorInstance();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManager.monomers.values(),
    ]);
    if (!this.isEditMode) {
      return true;
    }

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

    return true;
  }

  private isR1Free(entity: SubChainNode | BaseMonomer): boolean {
    if (entity instanceof BaseMonomer) {
      return entity.attachmentPointsToBonds.R1 === null;
    }

    return entity?.firstMonomerInNode?.attachmentPointsToBonds?.R1 === null;
  }

  private isR2Free(entity: SubChainNode | BaseMonomer): boolean {
    if (entity instanceof BaseMonomer) {
      return entity.attachmentPointsToBonds.R2 === null;
    }

    return entity?.lastMonomerInNode?.attachmentPointsToBonds?.R2 === null;
  }

  private areR1R2Free(
    firstEntity: SubChainNode | BaseMonomer,
    lastEntity: SubChainNode | BaseMonomer,
  ): boolean {
    return this.isR1Free(firstEntity) && this.isR2Free(lastEntity);
  }

  private isConnectionPossible(
    firstMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: AttachmentPointName,
    secondMonomer: BaseMonomer,
    secondMonomerAttachmentPoint: AttachmentPointName,
  ) {
    return (
      firstMonomer.attachmentPointsToBonds[firstMonomerAttachmentPoint] ===
        null &&
      secondMonomer.attachmentPointsToBonds[secondMonomerAttachmentPoint] ===
        null
    );
  }

  isPasteAvailable(drawingEntitiesManager: DrawingEntitiesManager) {
    if (!this.isEditMode) {
      return true;
    }
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManager.monomers.values(),
    ]);
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
    const lastNodeOfNewFragment = chainsCollection.lastNode;
    const firstNodeOfNewFragment = chainsCollection.firstNode;
    const isPasteInEnd =
      currentNode instanceof EmptySequenceNode || !currentNode;
    const isPasteInStart = !previousNodeInSameChain;
    if (isPasteInEnd && !previousNodeInSameChain) return true;
    if (isPasteInEnd) {
      return (
        this.isR1Free(firstNodeOfNewFragment) &&
        this.isR2Free(previousNodeInSameChain)
      );
    }
    if (isPasteInStart) {
      return this.isR2Free(lastNodeOfNewFragment) && this.isR1Free(currentNode);
    }
    return this.areR1R2Free(firstNodeOfNewFragment, lastNodeOfNewFragment);
  }

  applyAdditionalPasteOperations(
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    if (!this.isEditMode) {
      const command = new Command();

      command.addOperation(new ReinitializeModeOperation());

      return command;
    }

    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManager.monomers.values(),
    ]);

    const currentSequence = SequenceRenderer.currentChain;

    const currentSequenceHasPhosphate =
      currentSequence?.lastNonEmptyNode?.monomer?.monomerItem?.props?.Name ===
      'Phosphate';

    let nextCaretPosition =
      SequenceRenderer.caretPosition + chainsCollection.length;

    if (currentSequenceHasPhosphate) {
      nextCaretPosition -= 1;
    }

    const modelChanges = this.insertNewSequenceFragment(chainsCollection);

    modelChanges.addOperation(new ReinitializeModeOperation());

    modelChanges.addOperation(
      new RestoreSequenceCaretPositionOperation(
        SequenceRenderer.caretPosition,
        nextCaretPosition,
      ),
    );

    return modelChanges;
  }

  private preserveSideChainConnections(selection: NodeSelection) {
    if (selection.node.monomer.sideConnections.length === 0) {
      return null;
    }

    const sideConnectionsData: Array<{
      firstMonomerAttachmentPointName: AttachmentPointName;
      secondMonomer: BaseMonomer;
      secondMonomerAttachmentPointName: AttachmentPointName;
    }> = [];

    Object.entries(selection.node.monomer.attachmentPointsToBonds).forEach(
      ([key, bond]) => {
        if (!bond || !bond.isSideChainConnection) {
          return;
        }

        const secondMonomer = bond.getAnotherMonomer(selection.node.monomer);
        if (!secondMonomer?.attachmentPointsToBonds) {
          return;
        }

        const secondMonomerBondData = Object.entries(
          secondMonomer?.attachmentPointsToBonds,
        ).find(([, value]) => value === bond);

        if (!secondMonomerBondData) {
          return;
        }

        const [secondMonomerAttachmentPointName] = secondMonomerBondData;

        sideConnectionsData.push({
          firstMonomerAttachmentPointName: key as AttachmentPointName,
          secondMonomer,
          secondMonomerAttachmentPointName:
            secondMonomerAttachmentPointName as AttachmentPointName,
        });
      },
    );

    return sideConnectionsData;
  }

  private replaceSelectionWithMonomer(
    monomerItem: MonomerItemType,
    selection: NodeSelection,
    modelChanges: Command,
    previousSelectionNode?: SubChainNode,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nextNode = SequenceRenderer.getNextNodeInSameChain(selection.node);
    const position = selection.node.monomer.position;
    const sideChainConnections = this.preserveSideChainConnections(selection);
    const hasPreviousNodeInChain =
      selection.node.firstMonomerInNode.attachmentPointsToBonds.R1;
    const hasNextNodeInChain =
      selection.node.lastMonomerInNode.attachmentPointsToBonds.R2;

    selection.node.monomers.forEach((monomer) => {
      modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
      monomer.forEachBond((polymerBond) => {
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(polymerBond),
        );
      });
    });

    const monomerAddCommand = editor.drawingEntitiesManager.addMonomer(
      monomerItem,
      position,
    );
    const newMonomer = monomerAddCommand.operations[0].monomer as BaseMonomer;
    const newMonomerSequenceNode = new MonomerSequenceNode(newMonomer);

    modelChanges.merge(monomerAddCommand);
    modelChanges.merge(
      this.insertNewSequenceFragment(
        newMonomerSequenceNode,
        nextNode || null,
        previousSelectionNode,
        Boolean(hasPreviousNodeInChain),
        Boolean(hasNextNodeInChain),
      ),
    );

    // TODO: Check for multiple side chain connections in Linkers
    sideChainConnections?.forEach((sideConnectionData) => {
      const {
        firstMonomerAttachmentPointName,
        secondMonomer,
        secondMonomerAttachmentPointName,
      } = sideConnectionData;
      if (
        !this.isConnectionPossible(
          newMonomer,
          firstMonomerAttachmentPointName,
          secondMonomer,
          secondMonomerAttachmentPointName,
        )
      ) {
        return;
      }

      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          newMonomer,
          secondMonomer,
          firstMonomerAttachmentPointName,
          secondMonomerAttachmentPointName,
        ),
      );
    });

    return newMonomerSequenceNode;
  }

  private replaceSelectionsWithMonomer(
    selections: NodesSelection,
    monomerItem: MonomerItemType,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      let previousReplacedNode = SequenceRenderer.getPreviousNodeInSameChain(
        selectionRange[0].node,
      );

      selectionRange.forEach((nodeSelection) => {
        if (nodeSelection.node instanceof EmptySequenceNode) {
          return;
        }

        previousReplacedNode = this.replaceSelectionWithMonomer(
          monomerItem,
          nodeSelection,
          modelChanges,
          previousReplacedNode,
        );
      });
    });

    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    modelChanges.setUndoOperationReverse();
    modelChanges.setUndoOperationsByPriority();
    history.update(modelChanges);
  }

  private checkIfNewMonomerCouldEstablishConnections(
    nodeSelection: NodeSelection,
    monomerItem: MonomerItemType | undefined,
    sideChainConnections?: boolean,
  ) {
    if (!monomerItem?.attachmentPoints) {
      return false;
    }

    const newMonomerAttachmentPoints =
      BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
        monomerItem.attachmentPoints,
      );
    // Side chains
    // node.selection.node.monomers.attachmentPoints
    const oldMonomerBonds: [string, PolymerBond | null][] = sideChainConnections
      ? Object.entries(nodeSelection.node.monomer.attachmentPointsToBonds)
      : [
          [
            AttachmentPointName.R1 as string,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nodeSelection.node.firstMonomerInNode.attachmentPointsToBonds.R1!,
          ],
          [
            AttachmentPointName.R2 as string,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nodeSelection.node.lastMonomerInNode.attachmentPointsToBonds.R2!,
          ],
        ];
    // Backbone
    // nodeSelection.node.firstMonomerInNode.attachmentPointsToBonds.R1
    // nodeSelection.node.lastMonomerInNode.attachmentPointsToBonds.R2
    return oldMonomerBonds.every(([key, bond]) => {
      if (
        !bond ||
        (sideChainConnections
          ? !bond.isSideChainConnection
          : !bond.isBackBoneChainConnection)
      ) {
        return true;
      }

      return newMonomerAttachmentPoints.attachmentPointsList.includes(
        key as AttachmentPointName,
      );
    });
  }

  private selectionsContainLinkerNode(selections: NodesSelection) {
    return selections.some((selectionRange) =>
      selectionRange.some(
        (nodeSelection) => nodeSelection.node instanceof LinkerSequenceNode,
      ),
    );
  }

  private selectionsCantPreserveConnectionsWithMonomer(
    selections: NodesSelection,
    monomerItem: MonomerItemType,
    sideChainConnections?: boolean,
  ) {
    return selections.some((selectionRange) =>
      selectionRange.some(
        (nodeSelection) =>
          !this.checkIfNewMonomerCouldEstablishConnections(
            nodeSelection,
            monomerItem,
            sideChainConnections,
          ),
      ),
    );
  }

  private presetHasNeededAttachmentPoints(preset) {
    // TODO: This check is not universal, it won't allow to put presets without R1 in sugar, revisit later
    if (!preset.sugar) {
      return false;
    }

    const sugarHasR1 = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
      preset.sugar.attachmentPoints,
    ).attachmentPointsList.includes(AttachmentPointName.R1);

    if (preset.phosphate) {
      const phosphateHasR2 =
        BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
          preset.phosphate.attachmentPoints,
        ).attachmentPointsList.includes(AttachmentPointName.R2);

      return sugarHasR1 && phosphateHasR2;
    }

    return sugarHasR1;
  }

  private selectionsCantPreserveConnectionsWithPreset(
    selections: NodesSelection,
    preset: IRnaPreset,
    sideChainConnections?: boolean,
  ) {
    return selections.some((selectionRange) =>
      selectionRange.some((nodeSelection) =>
        [preset.sugar, preset.base, preset.phosphate].some(
          (monomer) =>
            monomer &&
            !this.checkIfNewMonomerCouldEstablishConnections(
              nodeSelection,
              monomer,
              sideChainConnections,
            ),
        ),
      ),
    );
  }

  public insertMonomerFromLibrary(monomerItem: MonomerItemType) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();
    const selections = SequenceRenderer.selections;

    if (selections.length > 0) {
      if (
        this.selectionsCantPreserveConnectionsWithMonomer(
          selections,
          monomerItem,
        )
      ) {
        this.showMergeWarningModal();
        return;
      }

      if (this.selectionsContainLinkerNode(selections)) {
        editor.events.openConfirmationDialog.dispatch({
          confirmationText:
            'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
          onConfirm: () => {
            this.replaceSelectionsWithMonomer(selections, monomerItem);
          },
        });
      } else if (
        this.selectionsCantPreserveConnectionsWithMonomer(
          selections,
          monomerItem,
          true,
        )
      ) {
        editor.events.openConfirmationDialog.dispatch({
          confirmationText:
            'Side chain connections will be deleted during replacement. Do you want to proceed?',
          onConfirm: () => {
            this.replaceSelectionsWithMonomer(selections, monomerItem);
          },
        });
      } else {
        this.replaceSelectionsWithMonomer(selections, monomerItem);
      }
    } else {
      const newNodePosition = this.getNewNodePosition();

      const monomerAddCommand = editor.drawingEntitiesManager.addMonomer(
        monomerItem,
        newNodePosition,
      );
      const newMonomer = monomerAddCommand.operations[0].monomer as BaseMonomer;
      const newMonomerSequenceNode = new MonomerSequenceNode(newMonomer);

      modelChanges.merge(monomerAddCommand);
      modelChanges.merge(
        this.insertNewSequenceFragment(newMonomerSequenceNode),
      );

      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      SequenceRenderer.moveCaretForward();
      history.update(modelChanges);
    }
  }

  private createRnaPresetNode(preset: IRnaPreset, position: Vec2) {
    const editor = CoreEditor.provideEditorInstance();
    const { base: rnaBase, sugar, phosphate } = preset;

    if (!sugar) {
      return;
    }

    const rnaPresetAddResult = editor.drawingEntitiesManager.addRnaPreset({
      sugar,
      sugarPosition: position,
      rnaBase,
      rnaBasePosition: position,
      phosphate,
      phosphatePosition: position,
    });

    const sugarMonomer = rnaPresetAddResult.monomers.find(
      (monomer) => monomer instanceof Sugar,
    ) as Sugar;
    const rnaBaseMonomer = rnaPresetAddResult.monomers.find(
      (monomer) => monomer instanceof RNABase,
    ) as RNABase;
    const phosphateMonomer = rnaPresetAddResult.monomers.find(
      (monomer) => monomer instanceof Phosphate,
    ) as Phosphate;

    let newPresetNode: Nucleotide | Nucleoside | LinkerSequenceNode;

    if (!rnaBase) {
      newPresetNode = new LinkerSequenceNode(sugarMonomer);
    } else if (!phosphateMonomer) {
      newPresetNode = new Nucleoside(sugarMonomer, rnaBaseMonomer);
    } else {
      newPresetNode = new Nucleotide(
        sugarMonomer,
        rnaBaseMonomer,
        phosphateMonomer,
      );
    }

    return {
      newPresetNode,
      rnaPresetAddModelChanges: rnaPresetAddResult.command,
    };
  }

  private replaceSelectionWithPreset(
    preset: IRnaPreset,
    selection: NodeSelection,
    modelChanges: Command,
    previousSelectionNode?: SubChainNode,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nextNode = SequenceRenderer.getNextNodeInSameChain(selection.node);
    const position = selection.node.monomer.position;
    const hasPreviousNodeInChain =
      selection.node.firstMonomerInNode.attachmentPointsToBonds.R1;
    const hasNextNodeInChain =
      selection.node.lastMonomerInNode.attachmentPointsToBonds.R2;

    const sideChainConnections = this.preserveSideChainConnections(selection);

    selection.node.monomers.forEach((monomer) => {
      modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
      monomer.forEachBond((polymerBond) => {
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(polymerBond),
        );
      });
    });

    const rnaAdditionResult = this.createRnaPresetNode(preset, position);

    if (!rnaAdditionResult) {
      return;
    }

    const { newPresetNode, rnaPresetAddModelChanges } = rnaAdditionResult;

    modelChanges.merge(rnaPresetAddModelChanges);
    modelChanges.merge(
      this.insertNewSequenceFragment(
        newPresetNode,
        nextNode || null,
        previousSelectionNode,
        Boolean(hasPreviousNodeInChain),
        Boolean(hasNextNodeInChain),
      ),
    );

    // TODO: This check breaks some side chains (e.g. Sugar-to-Sugar for Nucleotides), need another way of preserving connections
    const monomerForSideConnections =
      newPresetNode instanceof Nucleotide
        ? newPresetNode.phosphate
        : newPresetNode instanceof Nucleoside
        ? newPresetNode.sugar
        : newPresetNode.monomer;

    sideChainConnections?.forEach((sideConnectionData) => {
      const {
        firstMonomerAttachmentPointName,
        secondMonomer,
        secondMonomerAttachmentPointName,
      } = sideConnectionData;
      if (
        !this.isConnectionPossible(
          monomerForSideConnections,
          firstMonomerAttachmentPointName,
          secondMonomer,
          secondMonomerAttachmentPointName,
        )
      ) {
        return;
      }

      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          monomerForSideConnections,
          secondMonomer,
          firstMonomerAttachmentPointName,
          secondMonomerAttachmentPointName,
        ),
      );
    });

    return newPresetNode;
  }

  private replaceSelectionsWithPreset(
    selections: NodesSelection,
    preset: IRnaPreset,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      let previousReplacedNode = SequenceRenderer.getPreviousNodeInSameChain(
        selectionRange[0].node,
      );

      selectionRange.forEach((nodeSelection) => {
        if (nodeSelection.node instanceof EmptySequenceNode) {
          return;
        }

        previousReplacedNode = this.replaceSelectionWithPreset(
          preset,
          nodeSelection,
          modelChanges,
          previousReplacedNode,
        );
      });
    });

    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    modelChanges.setUndoOperationReverse();
    modelChanges.setUndoOperationsByPriority();
    history.update(modelChanges);
  }

  public insertPresetFromLibrary(preset: IRnaPreset) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();
    const selections = SequenceRenderer.selections;

    if (selections.length > 0) {
      if (!this.presetHasNeededAttachmentPoints(preset)) {
        this.showMergeWarningModal();
        return;
      }

      if (this.selectionsContainLinkerNode(selections)) {
        editor.events.openConfirmationDialog.dispatch({
          confirmationText:
            'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
          onConfirm: () => {
            this.replaceSelectionsWithPreset(selections, preset);
          },
        });
      } else if (
        this.selectionsCantPreserveConnectionsWithPreset(
          selections,
          preset,
          true,
        )
      ) {
        editor.events.openConfirmationDialog.dispatch({
          confirmationText:
            'Side chain connections will be deleted during replacement. Do you want to proceed?',
          onConfirm: () => {
            this.replaceSelectionsWithPreset(selections, preset);
          },
        });
      } else {
        this.replaceSelectionsWithPreset(selections, preset);
      }
    } else {
      const newNodePosition = this.getNewNodePosition();

      const rnaAdditionResult = this.createRnaPresetNode(
        preset,
        newNodePosition,
      );

      if (!rnaAdditionResult) {
        return;
      }

      modelChanges.merge(rnaAdditionResult.rnaPresetAddModelChanges);
      modelChanges.merge(
        this.insertNewSequenceFragment(rnaAdditionResult.newPresetNode),
      );

      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      SequenceRenderer.moveCaretForward();
      history.update(modelChanges);
    }
  }

  private insertNewSequenceItem(editor: CoreEditor, enteredSymbol: string) {
    const currentNode = SequenceRenderer.currentEdittingNode;
    const newNodePosition = this.getNewNodePosition();
    let modelChanges;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;

    if (
      currentNode instanceof MonomerSequenceNode &&
      currentNode.monomer instanceof Phosphate
    ) {
      return;
    }

    if (currentNode instanceof EmptySequenceNode && previousNodeInSameChain) {
      if (!this.isR2Free(previousNodeInSameChain)) {
        this.showMergeWarningModal();
        return;
      }
    }
    if (
      !previousNodeInSameChain &&
      !(currentNode instanceof EmptySequenceNode) &&
      currentNode
    ) {
      if (!this.isR1Free(currentNode)) {
        this.showMergeWarningModal();
        return;
      }
    }
    if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
      modelChanges = this.handlePeptideNodeAddition(
        enteredSymbol,
        newNodePosition,
      );
    } else {
      modelChanges = this.handleRnaDnaNodeAddition(
        enteredSymbol,
        currentNode,
        newNodePosition,
      );
    }
    return modelChanges;
  }

  private showMergeWarningModal() {
    const editor = CoreEditor.provideEditorInstance();

    editor.events.openErrorModal.dispatch({
      errorTitle: 'Error Message',
      errorMessage:
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
    });
  }

  private insertNewSequenceFragment(
    chainsCollectionOrNode: ChainsCollection | SubChainNode,
    nextNodeToConnect?: SubChainNode | null,
    previousNodeToConnect?: SubChainNode,
    needConnectWithPreviousNodeInChain = true,
    needConnectWithNextNodeInChain = true,
  ) {
    const chainsCollection =
      chainsCollectionOrNode instanceof ChainsCollection
        ? chainsCollectionOrNode
        : new ChainsCollection().add(
            new Chain().addNode(chainsCollectionOrNode),
          );
    const currentNode =
      nextNodeToConnect === null
        ? undefined
        : nextNodeToConnect || SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain =
      previousNodeToConnect || SequenceRenderer.previousNodeInSameChain;
    const modelChanges = new Command();
    const lastNodeOfNewFragment = chainsCollection.lastNode;
    const firstNodeOfNewFragment = chainsCollection.firstNode;
    const newNodePosition = this.getNewNodePosition();

    this.deleteBondToNextNodeInChain(previousNodeInSameChain, modelChanges);

    if (needConnectWithPreviousNodeInChain) {
      this.connectNodes(
        previousNodeInSameChain,
        firstNodeOfNewFragment,
        modelChanges,
        newNodePosition,
        currentNode,
      );
    }

    if (needConnectWithNextNodeInChain) {
      this.connectNodes(
        lastNodeOfNewFragment,
        currentNode,
        modelChanges,
        newNodePosition,
      );
    }

    return modelChanges;
  }

  getNewNodePosition() {
    if (this.isEditMode) {
      const currentNode = SequenceRenderer.currentEdittingNode;
      const previousNode = SequenceRenderer.previousFromCurrentEdittingMonomer;
      const nodeBeforePreviousNode = previousNode
        ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
        : undefined;
      const newNodePosition = this.getNewSequenceItemPosition(
        previousNode,
        nodeBeforePreviousNode,
        currentNode,
      );
      return newNodePosition;
    } else {
      return SequenceRenderer.chainsCollection.chains.length > 0
        ? SequenceRenderer.getNextChainPosition()
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
    currentNode?: SubChainNode,
  ) {
    const offsetFromPrevious = new Vec2(1, 1);

    if (previousNode && !(previousNode instanceof EmptySequenceNode)) {
      return previousNode.lastMonomerInNode.position.add(offsetFromPrevious);
    } else if (currentNode && !(currentNode instanceof EmptySequenceNode)) {
      return currentNode.firstMonomerInNode.position.add(offsetFromPrevious);
    } else if (nodeBeforePreviousNode) {
      return nodeBeforePreviousNode.lastMonomerInNode.position.add(
        offsetFromPrevious,
      );
    } else {
      return new Vec2(0, 0);
    }
  }

  scrollForView() {
    if (this.isEditMode) {
      return;
    }

    const zoom = ZoomTool.instance;
    const drawnEntitiesBoundingBox =
      SequenceRenderer.getRenderedStructuresBbox();

    if (zoom.isFitToCanvasHeight(drawnEntitiesBoundingBox.height)) {
      zoom.scrollTo(
        new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top),
      );
    } else {
      zoom.scrollTo(
        new Vec2(
          drawnEntitiesBoundingBox.left,
          drawnEntitiesBoundingBox.bottom,
        ),
        true,
      );
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
    SequenceRenderer.removeNewSequenceButtons();
  }
}
