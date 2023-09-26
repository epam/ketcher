import { DOMSubscription } from 'subscription';
import {
  Bond,
  Pile,
  SGroup,
  SGroupAttachmentPoint,
  Vec2,
} from 'domain/entities';
import {
  BaseTool,
  isBaseTool,
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
  IRnaPreset,
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
import { Editor } from 'application/editor/editor.types';
import { ReAtom, ReBond, ReSGroup } from 'application/render';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Command } from 'domain/entities/Command';
import { MONOMER_CONST } from 'application/editor/operations/monomer/monomerFactory';
import { PolymerBondRenderer } from 'application/render/renderers';

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

  private onSelectMode(isSnakeMode: string) {
    PolymerBondRenderer.setSnakeMode(isSnakeMode);
    let modelChanges;
    if (isSnakeMode) {
      modelChanges = this.drawingEntitiesManager.reArrangeMonomers(
        this.canvas.width.baseVal.value,
      );
      this.renderersContainer.update(modelChanges);
    }
    modelChanges = this.drawingEntitiesManager.redrawBonds();
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

  private domEventSetup() {
    const trackedDomEvents: {
      target: Node;
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

    trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
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
      this.canvas.contains(event.target) || editorTool.isSelectionRunning?.(),
      // isContextMenuClosed(editor.contextMenu),
    ];

    if (conditions.every((condition) => condition)) {
      editorTool[eventHandlerName]?.(event);
      return true;
    }

    return false;
  }

  public switchToMicromolecules() {
    const struct = this.micromoleculesEditor.struct();
    const reStruct = this.micromoleculesEditor.render.ctab;
    let lastId = 0;
    const monomerToSgroup = new Map<BaseMonomer, SGroup>();
    const monomerToLastIndex = new Map<BaseMonomer, number>();
    this.drawingEntitiesManager.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.isMicromoleculeFragment) {
        monomer.monomerItem.struct.mergeInto(struct);
      } else {
        const monomerMicromolecule = new MonomerMicromolecule(
          SGroup.TYPES.SUP,
          monomer.position,
          monomer,
        );
        const atomIdsMap = {};
        monomerToSgroup.set(monomer, monomerMicromolecule);
        monomerToLastIndex.set(monomer, lastId);
        const sgroupId = struct.sgroups.add(monomerMicromolecule);
        monomerMicromolecule.data.name = monomer.monomerItem.label;
        monomerMicromolecule.data.expanded = false;
        monomerMicromolecule.id = sgroupId;
        monomerMicromolecule.pp = monomer.position;
        monomer.monomerItem.struct.atoms.forEach((atom, previousAtomId) => {
          const atomClone = atom.clone();
          atomClone.pp = monomer.position.add(atom.pp);
          atomClone.sgs = new Pile<number>([sgroupId]);
          atomClone.fragment = -1;
          const atomId = struct.atoms.add(atomClone);
          atomIdsMap[previousAtomId] = atomId;
          monomerMicromolecule.atoms.push(atomId);
          if (atom.rglabel) {
            monomerMicromolecule.addAttachmentPoint(
              new SGroupAttachmentPoint(atomId, undefined, undefined),
            );
          }
          reStruct.atoms.set(atomId, new ReAtom(atomClone));
        });
        struct.sGroupForest.insert(monomerMicromolecule);
        monomer.monomerItem.struct.bonds.forEach((bond) => {
          const bondClone = bond.clone();
          bondClone.begin = atomIdsMap[bondClone.begin];
          bondClone.end = atomIdsMap[bondClone.end];
          const bondId = struct.bonds.add(bondClone);
          reStruct.bonds.set(bondId, new ReBond(bondClone));
        });
        lastId = struct.atoms.size + struct.bonds.size;
        reStruct.sgroups.set(sgroupId, new ReSGroup(monomerMicromolecule));

        // struct.functionalGroups.add(new FunctionalGroup(monomerMicromolecule));
      }
      console.log(struct.clone());
    });

    this.drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      const bond = new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: monomerToSgroup
          .get(polymerBond.firstMonomer)
          ?.atoms.find(
            (atomId) =>
              Number(struct.atoms.get(atomId)?.rglabel) ===
              Number(
                polymerBond.firstMonomer
                  .getAttachmentPointByBond(polymerBond)
                  ?.replace('R', ''),
              ),
          ),
        end: monomerToSgroup
          .get(polymerBond.secondMonomer as BaseMonomer)
          ?.atoms.find((atomId) => {
            return (
              Number(struct.atoms.get(atomId)?.rglabel) ===
              Number(
                polymerBond.secondMonomer
                  ?.getAttachmentPointByBond(polymerBond)
                  ?.replace('R', ''),
              )
            );
          }),
      });
      const bondId = struct.bonds.add(bond);
      reStruct.bonds.set(bondId, new ReBond(bond));
    });
    reStruct.render.setMolecule(struct);
  }

  private switchToMacromolecules() {
    const struct = this.micromoleculesEditor.struct();
    const sgroupToMonomer = new Map<SGroup, BaseMonomer>();
    let command = new Command();
    struct.sgroups.forEach((sgroup) => {
      if (sgroup instanceof MonomerMicromolecule) {
        const monomerAdditionCommand = this.drawingEntitiesManager.addMonomer(
          sgroup.monomer.monomerItem,
          sgroup.position,
        );
        command.merge(monomerAdditionCommand);
        sgroupToMonomer.set(
          sgroup,
          monomerAdditionCommand.operations[0].monomer as BaseMonomer,
        );
      }
    });
    let fragmentNumber = 1;
    struct.frags.forEach((_fragment, fragmentId) => {
      const fragmentStruct = struct.getFragment(fragmentId);
      const fragmentBbox = fragmentStruct.getCoordBoundingBox();
      const monomerAdditionCommand = this.drawingEntitiesManager.addMonomer(
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
      command.merge(monomerAdditionCommand);
      fragmentNumber++;
    });
    this.renderersContainer.update(command);
    command = new Command();
    struct.bonds.forEach((bond) => {
      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const beginAtomAttachmentPointNumber = struct.atoms.get(
        bond.begin,
      )?.rglabel;
      const endAtomAttachmentPointNumber = struct.atoms.get(bond.end)?.rglabel;
      if (
        beginAtomAttachmentPointNumber &&
        endAtomAttachmentPointNumber &&
        beginAtomSgroup?.atoms.find(
          (atomId) =>
            struct.atoms.get(atomId)?.rglabel ===
            beginAtomAttachmentPointNumber,
        ) === bond.begin &&
        endAtomSgroup?.atoms.find(
          (atomId) =>
            struct.atoms.get(atomId)?.rglabel === endAtomAttachmentPointNumber,
        ) === bond.end &&
        beginAtomSgroup instanceof MonomerMicromolecule &&
        endAtomSgroup instanceof MonomerMicromolecule
      ) {
        const { command: polymerBondAdditionCommand, polymerBond } =
          this.drawingEntitiesManager.addPolymerBond(
            sgroupToMonomer.get(beginAtomSgroup),
            sgroupToMonomer.get(beginAtomSgroup)?.renderer?.center,
            sgroupToMonomer.get(endAtomSgroup)?.renderer?.center,
          );
        command.merge(polymerBondAdditionCommand);
        command.merge(
          this.drawingEntitiesManager.finishPolymerBondCreation(
            polymerBond,
            sgroupToMonomer.get(endAtomSgroup),
            'R' + beginAtomAttachmentPointNumber,
            'R' + endAtomAttachmentPointNumber,
          ),
        );
      }
    });
    this.renderersContainer.update(command);
    global.ketcher.editor.clear();
  }
}
