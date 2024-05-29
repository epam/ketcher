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
import { BaseMonomer, Phosphate, SequenceType, Vec2 } from 'domain/entities';
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
import { LabeledNodesWithPositionInSequence } from 'application/editor/tools/Tool';

const naturalAnalogues = uniq([
  ...rnaDnaNaturalAnalogues,
  ...peptideNaturalAnalogues,
]);

enum Direction {
  Left = 'left',
  Right = 'right',
}

export class SequenceMode extends BaseMode {
  private _isEditMode = false;
  private _isEditInRNABuilderMode = false;
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

  public startNewSequence() {
    if (!this.isEditMode) {
      this.turnOnEditMode();
    }

    if (!SequenceRenderer.hasNewChain) {
      SequenceRenderer.startNewSequence();
    }

    SequenceRenderer.moveCaretToNewChain();
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
      SequenceRenderer.resetLastUserDefinedCaretPosition();
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
      const moveCaretOperation = new RestoreSequenceCaretPositionOperation(
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

    if (this.isEditMode) {
      SequenceRenderer.resetLastUserDefinedCaretPosition();
    }
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
      editor.drawingEntitiesManager.createPolymerBond(
        previousMonomer,
        additionalPhosphate,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ),
    );

    if (nextMonomer) {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          additionalPhosphate,
          nextMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
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
    node: SubChainNode | undefined,
    nextNode: SubChainNode | undefined,
    modelChanges: Command,
    newNodePosition: Vec2,
  ) {
    if (
      !node ||
      node instanceof EmptySequenceNode ||
      !nextNode ||
      nextNode instanceof EmptySequenceNode
    ) {
      return;
    }

    const editor = CoreEditor.provideEditorInstance();
    const nodeR2Bond = node.lastMonomerInNode.attachmentPointsToBonds?.R2;
    const nextNodeR1Bond =
      nextNode?.firstMonomerInNode?.attachmentPointsToBonds.R1;

    if (nodeR2Bond || nextNodeR1Bond) {
      editor.events.error.dispatch(
        'No available attachment points to establish bonds for merge.',
      );

      return;
    }

    if (
      node instanceof Nucleoside &&
      (nextNode instanceof Nucleotide || nextNode instanceof Nucleoside)
    ) {
      modelChanges.merge(
        this.bondNodesThroughNewPhosphate(
          newNodePosition,
          node.lastMonomerInNode,
          nextNode.firstMonomerInNode,
        ),
      );
    } else {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          node.lastMonomerInNode,
          nextNode.firstMonomerInNode,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
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

  private isR1Free(firstNode: SubChainNode): boolean {
    return firstNode?.firstMonomerInNode?.attachmentPointsToBonds?.R1 === null;
  }

  private isR2Free(lastNode: SubChainNode): boolean {
    return lastNode?.lastMonomerInNode?.attachmentPointsToBonds.R2 === null;
  }

  private areR1R2Free(
    firstNode: SubChainNode,
    lastNode: SubChainNode,
  ): boolean {
    return this.isR1Free(firstNode) && this.isR2Free(lastNode);
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
    const isPasteInEnd = currentNode instanceof EmptySequenceNode;
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
    const modelChanges = this.insertNewSequenceFragment(chainsCollection);

    modelChanges.addOperation(new ReinitializeModeOperation());

    modelChanges.addOperation(
      new RestoreSequenceCaretPositionOperation(
        SequenceRenderer.caretPosition,
        SequenceRenderer.caretPosition + chainsCollection.length,
      ),
    );

    return modelChanges;
  }

  private insertNewSequenceItem(editor: CoreEditor, enteredSymbol: string) {
    const currentNode = SequenceRenderer.currentEdittingNode;
    const newNodePosition = this.getNewNodePosition();
    let modelChanges;

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

  private insertNewSequenceFragment(
    chainsCollectionOrNode: ChainsCollection | SubChainNode,
  ) {
    const chainsCollection =
      chainsCollectionOrNode instanceof ChainsCollection
        ? chainsCollectionOrNode
        : new ChainsCollection().add(
            new Chain().addNode(chainsCollectionOrNode),
          );
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
    const modelChanges = new Command();
    const lastNodeOfNewFragment = chainsCollection.lastNode;
    const firstNodeOfNewFragment = chainsCollection.firstNode;
    const newNodePosition = this.getNewNodePosition();

    this.deleteBondToNextNodeInChain(previousNodeInSameChain, modelChanges);

    this.connectNodes(
      previousNodeInSameChain,
      firstNodeOfNewFragment,
      modelChanges,
      newNodePosition,
    );

    this.connectNodes(
      lastNodeOfNewFragment,
      currentNode,
      modelChanges,
      newNodePosition,
    );

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
  }
}
