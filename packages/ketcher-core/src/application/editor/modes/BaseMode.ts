import { Command } from 'domain/entities/Command';
import { SelectLayoutModeOperation } from '../operations/polymerBond';
import { CoreEditor, EditorHistory } from '../internal';
import { LayoutMode, modesMap } from 'application/editor/modes';
import {
  getStructStringFromClipboardData,
  initHotKeys,
  isClipboardAPIAvailable,
  keyNorm,
  legacyCopy,
  legacyPaste,
} from 'utilities';
import { ReinitializeModeCommand } from '../operations/modes';
import { BaseMonomer, SequenceType, Struct, Vec2 } from 'domain/entities';
import { SupportedFormat, identifyStructFormat } from 'application/formatters';
import { KetSerializer } from 'domain/serializers';
import { ChemicalMimeType } from 'domain/services';
import { PolymerBond } from 'domain/entities/PolymerBond';
import {
  peptideNaturalAnalogues,
  rnaDnaNaturalAnalogues,
} from 'domain/constants/monomers';
import { ketcherProvider } from 'application/utils';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

export abstract class BaseMode {
  protected constructor(
    public modeName: LayoutMode,
    public previousMode: LayoutMode = 'flex-layout-mode',
  ) {}

  private changeMode(editor: CoreEditor, modeName: LayoutMode) {
    editor.events.layoutModeChange.dispatch(modeName);
    const ModeConstructor = modesMap[modeName];
    editor.setMode(new ModeConstructor());
    editor.mode.initialize();
  }

  public initialize() {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

    command.addOperation(
      new SelectLayoutModeOperation(
        this.changeMode.bind(this, editor, this.modeName),
        this.changeMode.bind(this, editor, this.previousMode),
        this.modeName,
        this.previousMode,
      ),
    );

    editor.events.selectTool.dispatch('select-rectangle');

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

  getExtraOperations(
    _drawingEntitiesManager: DrawingEntitiesManager,
    _monomerToNewMonomer: Map<BaseMonomer, BaseMonomer>,
  ): Command | null {
    return null;
  }

  checkPasteConditions(_drawingEntitiesManager: DrawingEntitiesManager) {
    return true;
  }

  scrollForView(_needCenterStructure: boolean) {}

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
    const clipboardItemString = JSON.stringify(serializedMacromolecules);
    if (isClipboardAPIAvailable()) {
      navigator.clipboard.writeText(clipboardItemString);
    } else {
      legacyCopy(event.clipboardData, {
        'text/plain': clipboardItemString,
      });
      event.preventDefault();
    }
  }

  async onPaste(event: ClipboardEvent) {
    if (!this.checkIfTargetIsInput(event)) {
      if (isClipboardAPIAvailable()) {
        const clipboardData = await navigator.clipboard.read();
        this.pasteFromClipboard(clipboardData);
      } else {
        const clipboardData = legacyPaste(event.clipboardData, ['text/plain']);
        this.pasteFromClipboard(clipboardData);
        event.preventDefault();
      }
    }
  }

  async pasteFromClipboard(clipboardData) {
    let modelChanges;
    const editor = CoreEditor.provideEditorInstance();
    const needCenterStructure =
      editor.drawingEntitiesManager.allEntities.length === 0;
    const pastedStr = await getStructStringFromClipboardData(clipboardData);
    const format = identifyStructFormat(pastedStr);
    if (format === SupportedFormat.ket) {
      modelChanges = this.pasteKetFormatFragment(pastedStr);
      // check if the str is just simple sequence string rather than other format
    } else if (format === SupportedFormat.smiles) {
      modelChanges = await this.pasteSequence(pastedStr, editor);
    } else {
      editor.events.error.dispatch(
        'Pasted formats should only be sequence or KET.',
      );
    }
    if (!modelChanges || modelChanges.operations.length === 0) {
      return;
    }
    modelChanges.addOperation(new ReinitializeModeCommand());
    editor.renderersContainer.update(modelChanges);
    new EditorHistory(editor).update(modelChanges);
    this.scrollForView(needCenterStructure);
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
      !this.checkPasteConditions(drawingEntitiesManager)
    ) {
      return;
    }
    this.updateMonomersPosition(drawingEntitiesManager);
    const { command: modelChanges, monomerToNewMonomer } =
      drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager);
    const extraModelChanges = this.getExtraOperations(
      drawingEntitiesManager,
      monomerToNewMonomer,
    );
    if (extraModelChanges) modelChanges.merge(extraModelChanges);
    return modelChanges;
  }

  async pasteSequence(pastedStr: string, editor: CoreEditor) {
    const trimedStr = pastedStr.trim();
    if (!this.checkSymbolsNotInNaturalAnalogues(trimedStr, editor)) {
      return undefined;
    }
    const indigo = ketcherProvider.getKetcher().indigo;
    const ketStruct = await indigo.convert(trimedStr.toUpperCase(), {
      outputFormat: ChemicalMimeType.KET,
      inputFormat: ChemicalMimeType[editor.sequenceTypeEnterMode],
    });
    return this.pasteKetFormatFragment(ketStruct.struct);
  }

  checkSymbolsNotInNaturalAnalogues(str: string, editor: CoreEditor) {
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

  private updateMonomersPosition(
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    let offset: Vec2;
    let index = 0;
    const newNodePosition = this.getNewNodePosition();
    drawingEntitiesManager.monomers.forEach((monomer) => {
      let position;
      if (index === 0) {
        offset = Vec2.diff(newNodePosition, new Vec2(monomer.position));
        position = newNodePosition;
      } else {
        position = offset
          ? new Vec2(monomer.position).add(offset)
          : new Vec2(monomer.position);
      }
      monomer.moveAbsolute(position);
      index++;
    });
  }

  unsupportedSymbolsError(symbols: string | string[]) {
    const editor = CoreEditor.provideEditorInstance();
    editor.events.openErrorModal.dispatch({
      errorTitle: 'Unsupported symbols',
      errorMessage: `Ketcher doesn't support ${Array.from(symbols).map(
        (symbol) => `"${symbol}"`,
      )} symbol(s) in Sequence mode. Paste operation failed.`,
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
