import { DOMSubscription } from 'subscription';
import {
  Atom,
  Bond,
  FunctionalGroup,
  Pile,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import {
  BaseTool,
  IRnaPreset,
  isBaseTool,
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from 'application/editor/tools/Tool';
import { toolsMap } from 'application/editor/tools';
import { MonomerItemType } from 'domain/types';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  editorEvents,
  renderersEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { PolymerBondRenderer } from 'application/render/renderers';
import { Editor } from 'application/editor/editor.types';
import { ReAtom, ReBond, ReSGroup, ReStruct } from 'application/render';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Command } from 'domain/entities/Command';
import { MONOMER_CONST } from 'application/editor/operations/monomer/monomerFactory';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';

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
  public canvas: SVGSVGElement;
  public canvasOffset: DOMRect;
  public theme;
  // private lastEvent: Event | undefined;
  private tool?: Tool | BaseTool;
  private micromoleculesEditor: Editor;

  constructor({ theme, canvas }: ICoreEditorConstructorParams) {
    this.theme = theme;
    this.canvas = canvas;
    resetEditorEvents();
    this.events = editorEvents;
    this.subscribeEvents();
    this.renderersContainer = new RenderersManager({ theme });
    this.drawingEntitiesManager = new DrawingEntitiesManager();
    this.domEventSetup();
    this.canvasOffset = this.canvas.getBoundingClientRect();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    editor = this;
    this.micromoleculesEditor = global.ketcher.editor;
    this.switchToMacromolecules();
  }

  static provideEditorInstance(): CoreEditor {
    return editor;
  }

  private subscribeEvents() {
    this.events.selectMonomer.add((monomer) => this.onSelectMonomer(monomer));
    this.events.selectPreset.add((preset) => this.onSelectRNAPreset(preset));
    this.events.selectTool.add((tool) => this.onSelectTool(tool));
    this.events.selectMode.add((isSnakeMode) => this.onSelectMode(isSnakeMode));

    renderersEvents.forEach((eventName) => {
      this.events[eventName].add((event) =>
        this.useToolIfNeeded(eventName, event),
      );
    });
  }

  private onSelectMonomer(monomer: MonomerItemType) {
    this.selectTool('monomer', monomer);
  }

  private onSelectRNAPreset(preset: IRnaPreset) {
    this.selectTool('preset', preset);
  }

  private onSelectTool(tool: string) {
    this.selectTool(tool);
  }

  // todo we need to create abstraction layer for modes in future similar to the tools layer
  private onSelectMode(isSnakeMode: boolean) {
    PolymerBondRenderer.setSnakeMode(isSnakeMode);
    const modelChanges = this.drawingEntitiesManager.reArrangeChains(
      this.canvas.width.baseVal.value,
      isSnakeMode,
    );
    this.renderersContainer.update(modelChanges);
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
      const clientAreaBoundingBox = this.canvas.getBoundingClientRect();

      this.lastCursorPosition = new Vec2({
        x: event.pageX - clientAreaBoundingBox.x,
        y: event.pageY - clientAreaBoundingBox.y,
      });
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

  private static convertMonomerToMonomerMicromolecule(
    monomer: BaseMonomer,
    struct: Struct,
  ) {
    const monomerMicromolecule = new MonomerMicromolecule(
      SGroup.TYPES.SUP,
      monomer,
    );
    const sgroupId = struct.sgroups.add(monomerMicromolecule);

    monomerMicromolecule.data.name = monomer.monomerItem.label;
    monomerMicromolecule.data.expanded = false;
    monomerMicromolecule.id = sgroupId;
    monomerMicromolecule.pp = monomer.position;

    return monomerMicromolecule;
  }

  private static addMonomerAtomToStruct(
    atom: Atom,
    monomer: BaseMonomer,
    monomerMicromolecule: MonomerMicromolecule,
    struct: Struct,
  ) {
    const atomClone = atom.clone();
    atomClone.pp = monomer.position.add(atom.pp);
    atomClone.sgs = new Pile<number>([monomerMicromolecule.id]);
    atomClone.fragment = -1;
    const atomId = struct.atoms.add(atomClone);
    monomerMicromolecule.atoms.push(atomId);
    if (atom.rglabel) {
      monomerMicromolecule.addAttachmentPoint(
        new SGroupAttachmentPoint(atomId, undefined, undefined),
      );
    }

    return { atomId, atom: atomClone };
  }

  private static findAttachmentPointAtom(
    sgroup: SGroup,
    polymerBond: PolymerBond,
    monomer: BaseMonomer,
    struct: Struct,
  ) {
    return sgroup.atoms.find(
      (atomId) =>
        Number(struct.atoms.get(atomId)?.rglabel) ===
        Number(monomer.getAttachmentPointByBond(polymerBond)?.replace('R', '')),
    );
  }

  public static convertDrawingEntitiesToStruct(
    drawingEntitiesManager: DrawingEntitiesManager,
    struct: Struct,
    reStruct?: ReStruct,
  ) {
    const monomerToSgroup = new Map<BaseMonomer, SGroup>();
    drawingEntitiesManager.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.isMicromoleculeFragment) {
        monomer.monomerItem.struct.mergeInto(struct);
      } else {
        const atomIdsMap = {};
        const monomerMicromolecule = this.convertMonomerToMonomerMicromolecule(
          monomer,
          struct,
        );
        monomerToSgroup.set(monomer, monomerMicromolecule);
        reStruct?.sgroups.set(
          monomerMicromolecule.id,
          new ReSGroup(monomerMicromolecule),
        );

        monomer.monomerItem.struct.atoms.forEach((oldAtom, oldAtomId) => {
          const { atom, atomId } = this.addMonomerAtomToStruct(
            oldAtom,
            monomer,
            monomerMicromolecule,
            struct,
          );
          atomIdsMap[oldAtomId] = atomId;
          reStruct?.atoms.set(atomId, new ReAtom(atom));
        });

        struct.sGroupForest.insert(monomerMicromolecule);
        monomer.monomerItem.struct.bonds.forEach((bond) => {
          const bondClone = bond.clone();
          bondClone.begin = atomIdsMap[bondClone.begin];
          bondClone.end = atomIdsMap[bondClone.end];
          const bondId = struct.bonds.add(bondClone);
          reStruct?.bonds.set(bondId, new ReBond(bondClone));
        });

        struct.functionalGroups.add(new FunctionalGroup(monomerMicromolecule));
      }
    });

    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      const bond = new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: this.findAttachmentPointAtom(
          monomerToSgroup.get(polymerBond.firstMonomer) as SGroup,
          polymerBond,
          polymerBond.firstMonomer,
          struct,
        ),
        end: this.findAttachmentPointAtom(
          monomerToSgroup.get(polymerBond.secondMonomer) as SGroup,
          polymerBond,
          polymerBond.secondMonomer,
          struct,
        ),
      });
      const bondId = struct.bonds.add(bond);
      reStruct?.bonds.set(bondId, new ReBond(bond));
    });

    return { struct, reStruct };
  }

  private static convertMonomerMicromoleculeToMonomer(
    monomerMicromolecule: MonomerMicromolecule,
    drawingEntitiesManager: DrawingEntitiesManager,
    sgroupToMonomer: Map<SGroup, BaseMonomer>,
  ) {
    const command = new Command();
    const monomerAdditionCommand = drawingEntitiesManager.addMonomer(
      monomerMicromolecule.monomer.monomerItem,
      monomerMicromolecule.pp as Vec2,
    );
    command.merge(monomerAdditionCommand);
    sgroupToMonomer.set(
      monomerMicromolecule,
      monomerAdditionCommand.operations[0].monomer as BaseMonomer,
    );

    return command;
  }

  private static convertFragmentToChem(
    fragmentNumber: number,
    fragmentStruct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const fragmentBbox = fragmentStruct.getCoordBoundingBox();
    return drawingEntitiesManager.addMonomer(
      {
        struct: fragmentStruct,
        label: 'F' + fragmentNumber,
        colorScheme: undefined,
        favorite: false,
        props: {
          Name: 'F' + fragmentNumber,
          MonomerNaturalAnalogCode: '',
          MonomerName: 'F' + fragmentNumber,
          MonomerType: MONOMER_CONST.CHEM,
          isMicromoleculeFragment: true,
        },
      },
      new Vec2(
        fragmentBbox.max.x - (fragmentBbox.max.x - fragmentBbox.min.x) / 2,
        fragmentBbox.max.y - (fragmentBbox.max.y - fragmentBbox.min.y) / 2,
      ),
    );
  }

  public static getAttachmentPointNumber(atomId: number, struct: Struct) {
    return struct.atoms.get(atomId)?.rglabel;
  }

  public static convertStructToDrawingEntities(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const sgroupToMonomer = new Map<SGroup, BaseMonomer>();
    const command = new Command();
    struct.sgroups.forEach((sgroup) => {
      if (sgroup instanceof MonomerMicromolecule) {
        command.merge(
          this.convertMonomerMicromoleculeToMonomer(
            sgroup,
            drawingEntitiesManager,
            sgroupToMonomer,
          ),
        );
      }
    });
    let fragmentNumber = 1;
    struct.frags.forEach((_fragment, fragmentId) => {
      const fragmentStruct = struct.getFragment(fragmentId);
      command.merge(
        this.convertFragmentToChem(
          fragmentNumber,
          fragmentStruct,
          drawingEntitiesManager,
        ),
      );
      fragmentNumber++;
    });
    struct.bonds.forEach((bond) => {
      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const beginAtomAttachmentPointNumber =
        CoreEditor.getAttachmentPointNumber(bond.begin, struct);
      const endAtomAttachmentPointNumber = CoreEditor.getAttachmentPointNumber(
        bond.end,
        struct,
      );
      if (
        beginAtomAttachmentPointNumber &&
        endAtomAttachmentPointNumber &&
        beginAtomSgroup instanceof MonomerMicromolecule &&
        endAtomSgroup instanceof MonomerMicromolecule
      ) {
        const { command: polymerBondAdditionCommand, polymerBond } =
          drawingEntitiesManager.addPolymerBond(
            sgroupToMonomer.get(beginAtomSgroup),
            sgroupToMonomer.get(beginAtomSgroup)?.position,
            sgroupToMonomer.get(endAtomSgroup)?.position,
          );
        command.merge(polymerBondAdditionCommand);
        command.merge(
          drawingEntitiesManager.finishPolymerBondCreation(
            polymerBond,
            sgroupToMonomer.get(endAtomSgroup),
            'R' + beginAtomAttachmentPointNumber,
            'R' + endAtomAttachmentPointNumber,
          ),
        );
      }
    });

    return { drawingEntitiesManager, modelChanges: command };
  }

  public switchToMicromolecules() {
    this.unsubscribeEvents();
    const struct = this.micromoleculesEditor.struct();
    const reStruct = this.micromoleculesEditor.render.ctab;
    CoreEditor.convertDrawingEntitiesToStruct(
      this.drawingEntitiesManager,
      struct,
      reStruct,
    );
    reStruct.render.setMolecule(struct);
  }

  private switchToMacromolecules() {
    const struct = this.micromoleculesEditor.struct();
    const { modelChanges } = CoreEditor.convertStructToDrawingEntities(
      struct,
      this.drawingEntitiesManager,
    );
    this.renderersContainer.update(modelChanges);
    global.ketcher.editor.clear();
  }
}
