import { CoreEditor, EditorHistory } from 'application/editor/internal';
import {
  isTwoStrandedNodeRestrictedForHydrogenBondCreation,
  LayoutMode,
} from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  SequenceRenderer,
  TwoStrandedNodesSelection,
} from 'application/render/renderers/sequence/SequenceRenderer';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Command } from 'domain/entities/Command';
import {
  AmbiguousMonomer,
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
  getSugarBySequenceType,
} from 'domain/helpers/rna';
import {
  peptideNaturalAnalogues,
  RNA_DNA_NON_MODIFIED_PART,
  rnaDnaNaturalAnalogues,
  RnaDnaNaturalAnaloguesEnum,
} from 'domain/constants/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { isNumber, uniq } from 'lodash';
import {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import {
  IRnaPreset,
  LabeledNodesWithPositionInSequence,
} from 'application/editor/tools/Tool';
import { NewSequenceButton } from 'application/render/renderers/sequence/ui-controls/NewSequenceButton';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { STRAND_TYPE } from 'domain/constants';
import { getNodeFromTwoStrandedNode } from 'domain/helpers/chains';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor';
import { KetMonomerClass } from 'application/formatters';

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

interface PreservedHydrogenBonds {
  toMonomer: BaseMonomer;
  fromMonomer: BaseMonomer;
}

export class SequenceMode extends BaseMode {
  private _isEditMode = false;
  private _isEditInRNABuilderMode = false;
  private _isAntisenseEditMode = false;
  private _isSyncEditMode = true;
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

  public get isAntisenseEditMode() {
    return this._isAntisenseEditMode;
  }

  public get isSyncEditMode() {
    return this._isSyncEditMode;
  }

  private get needToEditSense() {
    return this.isSyncEditMode || !this.isAntisenseEditMode;
  }

  private get needToEditAntisense() {
    return this.isSyncEditMode || this.isAntisenseEditMode;
  }

  private turnOnAntisenseEditMode() {
    this._isAntisenseEditMode = true;
    this.initialize(false, false, false);
  }

  private turnOffAntisenseEditMode() {
    this._isAntisenseEditMode = false;
    this.initialize(false, false, false);
  }

  private setAntisenseEditMode(isAntisenseEditMode) {
    this._isAntisenseEditMode = isAntisenseEditMode;
    this.initialize(false, false, false);
  }

  public turnOnSyncEditMode() {
    this._isSyncEditMode = true;
    this.initialize(false, false, false);
  }

  public turnOffSyncEditMode() {
    this._isSyncEditMode = false;
    this.initialize(false, false, false);
  }

  public resetEditMode() {
    this.turnOffAntisenseEditMode();
    this.turnOffSyncEditMode();
  }

  public initialize(
    needScroll = true,
    needRemoveSelection = true,
    needReArrangeChains = true,
  ) {
    const command = super.initialize(needRemoveSelection);
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.clearCanvas();

    // Prevent rearranging chains (and recalculating the layout) when switching to sequence mode,
    // only recalculate after changes in the sequence
    const modelChanges = needReArrangeChains
      ? editor.drawingEntitiesManager.applySnakeLayout(
          editor.canvas.width.baseVal.value,
          true,
          false,
          true,
          !this.isEditMode,
        )
      : editor.drawingEntitiesManager.recalculateAntisenseChains(
          !this.isEditMode,
        );
    const zoom = ZoomTool.instance;

    editor.renderersContainer.update(modelChanges);

    const chainsCollection =
      editor.drawingEntitiesManager.applyMonomersSequenceLayout();

    const firstMonomerPosition = (
      chainsCollection.firstNode?.monomer.renderer as BaseSequenceItemRenderer
    )?.scaledMonomerPositionForSequence;

    if (firstMonomerPosition && needScroll) {
      zoom.scrollTo(firstMonomerPosition);
    }

    if (this.isEditMode) {
      const drawnStructuresElement =
        document.querySelector('.drawn-structures');
      const isScrollToTheBottomNeeded =
        drawnStructuresElement &&
        drawnStructuresElement.getBoundingClientRect().bottom >
          window.innerHeight;

      if (isScrollToTheBottomNeeded) {
        zoom.scrollToVerticalBottom();
      }
    }

    modelChanges.merge(command);

    return modelChanges;
  }

  public turnOnEditMode(
    sequenceItemRenderer?: BaseSequenceItemRenderer,
    needToRemoveSelection = true,
  ) {
    const editor = CoreEditor.provideEditorInstance();

    if (sequenceItemRenderer) {
      SequenceRenderer.setCaretPositionNextToMonomer(
        sequenceItemRenderer.node.monomer,
      );
    }

    this.isEditMode = true;
    this.initialize(false, needToRemoveSelection, false);
    editor.events.toggleSequenceEditMode.dispatch(true);
  }

  public turnOffEditMode() {
    if (!this.isEditMode) return;
    const editor = CoreEditor.provideEditorInstance();

    this.isEditMode = false;
    this.initialize(false, true, true);
    editor.events.toggleSequenceEditMode.dispatch(false);
  }

  public turnOnSequenceEditInRNABuilderMode() {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditInRNABuilderMode = true;
    this.initialize(false, false, false);

    editor.events.toggleSequenceEditInRNABuilderMode.dispatch(true);
  }

  public turnOffSequenceEditInRNABuilderMode() {
    const editor = CoreEditor.provideEditorInstance();

    this.isEditInRNABuilderMode = false;
    this.initialize(false, true, false);
    editor.events.toggleSequenceEditInRNABuilderMode.dispatch(false);
  }

  public startNewSequence(eventData?: StartNewSequenceEventData) {
    if (CoreEditor.provideEditorInstance()?.isSequenceEditInRNABuilderMode) {
      return;
    }
    const currentChainIndex = this.isEditMode
      ? SequenceRenderer.currentChainIndex
      : SequenceRenderer.sequenceViewModel.chains.length - 1;
    const indexOfRowBefore = isNumber(eventData?.indexOfRowBefore)
      ? eventData?.indexOfRowBefore
      : currentChainIndex;

    if (!this.isEditMode) {
      this.turnOnEditMode();
    }

    SequenceRenderer.startNewSequence(indexOfRowBefore);

    if (SequenceRenderer.caretPosition === -1) {
      SequenceRenderer.setCaretPositionByNode(
        SequenceRenderer.sequenceViewModel.lastTwoStrandedNode,
      );
    }
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
          KetMonomerClass.Sugar,
        );
      }
      if (labeledNucleoelement.baseLabel) {
        baseMonomerItem =
          labeledNucleoelement.rnaBaseMonomerItem ||
          getRnaPartLibraryItem(
            editor,
            labeledNucleoelement.baseLabel,
            KetMonomerClass.Base,
          );
      }
      if (labeledNucleoelement.phosphateLabel) {
        phosphateMonomerItem = getRnaPartLibraryItem(
          editor,
          labeledNucleoelement.phosphateLabel,
          KetMonomerClass.Phosphate,
        );
      }

      const nodeToModify = SequenceRenderer.getNodeByPointer(nodeIndexOverall);

      if (
        nodeToModify?.senseNode instanceof Nucleotide ||
        nodeToModify?.senseNode instanceof Nucleoside
      ) {
        // Update Sugar monomerItem object
        if (nodeToModify.senseNode && sugarMonomerItem) {
          modelChanges.merge(
            editor.drawingEntitiesManager.modifyMonomerItem(
              nodeToModify.senseNode.sugar,
              sugarMonomerItem,
            ),
          );
        }
        // Update Base monomerItem object
        if (nodeToModify?.senseNode.rnaBase && baseMonomerItem) {
          if (
            nodeToModify?.senseNode.rnaBase.monomerItem.isAmbiguous ||
            baseMonomerItem.isAmbiguous
          ) {
            modelChanges.merge(
              replaceMonomer(
                editor.drawingEntitiesManager,
                nodeToModify?.senseNode.rnaBase,
                baseMonomerItem,
              ),
            );
          } else {
            modelChanges.merge(
              editor.drawingEntitiesManager.modifyMonomerItem(
                nodeToModify?.senseNode.rnaBase,
                baseMonomerItem,
              ),
            );
          }
        }
      }

      // Update monomerItem object or add Phosphate
      if (nodeToModify?.senseNode && phosphateMonomerItem) {
        // Update Phosphate monomerItem object for Nucleotide
        if (nodeToModify.senseNode instanceof Nucleotide) {
          modelChanges.merge(
            editor.drawingEntitiesManager.modifyMonomerItem(
              nodeToModify.senseNode.phosphate,
              phosphateMonomerItem,
            ),
          );
          // Add Phosphate to Nucleoside
        } else if (nodeToModify.senseNode instanceof Nucleoside) {
          const sugarR2 =
            nodeToModify.senseNode.sugar.attachmentPointsToBonds.R2;

          if (sugarR2 instanceof MonomerToAtomBond) {
            return;
          }

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
              nodeToModify.senseNode.sugar,
              nextMonomerInSameChain,
              labeledNucleoelement.phosphateLabel,
            ),
          );
          // Update Phosphate monomerItem object
        } else if (nodeToModify.senseNode.monomer instanceof Phosphate) {
          modelChanges.merge(
            editor.drawingEntitiesManager.modifyMonomerItem(
              nodeToModify.senseNode.monomer,
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
    if (this.isEditInRNABuilderMode) return;
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
    this.setAntisenseEditMode(Boolean(eventData.isAntisenseNode));
  }

  public mousedown(event: MouseEvent) {
    if (this.isEditInRNABuilderMode) return;
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

      if (!sequenceItemBoundingBox) {
        return;
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
      this.setAntisenseEditMode(Boolean(eventData.isAntisenseNode));
    }
  }

  public mousemove(event: MouseEvent) {
    if (this.isEditInRNABuilderMode) return;
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
      } else {
        SequenceRenderer.setCaretPosition(SequenceRenderer.caretPosition + 1);
        endCaretPosition++;
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
    if (this.isEditInRNABuilderMode) return;
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
    nextNodeToConnect?: SubChainNode | BackBoneSequenceNode | null,
    previousNodeToConnect?: SubChainNode | BackBoneSequenceNode,
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

    modelChanges.merge(
      this.insertNewSequenceFragment(
        newPeptideNode,
        nextNodeToConnect instanceof BackBoneSequenceNode
          ? nextNodeToConnect.secondConnectedNode
          : nextNodeToConnect,
        previousNodeToConnect instanceof BackBoneSequenceNode
          ? previousNodeToConnect.firstConnectedNode
          : previousNodeToConnect,
      ),
    );

    return { modelChanges, node: newPeptideNode };
  }

  private handleRnaDnaNodeAddition(
    enteredSymbol: RnaDnaNaturalAnaloguesEnum | string,
    newNodePosition: Vec2,
    nextNodeToConnect?: SubChainNode | BackBoneSequenceNode | null,
    previousNodeToConnect?: SubChainNode | BackBoneSequenceNode,
  ) {
    if (!rnaDnaNaturalAnalogues.includes(enteredSymbol)) {
      return undefined;
    }

    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = new Command();
    const { modelChanges: addedNodeModelChanges, node: nodeToAdd } =
      nextNodeToConnect instanceof Nucleotide ||
      nextNodeToConnect instanceof Nucleoside ||
      (nextNodeToConnect instanceof BackBoneSequenceNode &&
        (nextNodeToConnect.secondConnectedNode instanceof Nucleotide ||
          nextNodeToConnect.secondConnectedNode instanceof Nucleoside))
        ? Nucleotide.createOnCanvas(
            enteredSymbol,
            newNodePosition,
            getSugarBySequenceType(editor.sequenceTypeEnterMode),
          )
        : Nucleoside.createOnCanvas(
            enteredSymbol,
            newNodePosition,
            getSugarBySequenceType(editor.sequenceTypeEnterMode),
          );

    modelChanges.merge(addedNodeModelChanges);

    modelChanges.merge(
      this.insertNewSequenceFragment(
        nodeToAdd,
        nextNodeToConnect instanceof BackBoneSequenceNode
          ? nextNodeToConnect.secondConnectedNode
          : nextNodeToConnect,
        previousNodeToConnect instanceof BackBoneSequenceNode
          ? previousNodeToConnect.firstConnectedNode
          : previousNodeToConnect,
      ),
    );

    return { modelChanges, node: nodeToAdd };
  }

  private connectNodes(
    firstNodeToConnect: SubChainNode | BackBoneSequenceNode | undefined,
    secondNodeToConnect: SubChainNode | BackBoneSequenceNode | undefined,
    modelChanges: Command,
    newNodePosition: Vec2,
    addPhosphateIfNeeded = true,
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
      addPhosphateIfNeeded &&
      firstNodeToConnect instanceof Nucleoside &&
      (secondNodeToConnect instanceof Nucleotide ||
        secondNodeToConnect instanceof Nucleoside ||
        (secondNodeToConnect instanceof MonomerSequenceNode &&
          secondNodeToConnect.monomer instanceof Phosphate &&
          secondNodeToConnect.monomer.hydrogenBonds.length))
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
    node: SubChainNode | BackBoneSequenceNode | undefined,
    modelChanges: Command,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nodeR2Bond = node?.lastMonomerInNode.attachmentPointsToBonds.R2;

    if (!nodeR2Bond || nodeR2Bond instanceof MonomerToAtomBond) {
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

  private splitCurrentChain() {
    const modelChanges = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const editorHistory = new EditorHistory(editor);
    const previousTwoStrandedNodeInSameChain =
      SequenceRenderer.previousNodeInSameChain;
    const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;

    if (this.needToEditSense && previousTwoStrandedNodeInSameChain?.senseNode) {
      this.deleteBondToNextNodeInChain(
        previousTwoStrandedNodeInSameChain.senseNode instanceof
          BackBoneSequenceNode
          ? previousTwoStrandedNodeInSameChain?.senseNode.firstConnectedNode
          : previousTwoStrandedNodeInSameChain?.senseNode,
        modelChanges,
      );

      if (previousTwoStrandedNodeInSameChain?.senseNode instanceof Nucleotide) {
        modelChanges.addOperation(SequenceRenderer.moveCaretForward());
        modelChanges.merge(
          editor.drawingEntitiesManager.deleteMonomer(
            previousTwoStrandedNodeInSameChain.senseNode.lastMonomerInNode,
          ),
        );
      }
    }

    if (this.needToEditAntisense && currentTwoStrandedNode?.antisenseNode) {
      this.deleteBondToNextNodeInChain(
        currentTwoStrandedNode.antisenseNode instanceof BackBoneSequenceNode
          ? currentTwoStrandedNode.antisenseNode.secondConnectedNode
          : currentTwoStrandedNode.antisenseNode,
        modelChanges,
      );

      if (currentTwoStrandedNode?.antisenseNode instanceof Nucleotide) {
        modelChanges.merge(
          editor.drawingEntitiesManager.deleteMonomer(
            currentTwoStrandedNode.antisenseNode.lastMonomerInNode,
          ),
        );
      }
    }

    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    editorHistory.update(modelChanges);
  }

  private handleNodesDeletion(
    selections: TwoStrandedNodesSelection,
    strandType: STRAND_TYPE,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      const selectionStartTwoStrandedNode = selectionRange[0].node;
      const selectionEndTwoStrandedNode =
        selectionRange[selectionRange.length - 1].node;
      const selectionStartNode = getNodeFromTwoStrandedNode(
        selectionStartTwoStrandedNode,
        strandType,
      );
      const selectionEndNode = getNodeFromTwoStrandedNode(
        selectionEndTwoStrandedNode,
        strandType,
      );
      let isPhosphateAdditionalyDeleted = false;

      const twoStrandedNodeBeforeSelection = SequenceRenderer.getPreviousNode(
        selectionStartTwoStrandedNode,
      );
      const twoStrandedNodeAfterSelection = SequenceRenderer.getNextNode(
        selectionEndTwoStrandedNode,
      );
      const twoStrandedNodeInSameChainBeforeSelection =
        SequenceRenderer.getPreviousNodeInSameChain(
          selectionStartTwoStrandedNode,
        );
      const twoStrandedNodeInSameChainAfterSelection =
        SequenceRenderer.getNextNodeInSameChain(selectionEndTwoStrandedNode);

      const nodeBeforeSelection =
        (twoStrandedNodeBeforeSelection &&
          getNodeFromTwoStrandedNode(
            twoStrandedNodeBeforeSelection,
            strandType,
          )) ||
        undefined;
      const potentialNodeAfterSelection =
        (twoStrandedNodeAfterSelection &&
          getNodeFromTwoStrandedNode(
            twoStrandedNodeAfterSelection,
            strandType,
          )) ||
        undefined;
      const nodeAfterSelection =
        potentialNodeAfterSelection instanceof BackBoneSequenceNode
          ? strandType === STRAND_TYPE.SENSE
            ? potentialNodeAfterSelection.secondConnectedNode
            : potentialNodeAfterSelection.firstConnectedNode
          : potentialNodeAfterSelection;
      const nodeInSameChainBeforeSelection =
        (twoStrandedNodeInSameChainBeforeSelection &&
          getNodeFromTwoStrandedNode(
            twoStrandedNodeInSameChainBeforeSelection,
            strandType,
          )) ||
        undefined;
      const potentialNodeInSameChainAfterSelection =
        (twoStrandedNodeInSameChainAfterSelection &&
          getNodeFromTwoStrandedNode(
            twoStrandedNodeInSameChainAfterSelection,
            strandType,
          )) ||
        twoStrandedNodeInSameChainAfterSelection;
      const nodeInSameChainAfterSelection =
        potentialNodeInSameChainAfterSelection instanceof BackBoneSequenceNode
          ? potentialNodeInSameChainAfterSelection.secondConnectedNode
          : potentialNodeInSameChainAfterSelection;

      // Сase delete A (for sense) and empty node (for antisense) in sync mode:
      // G | A | G
      // C |   | C
      // Antisense should not create bond between C and C
      if (
        strandType === STRAND_TYPE.ANTISENSE &&
        ((selectionStartNode instanceof EmptySequenceNode &&
          !(
            selectionStartTwoStrandedNode.senseNode instanceof
              BackBoneSequenceNode ||
            selectionStartTwoStrandedNode.senseNode instanceof EmptySequenceNode
          )) ||
          (selectionEndNode instanceof EmptySequenceNode &&
            !(
              selectionEndTwoStrandedNode.senseNode instanceof
                BackBoneSequenceNode ||
              selectionEndTwoStrandedNode.senseNode instanceof EmptySequenceNode
            )))
      ) {
        return;
      }

      // Сase delete "-":
      // G | - | G
      // C |   | C
      // Sense should break bond between G and G. Chain should be broken into two parts.
      if (
        selectionStartNode instanceof BackBoneSequenceNode ||
        selectionEndNode instanceof BackBoneSequenceNode
      ) {
        const backBoneSequenceNode =
          selectionStartNode instanceof BackBoneSequenceNode
            ? selectionStartNode
            : (selectionEndNode as BackBoneSequenceNode);

        const firstConnected = backBoneSequenceNode.firstConnectedNode;
        const secondConnected = backBoneSequenceNode.secondConnectedNode;

        let polymerBondToDelete: PolymerBond | undefined;

        if (
          firstConnected instanceof Nucleotide &&
          firstConnected.lastMonomerInNode?.attachmentPointsToBonds
            ?.R2 instanceof PolymerBond
        ) {
          polymerBondToDelete =
            firstConnected.lastMonomerInNode.attachmentPointsToBonds.R2;
        } else if (
          secondConnected instanceof Nucleotide &&
          secondConnected.firstMonomerInNode?.attachmentPointsToBonds
            ?.R1 instanceof PolymerBond
        ) {
          polymerBondToDelete =
            secondConnected.firstMonomerInNode.attachmentPointsToBonds.R1;
        }

        if (polymerBondToDelete) {
          modelChanges.merge(
            editor.drawingEntitiesManager.deletePolymerBond(
              polymerBondToDelete,
            ),
          );
        }

        return;
      }

      if (
        !nodeInSameChainBeforeSelection &&
        nodeAfterSelection &&
        selectionStartNode &&
        !(nodeAfterSelection instanceof EmptySequenceNode)
      ) {
        modelChanges.merge(
          editor.drawingEntitiesManager.moveMonomer(
            nodeAfterSelection.monomer,
            selectionStartNode.monomer.position,
          ),
        );
      }

      if (strandType === STRAND_TYPE.SENSE) {
        if (
          !nodeBeforeSelection ||
          nodeBeforeSelection instanceof EmptySequenceNode
        ) {
          return;
        }

        if (
          nodeBeforeSelection === nodeInSameChainBeforeSelection &&
          nodeBeforeSelection instanceof Nucleotide &&
          selectionStartNode instanceof Nucleoside &&
          (!nodeAfterSelection ||
            nodeAfterSelection instanceof EmptySequenceNode)
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
        } else if (nodeBeforeSelection && nodeAfterSelection) {
          modelChanges.merge(
            this.tryToCreatePolymerBond(
              isPhosphateAdditionalyDeleted
                ? nodeBeforeSelection.firstMonomerInNode
                : nodeBeforeSelection.lastMonomerInNode,
              nodeAfterSelection.firstMonomerInNode,
            ),
          );
        }
      } else {
        if (
          !nodeAfterSelection ||
          nodeAfterSelection instanceof EmptySequenceNode
        ) {
          return;
        }

        if (
          nodeAfterSelection === nodeInSameChainAfterSelection &&
          nodeAfterSelection instanceof Nucleotide &&
          selectionEndNode instanceof Nucleoside &&
          (!nodeBeforeSelection ||
            nodeBeforeSelection instanceof EmptySequenceNode)
        ) {
          // delete phosphate from last nucleotide
          modelChanges.merge(
            editor.drawingEntitiesManager.deleteMonomer(
              nodeAfterSelection.lastMonomerInNode,
            ),
          );
          // TODO get rid of this boolean
          isPhosphateAdditionalyDeleted = true;
        }

        if (
          !nodeBeforeSelection ||
          nodeBeforeSelection instanceof EmptySequenceNode ||
          (!this.isEditMode &&
            (nodeBeforeSelection !== nodeInSameChainBeforeSelection ||
              nodeAfterSelection !== nodeInSameChainAfterSelection))
        ) {
          return;
        }

        if (
          nodeAfterSelection instanceof Nucleoside &&
          (nodeBeforeSelection instanceof Nucleotide ||
            nodeBeforeSelection instanceof Nucleoside)
        ) {
          modelChanges.merge(
            this.bondNodesThroughNewPhosphate(
              this.getNewSequenceItemPosition(nodeBeforeSelection),
              nodeAfterSelection.lastMonomerInNode,
              nodeBeforeSelection.firstMonomerInNode,
            ),
          );
        } else if (nodeBeforeSelection && nodeAfterSelection) {
          modelChanges.merge(
            this.tryToCreatePolymerBond(
              isPhosphateAdditionalyDeleted
                ? nodeAfterSelection.firstMonomerInNode
                : nodeAfterSelection.lastMonomerInNode,
              nodeBeforeSelection.firstMonomerInNode,
            ),
          );
        }
      }
    });

    return modelChanges;
  }

  private isNodeExistAndNonEmpty(
    twoStrandedNode: ITwoStrandedChainItem | undefined,
  ) {
    return (
      twoStrandedNode &&
      !(
        (!twoStrandedNode.senseNode ||
          twoStrandedNode.senseNode instanceof EmptySequenceNode) &&
        (!twoStrandedNode.antisenseNode ||
          twoStrandedNode.antisenseNode instanceof EmptySequenceNode)
      )
    );
  }

  get keyboardEventHandlers() {
    const deleteNode = (direction: Direction) => {
      if (this.isEditInRNABuilderMode) return;
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
      let nodesToDelete: TwoStrandedNodesSelection;

      if (selections.length) {
        nodesToDelete = selections;

        const senseNodesToDelete = nodesToDelete.filter((selectionRange) =>
          selectionRange.every(
            (nodeSelection) => nodeSelection.node.senseNode?.monomer.selected,
          ),
        );
        const antisenseNodesToDelete = nodesToDelete.filter((selectionRange) =>
          selectionRange.every(
            (nodeSelection) =>
              nodeSelection.node.antisenseNode?.monomer.selected,
          ),
        );

        modelChanges.merge(this.deleteSelectedDrawingEntities());

        if (this.needToEditSense) {
          modelChanges.merge(
            this.handleNodesDeletion(senseNodesToDelete, STRAND_TYPE.SENSE),
          );
        }
        if (this.needToEditAntisense) {
          modelChanges.merge(
            this.handleNodesDeletion(
              antisenseNodesToDelete,
              STRAND_TYPE.ANTISENSE,
            ),
          );
        }
      } else if (nodeToDelete) {
        const previousNodeInSameChain =
          SequenceRenderer.previousNodeInSameChain;

        nodesToDelete = [
          [
            {
              node: nodeToDelete,
              nodeIndexOverall: caretPosition,
            },
          ],
        ];

        if (this.needToEditSense && nodeToDelete.senseNode) {
          if (!(nodeToDelete.senseNode instanceof BackBoneSequenceNode)) {
            nodeToDelete.senseNode.monomers.forEach((monomer) => {
              modelChanges.merge(
                editor.drawingEntitiesManager.deleteMonomer(monomer),
              );
            });
          }

          modelChanges.merge(
            this.handleNodesDeletion(nodesToDelete, STRAND_TYPE.SENSE),
          );
        }

        if (
          this.needToEditAntisense &&
          nodeToDelete.antisenseNode &&
          // Do not delete empty antisense node and connect prev and next nodes if delete empty node in one chain (no need to connect previous and current chains)
          (!(nodeToDelete.antisenseNode instanceof EmptySequenceNode) ||
            !previousNodeInSameChain)
        ) {
          nodeToDelete.antisenseNode?.monomers.forEach((monomer) => {
            modelChanges.merge(
              editor.drawingEntitiesManager.deleteMonomer(monomer),
            );
          });

          modelChanges.merge(
            this.handleNodesDeletion(nodesToDelete, STRAND_TYPE.ANTISENSE),
          );
        }
      } else {
        return;
      }

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
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          deleteNode(Direction.Right);
        },
      },
      backspace: {
        shortcut: ['Backspace'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          deleteNode(Direction.Left);
        },
      },
      'turn-off-edit-mode': {
        shortcut: ['Escape'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          this.turnOffEditMode();
        },
      },
      'start-new-sequence': {
        shortcut: ['Enter'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          this.unselectAllEntities();

          if (
            this.isNodeExistAndNonEmpty(SequenceRenderer.currentEdittingNode) &&
            this.isNodeExistAndNonEmpty(
              SequenceRenderer.previousNodeInSameChain,
            )
          ) {
            this.splitCurrentChain();
          } else {
            if (this.isSyncEditMode) {
              this.turnOffAntisenseEditMode();
            }
            this.startNewSequence();
          }
        },
      },
      'break-editting-chain': {
        shortcut: ['Space'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          if (this.isSyncEditMode) return;

          const modelChanges = new Command();
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
          const previousTwoStrandedNodeInSameChain =
            SequenceRenderer.previousNodeInSameChain;

          if (this.isAntisenseEditMode) {
            this.deleteBondToNextNodeInChain(
              currentTwoStrandedNode?.antisenseNode,
              modelChanges,
            );
          } else {
            this.deleteBondToNextNodeInChain(
              previousTwoStrandedNodeInSameChain?.senseNode,
              modelChanges,
            );
          }

          modelChanges.addOperation(new ReinitializeModeOperation());
          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
        },
      },
      'break-complimentary-chain': {
        shortcut: ['-', '—'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          const modelChanges = new Command();
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
          const previousTwoStrandedNodeInSameChain =
            SequenceRenderer.previousNodeInSameChain;

          if (
            !currentTwoStrandedNode?.senseNode ||
            !currentTwoStrandedNode?.antisenseNode ||
            !previousTwoStrandedNodeInSameChain?.senseNode ||
            !previousTwoStrandedNodeInSameChain?.antisenseNode ||
            currentTwoStrandedNode?.senseNode instanceof EmptySequenceNode ||
            currentTwoStrandedNode?.antisenseNode instanceof
              EmptySequenceNode ||
            previousTwoStrandedNodeInSameChain?.senseNode instanceof
              EmptySequenceNode ||
            previousTwoStrandedNodeInSameChain?.antisenseNode instanceof
              EmptySequenceNode
          ) {
            return;
          }

          if (
            this.isAntisenseEditMode &&
            previousTwoStrandedNodeInSameChain?.senseNode
          ) {
            this.deleteBondToNextNodeInChain(
              previousTwoStrandedNodeInSameChain.senseNode,
              modelChanges,
            );
          } else if (
            !this.isAntisenseEditMode &&
            currentTwoStrandedNode?.antisenseNode
          ) {
            this.deleteBondToNextNodeInChain(
              currentTwoStrandedNode.antisenseNode,
              modelChanges,
            );
          }

          modelChanges.addOperation(new ReinitializeModeOperation());
          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
        },
      },
      'move-caret-up': {
        shortcut: ['ArrowUp'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          const currentEdittingNode = SequenceRenderer.currentEdittingNode;

          if (
            this.isAntisenseEditMode &&
            Boolean(currentEdittingNode?.antisenseNode)
          ) {
            this.turnOffAntisenseEditMode();

            return;
          }

          SequenceRenderer.moveCaretUp();

          if (SequenceRenderer.currentEdittingNode?.antisenseNode) {
            this.turnOnAntisenseEditMode();
          }

          this.unselectAllEntities();
        },
      },
      'move-caret-down': {
        shortcut: ['ArrowDown'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          const currentEdittingNode = SequenceRenderer.currentEdittingNode;

          if (
            !this.isAntisenseEditMode &&
            Boolean(currentEdittingNode?.antisenseNode)
          ) {
            this.turnOnAntisenseEditMode();

            return;
          }

          SequenceRenderer.moveCaretDown();
          this.turnOffAntisenseEditMode();
          this.unselectAllEntities();
        },
      },
      'move-caret-forward': {
        shortcut: ['ArrowRight'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          if (!this.isEditMode) return;

          SequenceRenderer.moveCaretForward();
          SequenceRenderer.resetLastUserDefinedCaretPosition();
          this.unselectAllEntities();
        },
      },
      'move-caret-back': {
        shortcut: ['ArrowLeft'],
        handler: () => {
          if (this.isEditInRNABuilderMode) return;
          if (!this.isEditMode) return;

          SequenceRenderer.moveCaretBack();
          SequenceRenderer.resetLastUserDefinedCaretPosition();

          this.unselectAllEntities();
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
          if (this.isEditInRNABuilderMode) return;
          if (SequenceRenderer.isEmptyCanvas() && !this.isEditMode) {
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
          const modelChanges = new Command();
          const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
          const previousTwoStrandedNodeInSameChain =
            (currentTwoStrandedNode &&
              SequenceRenderer.getPreviousNodeInSameChain(
                currentTwoStrandedNode,
              )) ||
            undefined;
          let senseNodeToConnect = currentTwoStrandedNode?.senseNode;
          const isDnaEnteringMode =
            editor.sequenceTypeEnterMode === SequenceType.DNA;
          const isRnaEnteringMode =
            editor.sequenceTypeEnterMode === SequenceType.RNA;
          const isEnteringSymbolP = enteredSymbol.toUpperCase() === 'P';

          if (this.needToEditSense) {
            const insertNewSequenceItemResult = this.insertNewSequenceItem(
              editor,
              this.isAntisenseEditMode && !isEnteringSymbolP
                ? DrawingEntitiesManager.getAntisenseBaseLabel(
                    enteredSymbol,
                    isDnaEnteringMode,
                  )
                : enteredSymbol,
              currentTwoStrandedNode?.senseNode,
              previousTwoStrandedNodeInSameChain?.senseNode,
            );

            // Case when user type symbol that does not exist in current sequence type mode
            if (!insertNewSequenceItemResult) {
              return;
            }

            modelChanges.merge(insertNewSequenceItemResult.modelChanges);
            senseNodeToConnect = insertNewSequenceItemResult.node;
          }

          if (
            this.needToEditAntisense &&
            (this.isSyncEditMode
              ? previousTwoStrandedNodeInSameChain?.antisenseNode ||
                currentTwoStrandedNode?.antisenseNode
              : !(
                  previousTwoStrandedNodeInSameChain?.antisenseNode instanceof
                  EmptySequenceNode
                ) ||
                !(
                  currentTwoStrandedNode?.antisenseNode instanceof
                  EmptySequenceNode
                ))
          ) {
            const antisenseNodeCreationResult = this.insertNewSequenceItem(
              editor,
              this.isAntisenseEditMode ||
                (editor.sequenceTypeEnterMode !== SequenceType.DNA &&
                  editor.sequenceTypeEnterMode !== SequenceType.RNA) ||
                isEnteringSymbolP
                ? enteredSymbol
                : DrawingEntitiesManager.getAntisenseBaseLabel(
                    enteredSymbol,
                    isDnaEnteringMode,
                  ),
              previousTwoStrandedNodeInSameChain?.antisenseNode || null,
              currentTwoStrandedNode?.antisenseNode,
            );

            if (antisenseNodeCreationResult) {
              modelChanges.merge(antisenseNodeCreationResult.modelChanges);
            }

            if (
              this.isSyncEditMode &&
              antisenseNodeCreationResult &&
              senseNodeToConnect &&
              (senseNodeToConnect instanceof Nucleotide ||
                senseNodeToConnect instanceof Nucleoside)
            ) {
              modelChanges.merge(
                editor.drawingEntitiesManager.createPolymerBond(
                  senseNodeToConnect?.rnaBase,
                  antisenseNodeCreationResult.node instanceof Nucleotide ||
                    antisenseNodeCreationResult.node instanceof Nucleoside
                    ? antisenseNodeCreationResult.node?.rnaBase
                    : antisenseNodeCreationResult.node.monomer,
                  AttachmentPointName.HYDROGEN,
                  AttachmentPointName.HYDROGEN,
                  MACROMOLECULES_BOND_TYPES.HYDROGEN,
                ),
              );
            }
          }

          modelChanges.addOperation(new ReinitializeModeOperation());
          editor.renderersContainer.update(modelChanges);

          if (
            // If user type symbol that becomes part of a linker then caret does not move
            !(isDnaEnteringMode || isRnaEnteringMode) ||
            !(
              isEnteringSymbolP &&
              (this.needToEditSense
                ? LinkerSequenceNode.isPartOfLinker(
                    previousTwoStrandedNodeInSameChain?.senseNode?.monomer,
                  ) ||
                  LinkerSequenceNode.isPartOfLinker(
                    currentTwoStrandedNode?.senseNode?.monomer,
                  )
                : LinkerSequenceNode.isPartOfLinker(
                    previousTwoStrandedNodeInSameChain?.antisenseNode?.monomer,
                  ) ||
                  LinkerSequenceNode.isPartOfLinker(
                    currentTwoStrandedNode?.antisenseNode?.monomer,
                  ))
            )
          ) {
            modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          }

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
          if (this.isEditInRNABuilderMode) return;
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

  public deleteSelection() {
    const selections = SequenceRenderer.selections;

    if (selections.length === 0) {
      return true;
    }

    const deletionModelChanges = this.deleteSelectedDrawingEntities();

    deletionModelChanges.merge(
      this.handleNodesDeletion(selections, STRAND_TYPE.SENSE),
    );
    deletionModelChanges.merge(
      this.handleNodesDeletion(selections, STRAND_TYPE.ANTISENSE),
    );
    this.finishNodesDeletion(
      deletionModelChanges,
      SequenceRenderer.caretPosition,
      selections[0][0].nodeIndexOverall,
    );

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

  private isR1Free(
    entity?: SubChainNode | BackBoneSequenceNode | BaseMonomer,
  ): boolean {
    if (entity instanceof BaseMonomer) {
      return entity.attachmentPointsToBonds.R1 === null;
    }

    return entity?.firstMonomerInNode?.attachmentPointsToBonds?.R1 === null;
  }

  private isR2Free(
    entity?: SubChainNode | BackBoneSequenceNode | BaseMonomer,
  ): boolean {
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
      currentNode?.senseNode instanceof EmptySequenceNode || !currentNode;
    const isPasteInStart = !previousNodeInSameChain;
    if (isPasteInEnd && !previousNodeInSameChain) return true;
    if (isPasteInEnd) {
      return (
        this.isR1Free(firstNodeOfNewFragment) &&
        this.isR2Free(previousNodeInSameChain?.senseNode)
      );
    }
    if (isPasteInStart) {
      return (
        this.isR2Free(lastNodeOfNewFragment) &&
        this.isR1Free(currentNode?.senseNode)
      );
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
      currentSequence?.lastNonEmptyNode?.monomer?.isPhosphate;

    let nextCaretPosition =
      SequenceRenderer.caretPosition + chainsCollection.length;

    if (currentSequenceHasPhosphate) {
      nextCaretPosition -= 1;
    }

    const hasPhosphateAtChainEnd =
      chainsCollection?.lastNode?.monomer?.isPhosphate;

    if (!SequenceRenderer.isCaretAtChainEnd && hasPhosphateAtChainEnd) {
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

  private preserveSideChainConnections(
    selectedNode: SubChainNode | BackBoneSequenceNode,
  ) {
    if (selectedNode.monomer.sideConnections.length === 0) {
      return null;
    }

    const sideConnectionsData: Array<{
      firstMonomerAttachmentPointName: AttachmentPointName;
      secondMonomer: BaseMonomer;
      secondMonomerAttachmentPointName: AttachmentPointName;
    }> = [];

    Object.entries(selectedNode.monomer.attachmentPointsToBonds).forEach(
      ([key, bond]) => {
        if (
          !bond ||
          bond instanceof MonomerToAtomBond ||
          !bond.isSideChainConnection
        ) {
          return;
        }

        const secondMonomer = bond.getAnotherMonomer(selectedNode.monomer);
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
    selectedNode: SubChainNode | BackBoneSequenceNode,
    selectedTwoStrandedNode: ITwoStrandedChainItem,
    modelChanges: Command,
    previousSelectionNode?: SubChainNode | BackBoneSequenceNode,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nextNode = SequenceRenderer.getNextNodeInSameChain(
      selectedTwoStrandedNode,
    );
    const position = selectedNode.monomer.position;
    const sideChainConnections =
      this.preserveSideChainConnections(selectedNode);
    const preservedHydrodenBonds = selectedNode.monomers.reduce(
      (acc, monomer) => {
        return acc.concat(
          monomer.hydrogenBonds.map((hydrodenBond) => {
            return {
              toMonomer: hydrodenBond.getAnotherMonomer(monomer) as BaseMonomer,
              fromMonomer: monomer,
            };
          }),
        );
      },
      [] as PreservedHydrogenBonds[],
    );
    const hasPreviousNodeInChain =
      selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1;
    const hasNextNodeInChain =
      selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2;

    selectedNode.monomers.forEach((monomer) => {
      modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
      monomer.forEachBond((polymerBond) => {
        modelChanges.merge(
          editor.drawingEntitiesManager.deleteDrawingEntity(polymerBond),
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
        nextNode?.senseNode || null,
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

    preservedHydrodenBonds.forEach(({ toMonomer }) => {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          newMonomer,
          toMonomer,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
        ),
      );
    });

    return newMonomerSequenceNode;
  }

  private replaceSelectionsWithMonomer(
    selections: TwoStrandedNodesSelection,
    monomerItem: MonomerItemType,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      let previousReplacedNode = SequenceRenderer.getPreviousNodeInSameChain(
        selectionRange[0].node,
      )?.senseNode;

      selectionRange.forEach((nodeSelection) => {
        const senseNode = nodeSelection.node.senseNode;

        if (!senseNode || senseNode instanceof EmptySequenceNode) {
          return;
        }

        previousReplacedNode = this.replaceSelectionWithMonomer(
          monomerItem,
          senseNode,
          nodeSelection.node,
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
    selectedNode: SubChainNode | BackBoneSequenceNode,
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
    // selectedNode.monomers.attachmentPoints
    const oldMonomerBonds: [string, PolymerBond | MonomerToAtomBond | null][] =
      sideChainConnections
        ? Object.entries(selectedNode.monomer.attachmentPointsToBonds)
        : [
            [
              AttachmentPointName.R1 as string,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1!,
            ],
            [
              AttachmentPointName.R2 as string,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2!,
            ],
          ];
    // Backbone
    // selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1
    // selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2
    return oldMonomerBonds.every(([key, bond]) => {
      if (
        !bond ||
        (!(bond instanceof MonomerToAtomBond) &&
          (sideChainConnections
            ? !bond.isSideChainConnection
            : !bond.isBackBoneChainConnection))
      ) {
        return true;
      }

      return newMonomerAttachmentPoints.attachmentPointsList.includes(
        key as AttachmentPointName,
      );
    });
  }

  private selectionsContainLinkerNode(selections: TwoStrandedNodesSelection) {
    return selections.some((selectionRange) =>
      selectionRange.some(
        (nodeSelection) =>
          nodeSelection.node.senseNode instanceof LinkerSequenceNode,
      ),
    );
  }

  private selectionsCantPreserveConnectionsWithMonomer(
    selections: TwoStrandedNodesSelection,
    monomerItem: MonomerItemType,
    sideChainConnections?: boolean,
  ) {
    return selections.some((selectionRange) =>
      selectionRange.some(
        (nodeSelection) =>
          nodeSelection.node.senseNode &&
          !this.checkIfNewMonomerCouldEstablishConnections(
            nodeSelection.node.senseNode,
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
    selections: TwoStrandedNodesSelection,
    preset: IRnaPreset,
    sideChainConnections?: boolean,
  ) {
    return selections.some((selectionRange) =>
      selectionRange.some((nodeSelection) =>
        [preset.sugar, preset.base, preset.phosphate].some(
          (monomer) =>
            monomer &&
            nodeSelection.node.senseNode &&
            !this.checkIfNewMonomerCouldEstablishConnections(
              nodeSelection.node.senseNode,
              monomer,
              sideChainConnections,
            ),
        ),
      ),
    );
  }

  private checkNodeInsertionPossibility(newNode: SubChainNode) {
    const previousTwoStrandedNodeInSameChain =
      SequenceRenderer.previousNodeInSameChain;
    const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
    const currentNodeIsNotEmpty = !(
      currentTwoStrandedNode?.senseNode instanceof EmptySequenceNode
    );

    let missingAttachmentPoint: AttachmentPointName | null = null;

    const previousMonomerHasR2 = Boolean(
      previousTwoStrandedNodeInSameChain?.senseNode?.lastMonomerInNode.hasAttachmentPoint(
        AttachmentPointName.R2,
      ),
    );
    const newMonomerHasR1 = newNode.firstMonomerInNode.hasAttachmentPoint(
      AttachmentPointName.R1,
    );
    const rightSideInsertImpossible =
      Boolean(previousTwoStrandedNodeInSameChain) &&
      (!previousMonomerHasR2 || !newMonomerHasR1);
    if (rightSideInsertImpossible && !newMonomerHasR1) {
      missingAttachmentPoint = AttachmentPointName.R1;
    }

    const nextMonomerHasR1 = Boolean(
      currentTwoStrandedNode?.senseNode?.firstMonomerInNode.hasAttachmentPoint(
        AttachmentPointName.R1,
      ),
    );
    const newMonomerHasR2 = newNode.lastMonomerInNode.hasAttachmentPoint(
      AttachmentPointName.R2,
    );
    const leftSideInsertImpossible =
      Boolean(currentTwoStrandedNode) &&
      currentNodeIsNotEmpty &&
      (!nextMonomerHasR1 || !newMonomerHasR2);
    if (leftSideInsertImpossible && !newMonomerHasR2) {
      missingAttachmentPoint = AttachmentPointName.R2;
    }

    const nodeCanBeInserted =
      !rightSideInsertImpossible && !leftSideInsertImpossible;

    return {
      nodeCanBeInserted,
      missingAttachmentPoint,
    };
  }

  private isSelectionsContainAntisenseChains(
    selections: TwoStrandedNodesSelection,
  ) {
    return selections.some((selectionRange) => {
      return selectionRange.some(
        (twoStrandedNodeSelection) =>
          twoStrandedNodeSelection.node.antisenseNode,
      );
    });
  }

  public insertMonomerFromLibrary(monomerItem: MonomerItemType) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();
    const selections = SequenceRenderer.selections;

    if (selections.length > 0) {
      if (this.isSelectionsContainAntisenseChains(selections)) {
        return;
      }

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
    } else if (editor.isSequenceEditMode) {
      const newNodePosition = this.getNewNodePosition();
      const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;

      if (currentTwoStrandedNode?.antisenseNode) {
        return;
      }

      const newMonomer = editor.drawingEntitiesManager.createMonomer(
        monomerItem,
        newNodePosition,
      );
      const newMonomerSequenceNode = new MonomerSequenceNode(newMonomer);

      const { nodeCanBeInserted, missingAttachmentPoint } =
        this.checkNodeInsertionPossibility(newMonomerSequenceNode);
      if (!nodeCanBeInserted) {
        const message =
          missingAttachmentPoint &&
          `The monomer lacks ${missingAttachmentPoint} attachment point and cannot be inserted at current position`;
        this.showMergeWarningModal(message);
        return;
      }

      const monomerAddCommand = editor.drawingEntitiesManager.addMonomer(
        monomerItem,
        newNodePosition,
        newMonomer,
      );

      modelChanges.merge(monomerAddCommand);
      modelChanges.merge(
        this.insertNewSequenceFragment(newMonomerSequenceNode),
      );

      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      SequenceRenderer.setCaretPositionNextToMonomer(
        newMonomerSequenceNode.lastMonomerInNode,
      );
      history.update(modelChanges);
    }
  }

  private createRnaPresetNode(preset: IRnaPreset, position: Vec2) {
    const editor = CoreEditor.provideEditorInstance();
    const { base: rnaBase, sugar, phosphate } = preset;

    assert(sugar);

    const sugarMonomer = editor.drawingEntitiesManager.createMonomer(
      sugar,
      position,
    ) as Sugar;

    let rnaBaseMonomer: RNABase | AmbiguousMonomer | null = null;
    if (rnaBase) {
      rnaBaseMonomer = editor.drawingEntitiesManager.createMonomer(
        rnaBase,
        position,
      ) as RNABase;
    }

    let phosphateMonomer: Phosphate | null = null;
    if (phosphate) {
      phosphateMonomer = editor.drawingEntitiesManager.createMonomer(
        phosphate,
        position,
      ) as Phosphate;
    }

    let newPresetNode: Nucleotide | Nucleoside | LinkerSequenceNode | null =
      null;

    if (rnaBaseMonomer && sugarMonomer && phosphateMonomer) {
      newPresetNode = new Nucleotide(
        sugarMonomer,
        rnaBaseMonomer,
        phosphateMonomer,
      );
    } else if (rnaBaseMonomer && sugarMonomer) {
      newPresetNode = new Nucleoside(sugarMonomer, rnaBaseMonomer);
    } else {
      newPresetNode = new LinkerSequenceNode(sugarMonomer);
    }

    return newPresetNode;
  }

  private replaceSelectionWithPreset(
    preset: IRnaPreset,
    selectedNode: SubChainNode | BackBoneSequenceNode,
    selectedTwoStrandedNode: ITwoStrandedChainItem,
    modelChanges: Command,
    previousSelectionNode?: SubChainNode | BackBoneSequenceNode,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const nextNode = SequenceRenderer.getNextNodeInSameChain(
      selectedTwoStrandedNode,
    );
    const position = selectedNode.monomer.position;
    const hasPreviousNodeInChain =
      selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1;
    const hasNextNodeInChain =
      selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2;

    const sideChainConnections =
      this.preserveSideChainConnections(selectedNode);
    const preservedHydrodenBonds = selectedNode.monomers.reduce(
      (acc, monomer) => {
        return acc.concat(
          monomer.hydrogenBonds.map((hydrodenBond) => {
            return {
              toMonomer: hydrodenBond.getAnotherMonomer(monomer) as BaseMonomer,
              fromMonomer: monomer,
            };
          }),
        );
      },
      [] as PreservedHydrogenBonds[],
    );

    selectedNode.monomers.forEach((monomer) => {
      modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
      monomer.forEachBond((polymerBond) => {
        modelChanges.merge(
          editor.drawingEntitiesManager.deleteDrawingEntity(polymerBond),
        );
      });
    });

    const newPresetNode = this.createRnaPresetNode(preset, position);

    assert(newPresetNode);

    const rnaPresetAddModelChanges =
      editor.drawingEntitiesManager.addRnaPresetFromNode(newPresetNode);

    modelChanges.merge(rnaPresetAddModelChanges);
    modelChanges.merge(
      this.insertNewSequenceFragment(
        newPresetNode,
        nextNode?.senseNode || null,
        previousSelectionNode,
        Boolean(hasPreviousNodeInChain),
        Boolean(hasNextNodeInChain),
        false,
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

    preservedHydrodenBonds.forEach(({ toMonomer, fromMonomer }) => {
      let monomerForHydrogenBond: BaseMonomer | undefined;

      if (
        newPresetNode instanceof Nucleotide ||
        newPresetNode instanceof Nucleoside
      ) {
        monomerForHydrogenBond =
          fromMonomer instanceof RNABase
            ? newPresetNode.rnaBase
            : fromMonomer instanceof Sugar
            ? newPresetNode.sugar
            : newPresetNode instanceof Nucleotide &&
              fromMonomer instanceof Phosphate
            ? newPresetNode.phosphate
            : undefined;
      }

      if (!monomerForHydrogenBond) {
        return;
      }

      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          monomerForHydrogenBond,
          toMonomer,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
        ),
      );
    });

    return newPresetNode;
  }

  private replaceSelectionsWithPreset(
    selections: TwoStrandedNodesSelection,
    preset: IRnaPreset,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = new Command();

    selections.forEach((selectionRange) => {
      let previousReplacedNode = SequenceRenderer.getPreviousNodeInSameChain(
        selectionRange[0].node,
      )?.senseNode;

      selectionRange.forEach((nodeSelection) => {
        const senseNode = nodeSelection.node.senseNode;

        if (!senseNode || senseNode instanceof EmptySequenceNode) {
          return;
        }

        previousReplacedNode = this.replaceSelectionWithPreset(
          preset,
          senseNode,
          nodeSelection.node,
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
      if (this.isSelectionsContainAntisenseChains(selections)) {
        return;
      }

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
    } else if (editor.isSequenceEditMode) {
      const newNodePosition = this.getNewNodePosition();
      const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;

      if (currentTwoStrandedNode?.antisenseNode) {
        return;
      }

      const newPresetNode = this.createRnaPresetNode(preset, newNodePosition);

      assert(newPresetNode);

      const { nodeCanBeInserted, missingAttachmentPoint } =
        this.checkNodeInsertionPossibility(newPresetNode);

      if (!nodeCanBeInserted) {
        const message =
          missingAttachmentPoint &&
          `The monomer lacks ${missingAttachmentPoint} attachment point and cannot be inserted at current position`;
        this.showMergeWarningModal(message);
        return;
      }

      const rnaPresetAddModelChanges =
        editor.drawingEntitiesManager.addRnaPresetFromNode(newPresetNode);

      modelChanges.merge(rnaPresetAddModelChanges);
      modelChanges.merge(this.insertNewSequenceFragment(newPresetNode));

      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      SequenceRenderer.setCaretPositionNextToMonomer(
        newPresetNode.lastMonomerInNode,
      );
      history.update(modelChanges);
    }
  }

  private insertNewSequenceItem(
    editor: CoreEditor,
    enteredSymbol: string,
    nextNodeToConnect?: SubChainNode | BackBoneSequenceNode | null,
    previousNodeToConnect?: SubChainNode | BackBoneSequenceNode,
  ) {
    const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
    const newNodePosition = this.getNewNodePosition();
    const previousTwoStrandedNodeInSameChain =
      SequenceRenderer.previousNodeInSameChain;

    if (
      nextNodeToConnect instanceof EmptySequenceNode &&
      previousNodeToConnect
    ) {
      if (
        !previousTwoStrandedNodeInSameChain?.antisenseNode &&
        !this.isR2Free(previousNodeToConnect)
      ) {
        this.showMergeWarningModal();
        return;
      }
    }

    if (
      !previousNodeToConnect &&
      nextNodeToConnect &&
      !(nextNodeToConnect instanceof EmptySequenceNode)
    ) {
      if (!this.isR1Free(nextNodeToConnect)) {
        this.showMergeWarningModal();
        return;
      }
    }

    if (
      editor.sequenceTypeEnterMode !== SequenceType.PEPTIDE &&
      enteredSymbol.toUpperCase() === 'P'
    ) {
      const phosphateLibraryItem = getRnaPartLibraryItem(
        editor,
        RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
        KetMonomerClass.Phosphate,
      );
      const phosphateAddCommand =
        phosphateLibraryItem &&
        editor.drawingEntitiesManager.addMonomer(
          phosphateLibraryItem,
          newNodePosition,
        );
      const newPhosphate = phosphateAddCommand?.operations[0].monomer;
      if (!phosphateLibraryItem || !newPhosphate) {
        this.showMergeWarningModal('Phosphate library item not found.');
        return;
      }
      const newPhosphateNode = new MonomerSequenceNode(newPhosphate);
      const modelChanges = new Command();
      modelChanges.merge(phosphateAddCommand);
      modelChanges.merge(
        this.insertNewSequenceFragment(
          newPhosphateNode,
          currentTwoStrandedNode instanceof BackBoneSequenceNode
            ? currentTwoStrandedNode.secondConnectedNode
            : nextNodeToConnect,
          currentTwoStrandedNode instanceof BackBoneSequenceNode
            ? currentTwoStrandedNode.firstConnectedNode
            : previousNodeToConnect,
          true,
          true,
          false,
        ),
      );
      return { modelChanges, node: newPhosphateNode };
    }

    if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
      return this.handlePeptideNodeAddition(
        enteredSymbol,
        newNodePosition,
        nextNodeToConnect,
        previousNodeToConnect,
      );
    } else {
      return this.handleRnaDnaNodeAddition(
        enteredSymbol,
        newNodePosition,
        nextNodeToConnect,
        previousNodeToConnect,
      );
    }
  }

  private showMergeWarningModal(message?: string | null) {
    const editor = CoreEditor.provideEditorInstance();

    editor.events.openErrorModal.dispatch({
      errorTitle: 'Error Message',
      errorMessage:
        message ??
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
    });
  }

  private insertNewSequenceFragment(
    chainsCollectionOrNode: ChainsCollection | SubChainNode,
    nextNodeToConnect?: SubChainNode | BackBoneSequenceNode | null,
    previousNodeToConnect?: SubChainNode | BackBoneSequenceNode,
    needConnectWithPreviousNodeInChain = true,
    needConnectWithNextNodeInChain = true,
    addPhosphateIfNeeded = true,
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
        : nextNodeToConnect || SequenceRenderer.currentEdittingNode?.senseNode;
    const previousNodeInSameChain =
      previousNodeToConnect ||
      SequenceRenderer.previousNodeInSameChain?.senseNode;
    const modelChanges = new Command();
    const lastNodeOfNewFragment = chainsCollection.lastNode;
    const firstNodeOfNewFragment = chainsCollection.firstNode;
    const newNodePosition = this.getNewNodePosition();

    if (needConnectWithPreviousNodeInChain) {
      this.deleteBondToNextNodeInChain(previousNodeInSameChain, modelChanges);
      this.connectNodes(
        previousNodeInSameChain,
        firstNodeOfNewFragment,
        modelChanges,
        newNodePosition,
        addPhosphateIfNeeded,
      );
    }

    if (needConnectWithNextNodeInChain) {
      this.connectNodes(
        lastNodeOfNewFragment,
        currentNode,
        modelChanges,
        newNodePosition,
        addPhosphateIfNeeded,
      );
    }

    return modelChanges;
  }

  getNewNodePosition() {
    if (this.isEditMode) {
      const currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      const currentNode = currentTwoStrandedNode?.senseNode;
      const previousTwoStrandedNode =
        SequenceRenderer.previousFromCurrentEdittingMonomer;
      const previousNode = previousTwoStrandedNode?.senseNode;
      const twoStrandedNodeBeforePreviousNode = previousNode
        ? SequenceRenderer.getPreviousNodeInSameChain(previousTwoStrandedNode)
        : undefined;
      const nodeBeforePreviousNode =
        twoStrandedNodeBeforePreviousNode?.senseNode;
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
    previousNode?: SubChainNode | BackBoneSequenceNode,
    nodeBeforePreviousNode?: SubChainNode | BackBoneSequenceNode,
    currentNode?: SubChainNode | BackBoneSequenceNode,
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
    modelChanges.merge(
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes(),
    );
    editor.renderersContainer.update(modelChanges);
  }

  private createHydrogenBondForTwoStrandedNode(
    twoStrandedNode: ITwoStrandedChainItem,
  ) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const senseNode = twoStrandedNode.senseNode;
    const antisenseNode = twoStrandedNode.antisenseNode;

    if (
      !senseNode ||
      !antisenseNode ||
      isTwoStrandedNodeRestrictedForHydrogenBondCreation(twoStrandedNode)
    ) {
      return command;
    }

    command.merge(
      editor.drawingEntitiesManager.createPolymerBond(
        senseNode instanceof Nucleoside || senseNode instanceof Nucleotide
          ? senseNode.rnaBase
          : senseNode.monomer,
        antisenseNode instanceof Nucleoside ||
          antisenseNode instanceof Nucleotide
          ? antisenseNode.rnaBase
          : antisenseNode.monomer,
        AttachmentPointName.HYDROGEN,
        AttachmentPointName.HYDROGEN,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      ),
    );

    return command;
  }

  private deleteHydrogenBondsForNode(
    node: SubChainNode | BackBoneSequenceNode | undefined,
  ) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

    node?.monomers.forEach((monomer) => {
      monomer.hydrogenBonds.forEach((hydrogenBond) => {
        command.merge(
          editor.drawingEntitiesManager.deletePolymerBond(hydrogenBond),
        );
      });
    });

    return command;
  }

  public establishHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer) {
    const modelChanges = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const selections = SequenceRenderer.selections;

    if (selections.length) {
      selections.forEach((selectionRange) => {
        selectionRange.forEach((nodeSelection) => {
          modelChanges.merge(
            this.createHydrogenBondForTwoStrandedNode(nodeSelection.node),
          );
        });
      });
    } else {
      const twoStrandedNode = sequenceItemRenderer.twoStrandedNode;

      if (!twoStrandedNode) {
        return;
      }

      modelChanges.merge(
        this.createHydrogenBondForTwoStrandedNode(twoStrandedNode),
      );
    }

    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
  }

  public deleteHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer) {
    const modelChanges = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const selections = SequenceRenderer.selections;

    if (selections.length) {
      selections.forEach((selectionRange) => {
        selectionRange.forEach((nodeSelection) => {
          modelChanges.merge(
            this.deleteHydrogenBondsForNode(nodeSelection.node.senseNode),
          );
          modelChanges.merge(
            this.deleteHydrogenBondsForNode(nodeSelection.node.antisenseNode),
          );
        });
      });
    } else {
      const node = sequenceItemRenderer.node;

      modelChanges.merge(this.deleteHydrogenBondsForNode(node));
    }

    modelChanges.addOperation(new ReinitializeModeOperation());
    editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
  }

  public destroy() {
    this.turnOffEditMode();
    SequenceRenderer.clear();
  }
}
