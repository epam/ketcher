import { Subscription, DOMSubscription } from 'subscription';
import { ReStruct } from 'application/render';
import { Struct, Vec2 } from 'domain/entities';
import {
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from 'application/editor/tools/Tool';
import { toolsMap } from 'application/editor/tools';
import { MonomerItemType } from 'domain/types';

interface ICoreEditorConstructorParams {
  theme: any;
  canvas: SVGSVGElement;
}

function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

export class CoreEditor {
  public events = {
    selectPeptide: new Subscription(),
    selectTool: new Subscription(),
  };

  public renderersContainer: ReStruct;
  public lastCursorPosition: Vec2 = new Vec2(0, 0);
  private canvas: SVGSVGElement;
  public theme: any;
  // private lastEvent: Event | undefined;
  private tool?: Tool;

  constructor({ theme, canvas }: ICoreEditorConstructorParams) {
    this.theme = theme;
    this.canvas = canvas;
    this.subscribeEvents();
    this.renderersContainer = new ReStruct(new Struct(), {
      skipRaphaelInitialization: true,
      theme,
    } as never);
    this.domEventSetup();
  }

  private subscribeEvents() {
    this.events.selectPeptide.add((peptide) => this.onSelectPeptide(peptide));
    this.events.selectTool.add((tool) => this.onSelectTool(tool));
  }

  private onSelectPeptide(peptide: MonomerItemType) {
    this.selectTool('peptide', peptide);
  }

  private onSelectTool(tool: string) {
    this.selectTool(tool);
  }

  public selectTool(name: string, options?: any) {
    const ToolConstructor: ToolConstructorInterface = toolsMap[name];

    this.tool = new ToolConstructor(this, options);
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
    const editorTool = this.tool;
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
}
