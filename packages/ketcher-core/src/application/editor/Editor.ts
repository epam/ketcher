import { DOMSubscription } from 'subscription';
import { SequenceType, Struct, Vec2 } from 'domain/entities';
import {
  BaseTool,
  IRnaPreset,
  LabeledNucleotideWithPositionInSequence,
  isBaseTool,
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from 'application/editor/tools/Tool';
import { PolymerBond } from 'application/editor/tools/Bond';
import { toolsMap } from 'application/editor/tools';
import { MonomerItemType } from 'domain/types';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import ZoomTool from './tools/Zoom';
import { Coordinates } from './shared/coordinates';
import {
  editorEvents,
  hotkeysConfiguration,
  renderersEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { EditorHistory, HistoryOperationType } from './EditorHistory';
import { Editor } from 'application/editor/editor.types';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { ketcherProvider } from 'application/utils';
import { initHotKeys, keyNorm } from 'utilities';
import {
  FlexMode,
  LayoutMode,
  modesMap,
  SequenceMode,
} from 'application/editor/modes/';
import { BaseMode } from 'application/editor/modes/internal';
import assert from 'assert';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { groupBy } from 'lodash';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import {
  IKetMacromoleculesContent,
  IKetMonomerGroupTemplate,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
} from 'application/formatters';
import { KetSerializer } from 'domain/serializers';
import monomersDataRaw from './data/monomers.ket';

interface ICoreEditorConstructorParams {
  theme;
  canvas: SVGSVGElement;
}

function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

let editor;
export class CoreEditor {
  public events;

  public renderersContainer: RenderersManager;
  public drawingEntitiesManager: DrawingEntitiesManager;
  public lastCursorPosition: Vec2 = new Vec2(0, 0);
  public lastCursorPositionOfCanvas: Vec2 = new Vec2(0, 0);
  private _monomersLibraryJson?: IKetMacromoleculesContent;
  public canvas: SVGSVGElement;
  public canvasOffset: DOMRect;
  public theme;
  public zoomTool: ZoomTool;
  // private lastEvent: Event | undefined;
  private tool?: Tool | BaseTool | undefined;
  public get selectedTool(): Tool | BaseTool | undefined {
    return this.tool;
  }

  public mode: BaseMode = new FlexMode();
  public sequenceTypeEnterMode = SequenceType.RNA;
  private micromoleculesEditor: Editor;
  private hotKeyEventHandler: (event: unknown) => void = () => {};

  constructor({ theme, canvas }: ICoreEditorConstructorParams) {
    this.theme = theme;
    this.canvas = canvas;
    resetEditorEvents();
    this.events = editorEvents;
    this._monomersLibraryJson = JSON.parse(monomersDataRaw);
    this.subscribeEvents();
    this.renderersContainer = new RenderersManager({ theme });
    this.drawingEntitiesManager = new DrawingEntitiesManager();
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
  }

  static provideEditorInstance(): CoreEditor {
    return editor;
  }

  public get monomersLibraryJson() {
    return this._monomersLibraryJson;
  }

  public get monomersLibrary() {
    if (!this.monomersLibraryJson) {
      return [];
    }

    const serializer = new KetSerializer();

    return serializer.convertMonomersLibrary(this.monomersLibraryJson);
  }

  public get monomersLibraryGroupedByType() {
    return groupBy(
      this.monomersLibrary.map((libraryItem) => {
        return {
          ...libraryItem,
          label: libraryItem.props.MonomerName,
        };
      }),
      (libraryItem) => libraryItem.props.MonomerType,
    );
  }

  public get defaultRnaPresetsLibraryItems() {
    const monomersLibraryJson = this.monomersLibraryJson;

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
    document.addEventListener('keydown', async (event: KeyboardEvent) => {
      await this.mode.onKeyDown(event);
    });
  }

  private setupCopyPasteEvent() {
    document.addEventListener('copy', (event: ClipboardEvent) => {
      this.mode.onCopy(event);
    });
    document.addEventListener('paste', (event: ClipboardEvent) => {
      this.mode.onPaste(event);
    });
  }

  private setupHotKeysEvents() {
    this.hotKeyEventHandler = (event) => this.handleHotKeyEvents(event);
    document.addEventListener('keydown', this.hotKeyEventHandler);
  }

  private setupContextMenuEvents() {
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (!(this.mode instanceof SequenceMode) || this.mode.isEditMode) {
        return false;
      }

      if (event.target?.__data__ instanceof BaseSequenceItemRenderer) {
        this.events.rightClickSequence.dispatch(
          event,
          SequenceRenderer.selections,
        );
      } else {
        this.events.rightClickCanvas.dispatch(event);
      }

      return false;
    });
  }

  private subscribeEvents() {
    this.events.selectMonomer.add((monomer) => this.onSelectMonomer(monomer));
    this.events.selectPreset.add((preset) => this.onSelectRNAPreset(preset));
    this.events.selectTool.add((tool) => this.onSelectTool(tool));
    this.events.createBondViaModal.add((payload) => this.onCreateBond(payload));
    this.events.cancelBondCreationViaModal.add((secondMonomer: BaseMonomer) =>
      this.onCancelBondCreation(secondMonomer),
    );
    this.events.selectMode.add((isSnakeMode) => this.onSelectMode(isSnakeMode));
    this.events.selectHistory.add((name) => this.onSelectHistory(name));

    renderersEvents.forEach((eventName) => {
      this.events[eventName].add((event) =>
        this.useToolIfNeeded(eventName, event),
      );
    });
    this.events.editSequence.add(
      (sequenceItemRenderer: BaseSequenceItemRenderer) =>
        this.onEditSequence(sequenceItemRenderer),
    );

    this.events.startNewSequence.add(() => this.onStartNewSequence());
    this.events.turnOnSequenceEditInRNABuilderMode.add(() =>
      this.onTurnOnSequenceEditInRNABuilderMode(),
    );
    this.events.turnOffSequenceEditInRNABuilderMode.add(() =>
      this.onTurnOffSequenceEditInRNABuilderMode(),
    );
    this.events.modifySequenceInRnaBuilder.add(
      (updatedSelection: LabeledNucleotideWithPositionInSequence[]) =>
        this.onModifySequenceInRnaBuilder(updatedSelection),
    );
    this.events.changeSequenceTypeEnterMode.add((mode: SequenceType) =>
      this.onChangeSequenceTypeEnterMode(mode),
    );
  }

  private onEditSequence(sequenceItemRenderer: BaseSequenceItemRenderer) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.turnOnEditMode(sequenceItemRenderer);
  }

  private onStartNewSequence() {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.startNewSequence();
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

  private onModifySequenceInRnaBuilder(
    updatedSelection: LabeledNucleotideWithPositionInSequence[],
  ) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.modifySequenceInRnaBuilder(updatedSelection);
  }

  private onChangeSequenceTypeEnterMode(mode: SequenceType) {
    this.sequenceTypeEnterMode = mode;
  }

  private onSelectMonomer(monomer: MonomerItemType) {
    this.selectTool('monomer', monomer);
  }

  private onSelectRNAPreset(preset: IRnaPreset) {
    if (preset) {
      this.selectTool('preset', preset);
    } else {
      this.tool = undefined;
    }
  }

  public onSelectTool(tool: string) {
    this.selectTool(tool);
  }

  private onCreateBond(payload: {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    firstSelectedAttachmentPoint: string;
    secondSelectedAttachmentPoint: string;
  }) {
    if (this.tool instanceof PolymerBond) {
      this.tool.handleBondCreation(payload);
    }
  }

  private onCancelBondCreation(secondMonomer: BaseMonomer) {
    if (this.tool instanceof PolymerBond) {
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
    this.mode.destroy();
    this.mode = new ModeConstructor(this.mode.modeName);
    const command = this.mode.initialize();
    history.update(
      command,
      typeof data === 'object' ? data?.mergeWithLatestHistoryCommand : false,
    );
  }

  public setMode(mode: BaseMode) {
    this.mode = mode;
  }

  public get isSequenceEditMode() {
    return this.mode instanceof SequenceMode && this.mode.isEditMode;
  }

  public get isSequenceEditInRNABuilderMode() {
    return (
      this.mode instanceof SequenceMode && this.mode.isEditInRNABuilderMode
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

  public selectTool(name: string, options?) {
    const ToolConstructor: ToolConstructorInterface = toolsMap[name];
    const oldTool = this.tool;

    this.tool = new ToolConstructor(this, options);

    if (isBaseTool(oldTool)) {
      oldTool?.destroy();
    }
  }

  public unsubscribeEvents() {
    for (const eventName in this.events) {
      this.events[eventName].handlers = [];
    }
    document.removeEventListener('keydown', this.hotKeyEventHandler);
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
    this._monomersLibraryJson = undefined;
  }

  private switchToMacromolecules() {
    const struct = this.micromoleculesEditor?.struct() || new Struct();
    const ketcher = ketcherProvider.getKetcher();
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        this.drawingEntitiesManager,
      );
    this.renderersContainer.update(modelChanges);
    ketcher?.editor.clear();
  }
}
