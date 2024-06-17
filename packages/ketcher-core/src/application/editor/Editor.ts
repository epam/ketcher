import { DOMSubscription } from 'subscription';
import { SequenceType, Struct, Vec2 } from 'domain/entities';
import {
  BaseTool,
  IRnaPreset,
  LabeledNodesWithPositionInSequence,
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
  private _monomersLibraryParsedJson?: IKetMacromoleculesContent;
  private _monomersLibrary: MonomerItemType[] = [];
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
  private copyEventHandler: (event: ClipboardEvent) => void = () => {};
  private pasteEventHandler: (event: ClipboardEvent) => void = () => {};
  private keydownEventHandler: (event: KeyboardEvent) => void = () => {};

  constructor({ theme, canvas }: ICoreEditorConstructorParams) {
    this.theme = theme;
    this.canvas = canvas;
    resetEditorEvents();
    this.events = editorEvents;
    this.setMonomersLibrary(monomersDataRaw);
    this._monomersLibraryParsedJson = JSON.parse(monomersDataRaw);
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

    ketcher.setMolecule(`{
    "root": {
        "nodes": [
            {
                "$ref": "monomer241"
            },
            {
                "$ref": "monomer242"
            },
            {
                "$ref": "monomer243"
            },
            {
                "$ref": "monomer244"
            },
            {
                "$ref": "monomer245"
            },
            {
                "$ref": "monomer246"
            },
            {
                "$ref": "monomer247"
            },
            {
                "$ref": "monomer248"
            },
            {
                "$ref": "monomer249"
            },
            {
                "$ref": "monomer250"
            },
            {
                "$ref": "monomer251"
            },
            {
                "$ref": "monomer252"
            },
            {
                "$ref": "monomer253"
            },
            {
                "$ref": "monomer254"
            },
            {
                "$ref": "monomer255"
            },
            {
                "$ref": "monomer256"
            },
            {
                "$ref": "monomer257"
            },
            {
                "$ref": "monomer258"
            },
            {
                "$ref": "monomer259"
            },
            {
                "$ref": "monomer260"
            },
            {
                "$ref": "monomer261"
            },
            {
                "$ref": "monomer262"
            },
            {
                "$ref": "monomer263"
            },
            {
                "$ref": "monomer264"
            },
            {
                "$ref": "monomer265"
            },
            {
                "$ref": "monomer266"
            },
            {
                "$ref": "monomer267"
            },
            {
                "$ref": "monomer268"
            },
            {
                "$ref": "monomer269"
            },
            {
                "$ref": "monomer270"
            },
            {
                "$ref": "monomer271"
            },
            {
                "$ref": "monomer272"
            },
            {
                "$ref": "monomer273"
            },
            {
                "$ref": "monomer274"
            },
            {
                "$ref": "monomer275"
            },
            {
                "$ref": "monomer276"
            },
            {
                "$ref": "monomer277"
            },
            {
                "$ref": "monomer278"
            },
            {
                "$ref": "monomer279"
            },
            {
                "$ref": "monomer280"
            },
            {
                "$ref": "monomer281"
            },
            {
                "$ref": "monomer282"
            },
            {
                "$ref": "monomer283"
            },
            {
                "$ref": "monomer284"
            },
            {
                "$ref": "monomer285"
            },
            {
                "$ref": "monomer286"
            },
            {
                "$ref": "monomer287"
            },
            {
                "$ref": "monomer288"
            },
            {
                "$ref": "monomer289"
            },
            {
                "$ref": "monomer290"
            },
            {
                "$ref": "monomer291"
            },
            {
                "$ref": "monomer292"
            },
            {
                "$ref": "monomer293"
            },
            {
                "$ref": "monomer294"
            },
            {
                "$ref": "monomer295"
            },
            {
                "$ref": "monomer296"
            },
            {
                "$ref": "monomer297"
            },
            {
                "$ref": "monomer298"
            },
            {
                "$ref": "monomer299"
            },
            {
                "$ref": "monomer300"
            },
            {
                "$ref": "monomer301"
            },
            {
                "$ref": "monomer302"
            },
            {
                "$ref": "monomer303"
            },
            {
                "$ref": "monomer304"
            },
            {
                "$ref": "monomer305"
            },
            {
                "$ref": "monomer306"
            },
            {
                "$ref": "monomer307"
            },
            {
                "$ref": "monomer308"
            },
            {
                "$ref": "monomer309"
            },
            {
                "$ref": "monomer310"
            },
            {
                "$ref": "monomer311"
            },
            {
                "$ref": "monomer312"
            },
            {
                "$ref": "monomer313"
            },
            {
                "$ref": "monomer314"
            },
            {
                "$ref": "monomer315"
            },
            {
                "$ref": "monomer316"
            },
            {
                "$ref": "monomer317"
            },
            {
                "$ref": "monomer318"
            },
            {
                "$ref": "monomer319"
            },
            {
                "$ref": "monomer320"
            },
            {
                "$ref": "monomer321"
            },
            {
                "$ref": "monomer322"
            },
            {
                "$ref": "monomer323"
            },
            {
                "$ref": "monomer324"
            },
            {
                "$ref": "monomer325"
            },
            {
                "$ref": "monomer326"
            },
            {
                "$ref": "monomer327"
            },
            {
                "$ref": "monomer328"
            },
            {
                "$ref": "monomer329"
            },
            {
                "$ref": "monomer330"
            },
            {
                "$ref": "monomer331"
            },
            {
                "$ref": "monomer332"
            },
            {
                "$ref": "monomer333"
            },
            {
                "$ref": "monomer334"
            },
            {
                "$ref": "monomer335"
            },
            {
                "$ref": "monomer336"
            },
            {
                "$ref": "monomer337"
            },
            {
                "$ref": "monomer338"
            },
            {
                "$ref": "monomer339"
            },
            {
                "$ref": "monomer340"
            },
            {
                "$ref": "monomer341"
            },
            {
                "$ref": "monomer342"
            },
            {
                "$ref": "monomer343"
            },
            {
                "$ref": "monomer344"
            },
            {
                "$ref": "monomer345"
            },
            {
                "$ref": "monomer346"
            },
            {
                "$ref": "monomer347"
            },
            {
                "$ref": "monomer348"
            },
            {
                "$ref": "monomer349"
            },
            {
                "$ref": "monomer350"
            },
            {
                "$ref": "monomer351"
            },
            {
                "$ref": "monomer352"
            },
            {
                "$ref": "monomer353"
            },
            {
                "$ref": "monomer354"
            },
            {
                "$ref": "monomer355"
            },
            {
                "$ref": "monomer356"
            },
            {
                "$ref": "monomer357"
            },
            {
                "$ref": "monomer358"
            },
            {
                "$ref": "monomer359"
            },
            {
                "$ref": "monomer360"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer241",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer242",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer242",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer243",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer243",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer244",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer244",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer245",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer245",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer246",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer246",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer247",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer247",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer248",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer248",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer249",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer249",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer250",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer250",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer251",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer251",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer252",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer252",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer253",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer253",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer254",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer254",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer255",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer255",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer256",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer256",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer257",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer257",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer258",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer258",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer259",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer259",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer260",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer260",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer261",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer261",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer262",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer262",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer263",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer263",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer264",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer264",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer265",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer265",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer266",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer266",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer267",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer267",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer268",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer268",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer269",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer269",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer270",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer270",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer271",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer271",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer272",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer272",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer273",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer273",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer274",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer274",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer275",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer275",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer276",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer276",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer277",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer277",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer278",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer278",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer279",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer279",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer280",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer280",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer281",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer281",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer282",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer282",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer283",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer283",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer284",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer284",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer285",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer285",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer286",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer286",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer287",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer287",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer288",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer288",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer289",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer289",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer290",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer290",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer291",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer291",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer292",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer292",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer293",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer293",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer294",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer294",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer295",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer295",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer296",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer296",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer297",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer297",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer298",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer298",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer299",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer299",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer300",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer301",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer302",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer302",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer303",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer303",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer304",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer304",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer305",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer305",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer306",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer306",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer307",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer307",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer308",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer308",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer309",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer309",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer310",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer310",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer311",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer311",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer312",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer312",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer313",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer313",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer314",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer314",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer315",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer315",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer316",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer316",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer317",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer317",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer318",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer318",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer319",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer319",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer320",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer320",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer321",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer321",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer322",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer322",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer323",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer323",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer324",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer324",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer325",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer325",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer326",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer326",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer327",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer327",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer328",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer328",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer329",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer329",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer330",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer330",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer331",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer331",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer332",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer332",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer333",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer333",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer334",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer334",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer335",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer335",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer336",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer336",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer337",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer337",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer338",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer338",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer339",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer339",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer340",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer340",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer341",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer341",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer342",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer342",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer343",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer343",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer344",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer344",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer345",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer345",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer346",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer346",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer347",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer347",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer348",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer348",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer349",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer349",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer350",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer350",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer351",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer351",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer352",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer352",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer353",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer353",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer354",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer354",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer355",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer355",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer356",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer356",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer357",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer357",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer358",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer358",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer359",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer359",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer360",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer268",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer307",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer266",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer323",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer252",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer292",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer245",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer278",
                    "attachmentPointId": "R3"
                }
            }
        ],
        "templates": [
            {
                "$ref": "monomerTemplate-C___Cysteine"
            }
        ]
    },
    "monomer241": {
        "type": "monomer",
        "id": "241",
        "position": {
            "x": 1.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomerTemplate-C___Cysteine": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "C",
                "location": [
                    1.0705703835030829,
                    -0.8392318016352244,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    0.10759761826312372,
                    -0.28435984454948043,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    0.10589442127754087,
                    0.8270132145647389,
                    0
                ]
            },
            {
                "label": "S",
                "location": [
                    -0.8570042919195668,
                    1.381885171650483,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -0.8553751469768355,
                    -0.8392318016352244,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    1.0719033202744086,
                    -1.7278563158523506,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    1.8396008485151543,
                    -0.3939568679695927,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -1.6248499242460153,
                    -0.39477144044095835,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -0.8583372286908926,
                    2.270509685867609,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    5,
                    0
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    1
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    6
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    2
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    2,
                    3
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    8
                ]
            }
        ],
        "class": "AminoAcid",
        "classHELM": "PEPTIDE",
        "id": "C___Cysteine",
        "fullName": "Cysteine",
        "alias": "C",
        "attachmentPoints": [
            {
                "attachmentAtom": 4,
                "leavingGroup": {
                    "atoms": [
                        7
                    ]
                },
                "type": "left"
            },
            {
                "attachmentAtom": 0,
                "leavingGroup": {
                    "atoms": [
                        6
                    ]
                },
                "type": "right"
            },
            {
                "attachmentAtom": 3,
                "leavingGroup": {
                    "atoms": [
                        8
                    ]
                },
                "type": "side"
            }
        ],
        "naturalAnalogShort": "C"
    },
    "monomer242": {
        "type": "monomer",
        "id": "242",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer243": {
        "type": "monomer",
        "id": "243",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer244": {
        "type": "monomer",
        "id": "244",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer245": {
        "type": "monomer",
        "id": "245",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer246": {
        "type": "monomer",
        "id": "246",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer247": {
        "type": "monomer",
        "id": "247",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer248": {
        "type": "monomer",
        "id": "248",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer249": {
        "type": "monomer",
        "id": "249",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer250": {
        "type": "monomer",
        "id": "250",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer251": {
        "type": "monomer",
        "id": "251",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer252": {
        "type": "monomer",
        "id": "252",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer253": {
        "type": "monomer",
        "id": "253",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer254": {
        "type": "monomer",
        "id": "254",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer255": {
        "type": "monomer",
        "id": "255",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer256": {
        "type": "monomer",
        "id": "256",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer257": {
        "type": "monomer",
        "id": "257",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer258": {
        "type": "monomer",
        "id": "258",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer259": {
        "type": "monomer",
        "id": "259",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer260": {
        "type": "monomer",
        "id": "260",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer261": {
        "type": "monomer",
        "id": "261",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer262": {
        "type": "monomer",
        "id": "262",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer263": {
        "type": "monomer",
        "id": "263",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer264": {
        "type": "monomer",
        "id": "264",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer265": {
        "type": "monomer",
        "id": "265",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer266": {
        "type": "monomer",
        "id": "266",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer267": {
        "type": "monomer",
        "id": "267",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer268": {
        "type": "monomer",
        "id": "268",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer269": {
        "type": "monomer",
        "id": "269",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer270": {
        "type": "monomer",
        "id": "270",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer271": {
        "type": "monomer",
        "id": "271",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer272": {
        "type": "monomer",
        "id": "272",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer273": {
        "type": "monomer",
        "id": "273",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer274": {
        "type": "monomer",
        "id": "274",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer275": {
        "type": "monomer",
        "id": "275",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer276": {
        "type": "monomer",
        "id": "276",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer277": {
        "type": "monomer",
        "id": "277",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer278": {
        "type": "monomer",
        "id": "278",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer279": {
        "type": "monomer",
        "id": "279",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer280": {
        "type": "monomer",
        "id": "280",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer281": {
        "type": "monomer",
        "id": "281",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer282": {
        "type": "monomer",
        "id": "282",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer283": {
        "type": "monomer",
        "id": "283",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer284": {
        "type": "monomer",
        "id": "284",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer285": {
        "type": "monomer",
        "id": "285",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer286": {
        "type": "monomer",
        "id": "286",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer287": {
        "type": "monomer",
        "id": "287",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer288": {
        "type": "monomer",
        "id": "288",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer289": {
        "type": "monomer",
        "id": "289",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer290": {
        "type": "monomer",
        "id": "290",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer291": {
        "type": "monomer",
        "id": "291",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer292": {
        "type": "monomer",
        "id": "292",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer293": {
        "type": "monomer",
        "id": "293",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer294": {
        "type": "monomer",
        "id": "294",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer295": {
        "type": "monomer",
        "id": "295",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer296": {
        "type": "monomer",
        "id": "296",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer297": {
        "type": "monomer",
        "id": "297",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer298": {
        "type": "monomer",
        "id": "298",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer299": {
        "type": "monomer",
        "id": "299",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer300": {
        "type": "monomer",
        "id": "300",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer301": {
        "type": "monomer",
        "id": "301",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer302": {
        "type": "monomer",
        "id": "302",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer303": {
        "type": "monomer",
        "id": "303",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer304": {
        "type": "monomer",
        "id": "304",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer305": {
        "type": "monomer",
        "id": "305",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer306": {
        "type": "monomer",
        "id": "306",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer307": {
        "type": "monomer",
        "id": "307",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer308": {
        "type": "monomer",
        "id": "308",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer309": {
        "type": "monomer",
        "id": "309",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer310": {
        "type": "monomer",
        "id": "310",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer311": {
        "type": "monomer",
        "id": "311",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer312": {
        "type": "monomer",
        "id": "312",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer313": {
        "type": "monomer",
        "id": "313",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer314": {
        "type": "monomer",
        "id": "314",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer315": {
        "type": "monomer",
        "id": "315",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer316": {
        "type": "monomer",
        "id": "316",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer317": {
        "type": "monomer",
        "id": "317",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer318": {
        "type": "monomer",
        "id": "318",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer319": {
        "type": "monomer",
        "id": "319",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer320": {
        "type": "monomer",
        "id": "320",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer321": {
        "type": "monomer",
        "id": "321",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer322": {
        "type": "monomer",
        "id": "322",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer323": {
        "type": "monomer",
        "id": "323",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer324": {
        "type": "monomer",
        "id": "324",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer325": {
        "type": "monomer",
        "id": "325",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer326": {
        "type": "monomer",
        "id": "326",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer327": {
        "type": "monomer",
        "id": "327",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer328": {
        "type": "monomer",
        "id": "328",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer329": {
        "type": "monomer",
        "id": "329",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer330": {
        "type": "monomer",
        "id": "330",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer331": {
        "type": "monomer",
        "id": "331",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer332": {
        "type": "monomer",
        "id": "332",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer333": {
        "type": "monomer",
        "id": "333",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer334": {
        "type": "monomer",
        "id": "334",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer335": {
        "type": "monomer",
        "id": "335",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer336": {
        "type": "monomer",
        "id": "336",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer337": {
        "type": "monomer",
        "id": "337",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer338": {
        "type": "monomer",
        "id": "338",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer339": {
        "type": "monomer",
        "id": "339",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer340": {
        "type": "monomer",
        "id": "340",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer341": {
        "type": "monomer",
        "id": "341",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer342": {
        "type": "monomer",
        "id": "342",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer343": {
        "type": "monomer",
        "id": "343",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer344": {
        "type": "monomer",
        "id": "344",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer345": {
        "type": "monomer",
        "id": "345",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer346": {
        "type": "monomer",
        "id": "346",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer347": {
        "type": "monomer",
        "id": "347",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer348": {
        "type": "monomer",
        "id": "348",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer349": {
        "type": "monomer",
        "id": "349",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer350": {
        "type": "monomer",
        "id": "350",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer351": {
        "type": "monomer",
        "id": "351",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer352": {
        "type": "monomer",
        "id": "352",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer353": {
        "type": "monomer",
        "id": "353",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer354": {
        "type": "monomer",
        "id": "354",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer355": {
        "type": "monomer",
        "id": "355",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer356": {
        "type": "monomer",
        "id": "356",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer357": {
        "type": "monomer",
        "id": "357",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer358": {
        "type": "monomer",
        "id": "358",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer359": {
        "type": "monomer",
        "id": "359",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer360": {
        "type": "monomer",
        "id": "360",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    }
}`);
    ketcher.setMode('snake');
  }

  static provideEditorInstance(): CoreEditor {
    return editor;
  }

  private setMonomersLibrary(monomersDataRaw: string) {
    const monomersLibraryParsedJson = JSON.parse(monomersDataRaw);
    this._monomersLibraryParsedJson = monomersLibraryParsedJson;
    const serializer = new KetSerializer();
    this._monomersLibrary = serializer.convertMonomersLibrary(
      monomersLibraryParsedJson,
    );
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
      (updatedSelection: LabeledNodesWithPositionInSequence[]) =>
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
    updatedSelection: LabeledNodesWithPositionInSequence[],
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
    this._monomersLibraryParsedJson = undefined;
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
