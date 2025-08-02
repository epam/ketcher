import { drawnStructuresSelector } from 'application/editor/constants';
import {
  Editor,
  EditorType,
  LibraryItemDragState,
} from 'application/editor/editor.types';
import {
  editorEvents,
  hotkeysConfiguration,
  IEditorEvents,
  renderersEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import {
  DEFAULT_LAYOUT_MODE,
  FlexMode,
  HAS_CONTENT_LAYOUT_MODE,
  LayoutMode,
  modesMap,
  SequenceMode,
  SnakeMode,
} from 'application/editor/modes/';
import { BaseMode } from 'application/editor/modes/internal';
import { isRnaPreset, toolsMap } from 'application/editor/tools';
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
import {
  NodesSelection,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import { ketcherProvider } from 'application/utils';
import assert from 'assert';
import {
  ChainsCollection,
  MonomerToAtomBond,
  Phosphate,
  SequenceType,
  Struct,
  Sugar,
  Vec2,
} from 'domain/entities';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Command } from 'domain/entities/Command';
import {
  DrawingEntitiesManager,
  MONOMER_START_X_POSITION,
  MONOMER_START_Y_POSITION,
} from 'domain/entities/DrawingEntitiesManager';
import { PolymerBond } from 'domain/entities/PolymerBond';
import {
  AmbiguousMonomerType,
  AttachmentPointName,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'domain/types';
import { DOMSubscription } from 'subscription';
import {
  EditorLineLength,
  initHotKeys,
  KetcherLogger,
  keyNorm,
} from 'utilities';
import monomersDataRaw from './data/monomers.ket';
import { EditorHistory, HistoryOperationType } from './EditorHistory';
import { Coordinates } from './shared/coordinates';
import ZoomTool from './tools/Zoom';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { HandTool } from 'application/editor/tools/Hand';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { ToolName } from 'application/editor/tools/types';
import { BaseMonomerRenderer } from 'application/render';
import { parseMonomersLibrary } from './helpers';
import { TransientDrawingView } from 'application/render/renderers/TransientView/TransientDrawingView';
import { SelectLayoutModeOperation } from 'application/editor/operations/polymerBond';
import { SelectRectangle } from 'application/editor/tools/SelectRectangle';
import { ReinitializeModeOperation } from 'application/editor/operations';
import {
  getAminoAcidsToModify,
  isAmbiguousMonomerLibraryItem,
  isLibraryItemRnaPreset,
} from 'domain/helpers/monomers';
import { LineLengthChangeOperation } from 'application/editor/operations/editor/LineLengthChangeOperation';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { blurActiveElement } from '../../utilities/dom';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { debounce } from 'lodash';
import { D3SvgElementSelection } from 'application/render/types';

const SCROLL_SMOOTHNESS_IM_MS = 300;

const turnOnScrollAnimation = (
  canvas: D3SvgElementSelection<SVGGElement, void>,
) => {
  canvas.style('transition', `transform ${SCROLL_SMOOTHNESS_IM_MS}ms ease`);
};

const debouncedTurnOffScrollAnimation = debounce(
  (canvas: D3SvgElementSelection<SVGGElement, void>) => {
    canvas.style('transition', 'none');
  },
  SCROLL_SMOOTHNESS_IM_MS,
);

interface ICoreEditorConstructorParams {
  ketcherId?: string;
  theme;
  canvas: SVGSVGElement;
  mode?: BaseMode;
  monomersLibraryUpdate?: string | JSON;
}

interface ModifyAminoAcidsHandlerParams {
  monomers: BaseMonomer[];
  modificationType: string;
}

interface IAutochainMonomerAddResult {
  modelChanges: Command;
  firstMonomer: BaseMonomer;
  lastMonomer: BaseMonomer;
}

let persistentMonomersLibrary: MonomerItemType[] = [];
let persistentMonomersLibraryParsedJson: IKetMacromoleculesContent | null =
  null;

let editor;

export class CoreEditor {
  public events: IEditorEvents;
  public ketcherId?: string;

  public _type: EditorType;
  public renderersContainer: RenderersManager;
  public transientDrawingView: TransientDrawingView;
  public drawingEntitiesManager: DrawingEntitiesManager;
  public viewModel: ViewModel;
  public lastCursorPosition: Vec2 = new Vec2(0, 0);
  public lastCursorPositionOfCanvas: Vec2 = new Vec2(0, 0);
  private _monomersLibraryParsedJson: IKetMacromoleculesContent | null = null;
  private _monomersLibrary: MonomerItemType[] = [];
  public canvas: SVGSVGElement;
  public drawnStructuresWrapperElement: SVGGElement;
  public canvasOffset: DOMRect = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  } as DOMRect;

  public nextAutochainPosition?: Vec2 = undefined;

  private libraryItemDragState: LibraryItemDragState = null;
  private libraryItemDragCancelled = false;

  public theme;
  public zoomTool: ZoomTool;
  // private lastEvent: Event | undefined;
  private tool?: Tool | BaseTool | undefined;

  public get selectedTool(): Tool | BaseTool | undefined {
    return this.tool;
  }

  public mode: BaseMode;
  private previousModes: BaseMode[] = [];
  public sequenceTypeEnterMode = SequenceType.RNA;
  private micromoleculesEditor: Editor;
  private hotKeyEventHandler: (event: KeyboardEvent) => void = () => {};
  private copyEventHandler: (event: ClipboardEvent) => void = () => {};
  private pasteEventHandler: (event: ClipboardEvent) => void = () => {};
  private keydownEventHandler: (event: KeyboardEvent) => void = () => {};
  private contextMenuEventHandler: (event: MouseEvent) => void = () => {};
  private cleanupsForDomEvents: Array<() => void> = [];

  constructor({
    ketcherId,
    theme,
    canvas,
    monomersLibraryUpdate,
    mode,
  }: ICoreEditorConstructorParams) {
    this._type = EditorType.Micromolecules;
    this.ketcherId = ketcherId;
    this.theme = theme;
    this.canvas = canvas;
    this.drawnStructuresWrapperElement = canvas.querySelector(
      drawnStructuresSelector,
    ) as SVGGElement;
    this.mode = mode || new SequenceMode();
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
    this.setupHotKeysEvents();
    this.setupCopyPasteEvent();
    this.resetCanvasOffset();
    this.zoomTool = ZoomTool.initInstance(this.drawingEntitiesManager);
    this.transientDrawingView = new TransientDrawingView();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    editor = this;
    const ketcher = ketcherProvider.getKetcher(this.ketcherId);
    this.micromoleculesEditor = ketcher?.editor;
    this.initializeEventListeners();
  }

  private resetCanvasOffset() {
    this.canvasOffset = this.canvas.getBoundingClientRect();
  }

  private initializeEventListeners(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.cancelActiveDrag();
    }
  };

  private handleWindowBlur = (): void => {
    this.cancelActiveDrag();
  };

  private cancelActiveDrag(): void {
    if (this.tool instanceof SelectRectangle) {
      this.tool.stopMovement();
    }
  }

  static provideEditorInstance(): CoreEditor {
    return editor;
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
      parseMonomersLibrary(monomersDataRaw);
    this._monomersLibrary = monomersLibrary;
    this._monomersLibraryParsedJson = monomersLibraryParsedJson;
    persistentMonomersLibrary = monomersLibrary;
    persistentMonomersLibraryParsedJson = monomersLibraryParsedJson;
  }

  public updateMonomersLibrary(monomersDataRaw: string | JSON) {
    const {
      monomersLibraryParsedJson: newMonomersLibraryChunkParsedJson,
      monomersLibrary: newMonomersLibraryChunk,
    } = parseMonomersLibrary(monomersDataRaw);

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

        if (!template) {
          KetcherLogger.error(
            `There is a ref for rna preset template ${templateRef.$ref}, but template definition is not found`,
          );

          return false;
        }

        return (
          template.type === KetTemplateType.MONOMER_GROUP_TEMPLATE &&
          template.class === KetMonomerGroupTemplateClass.RNA
        );
      })
      .map(
        (templateRef) => monomersLibraryJson[templateRef.$ref],
      ) as IKetMonomerGroupTemplate[];
  }

  public get isLibraryItemDragCancelled() {
    return this.libraryItemDragCancelled;
  }

  public set isLibraryItemDragCancelled(value: boolean) {
    this.libraryItemDragCancelled = value;
  }

  public cancelLibraryItemDrag() {
    if (this.libraryItemDragState) {
      this.libraryItemDragCancelled = true;
      this.events.setLibraryItemDragState.dispatch(null);
    }
  }

  private handleHotKeyEvents(event: KeyboardEvent) {
    if (this._type === EditorType.Micromolecules) return;
    if (!(event.target instanceof HTMLElement)) return;
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
    this.keydownEventHandler = async (event: KeyboardEvent) => {
      this.events.keyDown.dispatch(event);
      if (!event.cancelBubble) await this.mode.onKeyDown(event);
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
    this.contextMenuEventHandler = (event) => {
      event.preventDefault();

      if (this.libraryItemDragState) {
        this.cancelLibraryItemDrag();
        return;
      }

      const eventData = event.target?.__data__;
      const canvasBoundingClientRect = this.canvas.getBoundingClientRect();
      const isClickOnCanvas =
        event.clientX >= canvasBoundingClientRect.left &&
        event.clientX <= canvasBoundingClientRect.right &&
        event.clientY >= canvasBoundingClientRect.top &&
        event.clientY <= canvasBoundingClientRect.bottom;
      const sequenceSelections = SequenceRenderer.selections.map(
        (selectionRange) =>
          selectionRange.map((twoStrandedNodeSelection) => {
            return {
              ...twoStrandedNodeSelection,
              node: twoStrandedNodeSelection.node.senseNode,
              twoStrandedNode: twoStrandedNodeSelection.node,
            };
          }),
      ) as NodesSelection;
      const selectedMonomers = this.drawingEntitiesManager.selectedEntities
        .filter(([, drawingEntity]) => drawingEntity instanceof BaseMonomer)
        .map(([, drawingEntity]) => drawingEntity as BaseMonomer);

      if (eventData instanceof BaseSequenceItemRenderer) {
        this.events.rightClickSequence.dispatch([event, sequenceSelections]);
      } else if (
        eventData instanceof FlexModePolymerBondRenderer ||
        (eventData instanceof SnakeModePolymerBondRenderer &&
          !(eventData.polymerBond instanceof HydrogenBond))
      ) {
        this.events.rightClickPolymerBond.dispatch([event, eventData]);
      } else if (
        eventData instanceof BaseMonomerRenderer &&
        eventData.monomer.selected
      ) {
        this.events.rightClickSelectedMonomers.dispatch([event]);
        this.events.rightClickSelectedMonomers.dispatch([
          event,
          selectedMonomers,
        ]);
      } else if (isClickOnCanvas) {
        // TODO separate by two events for modes
        this.events.rightClickCanvas.dispatch([
          event,
          this.mode instanceof SequenceMode
            ? sequenceSelections
            : selectedMonomers,
        ]);
      }

      return false;
    };

    document.addEventListener('contextmenu', this.contextMenuEventHandler);
  }

  private subscribeEvents() {
    this.events.selectMonomer.add((monomer) => this.onSelectMonomer(monomer));
    this.events.selectPreset.add((preset) => this.onSelectRNAPreset(preset));
    this.events.selectTool.add(([tool, options]) =>
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
    this.events.establishHydrogenBond.add(
      (sequenceItemRenderer: BaseSequenceItemRenderer) =>
        this.onEstablishHydrogenBondSequenceMode(sequenceItemRenderer),
    );
    this.events.deleteHydrogenBond.add(
      (sequenceItemRenderer: BaseSequenceItemRenderer) =>
        this.onDeleteHydrogenBondSequenceMode(sequenceItemRenderer),
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
    this.events.toggleIsSequenceSyncEditMode.add(
      (isSequenceSyncEditMode: boolean) =>
        this.onChangeToggleIsSequenceSyncEditMode(isSequenceSyncEditMode),
    );
    this.events.resetSequenceEditMode.add(() =>
      this.onResetSequenceSyncEditMode(),
    );
    this.events.createAntisenseChain.add((isDnaAntisense: boolean) => {
      this.onCreateAntisenseChain(isDnaAntisense);
      this.drawingEntitiesManager.unselectAllDrawingEntities();
    });
    this.events.copySelectedStructure.add(() => {
      this.mode.onCopy();
    });
    this.events.pasteFromClipboard.add(() => {
      this.mode.onPaste();
    });
    this.events.deleteSelectedStructure.add(() => {
      if (this.mode instanceof SequenceMode) {
        this.mode.deleteSelection();

        return;
      }

      const command = new Command();
      const history = new EditorHistory(this);

      command.merge(this.drawingEntitiesManager.deleteSelectedEntities());
      history.update(command);
      this.renderersContainer.update(command);
    });
    this.events.modifyAminoAcids.add(
      ({ monomers, modificationType }: ModifyAminoAcidsHandlerParams) => {
        this.onModifyAminoAcids(monomers, modificationType);
      },
    );

    this.events.setEditorLineLength.add(
      (lineLengthUpdate: Partial<EditorLineLength>) => {
        // Temporary solution to disablechain length  ruler for the macro editor in e2e tests
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window._ketcher_isChainLengthRulerDisabled) {
          return;
        }

        // Additional cleanup as line length highlight enlarges the canvas which leads to scroll to bottom in sequence edit mode
        this.transientDrawingView.hideLineLengthHighlight();
        this.transientDrawingView.update();

        const command = new Command();
        const history = new EditorHistory(this);

        command.addOperation(new LineLengthChangeOperation(lineLengthUpdate));
        history.update(command);
      },
    );

    this.events.toggleLineLengthHighlighting.add(
      (value: boolean, currentPosition = 0) => {
        // Temporary solution to disablechain length  ruler for the macro editor in e2e tests
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window._ketcher_isChainLengthRulerDisabled) {
          return;
        }

        if (value) {
          this.transientDrawingView.showLineLengthHighlight({
            currentPosition,
          });
        } else {
          this.transientDrawingView.hideLineLengthHighlight();
        }
        this.transientDrawingView.update();
      },
    );

    this.events.setLibraryItemDragState.add((state: LibraryItemDragState) => {
      this.libraryItemDragState = state;
    });

    this.events.placeLibraryItemOnCanvas.add(
      (
        item: IRnaPreset | MonomerOrAmbiguousType,
        position: { x: number; y: number },
      ) => {
        const history = new EditorHistory(this);
        const { x, y } = position;

        let monomersAddResult: IAutochainMonomerAddResult | undefined;

        if (isLibraryItemRnaPreset(item)) {
          if (!item.sugar) {
            return;
          }

          monomersAddResult = this.onPlaceRnaPresetOnCanvas(
            item,
            Coordinates.canvasToModel(new Vec2(x, y)),
          );
        } else if (isAmbiguousMonomerLibraryItem(item)) {
          monomersAddResult = this.onPlaceAmbiguousMonomerOnCanvas(
            item,
            Coordinates.canvasToModel(new Vec2(x, y)),
          );
        } else {
          monomersAddResult = this.onPlaceMonomerOnCanvas(
            item,
            Coordinates.canvasToModel(new Vec2(x, y)),
          );
        }

        if (!monomersAddResult) {
          return;
        }

        history.update(monomersAddResult.modelChanges);
        this.renderersContainer.update(monomersAddResult.modelChanges);
        this.calculateAndStoreNextAutochainPosition(
          monomersAddResult.lastMonomer,
        );
      },
    );
    this.events.autochain.add((monomerItem) => this.onAutochain(monomerItem));
    this.events.previewAutochain.add((monomerItem) =>
      this.onPreviewAutochain(monomerItem),
    );
    this.events.removeAutochainPreview.add(() =>
      this.onRemoveAutochainPreview(),
    );
  }

  private getDataForAutochain() {
    const selectedMonomersWithFreeR2 =
      this.drawingEntitiesManager.selectedMonomers.filter((monomer) => {
        return monomer.isAttachmentPointExistAndFree(AttachmentPointName.R2);
      });
    const selectedMonomerToConnect =
      selectedMonomersWithFreeR2.length === 1
        ? selectedMonomersWithFreeR2[0]
        : undefined;
    const newMonomerPosition = selectedMonomerToConnect
      ? selectedMonomerToConnect.position.add(new Vec2(1.5, 0))
      : this.drawingEntitiesManager.hasMonomers
      ? this.nextAutochainPosition && !(this.mode instanceof SnakeMode)
        ? this.nextAutochainPosition
        : this.drawingEntitiesManager.bottomLeftMonomerPosition.add(
            new Vec2(0, 1.5),
          )
      : Coordinates.canvasToModel(
          new Vec2(MONOMER_START_X_POSITION, MONOMER_START_Y_POSITION),
        );

    return {
      selectedMonomerToConnect,
      newMonomerPosition,
    };
  }

  private onRemoveAutochainPreview() {
    this.transientDrawingView.clear();
  }

  private onPreviewAutochain(monomerOrRnaItem: MonomerItemType | IRnaPreset) {
    if (this.mode instanceof SequenceMode) {
      return;
    }

    this.invalidateNextAutochainPositionIfNeeded(isRnaPreset(monomerOrRnaItem));

    const { selectedMonomerToConnect, newMonomerPosition } =
      this.getDataForAutochain();

    this.transientDrawingView.showAutochainPreview(
      monomerOrRnaItem,
      newMonomerPosition,
      selectedMonomerToConnect,
    );
    this.transientDrawingView.update();
  }

  private onAutochain(
    monomerOrRnaItem: MonomerItemType | AmbiguousMonomerType | IRnaPreset,
  ) {
    if (this.mode instanceof SequenceMode) {
      return;
    }

    this.invalidateNextAutochainPositionIfNeeded(isRnaPreset(monomerOrRnaItem));

    const modelChanges = new Command();
    const history = new EditorHistory(this);
    const { selectedMonomerToConnect, newMonomerPosition } =
      this.getDataForAutochain();

    let monomersAddResult: IAutochainMonomerAddResult | undefined;

    if (isRnaPreset(monomerOrRnaItem)) {
      monomersAddResult = this.onPlaceRnaPresetOnCanvas(
        monomerOrRnaItem,
        newMonomerPosition,
      );
    } else if (isAmbiguousMonomerLibraryItem(monomerOrRnaItem)) {
      monomersAddResult = this.onPlaceAmbiguousMonomerOnCanvas(
        monomerOrRnaItem,
        newMonomerPosition,
      );
    } else {
      monomersAddResult = this.onPlaceMonomerOnCanvas(
        monomerOrRnaItem,
        newMonomerPosition,
      );
    }

    if (!monomersAddResult) {
      return;
    }

    modelChanges.merge(monomersAddResult.modelChanges);

    if (selectedMonomerToConnect) {
      modelChanges.merge(
        this.drawingEntitiesManager.createPolymerBond(
          selectedMonomerToConnect,
          monomersAddResult.firstMonomer,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        ),
      );

      modelChanges.merge(
        this.drawingEntitiesManager.unselectDrawingEntity(
          selectedMonomerToConnect,
        ),
      );

      modelChanges.merge(
        this.drawingEntitiesManager.selectDrawingEntity(
          monomersAddResult.lastMonomer,
        ),
      );
    }

    if (this.mode instanceof SnakeMode) {
      modelChanges.merge(this.drawingEntitiesManager.applySnakeLayout(true));
    }

    this.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    this.calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);

    if (this.mode instanceof SnakeMode) {
      this.zoomTool.scrollToVerticalBottom();
    } else if (this.mode instanceof FlexMode) {
      const editorSettings = provideEditorSettings();
      const oneLayoutCellInAngstroms =
        SnakeLayoutCellWidth / editorSettings.macroModeScale;
      const chainsCollection = ChainsCollection.fromMonomers([
        monomersAddResult.lastMonomer,
      ]);
      const monomersInChainUsedForAutochain =
        chainsCollection.chains[0].monomers;
      const chainBbox = DrawingEntitiesManager.getStructureBbox(
        monomersInChainUsedForAutochain,
      );
      const canvasWrapperSize = this.zoomTool.canvasWrapperSize;
      const MIN_OFFSET_FROM_RIGHT =
        oneLayoutCellInAngstroms * 5 * editorSettings.macroModeScale;
      const offsetFromRight = Math.min(
        MIN_OFFSET_FROM_RIGHT,
        canvasWrapperSize.width / 2,
      );
      const chainLeftTopInViewCoordinates = Coordinates.modelToView(
        new Vec2(chainBbox.left, chainBbox.top),
      );
      const chainRightBottomInViewCoordinates = Coordinates.modelToView(
        new Vec2(chainBbox.right, chainBbox.bottom),
      );
      const chainWidthInViewCoordinates =
        chainRightBottomInViewCoordinates.x - chainLeftTopInViewCoordinates.x;
      const lastAddedMonomerPositionInViewCoordinates = Coordinates.modelToView(
        monomersAddResult.lastMonomer.position,
      );
      const isStructureWithAutochainOffsetFitCanvas =
        canvasWrapperSize.width - chainWidthInViewCoordinates > offsetFromRight;
      const isAddedMonomerHorizontallyOutOfCanvas =
        lastAddedMonomerPositionInViewCoordinates.x <= 0 ||
        lastAddedMonomerPositionInViewCoordinates.x >= canvasWrapperSize.width;
      const isAddedMonomerOutAboveCanvas =
        lastAddedMonomerPositionInViewCoordinates.y <= 0;
      const isAddedMonomerOutBelowCanvas =
        lastAddedMonomerPositionInViewCoordinates.y >= canvasWrapperSize.height;
      const isAddedMonomerVerticallyOutOfCanvas =
        isAddedMonomerOutAboveCanvas || isAddedMonomerOutBelowCanvas;

      if (
        isAddedMonomerHorizontallyOutOfCanvas ||
        isAddedMonomerVerticallyOutOfCanvas
      ) {
        const needToScrollToBeginningOfChain =
          Boolean(selectedMonomerToConnect) &&
          isStructureWithAutochainOffsetFitCanvas;

        turnOnScrollAnimation(this.zoomTool.canvas);
        this.zoomTool.scrollTo(
          needToScrollToBeginningOfChain
            ? Coordinates.modelToCanvas(
                chainsCollection.firstNode.firstMonomerInNode.position,
              )
            : Coordinates.modelToCanvas(
                monomersAddResult.lastMonomer.position,
              ).sub(
                new Vec2(
                  this.zoomTool.unzoomValue(canvasWrapperSize.width) -
                    offsetFromRight,
                  0,
                ),
              ),
          isAddedMonomerOutBelowCanvas,
          needToScrollToBeginningOfChain
            ? oneLayoutCellInAngstroms * editorSettings.macroModeScale
            : 0,
          isAddedMonomerOutBelowCanvas
            ? oneLayoutCellInAngstroms * 2 * editorSettings.macroModeScale
            : undefined,
          false,
          isAddedMonomerVerticallyOutOfCanvas,
        );
        debouncedTurnOffScrollAnimation(this.zoomTool.canvas);
      }
    }

    this.onRemoveAutochainPreview();
    this.onPreviewAutochain(monomerOrRnaItem);
  }

  private onPlaceRnaPresetOnCanvas(
    rnaPresetItem: IRnaPreset,
    sugarPosition: Vec2,
  ) {
    if (this.mode instanceof SequenceMode) {
      return;
    }

    if (!rnaPresetItem.sugar) {
      this.events.error.dispatch('No sugar in RNA preset found');
      return;
    }

    const modelChanges = new Command();
    const { command: addPresetModelChanges, monomers } =
      this.drawingEntitiesManager.addRnaPreset({
        sugar: rnaPresetItem.sugar,
        sugarPosition: new Vec2(sugarPosition.x, sugarPosition.y),
        phosphate: rnaPresetItem.phosphate,
        phosphatePosition: rnaPresetItem.phosphate
          ? new Vec2(sugarPosition.x + 1.5, sugarPosition.y)
          : undefined,
        rnaBase: rnaPresetItem.base,
        rnaBasePosition: rnaPresetItem.base
          ? new Vec2(sugarPosition.x, sugarPosition.y + 1.5)
          : undefined,
      });
    const sugar = monomers.find(
      (monomer) => monomer instanceof Sugar,
    ) as BaseMonomer;
    const phosphate = monomers.find((monomer) => monomer instanceof Phosphate);

    modelChanges.merge(addPresetModelChanges);

    return {
      modelChanges,
      firstMonomer: sugar,
      lastMonomer: phosphate || sugar,
    };
  }

  private onPlaceMonomerOnCanvas(monomerItem: MonomerItemType, position: Vec2) {
    if (this.mode instanceof SequenceMode) {
      return;
    }

    const modelChanges = new Command();
    const monomerAddModelChanges = this.drawingEntitiesManager.addMonomer(
      monomerItem,
      position,
    );
    const monomer = monomerAddModelChanges.operations[0].monomer as BaseMonomer;

    modelChanges.merge(monomerAddModelChanges);

    return {
      modelChanges,
      firstMonomer: monomer,
      lastMonomer: monomer,
    };
  }

  private onPlaceAmbiguousMonomerOnCanvas(
    monomerItem: AmbiguousMonomerType,
    position: Vec2,
  ) {
    if (this.mode instanceof SequenceMode) {
      return;
    }

    const modelChanges = new Command();
    const monomerAddModelChanges =
      this.drawingEntitiesManager.addAmbiguousMonomer(monomerItem, position);
    const monomer = monomerAddModelChanges.operations[0].monomer as BaseMonomer;

    modelChanges.merge(monomerAddModelChanges);

    return {
      modelChanges,
      firstMonomer: monomer,
      lastMonomer: monomer,
    };
  }

  public calculateAndStoreNextAutochainPosition(
    drawingEntitiesManagerOrMonomer: DrawingEntitiesManager | BaseMonomer,
  ) {
    let nextAutochainPosition: Vec2;

    if (drawingEntitiesManagerOrMonomer instanceof DrawingEntitiesManager) {
      const chainsCollection = ChainsCollection.fromMonomers(
        drawingEntitiesManagerOrMonomer.monomersArray,
      );

      if (chainsCollection.chains.length === 1) {
        const lastMonomerInChain = chainsCollection.lastNode.lastMonomerInNode;

        nextAutochainPosition = lastMonomerInChain.position.add(
          new Vec2(1.5, 0),
        );
      } else {
        const bottomLeftMonomerPosition =
          drawingEntitiesManagerOrMonomer.bottomLeftMonomerPosition;

        nextAutochainPosition = bottomLeftMonomerPosition.add(new Vec2(0, 1.5));
      }
    } else {
      const monomer = drawingEntitiesManagerOrMonomer;

      nextAutochainPosition = monomer.position.add(new Vec2(1.5, 0));
    }

    this.nextAutochainPosition = nextAutochainPosition;
  }

  public invalidateNextAutochainPositionIfNeeded(isRnaPreset = false) {
    const nextAutochainPosition = this.nextAutochainPosition;

    if (!nextAutochainPosition) {
      return;
    }

    const areaToCheck = { width: 1.5, height: 1.5 };
    const additionalAreaToCheck = isRnaPreset ? 1.5 : 0;
    const monomerIntersection = this.drawingEntitiesManager.monomersArray.find(
      (monomer) => {
        return (
          nextAutochainPosition.x +
            areaToCheck.width / 2 +
            additionalAreaToCheck >
            monomer.position.x &&
          nextAutochainPosition.x <
            monomer.position.x + areaToCheck.width / 2 &&
          nextAutochainPosition.y +
            areaToCheck.height / 2 +
            additionalAreaToCheck >
            monomer.position.y &&
          nextAutochainPosition.y < monomer.position.y + areaToCheck.height / 2
        );
      },
    );

    if (monomerIntersection) {
      this.nextAutochainPosition = undefined;
    }
  }

  private onEditSequence(sequenceItemRenderer: BaseSequenceItemRenderer) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.turnOnEditMode(sequenceItemRenderer);
  }

  private onEstablishHydrogenBondSequenceMode(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.establishHydrogenBond(sequenceItemRenderer);
  }

  private onDeleteHydrogenBondSequenceMode(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.deleteHydrogenBond(sequenceItemRenderer);
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

  private onChangeToggleIsSequenceSyncEditMode(
    isSequenceSyncEditMode: boolean,
  ) {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    if (isSequenceSyncEditMode) {
      this.mode.turnOnSyncEditMode();
    } else {
      this.mode.turnOffSyncEditMode();
    }
  }

  private onResetSequenceSyncEditMode() {
    if (!(this.mode instanceof SequenceMode)) {
      return;
    }

    this.mode.resetEditMode();
  }

  private onCreateAntisenseChain(isDnaAntisense: boolean) {
    const modelChanges =
      this.drawingEntitiesManager.createAntisenseChain(isDnaAntisense);
    const history = new EditorHistory(this);

    this.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    this.scrollToTopLeftCorner();
  }

  private onSelectMonomer(monomer: MonomerItemType) {
    if (
      this.mode instanceof SequenceMode &&
      !this.isSequenceEditMode &&
      SequenceRenderer.chainsCollection.length === 0
    ) {
      this.mode.turnOnEditMode();
    }

    if (this.mode instanceof SequenceMode) {
      this.mode.insertMonomerFromLibrary(monomer);
    }
  }

  private onSelectRNAPreset(preset: IRnaPreset) {
    if (
      this.mode instanceof SequenceMode &&
      !this.isSequenceEditMode &&
      SequenceRenderer.chainsCollection.length === 0
    ) {
      this.mode.turnOnEditMode();
    }

    if (this.mode instanceof SequenceMode) {
      this.mode.insertPresetFromLibrary(preset);
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
    const command = new Command();
    const mode = typeof data === 'object' ? data.mode : data;
    const ModeConstructor = modesMap[mode];
    assert(ModeConstructor);
    const history = new EditorHistory(this);
    const hasModeChanged = this.mode.modeName !== mode;
    const isLastCommandTurnOnSnakeMode =
      history.previousCommand?.operations.find((operation) => {
        return (
          operation instanceof SelectLayoutModeOperation &&
          operation.mode === 'snake-layout-mode' &&
          operation.prevMode !== 'snake-layout-mode'
        );
      });

    if (isLastCommandTurnOnSnakeMode) {
      history.undo();
    }

    this.mode.destroy();
    this.previousModes.push(this.mode);
    this.mode = new ModeConstructor(this.mode.modeName);
    command.merge(this.mode.initialize(true, false, !hasModeChanged));
    history.update(
      command,
      typeof data === 'object' ? data?.mergeWithLatestHistoryCommand : false,
    );
  }

  public setMode(mode: BaseMode) {
    this.mode = mode;
  }

  private onModifyAminoAcids(
    monomers: BaseMonomer[],
    modificationType: string,
  ) {
    const modelChanges = new Command();
    const editorHistory = new EditorHistory(editor);
    const aminoAcidsToModify = getAminoAcidsToModify(
      monomers,
      modificationType,
      this.monomersLibrary,
    );
    const bondsToDelete = new Set<PolymerBond | MonomerToAtomBond>();

    [...aminoAcidsToModify.entries()].forEach(
      ([aminoAcidToModify, modifiedMonomerItem]) => {
        aminoAcidToModify.covalentBonds.forEach((polymerBond) => {
          const attachmentPoint =
            aminoAcidToModify.getAttachmentPointByBond(polymerBond);

          if (!attachmentPoint) {
            KetcherLogger.error('Attachment point not found for the bond');

            return;
          }

          const modificationHasAttachmentPointForBond =
            modifiedMonomerItem.props.MonomerCaps?.[attachmentPoint];

          if (!modificationHasAttachmentPointForBond) {
            bondsToDelete.add(polymerBond);
          }
        });
      },
    );

    const modificationFunction = () => {
      aminoAcidsToModify.forEach((modifiedMonomerItem, aminoAcidToModify) => {
        modelChanges.merge(
          this.drawingEntitiesManager.modifyMonomerItem(
            aminoAcidToModify,
            modifiedMonomerItem,
          ),
        );
      });

      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      editorHistory.update(modelChanges);
      editor.transientDrawingView.hideModifyAminoAcidsView();
      editor.transientDrawingView.update();
    };

    if (bondsToDelete.size > 0) {
      this.events.openConfirmationDialog.dispatch({
        confirmationText:
          'Some side chain connections will be deleted during replacement. Do you want to proceed?',
        onConfirm: () => {
          bondsToDelete.forEach((bond) => {
            modelChanges.merge(
              this.drawingEntitiesManager.deleteDrawingEntity(bond),
            );
          });
          modificationFunction();
        },
      });
    } else {
      modificationFunction();
    }
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
      this.events[eventName].handlers.forEach((handler) => {
        this.events[eventName].remove(handler);
      });
      this.events[eventName].handlers = [];
    }
    document.removeEventListener('keydown', this.hotKeyEventHandler);
    document.removeEventListener('copy', this.copyEventHandler);
    document.removeEventListener('paste', this.pasteEventHandler);
    document.removeEventListener('keydown', this.keydownEventHandler);
    document.removeEventListener('contextmenu', this.contextMenuEventHandler);
    this.canvas.removeEventListener('mousedown', blurActiveElement);

    this.cleanupsForDomEvents.forEach((cleanupFunction) => {
      cleanupFunction();
    });
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

  private isMouseMainButtonPressed(event) {
    return event?.button === 0;
  }

  private domEventSetup() {
    this.canvas.addEventListener('mousedown', blurActiveElement);

    this.trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
      this.events[eventName] = new DOMSubscription();
      const subs = this.events[eventName];
      const handler = subs.dispatch.bind(subs);

      target.addEventListener(eventName, handler);

      this.cleanupsForDomEvents.push(() => {
        target.removeEventListener(eventName, handler);
      });

      subs.add((event) => {
        this.updateLastCursorPosition(event);

        if (
          ['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) &&
          !this.isMouseMainButtonPressed(event)
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
    const history = new EditorHistory(this);
    const struct = this.micromoleculesEditor.struct();
    const reStruct = this.micromoleculesEditor.render.ctab;
    const zoomTool = ZoomTool.instance;

    const { conversionErrorMessage } =
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        this.drawingEntitiesManager,
        struct,
        reStruct,
      );

    if (conversionErrorMessage) {
      const ketcher = ketcherProvider.getKetcher(this.ketcherId);

      ketcher.editor.setMacromoleculeConvertionError(conversionErrorMessage);
    }

    history.destroy();
    this.drawingEntitiesManager.clearCanvas();
    zoomTool.resetZoom();
    struct.applyMonomersTransformations();
    reStruct.render.setMolecule(struct);

    this._type = EditorType.Micromolecules;
    this.drawingEntitiesManager = new DrawingEntitiesManager();
  }

  private resetModeIfNeeded() {
    if (this.previousModes.length === 0) {
      const ketcher = ketcherProvider.getKetcher();
      const isBlank = ketcher?.editor?.struct().isBlank();
      const oldModeName = this.mode?.modeName;
      const newModeName = isBlank
        ? DEFAULT_LAYOUT_MODE
        : HAS_CONTENT_LAYOUT_MODE;

      if (oldModeName === newModeName) {
        return;
      }

      this.onSelectMode(newModeName);
      this.events.layoutModeChange.dispatch(newModeName);
    }
  }

  public switchToMacromolecules() {
    this.resetCanvasOffset();
    this.resetModeIfNeeded();

    const struct = this.micromoleculesEditor?.struct() || new Struct();
    const ketcher = ketcherProvider.getKetcher(this.ketcherId);
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        this.drawingEntitiesManager,
      );

    if (this.mode instanceof SnakeMode) {
      modelChanges.merge(
        this.drawingEntitiesManager.applySnakeLayout(true, true, false),
      );
    }

    if (this.mode instanceof SequenceMode) {
      this.mode.initialize(false, false, false);
    } else {
      this.renderersContainer.update(modelChanges);
    }

    ketcher?.editor.clear();
    ketcher?.editor.clearHistory();
    ketcher?.editor.zoom(1);
    this._type = EditorType.Macromolecules;
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

  public scrollToTopLeftCorner() {
    const drawnEntitiesBoundingBox =
      RenderersManager.getRenderedStructuresBbox();

    ZoomTool.instance.scrollTo(
      new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top),
      false,
      MONOMER_START_X_POSITION - SnakeLayoutCellWidth / 4,
      MONOMER_START_Y_POSITION - SnakeLayoutCellWidth / 4,
      false,
    );
  }

  public destroy() {
    this.unsubscribeEvents();
    editor = undefined;
  }
}
