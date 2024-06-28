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
                "$ref": "monomer3370"
            },
            {
                "$ref": "monomer3371"
            },
            {
                "$ref": "monomer3372"
            },
            {
                "$ref": "monomer3373"
            },
            {
                "$ref": "monomer3374"
            },
            {
                "$ref": "monomer3375"
            },
            {
                "$ref": "monomer3376"
            },
            {
                "$ref": "monomer3377"
            },
            {
                "$ref": "monomer3378"
            },
            {
                "$ref": "monomer3379"
            },
            {
                "$ref": "monomer3380"
            },
            {
                "$ref": "monomer3381"
            },
            {
                "$ref": "monomer3382"
            },
            {
                "$ref": "monomer3383"
            },
            {
                "$ref": "monomer3384"
            },
            {
                "$ref": "monomer3385"
            },
            {
                "$ref": "monomer3386"
            },
            {
                "$ref": "monomer3387"
            },
            {
                "$ref": "monomer3388"
            },
            {
                "$ref": "monomer3389"
            },
            {
                "$ref": "monomer3390"
            },
            {
                "$ref": "monomer3391"
            },
            {
                "$ref": "monomer3392"
            },
            {
                "$ref": "monomer3393"
            },
            {
                "$ref": "monomer3394"
            },
            {
                "$ref": "monomer3395"
            },
            {
                "$ref": "monomer3396"
            },
            {
                "$ref": "monomer3397"
            },
            {
                "$ref": "monomer3398"
            },
            {
                "$ref": "monomer3399"
            },
            {
                "$ref": "monomer3400"
            },
            {
                "$ref": "monomer3401"
            },
            {
                "$ref": "monomer3402"
            },
            {
                "$ref": "monomer3403"
            },
            {
                "$ref": "monomer3404"
            },
            {
                "$ref": "monomer3405"
            },
            {
                "$ref": "monomer3406"
            },
            {
                "$ref": "monomer3407"
            },
            {
                "$ref": "monomer3408"
            },
            {
                "$ref": "monomer3409"
            },
            {
                "$ref": "monomer3410"
            },
            {
                "$ref": "monomer3411"
            },
            {
                "$ref": "monomer3412"
            },
            {
                "$ref": "monomer3413"
            },
            {
                "$ref": "monomer3414"
            },
            {
                "$ref": "monomer3415"
            },
            {
                "$ref": "monomer3416"
            },
            {
                "$ref": "monomer3417"
            },
            {
                "$ref": "monomer3418"
            },
            {
                "$ref": "monomer3419"
            },
            {
                "$ref": "monomer3420"
            },
            {
                "$ref": "monomer3421"
            },
            {
                "$ref": "monomer3422"
            },
            {
                "$ref": "monomer3423"
            },
            {
                "$ref": "monomer3424"
            },
            {
                "$ref": "monomer3425"
            },
            {
                "$ref": "monomer3426"
            },
            {
                "$ref": "monomer3427"
            },
            {
                "$ref": "monomer3428"
            },
            {
                "$ref": "monomer3429"
            },
            {
                "$ref": "monomer3430"
            },
            {
                "$ref": "monomer3431"
            },
            {
                "$ref": "monomer3432"
            },
            {
                "$ref": "monomer3433"
            },
            {
                "$ref": "monomer3434"
            },
            {
                "$ref": "monomer3435"
            },
            {
                "$ref": "monomer3436"
            },
            {
                "$ref": "monomer3437"
            },
            {
                "$ref": "monomer3438"
            },
            {
                "$ref": "monomer3439"
            },
            {
                "$ref": "monomer3440"
            },
            {
                "$ref": "monomer3441"
            },
            {
                "$ref": "monomer3442"
            },
            {
                "$ref": "monomer3443"
            },
            {
                "$ref": "monomer3444"
            },
            {
                "$ref": "monomer3445"
            },
            {
                "$ref": "monomer3446"
            },
            {
                "$ref": "monomer3447"
            },
            {
                "$ref": "monomer3448"
            },
            {
                "$ref": "monomer3449"
            },
            {
                "$ref": "monomer3450"
            },
            {
                "$ref": "monomer3451"
            },
            {
                "$ref": "monomer3452"
            },
            {
                "$ref": "monomer3453"
            },
            {
                "$ref": "monomer3454"
            },
            {
                "$ref": "monomer3455"
            },
            {
                "$ref": "monomer3456"
            },
            {
                "$ref": "monomer3457"
            },
            {
                "$ref": "monomer3458"
            },
            {
                "$ref": "monomer3459"
            },
            {
                "$ref": "monomer3460"
            },
            {
                "$ref": "monomer3461"
            },
            {
                "$ref": "monomer3462"
            },
            {
                "$ref": "monomer3463"
            },
            {
                "$ref": "monomer3464"
            },
            {
                "$ref": "monomer3465"
            },
            {
                "$ref": "monomer3466"
            },
            {
                "$ref": "monomer3467"
            },
            {
                "$ref": "monomer3468"
            },
            {
                "$ref": "monomer3469"
            },
            {
                "$ref": "monomer3470"
            },
            {
                "$ref": "monomer3471"
            },
            {
                "$ref": "monomer3472"
            },
            {
                "$ref": "monomer3473"
            },
            {
                "$ref": "monomer3474"
            },
            {
                "$ref": "monomer3475"
            },
            {
                "$ref": "monomer3476"
            },
            {
                "$ref": "monomer3477"
            },
            {
                "$ref": "monomer3478"
            },
            {
                "$ref": "monomer3479"
            },
            {
                "$ref": "monomer3480"
            },
            {
                "$ref": "monomer3481"
            },
            {
                "$ref": "monomer3482"
            },
            {
                "$ref": "monomer3483"
            },
            {
                "$ref": "monomer3484"
            },
            {
                "$ref": "monomer3485"
            },
            {
                "$ref": "monomer3486"
            },
            {
                "$ref": "monomer3487"
            },
            {
                "$ref": "monomer3488"
            },
            {
                "$ref": "monomer3489"
            },
            {
                "$ref": "monomer3490"
            },
            {
                "$ref": "monomer3491"
            },
            {
                "$ref": "monomer3492"
            },
            {
                "$ref": "monomer3493"
            },
            {
                "$ref": "monomer3494"
            },
            {
                "$ref": "monomer3495"
            },
            {
                "$ref": "monomer3496"
            },
            {
                "$ref": "monomer3497"
            },
            {
                "$ref": "monomer3498"
            },
            {
                "$ref": "monomer3499"
            },
            {
                "$ref": "monomer3500"
            },
            {
                "$ref": "monomer3501"
            },
            {
                "$ref": "monomer3502"
            },
            {
                "$ref": "monomer3503"
            },
            {
                "$ref": "monomer3504"
            },
            {
                "$ref": "monomer3505"
            },
            {
                "$ref": "monomer3506"
            },
            {
                "$ref": "monomer3507"
            },
            {
                "$ref": "monomer3508"
            },
            {
                "$ref": "monomer3509"
            },
            {
                "$ref": "monomer3510"
            },
            {
                "$ref": "monomer3511"
            },
            {
                "$ref": "monomer3512"
            },
            {
                "$ref": "monomer3513"
            },
            {
                "$ref": "monomer3514"
            },
            {
                "$ref": "monomer3515"
            },
            {
                "$ref": "monomer3516"
            },
            {
                "$ref": "monomer3517"
            },
            {
                "$ref": "monomer3518"
            },
            {
                "$ref": "monomer3519"
            },
            {
                "$ref": "monomer3520"
            },
            {
                "$ref": "monomer3521"
            },
            {
                "$ref": "monomer3522"
            },
            {
                "$ref": "monomer3523"
            },
            {
                "$ref": "monomer3524"
            },
            {
                "$ref": "monomer3525"
            },
            {
                "$ref": "monomer3526"
            },
            {
                "$ref": "monomer3527"
            },
            {
                "$ref": "monomer3528"
            },
            {
                "$ref": "monomer3529"
            },
            {
                "$ref": "monomer3530"
            },
            {
                "$ref": "monomer3531"
            },
            {
                "$ref": "monomer3532"
            },
            {
                "$ref": "monomer3533"
            },
            {
                "$ref": "monomer3534"
            },
            {
                "$ref": "monomer3535"
            },
            {
                "$ref": "monomer3536"
            },
            {
                "$ref": "monomer3537"
            },
            {
                "$ref": "monomer3538"
            },
            {
                "$ref": "monomer3539"
            },
            {
                "$ref": "monomer3540"
            },
            {
                "$ref": "monomer3541"
            },
            {
                "$ref": "monomer3542"
            },
            {
                "$ref": "monomer3543"
            },
            {
                "$ref": "monomer3544"
            },
            {
                "$ref": "monomer3545"
            },
            {
                "$ref": "monomer3546"
            },
            {
                "$ref": "monomer3547"
            },
            {
                "$ref": "monomer3548"
            },
            {
                "$ref": "monomer3549"
            },
            {
                "$ref": "monomer3550"
            },
            {
                "$ref": "monomer3551"
            },
            {
                "$ref": "monomer3552"
            },
            {
                "$ref": "monomer3553"
            },
            {
                "$ref": "monomer3554"
            },
            {
                "$ref": "monomer3555"
            },
            {
                "$ref": "monomer3556"
            },
            {
                "$ref": "monomer3557"
            },
            {
                "$ref": "monomer3558"
            },
            {
                "$ref": "monomer3559"
            },
            {
                "$ref": "monomer3560"
            },
            {
                "$ref": "monomer3561"
            }
        ],
        "connections": [
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3370",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3371",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3371",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3372",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3372",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3373",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3373",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3374",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3374",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3375",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3375",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3376",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3376",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3377",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3377",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3378",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3378",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3379",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3379",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3380",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3380",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3381",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3381",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3382",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3382",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3383",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3383",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3384",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3384",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3385",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3385",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3386",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3386",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3387",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3387",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3388",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3388",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3389",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3389",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3390",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3390",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3391",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3391",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3392",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3392",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3393",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3393",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3394",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3394",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3395",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3395",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3396",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3396",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3397",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3397",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3398",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3398",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3399",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3399",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3400",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3400",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3401",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3401",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3402",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3402",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3403",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3403",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3404",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3404",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3405",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3405",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3406",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3406",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3407",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3407",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3408",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3408",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3409",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3409",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3410",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3410",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3411",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3411",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3412",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3412",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3413",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3413",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3414",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3414",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3415",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3415",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3416",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3416",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3417",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3417",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3418",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3418",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3419",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3419",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3420",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3420",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3421",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3421",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3422",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3422",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3423",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3423",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3424",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3424",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3425",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3425",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3426",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3426",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3427",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3427",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3428",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3428",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3429",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3429",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3430",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3430",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3431",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3431",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3432",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3432",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3433",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3433",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3434",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3434",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3435",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3435",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3436",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3436",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3437",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3437",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3438",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3438",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3439",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3439",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3440",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3440",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3441",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3441",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3442",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3442",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3443",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3443",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3444",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3444",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3445",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3445",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3446",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3446",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3447",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3447",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3448",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3448",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3449",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3449",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3450",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3450",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3451",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3451",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3452",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3452",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3453",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3453",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3454",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3454",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3455",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3455",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3456",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3456",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3457",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3457",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3458",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3458",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3459",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3459",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3460",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3460",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3461",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3461",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3462",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3462",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3463",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3463",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3464",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3464",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3465",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3465",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3466",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3466",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3467",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3467",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3468",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3468",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3469",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3469",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3470",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3470",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3471",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3471",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3472",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3472",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3473",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3473",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3474",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3474",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3475",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3475",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3476",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3476",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3477",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3477",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3478",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3478",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3479",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3479",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3480",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3480",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3481",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3481",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3482",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3482",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3483",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3483",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3484",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3484",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3485",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3485",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3486",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3486",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3487",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3487",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3488",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3488",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3489",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3489",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3490",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3490",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3491",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3491",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3492",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3492",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3493",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3493",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3494",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3494",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3495",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3495",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3496",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3496",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3497",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3497",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3498",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3498",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3499",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3499",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3500",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3500",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3501",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3501",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3502",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3502",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3503",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3503",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3504",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3504",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3505",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3505",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3506",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3506",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3507",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3507",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3508",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3508",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3509",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3509",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3510",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3510",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3511",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3511",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3512",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3512",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3513",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3513",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3514",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3514",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3515",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3515",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3516",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3516",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3517",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3517",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3518",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3518",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3519",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3519",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3520",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3520",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3521",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3521",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3522",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3522",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3523",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3523",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3524",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3524",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3525",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3525",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3526",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3526",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3527",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3527",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3528",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3528",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3529",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3529",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3530",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3530",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3531",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3531",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3532",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3532",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3533",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3533",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3534",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3534",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3535",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3535",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3536",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3536",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3537",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3537",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3538",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3538",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3539",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3539",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3540",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3540",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3541",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3541",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3542",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3542",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3543",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3543",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3544",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3544",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3545",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3545",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3546",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3546",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3547",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3547",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3548",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3548",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3549",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3549",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3550",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3550",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3551",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3551",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3552",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3552",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3553",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3553",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3554",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3554",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3555",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3555",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3556",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3556",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3557",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3557",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3558",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3558",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3559",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3559",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3560",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3560",
                    "attachmentPointId": "R2"
                },
                "endpoint2": {
                    "monomerId": "monomer3561",
                    "attachmentPointId": "R1"
                }
            },
            {
                "connectionType": "single",
                "endpoint1": {
                    "monomerId": "monomer3412",
                    "attachmentPointId": "R3"
                },
                "endpoint2": {
                    "monomerId": "monomer3463",
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
    "monomer3370": {
        "type": "monomer",
        "id": "3370",
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
    "monomer3371": {
        "type": "monomer",
        "id": "3371",
        "position": {
            "x": 2.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3372": {
        "type": "monomer",
        "id": "3372",
        "position": {
            "x": 4.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3373": {
        "type": "monomer",
        "id": "3373",
        "position": {
            "x": 5.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3374": {
        "type": "monomer",
        "id": "3374",
        "position": {
            "x": 7.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3375": {
        "type": "monomer",
        "id": "3375",
        "position": {
            "x": 8.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3376": {
        "type": "monomer",
        "id": "3376",
        "position": {
            "x": 10.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3377": {
        "type": "monomer",
        "id": "3377",
        "position": {
            "x": 11.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3378": {
        "type": "monomer",
        "id": "3378",
        "position": {
            "x": 13.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3379": {
        "type": "monomer",
        "id": "3379",
        "position": {
            "x": 14.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3380": {
        "type": "monomer",
        "id": "3380",
        "position": {
            "x": 16.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3381": {
        "type": "monomer",
        "id": "3381",
        "position": {
            "x": 17.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3382": {
        "type": "monomer",
        "id": "3382",
        "position": {
            "x": 19.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3383": {
        "type": "monomer",
        "id": "3383",
        "position": {
            "x": 20.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3384": {
        "type": "monomer",
        "id": "3384",
        "position": {
            "x": 22.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3385": {
        "type": "monomer",
        "id": "3385",
        "position": {
            "x": 23.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3386": {
        "type": "monomer",
        "id": "3386",
        "position": {
            "x": 25.25,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3387": {
        "type": "monomer",
        "id": "3387",
        "position": {
            "x": 26.75,
            "y": -1.25
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3388": {
        "type": "monomer",
        "id": "3388",
        "position": {
            "x": 1.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3389": {
        "type": "monomer",
        "id": "3389",
        "position": {
            "x": 2.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3390": {
        "type": "monomer",
        "id": "3390",
        "position": {
            "x": 4.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3391": {
        "type": "monomer",
        "id": "3391",
        "position": {
            "x": 5.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3392": {
        "type": "monomer",
        "id": "3392",
        "position": {
            "x": 7.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3393": {
        "type": "monomer",
        "id": "3393",
        "position": {
            "x": 8.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3394": {
        "type": "monomer",
        "id": "3394",
        "position": {
            "x": 10.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3395": {
        "type": "monomer",
        "id": "3395",
        "position": {
            "x": 11.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3396": {
        "type": "monomer",
        "id": "3396",
        "position": {
            "x": 13.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3397": {
        "type": "monomer",
        "id": "3397",
        "position": {
            "x": 14.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3398": {
        "type": "monomer",
        "id": "3398",
        "position": {
            "x": 16.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3399": {
        "type": "monomer",
        "id": "3399",
        "position": {
            "x": 17.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3400": {
        "type": "monomer",
        "id": "3400",
        "position": {
            "x": 19.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3401": {
        "type": "monomer",
        "id": "3401",
        "position": {
            "x": 20.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3402": {
        "type": "monomer",
        "id": "3402",
        "position": {
            "x": 22.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3403": {
        "type": "monomer",
        "id": "3403",
        "position": {
            "x": 23.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3404": {
        "type": "monomer",
        "id": "3404",
        "position": {
            "x": 25.25,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3405": {
        "type": "monomer",
        "id": "3405",
        "position": {
            "x": 26.75,
            "y": -2.7625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3406": {
        "type": "monomer",
        "id": "3406",
        "position": {
            "x": 1.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3407": {
        "type": "monomer",
        "id": "3407",
        "position": {
            "x": 2.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3408": {
        "type": "monomer",
        "id": "3408",
        "position": {
            "x": 4.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3409": {
        "type": "monomer",
        "id": "3409",
        "position": {
            "x": 5.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3410": {
        "type": "monomer",
        "id": "3410",
        "position": {
            "x": 7.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3411": {
        "type": "monomer",
        "id": "3411",
        "position": {
            "x": 8.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3412": {
        "type": "monomer",
        "id": "3412",
        "position": {
            "x": 10.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3413": {
        "type": "monomer",
        "id": "3413",
        "position": {
            "x": 11.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3414": {
        "type": "monomer",
        "id": "3414",
        "position": {
            "x": 13.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3415": {
        "type": "monomer",
        "id": "3415",
        "position": {
            "x": 14.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3416": {
        "type": "monomer",
        "id": "3416",
        "position": {
            "x": 16.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3417": {
        "type": "monomer",
        "id": "3417",
        "position": {
            "x": 17.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3418": {
        "type": "monomer",
        "id": "3418",
        "position": {
            "x": 19.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3419": {
        "type": "monomer",
        "id": "3419",
        "position": {
            "x": 20.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3420": {
        "type": "monomer",
        "id": "3420",
        "position": {
            "x": 22.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3421": {
        "type": "monomer",
        "id": "3421",
        "position": {
            "x": 23.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3422": {
        "type": "monomer",
        "id": "3422",
        "position": {
            "x": 25.25,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3423": {
        "type": "monomer",
        "id": "3423",
        "position": {
            "x": 26.75,
            "y": -4.275
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3424": {
        "type": "monomer",
        "id": "3424",
        "position": {
            "x": 1.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3425": {
        "type": "monomer",
        "id": "3425",
        "position": {
            "x": 2.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3426": {
        "type": "monomer",
        "id": "3426",
        "position": {
            "x": 4.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3427": {
        "type": "monomer",
        "id": "3427",
        "position": {
            "x": 5.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3428": {
        "type": "monomer",
        "id": "3428",
        "position": {
            "x": 7.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3429": {
        "type": "monomer",
        "id": "3429",
        "position": {
            "x": 8.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3430": {
        "type": "monomer",
        "id": "3430",
        "position": {
            "x": 10.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3431": {
        "type": "monomer",
        "id": "3431",
        "position": {
            "x": 11.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3432": {
        "type": "monomer",
        "id": "3432",
        "position": {
            "x": 13.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3433": {
        "type": "monomer",
        "id": "3433",
        "position": {
            "x": 14.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3434": {
        "type": "monomer",
        "id": "3434",
        "position": {
            "x": 16.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3435": {
        "type": "monomer",
        "id": "3435",
        "position": {
            "x": 17.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3436": {
        "type": "monomer",
        "id": "3436",
        "position": {
            "x": 19.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3437": {
        "type": "monomer",
        "id": "3437",
        "position": {
            "x": 20.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3438": {
        "type": "monomer",
        "id": "3438",
        "position": {
            "x": 22.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3439": {
        "type": "monomer",
        "id": "3439",
        "position": {
            "x": 23.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3440": {
        "type": "monomer",
        "id": "3440",
        "position": {
            "x": 25.25,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3441": {
        "type": "monomer",
        "id": "3441",
        "position": {
            "x": 26.75,
            "y": -5.7875000000000005
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3442": {
        "type": "monomer",
        "id": "3442",
        "position": {
            "x": 1.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3443": {
        "type": "monomer",
        "id": "3443",
        "position": {
            "x": 2.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3444": {
        "type": "monomer",
        "id": "3444",
        "position": {
            "x": 4.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3445": {
        "type": "monomer",
        "id": "3445",
        "position": {
            "x": 5.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3446": {
        "type": "monomer",
        "id": "3446",
        "position": {
            "x": 7.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3447": {
        "type": "monomer",
        "id": "3447",
        "position": {
            "x": 8.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3448": {
        "type": "monomer",
        "id": "3448",
        "position": {
            "x": 10.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3449": {
        "type": "monomer",
        "id": "3449",
        "position": {
            "x": 11.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3450": {
        "type": "monomer",
        "id": "3450",
        "position": {
            "x": 13.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3451": {
        "type": "monomer",
        "id": "3451",
        "position": {
            "x": 14.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3452": {
        "type": "monomer",
        "id": "3452",
        "position": {
            "x": 16.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3453": {
        "type": "monomer",
        "id": "3453",
        "position": {
            "x": 17.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3454": {
        "type": "monomer",
        "id": "3454",
        "position": {
            "x": 19.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3455": {
        "type": "monomer",
        "id": "3455",
        "position": {
            "x": 20.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3456": {
        "type": "monomer",
        "id": "3456",
        "position": {
            "x": 22.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3457": {
        "type": "monomer",
        "id": "3457",
        "position": {
            "x": 23.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3458": {
        "type": "monomer",
        "id": "3458",
        "position": {
            "x": 25.25,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3459": {
        "type": "monomer",
        "id": "3459",
        "position": {
            "x": 26.75,
            "y": -7.300000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3460": {
        "type": "monomer",
        "id": "3460",
        "position": {
            "x": 1.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3461": {
        "type": "monomer",
        "id": "3461",
        "position": {
            "x": 2.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3462": {
        "type": "monomer",
        "id": "3462",
        "position": {
            "x": 4.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3463": {
        "type": "monomer",
        "id": "3463",
        "position": {
            "x": 5.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3464": {
        "type": "monomer",
        "id": "3464",
        "position": {
            "x": 7.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3465": {
        "type": "monomer",
        "id": "3465",
        "position": {
            "x": 8.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3466": {
        "type": "monomer",
        "id": "3466",
        "position": {
            "x": 10.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3467": {
        "type": "monomer",
        "id": "3467",
        "position": {
            "x": 11.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3468": {
        "type": "monomer",
        "id": "3468",
        "position": {
            "x": 13.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3469": {
        "type": "monomer",
        "id": "3469",
        "position": {
            "x": 14.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3470": {
        "type": "monomer",
        "id": "3470",
        "position": {
            "x": 16.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3471": {
        "type": "monomer",
        "id": "3471",
        "position": {
            "x": 17.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3472": {
        "type": "monomer",
        "id": "3472",
        "position": {
            "x": 19.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3473": {
        "type": "monomer",
        "id": "3473",
        "position": {
            "x": 20.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3474": {
        "type": "monomer",
        "id": "3474",
        "position": {
            "x": 22.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3475": {
        "type": "monomer",
        "id": "3475",
        "position": {
            "x": 23.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3476": {
        "type": "monomer",
        "id": "3476",
        "position": {
            "x": 25.25,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3477": {
        "type": "monomer",
        "id": "3477",
        "position": {
            "x": 26.75,
            "y": -8.8125
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3478": {
        "type": "monomer",
        "id": "3478",
        "position": {
            "x": 1.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3479": {
        "type": "monomer",
        "id": "3479",
        "position": {
            "x": 2.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3480": {
        "type": "monomer",
        "id": "3480",
        "position": {
            "x": 4.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3481": {
        "type": "monomer",
        "id": "3481",
        "position": {
            "x": 5.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3482": {
        "type": "monomer",
        "id": "3482",
        "position": {
            "x": 7.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3483": {
        "type": "monomer",
        "id": "3483",
        "position": {
            "x": 8.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3484": {
        "type": "monomer",
        "id": "3484",
        "position": {
            "x": 10.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3485": {
        "type": "monomer",
        "id": "3485",
        "position": {
            "x": 11.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3486": {
        "type": "monomer",
        "id": "3486",
        "position": {
            "x": 13.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3487": {
        "type": "monomer",
        "id": "3487",
        "position": {
            "x": 14.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3488": {
        "type": "monomer",
        "id": "3488",
        "position": {
            "x": 16.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3489": {
        "type": "monomer",
        "id": "3489",
        "position": {
            "x": 17.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3490": {
        "type": "monomer",
        "id": "3490",
        "position": {
            "x": 19.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3491": {
        "type": "monomer",
        "id": "3491",
        "position": {
            "x": 20.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3492": {
        "type": "monomer",
        "id": "3492",
        "position": {
            "x": 22.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3493": {
        "type": "monomer",
        "id": "3493",
        "position": {
            "x": 23.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3494": {
        "type": "monomer",
        "id": "3494",
        "position": {
            "x": 25.25,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3495": {
        "type": "monomer",
        "id": "3495",
        "position": {
            "x": 26.75,
            "y": -10.325000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3496": {
        "type": "monomer",
        "id": "3496",
        "position": {
            "x": 1.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3497": {
        "type": "monomer",
        "id": "3497",
        "position": {
            "x": 2.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3498": {
        "type": "monomer",
        "id": "3498",
        "position": {
            "x": 4.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3499": {
        "type": "monomer",
        "id": "3499",
        "position": {
            "x": 5.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3500": {
        "type": "monomer",
        "id": "3500",
        "position": {
            "x": 7.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3501": {
        "type": "monomer",
        "id": "3501",
        "position": {
            "x": 8.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3502": {
        "type": "monomer",
        "id": "3502",
        "position": {
            "x": 10.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3503": {
        "type": "monomer",
        "id": "3503",
        "position": {
            "x": 11.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3504": {
        "type": "monomer",
        "id": "3504",
        "position": {
            "x": 13.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3505": {
        "type": "monomer",
        "id": "3505",
        "position": {
            "x": 14.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3506": {
        "type": "monomer",
        "id": "3506",
        "position": {
            "x": 16.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3507": {
        "type": "monomer",
        "id": "3507",
        "position": {
            "x": 17.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3508": {
        "type": "monomer",
        "id": "3508",
        "position": {
            "x": 19.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3509": {
        "type": "monomer",
        "id": "3509",
        "position": {
            "x": 20.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3510": {
        "type": "monomer",
        "id": "3510",
        "position": {
            "x": 22.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3511": {
        "type": "monomer",
        "id": "3511",
        "position": {
            "x": 23.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3512": {
        "type": "monomer",
        "id": "3512",
        "position": {
            "x": 25.25,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3513": {
        "type": "monomer",
        "id": "3513",
        "position": {
            "x": 26.75,
            "y": -11.8375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3514": {
        "type": "monomer",
        "id": "3514",
        "position": {
            "x": 1.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3515": {
        "type": "monomer",
        "id": "3515",
        "position": {
            "x": 2.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3516": {
        "type": "monomer",
        "id": "3516",
        "position": {
            "x": 4.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3517": {
        "type": "monomer",
        "id": "3517",
        "position": {
            "x": 5.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3518": {
        "type": "monomer",
        "id": "3518",
        "position": {
            "x": 7.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3519": {
        "type": "monomer",
        "id": "3519",
        "position": {
            "x": 8.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3520": {
        "type": "monomer",
        "id": "3520",
        "position": {
            "x": 10.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3521": {
        "type": "monomer",
        "id": "3521",
        "position": {
            "x": 11.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3522": {
        "type": "monomer",
        "id": "3522",
        "position": {
            "x": 13.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3523": {
        "type": "monomer",
        "id": "3523",
        "position": {
            "x": 14.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3524": {
        "type": "monomer",
        "id": "3524",
        "position": {
            "x": 16.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3525": {
        "type": "monomer",
        "id": "3525",
        "position": {
            "x": 17.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3526": {
        "type": "monomer",
        "id": "3526",
        "position": {
            "x": 19.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3527": {
        "type": "monomer",
        "id": "3527",
        "position": {
            "x": 20.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3528": {
        "type": "monomer",
        "id": "3528",
        "position": {
            "x": 22.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3529": {
        "type": "monomer",
        "id": "3529",
        "position": {
            "x": 23.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3530": {
        "type": "monomer",
        "id": "3530",
        "position": {
            "x": 25.25,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3531": {
        "type": "monomer",
        "id": "3531",
        "position": {
            "x": 26.75,
            "y": -13.350000000000001
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3532": {
        "type": "monomer",
        "id": "3532",
        "position": {
            "x": 1.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3533": {
        "type": "monomer",
        "id": "3533",
        "position": {
            "x": 2.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3534": {
        "type": "monomer",
        "id": "3534",
        "position": {
            "x": 4.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3535": {
        "type": "monomer",
        "id": "3535",
        "position": {
            "x": 5.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3536": {
        "type": "monomer",
        "id": "3536",
        "position": {
            "x": 7.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3537": {
        "type": "monomer",
        "id": "3537",
        "position": {
            "x": 8.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3538": {
        "type": "monomer",
        "id": "3538",
        "position": {
            "x": 10.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3539": {
        "type": "monomer",
        "id": "3539",
        "position": {
            "x": 11.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3540": {
        "type": "monomer",
        "id": "3540",
        "position": {
            "x": 13.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3541": {
        "type": "monomer",
        "id": "3541",
        "position": {
            "x": 14.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3542": {
        "type": "monomer",
        "id": "3542",
        "position": {
            "x": 16.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3543": {
        "type": "monomer",
        "id": "3543",
        "position": {
            "x": 17.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3544": {
        "type": "monomer",
        "id": "3544",
        "position": {
            "x": 19.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3545": {
        "type": "monomer",
        "id": "3545",
        "position": {
            "x": 20.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3546": {
        "type": "monomer",
        "id": "3546",
        "position": {
            "x": 22.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3547": {
        "type": "monomer",
        "id": "3547",
        "position": {
            "x": 23.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3548": {
        "type": "monomer",
        "id": "3548",
        "position": {
            "x": 25.25,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3549": {
        "type": "monomer",
        "id": "3549",
        "position": {
            "x": 26.75,
            "y": -14.8625
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3550": {
        "type": "monomer",
        "id": "3550",
        "position": {
            "x": 1.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3551": {
        "type": "monomer",
        "id": "3551",
        "position": {
            "x": 2.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3552": {
        "type": "monomer",
        "id": "3552",
        "position": {
            "x": 4.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3553": {
        "type": "monomer",
        "id": "3553",
        "position": {
            "x": 5.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3554": {
        "type": "monomer",
        "id": "3554",
        "position": {
            "x": 7.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3555": {
        "type": "monomer",
        "id": "3555",
        "position": {
            "x": 8.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3556": {
        "type": "monomer",
        "id": "3556",
        "position": {
            "x": 10.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3557": {
        "type": "monomer",
        "id": "3557",
        "position": {
            "x": 11.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3558": {
        "type": "monomer",
        "id": "3558",
        "position": {
            "x": 13.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3559": {
        "type": "monomer",
        "id": "3559",
        "position": {
            "x": 14.75,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3560": {
        "type": "monomer",
        "id": "3560",
        "position": {
            "x": 16.25,
            "y": -16.375
        },
        "alias": "C",
        "templateId": "C___Cysteine"
    },
    "monomer3561": {
        "type": "monomer",
        "id": "3561",
        "position": {
            "x": 17.75,
            "y": -16.375
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
