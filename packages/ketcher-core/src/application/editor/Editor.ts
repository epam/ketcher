import { drawnStructuresSelector } from 'application/editor/constants';
import { Editor, EditorType } from 'application/editor/editor.types';
import {
  editorEvents,
  hotkeysConfiguration,
  renderersEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import {
  FlexMode,
  LayoutMode,
  modesMap,
  SequenceMode,
  SnakeMode,
} from 'application/editor/modes/';
import { BaseMode } from 'application/editor/modes/internal';
import { toolsMap } from 'application/editor/tools';
import { PolymerBond as PolymerBondTool } from 'application/editor/tools/Bond';
import {
  BaseTool,
  IRnaPreset,
  isBaseTool,
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from 'application/editor/tools/Tool';
import {
  IKetMacromoleculesContent,
  IKetMonomerGroupTemplate,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
} from 'application/formatters';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ketcherProvider } from 'application/utils';
import assert from 'assert';
import { SequenceType, Struct, Vec2 } from 'domain/entities';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { KetSerializer } from 'domain/serializers';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { DOMSubscription } from 'subscription';
import { initHotKeys, KetcherLogger, keyNorm } from 'utilities';
import monomersDataRaw from './data/monomers.ket';
import { EditorHistory, HistoryOperationType } from './EditorHistory';
import { Coordinates } from './shared/coordinates';
import ZoomTool from './tools/Zoom';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { HandTool } from 'application/editor/tools/Hand';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { ToolName } from 'application/editor/tools/types';
import { BaseMonomerRenderer } from 'application/render';

interface ICoreEditorConstructorParams {
  theme;
  canvas: SVGSVGElement;
  mode?: BaseMode;
  monomersLibraryUpdate?: string | JSON;
}

function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

let persistentMonomersLibrary: MonomerItemType[] = [];
let persistentMonomersLibraryParsedJson: IKetMacromoleculesContent | null =
  null;

let editor;
export class CoreEditor {
  public events;

  public _type: EditorType;
  public renderersContainer: RenderersManager;
  public drawingEntitiesManager: DrawingEntitiesManager;
  public viewModel: ViewModel;
  public lastCursorPosition: Vec2 = new Vec2(0, 0);
  public lastCursorPositionOfCanvas: Vec2 = new Vec2(0, 0);
  private _monomersLibraryParsedJson: IKetMacromoleculesContent | null = null;
  private _monomersLibrary: MonomerItemType[] = [];
  public canvas: SVGSVGElement;
  public drawnStructuresWrapperElement: SVGGElement;
  public canvasOffset: DOMRect;
  public theme;
  public zoomTool: ZoomTool;
  // private lastEvent: Event | undefined;
  private tool?: Tool | BaseTool | undefined;
  public get selectedTool(): Tool | BaseTool | undefined {
    return this.tool;
  }

  public mode: BaseMode;
  public sequenceTypeEnterMode = SequenceType.RNA;
  private micromoleculesEditor: Editor;
  private hotKeyEventHandler: (event: unknown) => void = () => {};
  private copyEventHandler: (event: ClipboardEvent) => void = () => {};
  private pasteEventHandler: (event: ClipboardEvent) => void = () => {};
  private keydownEventHandler: (event: KeyboardEvent) => void = () => {};

  constructor({
    theme,
    canvas,
    mode,
    monomersLibraryUpdate,
  }: ICoreEditorConstructorParams) {
    this._type = EditorType.Macromolecules;
    this.theme = theme;
    this.canvas = canvas;
    this.drawnStructuresWrapperElement = canvas.querySelector(
      drawnStructuresSelector,
    ) as SVGGElement;
    this.mode = mode ?? new SequenceMode();
    resetEditorEvents();
    this.events = editorEvents;
    this.setMonomersLibrary(monomersDataRaw);
    this._monomersLibraryParsedJson = JSON.parse(monomersDataRaw);
    if (monomersLibraryUpdate) {
      this.updateMonomersLibrary(monomersLibraryUpdate);
    }
    this.subscribeEvents();
    this.renderersContainer = new RenderersManager({ theme });
    this.drawingEntitiesManager = new DrawingEntitiesManager();
    this.viewModel = new ViewModel();
    this.domEventSetup();
    this.setupContextMenuEvents();
    this.setupKeyboardEvents();
    this.setupCopyPasteEvent();
    this.canvasOffset = this.canvas.getBoundingClientRect();
    this.zoomTool = ZoomTool.initInstance(this.drawingEntitiesManager);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    editor = this;
    const ketcher = ketcherProvider.getKetcher();
    this.micromoleculesEditor = ketcher?.editor;
    this.switchToMacromolecules();
    this.rerenderSequenceMode();
  }

  static provideEditorInstance(): CoreEditor {
    return editor;
  }

  private parseMonomersLibrary(monomersDataRaw: string | JSON) {
    const monomersLibraryParsedJson =
      typeof monomersDataRaw === 'string'
        ? JSON.parse(monomersDataRaw)
        : monomersDataRaw;
    const serializer = new KetSerializer();
    const monomersLibrary = serializer.convertMonomersLibrary(
      monomersLibraryParsedJson,
    );

    return { monomersLibraryParsedJson, monomersLibrary };
  }

  private setMonomersLibrary(monomersDataRaw: string) {
    if (
      persistentMonomersLibrary.length !== 0 &&
      persistentMonomersLibraryParsedJson !== undefined
    ) {
      this._monomersLibrary = persistentMonomersLibrary;
      this._monomersLibraryParsedJson = persistentMonomersLibraryParsedJson;
      return;
    }

    const { monomersLibraryParsedJson, monomersLibrary } =
      this.parseMonomersLibrary(monomersDataRaw);
    this._monomersLibrary = monomersLibrary;
    this._monomersLibraryParsedJson = monomersLibraryParsedJson;
    persistentMonomersLibrary = monomersLibrary;
    persistentMonomersLibraryParsedJson = monomersLibraryParsedJson;
  }

  public updateMonomersLibrary(monomersDataRaw: string | JSON) {
    const {
      monomersLibraryParsedJson: newMonomersLibraryChunkParsedJson,
      monomersLibrary: newMonomersLibraryChunk,
    } = this.parseMonomersLibrary(monomersDataRaw);

    newMonomersLibraryChunk.forEach((newMonomer) => {
      const existingMonomerIndex = this._monomersLibrary.findIndex(
        (monomer) => {
          return (
            monomer?.props?.MonomerName === newMonomer?.props?.MonomerName &&
            monomer?.props?.MonomerClass === newMonomer?.props?.MonomerClass
          );
        },
      );

      const newMonomerProps = newMonomer.props;
      const monomerIdToUse = newMonomerProps.id || newMonomerProps.MonomerName;

      if (existingMonomerIndex !== -1) {
        this._monomersLibrary[existingMonomerIndex] = newMonomer;

        const existingMonomerProps =
          this._monomersLibrary[existingMonomerIndex].props;
        const existingMonomerIdToUse =
          existingMonomerProps.id || existingMonomerProps.MonomerName;
        // It's safe to use non-null assertion here and below because we already specified monomers library and parsed JSON before
        const existingMonomerRefIndex =
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this._monomersLibraryParsedJson!.root.templates.findIndex(
            (template) => template.$ref === existingMonomerIdToUse,
          );
        if (existingMonomerRefIndex && existingMonomerRefIndex !== -1) {
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          delete this._monomersLibraryParsedJson!.root.templates[
            existingMonomerRefIndex
          ];
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          delete this._monomersLibraryParsedJson![existingMonomerIdToUse];
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this._monomersLibraryParsedJson!.root.templates.push({
            $ref: monomerIdToUse,
          });
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this._monomersLibraryParsedJson![monomerIdToUse] =
            newMonomersLibraryChunkParsedJson[monomerIdToUse];
        }
      } else {
        this._monomersLibrary.push(newMonomer);
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        this._monomersLibraryParsedJson!.root.templates.push({
          $ref: monomerIdToUse,
        });
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        this._monomersLibraryParsedJson![monomerIdToUse] =
          newMonomersLibraryChunkParsedJson[monomerIdToUse];
      }
    });

    this.events.updateMonomersLibrary.dispatch();
  }

  public get monomersLibraryParsedJson() {
    return this._monomersLibraryParsedJson;
  }

  public get monomersLibrary() {
    return this._monomersLibrary;
  }

  public get defaultRnaPresetsLibraryItems() {
    const monomersLibraryJson = this.monomersLibraryParsedJson;

    if (!monomersLibraryJson) {
      return [];
    }

    return monomersLibraryJson.root.templates
      .filter((templateRef) => {
        const template = monomersLibraryJson[templateRef.$ref];

        return (
          template.type === KetTemplateType.MONOMER_GROUP_TEMPLATE &&
          template.class === KetMonomerGroupTemplateClass.RNA
        );
      })
      .map(
        (templateRef) => monomersLibraryJson[templateRef.$ref],
      ) as IKetMonomerGroupTemplate[];
  }

  private handleHotKeyEvents(event) {
    const keySettings = hotkeysConfiguration;
    const hotKeys = initHotKeys(keySettings);
    const shortcutKey = keyNorm.lookup(hotKeys, event);
    const isInput =
      event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA';

    if (keySettings[shortcutKey]?.handler && !isInput) {
      keySettings[shortcutKey].handler(this);
      event.preventDefault();
    }
  }

  private setupKeyboardEvents() {
    this.setupHotKeysEvents();
    this.keydownEventHandler = async (event: KeyboardEvent) => {
      await this.mode.onKeyDown(event);
    };

    document.addEventListener('keydown', this.keydownEventHandler);
  }

  private setupCopyPasteEvent() {
    this.copyEventHandler = (event: ClipboardEvent) => {
      this.mode.onCopy(event);
    };
    this.pasteEventHandler = (event: ClipboardEvent) => {
      this.mode.onPaste(event);
    };
    document.addEventListener('copy', this.copyEventHandler);
    document.addEventListener('paste', this.pasteEventHandler);
  }

  private setupHotKeysEvents() {
    this.hotKeyEventHandler = (event) => this.handleHotKeyEvents(event);
    document.addEventListener('keydown', this.hotKeyEventHandler);
  }

  private setupContextMenuEvents() {
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();

      const eventData = event.target?.__data__;
      const canvasBoundingClientRect = this.canvas.getBoundingClientRect();
      const isClickOnCanvas =
        event.clientX >= canvasBoundingClientRect.left &&
        event.clientX <= canvasBoundingClientRect.right &&
        event.clientY >= canvasBoundingClientRect.top &&
        event.clientY <= canvasBoundingClientRect.bottom;

      if (eventData instanceof BaseSequenceItemRenderer) {
        this.events.rightClickSequence.dispatch(
          event,
          SequenceRenderer.selections,
        );
      } else if (
        eventData instanceof FlexModePolymerBondRenderer ||
        (eventData instanceof SnakeModePolymerBondRenderer &&
          !(eventData.polymerBond instanceof HydrogenBond))
      ) {
        this.events.rightClickPolymerBond.dispatch(event, eventData);
      } else if (
        eventData instanceof BaseMonomerRenderer &&
        eventData.monomer.selected
      ) {
        this.events.rightClickSelectedMonomers.dispatch(
          event,
          this.drawingEntitiesManager.selectedEntities
            .filter(([, drawingEntity]) => drawingEntity instanceof BaseMonomer)
            .map(([, drawingEntity]) => drawingEntity as BaseMonomer),
        );
      } else if (isClickOnCanvas) {
        this.events.rightClickCanvas.dispatch(event);
      }

      return false;
    });
  }

  private subscribeEvents() {
    this.events.selectMonomer.add((monomer) => this.onSelectMonomer(monomer));
    this.events.selectPreset.add((preset) => this.onSelectRNAPreset(preset));
    this.events.selectTool.add((tool, options) =>
      this.onSelectTool(tool, options),
    );
    this.events.createBondViaModal.add((payload) => this.onCreateBond(payload));
    this.events.cancelBondCreationViaModal.add((secondMonomer: BaseMonomer) =>
      this.onCancelBondCreation(secondMonomer),
    );
    this.events.selectMode.add((isSnakeMode) => this.onSelectMode(isSnakeMode));
    this.events.selectHistory.add((name) => this.onSelectHistory(name));

    renderersEvents.forEach((eventName) => {
      this.events[eventName].add((event) => {
        this.useModeIfNeeded(eventName, event);
        this.useToolIfNeeded(eventName, event);
      });
    });
    this.events.editSequence.add(
      (sequenceItemRenderer: BaseSequenceItemRenderer) =>
        this.onEditSequence(sequenceItemRenderer),
    );

    this.events.turnOnSequenceEditInRNABuilderMode.add(() =>
      this.onTurnOnSequenceEditInRNABuilderMode(),
    );
    this.events.turnOffSequenceEditInRNABuilderMode.add(() =>
      this.onTurnOffSequenceEditInRNABuilderMode(),
    );
    this.events.changeSequenceTypeEnterMode.add((mode: SequenceType) =>
      this.onChangeSequenceTypeEnterMode(mode),
    );
    this.events.createAntisenseChain.add(() => {
      this.onCreateAntisenseChain();
    });
    this.events.copySelectedStructure.add(() => {
      this.mode.onCopy();
    });
    this.events.deleteSelectedStructure.add(() => {
      const command = new Command();
      const history = new EditorHistory(this);

      command.merge(this.drawingEntitiesManager.deleteSelectedEntities());
      history.update(command);
      this.renderersContainer.update(command);
    });
  }

  private onEditSequence(sequenceItemRenderer: BaseSequenceItemRenderer) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.turnOnEditMode(sequenceItemRenderer);
  }

  private onTurnOnSequenceEditInRNABuilderMode() {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.turnOnSequenceEditInRNABuilderMode();
  }

  private onTurnOffSequenceEditInRNABuilderMode() {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.turnOffSequenceEditInRNABuilderMode();
  }

  private onChangeSequenceTypeEnterMode(mode: SequenceType) {
    this.sequenceTypeEnterMode = mode;
  }

  private onCreateAntisenseChain() {
    const modelChanges = this.drawingEntitiesManager.createAntisenseChain();
    const history = new EditorHistory(this);

    this.renderersContainer.update(modelChanges);
    history.update(modelChanges);
  }

  private onSelectMonomer(monomer: MonomerItemType) {
    if (this.mode instanceof SequenceMode) {
      this.mode.insertMonomerFromLibrary(monomer);
    } else {
      this.selectTool(ToolName.monomer, monomer);
    }
  }

  private onSelectRNAPreset(preset: IRnaPreset) {
    if (this.mode instanceof SequenceMode) {
      this.mode.insertPresetFromLibrary(preset);
    } else {
      if (preset) {
        this.selectTool(ToolName.preset, preset);
      } else {
        this.tool = undefined;
      }
    }
  }

  public onSelectTool(tool: ToolName, options?: object) {
    this.selectTool(tool, options);
  }

  private onCreateBond(payload: {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    firstSelectedAttachmentPoint: AttachmentPointName;
    secondSelectedAttachmentPoint: AttachmentPointName;
    polymerBond?: PolymerBond;
    isReconnection?: boolean;
    initialFirstMonomerAttachmentPoint?: AttachmentPointName;
    initialSecondMonomerAttachmentPoint?: AttachmentPointName;
  }) {
    if (payload.isReconnection && payload.polymerBond) {
      const command = new Command();
      const history = new EditorHistory(this);

      if (
        !payload.initialFirstMonomerAttachmentPoint ||
        !payload.initialSecondMonomerAttachmentPoint
      ) {
        KetcherLogger.error('Attachment points are not found for the bond');

        return;
      }

      command.merge(
        this.drawingEntitiesManager.reconnectPolymerBond(
          payload.polymerBond,
          payload.firstSelectedAttachmentPoint,
          payload.secondSelectedAttachmentPoint,
          payload.initialFirstMonomerAttachmentPoint,
          payload.initialSecondMonomerAttachmentPoint,
        ),
      );

      if (this.mode instanceof SnakeMode) {
        command.merge(
          this.drawingEntitiesManager.recalculateCanvasMatrix(
            this.drawingEntitiesManager.canvasMatrix?.chainsCollection,
            this.drawingEntitiesManager.snakeLayoutMatrix,
          ),
        );
      }

      history.update(command);
      this.renderersContainer.update(command);

      return;
    }

    if (this.tool instanceof PolymerBondTool) {
      this.tool.handleBondCreation(payload);
    }
  }

  private onCancelBondCreation(secondMonomer: BaseMonomer) {
    if (this.tool instanceof PolymerBondTool) {
      this.tool.handleBondCreationCancellation(secondMonomer);
    }
  }

  private onSelectMode(
    data:
      | LayoutMode
      | { mode: LayoutMode; mergeWithLatestHistoryCommand: boolean },
  ) {
    const mode = typeof data === 'object' ? data.mode : data;
    const ModeConstructor = modesMap[mode];
    assert(ModeConstructor);
    const history = new EditorHistory(this);
    const hasModeChanged = this.mode.modeName !== mode;
    this.mode.destroy();
    this.mode = new ModeConstructor(this.mode.modeName);
    const command = this.mode.initialize(true, false, !hasModeChanged);
    history.update(
      command,
      typeof data === 'object' ? data?.mergeWithLatestHistoryCommand : false,
    );
  }

  public setMode(mode: BaseMode) {
    this.mode = mode;
  }

  public get isSequenceMode() {
    return this?.mode instanceof SequenceMode;
  }

  public get isSequenceEditMode() {
    return this?.mode instanceof SequenceMode && this?.mode.isEditMode;
  }

  public get isSequenceEditInRNABuilderMode() {
    return (
      this?.mode instanceof SequenceMode && this?.mode.isEditInRNABuilderMode
    );
  }

  public get isSequenceAnyEditMode() {
    return (
      this?.mode instanceof SequenceMode &&
      (this?.mode.isEditMode || this?.mode.isEditInRNABuilderMode)
    );
  }

  public onSelectHistory(name: HistoryOperationType) {
    const history = new EditorHistory(this);
    if (name === 'undo') {
      history.undo();
    } else if (name === 'redo') {
      history.redo();
    }
  }

  public selectTool(name: ToolName, options?) {
    const ToolConstructor: ToolConstructorInterface = toolsMap[name];
    const oldTool = this.tool;

    this.tool = new ToolConstructor(this, options);

    if (isBaseTool(oldTool)) {
      oldTool?.destroy();
    }
  }

  public get isHandToolSelected() {
    return this.selectedTool instanceof HandTool;
  }

  public unsubscribeEvents() {
    for (const eventName in this.events) {
      this.events[eventName].handlers = [];
    }
    document.removeEventListener('keydown', this.hotKeyEventHandler);
    document.removeEventListener('copy', this.copyEventHandler);
    document.removeEventListener('paste', this.pasteEventHandler);
    document.removeEventListener('keydown', this.keydownEventHandler);
  }

  get trackedDomEvents() {
    const trackedDomEvents: {
      target: Element | Document;
      eventName: string;
      toolEventHandler: ToolEventHandlerName;
    }[] = [
      {
        target: this.canvas,
        eventName: 'click',
        toolEventHandler: 'click',
      },
      {
        target: this.canvas,
        eventName: 'dblclick',
        toolEventHandler: 'dblclick',
      },
      {
        target: this.canvas,
        eventName: 'mousedown',
        toolEventHandler: 'mousedown',
      },
      {
        target: document,
        eventName: 'mousemove',
        toolEventHandler: 'mousemove',
      },
      {
        target: document,
        eventName: 'mouseup',
        toolEventHandler: 'mouseup',
      },
      {
        target: document,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseleave',
      },
      {
        target: this.canvas,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseLeaveClientArea',
      },
      {
        target: this.canvas,
        eventName: 'mouseover',
        toolEventHandler: 'mouseover',
      },
    ];

    return trackedDomEvents;
  }

  private domEventSetup() {
    this.trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
      this.events[eventName] = new DOMSubscription();
      const subs = this.events[eventName];

      target.addEventListener(eventName, subs.dispatch.bind(subs));

      subs.add((event) => {
        this.updateLastCursorPosition(event);

        if (
          ['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) &&
          !isMouseMainButtonPressed(event)
        ) {
          return true;
        }

        // if (eventName !== 'mouseup' && eventName !== 'mouseleave') {
        //   // to complete drag actions
        //   if (!event.target || event.target.nodeName === 'DIV') {
        //     // click on scroll
        //     this.hover(null);
        //     return true;
        //   }
        // }

        this.useModeIfNeeded(toolEventHandler, event);
        const isToolUsed = this.useToolIfNeeded(toolEventHandler, event);
        if (isToolUsed) {
          return true;
        }

        return true;
      }, -1);
    });
  }

  private updateLastCursorPosition(event) {
    const events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
    if (events.includes(event.type)) {
      const clientAreaBoundingBox = this.canvasOffset;

      this.lastCursorPosition = new Vec2({
        x: event.pageX - clientAreaBoundingBox.x,
        y: event.pageY - clientAreaBoundingBox.y,
      });
      this.lastCursorPositionOfCanvas = Coordinates.viewToCanvas(
        this.lastCursorPosition,
      );
    }
  }

  private useToolIfNeeded(eventHandlerName: ToolEventHandlerName, event) {
    const editorTool = this.tool as Tool;
    if (!editorTool) {
      return false;
    }
    // this.lastEvent = event;
    const conditions = [
      eventHandlerName in editorTool,
      this.canvas.contains(event?.target) || editorTool.isSelectionRunning?.(),
      // isContextMenuClosed(editor.contextMenu),
    ];

    if (conditions.every((condition) => condition)) {
      editorTool[eventHandlerName]?.(event);
      return true;
    }

    return false;
  }

  private useModeIfNeeded(
    eventHandlerName: ToolEventHandlerName,
    event: Event,
  ) {
    if (this.isHandToolSelected) {
      return;
    }

    this.mode?.[eventHandlerName]?.(event);
  }

  public switchToMicromolecules() {
    this.unsubscribeEvents();
    const history = new EditorHistory(this);
    history.destroy();
    const struct = this.micromoleculesEditor.struct();
    const reStruct = this.micromoleculesEditor.render.ctab;
    const { conversionErrorMessage } =
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        this.drawingEntitiesManager,
        struct,
        reStruct,
      );
    reStruct.render.setMolecule(struct);
    if (conversionErrorMessage) {
      const ketcher = ketcherProvider.getKetcher();

      ketcher.editor.setMacromoleculeConvertionError(conversionErrorMessage);
    }
    this._monomersLibraryParsedJson = null;
    this._type = EditorType.Micromolecules;
  }

  private switchToMacromolecules() {
    const struct = this.micromoleculesEditor?.struct() || new Struct();
    const ketcher = ketcherProvider.getKetcher();
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        this.drawingEntitiesManager,
      );

    if (this.mode instanceof SnakeMode) {
      modelChanges.merge(
        this.drawingEntitiesManager.applySnakeLayout(
          this.canvas.width.baseVal.value,
          true,
          true,
          false,
        ),
      );
    }

    this.renderersContainer.update(modelChanges);
    ketcher?.editor.clear();
    this._type = EditorType.Macromolecules;
  }

  private rerenderSequenceMode() {
    if (this.mode instanceof SequenceMode) {
      this.drawingEntitiesManager.clearCanvas();
      this.drawingEntitiesManager.applyMonomersSequenceLayout();
    }
  }

  public isCurrentModeWithAutozoom(): boolean {
    return this.mode instanceof FlexMode || this.mode instanceof SnakeMode;
  }

  public zoomToStructuresIfNeeded() {
    if (
      // Temporary solution to disable autozoom for the polymer editor in e2e tests
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window._ketcher_isAutozoomDisabled ||
      !this.isCurrentModeWithAutozoom() ||
      !this.drawingEntitiesManager.hasMonomers
    ) {
      return;
    }
    const structureBbox = RenderersManager.getRenderedStructuresBbox();

    ZoomTool.instance.zoomStructureToFitHalfOfCanvas(structureBbox);
  }
}
