import { Command } from 'domain/entities/Command';
import { DrawingEntitySelectOperation } from '../operations/drawingEntity';
import { PastePreview } from '../PastePreview';
import { getRGroupDefinitions } from 'domain/helpers/rGroupDefinitions';
import { SelectLayoutModeOperation } from '../operations/polymerBond';
import { EditorHistory } from '../EditorHistory';
import type { CoreEditor } from '../Editor';
import { provideEditorInstance } from '../editorSingleton';
import { type LayoutMode, DEFAULT_LAYOUT_MODE } from './types';
import { getModeConstructor } from './modesRegistry';
import {
  type ClipboardData,
  getStructStringFromClipboardData,
  initHotKeys,
  isClipboardAPIAvailable,
  isSelectionOutsideElement,
  KetcherLogger,
  keyNorm,
  legacyCopy,
  legacyPaste,
  getSvgFromDrawnStructures,
  normalizeError,
  PLAIN_TEXT_MIME_TYPE,
  convertSvgToPng,
} from 'utilities';
import { type SequenceType, Struct, Vec2 } from 'domain/entities';
import { identifyStructFormat } from 'application/formatters/identifyStructFormat';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { ketcherProvider } from 'application/ketcherProvider';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

type KeyboardEventHandler = {
  shortcut: string | string[];
  handler: (event: KeyboardEvent) => void;
};

type KeyboardEventHandlers = Record<string, KeyboardEventHandler>;

export abstract class BaseMode {
  private _pasteIsInProgress = false;
  private pastePreview?: PastePreview;

  protected constructor(
    public modeName: LayoutMode,
    public previousMode: LayoutMode = DEFAULT_LAYOUT_MODE,
  ) {}

  public get isAntisenseEditMode(): boolean {
    return false;
  }

  public get isSyncEditMode(): boolean {
    return false;
  }

  private changeMode(
    editor: CoreEditor,
    modeName: LayoutMode,
    isUndo = false,
  ): void {
    editor.events.layoutModeChange.dispatch(modeName);
    const ModeConstructor = getModeConstructor(modeName);
    editor.mode.destroy();
    editor.setMode(new ModeConstructor());
    editor.mode.initialize(true, isUndo, false);
  }

  public initialize(
    needRemoveSelection = true,
    _isUndo = false,
    _needReArrangeChains = false,
    _forceRecalculateAntisense = false,
  ): Command {
    const command = new Command();
    const editor = provideEditorInstance();

    command.addOperation(
      new SelectLayoutModeOperation(
        this.changeMode.bind(this, editor, this.modeName),
        this.changeMode.bind(this, editor, this.previousMode, true),
        this.modeName,
        this.previousMode,
      ),
    );

    if (needRemoveSelection) {
      editor.events.selectSelectionTool.dispatch();
    }

    return command;
  }

  async onKeyDown(event: KeyboardEvent): Promise<void> {
    if (!this.checkIfTargetIsInput(event)) {
      const hotKeys = initHotKeys(this.keyboardEventHandlers);
      const shortcutKey = keyNorm.lookup(hotKeys, event)?.[0];

      if (shortcutKey && this.keyboardEventHandlers[shortcutKey]) {
        if (shortcutKey === 'start-new-sequence') {
          event.preventDefault();
        }
        event.stopImmediatePropagation();
      }
    }
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const editor = provideEditorInstance();
        if (!this.checkIfTargetIsInput(event)) {
          const hotKeys = initHotKeys(this.keyboardEventHandlers);
          const shortcutKey = keyNorm.lookup(hotKeys, event)?.[0];
          if (shortcutKey) {
            this.keyboardEventHandlers[shortcutKey]?.handler(event);
          }
        }
        editor.events.mouseLeaveSequenceItem.dispatch();
        resolve();
      }, 0);
    });
  }

  get keyboardEventHandlers(): KeyboardEventHandlers {
    return {};
  }

  abstract getNewNodePosition(): Vec2;

  abstract applyAdditionalPasteOperations(
    _drawingEntitiesManager: DrawingEntitiesManager,
  ): Command;

  abstract isPasteAllowedByMode(
    drawingEntitiesManager: DrawingEntitiesManager,
  ): boolean;

  abstract isPasteAvailable(
    drawingEntitiesManager: DrawingEntitiesManager,
  ): boolean;

  abstract scrollForView(): void | Promise<void>;

  onCopy(event?: ClipboardEvent): void {
    if (
      event &&
      (this.checkIfTargetIsInput(event) || this.isSelectionOutsideCanvas())
    ) {
      return;
    }
    const editor = provideEditorInstance();
    const drawingEntitiesManager =
      editor.drawingEntitiesManager.filterSelection();
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serialize(
      new Struct(),
      drawingEntitiesManager,
    );
    if (isClipboardAPIAvailable()) {
      this.writeToClipboard(serializedKet, drawingEntitiesManager);
    } else if (event) {
      legacyCopy(event.clipboardData, {
        [PLAIN_TEXT_MIME_TYPE]: serializedKet,
      });
      event.preventDefault();
    }
  }

  onCut(event?: ClipboardEvent): void {
    if (
      event &&
      (this.checkIfTargetIsInput(event) || this.isSelectionOutsideCanvas())
    ) {
      return;
    }

    const editor = provideEditorInstance();

    // Check if there's anything selected to cut
    if (editor.drawingEntitiesManager.selectedEntities.length === 0) {
      return;
    }

    this.onCopy(event);

    editor.events.deleteSelectedStructure.dispatch();

    if (event) {
      event.preventDefault();
    }
  }

  async onCopyAs(format: 'ket' | 'mol' | 'image'): Promise<void> {
    const editor = provideEditorInstance();

    if (editor.drawingEntitiesManager.selectedEntities.length === 0) {
      return;
    }

    try {
      if (format === 'image') {
        await this.copyCanvasAsImage();
        return;
      }

      const drawingEntitiesManager =
        editor.drawingEntitiesManager.filterSelection();
      const serializedKet = new KetSerializer().serialize(
        new Struct(),
        drawingEntitiesManager,
      );
      const text =
        format === 'mol'
          ? await this.convertKetToMol(serializedKet)
          : serializedKet;

      await navigator.clipboard.writeText(text);
    } catch (error) {
      KetcherLogger.error('BaseMode.ts::onCopyAs', error);
      editor.events.openErrorModal.dispatch({
        errorTitle: 'Error Message',
        errorMessage: normalizeError(error).message,
      });
    }
  }

  /**
   * Copies the canvas as a PNG image, the same way as "Save as SVG Document"
   * exports it (monomers are drawn as they look on the canvas).
   */
  private async copyCanvasAsImage(): Promise<void> {
    const editor = provideEditorInstance();
    const svg = getSvgFromDrawnStructures(editor.canvas, 'file');

    if (!svg) {
      throw new Error('Cannot get drawn structures!');
    }

    const image = await convertSvgToPng(svg, window.devicePixelRatio || 1);

    await navigator.clipboard.write([
      new ClipboardItem({ [image.type]: image }),
    ]);
  }

  private async convertKetToMol(ket: string): Promise<string> {
    const editor = provideEditorInstance();
    const ketcher = ketcherProvider.getKetcher(editor.ketcherId);
    const result = await ketcher.structService.convert(
      { struct: ket, output_format: ChemicalMimeType.Mol },
      { 'molfile-saving-mode': '3000' },
    );

    return result.struct;
  }

  /**
   * Puts the copied structure on the clipboard. By default only KET is written
   * as plain text; modes can override it to add other formats.
   */
  protected writeToClipboard(
    serializedKet: string,
    _drawingEntitiesManager: DrawingEntitiesManager,
  ): void | Promise<void> {
    navigator.clipboard.writeText(serializedKet);
  }

  async onPaste(event?: ClipboardEvent): Promise<void> {
    if (event && this.checkIfTargetIsInput(event)) {
      return;
    }
    if (isClipboardAPIAvailable()) {
      const isSequenceEditInRNABuilderMode =
        provideEditorInstance().isSequenceEditInRNABuilderMode;

      if (isSequenceEditInRNABuilderMode || this._pasteIsInProgress) return;
      this._pasteIsInProgress = true;

      const clipboardData = await navigator.clipboard.read();
      this.pasteFromClipboard(clipboardData).finally(() => {
        this._pasteIsInProgress = false;
      });
    } else if (event) {
      const clipboardData = legacyPaste(event.clipboardData, [
        PLAIN_TEXT_MIME_TYPE,
      ]);
      this.pasteFromClipboard(clipboardData);
      event.preventDefault();
    } else {
      KetcherLogger.warn(
        'Cannot paste because Clipboard API is not available and paste event does not contain clipboardData',
      );
    }
  }

  async isPasteContentValid(pastedStr: string): Promise<boolean> {
    if (!pastedStr.trim()) {
      return false;
    }

    try {
      const editor = provideEditorInstance();
      const format = identifyStructFormat(pastedStr, true);
      let ketStruct = pastedStr;

      if (format !== SupportedFormat.ket) {
        const indigo = ketcherProvider.getKetcher(editor.ketcherId).indigo;
        const convertedStruct = await indigo.convert(pastedStr, {
          outputFormat: ChemicalMimeType.KET,
          sequenceType: editor.sequenceTypeEnterMode,
        });

        ketStruct = convertedStruct.struct;
      }

      const ketSerializer = new KetSerializer();
      const deserialisedKet =
        ketSerializer.deserializeToDrawingEntities(ketStruct);
      const drawingEntitiesManager = deserialisedKet?.drawingEntitiesManager;

      return Boolean(
        drawingEntitiesManager &&
        this.isPasteAllowedByMode(drawingEntitiesManager),
      );
    } catch (error) {
      KetcherLogger.error('BaseMode.ts::isPasteContentValid', error);
      return false;
    }
  }

  async pasteFromClipboard(clipboardData: ClipboardData): Promise<void> {
    let pasteOperations: Command | undefined;
    const editor = provideEditorInstance();
    this.pastePreview?.cancel();
    const preview = !editor.isSequenceAnyEditMode;
    const wasEmpty = !editor.drawingEntitiesManager.hasDrawingEntities;
    const pastedStr = await getStructStringFromClipboardData(clipboardData);
    if (!pastedStr?.trim()) {
      return;
    }
    const format = identifyStructFormat(pastedStr, true);
    if (format === SupportedFormat.ket) {
      pasteOperations = this.pasteKetFormatFragment(pastedStr, preview);
    } else {
      pasteOperations = await this.pasteWithIndigoConversion(
        pastedStr,
        editor.sequenceTypeEnterMode,
        preview,
      );
    }

    if (!pasteOperations || pasteOperations.operations.length === 0) {
      return;
    }

    await this.applyPasteCommand(pasteOperations, wasEmpty);
  }

  private async applyPasteCommand(
    command: Command,
    wasEmpty: boolean,
  ): Promise<void> {
    const editor = provideEditorInstance();
    editor.drawingEntitiesManager.detectBondsOverlappedByMonomers();
    editor.renderersContainer.update(command);
    EditorHistory.getInstance(editor).update(command);
    editor.events.mouseLeaveSequenceItem.dispatch();
    if (wasEmpty) editor.zoomToStructuresIfNeeded();
    await this.scrollForView();
  }

  pasteKetFormatFragment(
    pastedStr: string,
    preview = false,
  ): Command | undefined {
    const editor = provideEditorInstance();
    const ketSerializer = new KetSerializer();
    const deserialisedKet =
      ketSerializer.deserializeToDrawingEntities(pastedStr);
    if (!deserialisedKet) {
      throw new Error('Error during parsing file');
    }
    const drawingEntitiesManager = deserialisedKet?.drawingEntitiesManager;

    if (
      !drawingEntitiesManager?.hasDrawingEntities ||
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

    const hasRGroupDefinitions =
      getRGroupDefinitions(
        drawingEntitiesManager.atoms.values(),
        drawingEntitiesManager.bonds.values(),
      ).size > 0;
    if (preview && hasRGroupDefinitions) {
      if (editor.mode !== this) return;
      this.pastePreview?.cancel();
      this.pastePreview = new PastePreview(
        editor,
        drawingEntitiesManager,
        (position) => {
          const wasEmpty = !editor.drawingEntitiesManager.hasDrawingEntities;
          const command = this.placePastedEntities(
            drawingEntitiesManager,
            position,
          );
          this.applyPasteCommand(command, wasEmpty).catch((error) =>
            KetcherLogger.error('BaseMode.ts::confirmPaste', error),
          );
        },
      );
      return;
    }
    return this.placePastedEntities(drawingEntitiesManager);
  }

  private placePastedEntities(
    drawingEntitiesManager: DrawingEntitiesManager,
    position?: Vec2,
  ): Command {
    const editor = provideEditorInstance();
    this.updateEntitiesPosition(drawingEntitiesManager, position);
    editor.calculateAndStoreNextAutochainPosition(drawingEntitiesManager);

    const { command: modelChanges, mergedDrawingEntities } =
      drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager);

    modelChanges.merge(
      this.applyAdditionalPasteOperations(mergedDrawingEntities),
    );

    if (position) {
      const selected = editor.drawingEntitiesManager.selectedEntitiesArr;
      modelChanges.merge(
        editor.drawingEntitiesManager.unselectAllDrawingEntities(),
      );
      // Paste selection callbacks run when the command executes (including redo).
      // Clear their selection here without changing ordinary selection commands.
      selected.forEach((entity) =>
        modelChanges.addOperation(
          new DrawingEntitySelectOperation(entity, () =>
            entity.turnOffSelection(),
          ),
        ),
      );
    }

    return modelChanges;
  }

  async pasteWithIndigoConversion(
    pastedStr: string,
    sequenceType: SequenceType,
    preview = false,
  ): Promise<Command | undefined> {
    const editor = provideEditorInstance();
    const indigo = ketcherProvider.getKetcher(editor.ketcherId).indigo;
    try {
      const ketStruct = await indigo.convert(pastedStr, {
        outputFormat: ChemicalMimeType.KET,
        sequenceType,
      });

      return this.pasteKetFormatFragment(ketStruct.struct, preview);
    } catch (error) {
      const stringError = normalizeError(error).message;
      const errorMessage = 'Convert error! ' + stringError;

      this.unsupportedSymbolsError(errorMessage);

      return new Command();
    }
  }

  private updateEntitiesPosition(
    drawingEntitiesManager: DrawingEntitiesManager,
    position?: Vec2,
  ): void {
    const newNodePosition = position ?? this.getNewNodePosition();
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

  unsupportedSymbolsError(errorMessage: string): void {
    const editor = provideEditorInstance();
    editor.events.openErrorModal.dispatch({
      errorTitle: 'Error',
      errorMessage,
    });
  }

  private checkIfTargetIsInput(event: Event): boolean {
    return (
      event.target instanceof HTMLElement &&
      (event.target?.nodeName === 'INPUT' ||
        event.target?.nodeName === 'TEXTAREA' ||
        event.target.contentEditable === 'true')
    );
  }

  private isSelectionOutsideCanvas(): boolean {
    return isSelectionOutsideElement(provideEditorInstance().canvas);
  }

  public destroy(): void {
    this.pastePreview?.cancel();
    this.pastePreview = undefined;
  }
}
