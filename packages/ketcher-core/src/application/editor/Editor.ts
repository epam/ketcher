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
                "$ref": "monomer362"
            },
            {
                "$ref": "monomer363"
            },
            {
                "$ref": "monomer364"
            },
            {
                "$ref": "monomer365"
            },
            {
                "$ref": "monomer366"
            },
            {
                "$ref": "monomer367"
            },
            {
                "$ref": "monomer368"
            },
            {
                "$ref": "monomer369"
            },
            {
                "$ref": "monomer370"
            },
            {
                "$ref": "monomer371"
            },
            {
                "$ref": "monomer372"
            },
            {
                "$ref": "monomer373"
            },
            {
                "$ref": "monomer374"
            },
            {
                "$ref": "monomer375"
            },
            {
                "$ref": "monomer376"
            },
            {
                "$ref": "monomer377"
            },
            {
                "$ref": "monomer378"
            },
            {
                "$ref": "monomer379"
            },
            {
                "$ref": "monomer380"
            },
            {
                "$ref": "monomer381"
            },
            {
                "$ref": "monomer382"
            },
            {
                "$ref": "monomer383"
            },
            {
                "$ref": "monomer384"
            },
            {
                "$ref": "monomer385"
            },
            {
                "$ref": "monomer386"
            },
            {
                "$ref": "monomer387"
            },
            {
                "$ref": "monomer388"
            },
            {
                "$ref": "monomer389"
            },
            {
                "$ref": "monomer390"
            },
            {
                "$ref": "monomer391"
            },
            {
                "$ref": "monomer392"
            },
            {
                "$ref": "monomer393"
            },
            {
                "$ref": "monomer394"
            },
            {
                "$ref": "monomer395"
            },
            {
                "$ref": "monomer396"
            },
            {
                "$ref": "monomer397"
            },
            {
                "$ref": "monomer398"
            },
            {
                "$ref": "monomer399"
            },
            {
                "$ref": "monomer400"
            },
            {
                "$ref": "monomer401"
            },
            {
                "$ref": "monomer402"
            },
            {
                "$ref": "monomer403"
            },
            {
                "$ref": "monomer404"
            },
            {
                "$ref": "monomer405"
            },
            {
                "$ref": "monomer406"
            },
            {
                "$ref": "monomer407"
            },
            {
                "$ref": "monomer408"
            },
            {
                "$ref": "monomer409"
            },
            {
                "$ref": "monomer410"
            },
            {
                "$ref": "monomer411"
            },
            {
                "$ref": "monomer412"
            },
            {
                "$ref": "monomer413"
            },
            {
                "$ref": "monomer414"
            },
            {
                "$ref": "monomer415"
            },
            {
                "$ref": "monomer416"
            },
            {
                "$ref": "monomer417"
            },
            {
                "$ref": "monomer418"
            },
            {
                "$ref": "monomer419"
            },
            {
                "$ref": "monomer420"
            },
            {
                "$ref": "monomer421"
            },
            {
                "$ref": "monomer422"
            },
            {
                "$ref": "monomer423"
            },
            {
                "$ref": "monomer424"
            },
            {
                "$ref": "monomer425"
            },
            {
                "$ref": "monomer426"
            },
            {
                "$ref": "monomer427"
            },
            {
                "$ref": "monomer428"
            },
            {
                "$ref": "monomer429"
            },
            {
                "$ref": "monomer430"
            },
            {
                "$ref": "monomer431"
            },
            {
                "$ref": "monomer432"
            },
            {
                "$ref": "monomer433"
            },
            {
                "$ref": "monomer434"
            },
            {
                "$ref": "monomer435"
            },
            {
                "$ref": "monomer436"
            },
            {
                "$ref": "monomer437"
            },
            {
                "$ref": "monomer438"
            },
            {
                "$ref": "monomer439"
            },
            {
                "$ref": "monomer440"
            },
            {
                "$ref": "monomer441"
            },
            {
                "$ref": "monomer442"
            },
            {
                "$ref": "monomer443"
            },
            {
                "$ref": "monomer444"
            },
            {
                "$ref": "monomer445"
            },
            {
                "$ref": "monomer446"
            },
            {
                "$ref": "monomer447"
            },
            {
                "$ref": "monomer448"
            },
            {
                "$ref": "monomer449"
            },
            {
                "$ref": "monomer450"
            },
            {
                "$ref": "monomer451"
            },
            {
                "$ref": "monomer452"
            },
            {
                "$ref": "monomer453"
            },
            {
                "$ref": "monomer454"
            },
            {
                "$ref": "monomer455"
            },
            {
                "$ref": "monomer456"
            },
            {
                "$ref": "monomer457"
            },
            {
                "$ref": "monomer458"
            },
            {
                "$ref": "monomer459"
            },
            {
                "$ref": "monomer460"
            },
            {
                "$ref": "monomer461"
            },
            {
                "$ref": "monomer462"
            },
            {
                "$ref": "monomer463"
            },
            {
                "$ref": "monomer464"
            },
            {
                "$ref": "monomer465"
            },
            {
                "$ref": "monomer466"
            },
            {
                "$ref": "monomer467"
            },
            {
                "$ref": "monomer468"
            },
            {
                "$ref": "monomer469"
            },
            {
                "$ref": "monomer470"
            },
            {
                "$ref": "monomer471"
            },
            {
                "$ref": "monomer472"
            },
            {
                "$ref": "monomer473"
            },
            {
                "$ref": "monomer474"
            },
            {
                "$ref": "monomer475"
            },
            {
                "$ref": "monomer476"
            },
            {
                "$ref": "monomer477"
            },
            {
                "$ref": "monomer478"
            },
            {
                "$ref": "monomer479"
            },
            {
                "$ref": "monomer480"
            },
            {
                "$ref": "monomer481"
            },
            {
                "$ref": "monomer482"
            },
            {
                "$ref": "monomer483"
            },
            {
                "$ref": "monomer484"
            },
            {
                "$ref": "monomer485"
            },
            {
                "$ref": "monomer486"
            },
            {
                "$ref": "monomer487"
            },
            {
                "$ref": "monomer488"
            },
            {
                "$ref": "monomer489"
            },
            {
                "$ref": "monomer490"
            },
            {
                "$ref": "monomer491"
            },
            {
                "$ref": "monomer492"
            },
            {
                "$ref": "monomer493"
            },
            {
                "$ref": "monomer494"
            },
            {
                "$ref": "monomer495"
            },
            {
                "$ref": "monomer496"
            },
            {
                "$ref": "monomer497"
            },
            {
                "$ref": "monomer498"
            },
            {
                "$ref": "monomer499"
            },
            {
                "$ref": "monomer500"
            },
            {
                "$ref": "monomer501"
            },
            {
                "$ref": "monomer502"
            },
            {
                "$ref": "monomer503"
            },
            {
                "$ref": "monomer504"
            },
            {
                "$ref": "monomer505"
            },
            {
                "$ref": "monomer506"
            },
            {
                "$ref": "monomer507"
            },
            {
                "$ref": "monomer508"
            },
            {
                "$ref": "monomer509"
            },
            {
                "$ref": "monomer510"
            },
            {
                "$ref": "monomer511"
            },
            {
                "$ref": "monomer512"
            },
            {
                "$ref": "monomer513"
            },
            {
                "$ref": "monomer514"
            },
            {
                "$ref": "monomer515"
            },
            {
                "$ref": "monomer516"
            },
            {
                "$ref": "monomer517"
            },
            {
                "$ref": "monomer518"
            },
            {
                "$ref": "monomer519"
            },
            {
                "$ref": "monomer520"
            },
            {
                "$ref": "monomer521"
            },
            {
                "$ref": "monomer522"
            },
            {
                "$ref": "monomer523"
            },
            {
                "$ref": "monomer524"
            },
            {
                "$ref": "monomer525"
            },
            {
                "$ref": "monomer526"
            },
            {
                "$ref": "monomer527"
            },
            {
                "$ref": "monomer528"
            },
            {
                "$ref": "monomer529"
            },
            {
                "$ref": "monomer530"
            },
            {
                "$ref": "monomer531"
            },
            {
                "$ref": "monomer532"
            },
            {
                "$ref": "monomer533"
            },
            {
                "$ref": "monomer534"
            },
            {
                "$ref": "monomer535"
            },
            {
                "$ref": "monomer536"
            },
            {
                "$ref": "monomer537"
            },
            {
                "$ref": "monomer538"
            },
            {
                "$ref": "monomer539"
            },
            {
                "$ref": "monomer540"
            },
            {
                "$ref": "monomer541"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer362",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer363",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer363",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer364",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer364",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer365",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer365",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer366",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer366",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer367",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer367",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer368",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer368",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer369",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer369",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer370",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer370",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer371",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer371",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer372",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer372",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer373",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer373",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer374",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer374",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer375",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer375",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer376",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer376",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer377",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer377",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer378",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer378",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer379",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer379",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer380",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer380",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer381",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer381",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer382",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer382",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer383",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer383",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer384",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer384",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer385",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer385",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer386",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer386",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer387",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer387",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer388",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer388",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer389",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer389",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer390",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer390",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer391",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer391",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer392",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer392",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer393",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer393",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer394",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer394",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer395",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer395",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer396",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer396",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer397",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer397",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer398",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer398",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer399",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer399",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer400",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer400",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer401",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer401",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer402",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer402",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer403",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer403",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer404",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer404",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer405",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer405",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer406",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer406",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer407",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer407",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer408",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer408",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer409",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer409",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer410",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer410",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer411",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer411",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer412",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer412",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer413",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer413",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer414",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer414",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer415",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer415",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer416",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer416",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer417",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer417",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer418",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer419",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer420",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer420",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer421",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer418",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer422",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer422",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer423",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer423",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer424",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer424",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer425",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer425",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer426",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer426",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer427",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer427",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer428",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer428",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer429",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer429",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer430",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer430",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer431",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer431",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer432",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer432",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer433",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer433",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer434",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer434",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer435",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer435",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer436",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer436",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer437",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer437",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer438",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer438",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer439",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer439",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer440",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer440",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer441",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer441",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer442",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer442",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer443",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer443",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer444",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer444",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer445",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer445",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer446",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer446",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer447",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer447",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer448",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer448",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer449",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer449",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer450",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer450",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer451",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer451",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer452",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer452",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer453",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer453",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer454",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer454",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer455",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer455",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer456",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer456",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer457",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer457",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer458",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer458",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer459",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer459",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer460",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer460",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer461",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer461",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer462",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer462",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer463",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer463",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer464",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer464",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer465",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer465",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer466",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer466",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer467",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer467",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer468",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer468",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer469",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer469",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer470",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer470",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer471",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer471",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer472",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer472",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer473",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer473",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer474",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer474",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer475",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer475",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer476",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer476",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer477",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer477",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer478",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer478",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer479",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer479",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer480",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer480",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer481",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer481",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer482",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer482",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer483",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer483",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer484",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer484",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer485",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer485",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer486",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer486",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer487",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer487",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer488",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer488",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer489",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer489",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer490",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer490",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer491",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer491",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer492",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer492",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer493",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer493",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer494",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer494",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer495",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer495",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer496",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer496",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer497",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer497",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer498",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer498",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer499",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer499",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer500",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer500",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer501",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer501",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer502",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer502",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer503",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer503",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer504",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer504",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer505",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer505",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer506",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer506",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer507",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer507",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer508",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer508",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer509",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer509",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer510",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer510",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer511",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer511",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer512",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer512",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer513",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer513",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer514",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer514",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer515",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer515",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer516",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer516",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer517",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer517",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer518",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer518",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer519",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer519",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer520",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer520",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer521",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer521",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer522",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer522",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer523",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer523",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer524",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer524",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer525",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer525",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer526",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer526",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer527",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer527",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer528",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer528",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer529",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer529",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer530",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer530",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer531",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer531",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer532",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer532",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer533",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer533",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer534",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer534",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer535",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer535",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer536",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer536",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer537",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer537",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer538",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer538",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer539",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer539",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer540",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer540",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer541",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer541",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer419",
                    "attachmentPointId": "R1"
                }
            }
        ],
        "templates": [
            {
                "$ref": "monomerTemplate-C___Cysteine"
            }
        ]
    },
    "monomer362": {
        "type": "monomer",
        "id": "362",
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
    "monomer363": {
        "type": "monomer",
        "id": "363",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer364": {
        "type": "monomer",
        "id": "364",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer365": {
        "type": "monomer",
        "id": "365",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer366": {
        "type": "monomer",
        "id": "366",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer367": {
        "type": "monomer",
        "id": "367",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer368": {
        "type": "monomer",
        "id": "368",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer369": {
        "type": "monomer",
        "id": "369",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer370": {
        "type": "monomer",
        "id": "370",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer371": {
        "type": "monomer",
        "id": "371",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer372": {
        "type": "monomer",
        "id": "372",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer373": {
        "type": "monomer",
        "id": "373",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer374": {
        "type": "monomer",
        "id": "374",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer375": {
        "type": "monomer",
        "id": "375",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer376": {
        "type": "monomer",
        "id": "376",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer377": {
        "type": "monomer",
        "id": "377",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer378": {
        "type": "monomer",
        "id": "378",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer379": {
        "type": "monomer",
        "id": "379",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer380": {
        "type": "monomer",
        "id": "380",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer381": {
        "type": "monomer",
        "id": "381",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer382": {
        "type": "monomer",
        "id": "382",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer383": {
        "type": "monomer",
        "id": "383",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer384": {
        "type": "monomer",
        "id": "384",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer385": {
        "type": "monomer",
        "id": "385",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer386": {
        "type": "monomer",
        "id": "386",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer387": {
        "type": "monomer",
        "id": "387",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer388": {
        "type": "monomer",
        "id": "388",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer389": {
        "type": "monomer",
        "id": "389",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer390": {
        "type": "monomer",
        "id": "390",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer391": {
        "type": "monomer",
        "id": "391",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer392": {
        "type": "monomer",
        "id": "392",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer393": {
        "type": "monomer",
        "id": "393",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer394": {
        "type": "monomer",
        "id": "394",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer395": {
        "type": "monomer",
        "id": "395",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer396": {
        "type": "monomer",
        "id": "396",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer397": {
        "type": "monomer",
        "id": "397",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer398": {
        "type": "monomer",
        "id": "398",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer399": {
        "type": "monomer",
        "id": "399",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer400": {
        "type": "monomer",
        "id": "400",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer401": {
        "type": "monomer",
        "id": "401",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer402": {
        "type": "monomer",
        "id": "402",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer403": {
        "type": "monomer",
        "id": "403",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer404": {
        "type": "monomer",
        "id": "404",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer405": {
        "type": "monomer",
        "id": "405",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer406": {
        "type": "monomer",
        "id": "406",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer407": {
        "type": "monomer",
        "id": "407",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer408": {
        "type": "monomer",
        "id": "408",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer409": {
        "type": "monomer",
        "id": "409",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer410": {
        "type": "monomer",
        "id": "410",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer411": {
        "type": "monomer",
        "id": "411",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer412": {
        "type": "monomer",
        "id": "412",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer413": {
        "type": "monomer",
        "id": "413",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer414": {
        "type": "monomer",
        "id": "414",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer415": {
        "type": "monomer",
        "id": "415",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer416": {
        "type": "monomer",
        "id": "416",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer417": {
        "type": "monomer",
        "id": "417",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer418": {
        "type": "monomer",
        "id": "418",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer419": {
        "type": "monomer",
        "id": "419",
        "position": {
            "x": 23.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer420": {
        "type": "monomer",
        "id": "420",
        "position": {
            "x": 25.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer421": {
        "type": "monomer",
        "id": "421",
        "position": {
            "x": 26.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer422": {
        "type": "monomer",
        "id": "422",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer423": {
        "type": "monomer",
        "id": "423",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer424": {
        "type": "monomer",
        "id": "424",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer425": {
        "type": "monomer",
        "id": "425",
        "position": {
            "x": 10.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer426": {
        "type": "monomer",
        "id": "426",
        "position": {
            "x": 11.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer427": {
        "type": "monomer",
        "id": "427",
        "position": {
            "x": 13.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer428": {
        "type": "monomer",
        "id": "428",
        "position": {
            "x": 14.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer429": {
        "type": "monomer",
        "id": "429",
        "position": {
            "x": 16.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer430": {
        "type": "monomer",
        "id": "430",
        "position": {
            "x": 17.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer431": {
        "type": "monomer",
        "id": "431",
        "position": {
            "x": 19.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer432": {
        "type": "monomer",
        "id": "432",
        "position": {
            "x": 20.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer433": {
        "type": "monomer",
        "id": "433",
        "position": {
            "x": 22.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer434": {
        "type": "monomer",
        "id": "434",
        "position": {
            "x": 23.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer435": {
        "type": "monomer",
        "id": "435",
        "position": {
            "x": 25.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer436": {
        "type": "monomer",
        "id": "436",
        "position": {
            "x": 26.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer437": {
        "type": "monomer",
        "id": "437",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer438": {
        "type": "monomer",
        "id": "438",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer439": {
        "type": "monomer",
        "id": "439",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer440": {
        "type": "monomer",
        "id": "440",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer441": {
        "type": "monomer",
        "id": "441",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer442": {
        "type": "monomer",
        "id": "442",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer443": {
        "type": "monomer",
        "id": "443",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer444": {
        "type": "monomer",
        "id": "444",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer445": {
        "type": "monomer",
        "id": "445",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer446": {
        "type": "monomer",
        "id": "446",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer447": {
        "type": "monomer",
        "id": "447",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer448": {
        "type": "monomer",
        "id": "448",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer449": {
        "type": "monomer",
        "id": "449",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer450": {
        "type": "monomer",
        "id": "450",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer451": {
        "type": "monomer",
        "id": "451",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer452": {
        "type": "monomer",
        "id": "452",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer453": {
        "type": "monomer",
        "id": "453",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer454": {
        "type": "monomer",
        "id": "454",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer455": {
        "type": "monomer",
        "id": "455",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer456": {
        "type": "monomer",
        "id": "456",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer457": {
        "type": "monomer",
        "id": "457",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer458": {
        "type": "monomer",
        "id": "458",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer459": {
        "type": "monomer",
        "id": "459",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer460": {
        "type": "monomer",
        "id": "460",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer461": {
        "type": "monomer",
        "id": "461",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer462": {
        "type": "monomer",
        "id": "462",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer463": {
        "type": "monomer",
        "id": "463",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer464": {
        "type": "monomer",
        "id": "464",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer465": {
        "type": "monomer",
        "id": "465",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer466": {
        "type": "monomer",
        "id": "466",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer467": {
        "type": "monomer",
        "id": "467",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer468": {
        "type": "monomer",
        "id": "468",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer469": {
        "type": "monomer",
        "id": "469",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer470": {
        "type": "monomer",
        "id": "470",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer471": {
        "type": "monomer",
        "id": "471",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer472": {
        "type": "monomer",
        "id": "472",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer473": {
        "type": "monomer",
        "id": "473",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer474": {
        "type": "monomer",
        "id": "474",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer475": {
        "type": "monomer",
        "id": "475",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer476": {
        "type": "monomer",
        "id": "476",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer477": {
        "type": "monomer",
        "id": "477",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer478": {
        "type": "monomer",
        "id": "478",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer479": {
        "type": "monomer",
        "id": "479",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer480": {
        "type": "monomer",
        "id": "480",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer481": {
        "type": "monomer",
        "id": "481",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer482": {
        "type": "monomer",
        "id": "482",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer483": {
        "type": "monomer",
        "id": "483",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer484": {
        "type": "monomer",
        "id": "484",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer485": {
        "type": "monomer",
        "id": "485",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer486": {
        "type": "monomer",
        "id": "486",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer487": {
        "type": "monomer",
        "id": "487",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer488": {
        "type": "monomer",
        "id": "488",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer489": {
        "type": "monomer",
        "id": "489",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer490": {
        "type": "monomer",
        "id": "490",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer491": {
        "type": "monomer",
        "id": "491",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer492": {
        "type": "monomer",
        "id": "492",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer493": {
        "type": "monomer",
        "id": "493",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer494": {
        "type": "monomer",
        "id": "494",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer495": {
        "type": "monomer",
        "id": "495",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer496": {
        "type": "monomer",
        "id": "496",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer497": {
        "type": "monomer",
        "id": "497",
        "position": {
            "x": 10.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer498": {
        "type": "monomer",
        "id": "498",
        "position": {
            "x": 11.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer499": {
        "type": "monomer",
        "id": "499",
        "position": {
            "x": 13.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer500": {
        "type": "monomer",
        "id": "500",
        "position": {
            "x": 14.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer501": {
        "type": "monomer",
        "id": "501",
        "position": {
            "x": 16.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer502": {
        "type": "monomer",
        "id": "502",
        "position": {
            "x": 17.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer503": {
        "type": "monomer",
        "id": "503",
        "position": {
            "x": 19.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer504": {
        "type": "monomer",
        "id": "504",
        "position": {
            "x": 20.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer505": {
        "type": "monomer",
        "id": "505",
        "position": {
            "x": 22.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer506": {
        "type": "monomer",
        "id": "506",
        "position": {
            "x": 23.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer507": {
        "type": "monomer",
        "id": "507",
        "position": {
            "x": 25.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer508": {
        "type": "monomer",
        "id": "508",
        "position": {
            "x": 26.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer509": {
        "type": "monomer",
        "id": "509",
        "position": {
            "x": 1.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer510": {
        "type": "monomer",
        "id": "510",
        "position": {
            "x": 2.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer511": {
        "type": "monomer",
        "id": "511",
        "position": {
            "x": 4.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer512": {
        "type": "monomer",
        "id": "512",
        "position": {
            "x": 5.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer513": {
        "type": "monomer",
        "id": "513",
        "position": {
            "x": 7.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer514": {
        "type": "monomer",
        "id": "514",
        "position": {
            "x": 8.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer515": {
        "type": "monomer",
        "id": "515",
        "position": {
            "x": 10.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer516": {
        "type": "monomer",
        "id": "516",
        "position": {
            "x": 11.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer517": {
        "type": "monomer",
        "id": "517",
        "position": {
            "x": 13.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer518": {
        "type": "monomer",
        "id": "518",
        "position": {
            "x": 14.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer519": {
        "type": "monomer",
        "id": "519",
        "position": {
            "x": 16.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer520": {
        "type": "monomer",
        "id": "520",
        "position": {
            "x": 17.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer521": {
        "type": "monomer",
        "id": "521",
        "position": {
            "x": 19.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer522": {
        "type": "monomer",
        "id": "522",
        "position": {
            "x": 20.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer523": {
        "type": "monomer",
        "id": "523",
        "position": {
            "x": 22.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer524": {
        "type": "monomer",
        "id": "524",
        "position": {
            "x": 23.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer525": {
        "type": "monomer",
        "id": "525",
        "position": {
            "x": 25.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer526": {
        "type": "monomer",
        "id": "526",
        "position": {
            "x": 26.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer527": {
        "type": "monomer",
        "id": "527",
        "position": {
            "x": 1.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer528": {
        "type": "monomer",
        "id": "528",
        "position": {
            "x": 2.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer529": {
        "type": "monomer",
        "id": "529",
        "position": {
            "x": 4.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer530": {
        "type": "monomer",
        "id": "530",
        "position": {
            "x": 5.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer531": {
        "type": "monomer",
        "id": "531",
        "position": {
            "x": 7.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer532": {
        "type": "monomer",
        "id": "532",
        "position": {
            "x": 8.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer533": {
        "type": "monomer",
        "id": "533",
        "position": {
            "x": 10.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer534": {
        "type": "monomer",
        "id": "534",
        "position": {
            "x": 11.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer535": {
        "type": "monomer",
        "id": "535",
        "position": {
            "x": 13.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer536": {
        "type": "monomer",
        "id": "536",
        "position": {
            "x": 14.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer537": {
        "type": "monomer",
        "id": "537",
        "position": {
            "x": 16.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer538": {
        "type": "monomer",
        "id": "538",
        "position": {
            "x": 17.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer539": {
        "type": "monomer",
        "id": "539",
        "position": {
            "x": 19.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer540": {
        "type": "monomer",
        "id": "540",
        "position": {
            "x": 20.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer541": {
        "type": "monomer",
        "id": "541",
        "position": {
            "x": 22.25,
            "y": -14.8625
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
