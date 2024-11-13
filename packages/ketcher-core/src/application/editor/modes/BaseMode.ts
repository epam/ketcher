import { Command } from 'domain/entities/Command';
import { SelectLayoutModeOperation } from '../operations/polymerBond';
import { CoreEditor, EditorHistory } from '../internal';
import {
  DEFAULT_LAYOUT_MODE,
  LayoutMode,
  modesMap,
} from 'application/editor/modes';
import {
  getStructStringFromClipboardData,
  initHotKeys,
  isClipboardAPIAvailable,
  keyNorm,
  legacyCopy,
  legacyPaste,
} from 'utilities';
import { BaseMonomer, Struct, Vec2 } from 'domain/entities';
import {
  identifyStructFormat,
  macromoleculesFilesInputFormats,
  SupportedFormat,
} from 'application/formatters';
import { KetSerializer } from 'domain/serializers';
import { ChemicalMimeType } from 'domain/services';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { ketcherProvider } from 'application/utils';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { AttachmentPointName } from 'domain/types';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/Bond';

export abstract class BaseMode {
  private _pasteIsInProgress = false;

  protected constructor(
    public modeName: LayoutMode,
    public previousMode: LayoutMode = DEFAULT_LAYOUT_MODE,
  ) {}

  private changeMode(editor: CoreEditor, modeName: LayoutMode, isUndo = false) {
    editor.events.layoutModeChange.dispatch(modeName);
    const ModeConstructor = modesMap[modeName];
    editor.mode.destroy();
    editor.setMode(new ModeConstructor());
    editor.mode.initialize(true, isUndo, false);
  }

  public initialize(
    needRemoveSelection = true,
    _isUndo = false,
    _needReArrangeChains = false,
  ) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

    command.addOperation(
      new SelectLayoutModeOperation(
        this.changeMode.bind(this, editor, this.modeName),
        this.changeMode.bind(this, editor, this.previousMode, true),
        this.modeName,
        this.previousMode,
      ),
    );

    if (needRemoveSelection) {
      editor.events.selectTool.dispatch('select-rectangle');
    }

    return command;
  }

  async onKeyDown(event: KeyboardEvent) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const editor = CoreEditor.provideEditorInstance();
        if (!this.checkIfTargetIsInput(event)) {
          const hotKeys = initHotKeys(this.keyboardEventHandlers);
          const shortcutKey = keyNorm.lookup(hotKeys, event);
          this.keyboardEventHandlers[shortcutKey]?.handler(event);
        }
        editor.events.mouseLeaveSequenceItem.dispatch();
        resolve();
      }, 0);
    });
  }

  get keyboardEventHandlers() {
    return {};
  }

  abstract getNewNodePosition();

  abstract applyAdditionalPasteOperations(
    _drawingEntitiesManager: DrawingEntitiesManager,
  ): Command;

  abstract isPasteAllowedByMode(
    drawingEntitiesManager: DrawingEntitiesManager,
  ): boolean;

  abstract isPasteAvailable(
    drawingEntitiesManager: DrawingEntitiesManager,
  ): boolean;

  abstract scrollForView(): void;

  onCopy(event: ClipboardEvent) {
    if (this.checkIfTargetIsInput(event)) {
      return;
    }
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
        if (
          firstAttachmentPoint &&
          secondAttachmentPoint &&
          entity.firstMonomer.selected &&
          entity.secondMonomer?.selected
        ) {
          drawingEntitiesManager.finishPolymerBondCreationModelChange(
            entity.firstMonomer,
            entity.secondMonomer,
            firstAttachmentPoint,
            secondAttachmentPoint,
            undefined,
            entity,
          );
        }
      } else if (entity instanceof HydrogenBond && entity.secondMonomer) {
        drawingEntitiesManager.finishPolymerBondCreationModelChange(
          entity.firstMonomer,
          entity.secondMonomer,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
          entity,
        );
      }
    });
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serialize(
      new Struct(),
      drawingEntitiesManager,
    );
    if (isClipboardAPIAvailable()) {
      navigator.clipboard.writeText(serializedKet);
    } else {
      legacyCopy(event.clipboardData, {
        'text/plain': serializedKet,
      });
      event.preventDefault();
    }
  }

  async onPaste(event: ClipboardEvent) {
    if (this.checkIfTargetIsInput(event)) {
      return;
    }
    const editor = CoreEditor.provideEditorInstance();
    const isCanvasEmptyBeforePaste =
      !editor.drawingEntitiesManager.hasDrawingEntities;

    if (isClipboardAPIAvailable()) {
      const isSequenceEditInRNABuilderMode =
        CoreEditor.provideEditorInstance().isSequenceEditInRNABuilderMode;

      if (isSequenceEditInRNABuilderMode || this._pasteIsInProgress) return;
      this._pasteIsInProgress = true;

      const clipboardData = await navigator.clipboard.read();
      this.pasteFromClipboard(clipboardData).finally(() => {
        this._pasteIsInProgress = false;

        if (!isCanvasEmptyBeforePaste) {
          return;
        }

        editor.zoomToStructuresIfNeeded();
      });
    } else {
      const clipboardData = legacyPaste(event.clipboardData, ['text/plain']);
      this.pasteFromClipboard(clipboardData);
      event.preventDefault();

      if (!isCanvasEmptyBeforePaste) {
        return;
      }

      editor.zoomToStructuresIfNeeded();
    }
  }

  async pasteFromClipboard(clipboardData) {
    let modelChanges;
    const editor = CoreEditor.provideEditorInstance();
    const pastedStr = await getStructStringFromClipboardData(clipboardData);
    const format = identifyStructFormat(pastedStr, true);
    if (format === SupportedFormat.ket) {
      modelChanges = this.pasteKetFormatFragment(pastedStr);
    } else {
      let inputFormat;
      let isSequenceOrFasta = false;
      switch (format) {
        case SupportedFormat.sequence:
          inputFormat =
            macromoleculesFilesInputFormats.seq[
              editor.sequenceTypeEnterMode.toLowerCase()
            ];
          isSequenceOrFasta = true;
          break;
        case SupportedFormat.fasta:
          inputFormat =
            macromoleculesFilesInputFormats.fasta[
              editor.sequenceTypeEnterMode.toLowerCase()
            ];
          isSequenceOrFasta = true;
          break;
        case SupportedFormat.molV3000:
          inputFormat = macromoleculesFilesInputFormats.mol;
          break;
        default:
          break;
      }

      modelChanges = await this.pasteWithIndigoConversion(
        pastedStr,
        inputFormat,
        isSequenceOrFasta,
      );
    }

    if (!modelChanges || modelChanges.operations.length === 0) {
      return;
    }
    editor.renderersContainer.update(modelChanges);
    new EditorHistory(editor).update(modelChanges);
    this.scrollForView();
  }

  pasteKetFormatFragment(pastedStr: string) {
    const editor = CoreEditor.provideEditorInstance();
    const ketSerializer = new KetSerializer();
    const deserialisedKet =
      ketSerializer.deserializeToDrawingEntities(pastedStr);
    if (!deserialisedKet) {
      throw new Error('Error during parsing file');
    }
    const drawingEntitiesManager = deserialisedKet?.drawingEntitiesManager;

    if (
      !drawingEntitiesManager ||
      !this.isPasteAllowedByMode(drawingEntitiesManager)
    ) {
      return;
    }
    if (!this.isPasteAvailable(drawingEntitiesManager)) {
      editor.events.openErrorModal.dispatch({
        errorTitle: 'Error Message',
        errorMessage:
          'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      });
      return;
    }

    this.updateEntitiesPosition(drawingEntitiesManager);
    const { command: modelChanges, mergedDrawingEntities } =
      drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager);

    modelChanges.merge(
      this.applyAdditionalPasteOperations(mergedDrawingEntities),
    );

    return modelChanges;
  }

  async pasteWithIndigoConversion(
    pastedStr: string,
    inputFormat: ChemicalMimeType,
    isSequenceOrFasta = false,
  ) {
    const indigo = ketcherProvider.getKetcher().indigo;
    try {
      const ketStruct = await indigo.convert(
        isSequenceOrFasta ? pastedStr.toUpperCase() : pastedStr,
        {
          outputFormat: ChemicalMimeType.KET,
          inputFormat,
        },
      );

      return this.pasteKetFormatFragment(ketStruct.struct);
    } catch (error) {
      const stringError =
        typeof error === 'string' ? error : JSON.stringify(error);
      const errorMessage = 'Convert error! ' + stringError;

      this.unsupportedSymbolsError(errorMessage, isSequenceOrFasta);

      return new Command();
    }
  }

  private updateEntitiesPosition(
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const newNodePosition = this.getNewNodePosition();
    const firstEntityPosition =
      drawingEntitiesManager.allEntities[0]?.[1].position;
    const offset = Vec2.diff(newNodePosition, new Vec2(firstEntityPosition));

    drawingEntitiesManager.allEntities.forEach(([, drawindEntity]) => {
      drawingEntitiesManager.moveDrawingEntityModelChange(
        drawindEntity,
        offset,
      );
    });
  }

  unsupportedSymbolsError(errorMessage: string, isSequenceOrFasta = false) {
    const editor = CoreEditor.provideEditorInstance();
    editor.events.openErrorModal.dispatch({
      errorTitle: isSequenceOrFasta ? 'Unsupported symbols' : 'Error',
      errorMessage,
    });
  }

  private checkIfTargetIsInput(event: Event) {
    return (
      event.target instanceof HTMLElement &&
      (event.target?.nodeName === 'INPUT' ||
        event.target?.nodeName === 'TEXTAREA')
    );
  }

  public destroy() {}
}
