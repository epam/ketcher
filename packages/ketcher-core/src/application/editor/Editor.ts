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
                "$ref": "monomer1486"
            },
            {
                "$ref": "monomer1487"
            },
            {
                "$ref": "monomer1488"
            },
            {
                "$ref": "monomer1489"
            },
            {
                "$ref": "monomer1490"
            },
            {
                "$ref": "monomer1491"
            },
            {
                "$ref": "monomer1492"
            },
            {
                "$ref": "monomer1493"
            },
            {
                "$ref": "monomer1494"
            },
            {
                "$ref": "monomer1495"
            },
            {
                "$ref": "monomer1496"
            },
            {
                "$ref": "monomer1497"
            },
            {
                "$ref": "monomer1498"
            },
            {
                "$ref": "monomer1499"
            },
            {
                "$ref": "monomer1500"
            },
            {
                "$ref": "monomer1501"
            },
            {
                "$ref": "monomer1502"
            },
            {
                "$ref": "monomer1503"
            },
            {
                "$ref": "monomer1504"
            },
            {
                "$ref": "monomer1505"
            },
            {
                "$ref": "monomer1506"
            },
            {
                "$ref": "monomer1507"
            },
            {
                "$ref": "monomer1508"
            },
            {
                "$ref": "monomer1509"
            },
            {
                "$ref": "monomer1510"
            },
            {
                "$ref": "monomer1511"
            },
            {
                "$ref": "monomer1512"
            },
            {
                "$ref": "monomer1513"
            },
            {
                "$ref": "monomer1514"
            },
            {
                "$ref": "monomer1515"
            },
            {
                "$ref": "monomer1516"
            },
            {
                "$ref": "monomer1517"
            },
            {
                "$ref": "monomer1518"
            },
            {
                "$ref": "monomer1519"
            },
            {
                "$ref": "monomer1520"
            },
            {
                "$ref": "monomer1521"
            },
            {
                "$ref": "monomer1522"
            },
            {
                "$ref": "monomer1523"
            },
            {
                "$ref": "monomer1524"
            },
            {
                "$ref": "monomer1525"
            },
            {
                "$ref": "monomer1526"
            },
            {
                "$ref": "monomer1527"
            },
            {
                "$ref": "monomer1528"
            },
            {
                "$ref": "monomer1529"
            },
            {
                "$ref": "monomer1530"
            },
            {
                "$ref": "monomer1531"
            },
            {
                "$ref": "monomer1532"
            },
            {
                "$ref": "monomer1533"
            },
            {
                "$ref": "monomer1534"
            },
            {
                "$ref": "monomer1535"
            },
            {
                "$ref": "monomer1536"
            },
            {
                "$ref": "monomer1537"
            },
            {
                "$ref": "monomer1538"
            },
            {
                "$ref": "monomer1539"
            },
            {
                "$ref": "monomer1540"
            },
            {
                "$ref": "monomer1541"
            },
            {
                "$ref": "monomer1542"
            },
            {
                "$ref": "monomer1543"
            },
            {
                "$ref": "monomer1544"
            },
            {
                "$ref": "monomer1545"
            },
            {
                "$ref": "monomer1546"
            },
            {
                "$ref": "monomer1547"
            },
            {
                "$ref": "monomer1548"
            },
            {
                "$ref": "monomer1549"
            },
            {
                "$ref": "monomer1550"
            },
            {
                "$ref": "monomer1551"
            },
            {
                "$ref": "monomer1552"
            },
            {
                "$ref": "monomer1553"
            },
            {
                "$ref": "monomer1554"
            },
            {
                "$ref": "monomer1555"
            },
            {
                "$ref": "monomer1556"
            },
            {
                "$ref": "monomer1557"
            },
            {
                "$ref": "monomer1558"
            },
            {
                "$ref": "monomer1559"
            },
            {
                "$ref": "monomer1560"
            },
            {
                "$ref": "monomer1561"
            },
            {
                "$ref": "monomer1562"
            },
            {
                "$ref": "monomer1563"
            },
            {
                "$ref": "monomer1564"
            },
            {
                "$ref": "monomer1565"
            },
            {
                "$ref": "monomer1566"
            },
            {
                "$ref": "monomer1567"
            },
            {
                "$ref": "monomer1568"
            },
            {
                "$ref": "monomer1569"
            },
            {
                "$ref": "monomer1570"
            },
            {
                "$ref": "monomer1571"
            },
            {
                "$ref": "monomer1572"
            },
            {
                "$ref": "monomer1573"
            },
            {
                "$ref": "monomer1574"
            },
            {
                "$ref": "monomer1575"
            },
            {
                "$ref": "monomer1576"
            },
            {
                "$ref": "monomer1577"
            },
            {
                "$ref": "monomer1578"
            },
            {
                "$ref": "monomer1579"
            },
            {
                "$ref": "monomer1580"
            },
            {
                "$ref": "monomer1581"
            },
            {
                "$ref": "monomer1582"
            },
            {
                "$ref": "monomer1583"
            },
            {
                "$ref": "monomer1584"
            },
            {
                "$ref": "monomer1585"
            },
            {
                "$ref": "monomer1586"
            },
            {
                "$ref": "monomer1587"
            },
            {
                "$ref": "monomer1588"
            },
            {
                "$ref": "monomer1589"
            },
            {
                "$ref": "monomer1590"
            },
            {
                "$ref": "monomer1591"
            },
            {
                "$ref": "monomer1592"
            },
            {
                "$ref": "monomer1593"
            },
            {
                "$ref": "monomer1594"
            },
            {
                "$ref": "monomer1595"
            },
            {
                "$ref": "monomer1596"
            },
            {
                "$ref": "monomer1597"
            },
            {
                "$ref": "monomer1598"
            },
            {
                "$ref": "monomer1599"
            },
            {
                "$ref": "monomer1600"
            },
            {
                "$ref": "monomer1601"
            },
            {
                "$ref": "monomer1602"
            },
            {
                "$ref": "monomer1603"
            },
            {
                "$ref": "monomer1604"
            },
            {
                "$ref": "monomer1605"
            },
            {
                "$ref": "monomer1606"
            },
            {
                "$ref": "monomer1607"
            },
            {
                "$ref": "monomer1608"
            },
            {
                "$ref": "monomer1609"
            },
            {
                "$ref": "monomer1610"
            },
            {
                "$ref": "monomer1611"
            },
            {
                "$ref": "monomer1612"
            },
            {
                "$ref": "monomer1613"
            },
            {
                "$ref": "monomer1614"
            },
            {
                "$ref": "monomer1615"
            },
            {
                "$ref": "monomer1616"
            },
            {
                "$ref": "monomer1617"
            },
            {
                "$ref": "monomer1618"
            },
            {
                "$ref": "monomer1619"
            },
            {
                "$ref": "monomer1620"
            },
            {
                "$ref": "monomer1621"
            },
            {
                "$ref": "monomer1622"
            },
            {
                "$ref": "monomer1623"
            },
            {
                "$ref": "monomer1624"
            },
            {
                "$ref": "monomer1625"
            },
            {
                "$ref": "monomer1626"
            },
            {
                "$ref": "monomer1627"
            },
            {
                "$ref": "monomer1628"
            },
            {
                "$ref": "monomer1629"
            },
            {
                "$ref": "monomer1630"
            },
            {
                "$ref": "monomer1631"
            },
            {
                "$ref": "monomer1632"
            },
            {
                "$ref": "monomer1633"
            },
            {
                "$ref": "monomer1634"
            },
            {
                "$ref": "monomer1635"
            },
            {
                "$ref": "monomer1636"
            },
            {
                "$ref": "monomer1637"
            },
            {
                "$ref": "monomer1638"
            },
            {
                "$ref": "monomer1639"
            },
            {
                "$ref": "monomer1640"
            },
            {
                "$ref": "monomer1641"
            },
            {
                "$ref": "monomer1642"
            },
            {
                "$ref": "monomer1643"
            },
            {
                "$ref": "monomer1644"
            },
            {
                "$ref": "monomer1645"
            },
            {
                "$ref": "monomer1646"
            },
            {
                "$ref": "monomer1647"
            },
            {
                "$ref": "monomer1648"
            },
            {
                "$ref": "monomer1649"
            },
            {
                "$ref": "monomer1650"
            },
            {
                "$ref": "monomer1651"
            },
            {
                "$ref": "monomer1652"
            },
            {
                "$ref": "monomer1653"
            },
            {
                "$ref": "monomer1654"
            },
            {
                "$ref": "monomer1655"
            },
            {
                "$ref": "monomer1656"
            },
            {
                "$ref": "monomer1657"
            },
            {
                "$ref": "monomer1658"
            },
            {
                "$ref": "monomer1659"
            },
            {
                "$ref": "monomer1660"
            },
            {
                "$ref": "monomer1661"
            },
            {
                "$ref": "monomer1662"
            },
            {
                "$ref": "monomer1663"
            },
            {
                "$ref": "monomer1664"
            },
            {
                "$ref": "monomer1665"
            },
            {
                "$ref": "monomer2084"
            },
            {
                "$ref": "monomer2087"
            },
            {
                "$ref": "monomer2090"
            },
            {
                "$ref": "monomer2093"
            },
            {
                "$ref": "monomer2096"
            },
            {
                "$ref": "monomer2099"
            },
            {
                "$ref": "monomer2102"
            },
            {
                "$ref": "monomer2105"
            },
            {
                "$ref": "monomer2108"
            },
            {
                "$ref": "monomer2111"
            },
            {
                "$ref": "monomer2114"
            },
            {
                "$ref": "monomer2117"
            },
            {
                "$ref": "monomer2120"
            },
            {
                "$ref": "monomer2123"
            },
            {
                "$ref": "monomer2126"
            },
            {
                "$ref": "monomer2129"
            },
            {
                "$ref": "monomer2132"
            },
            {
                "$ref": "monomer2135"
            },
            {
                "$ref": "monomer2138"
            },
            {
                "$ref": "monomer2141"
            },
            {
                "$ref": "monomer2144"
            },
            {
                "$ref": "monomer2147"
            },
            {
                "$ref": "monomer2150"
            },
            {
                "$ref": "monomer2153"
            },
            {
                "$ref": "monomer2156"
            },
            {
                "$ref": "monomer2159"
            },
            {
                "$ref": "monomer2162"
            },
            {
                "$ref": "monomer2165"
            },
            {
                "$ref": "monomer2168"
            },
            {
                "$ref": "monomer2171"
            },
            {
                "$ref": "monomer2174"
            },
            {
                "$ref": "monomer2177"
            },
            {
                "$ref": "monomer2180"
            },
            {
                "$ref": "monomer2183"
            },
            {
                "$ref": "monomer2186"
            },
            {
                "$ref": "monomer2189"
            },
            {
                "$ref": "monomer2192"
            },
            {
                "$ref": "monomer2195"
            },
            {
                "$ref": "monomer2198"
            },
            {
                "$ref": "monomer2201"
            },
            {
                "$ref": "monomer2204"
            },
            {
                "$ref": "monomer2207"
            },
            {
                "$ref": "monomer2210"
            },
            {
                "$ref": "monomer2213"
            },
            {
                "$ref": "monomer2216"
            },
            {
                "$ref": "monomer2219"
            },
            {
                "$ref": "monomer2222"
            },
            {
                "$ref": "monomer2225"
            },
            {
                "$ref": "monomer2228"
            },
            {
                "$ref": "monomer2231"
            },
            {
                "$ref": "monomer2234"
            },
            {
                "$ref": "monomer2237"
            },
            {
                "$ref": "monomer2240"
            },
            {
                "$ref": "monomer2243"
            },
            {
                "$ref": "monomer2246"
            },
            {
                "$ref": "monomer2249"
            },
            {
                "$ref": "monomer2252"
            },
            {
                "$ref": "monomer2255"
            },
            {
                "$ref": "monomer2258"
            },
            {
                "$ref": "monomer2261"
            },
            {
                "$ref": "monomer2264"
            },
            {
                "$ref": "monomer2267"
            },
            {
                "$ref": "monomer2270"
            },
            {
                "$ref": "monomer2273"
            },
            {
                "$ref": "monomer2276"
            },
            {
                "$ref": "monomer2279"
            },
            {
                "$ref": "monomer2282"
            },
            {
                "$ref": "monomer2285"
            },
            {
                "$ref": "monomer2288"
            },
            {
                "$ref": "monomer2291"
            },
            {
                "$ref": "monomer2294"
            },
            {
                "$ref": "monomer2297"
            },
            {
                "$ref": "monomer2300"
            },
            {
                "$ref": "monomer2303"
            },
            {
                "$ref": "monomer2306"
            },
            {
                "$ref": "monomer2309"
            },
            {
                "$ref": "monomer2312"
            },
            {
                "$ref": "monomer2315"
            },
            {
                "$ref": "monomer2318"
            },
            {
                "$ref": "monomer2321"
            },
            {
                "$ref": "monomer2324"
            },
            {
                "$ref": "monomer2327"
            },
            {
                "$ref": "monomer2330"
            },
            {
                "$ref": "monomer2333"
            },
            {
                "$ref": "monomer2336"
            },
            {
                "$ref": "monomer2339"
            },
            {
                "$ref": "monomer2342"
            },
            {
                "$ref": "monomer2345"
            },
            {
                "$ref": "monomer2348"
            },
            {
                "$ref": "monomer2351"
            },
            {
                "$ref": "monomer2354"
            },
            {
                "$ref": "monomer2357"
            },
            {
                "$ref": "monomer2360"
            },
            {
                "$ref": "monomer2363"
            },
            {
                "$ref": "monomer2366"
            },
            {
                "$ref": "monomer2369"
            },
            {
                "$ref": "monomer2372"
            },
            {
                "$ref": "monomer2375"
            },
            {
                "$ref": "monomer2378"
            },
            {
                "$ref": "monomer2381"
            },
            {
                "$ref": "monomer2384"
            },
            {
                "$ref": "monomer2387"
            },
            {
                "$ref": "monomer2390"
            },
            {
                "$ref": "monomer2393"
            },
            {
                "$ref": "monomer2396"
            },
            {
                "$ref": "monomer2399"
            },
            {
                "$ref": "monomer2402"
            },
            {
                "$ref": "monomer2405"
            },
            {
                "$ref": "monomer2408"
            },
            {
                "$ref": "monomer2411"
            },
            {
                "$ref": "monomer2414"
            },
            {
                "$ref": "monomer2417"
            },
            {
                "$ref": "monomer2420"
            },
            {
                "$ref": "monomer2423"
            },
            {
                "$ref": "monomer2426"
            },
            {
                "$ref": "monomer2429"
            },
            {
                "$ref": "monomer2432"
            },
            {
                "$ref": "monomer2435"
            },
            {
                "$ref": "monomer2438"
            },
            {
                "$ref": "monomer2441"
            },
            {
                "$ref": "monomer2444"
            },
            {
                "$ref": "monomer2447"
            },
            {
                "$ref": "monomer2450"
            },
            {
                "$ref": "monomer2453"
            },
            {
                "$ref": "monomer2456"
            },
            {
                "$ref": "monomer2459"
            },
            {
                "$ref": "monomer2462"
            },
            {
                "$ref": "monomer2465"
            },
            {
                "$ref": "monomer2468"
            },
            {
                "$ref": "monomer2471"
            },
            {
                "$ref": "monomer2474"
            },
            {
                "$ref": "monomer2477"
            },
            {
                "$ref": "monomer2480"
            },
            {
                "$ref": "monomer2483"
            },
            {
                "$ref": "monomer2486"
            },
            {
                "$ref": "monomer2489"
            },
            {
                "$ref": "monomer2492"
            },
            {
                "$ref": "monomer2495"
            },
            {
                "$ref": "monomer2498"
            },
            {
                "$ref": "monomer2501"
            },
            {
                "$ref": "monomer2504"
            },
            {
                "$ref": "monomer2507"
            },
            {
                "$ref": "monomer2510"
            },
            {
                "$ref": "monomer2513"
            },
            {
                "$ref": "monomer2516"
            },
            {
                "$ref": "monomer2519"
            },
            {
                "$ref": "monomer2522"
            },
            {
                "$ref": "monomer2525"
            },
            {
                "$ref": "monomer2528"
            },
            {
                "$ref": "monomer2531"
            },
            {
                "$ref": "monomer2534"
            },
            {
                "$ref": "monomer2537"
            },
            {
                "$ref": "monomer2540"
            },
            {
                "$ref": "monomer2543"
            },
            {
                "$ref": "monomer2546"
            },
            {
                "$ref": "monomer2549"
            },
            {
                "$ref": "monomer2552"
            },
            {
                "$ref": "monomer2555"
            },
            {
                "$ref": "monomer2558"
            },
            {
                "$ref": "monomer2561"
            },
            {
                "$ref": "monomer2564"
            },
            {
                "$ref": "monomer2567"
            },
            {
                "$ref": "monomer2570"
            },
            {
                "$ref": "monomer2573"
            },
            {
                "$ref": "monomer2576"
            },
            {
                "$ref": "monomer2579"
            },
            {
                "$ref": "monomer2582"
            },
            {
                "$ref": "monomer2585"
            },
            {
                "$ref": "monomer2588"
            },
            {
                "$ref": "monomer2591"
            },
            {
                "$ref": "monomer2594"
            },
            {
                "$ref": "monomer2597"
            },
            {
                "$ref": "monomer2600"
            },
            {
                "$ref": "monomer2603"
            },
            {
                "$ref": "monomer2606"
            },
            {
                "$ref": "monomer2609"
            },
            {
                "$ref": "monomer2612"
            },
            {
                "$ref": "monomer2615"
            },
            {
                "$ref": "monomer2618"
            },
            {
                "$ref": "monomer2621"
            },
            {
                "$ref": "monomer2624"
            },
            {
                "$ref": "monomer2627"
            },
            {
                "$ref": "monomer2630"
            },
            {
                "$ref": "monomer2633"
            },
            {
                "$ref": "monomer2636"
            },
            {
                "$ref": "monomer2639"
            },
            {
                "$ref": "monomer2642"
            },
            {
                "$ref": "monomer2645"
            },
            {
                "$ref": "monomer2648"
            },
            {
                "$ref": "monomer2651"
            },
            {
                "$ref": "monomer2654"
            },
            {
                "$ref": "monomer2657"
            },
            {
                "$ref": "monomer2660"
            },
            {
                "$ref": "monomer2663"
            },
            {
                "$ref": "monomer2666"
            },
            {
                "$ref": "monomer2669"
            },
            {
                "$ref": "monomer2672"
            },
            {
                "$ref": "monomer2675"
            },
            {
                "$ref": "monomer2678"
            },
            {
                "$ref": "monomer2681"
            },
            {
                "$ref": "monomer2684"
            },
            {
                "$ref": "monomer2687"
            },
            {
                "$ref": "monomer2690"
            },
            {
                "$ref": "monomer2693"
            },
            {
                "$ref": "monomer2696"
            },
            {
                "$ref": "monomer2699"
            },
            {
                "$ref": "monomer2702"
            },
            {
                "$ref": "monomer2705"
            },
            {
                "$ref": "monomer2708"
            },
            {
                "$ref": "monomer2711"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1486",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1487",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1487",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1488",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1488",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1489",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1489",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1490",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1490",
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
                    "monomerId": "monomer1492",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1492",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1493",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1493",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1494",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1494",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1495",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1495",
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
                    "monomerId": "monomer1497",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1497",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1498",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1498",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1499",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1499",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1500",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1500",
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
                    "monomerId": "monomer1502",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1502",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1503",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1503",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1504",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1504",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1505",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1505",
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
                    "monomerId": "monomer1507",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1507",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1508",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1508",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1509",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1509",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1510",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1510",
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
                    "monomerId": "monomer1512",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1512",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1513",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1513",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1514",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1514",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1515",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1515",
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
                    "monomerId": "monomer1517",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1517",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1518",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1518",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1519",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1519",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1520",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1520",
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
                    "monomerId": "monomer1522",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1522",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1523",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1523",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1524",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1524",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1525",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1525",
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
                    "monomerId": "monomer1527",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1527",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1528",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1528",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1529",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1529",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1530",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1530",
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
                    "monomerId": "monomer1532",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1532",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1533",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1533",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1534",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1534",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1535",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1535",
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
                    "monomerId": "monomer1537",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1537",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1538",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1538",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1539",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1539",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1540",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1540",
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
                    "monomerId": "monomer1542",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1543",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1544",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1544",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1545",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1542",
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
                    "monomerId": "monomer1547",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1547",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1548",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1548",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1549",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1549",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1550",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1550",
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
                    "monomerId": "monomer1552",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1552",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1553",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1553",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1554",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1554",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1555",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1555",
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
                    "monomerId": "monomer1557",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1557",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1558",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1558",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1559",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1559",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1560",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1560",
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
                    "monomerId": "monomer1562",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1562",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1563",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1563",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1564",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1564",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1565",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1565",
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
                    "monomerId": "monomer1567",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1567",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1568",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1568",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1569",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1569",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1570",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1570",
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
                    "monomerId": "monomer1572",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1572",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1573",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1573",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1574",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1574",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1575",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1575",
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
                    "monomerId": "monomer1577",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1577",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1578",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1578",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1579",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1579",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1580",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1580",
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
                    "monomerId": "monomer1582",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1582",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1583",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1583",
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
                    "monomerId": "monomer1585",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1585",
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
                    "monomerId": "monomer1587",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1587",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1588",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1588",
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
                    "monomerId": "monomer1589",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1590",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1590",
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
                    "monomerId": "monomer1593",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1593",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1594",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1594",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1595",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1595",
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
                    "monomerId": "monomer1597",
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
                    "monomerId": "monomer1598",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1598",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1599",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1599",
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
                    "monomerId": "monomer1602",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1602",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1603",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1603",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1604",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1604",
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
                    "monomerId": "monomer1605",
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
                    "monomerId": "monomer1607",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1607",
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
                    "monomerId": "monomer1609",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1609",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1610",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1610",
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
                    "monomerId": "monomer1612",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1612",
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
                    "monomerId": "monomer1613",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1614",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1614",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1615",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1615",
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
                    "monomerId": "monomer1617",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1617",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1618",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1618",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1619",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1619",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1620",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1620",
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
                    "monomerId": "monomer1622",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1622",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1623",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1623",
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
                    "monomerId": "monomer1625",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1625",
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
                    "monomerId": "monomer1627",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1627",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1628",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1628",
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
                    "monomerId": "monomer1629",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1630",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1630",
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
                    "monomerId": "monomer1633",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1633",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1634",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1634",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1635",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1635",
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
                    "monomerId": "monomer1637",
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
                    "monomerId": "monomer1638",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1638",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1639",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1639",
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
                    "monomerId": "monomer1642",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1642",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1643",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1643",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1644",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1644",
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
                    "monomerId": "monomer1645",
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
                    "monomerId": "monomer1647",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1647",
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
                    "monomerId": "monomer1649",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1649",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1650",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1650",
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
                    "monomerId": "monomer1652",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1652",
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
                    "monomerId": "monomer1653",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1654",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1654",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1655",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1655",
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
                    "monomerId": "monomer1657",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1657",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1658",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1658",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1659",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1659",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1660",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1660",
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
                    "monomerId": "monomer1662",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1662",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1663",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1663",
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
                    "monomerId": "monomer1665",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1665",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer1543",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1578",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1614",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1560",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1632",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1539",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1650",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1521",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1544",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1563",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1599",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1542",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1617",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1524",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1635",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1506",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer1652",
                    "attachmentPointId": "R3"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer1545",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2084",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2084",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2087",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2087",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2090",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2090",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2093",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2093",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2096",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2096",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2099",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2099",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2102",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2102",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2105",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2105",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2108",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2108",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2111",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2111",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2114",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2114",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2117",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2117",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2120",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2120",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2123",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2123",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2126",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2126",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2129",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2129",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2132",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2132",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2135",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2135",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2138",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2138",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2141",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2141",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2144",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2144",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2147",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2147",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2150",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2150",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2153",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2153",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2156",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2156",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2159",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2159",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2162",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2162",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2165",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2165",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2168",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2168",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2171",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2171",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2174",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2174",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2177",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2177",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2180",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2180",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2183",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2183",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2186",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2186",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2189",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2189",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2192",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2192",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2195",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2195",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2198",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2198",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2201",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2201",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2204",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2204",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2207",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2207",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2210",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2210",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2213",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2213",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2216",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2216",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2219",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2219",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2222",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2222",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2225",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2225",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2228",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2228",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2231",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2231",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2234",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2234",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2237",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2237",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2240",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2240",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2243",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2243",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2246",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2246",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2249",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2249",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2252",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2252",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2255",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2255",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2258",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2258",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2261",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2261",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2264",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2264",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2267",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2267",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2270",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2270",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2273",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2273",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2276",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2276",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2279",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2279",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2282",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2282",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2285",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2285",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2288",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2288",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2291",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2291",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2294",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2294",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2297",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2297",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2300",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2300",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2303",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2303",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2306",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2306",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2309",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2309",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2312",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2312",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2315",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2315",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2318",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2318",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2321",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2321",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2324",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2324",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2327",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2327",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2330",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2330",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2333",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2333",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2336",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2336",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2339",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2339",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2342",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2342",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2345",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2345",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2348",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2348",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2351",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2351",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2354",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2354",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2357",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2357",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2360",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2360",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2363",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2363",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2366",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2366",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2369",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2369",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2372",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2372",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2375",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2375",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2378",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2378",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2381",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2381",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2384",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2384",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2387",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2387",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2390",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2390",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2393",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2393",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2396",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2396",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2399",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2399",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2402",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2402",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2405",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2405",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2408",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2408",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2411",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2411",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2414",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2414",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2417",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2417",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2420",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2420",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2423",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2423",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2426",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2426",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2429",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2429",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2432",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2432",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2435",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2435",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2438",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2438",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2441",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2441",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2444",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2444",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2447",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2447",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2450",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2450",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2453",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2453",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2456",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2456",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2459",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2459",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2462",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2462",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2465",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2465",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2468",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2468",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2471",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2471",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2474",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2474",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2477",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2477",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2480",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2480",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2483",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2483",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2486",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2486",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2489",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2489",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2492",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2492",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2495",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2495",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2498",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2498",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2501",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2501",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2504",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2504",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2507",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2507",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2510",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2510",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2513",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2513",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2516",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2516",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2519",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2519",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2522",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2522",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2525",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2525",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2528",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2528",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2531",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2531",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2534",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2534",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2537",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2537",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2540",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2540",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2543",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2543",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2546",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2546",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2549",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2549",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2552",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2552",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2555",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2555",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2558",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2558",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2561",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2561",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2564",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2564",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2567",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2567",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2570",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2570",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2573",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2573",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2576",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2576",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2579",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2579",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2582",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2582",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2585",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2585",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2588",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2588",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2591",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2591",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2594",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2594",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2597",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2597",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2600",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2600",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2603",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2603",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2606",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2606",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2609",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2609",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2612",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2612",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2615",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2615",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2618",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2618",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2621",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2621",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2624",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2624",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2627",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2627",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2630",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2630",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2633",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2633",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2636",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2636",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2639",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2639",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2642",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2642",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2645",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2645",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2648",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2648",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2651",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2651",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2654",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2654",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2657",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2657",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2660",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2660",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2663",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2663",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2666",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2666",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2669",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2669",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2672",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2672",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2675",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2675",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2678",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2678",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2681",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2681",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2684",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2684",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2687",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2687",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2690",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2690",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2693",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2693",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2696",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2696",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2699",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2699",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2702",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2702",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2705",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2705",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2708",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer2708",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer2711",
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
    "monomer1486": {
        "type": "monomer",
        "id": "1486",
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
    "monomer1487": {
        "type": "monomer",
        "id": "1487",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1488": {
        "type": "monomer",
        "id": "1488",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1489": {
        "type": "monomer",
        "id": "1489",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1490": {
        "type": "monomer",
        "id": "1490",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1491": {
        "type": "monomer",
        "id": "1491",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1492": {
        "type": "monomer",
        "id": "1492",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1493": {
        "type": "monomer",
        "id": "1493",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1494": {
        "type": "monomer",
        "id": "1494",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1495": {
        "type": "monomer",
        "id": "1495",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1496": {
        "type": "monomer",
        "id": "1496",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1497": {
        "type": "monomer",
        "id": "1497",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1498": {
        "type": "monomer",
        "id": "1498",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1499": {
        "type": "monomer",
        "id": "1499",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1500": {
        "type": "monomer",
        "id": "1500",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1501": {
        "type": "monomer",
        "id": "1501",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1502": {
        "type": "monomer",
        "id": "1502",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1503": {
        "type": "monomer",
        "id": "1503",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1504": {
        "type": "monomer",
        "id": "1504",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1505": {
        "type": "monomer",
        "id": "1505",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1506": {
        "type": "monomer",
        "id": "1506",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1507": {
        "type": "monomer",
        "id": "1507",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1508": {
        "type": "monomer",
        "id": "1508",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1509": {
        "type": "monomer",
        "id": "1509",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1510": {
        "type": "monomer",
        "id": "1510",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1511": {
        "type": "monomer",
        "id": "1511",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1512": {
        "type": "monomer",
        "id": "1512",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1513": {
        "type": "monomer",
        "id": "1513",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1514": {
        "type": "monomer",
        "id": "1514",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1515": {
        "type": "monomer",
        "id": "1515",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1516": {
        "type": "monomer",
        "id": "1516",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1517": {
        "type": "monomer",
        "id": "1517",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1518": {
        "type": "monomer",
        "id": "1518",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1519": {
        "type": "monomer",
        "id": "1519",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1520": {
        "type": "monomer",
        "id": "1520",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1521": {
        "type": "monomer",
        "id": "1521",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1522": {
        "type": "monomer",
        "id": "1522",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1523": {
        "type": "monomer",
        "id": "1523",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1524": {
        "type": "monomer",
        "id": "1524",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1525": {
        "type": "monomer",
        "id": "1525",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1526": {
        "type": "monomer",
        "id": "1526",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1527": {
        "type": "monomer",
        "id": "1527",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1528": {
        "type": "monomer",
        "id": "1528",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1529": {
        "type": "monomer",
        "id": "1529",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1530": {
        "type": "monomer",
        "id": "1530",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1531": {
        "type": "monomer",
        "id": "1531",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1532": {
        "type": "monomer",
        "id": "1532",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1533": {
        "type": "monomer",
        "id": "1533",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1534": {
        "type": "monomer",
        "id": "1534",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1535": {
        "type": "monomer",
        "id": "1535",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1536": {
        "type": "monomer",
        "id": "1536",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1537": {
        "type": "monomer",
        "id": "1537",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1538": {
        "type": "monomer",
        "id": "1538",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1539": {
        "type": "monomer",
        "id": "1539",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1540": {
        "type": "monomer",
        "id": "1540",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1541": {
        "type": "monomer",
        "id": "1541",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1542": {
        "type": "monomer",
        "id": "1542",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1543": {
        "type": "monomer",
        "id": "1543",
        "position": {
            "x": 23.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1544": {
        "type": "monomer",
        "id": "1544",
        "position": {
            "x": 25.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1545": {
        "type": "monomer",
        "id": "1545",
        "position": {
            "x": 26.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1546": {
        "type": "monomer",
        "id": "1546",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1547": {
        "type": "monomer",
        "id": "1547",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1548": {
        "type": "monomer",
        "id": "1548",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1549": {
        "type": "monomer",
        "id": "1549",
        "position": {
            "x": 10.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1550": {
        "type": "monomer",
        "id": "1550",
        "position": {
            "x": 11.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1551": {
        "type": "monomer",
        "id": "1551",
        "position": {
            "x": 13.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1552": {
        "type": "monomer",
        "id": "1552",
        "position": {
            "x": 14.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1553": {
        "type": "monomer",
        "id": "1553",
        "position": {
            "x": 16.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1554": {
        "type": "monomer",
        "id": "1554",
        "position": {
            "x": 17.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1555": {
        "type": "monomer",
        "id": "1555",
        "position": {
            "x": 19.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1556": {
        "type": "monomer",
        "id": "1556",
        "position": {
            "x": 20.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1557": {
        "type": "monomer",
        "id": "1557",
        "position": {
            "x": 22.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1558": {
        "type": "monomer",
        "id": "1558",
        "position": {
            "x": 23.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1559": {
        "type": "monomer",
        "id": "1559",
        "position": {
            "x": 25.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1560": {
        "type": "monomer",
        "id": "1560",
        "position": {
            "x": 26.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1561": {
        "type": "monomer",
        "id": "1561",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1562": {
        "type": "monomer",
        "id": "1562",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1563": {
        "type": "monomer",
        "id": "1563",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1564": {
        "type": "monomer",
        "id": "1564",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1565": {
        "type": "monomer",
        "id": "1565",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1566": {
        "type": "monomer",
        "id": "1566",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1567": {
        "type": "monomer",
        "id": "1567",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1568": {
        "type": "monomer",
        "id": "1568",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1569": {
        "type": "monomer",
        "id": "1569",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1570": {
        "type": "monomer",
        "id": "1570",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1571": {
        "type": "monomer",
        "id": "1571",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1572": {
        "type": "monomer",
        "id": "1572",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1573": {
        "type": "monomer",
        "id": "1573",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1574": {
        "type": "monomer",
        "id": "1574",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1575": {
        "type": "monomer",
        "id": "1575",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1576": {
        "type": "monomer",
        "id": "1576",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1577": {
        "type": "monomer",
        "id": "1577",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1578": {
        "type": "monomer",
        "id": "1578",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1579": {
        "type": "monomer",
        "id": "1579",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1580": {
        "type": "monomer",
        "id": "1580",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1581": {
        "type": "monomer",
        "id": "1581",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1582": {
        "type": "monomer",
        "id": "1582",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1583": {
        "type": "monomer",
        "id": "1583",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1584": {
        "type": "monomer",
        "id": "1584",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1585": {
        "type": "monomer",
        "id": "1585",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1586": {
        "type": "monomer",
        "id": "1586",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1587": {
        "type": "monomer",
        "id": "1587",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1588": {
        "type": "monomer",
        "id": "1588",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1589": {
        "type": "monomer",
        "id": "1589",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1590": {
        "type": "monomer",
        "id": "1590",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1591": {
        "type": "monomer",
        "id": "1591",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1592": {
        "type": "monomer",
        "id": "1592",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1593": {
        "type": "monomer",
        "id": "1593",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1594": {
        "type": "monomer",
        "id": "1594",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1595": {
        "type": "monomer",
        "id": "1595",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1596": {
        "type": "monomer",
        "id": "1596",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1597": {
        "type": "monomer",
        "id": "1597",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1598": {
        "type": "monomer",
        "id": "1598",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1599": {
        "type": "monomer",
        "id": "1599",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1600": {
        "type": "monomer",
        "id": "1600",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1601": {
        "type": "monomer",
        "id": "1601",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1602": {
        "type": "monomer",
        "id": "1602",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1603": {
        "type": "monomer",
        "id": "1603",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1604": {
        "type": "monomer",
        "id": "1604",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1605": {
        "type": "monomer",
        "id": "1605",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1606": {
        "type": "monomer",
        "id": "1606",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1607": {
        "type": "monomer",
        "id": "1607",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1608": {
        "type": "monomer",
        "id": "1608",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1609": {
        "type": "monomer",
        "id": "1609",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1610": {
        "type": "monomer",
        "id": "1610",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1611": {
        "type": "monomer",
        "id": "1611",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1612": {
        "type": "monomer",
        "id": "1612",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1613": {
        "type": "monomer",
        "id": "1613",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1614": {
        "type": "monomer",
        "id": "1614",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1615": {
        "type": "monomer",
        "id": "1615",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1616": {
        "type": "monomer",
        "id": "1616",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1617": {
        "type": "monomer",
        "id": "1617",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1618": {
        "type": "monomer",
        "id": "1618",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1619": {
        "type": "monomer",
        "id": "1619",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1620": {
        "type": "monomer",
        "id": "1620",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1621": {
        "type": "monomer",
        "id": "1621",
        "position": {
            "x": 10.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1622": {
        "type": "monomer",
        "id": "1622",
        "position": {
            "x": 11.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1623": {
        "type": "monomer",
        "id": "1623",
        "position": {
            "x": 13.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1624": {
        "type": "monomer",
        "id": "1624",
        "position": {
            "x": 14.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1625": {
        "type": "monomer",
        "id": "1625",
        "position": {
            "x": 16.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1626": {
        "type": "monomer",
        "id": "1626",
        "position": {
            "x": 17.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1627": {
        "type": "monomer",
        "id": "1627",
        "position": {
            "x": 19.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1628": {
        "type": "monomer",
        "id": "1628",
        "position": {
            "x": 20.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1629": {
        "type": "monomer",
        "id": "1629",
        "position": {
            "x": 22.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1630": {
        "type": "monomer",
        "id": "1630",
        "position": {
            "x": 23.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1631": {
        "type": "monomer",
        "id": "1631",
        "position": {
            "x": 25.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1632": {
        "type": "monomer",
        "id": "1632",
        "position": {
            "x": 26.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1633": {
        "type": "monomer",
        "id": "1633",
        "position": {
            "x": 1.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1634": {
        "type": "monomer",
        "id": "1634",
        "position": {
            "x": 2.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1635": {
        "type": "monomer",
        "id": "1635",
        "position": {
            "x": 4.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1636": {
        "type": "monomer",
        "id": "1636",
        "position": {
            "x": 5.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1637": {
        "type": "monomer",
        "id": "1637",
        "position": {
            "x": 7.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1638": {
        "type": "monomer",
        "id": "1638",
        "position": {
            "x": 8.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1639": {
        "type": "monomer",
        "id": "1639",
        "position": {
            "x": 10.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1640": {
        "type": "monomer",
        "id": "1640",
        "position": {
            "x": 11.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1641": {
        "type": "monomer",
        "id": "1641",
        "position": {
            "x": 13.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1642": {
        "type": "monomer",
        "id": "1642",
        "position": {
            "x": 14.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1643": {
        "type": "monomer",
        "id": "1643",
        "position": {
            "x": 16.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1644": {
        "type": "monomer",
        "id": "1644",
        "position": {
            "x": 17.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1645": {
        "type": "monomer",
        "id": "1645",
        "position": {
            "x": 19.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1646": {
        "type": "monomer",
        "id": "1646",
        "position": {
            "x": 20.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1647": {
        "type": "monomer",
        "id": "1647",
        "position": {
            "x": 22.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1648": {
        "type": "monomer",
        "id": "1648",
        "position": {
            "x": 23.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1649": {
        "type": "monomer",
        "id": "1649",
        "position": {
            "x": 25.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1650": {
        "type": "monomer",
        "id": "1650",
        "position": {
            "x": 26.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1651": {
        "type": "monomer",
        "id": "1651",
        "position": {
            "x": 1.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1652": {
        "type": "monomer",
        "id": "1652",
        "position": {
            "x": 2.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1653": {
        "type": "monomer",
        "id": "1653",
        "position": {
            "x": 4.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1654": {
        "type": "monomer",
        "id": "1654",
        "position": {
            "x": 5.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1655": {
        "type": "monomer",
        "id": "1655",
        "position": {
            "x": 7.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1656": {
        "type": "monomer",
        "id": "1656",
        "position": {
            "x": 8.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1657": {
        "type": "monomer",
        "id": "1657",
        "position": {
            "x": 10.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1658": {
        "type": "monomer",
        "id": "1658",
        "position": {
            "x": 11.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1659": {
        "type": "monomer",
        "id": "1659",
        "position": {
            "x": 13.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1660": {
        "type": "monomer",
        "id": "1660",
        "position": {
            "x": 14.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1661": {
        "type": "monomer",
        "id": "1661",
        "position": {
            "x": 16.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1662": {
        "type": "monomer",
        "id": "1662",
        "position": {
            "x": 17.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1663": {
        "type": "monomer",
        "id": "1663",
        "position": {
            "x": 19.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1664": {
        "type": "monomer",
        "id": "1664",
        "position": {
            "x": 20.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer1665": {
        "type": "monomer",
        "id": "1665",
        "position": {
            "x": 22.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2084": {
        "type": "monomer",
        "id": "2084",
        "position": {
            "x": 1.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2087": {
        "type": "monomer",
        "id": "2087",
        "position": {
            "x": 2.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2090": {
        "type": "monomer",
        "id": "2090",
        "position": {
            "x": 4.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2093": {
        "type": "monomer",
        "id": "2093",
        "position": {
            "x": 5.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2096": {
        "type": "monomer",
        "id": "2096",
        "position": {
            "x": 7.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2099": {
        "type": "monomer",
        "id": "2099",
        "position": {
            "x": 8.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2102": {
        "type": "monomer",
        "id": "2102",
        "position": {
            "x": 10.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2105": {
        "type": "monomer",
        "id": "2105",
        "position": {
            "x": 11.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2108": {
        "type": "monomer",
        "id": "2108",
        "position": {
            "x": 13.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2111": {
        "type": "monomer",
        "id": "2111",
        "position": {
            "x": 14.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2114": {
        "type": "monomer",
        "id": "2114",
        "position": {
            "x": 16.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2117": {
        "type": "monomer",
        "id": "2117",
        "position": {
            "x": 17.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2120": {
        "type": "monomer",
        "id": "2120",
        "position": {
            "x": 19.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2123": {
        "type": "monomer",
        "id": "2123",
        "position": {
            "x": 20.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2126": {
        "type": "monomer",
        "id": "2126",
        "position": {
            "x": 22.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2129": {
        "type": "monomer",
        "id": "2129",
        "position": {
            "x": 23.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2132": {
        "type": "monomer",
        "id": "2132",
        "position": {
            "x": 25.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2135": {
        "type": "monomer",
        "id": "2135",
        "position": {
            "x": 26.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2138": {
        "type": "monomer",
        "id": "2138",
        "position": {
            "x": 1.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2141": {
        "type": "monomer",
        "id": "2141",
        "position": {
            "x": 2.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2144": {
        "type": "monomer",
        "id": "2144",
        "position": {
            "x": 4.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2147": {
        "type": "monomer",
        "id": "2147",
        "position": {
            "x": 5.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2150": {
        "type": "monomer",
        "id": "2150",
        "position": {
            "x": 7.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2153": {
        "type": "monomer",
        "id": "2153",
        "position": {
            "x": 8.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2156": {
        "type": "monomer",
        "id": "2156",
        "position": {
            "x": 10.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2159": {
        "type": "monomer",
        "id": "2159",
        "position": {
            "x": 11.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2162": {
        "type": "monomer",
        "id": "2162",
        "position": {
            "x": 13.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2165": {
        "type": "monomer",
        "id": "2165",
        "position": {
            "x": 14.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2168": {
        "type": "monomer",
        "id": "2168",
        "position": {
            "x": 16.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2171": {
        "type": "monomer",
        "id": "2171",
        "position": {
            "x": 17.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2174": {
        "type": "monomer",
        "id": "2174",
        "position": {
            "x": 19.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2177": {
        "type": "monomer",
        "id": "2177",
        "position": {
            "x": 20.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2180": {
        "type": "monomer",
        "id": "2180",
        "position": {
            "x": 22.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2183": {
        "type": "monomer",
        "id": "2183",
        "position": {
            "x": 23.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2186": {
        "type": "monomer",
        "id": "2186",
        "position": {
            "x": 25.25,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2189": {
        "type": "monomer",
        "id": "2189",
        "position": {
            "x": 26.75,
            "y": -17.8875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2192": {
        "type": "monomer",
        "id": "2192",
        "position": {
            "x": 1.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2195": {
        "type": "monomer",
        "id": "2195",
        "position": {
            "x": 2.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2198": {
        "type": "monomer",
        "id": "2198",
        "position": {
            "x": 4.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2201": {
        "type": "monomer",
        "id": "2201",
        "position": {
            "x": 5.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2204": {
        "type": "monomer",
        "id": "2204",
        "position": {
            "x": 7.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2207": {
        "type": "monomer",
        "id": "2207",
        "position": {
            "x": 8.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2210": {
        "type": "monomer",
        "id": "2210",
        "position": {
            "x": 10.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2213": {
        "type": "monomer",
        "id": "2213",
        "position": {
            "x": 11.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2216": {
        "type": "monomer",
        "id": "2216",
        "position": {
            "x": 13.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2219": {
        "type": "monomer",
        "id": "2219",
        "position": {
            "x": 14.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2222": {
        "type": "monomer",
        "id": "2222",
        "position": {
            "x": 16.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2225": {
        "type": "monomer",
        "id": "2225",
        "position": {
            "x": 17.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2228": {
        "type": "monomer",
        "id": "2228",
        "position": {
            "x": 19.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2231": {
        "type": "monomer",
        "id": "2231",
        "position": {
            "x": 20.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2234": {
        "type": "monomer",
        "id": "2234",
        "position": {
            "x": 22.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2237": {
        "type": "monomer",
        "id": "2237",
        "position": {
            "x": 23.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2240": {
        "type": "monomer",
        "id": "2240",
        "position": {
            "x": 25.25,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2243": {
        "type": "monomer",
        "id": "2243",
        "position": {
            "x": 26.75,
            "y": -19.400000000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2246": {
        "type": "monomer",
        "id": "2246",
        "position": {
            "x": 1.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2249": {
        "type": "monomer",
        "id": "2249",
        "position": {
            "x": 2.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2252": {
        "type": "monomer",
        "id": "2252",
        "position": {
            "x": 4.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2255": {
        "type": "monomer",
        "id": "2255",
        "position": {
            "x": 5.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2258": {
        "type": "monomer",
        "id": "2258",
        "position": {
            "x": 7.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2261": {
        "type": "monomer",
        "id": "2261",
        "position": {
            "x": 8.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2264": {
        "type": "monomer",
        "id": "2264",
        "position": {
            "x": 10.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2267": {
        "type": "monomer",
        "id": "2267",
        "position": {
            "x": 11.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2270": {
        "type": "monomer",
        "id": "2270",
        "position": {
            "x": 13.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2273": {
        "type": "monomer",
        "id": "2273",
        "position": {
            "x": 14.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2276": {
        "type": "monomer",
        "id": "2276",
        "position": {
            "x": 16.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2279": {
        "type": "monomer",
        "id": "2279",
        "position": {
            "x": 17.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2282": {
        "type": "monomer",
        "id": "2282",
        "position": {
            "x": 19.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2285": {
        "type": "monomer",
        "id": "2285",
        "position": {
            "x": 20.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2288": {
        "type": "monomer",
        "id": "2288",
        "position": {
            "x": 22.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2291": {
        "type": "monomer",
        "id": "2291",
        "position": {
            "x": 23.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2294": {
        "type": "monomer",
        "id": "2294",
        "position": {
            "x": 25.25,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2297": {
        "type": "monomer",
        "id": "2297",
        "position": {
            "x": 26.75,
            "y": -20.9125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2300": {
        "type": "monomer",
        "id": "2300",
        "position": {
            "x": 1.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2303": {
        "type": "monomer",
        "id": "2303",
        "position": {
            "x": 2.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2306": {
        "type": "monomer",
        "id": "2306",
        "position": {
            "x": 4.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2309": {
        "type": "monomer",
        "id": "2309",
        "position": {
            "x": 5.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2312": {
        "type": "monomer",
        "id": "2312",
        "position": {
            "x": 7.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2315": {
        "type": "monomer",
        "id": "2315",
        "position": {
            "x": 8.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2318": {
        "type": "monomer",
        "id": "2318",
        "position": {
            "x": 10.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2321": {
        "type": "monomer",
        "id": "2321",
        "position": {
            "x": 11.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2324": {
        "type": "monomer",
        "id": "2324",
        "position": {
            "x": 13.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2327": {
        "type": "monomer",
        "id": "2327",
        "position": {
            "x": 14.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2330": {
        "type": "monomer",
        "id": "2330",
        "position": {
            "x": 16.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2333": {
        "type": "monomer",
        "id": "2333",
        "position": {
            "x": 17.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2336": {
        "type": "monomer",
        "id": "2336",
        "position": {
            "x": 19.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2339": {
        "type": "monomer",
        "id": "2339",
        "position": {
            "x": 20.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2342": {
        "type": "monomer",
        "id": "2342",
        "position": {
            "x": 22.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2345": {
        "type": "monomer",
        "id": "2345",
        "position": {
            "x": 23.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2348": {
        "type": "monomer",
        "id": "2348",
        "position": {
            "x": 25.25,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2351": {
        "type": "monomer",
        "id": "2351",
        "position": {
            "x": 26.75,
            "y": -22.425
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2354": {
        "type": "monomer",
        "id": "2354",
        "position": {
            "x": 1.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2357": {
        "type": "monomer",
        "id": "2357",
        "position": {
            "x": 2.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2360": {
        "type": "monomer",
        "id": "2360",
        "position": {
            "x": 4.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2363": {
        "type": "monomer",
        "id": "2363",
        "position": {
            "x": 5.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2366": {
        "type": "monomer",
        "id": "2366",
        "position": {
            "x": 7.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2369": {
        "type": "monomer",
        "id": "2369",
        "position": {
            "x": 8.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2372": {
        "type": "monomer",
        "id": "2372",
        "position": {
            "x": 10.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2375": {
        "type": "monomer",
        "id": "2375",
        "position": {
            "x": 11.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2378": {
        "type": "monomer",
        "id": "2378",
        "position": {
            "x": 13.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2381": {
        "type": "monomer",
        "id": "2381",
        "position": {
            "x": 14.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2384": {
        "type": "monomer",
        "id": "2384",
        "position": {
            "x": 16.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2387": {
        "type": "monomer",
        "id": "2387",
        "position": {
            "x": 17.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2390": {
        "type": "monomer",
        "id": "2390",
        "position": {
            "x": 19.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2393": {
        "type": "monomer",
        "id": "2393",
        "position": {
            "x": 20.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2396": {
        "type": "monomer",
        "id": "2396",
        "position": {
            "x": 22.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2399": {
        "type": "monomer",
        "id": "2399",
        "position": {
            "x": 23.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2402": {
        "type": "monomer",
        "id": "2402",
        "position": {
            "x": 25.25,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2405": {
        "type": "monomer",
        "id": "2405",
        "position": {
            "x": 26.75,
            "y": -23.9375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2408": {
        "type": "monomer",
        "id": "2408",
        "position": {
            "x": 1.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2411": {
        "type": "monomer",
        "id": "2411",
        "position": {
            "x": 2.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2414": {
        "type": "monomer",
        "id": "2414",
        "position": {
            "x": 4.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2417": {
        "type": "monomer",
        "id": "2417",
        "position": {
            "x": 5.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2420": {
        "type": "monomer",
        "id": "2420",
        "position": {
            "x": 7.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2423": {
        "type": "monomer",
        "id": "2423",
        "position": {
            "x": 8.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2426": {
        "type": "monomer",
        "id": "2426",
        "position": {
            "x": 10.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2429": {
        "type": "monomer",
        "id": "2429",
        "position": {
            "x": 11.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2432": {
        "type": "monomer",
        "id": "2432",
        "position": {
            "x": 13.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2435": {
        "type": "monomer",
        "id": "2435",
        "position": {
            "x": 14.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2438": {
        "type": "monomer",
        "id": "2438",
        "position": {
            "x": 16.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2441": {
        "type": "monomer",
        "id": "2441",
        "position": {
            "x": 17.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2444": {
        "type": "monomer",
        "id": "2444",
        "position": {
            "x": 19.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2447": {
        "type": "monomer",
        "id": "2447",
        "position": {
            "x": 20.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2450": {
        "type": "monomer",
        "id": "2450",
        "position": {
            "x": 22.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2453": {
        "type": "monomer",
        "id": "2453",
        "position": {
            "x": 23.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2456": {
        "type": "monomer",
        "id": "2456",
        "position": {
            "x": 25.25,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2459": {
        "type": "monomer",
        "id": "2459",
        "position": {
            "x": 26.75,
            "y": -25.450000000000003
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2462": {
        "type": "monomer",
        "id": "2462",
        "position": {
            "x": 1.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2465": {
        "type": "monomer",
        "id": "2465",
        "position": {
            "x": 2.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2468": {
        "type": "monomer",
        "id": "2468",
        "position": {
            "x": 4.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2471": {
        "type": "monomer",
        "id": "2471",
        "position": {
            "x": 5.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2474": {
        "type": "monomer",
        "id": "2474",
        "position": {
            "x": 7.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2477": {
        "type": "monomer",
        "id": "2477",
        "position": {
            "x": 8.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2480": {
        "type": "monomer",
        "id": "2480",
        "position": {
            "x": 10.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2483": {
        "type": "monomer",
        "id": "2483",
        "position": {
            "x": 11.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2486": {
        "type": "monomer",
        "id": "2486",
        "position": {
            "x": 13.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2489": {
        "type": "monomer",
        "id": "2489",
        "position": {
            "x": 14.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2492": {
        "type": "monomer",
        "id": "2492",
        "position": {
            "x": 16.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2495": {
        "type": "monomer",
        "id": "2495",
        "position": {
            "x": 17.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2498": {
        "type": "monomer",
        "id": "2498",
        "position": {
            "x": 19.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2501": {
        "type": "monomer",
        "id": "2501",
        "position": {
            "x": 20.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2504": {
        "type": "monomer",
        "id": "2504",
        "position": {
            "x": 22.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2507": {
        "type": "monomer",
        "id": "2507",
        "position": {
            "x": 23.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2510": {
        "type": "monomer",
        "id": "2510",
        "position": {
            "x": 25.25,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2513": {
        "type": "monomer",
        "id": "2513",
        "position": {
            "x": 26.75,
            "y": -26.962500000000002
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2516": {
        "type": "monomer",
        "id": "2516",
        "position": {
            "x": 1.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2519": {
        "type": "monomer",
        "id": "2519",
        "position": {
            "x": 2.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2522": {
        "type": "monomer",
        "id": "2522",
        "position": {
            "x": 4.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2525": {
        "type": "monomer",
        "id": "2525",
        "position": {
            "x": 5.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2528": {
        "type": "monomer",
        "id": "2528",
        "position": {
            "x": 7.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2531": {
        "type": "monomer",
        "id": "2531",
        "position": {
            "x": 8.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2534": {
        "type": "monomer",
        "id": "2534",
        "position": {
            "x": 10.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2537": {
        "type": "monomer",
        "id": "2537",
        "position": {
            "x": 11.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2540": {
        "type": "monomer",
        "id": "2540",
        "position": {
            "x": 13.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2543": {
        "type": "monomer",
        "id": "2543",
        "position": {
            "x": 14.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2546": {
        "type": "monomer",
        "id": "2546",
        "position": {
            "x": 16.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2549": {
        "type": "monomer",
        "id": "2549",
        "position": {
            "x": 17.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2552": {
        "type": "monomer",
        "id": "2552",
        "position": {
            "x": 19.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2555": {
        "type": "monomer",
        "id": "2555",
        "position": {
            "x": 20.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2558": {
        "type": "monomer",
        "id": "2558",
        "position": {
            "x": 22.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2561": {
        "type": "monomer",
        "id": "2561",
        "position": {
            "x": 23.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2564": {
        "type": "monomer",
        "id": "2564",
        "position": {
            "x": 25.25,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2567": {
        "type": "monomer",
        "id": "2567",
        "position": {
            "x": 26.75,
            "y": -28.475
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2570": {
        "type": "monomer",
        "id": "2570",
        "position": {
            "x": 1.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2573": {
        "type": "monomer",
        "id": "2573",
        "position": {
            "x": 2.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2576": {
        "type": "monomer",
        "id": "2576",
        "position": {
            "x": 4.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2579": {
        "type": "monomer",
        "id": "2579",
        "position": {
            "x": 5.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2582": {
        "type": "monomer",
        "id": "2582",
        "position": {
            "x": 7.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2585": {
        "type": "monomer",
        "id": "2585",
        "position": {
            "x": 8.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2588": {
        "type": "monomer",
        "id": "2588",
        "position": {
            "x": 10.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2591": {
        "type": "monomer",
        "id": "2591",
        "position": {
            "x": 11.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2594": {
        "type": "monomer",
        "id": "2594",
        "position": {
            "x": 13.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2597": {
        "type": "monomer",
        "id": "2597",
        "position": {
            "x": 14.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2600": {
        "type": "monomer",
        "id": "2600",
        "position": {
            "x": 16.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2603": {
        "type": "monomer",
        "id": "2603",
        "position": {
            "x": 17.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2606": {
        "type": "monomer",
        "id": "2606",
        "position": {
            "x": 19.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2609": {
        "type": "monomer",
        "id": "2609",
        "position": {
            "x": 20.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2612": {
        "type": "monomer",
        "id": "2612",
        "position": {
            "x": 22.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2615": {
        "type": "monomer",
        "id": "2615",
        "position": {
            "x": 23.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2618": {
        "type": "monomer",
        "id": "2618",
        "position": {
            "x": 25.25,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2621": {
        "type": "monomer",
        "id": "2621",
        "position": {
            "x": 26.75,
            "y": -29.9875
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2624": {
        "type": "monomer",
        "id": "2624",
        "position": {
            "x": 1.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2627": {
        "type": "monomer",
        "id": "2627",
        "position": {
            "x": 2.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2630": {
        "type": "monomer",
        "id": "2630",
        "position": {
            "x": 4.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2633": {
        "type": "monomer",
        "id": "2633",
        "position": {
            "x": 5.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2636": {
        "type": "monomer",
        "id": "2636",
        "position": {
            "x": 7.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2639": {
        "type": "monomer",
        "id": "2639",
        "position": {
            "x": 8.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2642": {
        "type": "monomer",
        "id": "2642",
        "position": {
            "x": 10.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2645": {
        "type": "monomer",
        "id": "2645",
        "position": {
            "x": 11.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2648": {
        "type": "monomer",
        "id": "2648",
        "position": {
            "x": 13.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2651": {
        "type": "monomer",
        "id": "2651",
        "position": {
            "x": 14.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2654": {
        "type": "monomer",
        "id": "2654",
        "position": {
            "x": 16.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2657": {
        "type": "monomer",
        "id": "2657",
        "position": {
            "x": 17.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2660": {
        "type": "monomer",
        "id": "2660",
        "position": {
            "x": 19.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2663": {
        "type": "monomer",
        "id": "2663",
        "position": {
            "x": 20.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2666": {
        "type": "monomer",
        "id": "2666",
        "position": {
            "x": 22.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2669": {
        "type": "monomer",
        "id": "2669",
        "position": {
            "x": 23.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2672": {
        "type": "monomer",
        "id": "2672",
        "position": {
            "x": 25.25,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2675": {
        "type": "monomer",
        "id": "2675",
        "position": {
            "x": 26.75,
            "y": -31.5
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2678": {
        "type": "monomer",
        "id": "2678",
        "position": {
            "x": 1.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2681": {
        "type": "monomer",
        "id": "2681",
        "position": {
            "x": 2.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2684": {
        "type": "monomer",
        "id": "2684",
        "position": {
            "x": 4.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2687": {
        "type": "monomer",
        "id": "2687",
        "position": {
            "x": 5.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2690": {
        "type": "monomer",
        "id": "2690",
        "position": {
            "x": 7.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2693": {
        "type": "monomer",
        "id": "2693",
        "position": {
            "x": 8.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2696": {
        "type": "monomer",
        "id": "2696",
        "position": {
            "x": 10.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2699": {
        "type": "monomer",
        "id": "2699",
        "position": {
            "x": 11.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2702": {
        "type": "monomer",
        "id": "2702",
        "position": {
            "x": 13.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2705": {
        "type": "monomer",
        "id": "2705",
        "position": {
            "x": 14.75,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2708": {
        "type": "monomer",
        "id": "2708",
        "position": {
            "x": 16.25,
            "y": -33.0125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer2711": {
        "type": "monomer",
        "id": "2711",
        "position": {
            "x": 17.75,
            "y": -33.0125
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
