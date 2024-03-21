import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  NodesSelection,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import {
  getStructStringFromClipboardData,
  initHotKeys,
  isClipboardAPIAvailable,
  keyNorm,
} from 'utilities';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { BaseMonomer, SequenceType, Struct, Vec2 } from 'domain/entities';
import { BaseRenderer } from 'application/render/renderers/internal';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import {
  ReinitializeSequenceModeCommand,
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
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { KetSerializeStructStr } from 'application/utils';
import { KetSerializer } from 'domain/serializers';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { MONOMER_CONST } from '../operations';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';

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

  public onKeyDown(event: KeyboardEvent) {
    const hotKeys = initHotKeys(this.keyboardEventHandlers);
    const shortcutKey = keyNorm.lookup(hotKeys, event);

    this.keyboardEventHandlers[shortcutKey]?.handler(event);

    return true;
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
      const modelChanges = new Command();
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
      const drawingEntities = monomers.reduce(
        (drawingEntities: DrawingEntity[], monomer: BaseMonomer) => {
          return drawingEntities.concat(
            editor.drawingEntitiesManager.getAllSelectedEntities(monomer),
          );
        },
        [],
      );

      modelChanges.merge(
        editor.drawingEntitiesManager.selectDrawingEntities(drawingEntities),
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
    previousNode: SubChainNode,
    nextNode: SubChainNode,
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
        previousNode.lastMonomerInNode,
        additionalPhosphate,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ),
    );

    modelChanges.merge(
      editor.drawingEntitiesManager.createPolymerBond(
        additionalPhosphate,
        nextNode.firstMonomerInNode,
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

    if (!(currentNode instanceof EmptySequenceNode)) {
      if (previousNodeInSameChain) {
        const r2Bond =
          previousNodeInSameChain?.lastMonomerInNode.attachmentPointsToBonds.R2;
        assert(r2Bond);
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(r2Bond),
        );
      }

      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          newPeptide,
          currentNode?.firstMonomerInNode as BaseMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }

    if (previousNodeInSameChain) {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          previousNodeInSameChain.lastMonomerInNode,
          newPeptide,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }

    return modelChanges;
  }

  private handleRnaDnaNodeAddition(
    enteredSymbol: string,
    currentNode: SubChainNode,
    previousNodeInSameChain: SubChainNode,
    newNodePosition: Vec2,
  ) {
    if (!rnaDnaNaturalAnalogues.includes(enteredSymbol)) {
      return undefined;
    }

    const modelChanges = new Command();
    const editor = CoreEditor.provideEditorInstance();
    const { modelChanges: addedNodeModelChanges, node: nodeToAdd } =
      currentNode instanceof Nucleotide || currentNode instanceof Nucleoside
        ? Nucleotide.createOnCanvas(enteredSymbol, newNodePosition)
        : Nucleoside.createOnCanvas(enteredSymbol, newNodePosition);

    modelChanges.merge(addedNodeModelChanges);

    if (!(currentNode instanceof EmptySequenceNode)) {
      if (previousNodeInSameChain) {
        const r2Bond =
          previousNodeInSameChain?.lastMonomerInNode.attachmentPointsToBonds.R2;
        assert(r2Bond);
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(r2Bond),
        );
      }

      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          nodeToAdd.lastMonomerInNode,
          currentNode?.firstMonomerInNode as BaseMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }

    if (previousNodeInSameChain instanceof Nucleoside) {
      modelChanges.merge(
        this.bondNodesThroughNewPhosphate(
          newNodePosition,
          previousNodeInSameChain,
          nodeToAdd,
        ),
      );
    } else if (previousNodeInSameChain) {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          previousNodeInSameChain.lastMonomerInNode,
          nodeToAdd.firstMonomerInNode,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }

    return modelChanges;
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
    modelChanges.addOperation(new ReinitializeSequenceModeCommand());
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

      if (!nodeInSameChainBeforeSelection && nodeAfterSelection) {
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
            nodeBeforeSelection,
            nodeAfterSelection,
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

  private get keyboardEventHandlers() {
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
          const selections = SequenceRenderer.selections;

          if (selections.length > 1) {
            return;
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

          modelChanges.addOperation(new ReinitializeSequenceModeCommand());
          editor.renderersContainer.update(modelChanges);
          modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          history.update(modelChanges);
        },
      },
      'sequence-edit-select': {
        shortcut: ['Shift+ArrowLeft', 'Shift+ArrowRight'],
        handler: (event) => {
          if (!this.isEditMode) {
            return;
          }
          this.selectionStartCaretPosition =
            this.selectionStartCaretPosition !== -1
              ? this.selectionStartCaretPosition
              : SequenceRenderer.caretPosition;
          SequenceRenderer.shiftArrowSelectionInEditMode(event);
        },
      },
      copy: {
        shortcut: ['Mod+c'],
        handler: () => this.copyToClipboard(),
      },
      paste: {
        shortcut: ['Mod+v'],
        handler: () => this.pasteFromClipboard(),
      },
    };
  }

  private async getValidatePastedDrawingEntities() {
    if (isClipboardAPIAvailable()) {
      let newNodePosition;
      // need to update the new pasted monomers' position, cause the pasted sequences is disorderd
      // should be done during paste, cause when we copy from system files, we cant controll the monomers' position during copy
      if (this.isEditMode) {
        const previousNode =
          SequenceRenderer.previousFromCurrentEdittingMonomer;
        const nodeBeforePreviousNode = previousNode
          ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
          : undefined;
        newNodePosition = this.getNewSequenceItemPosition(
          previousNode,
          nodeBeforePreviousNode,
        );
      } else {
        newNodePosition =
          SequenceRenderer.chainsCollection.chains.length > 0 &&
          !this.isEditMode
            ? SequenceRenderer.getNextChainPosition(
                SequenceRenderer.lastChainStartPosition,
                SequenceRenderer.lastChain,
              )
            : undefined;
      }
      const editor = CoreEditor.provideEditorInstance();
      const clipboardData = await navigator.clipboard.read();
      const structStr = await getStructStringFromClipboardData(clipboardData);
      const drawingEntitiesManager = KetSerializeStructStr(
        structStr,
        newNodePosition,
      );
      if (drawingEntitiesManager) {
        for (const [, monomer] of drawingEntitiesManager.monomers) {
          if (
            (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE &&
              monomer.monomerItem.props.MonomerType !==
                MONOMER_CONST.PEPTIDE) ||
            (editor.sequenceTypeEnterMode !== SequenceType.PEPTIDE &&
              (monomer.monomerItem.props.MonomerType !== MONOMER_CONST.RNA ||
                monomer.monomerItem.props.MonomerType !== MONOMER_CONST.DNA))
          ) {
            throw Error(
              `All the contents should be in ${editor.sequenceTypeEnterMode} mode`,
            );
          }
        }
      } else {
        throw Error('parsing error');
      }
      return drawingEntitiesManager;
    }
    throw Error(
      "Your version of browser doesn't support pasting clipboard content via navigator API. Please use the lasted version instead.",
    );
  }

  private insertNewSequenceItem(editor: CoreEditor, enteredSymbol: string) {
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNode = SequenceRenderer.previousFromCurrentEdittingMonomer;
    const nodeBeforePreviousNode = previousNode
      ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
      : undefined;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;

    const newNodePosition = this.getNewSequenceItemPosition(
      previousNode,
      nodeBeforePreviousNode,
    );

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

  private insertNewSequenceFragment(chainsCollection: ChainsCollection) {
    const editor = CoreEditor.provideEditorInstance();
    const currentNode = SequenceRenderer.currentEdittingNode;
    const previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
    const modelChanges = new Command();
    if (!(currentNode instanceof EmptySequenceNode)) {
      if (previousNodeInSameChain) {
        const r2Bond =
          previousNodeInSameChain?.lastMonomerInNode.attachmentPointsToBonds.R2;
        assert(r2Bond);
        modelChanges.merge(
          editor.drawingEntitiesManager.deletePolymerBond(r2Bond),
        );
      }
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          chainsCollection.chains[0].firstSubChain.lastNode.lastMonomerInNode,
          currentNode?.firstMonomerInNode as BaseMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }
    if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
      if (previousNodeInSameChain) {
        modelChanges.merge(
          editor.drawingEntitiesManager.createPolymerBond(
            previousNodeInSameChain.lastMonomerInNode as BaseMonomer,
            chainsCollection.firstNode.firstMonomerInNode,
            AttachmentPointName.R2,
            AttachmentPointName.R1,
          ),
        );
      }
    } else {
      if (previousNodeInSameChain instanceof Nucleoside) {
        const previousNode =
          SequenceRenderer.previousFromCurrentEdittingMonomer;
        const nodeBeforePreviousNode = previousNode
          ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
          : undefined;
        const previousNodeInSameChain =
          SequenceRenderer.previousNodeInSameChain;

        const newNodePosition = this.getNewSequenceItemPosition(
          previousNode,
          nodeBeforePreviousNode,
        );
        modelChanges.merge(
          this.bondNodesThroughNewPhosphate(
            newNodePosition,
            previousNodeInSameChain,
            chainsCollection.firstNode,
          ),
        );
      } else if (previousNodeInSameChain) {
        modelChanges.merge(
          editor.drawingEntitiesManager.createPolymerBond(
            previousNodeInSameChain.lastMonomerInNode,
            chainsCollection.firstNode.firstMonomerInNode,
            AttachmentPointName.R2,
            AttachmentPointName.R1,
          ),
        );
      }
    }
    return modelChanges;
  }

  private copyToClipboard() {
    const nodeSelections = SequenceRenderer.selections;
    const drawingEntitiesManager = new DrawingEntitiesManager();
    nodeSelections.forEach((selectionRange) => {
      selectionRange.forEach((node) => {
        drawingEntitiesManager.addMonomerChangeModel(
          node.node.monomer.monomerItem,
          node.node.monomer.position,
          node.node.monomer,
        );
        node.node.monomer.forEachBond((bond) => {
          const firstAttachmentPoint =
            bond.firstMonomer.getAttachmentPointByBond(bond);
          const secondAttachmentPoint =
            bond.secondMonomer?.getAttachmentPointByBond(bond);
          if (
            bond.firstMonomer.selected &&
            bond.secondMonomer?.selected &&
            firstAttachmentPoint &&
            secondAttachmentPoint
          ) {
            drawingEntitiesManager.finishPolymerBondCreationModelChange(
              bond.firstMonomer,
              bond.secondMonomer,
              firstAttachmentPoint,
              secondAttachmentPoint,
              bond,
            );
          }
        });
      });
    });
    const ketSerializer = new KetSerializer();
    const { serializedMacromolecules } = ketSerializer.serializeMacromolecules(
      new Struct(),
      drawingEntitiesManager,
    );
    if (isClipboardAPIAvailable()) {
      const clipboardItemString = JSON.stringify(serializedMacromolecules);
      navigator.clipboard.writeText(clipboardItemString);
    }
  }

  private async pasteFromClipboard() {
    if (isClipboardAPIAvailable()) {
      const editor = CoreEditor.provideEditorInstance();
      const drawingEntitiesManager =
        await this.getValidatePastedDrawingEntities();
      const modelChanges = drawingEntitiesManager.mergeInto(
        editor.drawingEntitiesManager,
      );
      if (this.isEditMode) {
        const chainsCollection = ChainsCollection.fromMonomers([
          ...drawingEntitiesManager.monomers.values(),
        ]);
        chainsCollection.rearrange();
        if (chainsCollection.chains.length > 1) {
          // TODO: could several fragments be pasted? or just several fragments (which are not connected through R2-R1 bonds) should be prohibited to be pasted?
          throw new Error(
            'Paste of several fragments should be prohibited in text-editing mode.',
          );
        } else {
          modelChanges.merge(this.insertNewSequenceFragment(chainsCollection));
        }
      }
      new EditorHistory(editor).update(modelChanges);
      editor.renderersContainer.update(modelChanges);
      editor.events.selectMode.dispatch({
        mode: 'sequence-layout-mode',
        mergeWithLatestHistoryCommand: true,
      });
      if (!this.isEditMode) {
        const needCenterStructure =
          editor.drawingEntitiesManager.allEntities.length === 0;
        const zoom = ZoomTool.instance;
        if (needCenterStructure) {
          const structCenterY = SequenceRenderer.getSequenceStructureCenterY();
          zoom.scrollToVerticalCenter(structCenterY);
        } else {
          zoom.scrollToVerticalBottom();
        }
      }
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
