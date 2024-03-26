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
import { KetSerializer } from 'domain/serializers';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { SupportedFormat, identifyStructFormat } from 'application/formatters';
import { ChemicalMimeType } from 'domain/services';
import { ketcherProvider } from 'application/utils';

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

  public async onKeyDown(event: KeyboardEvent) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const isInput =
          event.target instanceof HTMLElement &&
          (event.target?.nodeName === 'INPUT' ||
            event.target?.nodeName === 'TEXTAREA');
        const editor = CoreEditor.provideEditorInstance();
        if (!isInput) {
          const hotKeys = initHotKeys(this.keyboardEventHandlers);
          const shortcutKey = keyNorm.lookup(hotKeys, event);
          this.keyboardEventHandlers[shortcutKey]?.handler(event);
        }
        editor.events.mouseLeaveSequenceItem.dispatch();
        resolve();
      }, 0);
    });
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
      const drawingEntities =
        editor.drawingEntitiesManager.getAllSelectedEntitiesForMonomers(
          monomers,
        );
      this.unselectAllEntities();
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

    this.handleConnectionWithCurrentNode(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
      newPeptide,
    );

    this.handleConnectionWithPreviousNodeInSameChain(
      previousNodeInSameChain,
      modelChanges,
      newPeptide,
      newNodePosition,
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

    this.handleConnectionWithCurrentNode(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
      nodeToAdd.lastMonomerInNode,
    );

    this.handleConnectionWithPreviousNodeInSameChain(
      previousNodeInSameChain,
      modelChanges,
      nodeToAdd.lastMonomerInNode,
      newNodePosition,
    );
    return modelChanges;
  }

  private handleConnectionWithCurrentNode(
    currentNode: SubChainNode,
    previousNodeInSameChain: SubChainNode,
    modelChanges: Command,
    monomerToAdd: BaseMonomer,
  ) {
    if (currentNode && !(currentNode instanceof EmptySequenceNode)) {
      const editor = CoreEditor.provideEditorInstance();
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
          monomerToAdd,
          currentNode?.firstMonomerInNode as BaseMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }
  }

  private handleConnectionWithPreviousNodeInSameChain(
    previousNodeInSameChain: SubChainNode,
    modelChanges: Command,
    monomerToAdd: BaseMonomer,
    newNodePosition: Vec2,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    if (
      previousNodeInSameChain &&
      !(previousNodeInSameChain instanceof Nucleoside)
    ) {
      modelChanges.merge(
        editor.drawingEntitiesManager.createPolymerBond(
          previousNodeInSameChain.lastMonomerInNode,
          monomerToAdd,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );
    }

    if (
      editor.sequenceTypeEnterMode !== SequenceType.PEPTIDE &&
      previousNodeInSameChain instanceof Nucleoside
    ) {
      modelChanges.merge(
        this.bondNodesThroughNewPhosphate(
          newNodePosition,
          previousNodeInSameChain.lastMonomerInNode,
          monomerToAdd,
        ),
      );
    }
  }

  private unsupportedSymbolsError(symbols: string | string[]) {
    const editor = CoreEditor.provideEditorInstance();
    editor.events.openErrorModal.dispatch({
      errorTitle: 'Unsupported symbols',
      errorMessage: `Ketcher doesn't support ${Array.from(symbols).map(
        (symbol) => `"${symbol}"`,
      )} symbol(s) in Sequence mode. Paste operation failed.`,
    });
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

          modelChanges.addOperation(new ReinitializeSequenceModeCommand());
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

  private copyToClipboard() {
    const editor = CoreEditor.provideEditorInstance();
    const drawingEntitiesManager = new DrawingEntitiesManager();
    editor.drawingEntitiesManager.selectedEntities.forEach(([, entity]) => {
      if (entity instanceof BaseMonomer) {
        drawingEntitiesManager.addMonomerChangeModel(
          entity.monomerItem,
          entity.position,
          entity,
        );
      } else if (entity instanceof PolymerBond && entity.secondMonomer) {
        const firstAttachmentPoint =
          entity.firstMonomer.getAttachmentPointByBond(entity);
        const secondAttachmentPoint =
          entity.secondMonomer?.getAttachmentPointByBond(entity);
        if (firstAttachmentPoint && secondAttachmentPoint) {
          drawingEntitiesManager.finishPolymerBondCreationModelChange(
            entity.firstMonomer,
            entity.secondMonomer,
            firstAttachmentPoint,
            secondAttachmentPoint,
            entity,
          );
        }
      }
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
      const needCenterStructure =
        editor.drawingEntitiesManager.allEntities.length === 0;

      let pasteRes;
      const clipboardData = await navigator.clipboard.read();
      const pastedStr = await getStructStringFromClipboardData(clipboardData);

      const format = identifyStructFormat(pastedStr);
      if (format === SupportedFormat.ket) {
        pasteRes = await this.pasteKetFormatFragment(pastedStr, editor);
        // TODO: check if the str is just simple sequence string rather than other format
      } else if (format === SupportedFormat.smiles) {
        pasteRes = await this.pasteSequence(pastedStr, editor);
      } else {
        editor.events.error.dispatch(
          'Pasted formats should only be sequence or KET.',
        );
      }
      const modelChanges = pasteRes?.modelChanges;
      if (!modelChanges) {
        return;
      }
      modelChanges.addOperation(new ReinitializeSequenceModeCommand());
      editor.renderersContainer.update(modelChanges);
      if (this.isEditMode && pasteRes?.newFragmentLength) {
        const newCaretPosition =
          SequenceRenderer.caretPosition + pasteRes.newFragmentLength;
        const moveCaretOperation = new RestoreSequenceCaretPositionCommand(
          SequenceRenderer.caretPosition,
          isNumber(newCaretPosition)
            ? newCaretPosition
            : SequenceRenderer.caretPosition,
        );
        modelChanges.addOperation(moveCaretOperation);
      }
      new EditorHistory(editor).update(modelChanges);
      this.scrollForViewMode(needCenterStructure);
    }
  }

  private checkSymbolsNotInNaturalAnalogues(str: string, editor: CoreEditor) {
    const symbolsNotInNaturalAnalogues: string[] = [];
    Array.from(str).forEach((symbol) => {
      if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
        if (!peptideNaturalAnalogues.includes(symbol.toUpperCase())) {
          symbolsNotInNaturalAnalogues.push(symbol);
        }
      } else {
        if (!rnaDnaNaturalAnalogues.includes(symbol.toUpperCase())) {
          symbolsNotInNaturalAnalogues.push(symbol);
        }
      }
    });
    if (symbolsNotInNaturalAnalogues.length > 0) {
      this.unsupportedSymbolsError(symbolsNotInNaturalAnalogues);
      return false;
    }
    return true;
  }

  private async pasteKetFormatFragment(pastedStr: string, editor: CoreEditor) {
    const newNodePosition = this.getNewNodePosition();
    const ketSerializer = new KetSerializer();
    const deserialisedKet = ketSerializer.deserializeToDrawingEntities(
      pastedStr,
      newNodePosition,
    );
    if (!deserialisedKet) {
      throw new Error('Error during parsing file');
    }
    const drawingEntitiesManager = deserialisedKet?.drawingEntitiesManager;
    assert(drawingEntitiesManager);
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManager.monomers.values(),
    ]);
    if (this.isEditMode) {
      if (!this.deleteSelection()) {
        return undefined;
      }
      if (chainsCollection.chains.length > 1) {
        editor.events.error.dispatch(
          'Paste of several fragments is prohibited in text-editing mode.',
        );
        return undefined;
      }
    }
    const { command: modelChanges, monomerToNewMonomer } =
      drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager);
    if (this.isEditMode) {
      // need to use the created monomer to init polymerbond, otherwise the bond and monomer will not match in rearrange process
      modelChanges.merge(
        this.insertNewSequenceFragment(chainsCollection, monomerToNewMonomer),
      );
    }
    return {
      modelChanges,
      newFragmentLength: chainsCollection.chains[0].firstSubChain.length,
    };
  }

  private async pasteSequence(pastedStr: string, editor: CoreEditor) {
    const trimedStr = pastedStr.trim();
    if (!this.checkSymbolsNotInNaturalAnalogues(trimedStr, editor)) {
      return undefined;
    }
    const indigo = ketcherProvider.getKetcher().indigo;
    const ketStruct = await indigo.convert(trimedStr.toUpperCase(), {
      outputFormat: ChemicalMimeType.KET,
      inputFormat: ChemicalMimeType[editor.sequenceTypeEnterMode],
    });
    return await this.pasteKetFormatFragment(ketStruct.struct, editor);
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
      chainsCollection.chains[0].firstSubChain.lastNode.lastMonomerInNode,
    );
    assert(lastMonomerOfNewFragment);
    this.handleConnectionWithCurrentNode(
      currentNode,
      previousNodeInSameChain,
      modelChanges,
      lastMonomerOfNewFragment,
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
    );
    return modelChanges;
  }

  private scrollForViewMode(needCenterStructure = false) {
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

  private getNewNodePosition() {
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
