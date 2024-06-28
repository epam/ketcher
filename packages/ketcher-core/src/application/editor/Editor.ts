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
                "$ref": "monomer991"
            },
            {
                "$ref": "monomer992"
            },
            {
                "$ref": "monomer993"
            },
            {
                "$ref": "monomer994"
            },
            {
                "$ref": "monomer995"
            },
            {
                "$ref": "monomer996"
            },
            {
                "$ref": "monomer997"
            },
            {
                "$ref": "monomer998"
            },
            {
                "$ref": "monomer999"
            },
            {
                "$ref": "monomer1000"
            },
            {
                "$ref": "monomer1001"
            },
            {
                "$ref": "monomer1002"
            },
            {
                "$ref": "monomer1003"
            },
            {
                "$ref": "monomer1004"
            },
            {
                "$ref": "monomer1005"
            },
            {
                "$ref": "monomer1006"
            },
            {
                "$ref": "monomer1007"
            },
            {
                "$ref": "monomer1008"
            },
            {
                "$ref": "monomer1009"
            },
            {
                "$ref": "monomer1010"
            },
            {
                "$ref": "monomer1011"
            },
            {
                "$ref": "monomer1012"
            },
            {
                "$ref": "monomer1013"
            },
            {
                "$ref": "monomer1014"
            },
            {
                "$ref": "monomer1015"
            },
            {
                "$ref": "monomer1016"
            },
            {
                "$ref": "monomer1017"
            },
            {
                "$ref": "monomer1018"
            },
            {
                "$ref": "monomer1019"
            },
            {
                "$ref": "monomer1020"
            },
            {
                "$ref": "monomer1021"
            },
            {
                "$ref": "monomer1022"
            },
            {
                "$ref": "monomer1023"
            },
            {
                "$ref": "monomer1024"
            },
            {
                "$ref": "monomer1025"
            },
            {
                "$ref": "monomer1026"
            },
            {
                "$ref": "monomer1027"
            },
            {
                "$ref": "monomer1028"
            },
            {
                "$ref": "monomer1029"
            },
            {
                "$ref": "monomer1030"
            },
            {
                "$ref": "monomer1031"
            },
            {
                "$ref": "monomer1032"
            },
            {
                "$ref": "monomer1033"
            },
            {
                "$ref": "monomer1034"
            },
            {
                "$ref": "monomer1035"
            },
            {
                "$ref": "monomer1036"
            },
            {
                "$ref": "monomer1037"
            },
            {
                "$ref": "monomer1038"
            },
            {
                "$ref": "monomer1039"
            },
            {
                "$ref": "monomer1040"
            },
            {
                "$ref": "monomer1041"
            },
            {
                "$ref": "monomer1042"
            },
            {
                "$ref": "monomer1043"
            },
            {
                "$ref": "monomer1044"
            },
            {
                "$ref": "monomer1045"
            },
            {
                "$ref": "monomer1046"
            },
            {
                "$ref": "monomer1047"
            },
            {
                "$ref": "monomer1048"
            },
            {
                "$ref": "monomer1049"
            },
            {
                "$ref": "monomer1050"
            },
            {
                "$ref": "monomer1051"
            },
            {
                "$ref": "monomer1052"
            },
            {
                "$ref": "monomer1053"
            },
            {
                "$ref": "monomer1054"
            },
            {
                "$ref": "monomer1055"
            },
            {
                "$ref": "monomer1056"
            },
            {
                "$ref": "monomer1057"
            },
            {
                "$ref": "monomer1058"
            },
            {
                "$ref": "monomer1059"
            },
            {
                "$ref": "monomer1060"
            },
            {
                "$ref": "monomer1061"
            },
            {
                "$ref": "monomer1062"
            },
            {
                "$ref": "monomer1063"
            },
            {
                "$ref": "monomer1064"
            },
            {
                "$ref": "monomer1065"
            },
            {
                "$ref": "monomer1066"
            },
            {
                "$ref": "monomer1067"
            },
            {
                "$ref": "monomer1068"
            },
            {
                "$ref": "monomer1069"
            },
            {
                "$ref": "monomer1070"
            },
            {
                "$ref": "monomer1071"
            },
            {
                "$ref": "monomer1072"
            },
            {
                "$ref": "monomer1073"
            },
            {
                "$ref": "monomer1074"
            },
            {
                "$ref": "monomer1075"
            },
            {
                "$ref": "monomer1076"
            },
            {
                "$ref": "monomer1077"
            },
            {
                "$ref": "monomer1078"
            },
            {
                "$ref": "monomer1079"
            },
            {
                "$ref": "monomer1080"
            },
            {
                "$ref": "monomer1081"
            },
            {
                "$ref": "monomer1082"
            },
            {
                "$ref": "monomer1083"
            },
            {
                "$ref": "monomer1084"
            },
            {
                "$ref": "monomer1085"
            },
            {
                "$ref": "monomer1086"
            },
            {
                "$ref": "monomer1087"
            },
            {
                "$ref": "monomer1088"
            },
            {
                "$ref": "monomer1089"
            },
            {
                "$ref": "monomer1090"
            },
            {
                "$ref": "monomer1091"
            },
            {
                "$ref": "monomer1092"
            },
            {
                "$ref": "monomer1093"
            },
            {
                "$ref": "monomer1094"
            },
            {
                "$ref": "monomer1095"
            },
            {
                "$ref": "monomer1096"
            },
            {
                "$ref": "monomer1097"
            },
            {
                "$ref": "monomer1098"
            },
            {
                "$ref": "monomer1099"
            },
            {
                "$ref": "monomer1100"
            },
            {
                "$ref": "monomer1101"
            },
            {
                "$ref": "monomer1102"
            },
            {
                "$ref": "monomer1103"
            },
            {
                "$ref": "monomer1104"
            },
            {
                "$ref": "monomer1105"
            },
            {
                "$ref": "monomer1106"
            },
            {
                "$ref": "monomer1107"
            },
            {
                "$ref": "monomer1108"
            },
            {
                "$ref": "monomer1109"
            },
            {
                "$ref": "monomer1110"
            },
            {
                "$ref": "monomer1311"
            },
            {
                "$ref": "monomer1316"
            },
            {
                "$ref": "monomer1321"
            },
            {
                "$ref": "monomer1326"
            },
            {
                "$ref": "monomer1331"
            },
            {
                "$ref": "monomer1336"
            },
            {
                "$ref": "monomer1341"
            },
            {
                "$ref": "monomer1346"
            },
            {
                "$ref": "monomer1351"
            },
            {
                "$ref": "monomer1356"
            },
            {
                "$ref": "monomer1361"
            },
            {
                "$ref": "monomer1366"
            },
            {
                "$ref": "monomer1371"
            },
            {
                "$ref": "monomer1376"
            },
            {
                "$ref": "monomer1381"
            },
            {
                "$ref": "monomer1386"
            },
            {
                "$ref": "monomer1391"
            },
            {
                "$ref": "monomer1396"
            },
            {
                "$ref": "monomer1401"
            },
            {
                "$ref": "monomer1406"
            },
            {
                "$ref": "monomer1411"
            },
            {
                "$ref": "monomer1416"
            },
            {
                "$ref": "monomer1421"
            },
            {
                "$ref": "monomer1426"
            },
            {
                "$ref": "monomer1431"
            },
            {
                "$ref": "monomer1436"
            },
            {
                "$ref": "monomer1441"
            },
            {
                "$ref": "monomer1446"
            },
            {
                "$ref": "monomer1451"
            },
            {
                "$ref": "monomer1456"
            },
            {
                "$ref": "monomer1461"
            },
            {
                "$ref": "monomer1466"
            },
            {
                "$ref": "monomer1471"
            },
            {
                "$ref": "monomer1476"
            },
            {
                "$ref": "monomer1481"
            },
            {
                "$ref": "monomer1486"
            },
            {
                "$ref": "monomer1491"
            },
            {
                "$ref": "monomer1496"
            },
            {
                "$ref": "monomer1501"
            },
            {
                "$ref": "monomer1506"
            },
            {
                "$ref": "monomer1511"
            },
            {
                "$ref": "monomer1516"
            },
            {
                "$ref": "monomer1521"
            },
            {
                "$ref": "monomer1526"
            },
            {
                "$ref": "monomer1531"
            },
            {
                "$ref": "monomer1536"
            },
            {
                "$ref": "monomer1541"
            },
            {
                "$ref": "monomer1546"
            },
            {
                "$ref": "monomer1551"
            },
            {
                "$ref": "monomer1556"
            },
            {
                "$ref": "monomer1561"
            },
            {
                "$ref": "monomer1566"
            },
            {
                "$ref": "monomer1571"
            },
            {
                "$ref": "monomer1576"
            },
            {
                "$ref": "monomer1581"
            },
            {
                "$ref": "monomer1586"
            },
            {
                "$ref": "monomer1591"
            },
            {
                "$ref": "monomer1596"
            },
            {
                "$ref": "monomer1601"
            },
            {
                "$ref": "monomer1606"
            },
            {
                "$ref": "monomer1611"
            },
            {
                "$ref": "monomer1616"
            },
            {
                "$ref": "monomer1621"
            },
            {
                "$ref": "monomer1626"
            },
            {
                "$ref": "monomer1631"
            },
            {
                "$ref": "monomer1636"
            },
            {
                "$ref": "monomer1641"
            },
            {
                "$ref": "monomer1646"
            },
            {
                "$ref": "monomer1651"
            },
            {
                "$ref": "monomer1656"
            },
            {
                "$ref": "monomer1661"
            },
            {
                "$ref": "monomer1666"
            },
            {
                "$ref": "monomer1671"
            },
            {
                "$ref": "monomer1676"
            },
            {
                "$ref": "monomer1681"
            },
            {
                "$ref": "monomer1686"
            },
            {
                "$ref": "monomer1691"
            },
            {
                "$ref": "monomer1696"
            },
            {
                "$ref": "monomer1701"
            },
            {
                "$ref": "monomer1706"
            },
            {
                "$ref": "monomer1711"
            },
            {
                "$ref": "monomer1716"
            },
            {
                "$ref": "monomer1721"
            },
            {
                "$ref": "monomer1726"
            },
            {
                "$ref": "monomer1731"
            },
            {
                "$ref": "monomer1736"
            },
            {
                "$ref": "monomer1741"
            },
            {
                "$ref": "monomer1746"
            },
            {
                "$ref": "monomer1751"
            },
            {
                "$ref": "monomer1756"
            },
            {
                "$ref": "monomer1761"
            },
            {
                "$ref": "monomer1766"
            },
            {
                "$ref": "monomer1771"
            },
            {
                "$ref": "monomer1776"
            },
            {
                "$ref": "monomer1781"
            },
            {
                "$ref": "monomer1786"
            },
            {
                "$ref": "monomer1791"
            },
            {
                "$ref": "monomer1796"
            },
            {
                "$ref": "monomer1801"
            },
            {
                "$ref": "monomer1806"
            },
            {
                "$ref": "monomer1811"
            },
            {
                "$ref": "monomer1816"
            },
            {
                "$ref": "monomer1821"
            },
            {
                "$ref": "monomer1826"
            },
            {
                "$ref": "monomer1831"
            },
            {
                "$ref": "monomer1836"
            },
            {
                "$ref": "monomer1841"
            },
            {
                "$ref": "monomer1846"
            },
            {
                "$ref": "monomer1851"
            },
            {
                "$ref": "monomer1856"
            },
            {
                "$ref": "monomer1861"
            },
            {
                "$ref": "monomer1866"
            },
            {
                "$ref": "monomer1871"
            },
            {
                "$ref": "monomer1876"
            },
            {
                "$ref": "monomer1881"
            },
            {
                "$ref": "monomer1886"
            },
            {
                "$ref": "monomer1891"
            },
            {
                "$ref": "monomer1896"
            },
            {
                "$ref": "monomer1901"
            },
            {
                "$ref": "monomer1906"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer991",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer992",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer992",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer993",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer993",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer994",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer994",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer995",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer995",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer996",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer996",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer997",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer997",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer998",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer998",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer999",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer999",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1000",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1000",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1001",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1001",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1002",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1002",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1003",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1003",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1004",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1004",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1005",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1005",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1006",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1006",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1007",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1007",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1008",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1008",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1009",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1009",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1010",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1010",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1011",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1011",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1012",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1012",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1013",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1013",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1014",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1014",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1015",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1015",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1016",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1016",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1017",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1017",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1018",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1018",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1019",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1019",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1020",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1020",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1021",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1021",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1022",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1022",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1023",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1023",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1024",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1024",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1025",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1025",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1026",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1026",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1027",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1027",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1028",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1028",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1029",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1029",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1030",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1030",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1031",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1031",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1032",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1032",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1033",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1033",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1034",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1034",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1035",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1035",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1036",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1036",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1037",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1037",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1038",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1038",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1039",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1039",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1040",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1040",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1041",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1041",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1042",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1042",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1043",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1043",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1044",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1044",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1045",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1045",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1046",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1046",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1047",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1047",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1048",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1048",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1049",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1049",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1050",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1051",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1052",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1052",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1053",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1053",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1054",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1054",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1055",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1055",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1056",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1056",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1057",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1057",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1058",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1058",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1059",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1059",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1060",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1060",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1061",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1061",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1062",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1062",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1063",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1063",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1064",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1064",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1065",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1065",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1066",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1066",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1067",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1067",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1068",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1068",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1069",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1069",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1070",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1070",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1071",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1071",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1072",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1072",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1073",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1073",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1074",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1074",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1075",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1075",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1076",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1076",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1077",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1077",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1078",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1078",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1079",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1079",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1080",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1080",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1081",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1081",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1082",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1082",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1083",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1083",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1084",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1084",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1085",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1085",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1086",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1086",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1087",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1087",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1088",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1088",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1089",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1089",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1090",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1090",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1091",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1091",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1092",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1092",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1093",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1093",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1094",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1094",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1095",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1095",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1096",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1096",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1097",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1097",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1098",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1098",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1099",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1099",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1100",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1100",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1101",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1101",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1102",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1102",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1103",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1103",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1104",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1104",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1105",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1105",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1106",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1106",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1107",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1108",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1109",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1018",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1057",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1016",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1073",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1002",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1042",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer995",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1028",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1019",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1076",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1020",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1094",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1109",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1110",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1107",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1311",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1311",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1316",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1316",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1321",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1321",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1326",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1326",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1331",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1331",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1336",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1336",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1341",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1341",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1346",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1346",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1351",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1351",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1356",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1356",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1361",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1361",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1366",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1366",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1371",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1371",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1376",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1376",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1381",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1381",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1386",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1386",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1391",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1391",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1396",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1396",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1401",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1401",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1406",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1406",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1411",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1411",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1416",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1416",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1421",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1421",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1426",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1426",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1431",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1431",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1436",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1436",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1441",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1441",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1446",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1446",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1451",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1451",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1456",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1456",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1461",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1461",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1466",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1466",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1471",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1471",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1476",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1476",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1481",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1481",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1486",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1486",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1491",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1491",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1496",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1496",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1501",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1501",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1506",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1506",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1511",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1511",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1516",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1516",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1521",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1521",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1526",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1526",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1531",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1531",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1536",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1536",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1541",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1541",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1546",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1546",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1551",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1551",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1556",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1556",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1561",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1561",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1566",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1566",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1571",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1571",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1576",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1576",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1581",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1581",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1586",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1586",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1591",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1591",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1596",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1596",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1601",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1601",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1606",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1606",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1611",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1611",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1616",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1616",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1621",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1621",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1626",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1626",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1631",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1631",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1636",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1636",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1641",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1641",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1646",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1646",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1651",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1651",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1656",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1656",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1661",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1661",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1666",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1666",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1671",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1671",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1676",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1676",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1681",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1681",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1686",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1686",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1691",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1691",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1696",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1696",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1701",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1701",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1706",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1706",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1711",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1711",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1716",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1716",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1721",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1721",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1726",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1726",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1731",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1731",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1736",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1736",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1741",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1741",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1746",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1746",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1751",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1751",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1756",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1756",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1761",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1761",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1766",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1766",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1771",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1771",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1776",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1776",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1781",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1781",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1786",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1786",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1791",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1791",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1796",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1796",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1801",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1801",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1806",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1806",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1811",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1811",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1816",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1816",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1821",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1821",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1826",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1826",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1831",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1831",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1836",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1836",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1841",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1841",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1846",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1846",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1851",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1851",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1856",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1856",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1861",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1861",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1866",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1866",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1871",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1871",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1876",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1876",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1881",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1881",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1886",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1886",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1891",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1891",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1896",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1896",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1901",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1901",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1906",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1906",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1108",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1065",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1101",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1041",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1366",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1023",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1456",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1006",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1541",
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
    "monomer991": {
        "type": "monomer",
        "id": "991",
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
    "monomer992": {
        "type": "monomer",
        "id": "992",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer993": {
        "type": "monomer",
        "id": "993",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer994": {
        "type": "monomer",
        "id": "994",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer995": {
        "type": "monomer",
        "id": "995",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer996": {
        "type": "monomer",
        "id": "996",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer997": {
        "type": "monomer",
        "id": "997",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer998": {
        "type": "monomer",
        "id": "998",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer999": {
        "type": "monomer",
        "id": "999",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1000": {
        "type": "monomer",
        "id": "1000",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1001": {
        "type": "monomer",
        "id": "1001",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1002": {
        "type": "monomer",
        "id": "1002",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1003": {
        "type": "monomer",
        "id": "1003",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1004": {
        "type": "monomer",
        "id": "1004",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1005": {
        "type": "monomer",
        "id": "1005",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1006": {
        "type": "monomer",
        "id": "1006",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1007": {
        "type": "monomer",
        "id": "1007",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1008": {
        "type": "monomer",
        "id": "1008",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1009": {
        "type": "monomer",
        "id": "1009",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1010": {
        "type": "monomer",
        "id": "1010",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1011": {
        "type": "monomer",
        "id": "1011",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1012": {
        "type": "monomer",
        "id": "1012",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1013": {
        "type": "monomer",
        "id": "1013",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1014": {
        "type": "monomer",
        "id": "1014",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1015": {
        "type": "monomer",
        "id": "1015",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1016": {
        "type": "monomer",
        "id": "1016",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1017": {
        "type": "monomer",
        "id": "1017",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1018": {
        "type": "monomer",
        "id": "1018",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1019": {
        "type": "monomer",
        "id": "1019",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1020": {
        "type": "monomer",
        "id": "1020",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1021": {
        "type": "monomer",
        "id": "1021",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1022": {
        "type": "monomer",
        "id": "1022",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1023": {
        "type": "monomer",
        "id": "1023",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1024": {
        "type": "monomer",
        "id": "1024",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1025": {
        "type": "monomer",
        "id": "1025",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1026": {
        "type": "monomer",
        "id": "1026",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1027": {
        "type": "monomer",
        "id": "1027",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1028": {
        "type": "monomer",
        "id": "1028",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1029": {
        "type": "monomer",
        "id": "1029",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1030": {
        "type": "monomer",
        "id": "1030",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1031": {
        "type": "monomer",
        "id": "1031",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1032": {
        "type": "monomer",
        "id": "1032",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1033": {
        "type": "monomer",
        "id": "1033",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1034": {
        "type": "monomer",
        "id": "1034",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1035": {
        "type": "monomer",
        "id": "1035",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1036": {
        "type": "monomer",
        "id": "1036",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1037": {
        "type": "monomer",
        "id": "1037",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1038": {
        "type": "monomer",
        "id": "1038",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1039": {
        "type": "monomer",
        "id": "1039",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1040": {
        "type": "monomer",
        "id": "1040",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1041": {
        "type": "monomer",
        "id": "1041",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1042": {
        "type": "monomer",
        "id": "1042",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1043": {
        "type": "monomer",
        "id": "1043",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1044": {
        "type": "monomer",
        "id": "1044",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1045": {
        "type": "monomer",
        "id": "1045",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1046": {
        "type": "monomer",
        "id": "1046",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1047": {
        "type": "monomer",
        "id": "1047",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1048": {
        "type": "monomer",
        "id": "1048",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1049": {
        "type": "monomer",
        "id": "1049",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1050": {
        "type": "monomer",
        "id": "1050",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1051": {
        "type": "monomer",
        "id": "1051",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1052": {
        "type": "monomer",
        "id": "1052",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1053": {
        "type": "monomer",
        "id": "1053",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1054": {
        "type": "monomer",
        "id": "1054",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1055": {
        "type": "monomer",
        "id": "1055",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1056": {
        "type": "monomer",
        "id": "1056",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1057": {
        "type": "monomer",
        "id": "1057",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1058": {
        "type": "monomer",
        "id": "1058",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1059": {
        "type": "monomer",
        "id": "1059",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1060": {
        "type": "monomer",
        "id": "1060",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1061": {
        "type": "monomer",
        "id": "1061",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1062": {
        "type": "monomer",
        "id": "1062",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1063": {
        "type": "monomer",
        "id": "1063",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1064": {
        "type": "monomer",
        "id": "1064",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1065": {
        "type": "monomer",
        "id": "1065",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1066": {
        "type": "monomer",
        "id": "1066",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1067": {
        "type": "monomer",
        "id": "1067",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1068": {
        "type": "monomer",
        "id": "1068",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1069": {
        "type": "monomer",
        "id": "1069",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1070": {
        "type": "monomer",
        "id": "1070",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1071": {
        "type": "monomer",
        "id": "1071",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1072": {
        "type": "monomer",
        "id": "1072",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1073": {
        "type": "monomer",
        "id": "1073",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1074": {
        "type": "monomer",
        "id": "1074",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1075": {
        "type": "monomer",
        "id": "1075",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1076": {
        "type": "monomer",
        "id": "1076",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1077": {
        "type": "monomer",
        "id": "1077",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1078": {
        "type": "monomer",
        "id": "1078",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1079": {
        "type": "monomer",
        "id": "1079",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1080": {
        "type": "monomer",
        "id": "1080",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1081": {
        "type": "monomer",
        "id": "1081",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1082": {
        "type": "monomer",
        "id": "1082",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1083": {
        "type": "monomer",
        "id": "1083",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1084": {
        "type": "monomer",
        "id": "1084",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1085": {
        "type": "monomer",
        "id": "1085",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1086": {
        "type": "monomer",
        "id": "1086",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1087": {
        "type": "monomer",
        "id": "1087",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1088": {
        "type": "monomer",
        "id": "1088",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1089": {
        "type": "monomer",
        "id": "1089",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1090": {
        "type": "monomer",
        "id": "1090",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1091": {
        "type": "monomer",
        "id": "1091",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1092": {
        "type": "monomer",
        "id": "1092",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1093": {
        "type": "monomer",
        "id": "1093",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1094": {
        "type": "monomer",
        "id": "1094",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1095": {
        "type": "monomer",
        "id": "1095",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1096": {
        "type": "monomer",
        "id": "1096",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1097": {
        "type": "monomer",
        "id": "1097",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1098": {
        "type": "monomer",
        "id": "1098",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1099": {
        "type": "monomer",
        "id": "1099",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1100": {
        "type": "monomer",
        "id": "1100",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1101": {
        "type": "monomer",
        "id": "1101",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1102": {
        "type": "monomer",
        "id": "1102",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1103": {
        "type": "monomer",
        "id": "1103",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1104": {
        "type": "monomer",
        "id": "1104",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1105": {
        "type": "monomer",
        "id": "1105",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1106": {
        "type": "monomer",
        "id": "1106",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1107": {
        "type": "monomer",
        "id": "1107",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1108": {
        "type": "monomer",
        "id": "1108",
        "position": {
            "x": 23.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1109": {
        "type": "monomer",
        "id": "1109",
        "position": {
            "x": 25.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1110": {
        "type": "monomer",
        "id": "1110",
        "position": {
            "x": 26.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1311": {
        "type": "monomer",
        "id": "1311",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1316": {
        "type": "monomer",
        "id": "1316",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1321": {
        "type": "monomer",
        "id": "1321",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1326": {
        "type": "monomer",
        "id": "1326",
        "position": {
            "x": 10.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1331": {
        "type": "monomer",
        "id": "1331",
        "position": {
            "x": 11.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1336": {
        "type": "monomer",
        "id": "1336",
        "position": {
            "x": 13.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1341": {
        "type": "monomer",
        "id": "1341",
        "position": {
            "x": 14.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1346": {
        "type": "monomer",
        "id": "1346",
        "position": {
            "x": 16.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1351": {
        "type": "monomer",
        "id": "1351",
        "position": {
            "x": 17.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1356": {
        "type": "monomer",
        "id": "1356",
        "position": {
            "x": 19.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1361": {
        "type": "monomer",
        "id": "1361",
        "position": {
            "x": 20.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1366": {
        "type": "monomer",
        "id": "1366",
        "position": {
            "x": 22.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1371": {
        "type": "monomer",
        "id": "1371",
        "position": {
            "x": 23.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1376": {
        "type": "monomer",
        "id": "1376",
        "position": {
            "x": 25.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1381": {
        "type": "monomer",
        "id": "1381",
        "position": {
            "x": 26.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1386": {
        "type": "monomer",
        "id": "1386",
        "position": {
            "x": 1.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1391": {
        "type": "monomer",
        "id": "1391",
        "position": {
            "x": 2.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1396": {
        "type": "monomer",
        "id": "1396",
        "position": {
            "x": 4.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1401": {
        "type": "monomer",
        "id": "1401",
        "position": {
            "x": 5.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1406": {
        "type": "monomer",
        "id": "1406",
        "position": {
            "x": 7.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1411": {
        "type": "monomer",
        "id": "1411",
        "position": {
            "x": 8.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1416": {
        "type": "monomer",
        "id": "1416",
        "position": {
            "x": 10.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1421": {
        "type": "monomer",
        "id": "1421",
        "position": {
            "x": 11.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1426": {
        "type": "monomer",
        "id": "1426",
        "position": {
            "x": 13.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1431": {
        "type": "monomer",
        "id": "1431",
        "position": {
            "x": 14.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1436": {
        "type": "monomer",
        "id": "1436",
        "position": {
            "x": 16.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1441": {
        "type": "monomer",
        "id": "1441",
        "position": {
            "x": 17.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1446": {
        "type": "monomer",
        "id": "1446",
        "position": {
            "x": 19.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1451": {
        "type": "monomer",
        "id": "1451",
        "position": {
            "x": 20.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1456": {
        "type": "monomer",
        "id": "1456",
        "position": {
            "x": 22.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1461": {
        "type": "monomer",
        "id": "1461",
        "position": {
            "x": 23.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1466": {
        "type": "monomer",
        "id": "1466",
        "position": {
            "x": 25.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1471": {
        "type": "monomer",
        "id": "1471",
        "position": {
            "x": 26.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1476": {
        "type": "monomer",
        "id": "1476",
        "position": {
            "x": 1.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1481": {
        "type": "monomer",
        "id": "1481",
        "position": {
            "x": 2.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1486": {
        "type": "monomer",
        "id": "1486",
        "position": {
            "x": 4.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1491": {
        "type": "monomer",
        "id": "1491",
        "position": {
            "x": 5.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1496": {
        "type": "monomer",
        "id": "1496",
        "position": {
            "x": 7.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1501": {
        "type": "monomer",
        "id": "1501",
        "position": {
            "x": 8.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1506": {
        "type": "monomer",
        "id": "1506",
        "position": {
            "x": 10.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1511": {
        "type": "monomer",
        "id": "1511",
        "position": {
            "x": 11.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1516": {
        "type": "monomer",
        "id": "1516",
        "position": {
            "x": 13.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1521": {
        "type": "monomer",
        "id": "1521",
        "position": {
            "x": 14.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1526": {
        "type": "monomer",
        "id": "1526",
        "position": {
            "x": 16.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1531": {
        "type": "monomer",
        "id": "1531",
        "position": {
            "x": 17.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1536": {
        "type": "monomer",
        "id": "1536",
        "position": {
            "x": 19.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1541": {
        "type": "monomer",
        "id": "1541",
        "position": {
            "x": 20.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1546": {
        "type": "monomer",
        "id": "1546",
        "position": {
            "x": 22.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1551": {
        "type": "monomer",
        "id": "1551",
        "position": {
            "x": 23.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1556": {
        "type": "monomer",
        "id": "1556",
        "position": {
            "x": 25.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1561": {
        "type": "monomer",
        "id": "1561",
        "position": {
            "x": 26.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1566": {
        "type": "monomer",
        "id": "1566",
        "position": {
            "x": 1.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1571": {
        "type": "monomer",
        "id": "1571",
        "position": {
            "x": 2.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1576": {
        "type": "monomer",
        "id": "1576",
        "position": {
            "x": 4.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1581": {
        "type": "monomer",
        "id": "1581",
        "position": {
            "x": 5.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1586": {
        "type": "monomer",
        "id": "1586",
        "position": {
            "x": 7.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1591": {
        "type": "monomer",
        "id": "1591",
        "position": {
            "x": 8.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1596": {
        "type": "monomer",
        "id": "1596",
        "position": {
            "x": 10.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1601": {
        "type": "monomer",
        "id": "1601",
        "position": {
            "x": 11.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1606": {
        "type": "monomer",
        "id": "1606",
        "position": {
            "x": 13.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1611": {
        "type": "monomer",
        "id": "1611",
        "position": {
            "x": 14.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1616": {
        "type": "monomer",
        "id": "1616",
        "position": {
            "x": 16.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1621": {
        "type": "monomer",
        "id": "1621",
        "position": {
            "x": 17.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1626": {
        "type": "monomer",
        "id": "1626",
        "position": {
            "x": 19.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1631": {
        "type": "monomer",
        "id": "1631",
        "position": {
            "x": 20.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1636": {
        "type": "monomer",
        "id": "1636",
        "position": {
            "x": 22.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1641": {
        "type": "monomer",
        "id": "1641",
        "position": {
            "x": 23.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1646": {
        "type": "monomer",
        "id": "1646",
        "position": {
            "x": 25.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1651": {
        "type": "monomer",
        "id": "1651",
        "position": {
            "x": 26.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1656": {
        "type": "monomer",
        "id": "1656",
        "position": {
            "x": 1.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1661": {
        "type": "monomer",
        "id": "1661",
        "position": {
            "x": 2.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1666": {
        "type": "monomer",
        "id": "1666",
        "position": {
            "x": 4.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1671": {
        "type": "monomer",
        "id": "1671",
        "position": {
            "x": 5.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1676": {
        "type": "monomer",
        "id": "1676",
        "position": {
            "x": 7.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1681": {
        "type": "monomer",
        "id": "1681",
        "position": {
            "x": 8.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1686": {
        "type": "monomer",
        "id": "1686",
        "position": {
            "x": 10.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1691": {
        "type": "monomer",
        "id": "1691",
        "position": {
            "x": 11.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1696": {
        "type": "monomer",
        "id": "1696",
        "position": {
            "x": 13.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1701": {
        "type": "monomer",
        "id": "1701",
        "position": {
            "x": 14.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1706": {
        "type": "monomer",
        "id": "1706",
        "position": {
            "x": 16.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1711": {
        "type": "monomer",
        "id": "1711",
        "position": {
            "x": 17.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1716": {
        "type": "monomer",
        "id": "1716",
        "position": {
            "x": 19.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1721": {
        "type": "monomer",
        "id": "1721",
        "position": {
            "x": 20.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1726": {
        "type": "monomer",
        "id": "1726",
        "position": {
            "x": 22.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1731": {
        "type": "monomer",
        "id": "1731",
        "position": {
            "x": 23.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1736": {
        "type": "monomer",
        "id": "1736",
        "position": {
            "x": 25.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1741": {
        "type": "monomer",
        "id": "1741",
        "position": {
            "x": 26.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1746": {
        "type": "monomer",
        "id": "1746",
        "position": {
            "x": 1.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1751": {
        "type": "monomer",
        "id": "1751",
        "position": {
            "x": 2.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1756": {
        "type": "monomer",
        "id": "1756",
        "position": {
            "x": 4.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1761": {
        "type": "monomer",
        "id": "1761",
        "position": {
            "x": 5.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1766": {
        "type": "monomer",
        "id": "1766",
        "position": {
            "x": 7.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1771": {
        "type": "monomer",
        "id": "1771",
        "position": {
            "x": 8.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1776": {
        "type": "monomer",
        "id": "1776",
        "position": {
            "x": 10.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1781": {
        "type": "monomer",
        "id": "1781",
        "position": {
            "x": 11.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1786": {
        "type": "monomer",
        "id": "1786",
        "position": {
            "x": 13.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1791": {
        "type": "monomer",
        "id": "1791",
        "position": {
            "x": 14.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1796": {
        "type": "monomer",
        "id": "1796",
        "position": {
            "x": 16.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1801": {
        "type": "monomer",
        "id": "1801",
        "position": {
            "x": 17.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1806": {
        "type": "monomer",
        "id": "1806",
        "position": {
            "x": 19.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1811": {
        "type": "monomer",
        "id": "1811",
        "position": {
            "x": 20.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1816": {
        "type": "monomer",
        "id": "1816",
        "position": {
            "x": 22.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1821": {
        "type": "monomer",
        "id": "1821",
        "position": {
            "x": 23.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1826": {
        "type": "monomer",
        "id": "1826",
        "position": {
            "x": 25.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1831": {
        "type": "monomer",
        "id": "1831",
        "position": {
            "x": 26.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1836": {
        "type": "monomer",
        "id": "1836",
        "position": {
            "x": 1.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1841": {
        "type": "monomer",
        "id": "1841",
        "position": {
            "x": 2.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1846": {
        "type": "monomer",
        "id": "1846",
        "position": {
            "x": 4.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1851": {
        "type": "monomer",
        "id": "1851",
        "position": {
            "x": 5.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1856": {
        "type": "monomer",
        "id": "1856",
        "position": {
            "x": 7.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1861": {
        "type": "monomer",
        "id": "1861",
        "position": {
            "x": 8.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1866": {
        "type": "monomer",
        "id": "1866",
        "position": {
            "x": 10.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1871": {
        "type": "monomer",
        "id": "1871",
        "position": {
            "x": 11.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1876": {
        "type": "monomer",
        "id": "1876",
        "position": {
            "x": 13.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1881": {
        "type": "monomer",
        "id": "1881",
        "position": {
            "x": 14.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1886": {
        "type": "monomer",
        "id": "1886",
        "position": {
            "x": 16.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1891": {
        "type": "monomer",
        "id": "1891",
        "position": {
            "x": 17.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1896": {
        "type": "monomer",
        "id": "1896",
        "position": {
            "x": 19.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1901": {
        "type": "monomer",
        "id": "1901",
        "position": {
            "x": 20.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1906": {
        "type": "monomer",
        "id": "1906",
        "position": {
            "x": 22.25,
            "y": -20.9125
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
