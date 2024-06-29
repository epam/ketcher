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
                "$ref": "monomer787"
            },
            {
                "$ref": "monomer788"
            },
            {
                "$ref": "monomer789"
            },
            {
                "$ref": "monomer790"
            },
            {
                "$ref": "monomer791"
            },
            {
                "$ref": "monomer792"
            },
            {
                "$ref": "monomer793"
            },
            {
                "$ref": "monomer794"
            },
            {
                "$ref": "monomer795"
            },
            {
                "$ref": "monomer796"
            },
            {
                "$ref": "monomer797"
            },
            {
                "$ref": "monomer798"
            },
            {
                "$ref": "monomer799"
            },
            {
                "$ref": "monomer800"
            },
            {
                "$ref": "monomer801"
            },
            {
                "$ref": "monomer802"
            },
            {
                "$ref": "monomer803"
            },
            {
                "$ref": "monomer804"
            },
            {
                "$ref": "monomer805"
            },
            {
                "$ref": "monomer806"
            },
            {
                "$ref": "monomer807"
            },
            {
                "$ref": "monomer808"
            },
            {
                "$ref": "monomer809"
            },
            {
                "$ref": "monomer810"
            },
            {
                "$ref": "monomer811"
            },
            {
                "$ref": "monomer812"
            },
            {
                "$ref": "monomer813"
            },
            {
                "$ref": "monomer814"
            },
            {
                "$ref": "monomer815"
            },
            {
                "$ref": "monomer816"
            },
            {
                "$ref": "monomer817"
            },
            {
                "$ref": "monomer818"
            },
            {
                "$ref": "monomer819"
            },
            {
                "$ref": "monomer820"
            },
            {
                "$ref": "monomer821"
            },
            {
                "$ref": "monomer822"
            },
            {
                "$ref": "monomer823"
            },
            {
                "$ref": "monomer824"
            },
            {
                "$ref": "monomer825"
            },
            {
                "$ref": "monomer826"
            },
            {
                "$ref": "monomer827"
            },
            {
                "$ref": "monomer828"
            },
            {
                "$ref": "monomer829"
            },
            {
                "$ref": "monomer830"
            },
            {
                "$ref": "monomer831"
            },
            {
                "$ref": "monomer832"
            },
            {
                "$ref": "monomer833"
            },
            {
                "$ref": "monomer834"
            },
            {
                "$ref": "monomer835"
            },
            {
                "$ref": "monomer836"
            },
            {
                "$ref": "monomer837"
            },
            {
                "$ref": "monomer838"
            },
            {
                "$ref": "monomer839"
            },
            {
                "$ref": "monomer840"
            },
            {
                "$ref": "monomer841"
            },
            {
                "$ref": "monomer842"
            },
            {
                "$ref": "monomer843"
            },
            {
                "$ref": "monomer844"
            },
            {
                "$ref": "monomer845"
            },
            {
                "$ref": "monomer846"
            },
            {
                "$ref": "monomer847"
            },
            {
                "$ref": "monomer848"
            },
            {
                "$ref": "monomer849"
            },
            {
                "$ref": "monomer850"
            },
            {
                "$ref": "monomer851"
            },
            {
                "$ref": "monomer852"
            },
            {
                "$ref": "monomer853"
            },
            {
                "$ref": "monomer854"
            },
            {
                "$ref": "monomer855"
            },
            {
                "$ref": "monomer856"
            },
            {
                "$ref": "monomer857"
            },
            {
                "$ref": "monomer858"
            },
            {
                "$ref": "monomer859"
            },
            {
                "$ref": "monomer860"
            },
            {
                "$ref": "monomer861"
            },
            {
                "$ref": "monomer862"
            },
            {
                "$ref": "monomer863"
            },
            {
                "$ref": "monomer864"
            },
            {
                "$ref": "monomer865"
            },
            {
                "$ref": "monomer866"
            },
            {
                "$ref": "monomer867"
            },
            {
                "$ref": "monomer868"
            },
            {
                "$ref": "monomer869"
            },
            {
                "$ref": "monomer870"
            },
            {
                "$ref": "monomer871"
            },
            {
                "$ref": "monomer872"
            },
            {
                "$ref": "monomer873"
            },
            {
                "$ref": "monomer874"
            },
            {
                "$ref": "monomer875"
            },
            {
                "$ref": "monomer876"
            },
            {
                "$ref": "monomer877"
            },
            {
                "$ref": "monomer878"
            },
            {
                "$ref": "monomer879"
            },
            {
                "$ref": "monomer880"
            },
            {
                "$ref": "monomer881"
            },
            {
                "$ref": "monomer882"
            },
            {
                "$ref": "monomer883"
            },
            {
                "$ref": "monomer884"
            },
            {
                "$ref": "monomer885"
            },
            {
                "$ref": "monomer886"
            },
            {
                "$ref": "monomer887"
            },
            {
                "$ref": "monomer888"
            },
            {
                "$ref": "monomer889"
            },
            {
                "$ref": "monomer890"
            },
            {
                "$ref": "monomer891"
            },
            {
                "$ref": "monomer892"
            },
            {
                "$ref": "monomer893"
            },
            {
                "$ref": "monomer894"
            },
            {
                "$ref": "monomer895"
            },
            {
                "$ref": "monomer896"
            },
            {
                "$ref": "monomer897"
            },
            {
                "$ref": "monomer898"
            },
            {
                "$ref": "monomer899"
            },
            {
                "$ref": "monomer900"
            },
            {
                "$ref": "monomer901"
            },
            {
                "$ref": "monomer902"
            },
            {
                "$ref": "monomer903"
            },
            {
                "$ref": "monomer904"
            },
            {
                "$ref": "monomer905"
            },
            {
                "$ref": "monomer906"
            },
            {
                "$ref": "monomer907"
            },
            {
                "$ref": "monomer908"
            },
            {
                "$ref": "monomer909"
            },
            {
                "$ref": "monomer910"
            },
            {
                "$ref": "monomer911"
            },
            {
                "$ref": "monomer912"
            },
            {
                "$ref": "monomer913"
            },
            {
                "$ref": "monomer914"
            },
            {
                "$ref": "monomer915"
            },
            {
                "$ref": "monomer916"
            },
            {
                "$ref": "monomer917"
            },
            {
                "$ref": "monomer918"
            },
            {
                "$ref": "monomer919"
            },
            {
                "$ref": "monomer920"
            },
            {
                "$ref": "monomer921"
            },
            {
                "$ref": "monomer922"
            },
            {
                "$ref": "monomer923"
            },
            {
                "$ref": "monomer924"
            },
            {
                "$ref": "monomer925"
            },
            {
                "$ref": "monomer926"
            },
            {
                "$ref": "monomer927"
            },
            {
                "$ref": "monomer928"
            },
            {
                "$ref": "monomer929"
            },
            {
                "$ref": "monomer930"
            },
            {
                "$ref": "monomer931"
            },
            {
                "$ref": "monomer932"
            },
            {
                "$ref": "monomer933"
            },
            {
                "$ref": "monomer934"
            },
            {
                "$ref": "monomer935"
            },
            {
                "$ref": "monomer936"
            },
            {
                "$ref": "monomer937"
            },
            {
                "$ref": "monomer938"
            },
            {
                "$ref": "monomer939"
            },
            {
                "$ref": "monomer940"
            },
            {
                "$ref": "monomer941"
            },
            {
                "$ref": "monomer942"
            },
            {
                "$ref": "monomer943"
            },
            {
                "$ref": "monomer944"
            },
            {
                "$ref": "monomer945"
            },
            {
                "$ref": "monomer946"
            },
            {
                "$ref": "monomer947"
            },
            {
                "$ref": "monomer948"
            },
            {
                "$ref": "monomer949"
            },
            {
                "$ref": "monomer950"
            },
            {
                "$ref": "monomer951"
            },
            {
                "$ref": "monomer952"
            },
            {
                "$ref": "monomer953"
            },
            {
                "$ref": "monomer954"
            },
            {
                "$ref": "monomer955"
            },
            {
                "$ref": "monomer956"
            },
            {
                "$ref": "monomer957"
            },
            {
                "$ref": "monomer958"
            },
            {
                "$ref": "monomer959"
            },
            {
                "$ref": "monomer960"
            },
            {
                "$ref": "monomer961"
            },
            {
                "$ref": "monomer962"
            },
            {
                "$ref": "monomer963"
            },
            {
                "$ref": "monomer964"
            },
            {
                "$ref": "monomer965"
            },
            {
                "$ref": "monomer966"
            },
            {
                "$ref": "monomer967"
            },
            {
                "$ref": "monomer968"
            },
            {
                "$ref": "monomer969"
            },
            {
                "$ref": "monomer970"
            },
            {
                "$ref": "monomer971"
            },
            {
                "$ref": "monomer972"
            },
            {
                "$ref": "monomer973"
            },
            {
                "$ref": "monomer974"
            },
            {
                "$ref": "monomer975"
            },
            {
                "$ref": "monomer976"
            },
            {
                "$ref": "monomer977"
            },
            {
                "$ref": "monomer978"
            },
            {
                "$ref": "monomer979"
            },
            {
                "$ref": "monomer980"
            },
            {
                "$ref": "monomer981"
            },
            {
                "$ref": "monomer982"
            },
            {
                "$ref": "monomer983"
            },
            {
                "$ref": "monomer984"
            },
            {
                "$ref": "monomer985"
            },
            {
                "$ref": "monomer986"
            },
            {
                "$ref": "monomer987"
            },
            {
                "$ref": "monomer988"
            },
            {
                "$ref": "monomer989"
            },
            {
                "$ref": "monomer990"
            },
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
                "$ref": "monomer1111"
            },
            {
                "$ref": "monomer1112"
            },
            {
                "$ref": "monomer1113"
            },
            {
                "$ref": "monomer1114"
            },
            {
                "$ref": "monomer1115"
            },
            {
                "$ref": "monomer1116"
            },
            {
                "$ref": "monomer1117"
            },
            {
                "$ref": "monomer1118"
            },
            {
                "$ref": "monomer1119"
            },
            {
                "$ref": "monomer1120"
            },
            {
                "$ref": "monomer1121"
            },
            {
                "$ref": "monomer1122"
            },
            {
                "$ref": "monomer1123"
            },
            {
                "$ref": "monomer1124"
            },
            {
                "$ref": "monomer1125"
            },
            {
                "$ref": "monomer1126"
            },
            {
                "$ref": "monomer1127"
            },
            {
                "$ref": "monomer1128"
            },
            {
                "$ref": "monomer1129"
            },
            {
                "$ref": "monomer1130"
            },
            {
                "$ref": "monomer1131"
            },
            {
                "$ref": "monomer1132"
            },
            {
                "$ref": "monomer1133"
            },
            {
                "$ref": "monomer1134"
            },
            {
                "$ref": "monomer1135"
            },
            {
                "$ref": "monomer1136"
            },
            {
                "$ref": "monomer1137"
            },
            {
                "$ref": "monomer1138"
            },
            {
                "$ref": "monomer1139"
            },
            {
                "$ref": "monomer1140"
            },
            {
                "$ref": "monomer1141"
            },
            {
                "$ref": "monomer1142"
            },
            {
                "$ref": "monomer1143"
            },
            {
                "$ref": "monomer1144"
            },
            {
                "$ref": "monomer1145"
            },
            {
                "$ref": "monomer1146"
            },
            {
                "$ref": "monomer1147"
            },
            {
                "$ref": "monomer1148"
            },
            {
                "$ref": "monomer1149"
            },
            {
                "$ref": "monomer1150"
            },
            {
                "$ref": "monomer1151"
            },
            {
                "$ref": "monomer1152"
            },
            {
                "$ref": "monomer1153"
            },
            {
                "$ref": "monomer1154"
            },
            {
                "$ref": "monomer1155"
            },
            {
                "$ref": "monomer1156"
            },
            {
                "$ref": "monomer1157"
            },
            {
                "$ref": "monomer1158"
            },
            {
                "$ref": "monomer1159"
            },
            {
                "$ref": "monomer1160"
            },
            {
                "$ref": "monomer1161"
            },
            {
                "$ref": "monomer1162"
            },
            {
                "$ref": "monomer1163"
            },
            {
                "$ref": "monomer1164"
            },
            {
                "$ref": "monomer1165"
            },
            {
                "$ref": "monomer1166"
            },
            {
                "$ref": "monomer1167"
            },
            {
                "$ref": "monomer1168"
            },
            {
                "$ref": "monomer1169"
            },
            {
                "$ref": "monomer1170"
            },
            {
                "$ref": "monomer1171"
            },
            {
                "$ref": "monomer1172"
            },
            {
                "$ref": "monomer1173"
            },
            {
                "$ref": "monomer1174"
            },
            {
                "$ref": "monomer1175"
            },
            {
                "$ref": "monomer1176"
            },
            {
                "$ref": "monomer1576"
            },
            {
                "$ref": "monomer1577"
            },
            {
                "$ref": "monomer1581"
            },
            {
                "$ref": "monomer1582"
            },
            {
                "$ref": "monomer1584"
            },
            {
                "$ref": "monomer1589"
            },
            {
                "$ref": "monomer1590"
            },
            {
                "$ref": "monomer1592"
            },
            {
                "$ref": "monomer1597"
            },
            {
                "$ref": "monomer1598"
            },
            {
                "$ref": "monomer1600"
            },
            {
                "$ref": "monomer1605"
            },
            {
                "$ref": "monomer1606"
            },
            {
                "$ref": "monomer1608"
            },
            {
                "$ref": "monomer1613"
            },
            {
                "$ref": "monomer1614"
            },
            {
                "$ref": "monomer1616"
            },
            {
                "$ref": "monomer1621"
            },
            {
                "$ref": "monomer1622"
            },
            {
                "$ref": "monomer1624"
            },
            {
                "$ref": "monomer1629"
            },
            {
                "$ref": "monomer1630"
            },
            {
                "$ref": "monomer1632"
            },
            {
                "$ref": "monomer1637"
            },
            {
                "$ref": "monomer1638"
            },
            {
                "$ref": "monomer1640"
            },
            {
                "$ref": "monomer1645"
            },
            {
                "$ref": "monomer1646"
            },
            {
                "$ref": "monomer1648"
            },
            {
                "$ref": "monomer1653"
            },
            {
                "$ref": "monomer1654"
            },
            {
                "$ref": "monomer1656"
            },
            {
                "$ref": "monomer1661"
            },
            {
                "$ref": "monomer1662"
            },
            {
                "$ref": "monomer1664"
            },
            {
                "$ref": "monomer1669"
            },
            {
                "$ref": "monomer1670"
            },
            {
                "$ref": "monomer1672"
            },
            {
                "$ref": "monomer1677"
            },
            {
                "$ref": "monomer1678"
            },
            {
                "$ref": "monomer1680"
            },
            {
                "$ref": "monomer1685"
            },
            {
                "$ref": "monomer1686"
            },
            {
                "$ref": "monomer1688"
            },
            {
                "$ref": "monomer1693"
            },
            {
                "$ref": "monomer1694"
            },
            {
                "$ref": "monomer1696"
            },
            {
                "$ref": "monomer1701"
            },
            {
                "$ref": "monomer1702"
            },
            {
                "$ref": "monomer1709"
            },
            {
                "$ref": "monomer1710"
            },
            {
                "$ref": "monomer1712"
            },
            {
                "$ref": "monomer1717"
            },
            {
                "$ref": "monomer1718"
            },
            {
                "$ref": "monomer1720"
            },
            {
                "$ref": "monomer1725"
            },
            {
                "$ref": "monomer1726"
            },
            {
                "$ref": "monomer1728"
            },
            {
                "$ref": "monomer1733"
            },
            {
                "$ref": "monomer1734"
            },
            {
                "$ref": "monomer1741"
            },
            {
                "$ref": "monomer1742"
            },
            {
                "$ref": "monomer1744"
            },
            {
                "$ref": "monomer1749"
            },
            {
                "$ref": "monomer1750"
            },
            {
                "$ref": "monomer1752"
            },
            {
                "$ref": "monomer1757"
            },
            {
                "$ref": "monomer1758"
            },
            {
                "$ref": "monomer1760"
            },
            {
                "$ref": "monomer1765"
            },
            {
                "$ref": "monomer1766"
            },
            {
                "$ref": "monomer1768"
            },
            {
                "$ref": "monomer1773"
            },
            {
                "$ref": "monomer1774"
            },
            {
                "$ref": "monomer1776"
            },
            {
                "$ref": "monomer1781"
            },
            {
                "$ref": "monomer1782"
            },
            {
                "$ref": "monomer1784"
            },
            {
                "$ref": "monomer1789"
            },
            {
                "$ref": "monomer1790"
            },
            {
                "$ref": "monomer1792"
            },
            {
                "$ref": "monomer1797"
            },
            {
                "$ref": "monomer1798"
            },
            {
                "$ref": "monomer1800"
            },
            {
                "$ref": "monomer1805"
            },
            {
                "$ref": "monomer1806"
            },
            {
                "$ref": "monomer1813"
            },
            {
                "$ref": "monomer1814"
            },
            {
                "$ref": "monomer1816"
            },
            {
                "$ref": "monomer1821"
            },
            {
                "$ref": "monomer1822"
            },
            {
                "$ref": "monomer1824"
            },
            {
                "$ref": "monomer1829"
            },
            {
                "$ref": "monomer1830"
            },
            {
                "$ref": "monomer1832"
            },
            {
                "$ref": "monomer1837"
            },
            {
                "$ref": "monomer1838"
            },
            {
                "$ref": "monomer1840"
            },
            {
                "$ref": "monomer1845"
            },
            {
                "$ref": "monomer1846"
            },
            {
                "$ref": "monomer1848"
            },
            {
                "$ref": "monomer1853"
            },
            {
                "$ref": "monomer1854"
            },
            {
                "$ref": "monomer1856"
            },
            {
                "$ref": "monomer1861"
            },
            {
                "$ref": "monomer1862"
            },
            {
                "$ref": "monomer1864"
            },
            {
                "$ref": "monomer1870"
            },
            {
                "$ref": "monomer1871"
            },
            {
                "$ref": "monomer1872"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer787",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer788",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer788",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer789",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer789",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer790",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer790",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer791",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer791",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer792",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer792",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer793",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer793",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer794",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer794",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer795",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer795",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer796",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer796",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer797",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer797",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer798",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer798",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer799",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer799",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer800",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer800",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer801",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer801",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer802",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer802",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer803",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer803",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer804",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer804",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer805",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer805",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer806",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer806",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer807",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer807",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer808",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer808",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer809",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer809",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer810",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer810",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer811",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer811",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer812",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer812",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer813",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer813",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer814",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer814",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer815",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer815",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer816",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer816",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer817",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer817",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer818",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer818",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer819",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer819",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer820",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer820",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer821",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer821",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer822",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer822",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer823",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer823",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer824",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer824",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer825",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer825",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer826",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer826",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer827",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer827",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer828",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer828",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer829",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer829",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer830",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer830",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer831",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer831",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer832",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer832",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer833",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer833",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer834",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer834",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer835",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer835",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer836",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer836",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer837",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer837",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer838",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer838",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer839",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer839",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer840",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer840",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer841",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer841",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer842",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer842",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer843",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer844",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer845",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer845",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer846",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer843",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer847",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer847",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer848",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer848",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer849",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer849",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer850",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer850",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer851",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer851",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer852",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer852",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer853",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer853",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer854",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer854",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer855",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer855",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer856",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer856",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer857",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer857",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer858",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer858",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer859",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer859",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer860",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer860",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer861",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer861",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer862",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer862",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer863",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer863",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer864",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer864",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer865",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer865",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer866",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer866",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer867",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer867",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer868",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer868",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer869",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer869",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer870",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer870",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer871",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer871",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer872",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer872",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer873",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer873",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer874",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer874",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer875",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer875",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer876",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer876",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer877",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer877",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer878",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer878",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer879",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer879",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer880",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer880",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer881",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer881",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer882",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer882",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer883",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer883",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer884",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer884",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer885",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer885",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer886",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer886",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer887",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer887",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer888",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer888",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer889",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer889",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer890",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer890",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer891",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer891",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer892",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer892",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer893",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer893",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer894",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer894",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer895",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer895",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer896",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer896",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer897",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer897",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer898",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer898",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer899",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer899",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer900",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer900",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer901",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer901",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer902",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer902",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer903",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer903",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer904",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer904",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer905",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer905",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer906",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer906",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer907",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer907",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer908",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer908",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer909",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer909",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer910",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer910",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer911",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer911",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer912",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer912",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer913",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer913",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer914",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer914",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer915",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer915",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer916",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer916",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer917",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer917",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer918",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer918",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer919",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer919",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer920",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer920",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer921",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer921",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer922",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer922",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer923",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer923",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer924",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer924",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer925",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer925",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer926",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer926",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer927",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer927",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer928",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer928",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer929",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer929",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer930",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer930",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer931",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer931",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer932",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer932",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer933",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer933",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer934",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer934",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer935",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer935",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer936",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer936",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer937",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer937",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer938",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer938",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer939",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer939",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer940",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer940",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer941",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer941",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer942",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer942",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer943",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer943",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer944",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer944",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer945",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer945",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer946",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer946",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer947",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer947",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer948",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer948",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer949",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer949",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer950",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer950",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer951",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer951",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer952",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer952",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer953",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer953",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer954",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer954",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer955",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer955",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer956",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer956",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer957",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer957",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer958",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer958",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer959",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer959",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer960",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer960",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer961",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer961",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer962",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer962",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer963",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer963",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer964",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer964",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer965",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer965",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer966",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer966",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer844",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer879",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer915",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer861",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer933",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer840",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer951",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer822",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer845",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer864",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer900",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer843",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer918",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer825",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer936",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer807",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer953",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer846",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer967",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer967",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer968",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer968",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer969",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer969",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer970",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer970",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer971",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer971",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer972",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer972",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer973",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer973",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer974",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer974",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer975",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer975",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer976",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer976",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer977",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer977",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer978",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer978",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer979",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer979",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer980",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer980",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer981",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer981",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer982",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer982",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer983",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer983",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer984",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer984",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer985",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer985",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer986",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer986",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer987",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer987",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer988",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer988",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer989",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer989",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer990",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer990",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer991",
                    "attachmentPointId": "R1"
                }
            },
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
                    "monomerId": "monomer1050",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1051",
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
                    "monomerId": "monomer1107",
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
                    "monomerId": "monomer1110",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1111",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1111",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1112",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1112",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1113",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1113",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1114",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1114",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1115",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1115",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1116",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1116",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1117",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1117",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1118",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1118",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1119",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1119",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1120",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1120",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1121",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1121",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1122",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1122",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1123",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1123",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1124",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1124",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1125",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1125",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1126",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1126",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1127",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1127",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1128",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1128",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1129",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1129",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1130",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1130",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1131",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1131",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1132",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1132",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1133",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1133",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1134",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1134",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1135",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1135",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1136",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1136",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1137",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1137",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1138",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1138",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1139",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1139",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1140",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1140",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1141",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1141",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1142",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1142",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1143",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1143",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1144",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1144",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1145",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1145",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1146",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1146",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1147",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1147",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1148",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1148",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1149",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1149",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1150",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1150",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1151",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1151",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1152",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1152",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1153",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1153",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1154",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1154",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1155",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1155",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1156",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1156",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1157",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1157",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1158",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1158",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1159",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1159",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1160",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1160",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1161",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1161",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1162",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1162",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1163",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1163",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1164",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1164",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1165",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1165",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1166",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1166",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1167",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1167",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1168",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1168",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1169",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1169",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1170",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1170",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1171",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1171",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1172",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1172",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1173",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1173",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1174",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1174",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1175",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1175",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1176",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1576",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1577",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1581",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1582",
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
                    "monomerId": "monomer1584",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1584",
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
                    "monomerId": "monomer1589",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1590",
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
                    "monomerId": "monomer1592",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1592",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1589",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1597",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1598",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1589",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1600",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1600",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1597",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1605",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1606",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1597",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1608",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1608",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1605",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1613",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1614",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1605",
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
                    "monomerId": "monomer1613",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1621",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1622",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1613",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1624",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1624",
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
                    "monomerId": "monomer1629",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1630",
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
                    "monomerId": "monomer1632",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1632",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1629",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1637",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1638",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1629",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1640",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1640",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1637",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1645",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1646",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1637",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1648",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1648",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1645",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1653",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1654",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1645",
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
                    "monomerId": "monomer1653",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1661",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1662",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1653",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1664",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1664",
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
                    "monomerId": "monomer1669",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1670",
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
                    "monomerId": "monomer1672",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1672",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1669",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1677",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1678",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1669",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1680",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1680",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1677",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1685",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1686",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1677",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1688",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1688",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1685",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1693",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1694",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1685",
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
                    "monomerId": "monomer1693",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1701",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1702",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1709",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1710",
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
                    "monomerId": "monomer1712",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1712",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1709",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1717",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1718",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1709",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1720",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1720",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1717",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1725",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1726",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1717",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1728",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1728",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1725",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1733",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1734",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1741",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1742",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1733",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1744",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1744",
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
                    "monomerId": "monomer1749",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1750",
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
                    "monomerId": "monomer1752",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1752",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1749",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1757",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1758",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1749",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1760",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1760",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1757",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1765",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1766",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1757",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1768",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1768",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1765",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1773",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1774",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1765",
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
                    "monomerId": "monomer1773",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1781",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1782",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1773",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1784",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1784",
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
                    "monomerId": "monomer1789",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1790",
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
                    "monomerId": "monomer1792",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1792",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1789",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1797",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1798",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1789",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1800",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1800",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1797",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1805",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1806",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1813",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1814",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1805",
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
                    "monomerId": "monomer1813",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1821",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1822",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1813",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1824",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1824",
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
                    "monomerId": "monomer1829",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1830",
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
                    "monomerId": "monomer1832",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1832",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1829",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1837",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1838",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1829",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1840",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1840",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1837",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1845",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1846",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1837",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1848",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1848",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1845",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1853",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1854",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1845",
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
                    "monomerId": "monomer1853",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1861",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1862",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1853",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1864",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1864",
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
                    "monomerId": "monomer1693",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1870",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1870",
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
                    "monomerId": "monomer1725",
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
                    "monomerId": "monomer1733",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1797",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1872",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1872",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1805",
                    "attachmentPointId": "R1"
                }
            }
        ],
        "templates": [
            {
                "$ref": "monomerTemplate-C___Cysteine"
            },
            {
                "$ref": "monomerTemplate-R___Ribose"
            },
            {
                "$ref": "monomerTemplate-A___Adenine"
            },
            {
                "$ref": "monomerTemplate-T___Thymine"
            },
            {
                "$ref": "monomerTemplate-P___Phosphate"
            },
            {
                "$ref": "monomerTemplate-U___Uracil"
            },
            {
                "$ref": "monomerTemplate-Test-6-Ph___Test-6-AP-Phosphate"
            }
        ]
    },
    "monomer787": {
        "type": "monomer",
        "id": "787",
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
    "monomer788": {
        "type": "monomer",
        "id": "788",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer789": {
        "type": "monomer",
        "id": "789",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer790": {
        "type": "monomer",
        "id": "790",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer791": {
        "type": "monomer",
        "id": "791",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer792": {
        "type": "monomer",
        "id": "792",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer793": {
        "type": "monomer",
        "id": "793",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer794": {
        "type": "monomer",
        "id": "794",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer795": {
        "type": "monomer",
        "id": "795",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer796": {
        "type": "monomer",
        "id": "796",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer797": {
        "type": "monomer",
        "id": "797",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer798": {
        "type": "monomer",
        "id": "798",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer799": {
        "type": "monomer",
        "id": "799",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer800": {
        "type": "monomer",
        "id": "800",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer801": {
        "type": "monomer",
        "id": "801",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer802": {
        "type": "monomer",
        "id": "802",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer803": {
        "type": "monomer",
        "id": "803",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer804": {
        "type": "monomer",
        "id": "804",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer805": {
        "type": "monomer",
        "id": "805",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer806": {
        "type": "monomer",
        "id": "806",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer807": {
        "type": "monomer",
        "id": "807",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer808": {
        "type": "monomer",
        "id": "808",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer809": {
        "type": "monomer",
        "id": "809",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer810": {
        "type": "monomer",
        "id": "810",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer811": {
        "type": "monomer",
        "id": "811",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer812": {
        "type": "monomer",
        "id": "812",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer813": {
        "type": "monomer",
        "id": "813",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer814": {
        "type": "monomer",
        "id": "814",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer815": {
        "type": "monomer",
        "id": "815",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer816": {
        "type": "monomer",
        "id": "816",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer817": {
        "type": "monomer",
        "id": "817",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer818": {
        "type": "monomer",
        "id": "818",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer819": {
        "type": "monomer",
        "id": "819",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer820": {
        "type": "monomer",
        "id": "820",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer821": {
        "type": "monomer",
        "id": "821",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer822": {
        "type": "monomer",
        "id": "822",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer823": {
        "type": "monomer",
        "id": "823",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer824": {
        "type": "monomer",
        "id": "824",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer825": {
        "type": "monomer",
        "id": "825",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer826": {
        "type": "monomer",
        "id": "826",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer827": {
        "type": "monomer",
        "id": "827",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer828": {
        "type": "monomer",
        "id": "828",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer829": {
        "type": "monomer",
        "id": "829",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer830": {
        "type": "monomer",
        "id": "830",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer831": {
        "type": "monomer",
        "id": "831",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer832": {
        "type": "monomer",
        "id": "832",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer833": {
        "type": "monomer",
        "id": "833",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer834": {
        "type": "monomer",
        "id": "834",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer835": {
        "type": "monomer",
        "id": "835",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer836": {
        "type": "monomer",
        "id": "836",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer837": {
        "type": "monomer",
        "id": "837",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer838": {
        "type": "monomer",
        "id": "838",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer839": {
        "type": "monomer",
        "id": "839",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer840": {
        "type": "monomer",
        "id": "840",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer841": {
        "type": "monomer",
        "id": "841",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer842": {
        "type": "monomer",
        "id": "842",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer843": {
        "type": "monomer",
        "id": "843",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer844": {
        "type": "monomer",
        "id": "844",
        "position": {
            "x": 23.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer845": {
        "type": "monomer",
        "id": "845",
        "position": {
            "x": 25.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer846": {
        "type": "monomer",
        "id": "846",
        "position": {
            "x": 26.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer847": {
        "type": "monomer",
        "id": "847",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer848": {
        "type": "monomer",
        "id": "848",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer849": {
        "type": "monomer",
        "id": "849",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer850": {
        "type": "monomer",
        "id": "850",
        "position": {
            "x": 10.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer851": {
        "type": "monomer",
        "id": "851",
        "position": {
            "x": 11.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer852": {
        "type": "monomer",
        "id": "852",
        "position": {
            "x": 13.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer853": {
        "type": "monomer",
        "id": "853",
        "position": {
            "x": 14.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer854": {
        "type": "monomer",
        "id": "854",
        "position": {
            "x": 16.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer855": {
        "type": "monomer",
        "id": "855",
        "position": {
            "x": 17.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer856": {
        "type": "monomer",
        "id": "856",
        "position": {
            "x": 19.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer857": {
        "type": "monomer",
        "id": "857",
        "position": {
            "x": 20.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer858": {
        "type": "monomer",
        "id": "858",
        "position": {
            "x": 22.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer859": {
        "type": "monomer",
        "id": "859",
        "position": {
            "x": 23.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer860": {
        "type": "monomer",
        "id": "860",
        "position": {
            "x": 25.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer861": {
        "type": "monomer",
        "id": "861",
        "position": {
            "x": 26.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer862": {
        "type": "monomer",
        "id": "862",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer863": {
        "type": "monomer",
        "id": "863",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer864": {
        "type": "monomer",
        "id": "864",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer865": {
        "type": "monomer",
        "id": "865",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer866": {
        "type": "monomer",
        "id": "866",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer867": {
        "type": "monomer",
        "id": "867",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer868": {
        "type": "monomer",
        "id": "868",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer869": {
        "type": "monomer",
        "id": "869",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer870": {
        "type": "monomer",
        "id": "870",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer871": {
        "type": "monomer",
        "id": "871",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer872": {
        "type": "monomer",
        "id": "872",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer873": {
        "type": "monomer",
        "id": "873",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer874": {
        "type": "monomer",
        "id": "874",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer875": {
        "type": "monomer",
        "id": "875",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer876": {
        "type": "monomer",
        "id": "876",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer877": {
        "type": "monomer",
        "id": "877",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer878": {
        "type": "monomer",
        "id": "878",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer879": {
        "type": "monomer",
        "id": "879",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer880": {
        "type": "monomer",
        "id": "880",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer881": {
        "type": "monomer",
        "id": "881",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer882": {
        "type": "monomer",
        "id": "882",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer883": {
        "type": "monomer",
        "id": "883",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer884": {
        "type": "monomer",
        "id": "884",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer885": {
        "type": "monomer",
        "id": "885",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer886": {
        "type": "monomer",
        "id": "886",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer887": {
        "type": "monomer",
        "id": "887",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer888": {
        "type": "monomer",
        "id": "888",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer889": {
        "type": "monomer",
        "id": "889",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer890": {
        "type": "monomer",
        "id": "890",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer891": {
        "type": "monomer",
        "id": "891",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer892": {
        "type": "monomer",
        "id": "892",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer893": {
        "type": "monomer",
        "id": "893",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer894": {
        "type": "monomer",
        "id": "894",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer895": {
        "type": "monomer",
        "id": "895",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer896": {
        "type": "monomer",
        "id": "896",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer897": {
        "type": "monomer",
        "id": "897",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer898": {
        "type": "monomer",
        "id": "898",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer899": {
        "type": "monomer",
        "id": "899",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer900": {
        "type": "monomer",
        "id": "900",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer901": {
        "type": "monomer",
        "id": "901",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer902": {
        "type": "monomer",
        "id": "902",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer903": {
        "type": "monomer",
        "id": "903",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer904": {
        "type": "monomer",
        "id": "904",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer905": {
        "type": "monomer",
        "id": "905",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer906": {
        "type": "monomer",
        "id": "906",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer907": {
        "type": "monomer",
        "id": "907",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer908": {
        "type": "monomer",
        "id": "908",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer909": {
        "type": "monomer",
        "id": "909",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer910": {
        "type": "monomer",
        "id": "910",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer911": {
        "type": "monomer",
        "id": "911",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer912": {
        "type": "monomer",
        "id": "912",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer913": {
        "type": "monomer",
        "id": "913",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer914": {
        "type": "monomer",
        "id": "914",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer915": {
        "type": "monomer",
        "id": "915",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer916": {
        "type": "monomer",
        "id": "916",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer917": {
        "type": "monomer",
        "id": "917",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer918": {
        "type": "monomer",
        "id": "918",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer919": {
        "type": "monomer",
        "id": "919",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer920": {
        "type": "monomer",
        "id": "920",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer921": {
        "type": "monomer",
        "id": "921",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer922": {
        "type": "monomer",
        "id": "922",
        "position": {
            "x": 10.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer923": {
        "type": "monomer",
        "id": "923",
        "position": {
            "x": 11.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer924": {
        "type": "monomer",
        "id": "924",
        "position": {
            "x": 13.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer925": {
        "type": "monomer",
        "id": "925",
        "position": {
            "x": 14.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer926": {
        "type": "monomer",
        "id": "926",
        "position": {
            "x": 16.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer927": {
        "type": "monomer",
        "id": "927",
        "position": {
            "x": 17.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer928": {
        "type": "monomer",
        "id": "928",
        "position": {
            "x": 19.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer929": {
        "type": "monomer",
        "id": "929",
        "position": {
            "x": 20.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer930": {
        "type": "monomer",
        "id": "930",
        "position": {
            "x": 22.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer931": {
        "type": "monomer",
        "id": "931",
        "position": {
            "x": 23.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer932": {
        "type": "monomer",
        "id": "932",
        "position": {
            "x": 25.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer933": {
        "type": "monomer",
        "id": "933",
        "position": {
            "x": 26.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer934": {
        "type": "monomer",
        "id": "934",
        "position": {
            "x": 1.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer935": {
        "type": "monomer",
        "id": "935",
        "position": {
            "x": 2.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer936": {
        "type": "monomer",
        "id": "936",
        "position": {
            "x": 4.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer937": {
        "type": "monomer",
        "id": "937",
        "position": {
            "x": 5.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer938": {
        "type": "monomer",
        "id": "938",
        "position": {
            "x": 7.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer939": {
        "type": "monomer",
        "id": "939",
        "position": {
            "x": 8.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer940": {
        "type": "monomer",
        "id": "940",
        "position": {
            "x": 10.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer941": {
        "type": "monomer",
        "id": "941",
        "position": {
            "x": 11.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer942": {
        "type": "monomer",
        "id": "942",
        "position": {
            "x": 13.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer943": {
        "type": "monomer",
        "id": "943",
        "position": {
            "x": 14.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer944": {
        "type": "monomer",
        "id": "944",
        "position": {
            "x": 16.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer945": {
        "type": "monomer",
        "id": "945",
        "position": {
            "x": 17.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer946": {
        "type": "monomer",
        "id": "946",
        "position": {
            "x": 19.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer947": {
        "type": "monomer",
        "id": "947",
        "position": {
            "x": 20.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer948": {
        "type": "monomer",
        "id": "948",
        "position": {
            "x": 22.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer949": {
        "type": "monomer",
        "id": "949",
        "position": {
            "x": 23.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer950": {
        "type": "monomer",
        "id": "950",
        "position": {
            "x": 25.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer951": {
        "type": "monomer",
        "id": "951",
        "position": {
            "x": 26.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer952": {
        "type": "monomer",
        "id": "952",
        "position": {
            "x": 1.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer953": {
        "type": "monomer",
        "id": "953",
        "position": {
            "x": 2.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer954": {
        "type": "monomer",
        "id": "954",
        "position": {
            "x": 4.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer955": {
        "type": "monomer",
        "id": "955",
        "position": {
            "x": 5.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer956": {
        "type": "monomer",
        "id": "956",
        "position": {
            "x": 7.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer957": {
        "type": "monomer",
        "id": "957",
        "position": {
            "x": 8.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer958": {
        "type": "monomer",
        "id": "958",
        "position": {
            "x": 10.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer959": {
        "type": "monomer",
        "id": "959",
        "position": {
            "x": 11.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer960": {
        "type": "monomer",
        "id": "960",
        "position": {
            "x": 13.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer961": {
        "type": "monomer",
        "id": "961",
        "position": {
            "x": 14.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer962": {
        "type": "monomer",
        "id": "962",
        "position": {
            "x": 16.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer963": {
        "type": "monomer",
        "id": "963",
        "position": {
            "x": 17.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer964": {
        "type": "monomer",
        "id": "964",
        "position": {
            "x": 19.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer965": {
        "type": "monomer",
        "id": "965",
        "position": {
            "x": 20.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer966": {
        "type": "monomer",
        "id": "966",
        "position": {
            "x": 22.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer967": {
        "type": "monomer",
        "id": "967",
        "position": {
            "x": 1.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer968": {
        "type": "monomer",
        "id": "968",
        "position": {
            "x": 2.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer969": {
        "type": "monomer",
        "id": "969",
        "position": {
            "x": 4.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer970": {
        "type": "monomer",
        "id": "970",
        "position": {
            "x": 5.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer971": {
        "type": "monomer",
        "id": "971",
        "position": {
            "x": 7.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer972": {
        "type": "monomer",
        "id": "972",
        "position": {
            "x": 8.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer973": {
        "type": "monomer",
        "id": "973",
        "position": {
            "x": 10.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer974": {
        "type": "monomer",
        "id": "974",
        "position": {
            "x": 11.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer975": {
        "type": "monomer",
        "id": "975",
        "position": {
            "x": 13.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer976": {
        "type": "monomer",
        "id": "976",
        "position": {
            "x": 14.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer977": {
        "type": "monomer",
        "id": "977",
        "position": {
            "x": 16.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer978": {
        "type": "monomer",
        "id": "978",
        "position": {
            "x": 17.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer979": {
        "type": "monomer",
        "id": "979",
        "position": {
            "x": 19.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer980": {
        "type": "monomer",
        "id": "980",
        "position": {
            "x": 20.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer981": {
        "type": "monomer",
        "id": "981",
        "position": {
            "x": 22.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer982": {
        "type": "monomer",
        "id": "982",
        "position": {
            "x": 23.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer983": {
        "type": "monomer",
        "id": "983",
        "position": {
            "x": 25.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer984": {
        "type": "monomer",
        "id": "984",
        "position": {
            "x": 26.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer985": {
        "type": "monomer",
        "id": "985",
        "position": {
            "x": 1.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer986": {
        "type": "monomer",
        "id": "986",
        "position": {
            "x": 2.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer987": {
        "type": "monomer",
        "id": "987",
        "position": {
            "x": 4.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer988": {
        "type": "monomer",
        "id": "988",
        "position": {
            "x": 5.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer989": {
        "type": "monomer",
        "id": "989",
        "position": {
            "x": 7.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer990": {
        "type": "monomer",
        "id": "990",
        "position": {
            "x": 8.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer991": {
        "type": "monomer",
        "id": "991",
        "position": {
            "x": 10.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer992": {
        "type": "monomer",
        "id": "992",
        "position": {
            "x": 11.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer993": {
        "type": "monomer",
        "id": "993",
        "position": {
            "x": 13.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer994": {
        "type": "monomer",
        "id": "994",
        "position": {
            "x": 14.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer995": {
        "type": "monomer",
        "id": "995",
        "position": {
            "x": 16.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer996": {
        "type": "monomer",
        "id": "996",
        "position": {
            "x": 17.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer997": {
        "type": "monomer",
        "id": "997",
        "position": {
            "x": 19.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer998": {
        "type": "monomer",
        "id": "998",
        "position": {
            "x": 20.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer999": {
        "type": "monomer",
        "id": "999",
        "position": {
            "x": 22.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1000": {
        "type": "monomer",
        "id": "1000",
        "position": {
            "x": 23.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1001": {
        "type": "monomer",
        "id": "1001",
        "position": {
            "x": 25.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1002": {
        "type": "monomer",
        "id": "1002",
        "position": {
            "x": 26.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1003": {
        "type": "monomer",
        "id": "1003",
        "position": {
            "x": 1.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1004": {
        "type": "monomer",
        "id": "1004",
        "position": {
            "x": 2.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1005": {
        "type": "monomer",
        "id": "1005",
        "position": {
            "x": 4.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1006": {
        "type": "monomer",
        "id": "1006",
        "position": {
            "x": 5.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1007": {
        "type": "monomer",
        "id": "1007",
        "position": {
            "x": 7.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1008": {
        "type": "monomer",
        "id": "1008",
        "position": {
            "x": 8.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1009": {
        "type": "monomer",
        "id": "1009",
        "position": {
            "x": 10.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1010": {
        "type": "monomer",
        "id": "1010",
        "position": {
            "x": 11.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1011": {
        "type": "monomer",
        "id": "1011",
        "position": {
            "x": 13.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1012": {
        "type": "monomer",
        "id": "1012",
        "position": {
            "x": 14.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1013": {
        "type": "monomer",
        "id": "1013",
        "position": {
            "x": 16.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1014": {
        "type": "monomer",
        "id": "1014",
        "position": {
            "x": 17.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1015": {
        "type": "monomer",
        "id": "1015",
        "position": {
            "x": 19.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1016": {
        "type": "monomer",
        "id": "1016",
        "position": {
            "x": 20.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1017": {
        "type": "monomer",
        "id": "1017",
        "position": {
            "x": 22.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1018": {
        "type": "monomer",
        "id": "1018",
        "position": {
            "x": 23.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1019": {
        "type": "monomer",
        "id": "1019",
        "position": {
            "x": 25.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1020": {
        "type": "monomer",
        "id": "1020",
        "position": {
            "x": 26.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1021": {
        "type": "monomer",
        "id": "1021",
        "position": {
            "x": 1.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1022": {
        "type": "monomer",
        "id": "1022",
        "position": {
            "x": 2.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1023": {
        "type": "monomer",
        "id": "1023",
        "position": {
            "x": 4.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1024": {
        "type": "monomer",
        "id": "1024",
        "position": {
            "x": 5.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1025": {
        "type": "monomer",
        "id": "1025",
        "position": {
            "x": 7.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1026": {
        "type": "monomer",
        "id": "1026",
        "position": {
            "x": 8.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1027": {
        "type": "monomer",
        "id": "1027",
        "position": {
            "x": 10.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1028": {
        "type": "monomer",
        "id": "1028",
        "position": {
            "x": 11.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1029": {
        "type": "monomer",
        "id": "1029",
        "position": {
            "x": 13.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1030": {
        "type": "monomer",
        "id": "1030",
        "position": {
            "x": 14.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1031": {
        "type": "monomer",
        "id": "1031",
        "position": {
            "x": 16.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1032": {
        "type": "monomer",
        "id": "1032",
        "position": {
            "x": 17.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1033": {
        "type": "monomer",
        "id": "1033",
        "position": {
            "x": 19.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1034": {
        "type": "monomer",
        "id": "1034",
        "position": {
            "x": 20.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1035": {
        "type": "monomer",
        "id": "1035",
        "position": {
            "x": 22.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1036": {
        "type": "monomer",
        "id": "1036",
        "position": {
            "x": 23.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1037": {
        "type": "monomer",
        "id": "1037",
        "position": {
            "x": 25.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1038": {
        "type": "monomer",
        "id": "1038",
        "position": {
            "x": 26.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1039": {
        "type": "monomer",
        "id": "1039",
        "position": {
            "x": 1.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1040": {
        "type": "monomer",
        "id": "1040",
        "position": {
            "x": 2.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1041": {
        "type": "monomer",
        "id": "1041",
        "position": {
            "x": 4.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1042": {
        "type": "monomer",
        "id": "1042",
        "position": {
            "x": 5.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1043": {
        "type": "monomer",
        "id": "1043",
        "position": {
            "x": 7.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1044": {
        "type": "monomer",
        "id": "1044",
        "position": {
            "x": 8.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1045": {
        "type": "monomer",
        "id": "1045",
        "position": {
            "x": 10.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1046": {
        "type": "monomer",
        "id": "1046",
        "position": {
            "x": 11.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1047": {
        "type": "monomer",
        "id": "1047",
        "position": {
            "x": 13.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1048": {
        "type": "monomer",
        "id": "1048",
        "position": {
            "x": 14.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1049": {
        "type": "monomer",
        "id": "1049",
        "position": {
            "x": 16.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1050": {
        "type": "monomer",
        "id": "1050",
        "position": {
            "x": 17.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1051": {
        "type": "monomer",
        "id": "1051",
        "position": {
            "x": 19.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1052": {
        "type": "monomer",
        "id": "1052",
        "position": {
            "x": 20.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1053": {
        "type": "monomer",
        "id": "1053",
        "position": {
            "x": 22.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1054": {
        "type": "monomer",
        "id": "1054",
        "position": {
            "x": 23.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1055": {
        "type": "monomer",
        "id": "1055",
        "position": {
            "x": 25.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1056": {
        "type": "monomer",
        "id": "1056",
        "position": {
            "x": 26.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1057": {
        "type": "monomer",
        "id": "1057",
        "position": {
            "x": 1.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1058": {
        "type": "monomer",
        "id": "1058",
        "position": {
            "x": 2.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1059": {
        "type": "monomer",
        "id": "1059",
        "position": {
            "x": 4.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1060": {
        "type": "monomer",
        "id": "1060",
        "position": {
            "x": 5.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1061": {
        "type": "monomer",
        "id": "1061",
        "position": {
            "x": 7.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1062": {
        "type": "monomer",
        "id": "1062",
        "position": {
            "x": 8.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1063": {
        "type": "monomer",
        "id": "1063",
        "position": {
            "x": 10.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1064": {
        "type": "monomer",
        "id": "1064",
        "position": {
            "x": 11.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1065": {
        "type": "monomer",
        "id": "1065",
        "position": {
            "x": 13.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1066": {
        "type": "monomer",
        "id": "1066",
        "position": {
            "x": 14.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1067": {
        "type": "monomer",
        "id": "1067",
        "position": {
            "x": 16.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1068": {
        "type": "monomer",
        "id": "1068",
        "position": {
            "x": 17.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1069": {
        "type": "monomer",
        "id": "1069",
        "position": {
            "x": 19.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1070": {
        "type": "monomer",
        "id": "1070",
        "position": {
            "x": 20.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1071": {
        "type": "monomer",
        "id": "1071",
        "position": {
            "x": 22.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1072": {
        "type": "monomer",
        "id": "1072",
        "position": {
            "x": 23.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1073": {
        "type": "monomer",
        "id": "1073",
        "position": {
            "x": 25.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1074": {
        "type": "monomer",
        "id": "1074",
        "position": {
            "x": 26.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1075": {
        "type": "monomer",
        "id": "1075",
        "position": {
            "x": 1.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1076": {
        "type": "monomer",
        "id": "1076",
        "position": {
            "x": 2.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1077": {
        "type": "monomer",
        "id": "1077",
        "position": {
            "x": 4.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1078": {
        "type": "monomer",
        "id": "1078",
        "position": {
            "x": 5.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1079": {
        "type": "monomer",
        "id": "1079",
        "position": {
            "x": 7.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1080": {
        "type": "monomer",
        "id": "1080",
        "position": {
            "x": 8.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1081": {
        "type": "monomer",
        "id": "1081",
        "position": {
            "x": 10.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1082": {
        "type": "monomer",
        "id": "1082",
        "position": {
            "x": 11.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1083": {
        "type": "monomer",
        "id": "1083",
        "position": {
            "x": 13.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1084": {
        "type": "monomer",
        "id": "1084",
        "position": {
            "x": 14.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1085": {
        "type": "monomer",
        "id": "1085",
        "position": {
            "x": 16.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1086": {
        "type": "monomer",
        "id": "1086",
        "position": {
            "x": 17.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1087": {
        "type": "monomer",
        "id": "1087",
        "position": {
            "x": 19.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1088": {
        "type": "monomer",
        "id": "1088",
        "position": {
            "x": 20.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1089": {
        "type": "monomer",
        "id": "1089",
        "position": {
            "x": 22.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1090": {
        "type": "monomer",
        "id": "1090",
        "position": {
            "x": 23.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1091": {
        "type": "monomer",
        "id": "1091",
        "position": {
            "x": 25.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1092": {
        "type": "monomer",
        "id": "1092",
        "position": {
            "x": 26.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1093": {
        "type": "monomer",
        "id": "1093",
        "position": {
            "x": 1.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1094": {
        "type": "monomer",
        "id": "1094",
        "position": {
            "x": 2.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1095": {
        "type": "monomer",
        "id": "1095",
        "position": {
            "x": 4.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1096": {
        "type": "monomer",
        "id": "1096",
        "position": {
            "x": 5.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1097": {
        "type": "monomer",
        "id": "1097",
        "position": {
            "x": 7.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1098": {
        "type": "monomer",
        "id": "1098",
        "position": {
            "x": 8.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1099": {
        "type": "monomer",
        "id": "1099",
        "position": {
            "x": 10.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1100": {
        "type": "monomer",
        "id": "1100",
        "position": {
            "x": 11.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1101": {
        "type": "monomer",
        "id": "1101",
        "position": {
            "x": 13.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1102": {
        "type": "monomer",
        "id": "1102",
        "position": {
            "x": 14.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1103": {
        "type": "monomer",
        "id": "1103",
        "position": {
            "x": 16.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1104": {
        "type": "monomer",
        "id": "1104",
        "position": {
            "x": 17.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1105": {
        "type": "monomer",
        "id": "1105",
        "position": {
            "x": 19.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1106": {
        "type": "monomer",
        "id": "1106",
        "position": {
            "x": 20.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1107": {
        "type": "monomer",
        "id": "1107",
        "position": {
            "x": 22.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1108": {
        "type": "monomer",
        "id": "1108",
        "position": {
            "x": 23.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1109": {
        "type": "monomer",
        "id": "1109",
        "position": {
            "x": 25.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1110": {
        "type": "monomer",
        "id": "1110",
        "position": {
            "x": 26.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1111": {
        "type": "monomer",
        "id": "1111",
        "position": {
            "x": 1.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1112": {
        "type": "monomer",
        "id": "1112",
        "position": {
            "x": 2.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1113": {
        "type": "monomer",
        "id": "1113",
        "position": {
            "x": 4.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1114": {
        "type": "monomer",
        "id": "1114",
        "position": {
            "x": 5.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1115": {
        "type": "monomer",
        "id": "1115",
        "position": {
            "x": 7.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1116": {
        "type": "monomer",
        "id": "1116",
        "position": {
            "x": 8.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1117": {
        "type": "monomer",
        "id": "1117",
        "position": {
            "x": 10.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1118": {
        "type": "monomer",
        "id": "1118",
        "position": {
            "x": 11.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1119": {
        "type": "monomer",
        "id": "1119",
        "position": {
            "x": 13.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1120": {
        "type": "monomer",
        "id": "1120",
        "position": {
            "x": 14.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1121": {
        "type": "monomer",
        "id": "1121",
        "position": {
            "x": 16.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1122": {
        "type": "monomer",
        "id": "1122",
        "position": {
            "x": 17.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1123": {
        "type": "monomer",
        "id": "1123",
        "position": {
            "x": 19.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1124": {
        "type": "monomer",
        "id": "1124",
        "position": {
            "x": 20.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1125": {
        "type": "monomer",
        "id": "1125",
        "position": {
            "x": 22.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1126": {
        "type": "monomer",
        "id": "1126",
        "position": {
            "x": 23.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1127": {
        "type": "monomer",
        "id": "1127",
        "position": {
            "x": 25.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1128": {
        "type": "monomer",
        "id": "1128",
        "position": {
            "x": 26.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1129": {
        "type": "monomer",
        "id": "1129",
        "position": {
            "x": 1.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1130": {
        "type": "monomer",
        "id": "1130",
        "position": {
            "x": 2.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1131": {
        "type": "monomer",
        "id": "1131",
        "position": {
            "x": 4.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1132": {
        "type": "monomer",
        "id": "1132",
        "position": {
            "x": 5.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1133": {
        "type": "monomer",
        "id": "1133",
        "position": {
            "x": 7.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1134": {
        "type": "monomer",
        "id": "1134",
        "position": {
            "x": 8.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1135": {
        "type": "monomer",
        "id": "1135",
        "position": {
            "x": 10.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1136": {
        "type": "monomer",
        "id": "1136",
        "position": {
            "x": 11.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1137": {
        "type": "monomer",
        "id": "1137",
        "position": {
            "x": 13.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1138": {
        "type": "monomer",
        "id": "1138",
        "position": {
            "x": 14.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1139": {
        "type": "monomer",
        "id": "1139",
        "position": {
            "x": 16.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1140": {
        "type": "monomer",
        "id": "1140",
        "position": {
            "x": 17.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1141": {
        "type": "monomer",
        "id": "1141",
        "position": {
            "x": 19.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1142": {
        "type": "monomer",
        "id": "1142",
        "position": {
            "x": 20.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1143": {
        "type": "monomer",
        "id": "1143",
        "position": {
            "x": 22.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1144": {
        "type": "monomer",
        "id": "1144",
        "position": {
            "x": 23.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1145": {
        "type": "monomer",
        "id": "1145",
        "position": {
            "x": 25.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1146": {
        "type": "monomer",
        "id": "1146",
        "position": {
            "x": 26.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1147": {
        "type": "monomer",
        "id": "1147",
        "position": {
            "x": 1.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1148": {
        "type": "monomer",
        "id": "1148",
        "position": {
            "x": 2.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1149": {
        "type": "monomer",
        "id": "1149",
        "position": {
            "x": 4.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1150": {
        "type": "monomer",
        "id": "1150",
        "position": {
            "x": 5.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1151": {
        "type": "monomer",
        "id": "1151",
        "position": {
            "x": 7.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1152": {
        "type": "monomer",
        "id": "1152",
        "position": {
            "x": 8.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1153": {
        "type": "monomer",
        "id": "1153",
        "position": {
            "x": 10.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1154": {
        "type": "monomer",
        "id": "1154",
        "position": {
            "x": 11.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1155": {
        "type": "monomer",
        "id": "1155",
        "position": {
            "x": 13.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1156": {
        "type": "monomer",
        "id": "1156",
        "position": {
            "x": 14.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1157": {
        "type": "monomer",
        "id": "1157",
        "position": {
            "x": 16.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1158": {
        "type": "monomer",
        "id": "1158",
        "position": {
            "x": 17.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1159": {
        "type": "monomer",
        "id": "1159",
        "position": {
            "x": 19.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1160": {
        "type": "monomer",
        "id": "1160",
        "position": {
            "x": 20.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1161": {
        "type": "monomer",
        "id": "1161",
        "position": {
            "x": 22.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1162": {
        "type": "monomer",
        "id": "1162",
        "position": {
            "x": 23.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1163": {
        "type": "monomer",
        "id": "1163",
        "position": {
            "x": 25.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1164": {
        "type": "monomer",
        "id": "1164",
        "position": {
            "x": 26.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1165": {
        "type": "monomer",
        "id": "1165",
        "position": {
            "x": 1.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1166": {
        "type": "monomer",
        "id": "1166",
        "position": {
            "x": 2.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1167": {
        "type": "monomer",
        "id": "1167",
        "position": {
            "x": 4.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1168": {
        "type": "monomer",
        "id": "1168",
        "position": {
            "x": 5.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1169": {
        "type": "monomer",
        "id": "1169",
        "position": {
            "x": 7.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1170": {
        "type": "monomer",
        "id": "1170",
        "position": {
            "x": 8.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1171": {
        "type": "monomer",
        "id": "1171",
        "position": {
            "x": 10.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1172": {
        "type": "monomer",
        "id": "1172",
        "position": {
            "x": 11.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1173": {
        "type": "monomer",
        "id": "1173",
        "position": {
            "x": 13.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1174": {
        "type": "monomer",
        "id": "1174",
        "position": {
            "x": 14.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1175": {
        "type": "monomer",
        "id": "1175",
        "position": {
            "x": 16.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1176": {
        "type": "monomer",
        "id": "1176",
        "position": {
            "x": 17.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1576": {
        "type": "monomer",
        "id": "1576",
        "position": {
            "x": 1.25,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomerTemplate-R___Ribose": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "O",
                "location": [
                    -0.7870668737745955,
                    -0.7617767155358548,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.4212883139374412,
                    0.2454717053907153,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    0.05779587009926911,
                    -1.4208925344924144,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    0.6497570315857263,
                    0.20889384940699984,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    0.9458090534539231,
                    -0.821072849259456,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "O",
                "location": [
                    1.306300970043431,
                    1.0541137989057054,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    1.7515935019701854,
                    -1.1136956971291794,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -1.022322498294859,
                    1.131198772746387,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    0.028505008862309486,
                    -2.2776145051109995,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    -2.091724697943758,
                    1.0541137989057054,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -2.573094997979451,
                    1.7634527287149055,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    2.1556645047902916,
                    0.9376647652075489,
                    0
                ]
            }
        ],
        "bonds": [
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
                    2
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    3
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    7
                ],
                "stereo": 6
            },
            {
                "type": 1,
                "atoms": [
                    2,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    2,
                    8
                ],
                "stereo": 6
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    5
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    6
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    5,
                    11
                ]
            },
            {
                "type": 1,
                "atoms": [
                    7,
                    9
                ]
            },
            {
                "type": 1,
                "atoms": [
                    9,
                    10
                ]
            }
        ],
        "class": "Sugar",
        "classHELM": "RNA",
        "id": "R___Ribose",
        "fullName": "Ribose",
        "alias": "R",
        "attachmentPoints": [
            {
                "attachmentAtom": 9,
                "leavingGroup": {
                    "atoms": [
                        10
                    ]
                },
                "type": "left"
            },
            {
                "attachmentAtom": 5,
                "leavingGroup": {
                    "atoms": [
                        11
                    ]
                },
                "type": "right"
            },
            {
                "attachmentAtom": 2,
                "leavingGroup": {
                    "atoms": [
                        8
                    ]
                },
                "type": "side"
            }
        ],
        "naturalAnalogShort": "R"
    },
    "monomer1577": {
        "type": "monomer",
        "id": "1577",
        "position": {
            "x": 1.25,
            "y": -35.8415
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomerTemplate-A___Adenine": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "C",
                "location": [
                    1.0354,
                    0.2498,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.0792,
                    -0.754,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -1.5057,
                    -0.2906,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -1.8177,
                    1.1766,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.7031,
                    2.1804,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    0.7235,
                    1.717,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -2.3871,
                    -1.5034,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -1.5053,
                    -2.7168,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -0.0787,
                    -2.2532,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    2.1768,
                    -0.1209,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -3.5871,
                    -1.5034,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 1,
                "atoms": [
                    0,
                    9
                ]
            },
            {
                "type": 2,
                "atoms": [
                    0,
                    5
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
                    8,
                    1
                ]
            },
            {
                "type": 2,
                "atoms": [
                    1,
                    2
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    2
                ]
            },
            {
                "type": 1,
                "atoms": [
                    2,
                    3
                ]
            },
            {
                "type": 2,
                "atoms": [
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    5
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    10
                ]
            },
            {
                "type": 2,
                "atoms": [
                    7,
                    8
                ]
            }
        ],
        "class": "Base",
        "classHELM": "RNA",
        "id": "A___Adenine",
        "fullName": "Adenine",
        "alias": "A",
        "attachmentPoints": [
            {
                "attachmentAtom": 6,
                "leavingGroup": {
                    "atoms": [
                        10
                    ]
                },
                "type": "left"
            }
        ],
        "naturalAnalogShort": "A"
    },
    "monomer1581": {
        "type": "monomer",
        "id": "1581",
        "position": {
            "x": 3.85,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1582": {
        "type": "monomer",
        "id": "1582",
        "position": {
            "x": 3.85,
            "y": -35.8415
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomerTemplate-T___Thymine": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "C",
                "location": [
                    1.8617,
                    1.3499,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    1.1117,
                    0.0509,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.3883,
                    0.0509,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -1.1382,
                    1.35,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.3882,
                    2.649,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    1.1117,
                    2.6489,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    3.0618,
                    1.3499,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    -0.9882,
                    3.6882,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -2.3383,
                    1.35,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    1.7117,
                    -0.9884,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    0,
                    6
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    5
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
                "type": 2,
                "atoms": [
                    1,
                    2
                ]
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
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    8
                ]
            },
            {
                "type": 2,
                "atoms": [
                    4,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    5
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    9
                ]
            }
        ],
        "class": "Base",
        "classHELM": "RNA",
        "id": "T___Thymine",
        "fullName": "Thymine",
        "alias": "T",
        "attachmentPoints": [
            {
                "attachmentAtom": 3,
                "leavingGroup": {
                    "atoms": [
                        8
                    ]
                },
                "type": "left"
            }
        ],
        "naturalAnalogShort": "T"
    },
    "monomer1584": {
        "type": "monomer",
        "id": "1584",
        "position": {
            "x": 2.5187500000000003,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomerTemplate-P___Phosphate": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "P",
                "location": [
                    -0.19991692871090108,
                    0,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    -1.1999182394782262,
                    0,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    0.29983372634506966,
                    -0.8661678020096315,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    0.800084382056424,
                    0,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    0.29983372634506966,
                    0.8661678020096315,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 1,
                "atoms": [
                    0,
                    1
                ]
            },
            {
                "type": 2,
                "atoms": [
                    0,
                    2
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    3
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    4
                ]
            }
        ],
        "class": "Phosphate",
        "classHELM": "RNA",
        "id": "P___Phosphate",
        "fullName": "Phosphate",
        "alias": "P",
        "attachmentPoints": [
            {
                "attachmentAtom": 0,
                "leavingGroup": {
                    "atoms": [
                        1
                    ]
                },
                "type": "left"
            },
            {
                "attachmentAtom": 0,
                "leavingGroup": {
                    "atoms": [
                        3
                    ]
                },
                "type": "right"
            }
        ],
        "idtAliases": {
            "base": "Phos",
            "modifications": {
                "endpoint3": "3Phos",
                "endpoint5": "5Phos"
            }
        },
        "naturalAnalogShort": "P"
    },
    "monomer1589": {
        "type": "monomer",
        "id": "1589",
        "position": {
            "x": 6.45,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1590": {
        "type": "monomer",
        "id": "1590",
        "position": {
            "x": 6.45,
            "y": -35.8415
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1592": {
        "type": "monomer",
        "id": "1592",
        "position": {
            "x": 5.11875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1597": {
        "type": "monomer",
        "id": "1597",
        "position": {
            "x": 9.05,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1598": {
        "type": "monomer",
        "id": "1598",
        "position": {
            "x": 9.05,
            "y": -35.8415
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1600": {
        "type": "monomer",
        "id": "1600",
        "position": {
            "x": 7.71875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1605": {
        "type": "monomer",
        "id": "1605",
        "position": {
            "x": 11.65,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1606": {
        "type": "monomer",
        "id": "1606",
        "position": {
            "x": 11.65,
            "y": -35.8415
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1608": {
        "type": "monomer",
        "id": "1608",
        "position": {
            "x": 10.318750000000001,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1613": {
        "type": "monomer",
        "id": "1613",
        "position": {
            "x": 14.25,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1614": {
        "type": "monomer",
        "id": "1614",
        "position": {
            "x": 14.25,
            "y": -35.8415
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomerTemplate-U___Uracil": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "C",
                "location": [
                    1.8617,
                    1.3499,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    1.1117,
                    0.0509,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.3883,
                    0.0509,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    -1.1382,
                    1.35,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.3882,
                    2.649,
                    0
                ]
            },
            {
                "label": "N",
                "location": [
                    1.1117,
                    2.6489,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    3.0618,
                    1.3499,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    -0.9882,
                    3.6882,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -2.3383,
                    1.35,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    0,
                    6
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    5
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
                "type": 2,
                "atoms": [
                    1,
                    2
                ]
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
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    8
                ]
            },
            {
                "type": 2,
                "atoms": [
                    4,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    5
                ]
            }
        ],
        "class": "Base",
        "classHELM": "RNA",
        "id": "U___Uracil",
        "fullName": "Uracil",
        "alias": "U",
        "attachmentPoints": [
            {
                "attachmentAtom": 3,
                "leavingGroup": {
                    "atoms": [
                        8
                    ]
                },
                "type": "left"
            }
        ],
        "naturalAnalogShort": "U"
    },
    "monomer1616": {
        "type": "monomer",
        "id": "1616",
        "position": {
            "x": 12.918750000000001,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1621": {
        "type": "monomer",
        "id": "1621",
        "position": {
            "x": 16.85,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1622": {
        "type": "monomer",
        "id": "1622",
        "position": {
            "x": 16.85,
            "y": -35.8415
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1624": {
        "type": "monomer",
        "id": "1624",
        "position": {
            "x": 15.51875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1629": {
        "type": "monomer",
        "id": "1629",
        "position": {
            "x": 19.450000000000003,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1630": {
        "type": "monomer",
        "id": "1630",
        "position": {
            "x": 19.450000000000003,
            "y": -35.8415
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1632": {
        "type": "monomer",
        "id": "1632",
        "position": {
            "x": 18.118750000000002,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1637": {
        "type": "monomer",
        "id": "1637",
        "position": {
            "x": 22.05,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1638": {
        "type": "monomer",
        "id": "1638",
        "position": {
            "x": 22.05,
            "y": -35.8415
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1640": {
        "type": "monomer",
        "id": "1640",
        "position": {
            "x": 20.71875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1645": {
        "type": "monomer",
        "id": "1645",
        "position": {
            "x": 24.650000000000002,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1646": {
        "type": "monomer",
        "id": "1646",
        "position": {
            "x": 24.650000000000002,
            "y": -35.8415
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1648": {
        "type": "monomer",
        "id": "1648",
        "position": {
            "x": 23.31875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1653": {
        "type": "monomer",
        "id": "1653",
        "position": {
            "x": 27.25,
            "y": -34.525
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1654": {
        "type": "monomer",
        "id": "1654",
        "position": {
            "x": 27.25,
            "y": -35.8415
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1656": {
        "type": "monomer",
        "id": "1656",
        "position": {
            "x": 25.918750000000003,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1661": {
        "type": "monomer",
        "id": "1661",
        "position": {
            "x": 1.25,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1662": {
        "type": "monomer",
        "id": "1662",
        "position": {
            "x": 1.25,
            "y": -38.662000000000006
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1664": {
        "type": "monomer",
        "id": "1664",
        "position": {
            "x": 28.51875,
            "y": -34.525
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1669": {
        "type": "monomer",
        "id": "1669",
        "position": {
            "x": 3.85,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1670": {
        "type": "monomer",
        "id": "1670",
        "position": {
            "x": 3.85,
            "y": -38.662000000000006
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1672": {
        "type": "monomer",
        "id": "1672",
        "position": {
            "x": 2.5187500000000003,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1677": {
        "type": "monomer",
        "id": "1677",
        "position": {
            "x": 6.45,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1678": {
        "type": "monomer",
        "id": "1678",
        "position": {
            "x": 6.45,
            "y": -38.662000000000006
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1680": {
        "type": "monomer",
        "id": "1680",
        "position": {
            "x": 5.11875,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1685": {
        "type": "monomer",
        "id": "1685",
        "position": {
            "x": 9.05,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1686": {
        "type": "monomer",
        "id": "1686",
        "position": {
            "x": 9.05,
            "y": -38.662000000000006
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1688": {
        "type": "monomer",
        "id": "1688",
        "position": {
            "x": 7.71875,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1693": {
        "type": "monomer",
        "id": "1693",
        "position": {
            "x": 11.65,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1694": {
        "type": "monomer",
        "id": "1694",
        "position": {
            "x": 11.65,
            "y": -38.662000000000006
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1696": {
        "type": "monomer",
        "id": "1696",
        "position": {
            "x": 10.318750000000001,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1701": {
        "type": "monomer",
        "id": "1701",
        "position": {
            "x": 14.25,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1702": {
        "type": "monomer",
        "id": "1702",
        "position": {
            "x": 14.25,
            "y": -38.662000000000006
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1709": {
        "type": "monomer",
        "id": "1709",
        "position": {
            "x": 16.85,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1710": {
        "type": "monomer",
        "id": "1710",
        "position": {
            "x": 16.85,
            "y": -38.662000000000006
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1712": {
        "type": "monomer",
        "id": "1712",
        "position": {
            "x": 15.51875,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1717": {
        "type": "monomer",
        "id": "1717",
        "position": {
            "x": 19.450000000000003,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1718": {
        "type": "monomer",
        "id": "1718",
        "position": {
            "x": 19.450000000000003,
            "y": -38.662000000000006
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1720": {
        "type": "monomer",
        "id": "1720",
        "position": {
            "x": 18.118750000000002,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1725": {
        "type": "monomer",
        "id": "1725",
        "position": {
            "x": 22.05,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1726": {
        "type": "monomer",
        "id": "1726",
        "position": {
            "x": 22.05,
            "y": -38.662000000000006
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1728": {
        "type": "monomer",
        "id": "1728",
        "position": {
            "x": 20.71875,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1733": {
        "type": "monomer",
        "id": "1733",
        "position": {
            "x": 24.650000000000002,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1734": {
        "type": "monomer",
        "id": "1734",
        "position": {
            "x": 24.650000000000002,
            "y": -38.662000000000006
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1741": {
        "type": "monomer",
        "id": "1741",
        "position": {
            "x": 27.25,
            "y": -37.3455
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1742": {
        "type": "monomer",
        "id": "1742",
        "position": {
            "x": 27.25,
            "y": -38.662000000000006
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1744": {
        "type": "monomer",
        "id": "1744",
        "position": {
            "x": 25.918750000000003,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1749": {
        "type": "monomer",
        "id": "1749",
        "position": {
            "x": 1.25,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1750": {
        "type": "monomer",
        "id": "1750",
        "position": {
            "x": 1.25,
            "y": -41.4825
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1752": {
        "type": "monomer",
        "id": "1752",
        "position": {
            "x": 28.51875,
            "y": -37.3455
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1757": {
        "type": "monomer",
        "id": "1757",
        "position": {
            "x": 3.85,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1758": {
        "type": "monomer",
        "id": "1758",
        "position": {
            "x": 3.85,
            "y": -41.4825
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1760": {
        "type": "monomer",
        "id": "1760",
        "position": {
            "x": 2.5187500000000003,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1765": {
        "type": "monomer",
        "id": "1765",
        "position": {
            "x": 6.45,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1766": {
        "type": "monomer",
        "id": "1766",
        "position": {
            "x": 6.45,
            "y": -41.4825
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1768": {
        "type": "monomer",
        "id": "1768",
        "position": {
            "x": 5.11875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1773": {
        "type": "monomer",
        "id": "1773",
        "position": {
            "x": 9.05,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1774": {
        "type": "monomer",
        "id": "1774",
        "position": {
            "x": 9.05,
            "y": -41.4825
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1776": {
        "type": "monomer",
        "id": "1776",
        "position": {
            "x": 7.71875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1781": {
        "type": "monomer",
        "id": "1781",
        "position": {
            "x": 11.65,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1782": {
        "type": "monomer",
        "id": "1782",
        "position": {
            "x": 11.65,
            "y": -41.4825
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1784": {
        "type": "monomer",
        "id": "1784",
        "position": {
            "x": 10.318750000000001,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1789": {
        "type": "monomer",
        "id": "1789",
        "position": {
            "x": 14.25,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1790": {
        "type": "monomer",
        "id": "1790",
        "position": {
            "x": 14.25,
            "y": -41.4825
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1792": {
        "type": "monomer",
        "id": "1792",
        "position": {
            "x": 12.918750000000001,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1797": {
        "type": "monomer",
        "id": "1797",
        "position": {
            "x": 16.85,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1798": {
        "type": "monomer",
        "id": "1798",
        "position": {
            "x": 16.85,
            "y": -41.4825
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1800": {
        "type": "monomer",
        "id": "1800",
        "position": {
            "x": 15.51875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1805": {
        "type": "monomer",
        "id": "1805",
        "position": {
            "x": 19.450000000000003,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1806": {
        "type": "monomer",
        "id": "1806",
        "position": {
            "x": 19.450000000000003,
            "y": -41.4825
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1813": {
        "type": "monomer",
        "id": "1813",
        "position": {
            "x": 22.05,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1814": {
        "type": "monomer",
        "id": "1814",
        "position": {
            "x": 22.05,
            "y": -41.4825
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1816": {
        "type": "monomer",
        "id": "1816",
        "position": {
            "x": 20.71875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1821": {
        "type": "monomer",
        "id": "1821",
        "position": {
            "x": 24.650000000000002,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1822": {
        "type": "monomer",
        "id": "1822",
        "position": {
            "x": 24.650000000000002,
            "y": -41.4825
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1824": {
        "type": "monomer",
        "id": "1824",
        "position": {
            "x": 23.31875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1829": {
        "type": "monomer",
        "id": "1829",
        "position": {
            "x": 27.25,
            "y": -40.166
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1830": {
        "type": "monomer",
        "id": "1830",
        "position": {
            "x": 27.25,
            "y": -41.4825
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1832": {
        "type": "monomer",
        "id": "1832",
        "position": {
            "x": 25.918750000000003,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1837": {
        "type": "monomer",
        "id": "1837",
        "position": {
            "x": 1.25,
            "y": -42.9865
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1838": {
        "type": "monomer",
        "id": "1838",
        "position": {
            "x": 1.25,
            "y": -44.303
        },
        "alias": "U",
        "templateId": "U___Uracil"
    },
    "monomer1840": {
        "type": "monomer",
        "id": "1840",
        "position": {
            "x": 28.51875,
            "y": -40.166
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1845": {
        "type": "monomer",
        "id": "1845",
        "position": {
            "x": 3.85,
            "y": -42.9865
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1846": {
        "type": "monomer",
        "id": "1846",
        "position": {
            "x": 3.85,
            "y": -44.303
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1848": {
        "type": "monomer",
        "id": "1848",
        "position": {
            "x": 2.5187500000000003,
            "y": -42.9865
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1853": {
        "type": "monomer",
        "id": "1853",
        "position": {
            "x": 6.45,
            "y": -42.9865
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1854": {
        "type": "monomer",
        "id": "1854",
        "position": {
            "x": 6.45,
            "y": -44.303
        },
        "alias": "T",
        "templateId": "T___Thymine"
    },
    "monomer1856": {
        "type": "monomer",
        "id": "1856",
        "position": {
            "x": 5.11875,
            "y": -42.9865
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1861": {
        "type": "monomer",
        "id": "1861",
        "position": {
            "x": 9.05,
            "y": -42.9865
        },
        "alias": "R",
        "templateId": "R___Ribose"
    },
    "monomer1862": {
        "type": "monomer",
        "id": "1862",
        "position": {
            "x": 9.05,
            "y": -44.303
        },
        "alias": "A",
        "templateId": "A___Adenine"
    },
    "monomer1864": {
        "type": "monomer",
        "id": "1864",
        "position": {
            "x": 7.71875,
            "y": -42.9865
        },
        "alias": "P",
        "templateId": "P___Phosphate"
    },
    "monomer1870": {
        "type": "monomer",
        "id": "1870",
        "position": {
            "x": 12.918750000000001,
            "y": -37.3455
        },
        "alias": "Test-6-Ph",
        "templateId": "Test-6-Ph___Test-6-AP-Phosphate"
    },
    "monomerTemplate-Test-6-Ph___Test-6-AP-Phosphate": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "P",
                "location": [
                    8.524985275759063,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    9.024784412512657,
                    -7.916186327268492,
                    0
                ]
            },
            {
                "label": "Cl",
                "location": [
                    9.524983548575376,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    9.024784412512657,
                    -6.183789319441512,
                    0
                ]
            },
            {
                "label": "P",
                "location": [
                    7.524987002942751,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "P",
                "location": [
                    6.524988730126439,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "P",
                "location": [
                    5.5249904573101265,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "P",
                "location": [
                    4.524992184493814,
                    -7.049987823355002,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    7.7837865559476125,
                    -8.015886155068278,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    6.524988730126439,
                    -8.049986096171315,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    5.5249904573101265,
                    -8.049986096171315,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    4.266192631488952,
                    -8.015886155068278,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    3.658993680234887,
                    -6.549988686946846,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    0,
                    1
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    2
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    3
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    5
                ]
            },
            {
                "type": 1,
                "atoms": [
                    5,
                    6
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    8
                ]
            },
            {
                "type": 1,
                "atoms": [
                    5,
                    9
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    10
                ]
            },
            {
                "type": 1,
                "atoms": [
                    7,
                    11
                ]
            },
            {
                "type": 1,
                "atoms": [
                    7,
                    12
                ]
            }
        ],
        "class": "Phosphate",
        "classHELM": "RNA",
        "id": "Test-6-Ph___Test-6-AP-Phosphate",
        "fullName": "Test-6-AP-Phosphate",
        "alias": "Test-6-Ph",
        "attachmentPoints": [
            {
                "attachmentAtom": 7,
                "leavingGroup": {
                    "atoms": [
                        12
                    ]
                },
                "type": "left"
            },
            {
                "attachmentAtom": 0,
                "leavingGroup": {
                    "atoms": [
                        2
                    ]
                },
                "type": "right"
            },
            {
                "attachmentAtom": 7,
                "leavingGroup": {
                    "atoms": [
                        11
                    ]
                },
                "type": "side"
            },
            {
                "attachmentAtom": 6,
                "leavingGroup": {
                    "atoms": [
                        10
                    ]
                },
                "type": "side"
            },
            {
                "attachmentAtom": 5,
                "leavingGroup": {
                    "atoms": [
                        9
                    ]
                },
                "type": "side"
            },
            {
                "attachmentAtom": 4,
                "leavingGroup": {
                    "atoms": [
                        8
                    ]
                },
                "type": "side"
            }
        ],
        "naturalAnalogShort": "P"
    },
    "monomer1871": {
        "type": "monomer",
        "id": "1871",
        "position": {
            "x": 23.31875,
            "y": -37.3455
        },
        "alias": "Test-6-Ph",
        "templateId": "Test-6-Ph___Test-6-AP-Phosphate"
    },
    "monomer1872": {
        "type": "monomer",
        "id": "1872",
        "position": {
            "x": 18.118750000000002,
            "y": -40.166
        },
        "alias": "Test-6-Ph",
        "templateId": "Test-6-Ph___Test-6-AP-Phosphate"
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
