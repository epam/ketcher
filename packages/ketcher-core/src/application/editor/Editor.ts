import { drawnStructuresSelector } from 'application/editor/constants';
import {
  type Editor,
  type LibraryItemDragState,
  EditorType,
} from 'application/editor/editor.types';
import {
  type IEditorEvents,
  editorEvents,
  hotkeysConfiguration,
  renderersEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import {
  type LayoutMode,
  DEFAULT_LAYOUT_MODE,
  HAS_CONTENT_LAYOUT_MODE,
} from 'application/editor/modes/types';
import type { BaseMode } from 'application/editor/modes/internal';
import { getModeConstructor } from 'application/editor/modes/modesRegistry';
import { toolsMap } from 'application/editor/tools';
import { PolymerBond as PolymerBondTool } from 'application/editor/tools/Bond';
import {
  type BaseTool,
  type IRnaPreset,
  type Tool,
  type ToolConstructorInterface,
  type ToolEventHandlerName,
  isBaseTool,
} from 'application/editor/tools/Tool';
import {
  type IKetMacromoleculesContent,
  type IKetMonomerGroupTemplate,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
} from 'application/formatters/types/ket';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { getRenderedStructuresBbox } from 'application/render/renderers/utils';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  type NodeSelection,
  type NodesSelection,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import { ketcherProvider } from 'application/ketcherProvider';
import {
  type MonomerToAtomBond,
  type SubChainNode,
  ChainsCollection,
  Phosphate,
  Struct,
  Sugar,
  Vec2,
} from 'domain/entities';
import { KetMonomerClass } from 'domain/constants/monomers';
import { SequenceType } from 'domain/entities/monomer-chains/types';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Command } from 'domain/entities/Command';
import {
  DrawingEntitiesManager,
  MONOMER_START_X_POSITION,
  MONOMER_START_Y_POSITION,
} from 'domain/entities/DrawingEntitiesManager';
import { getStructureBbox } from 'domain/entities/structureBbox';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import {
  type AmbiguousMonomerType,
  type MonomerItemType,
  type MonomerOrAmbiguousType,
  AttachmentPointName,
} from 'domain/types';
import { DOMSubscription } from 'subscription';
import {
  type EditorLineLength,
  BILN_ALIAS_FORMAT_ERROR_MESSAGE,
  HELM_ALIAS_FORMAT_ERROR_MESSAGE,
  HELM_ALIAS_LENGTH_ERROR_MESSAGE,
  IDT_ALIAS_SLASH_ERROR_MESSAGE,
  IDT_ALIAS_LENGTH_ERROR_MESSAGE,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE,
  isValidBilnAlias,
  isValidHelmAlias,
  isValidHelmAliasLength,
  isValidIdtAlias,
  getTooLongIdtAliasEntries,
  getDisallowedModificationTypes,
  DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE,
  initHotKeys,
  isEditableInputTarget,
  KetcherLogger,
  keyNorm,
  SettingsManager,
} from 'utilities';
import monomersDataRaw from './data/monomers.ket';
import { type HistoryOperationType, EditorHistory } from './EditorHistory';
import { Coordinates } from './shared/coordinates';
import ZoomTool from './tools/Zoom';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { HandTool } from 'application/editor/tools/Hand';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import type { ToolName } from 'application/editor/tools/types';
import { BaseMonomerRenderer } from 'application/render';
import { getEmptyMonomersLibraryJson, parseMonomersLibrary } from './helpers';
import { TransientDrawingView } from 'application/render/renderers/TransientView/TransientDrawingView';
import { SelectLayoutModeOperation } from 'application/editor/operations/polymerBond';
import { ReinitializeModeOperation } from 'application/editor/operations';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import {
  getAminoAcidsToModify,
  getMonomerUniqueKey,
  isAmbiguousMonomerLibraryItem,
  isLibraryItemRnaPreset,
} from 'domain/helpers/monomers';
import { LineLengthChangeOperation } from 'application/editor/operations/editor/LineLengthChangeOperation';
import {
  setEditorInstance,
  resetEditorInstance,
} from 'application/editor/editorSingleton';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { blurActiveElement } from '../../utilities/dom';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { debounce } from 'lodash';
import type { D3SvgElementSelection } from 'application/render/types';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { SelectBase } from 'application/editor/tools/select/SelectBase';
import {
  getKetRef,
  getMonomerTemplateRefFromMonomerItem,
  KetSerializer,
} from 'domain/serializers';
import type { SequenceMode } from './modes/types/sequenceMode';

const SCROLL_SMOOTHNESS_IM_MS = 300;

const turnOnScrollAnimation = (
  canvas: D3SvgElementSelection<SVGGElement, void>,
) => {
  canvas.style('transition', `transform ${SCROLL_SMOOTHNESS_IM_MS}ms ease`);
};

export interface SkippedMonomerItem {
  name: string;
  reason: string;
}

/**
 * Thrown by `CoreEditor.updateMonomersLibrary` when one or more incoming
 * monomer definitions are invalid and could not be committed to the library.
 *
 * `partialSuccess` is `true` when at least one item from the payload was
 * committed successfully alongside the failures, and `false` when every item
 * was rejected.
 *
 * `skippedItems` holds a structured list of every rejected item — `name` is
 * the monomer or template identifier, `reason` is a human-readable explanation
 * of why it was skipped.
 *
 * @example
 * try {
 *   await ketcher.updateMonomersLibrary(data);
 * } catch (err) {
 *   if (err instanceof MonomerLibraryUpdateError) {
 *     console.warn(`Partial success: ${err.partialSuccess}`);
 *     err.skippedItems.forEach(({ name, reason }) =>
 *       console.warn(`Skipped ${name}: ${reason}`)
 *     );
 *   }
 * }
 */
export class MonomerLibraryUpdateError extends Error {
  readonly partialSuccess: boolean;
  readonly skippedItems: SkippedMonomerItem[];

  constructor(skippedItems: SkippedMonomerItem[], partialSuccess: boolean) {
    super(
      skippedItems.map(({ name, reason }) => `${name}: ${reason}`).join('\n'),
    );
    this.name = 'MonomerLibraryUpdateError';
    this.skippedItems = [...skippedItems];
    this.partialSuccess = partialSuccess;
  }
}

export class MonomerLibraryConvertError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'MonomerLibraryConvertError';
  }
}

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
  renderersContainer: RenderersManager;
  mode?: BaseMode;
}

interface ModifyAminoAcidsHandlerParams {
  monomers: BaseMonomer[];
  modificationType: string;
}

interface IAutochainMonomerAddResult {
  modelChanges: Command;
  firstMonomer: BaseMonomer;
  lastMonomer: BaseMonomer;
  drawingEntities: DrawingEntity[];
}

export const EditorClassName = 'Ketcher-polymer-editor-root';
export const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = `.${EditorClassName}`;
export const NATURAL_AMINO_ACID_MODIFICATION_TYPE = 'Natural amino acid';

/**
 * BILN aliases are supported only for peptide and CHEM monomers.
 */
const hasBilnAliasUniquenessScope = (
  monomerClass: KetMonomerClass | undefined,
) =>
  monomerClass === KetMonomerClass.AminoAcid ||
  monomerClass === KetMonomerClass.CHEM;

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
  public ketcherRootElement: HTMLDivElement | null;
  public drawnStructuresWrapperElement: SVGGElement;
  public canvasOffset: DOMRect = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  } as DOMRect;

  public ketcherRootElementBoundingClientRect: DOMRect | undefined;

  public nextAutochainPosition?: Vec2 = undefined;

  private libraryItemDragState: LibraryItemDragState = null;
  private libraryItemDragCancelled = false;

  public theme;
  public zoomTool: ZoomTool;
  private tool?: Tool | BaseTool;

  public get selectedTool(): Tool | BaseTool | undefined {
    return this.tool;
  }

  public mode: BaseMode;
  private readonly previousModes: BaseMode[] = [];
  public sequenceTypeEnterMode = SequenceType.RNA;
  private readonly micromoleculesEditor: Editor;
  private hotKeyEventHandler: (event: KeyboardEvent) => void = () => {};
  private copyEventHandler: (event: ClipboardEvent) => void = () => {};
  private pasteEventHandler: (event: ClipboardEvent) => void = () => {};
  private cutEventHandler: (event: ClipboardEvent) => void = () => {};
  private keydownEventHandler: (event: KeyboardEvent) => void = () => {};
  private contextMenuEventHandler: (event: MouseEvent) => void = () => {};
  private readonly cleanupsForDomEvents: Array<() => void> = [];

  constructor({
    ketcherId,
    theme,
    canvas,
    renderersContainer,
    mode,
  }: ICoreEditorConstructorParams) {
    const ketcher = ketcherProvider.getKetcher(ketcherId);

    this._type = EditorType.Micromolecules;
    this.ketcherId = ketcherId;
    this.theme = theme;
    this.canvas = canvas;
    this.ketcherRootElement = this.canvas?.closest<HTMLDivElement>(
      KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
    );
    this.drawnStructuresWrapperElement = canvas.querySelector(
      drawnStructuresSelector,
    ) as SVGGElement;
    this.mode = mode ?? new (getModeConstructor(DEFAULT_LAYOUT_MODE))();
    resetEditorEvents();
    this.events = editorEvents;
    KetSerializer.setMonomerFactory(monomerFactory);
    this.setMonomersLibrary(monomersDataRaw);
    this.events.updateMonomersLibrary.dispatch();
    this.subscribeEvents();
    this.renderersContainer = renderersContainer;
    this.drawingEntitiesManager = new DrawingEntitiesManager();
    this.viewModel = new ViewModel();
    this.domEventSetup();
    this.setupContextMenuEvents();
    this.setupKeyboardEvents();
    this.setupHotKeysEvents();
    this.setupCopyPasteEvent();
    this.resetCanvasOffset();
    this.resetKetcherRootElementOffset();
    this.zoomTool = ZoomTool.initInstance(this.drawingEntitiesManager);
    this.transientDrawingView = new TransientDrawingView();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    editor = this;
    setEditorInstance(this);
    this.micromoleculesEditor = ketcher?.editor;
    this.initializeGlobalEventListeners();
  }

  private resetCanvasOffset() {
    this.canvasOffset = this.canvas.getBoundingClientRect();
  }

  private resetKetcherRootElementOffset() {
    this.ketcherRootElementBoundingClientRect =
      this.ketcherRootElement?.getBoundingClientRect();
  }

  private initializeGlobalEventListeners(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('resize', this.handleWindowResize);
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.cancelActiveDrag();
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.cancelActiveDrag();
  };

  private readonly handleWindowResize = () => {
    this.resetCanvasOffset();
    this.resetKetcherRootElementOffset();
  };

  private cancelActiveDrag(): void {
    if (this.tool instanceof SelectBase && this.tool.mode !== 'standby') {
      this.tool.stopMovement();
    }
  }

  private clearSelectionAfterCopy(): void {
    const hasSelectedEntities =
      this.drawingEntitiesManager.selectedEntitiesArr.length > 0;

    if (!hasSelectedEntities) {
      return;
    }

    const modelChanges =
      this.drawingEntitiesManager.unselectAllDrawingEntities();

    this.renderersContainer.update(modelChanges);
  }

  public clearMonomersLibrary() {
    this._monomersLibrary = [];
    this._monomersLibraryParsedJson = getEmptyMonomersLibraryJson();
  }

  public async initializeMonomersLibraryFromKetcher(
    monomersLibraryUpdate?: string | JSON,
    monomersLibraryReplace?: string | JSON,
    onError?: (err: unknown) => void,
  ): Promise<void> {
    const monomersLibraryUpdateData =
      monomersLibraryUpdate || monomersLibraryReplace;
    if (!monomersLibraryUpdateData) {
      return;
    }

    try {
      const ketcher = ketcherProvider.getKetcher(this.ketcherId);
      if (monomersLibraryReplace) {
        this.clearMonomersLibrary();
      }
      const monomersLibraryUpdateInKetFormat =
        await ketcher.ensureMonomersLibraryDataInKetFormat(
          monomersLibraryUpdateData,
        );
      this.updateMonomersLibrary(monomersLibraryUpdateInKetFormat);
    } catch (err) {
      KetcherLogger.error(
        'Editor::initializeMonomersLibraryFromKetcher failed:',
        err,
      );

      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = 'Failed to load monomers library';
      }

      const errorTitle =
        err instanceof MonomerLibraryConvertError
          ? 'Monomer library conversion failed'
          : 'Monomer library update failed';

      this.events.openErrorModal.dispatch({
        errorMessage,
        errorTitle,
      });
      onError?.(err);
    }
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
    const storedMonomerLibraryUpdates = SettingsManager.monomerLibraryUpdates;
    storedMonomerLibraryUpdates.forEach((update) => {
      const parsedUpdate = JSON.parse(update);

      if (parsedUpdate.replacement) {
        this.clearMonomersLibrary();
        this.updateMonomersLibrary(parsedUpdate.data);
      } else {
        this.updateMonomersLibrary(parsedUpdate.data || update);
      }
    });
    persistentMonomersLibrary = this._monomersLibrary;
    persistentMonomersLibraryParsedJson = this._monomersLibraryParsedJson;
  }

  /**
   * Upserts the provided monomer definitions into the in-memory library.
   *
   * @throws {MonomerLibraryUpdateError} When one or more items fail validation.
   *   `skippedItems` lists every rejected monomer with a `name` and `reason`.
   *   `partialSuccess` is `true` when at least one item was committed before
   *   the error was raised. There is no rollback, so items committed before
   *   the first failure remain in the library.
   */
  public updateMonomersLibrary(monomersDataRaw: string | JSON) {
    const {
      monomersLibraryParsedJson: newMonomersLibraryChunkParsedJson,
      monomersLibrary: newMonomersLibraryChunk,
    } = parseMonomersLibrary(monomersDataRaw);
    const skippedItems: SkippedMonomerItem[] = [];
    const reportValidationError = (name: string, reason: string) => {
      const message = `${name}: ${reason}`;
      KetcherLogger.error('Editor::updateMonomersLibrary', message);
      skippedItems.push({ name, reason });
    };
    let didCommitAnyItem = false;

    const areSameMonomers = (
      firstMonomer?: MonomerItemType,
      secondMonomer?: MonomerItemType,
    ) => {
      if (!firstMonomer?.props || !secondMonomer?.props) {
        return false;
      }

      return (
        firstMonomer.props.MonomerName === secondMonomer.props.MonomerName &&
        firstMonomer.props.MonomerClass === secondMonomer.props.MonomerClass &&
        firstMonomer.props.hidden === secondMonomer.props.hidden
      );
    };
    const formatAliasDetails = (monomer: MonomerItemType) =>
      [
        monomer.props?.aliasHELM
          ? `HELM alias "${monomer.props.aliasHELM}"`
          : null,
        monomer.props?.aliasBILN
          ? `BILN alias "${monomer.props.aliasBILN}"`
          : null,
        monomer.props?.idtAliases?.base
          ? `IDT base alias "${monomer.props.idtAliases.base}"`
          : null,
        monomer.props?.idtAliases?.modifications?.endpoint3
          ? `IDT 3' alias "${monomer.props.idtAliases.modifications.endpoint3}"`
          : null,
        monomer.props?.idtAliases?.modifications?.endpoint5
          ? `IDT 5' alias "${monomer.props.idtAliases.modifications.endpoint5}"`
          : null,
        monomer.props?.idtAliases?.modifications?.internal
          ? `IDT internal alias "${monomer.props.idtAliases.modifications.internal}"`
          : null,
      ]
        .filter((value): value is string => Boolean(value))
        .join(', ');

    // handle monomer templates
    newMonomersLibraryChunk.forEach((newMonomer) => {
      const disallowedModificationTypes = getDisallowedModificationTypes(
        newMonomer.props?.modificationTypes,
      );
      if (disallowedModificationTypes.length > 0) {
        const errorMessage = `Editor::updateMonomersLibrary: Load of "${
          newMonomer.props.MonomerName
        }" monomer has failed. ${DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE} Offending modification type(s): ${disallowedModificationTypes.join(
          ', ',
        )}. The monomer was not added to the library.`;
        KetcherLogger.error(errorMessage);
        return;
      }

      const newMonomerHasBilnAliasUniquenessScope = hasBilnAliasUniquenessScope(
        newMonomer.props?.MonomerClass,
      );
      if (
        newMonomer.props?.aliasHELM &&
        !isValidHelmAlias(newMonomer.props.aliasHELM)
      ) {
        reportValidationError(
          newMonomer.props.MonomerName,
          `Invalid HELM alias value. ${HELM_ALIAS_FORMAT_ERROR_MESSAGE} The monomer was not added to the library.`,
        );
        return;
      }
      if (
        newMonomer.props?.aliasBILN &&
        !isValidBilnAlias(newMonomer.props.aliasBILN)
      ) {
        const errorMessage = `Editor::updateMonomersLibrary: Load of "${newMonomer.props.MonomerName}" monomer has failed, monomer definition contains invalid BILN alias value. ${BILN_ALIAS_FORMAT_ERROR_MESSAGE} The monomer was not added to the library.`;
        KetcherLogger.error(errorMessage);
        return;
      }

      if (
        newMonomer.props?.aliasHELM &&
        !isValidHelmAliasLength(newMonomer.props.aliasHELM)
      ) {
        reportValidationError(
          newMonomer.props.MonomerName,
          `Invalid HELM alias value. ${HELM_ALIAS_LENGTH_ERROR_MESSAGE} The monomer was not added to the library.`,
        );
        return;
      }

      const aliasCollisionExists = this._monomersLibrary.some((monomer) => {
        if (areSameMonomers(monomer, newMonomer)) {
          return false;
        }

        return (
          (Boolean(newMonomer.props?.aliasHELM) &&
            monomer.props?.aliasHELM === newMonomer.props?.aliasHELM) ||
          (newMonomerHasBilnAliasUniquenessScope &&
            Boolean(newMonomer.props?.aliasBILN) &&
            hasBilnAliasUniquenessScope(monomer.props?.MonomerClass) &&
            monomer.props?.aliasBILN === newMonomer.props?.aliasBILN) ||
          (Boolean(newMonomer.props?.idtAliases?.base) &&
            monomer.props?.idtAliases?.base ===
              newMonomer.props?.idtAliases?.base) ||
          (Boolean(newMonomer.props?.idtAliases?.modifications?.endpoint3) &&
            monomer.props?.idtAliases?.modifications?.endpoint3 ===
              newMonomer.props?.idtAliases?.modifications?.endpoint3) ||
          (Boolean(newMonomer.props?.idtAliases?.modifications?.endpoint5) &&
            monomer.props?.idtAliases?.modifications?.endpoint5 ===
              newMonomer.props?.idtAliases?.modifications?.endpoint5) ||
          (Boolean(newMonomer.props?.idtAliases?.modifications?.internal) &&
            monomer.props?.idtAliases?.modifications?.internal ===
              newMonomer.props?.idtAliases?.modifications?.internal)
        );
      });

      if (aliasCollisionExists) {
        const aliasDetails = formatAliasDetails(newMonomer);
        reportValidationError(
          newMonomer.props.MonomerName,
          `Alias collision detected${
            aliasDetails ? ` (${aliasDetails})` : ''
          }. The monomer was not added to the library.`,
        );
        return;
      }

      // Validate base IDT alias is present when idtAliases is defined
      if (newMonomer.props?.idtAliases && !newMonomer.props.idtAliases.base) {
        reportValidationError(
          newMonomer.props.MonomerName,
          `Base IDT alias is required when idtAliases is defined. The monomer was not added to the library.`,
        );
        return;
      }

      // Validate that slashes in IDT aliases only appear at first/last position
      if (newMonomer.props?.idtAliases) {
        const { base, modifications } = newMonomer.props.idtAliases;
        const aliasesToValidate = [
          base,
          modifications?.endpoint3,
          modifications?.endpoint5,
          modifications?.internal,
        ].filter(Boolean) as string[];

        const hasInvalidSlash = aliasesToValidate.some(
          (alias) => !isValidIdtAlias(alias),
        );

        if (hasInvalidSlash) {
          reportValidationError(
            newMonomer.props.MonomerName,
            `${IDT_ALIAS_SLASH_ERROR_MESSAGE} The monomer was not added to the library.`,
          );
          return;
        }

        const tooLongEntries = getTooLongIdtAliasEntries(
          newMonomer.props.idtAliases,
        );

        if (tooLongEntries.length > 0) {
          const offenders = tooLongEntries
            .map(({ alias: field, value }) => `${field}="${value}"`)
            .join(', ');
          const errorMessage = `Editor::updateMonomersLibrary: Load of "${newMonomer.props.MonomerName}" monomer has failed. ${IDT_ALIAS_LENGTH_ERROR_MESSAGE} Offending field(s): ${offenders}. The monomer was not added to the library.`;
          KetcherLogger.error(errorMessage);
          return;
        }
      }

      const existingMonomerIndex = this._monomersLibrary.findIndex((monomer) =>
        areSameMonomers(monomer, newMonomer),
      );

      const newMonomerTemplateRef =
        getMonomerTemplateRefFromMonomerItem(newMonomer);

      if (existingMonomerIndex !== -1) {
        const existingMonomerTemplateRef = getMonomerTemplateRefFromMonomerItem(
          this._monomersLibrary[existingMonomerIndex],
        );

        // It's safe to use non-null assertion here and below because we already specified monomers library and parsed JSON before
        const existingMonomerRefIndex =
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this._monomersLibraryParsedJson!.root.templates.findIndex(
            (template) => template.$ref === existingMonomerTemplateRef,
          );
        if (existingMonomerRefIndex !== -1) {
          const existingMonomer = this._monomersLibrary[existingMonomerIndex];
          const { id } = existingMonomer.props;
          const existingMonomerId = id ?? getMonomerUniqueKey(existingMonomer);
          this._monomersLibrary[existingMonomerIndex] = newMonomer;
          this._monomersLibrary[existingMonomerIndex].props.id =
            existingMonomerId;
          didCommitAnyItem = true;

          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this._monomersLibraryParsedJson![existingMonomerTemplateRef] =
            newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
        } else {
          // This case should never happen because if we have a monomer in the library it should have a reference in the parsed JSON
          KetcherLogger.error(
            'Editor::updateMonomersLibrary: A ref is missing for a monomer in library',
            existingMonomerTemplateRef,
          );
        }
      } else {
        this._monomersLibrary.push(newMonomer);
        didCommitAnyItem = true;

        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        this._monomersLibraryParsedJson!.root.templates.push(
          getKetRef(newMonomerTemplateRef),
        );
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        this._monomersLibraryParsedJson![newMonomerTemplateRef] =
          newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
      }
    });

    // handle monomer group templates
    newMonomersLibraryChunkParsedJson.root.templates.forEach((templateRef) => {
      const templateDefinition =
        newMonomersLibraryChunkParsedJson[templateRef.$ref];

      if (templateDefinition.type !== KetTemplateType.MONOMER_GROUP_TEMPLATE) {
        return;
      }

      if (templateDefinition.class !== KetMonomerGroupTemplateClass.RNA) {
        reportValidationError(
          templateRef.$ref,
          `Monomer group template class must be "${KetMonomerGroupTemplateClass.RNA}". The template was not added to the library.`,
        );
        return;
      }

      if (!templateDefinition.name?.trim()) {
        reportValidationError(
          templateRef.$ref,
          `Monomer group template name cannot be empty or whitespace. The template was not added to the library.`,
        );
        return;
      }

      if (
        templateDefinition.name.length > MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH
      ) {
        const truncatedTemplateName = `${templateDefinition.name.slice(
          0,
          MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH,
        )}...`;
        KetcherLogger.error(
          `Editor::updateMonomersLibrary: Load of monomer group template "${truncatedTemplateName}" (length: ${templateDefinition.name.length}, template: ${templateRef.$ref}) has failed. ${MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE} The template was not added to the library.`,
        );
        return;
      }

      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      this._monomersLibraryParsedJson![templateRef.$ref] = templateDefinition;
      didCommitAnyItem = true;
      if (
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        !this._monomersLibraryParsedJson!.root.templates.find(
          (existingTemplateRef) =>
            existingTemplateRef.$ref === templateRef.$ref,
        )
      ) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        this._monomersLibraryParsedJson!.root.templates.push(templateRef);
      }
    });

    this.events.updateMonomersLibrary.dispatch();

    if (skippedItems.length > 0) {
      throw new MonomerLibraryUpdateError(skippedItems, didCommitAnyItem);
    }
  }

  public get monomersLibraryParsedJson() {
    return this._monomersLibraryParsedJson;
  }

  public get monomersLibrary() {
    return this._monomersLibrary;
  }

  public checkIfMonomerSymbolClassPairExists(
    symbol: string,
    monomerClass: KetMonomerClass | 'rnaPreset' | undefined,
  ) {
    if (!monomerClass) {
      return true;
    }

    return this._monomersLibrary.some((monomerItem) => {
      if (isAmbiguousMonomerLibraryItem(monomerItem)) {
        return false;
      }

      const { props } = monomerItem;
      return (
        props.MonomerClass === monomerClass &&
        (props.aliasHELM === symbol || props.MonomerName === symbol)
      );
    });
  }

  public checkIfBilnAliasExists(alias: string) {
    return this._monomersLibrary.some((monomerItem) => {
      if (isAmbiguousMonomerLibraryItem(monomerItem)) {
        return false;
      }

      return (
        hasBilnAliasUniquenessScope(monomerItem.props.MonomerClass) &&
        monomerItem.props.aliasBILN === alias
      );
    });
  }

  public checkIfPresetCodeExists(code: string) {
    const rnaPresets = this.defaultRnaPresetsLibraryItems;
    return rnaPresets.some((preset) => preset.name === code);
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

    if (
      keySettings[shortcutKey]?.handler &&
      !isEditableInputTarget(event.target)
    ) {
      keySettings[shortcutKey].handler(this);
      event.preventDefault();
    }
  }

  private setupKeyboardEvents() {
    this.keydownEventHandler = (event: KeyboardEvent) => {
      let isPropagationStopped = false;
      const originalStopPropagation = event.stopPropagation.bind(event);
      event.stopPropagation = () => {
        isPropagationStopped = true;
        originalStopPropagation();
      };

      this.events.keyDown.dispatch(event);

      if (!isPropagationStopped) {
        this.mode.onKeyDown(event).catch((error) => {
          KetcherLogger.error('Editor.ts::keydownEventHandler', error);
        });
      }
    };

    document.addEventListener('keydown', this.keydownEventHandler);
  }

  private setupCopyPasteEvent() {
    this.copyEventHandler = (event: ClipboardEvent) => {
      // Need to add some abstraction for events handling to have a single point where we can disable events for macro mode
      if (this._type === EditorType.Micromolecules) {
        return;
      }

      this.mode.onCopy(event);
      this.clearSelectionAfterCopy();
    };
    this.pasteEventHandler = (event: ClipboardEvent) => {
      // Need to add some abstraction for events handling to have a single point where we can disable events for macro mode
      if (this._type === EditorType.Micromolecules) {
        return;
      }

      this.mode.onPaste(event);
    };
    this.cutEventHandler = (event: ClipboardEvent) => {
      // Need to add some abstraction for events handling to have a single point where we can disable events for macro mode
      if (this._type === EditorType.Micromolecules) {
        return;
      }

      this.mode.onCut(event);
    };
    document.addEventListener('copy', this.copyEventHandler);
    document.addEventListener('paste', this.pasteEventHandler);
    document.addEventListener('cut', this.cutEventHandler);
  }

  private setupHotKeysEvents() {
    this.hotKeyEventHandler = (event) => this.handleHotKeyEvents(event);
    document.addEventListener('keydown', this.hotKeyEventHandler);
  }

  private setupContextMenuEvents() {
    this.contextMenuEventHandler = (event) => {
      const target = event.target as Node | null;
      // Guard: only handle events whose target is inside this editor's root element
      if (
        !this.ketcherRootElement ||
        !target ||
        !this.ketcherRootElement.contains(target)
      ) {
        return;
      }

      event.preventDefault();

      if (this.libraryItemDragState) {
        this.cancelLibraryItemDrag();
        return;
      }

      // If the right-click happened inside an already-open context menu (the
      // menu DOM is rendered as a portal sibling of the canvas SVG and overlaps
      // the symbol underneath), event.target.__data__ is undefined and the
      // logic below would fall through to rightClickCanvasSequence and replace
      // the original menu with a reduced one. Skip the dispatch in that case.
      if ((event.target as HTMLElement | null)?.closest('.contexify')) {
        return;
      }

      const eventData = event.target?.__data__;
      const canvasBoundingClientRect = this.canvas.getBoundingClientRect();
      const isClickOnCanvas =
        event.clientX >= canvasBoundingClientRect.left &&
        event.clientX <= canvasBoundingClientRect.right &&
        event.clientY >= canvasBoundingClientRect.top &&
        event.clientY <= canvasBoundingClientRect.bottom;
      const sequenceSelections: NodesSelection =
        SequenceRenderer.selections.map((selectionRange) =>
          selectionRange.flatMap((twoStrandedNodeSelection) => {
            const result: NodeSelection[] = [];
            const { senseNode, antisenseNode } = twoStrandedNodeSelection.node;

            // Add sense node if it's selected
            if (senseNode?.monomer.selected && senseNode) {
              result.push({
                ...twoStrandedNodeSelection,
                node: senseNode as SubChainNode,
                twoStrandedNode: twoStrandedNodeSelection.node,
              });
            }

            // Add antisense node if it's selected
            if (antisenseNode?.monomer.selected && antisenseNode) {
              result.push({
                ...twoStrandedNodeSelection,
                node: antisenseNode as SubChainNode,
                twoStrandedNode: twoStrandedNodeSelection.node,
              });
            }

            return result;
          }),
        );
      const selectedMonomers = this.drawingEntitiesManager.selectedEntities
        .filter(([, drawingEntity]) => drawingEntity instanceof BaseMonomer)
        .map(([, drawingEntity]) => drawingEntity as BaseMonomer);
      const hasSelectedEntities =
        this.drawingEntitiesManager.selectedEntitiesArr.length > 0;

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
        !eventData.monomer.selected
      ) {
        const modelChanges = this.drawingEntitiesManager.selectDrawingEntity(
          eventData.monomer,
        );

        this.renderersContainer.update(modelChanges);
        this.events.selectEntities.dispatch(
          this.drawingEntitiesManager.selectedEntities.map(
            (entity) => entity[1],
          ),
        );
        this.events.rightClickSelectedMonomers.dispatch([
          event,
          [eventData.monomer],
        ]);
      } else if (
        (eventData instanceof BaseMonomerRenderer &&
          eventData.monomer.selected) ||
        (hasSelectedEntities && eventData?.drawingEntity?.selected)
      ) {
        // Handle right-click on selected entities (monomers and microstructures).
        this.events.rightClickSelectedMonomers.dispatch([event]);
        this.events.rightClickSelectedMonomers.dispatch([
          event,
          selectedMonomers,
        ]);
      } else if (isClickOnCanvas) {
        if (this.mode.modeName === 'sequence-layout-mode') {
          this.events.rightClickCanvasSequence.dispatch([
            event,
            sequenceSelections,
          ]);
        } else {
          this.events.rightClickCanvas.dispatch([event, selectedMonomers]);
        }
      }

      return false;
    };

    document.addEventListener('contextmenu', this.contextMenuEventHandler);
  }

  private async onLayoutCircular() {
    const ketcher = ketcherProvider.getKetcher(this.ketcherId);

    await ketcher.circularLayoutMonomers();
    this.clearTransientViews();
    this.clearSelection();
  }

  private subscribeEvents() {
    this.events.layoutCircular.add(() => this.onLayoutCircular());
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
    });
    this.events.copySelectedStructure.add(() => {
      this.mode.onCopy();
      this.clearSelectionAfterCopy();
    });
    this.events.pasteFromClipboard.add(() => {
      this.mode.onPaste();
    });
    this.events.deleteSelectedStructure.add(() => {
      if (this.mode.modeName === 'sequence-layout-mode') {
        this.sequenceMode.deleteSelection();

        return;
      }

      const command = new Command();
      const history = EditorHistory.getInstance(this);

      command.merge(this.drawingEntitiesManager.deleteSelectedEntities());
      history.update(command);
      this.renderersContainer.update(command);
      this.events.selectEntities.dispatch(
        this.drawingEntitiesManager.selectedEntities.map((entity) => entity[1]),
      );
      this.clearTransientViews();
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
        const history = EditorHistory.getInstance(this);

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
        const modelChanges = new Command();
        const history = EditorHistory.getInstance(this);
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

        modelChanges.merge(monomersAddResult.modelChanges);

        modelChanges.merge(
          this.drawingEntitiesManager.selectDrawingEntities(
            monomersAddResult.drawingEntities,
          ),
        );

        history.update(modelChanges);
        this.renderersContainer.update(modelChanges);
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
    this.events.flipHorizontal.add(() => this.onFlipHorizontal());
    this.events.flipVertical.add(() => this.onFlipVertical());
  }

  private onFlipHorizontal() {
    if (this.mode.modeName === 'sequence-layout-mode') {
      return;
    }

    const command = new Command();
    const history = EditorHistory.getInstance(this);

    command.merge(
      this.drawingEntitiesManager.flipSelectedDrawingEntities('horizontal'),
    );
    history.update(command);
    this.renderersContainer.update(command);
    this.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
    this.events.selectEntities.dispatch(
      this.drawingEntitiesManager.selectedEntities.map((entity) => entity[1]),
    );
  }

  private onFlipVertical() {
    if (this.mode.modeName === 'sequence-layout-mode') {
      return;
    }

    const command = new Command();
    const history = EditorHistory.getInstance(this);

    command.merge(
      this.drawingEntitiesManager.flipSelectedDrawingEntities('vertical'),
    );
    history.update(command);
    this.renderersContainer.update(command);
    this.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
    this.events.selectEntities.dispatch(
      this.drawingEntitiesManager.selectedEntities.map((entity) => entity[1]),
    );
  }

  public getDataForAutochain() {
    const selectedMonomers = this.drawingEntitiesManager.selectedMonomers;
    const selectedMonomersWithFreeR2 = selectedMonomers.filter((monomer) => {
      return monomer.isAttachmentPointExistAndFree(AttachmentPointName.R2);
    });
    const selectedMonomerToConnect =
      selectedMonomersWithFreeR2.length === 1
        ? selectedMonomersWithFreeR2[0]
        : undefined;
    let newMonomerPosition: Vec2;

    if (selectedMonomerToConnect) {
      newMonomerPosition = selectedMonomerToConnect.position.add(
        new Vec2(1.5, 0),
      );
    } else if (this.drawingEntitiesManager.hasMonomers) {
      if (
        this.nextAutochainPosition &&
        this.mode.modeName !== 'snake-layout-mode'
      ) {
        newMonomerPosition = this.nextAutochainPosition;
      } else {
        newMonomerPosition =
          this.drawingEntitiesManager.bottomLeftMonomerPosition.add(
            new Vec2(0, 1.5),
          );
      }
    } else {
      newMonomerPosition = Coordinates.canvasToModel(
        new Vec2(MONOMER_START_X_POSITION, MONOMER_START_Y_POSITION),
      );
    }

    return {
      selectedMonomerToConnect,
      newMonomerPosition,
      selectedMonomersWithFreeR2,
      selectedMonomers,
    };
  }

  private onRemoveAutochainPreview() {
    this.transientDrawingView.hideAutochainPreview();
    this.transientDrawingView.update();
  }

  private onPreviewAutochain(monomerOrRnaItem: MonomerItemType | IRnaPreset) {
    if (this.mode.modeName === 'sequence-layout-mode') {
      return;
    }

    this.invalidateNextAutochainPositionIfNeeded(
      isLibraryItemRnaPreset(monomerOrRnaItem),
    );

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
    if (this.mode.modeName === 'sequence-layout-mode') {
      return;
    }

    this.invalidateNextAutochainPositionIfNeeded(
      isLibraryItemRnaPreset(monomerOrRnaItem),
    );

    const canvasWasEmptyBeforeAutochain =
      this.drawingEntitiesManager.allEntities.length === 0;
    const modelChanges = new Command();
    const history = EditorHistory.getInstance(this);
    const { selectedMonomerToConnect, newMonomerPosition } =
      this.getDataForAutochain();

    let monomersAddResult: IAutochainMonomerAddResult | undefined;

    if (isLibraryItemRnaPreset(monomerOrRnaItem)) {
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

    if (this.mode.modeName === 'snake-layout-mode') {
      modelChanges.merge(this.drawingEntitiesManager.applySnakeLayout(true));
    }

    if (canvasWasEmptyBeforeAutochain) {
      modelChanges.merge(
        this.drawingEntitiesManager.selectDrawingEntities(
          monomersAddResult.drawingEntities,
        ),
      );
    }

    modelChanges.setUndoOperationsByPriority();
    this.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    this.calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);

    if (this.mode.modeName === 'snake-layout-mode') {
      this.zoomTool.scrollToVerticalBottom();
    } else if (this.mode.modeName === 'flex-layout-mode') {
      const editorSettings = provideEditorSettings();
      const oneLayoutCellInAngstroms =
        SnakeLayoutCellWidth / editorSettings.macroModeScale;
      const chainsCollection = ChainsCollection.fromMonomers([
        monomersAddResult.lastMonomer,
      ]);
      const monomersInChainUsedForAutochain =
        chainsCollection.chains[0].monomers;
      const chainBbox = getStructureBbox(monomersInChainUsedForAutochain);
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
    if (this.mode.modeName === 'sequence-layout-mode') {
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
        connections: rnaPresetItem.connections,
      });
    const sugar = monomers.find(
      (monomer) => monomer instanceof Sugar,
    ) as BaseMonomer;
    const phosphate = monomers.find((monomer) => monomer instanceof Phosphate);
    const isFivePrimePhosphate =
      phosphate &&
      sugar.attachmentPointsToBonds.R1?.getAnotherEntity(sugar) === phosphate &&
      phosphate.attachmentPointsToBonds.R2?.getAnotherEntity(phosphate) ===
        sugar;

    modelChanges.merge(addPresetModelChanges);

    return {
      modelChanges,
      firstMonomer: isFivePrimePhosphate ? phosphate : sugar,
      lastMonomer: isFivePrimePhosphate ? sugar : phosphate ?? sugar,
      drawingEntities: [
        ...monomers,
        ...(sugar.attachmentPointsToBonds.R2
          ? [sugar.attachmentPointsToBonds.R2]
          : []),
        ...(sugar.attachmentPointsToBonds.R3
          ? [sugar.attachmentPointsToBonds.R3]
          : []),
      ],
    };
  }

  private onPlaceMonomerOnCanvas(monomerItem: MonomerItemType, position: Vec2) {
    if (this.mode.modeName === 'sequence-layout-mode') {
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
      drawingEntities: [monomer],
    };
  }

  private onPlaceAmbiguousMonomerOnCanvas(
    monomerItem: AmbiguousMonomerType,
    position: Vec2,
  ) {
    if (this.mode.modeName === 'sequence-layout-mode') {
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
      drawingEntities: [monomer],
    };
  }

  private clearTransientViews() {
    this.transientDrawingView.clear();
    this.transientDrawingView.update();
  }

  private clearSelection() {
    const turnOffSelectionCommand =
      this.drawingEntitiesManager.unselectAllDrawingEntities();
    this.renderersContainer.update(turnOffSelectionCommand);
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
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.turnOnEditMode(sequenceItemRenderer);
  }

  private onEstablishHydrogenBondSequenceMode(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.establishHydrogenBond(sequenceItemRenderer);
  }

  private onDeleteHydrogenBondSequenceMode(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.deleteHydrogenBond(sequenceItemRenderer);
  }

  private onTurnOnSequenceEditInRNABuilderMode() {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.turnOnSequenceEditInRNABuilderMode();
  }

  private onTurnOffSequenceEditInRNABuilderMode() {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.turnOffSequenceEditInRNABuilderMode();
  }

  private onChangeSequenceTypeEnterMode(mode: SequenceType) {
    this.sequenceTypeEnterMode = mode;
  }

  private onChangeToggleIsSequenceSyncEditMode(
    isSequenceSyncEditMode: boolean,
  ) {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    const sequenceMode = this.sequenceMode;
    if (isSequenceSyncEditMode) {
      sequenceMode.turnOnSyncEditMode();
    } else {
      sequenceMode.turnOffSyncEditMode();
    }
  }

  private onResetSequenceSyncEditMode() {
    if (this.mode.modeName !== 'sequence-layout-mode') {
      return;
    }

    this.sequenceMode.resetEditMode();
  }

  private onCreateAntisenseChain(isDnaAntisense: boolean) {
    const history = EditorHistory.getInstance(this);
    const modelChanges =
      this.drawingEntitiesManager.createAntisenseChain(isDnaAntisense);

    modelChanges.merge(
      this.drawingEntitiesManager.unselectAllDrawingEntities(),
    );

    modelChanges.setUndoOperationsByPriority();
    this.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    this.scrollToTopLeftCorner();
    this.clearTransientViews();
  }

  private onSelectMonomer(monomer: MonomerItemType) {
    if (
      this.mode.modeName === 'sequence-layout-mode' &&
      !this.isSequenceEditMode &&
      SequenceRenderer.chainsCollection.length === 0
    ) {
      this.sequenceMode.turnOnEditMode();
    }

    if (this.mode.modeName === 'sequence-layout-mode') {
      this.sequenceMode.insertMonomerFromLibrary(monomer);
    }
  }

  private onSelectRNAPreset(preset: IRnaPreset) {
    if (
      this.mode.modeName === 'sequence-layout-mode' &&
      !this.isSequenceEditMode &&
      SequenceRenderer.chainsCollection.length === 0
    ) {
      this.sequenceMode.turnOnEditMode();
    }

    if (this.mode.modeName === 'sequence-layout-mode') {
      this.sequenceMode.insertPresetFromLibrary(preset);
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
      const history = EditorHistory.getInstance(this);

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

      if (this.mode.modeName === 'snake-layout-mode') {
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
    const ModeConstructor = getModeConstructor(mode);
    const history = EditorHistory.getInstance(this);
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

  public getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue() {
    const grouped: Record<string, Set<string>> = {};

    this.monomersLibrary.forEach((monomerItem) => {
      const naturalAnalogue = monomerItem.props?.MonomerNaturalAnalogCode;

      if (monomerItem.props?.modificationTypes) {
        if (!grouped[naturalAnalogue]) {
          grouped[naturalAnalogue] = new Set<string>();
        }

        monomerItem.props.modificationTypes.forEach((modificationType) => {
          grouped[naturalAnalogue].add(modificationType);
        });
      }
    });

    // Convert sets to sorted arrays, with 'Natural amino acid' first if present
    const result: Record<string, string[]> = {};
    Object.entries(grouped).forEach(([analogue, typesSet]) => {
      const types = Array.from(typesSet).sort((a, b) => {
        const aTitle = a.toLowerCase();
        const bTitle = b.toLowerCase();
        const naturalType = NATURAL_AMINO_ACID_MODIFICATION_TYPE.toLowerCase();

        if (aTitle === naturalType) return -1;
        if (bTitle === naturalType) return 1;

        return aTitle.localeCompare(bTitle);
      });
      result[analogue] = types;
    });

    return result;
  }

  private onModifyAminoAcids(
    monomers: BaseMonomer[],
    modificationType: string,
  ) {
    const modelChanges = new Command();
    const editorHistory = EditorHistory.getInstance(editor);
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

  private get sequenceMode(): SequenceMode {
    return this.mode as unknown as SequenceMode;
  }

  public get isSequenceMode() {
    return this.mode.modeName === 'sequence-layout-mode';
  }

  public get isSequenceEditMode() {
    return (
      this.mode.modeName === 'sequence-layout-mode' &&
      this.sequenceMode.isEditMode
    );
  }

  public get isSequenceEditInRNABuilderMode() {
    return (
      this.mode.modeName === 'sequence-layout-mode' &&
      this.sequenceMode.isEditInRNABuilderMode
    );
  }

  public get isSequenceAnyEditMode() {
    const sequenceMode = this.sequenceMode;
    return (
      this.mode.modeName === 'sequence-layout-mode' &&
      (sequenceMode.isEditMode || sequenceMode.isEditInRNABuilderMode)
    );
  }

  public onSelectHistory(name: HistoryOperationType) {
    const history = EditorHistory.getInstance(this);
    if (name === 'undo') {
      history.undo();
      this.clearTransientViews();
    } else if (name === 'redo') {
      history.redo();
      this.clearTransientViews();
    }
    // Undo/redo can leave the cached autochain position stale, so recompute it.
    this.calculateAndStoreNextAutochainPosition(this.drawingEntitiesManager);
  }

  public selectTool(name: ToolName, options?) {
    const ToolConstructor: ToolConstructorInterface = toolsMap[name];
    const oldTool = this.tool;

    this.clearTransientViews();
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
    document.removeEventListener('cut', this.cutEventHandler);
    document.removeEventListener('keydown', this.keydownEventHandler);
    document.removeEventListener('contextmenu', this.contextMenuEventHandler);
    this.canvas.removeEventListener('mousedown', blurActiveElement);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('resize', this.handleWindowResize);

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
          !['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) ||
          this.isMouseMainButtonPressed(event)
        ) {
          this.useModeIfNeeded(toolEventHandler, event);
          this.useToolIfNeeded(toolEventHandler, event);
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
    const conditions = [
      eventHandlerName in editorTool,
      this.canvas.contains(event?.target) || editorTool.isSelectionRunning?.(),
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
    const history = EditorHistory.getInstance(this);
    const struct = this.micromoleculesEditor.struct();
    const reStruct = this.micromoleculesEditor.render.ctab;
    const zoomTool = ZoomTool.instance;

    this.clearTransientViews();
    this.clearSelection();

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

    // Rescale coords from macro to micro so the visual position is preserved
    // when microModeScale (ACS bond length) differs from macroModeScale.
    const scaleFactor = this.rescaleStructForModeTransition(
      struct,
      'macroToMicro',
    );

    history.destroy();
    this.drawingEntitiesManager.clearCanvas();
    zoomTool.resetZoom();
    struct.applyMonomersTransformations(scaleFactor);
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
    this.resetKetcherRootElementOffset();
    this.resetModeIfNeeded();
    this.clearTransientViews();
    this.clearSelection();

    const struct = this.micromoleculesEditor?.struct() ?? new Struct();

    // Rescale coords from micro to macro so the visual position is preserved
    // when microModeScale (ACS bond length) differs from macroModeScale.
    this.rescaleStructForModeTransition(struct, 'microToMacro');

    const ketcher = ketcherProvider.getKetcher(this.ketcherId);
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        this.drawingEntitiesManager,
      );
    this.viewModel.initialize([...this.drawingEntitiesManager.bonds.values()]);

    if (this.mode.modeName === 'snake-layout-mode') {
      modelChanges.merge(
        this.drawingEntitiesManager.applySnakeLayout(true, true, false),
      );
    }

    if (this.mode.modeName === 'flex-layout-mode') {
      modelChanges.merge(
        this.drawingEntitiesManager.recalculateAntisenseChains(),
      );
    }

    if (this.mode.modeName === 'sequence-layout-mode') {
      this.mode.initialize(false, false, false);
    } else {
      this.renderersContainer.update(modelChanges);
    }

    ketcher?.editor.clear();
    ketcher?.editor.clearHistory();
    ketcher?.editor.zoom(1);
    this._type = EditorType.Macromolecules;
  }

  private rescaleStructForModeTransition(
    struct: Struct,
    direction: 'microToMacro' | 'macroToMicro',
  ): number {
    const microModeScale =
      this.micromoleculesEditor?.render?.options?.microModeScale;
    const macroModeScale = provideEditorSettings().macroModeScale;

    if (microModeScale == null || microModeScale === macroModeScale) {
      return 1;
    }

    const sourceScale =
      direction === 'microToMacro' ? microModeScale : macroModeScale;
    const targetScale =
      direction === 'microToMacro' ? macroModeScale : microModeScale;
    // Both mode scales are angstrom-to-pixel factors, so model coords convert
    // between modes by sourceScale / targetScale.
    const scaleFactor = sourceScale / targetScale;

    struct.scale(scaleFactor);

    if (direction === 'microToMacro') {
      // MonomerMicromolecule centers are skipped by Struct.scale() and need
      // their own mode-transition rescale on the micro-to-macro path.
      struct.scaleMonomerMicromoleculeSgroups(scaleFactor);
    }

    return scaleFactor;
  }

  public isCurrentModeWithAutozoom(): boolean {
    return (
      this.mode.modeName === 'flex-layout-mode' ||
      this.mode.modeName === 'snake-layout-mode'
    );
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
    const structureBbox = getRenderedStructuresBbox();

    ZoomTool.instance.zoomStructureToFitHalfOfCanvas(structureBbox);
  }

  public scrollToTopLeftCorner() {
    const drawnEntitiesBoundingBox = getRenderedStructuresBbox();

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
    resetEditorInstance();
  }
}
