/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  Action,
  FloatingToolsParams,
  Editor as KetcherEditor,
  Pile,
  Render,
  Scale,
  Struct,
  Vec2,
  fromDescriptorsAlign,
  fromMultipleMove,
  fromNewCanvas,
} from 'ketcher-core';
import {
  DOMSubscription,
  PipelineSubscription,
  Subscription,
} from 'subscription';

import closest from './shared/closest';
import { customOnChangeHandler } from './utils';
import { isEqual } from 'lodash/fp';
import { toolsMap } from './tool';
import { Highlighter } from './highlighter';
import { setFunctionalGroupsTooltip } from './utils/functionalGroupsTooltip';
import { contextMenuInfo } from '../ui/views/components/ContextMenu/contextMenu.types';
import { HoverIcon } from './HoverIcon';
import RotateController from './tool/rotate-controller';
import {
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from './tool/Tool';
import { getSelectionMap, getStructCenter } from './utils/structLayout';

const SCALE = 40;
const HISTORY_SIZE = 32; // put me to options

const structObjects = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts',
];

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'functionalGroups',
  'frags',
  'merge',
  'rgroups',
  'rgroupAttachmentPoints',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects',
  'texts',
];

function selectStereoFlagsIfNecessary(
  atoms: any,
  expAtoms: number[],
): number[] {
  const atomsOfFragments = {};
  atoms.forEach((atom, atomId) => {
    atomsOfFragments[atom.fragment]
      ? atomsOfFragments[atom.fragment].push(atomId)
      : (atomsOfFragments[atom.fragment] = [atomId]);
  });

  const stereoFlags: number[] = [];

  Object.keys(atomsOfFragments).forEach((fragId) => {
    let shouldSelSFlag = true;
    atomsOfFragments[fragId].forEach((atomId) => {
      if (!expAtoms.includes(atomId)) shouldSelSFlag = false;
    });
    shouldSelSFlag && stereoFlags.push(Number(fragId));
  });
  return stereoFlags;
}

export interface Selection {
  atoms?: Array<number>;
  bonds?: Array<number>;
  enhancedFlags?: Array<number>;
  rxnPluses?: Array<number>;
  rxnArrows?: Array<number>;
  texts?: Array<number>;
  rgroupAttachmentPoints?: Array<number>;
}

class Editor implements KetcherEditor {
  #origin?: any;
  render: Render;
  _selection: Selection | null;
  _tool: Tool | null;
  historyStack: any;
  historyPtr: any;
  errorHandler: ((message: string) => void) | null;
  highlights: Highlighter;
  hoverIcon: HoverIcon;
  lastCursorPosition: { x: number; y: number };
  contextMenu: contextMenuInfo;
  rotateController: RotateController;
  event: {
    message: Subscription;
    elementEdit: PipelineSubscription;
    zoomIn: PipelineSubscription;
    zoomOut: PipelineSubscription;
    bondEdit: PipelineSubscription;
    rgroupEdit: PipelineSubscription;
    sgroupEdit: PipelineSubscription;
    sdataEdit: PipelineSubscription;
    quickEdit: PipelineSubscription;
    attachEdit: PipelineSubscription;
    removeFG: PipelineSubscription;
    change: Subscription;
    selectionChange: PipelineSubscription;
    aromatizeStruct: PipelineSubscription;
    dearomatizeStruct: PipelineSubscription;
    enhancedStereoEdit: PipelineSubscription;
    confirm: PipelineSubscription;
    showInfo: PipelineSubscription;
    apiSettings: PipelineSubscription;
    cursor: Subscription;
    updateFloatingTools: Subscription<FloatingToolsParams>;
  };

  lastEvent: any;
  macromoleculeConvertionError: string | null | undefined;

  constructor(clientArea, options) {
    this.render = new Render(
      clientArea,
      Object.assign(
        {
          microModeScale: SCALE,
        },
        options,
      ),
      options.reuseRestructIfExist !== false,
    );

    this._selection = null; // eslint-disable-line
    this._tool = null; // eslint-disable-line
    this.historyStack = [];
    this.historyPtr = 0;
    this.errorHandler = null;
    this.highlights = new Highlighter(this);
    this.renderAndRecoordinateStruct =
      this.renderAndRecoordinateStruct.bind(this);
    this.setOptions = this.setOptions.bind(this);

    this.lastCursorPosition = {
      x: 0,
      y: 0,
    };
    this.hoverIcon = new HoverIcon(this);
    this.hoverIcon.updatePosition();
    this.contextMenu = {};
    this.rotateController = new RotateController(this);

    this.event = {
      message: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      zoomIn: new PipelineSubscription(),
      zoomOut: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      removeFG: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription(),
      confirm: new PipelineSubscription(),
      cursor: new PipelineSubscription(),
      showInfo: new PipelineSubscription(),
      apiSettings: new PipelineSubscription(),
      updateFloatingTools: new Subscription(),
    };

    domEventSetup(this, clientArea);
    this.render.paper.canvas.setAttribute('data-testid', 'canvas');
  }

  isDitrty(): boolean {
    const position = this.historyPtr;
    const length = this.historyStack.length;
    if (!length || !this.#origin) {
      return false;
    }
    return !isEqual(this.historyStack[position - 1], this.#origin);
  }

  setOrigin(): void {
    const position = this.historyPtr;
    this.#origin = position ? this.historyStack[position - 1] : null;
  }

  tool(name?: any, opts?: any): Tool | null {
    /* eslint-disable no-underscore-dangle */
    if (arguments.length === 0) {
      return this._tool;
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    const ToolConstructor: ToolConstructorInterface = toolsMap[name];

    const tool = new ToolConstructor(this, opts);

    const isAtomToolChosen = name === 'atom';
    if (!isAtomToolChosen) {
      this.hoverIcon.hide(true);
    }

    if (!tool || tool.isNotActiveTool) {
      return null;
    }

    const isSelectToolChosen = name === 'select';
    if (!isSelectToolChosen) {
      this.rotateController.clean();
    }

    this._tool = tool;
    return this._tool;
    /* eslint-enable no-underscore-dangle */
  }

  clear() {
    this.struct(undefined);
  }

  renderAndRecoordinateStruct(struct: Struct, needToCenterStruct = true) {
    const action = fromNewCanvas(this.render.ctab, struct);
    this.update(action);
    if (needToCenterStruct) {
      this.centerStruct();
    }
    return this.render.ctab.molecule;
  }

  struct(value?: Struct, needToCenterStruct = true): Struct {
    if (arguments.length === 0) {
      return this.render.ctab.molecule;
    }

    this.selection(null);
    const struct = value || new Struct();

    const molecule = this.renderAndRecoordinateStruct(
      struct,
      needToCenterStruct,
    );

    this.hoverIcon.create();
    return molecule;
  }

  // this is used by API addFragment method
  structToAddFragment(value: Struct): Struct {
    const superStruct = value.mergeInto(this.render.ctab.molecule);

    return this.renderAndRecoordinateStruct(superStruct);
  }

  setOptions(opts: string) {
    const options = JSON.parse(opts);
    this.event.apiSettings.dispatch({ ...options });
    return this.render.updateOptions(opts);
  }

  options(value?: any) {
    if (arguments.length === 0) {
      return this.render.options;
    }

    const struct = this.render.ctab.molecule;
    const zoom = this.render.options.zoom;
    this.render.clientArea.innerHTML = '';

    this.render = new Render(
      this.render.clientArea,
      Object.assign({ microModeScale: SCALE }, value),
    );
    this.struct(struct);
    this.render.setZoom(zoom);
    this.render.update();
    return this.render.options;
  }

  zoom(value?: any, event?: WheelEvent) {
    if (arguments.length === 0 || this.render.options.zoom === value) {
      return this.render.options.zoom;
    }

    this.render.setZoom(value, event);

    this.render.update();
    this.rotateController.rerender();
    return this.render.options.zoom;
  }

  centerStruct() {
    const structure = this.render.ctab;
    const structCenter = getStructCenter(structure);
    const viewBoxCenter = new Vec2(
      this.render.viewBox.minX + this.render.viewBox.width / 2,
      this.render.viewBox.minY + this.render.viewBox.height / 2,
    );
    const viewBoxCenterInProto = Scale.canvasToModel(
      viewBoxCenter,
      this.render.options,
    );
    const shiftVector = viewBoxCenterInProto.sub(structCenter);

    const structureToMove = getSelectionMap(structure);

    const action = fromMultipleMove(structure, structureToMove, shiftVector);
    this.update(action, true);
  }

  zoomAccordingContent(struct: Struct) {
    const MIN_ZOOM_VALUE = 0.1;
    const MAX_ZOOM_VALUE = 1;
    const MARGIN_IN_PIXELS = 60;
    const parsedStructCoordBoundingBox = struct.getCoordBoundingBox();
    const parsedStructSize = new Vec2(
      parsedStructCoordBoundingBox.max.x - parsedStructCoordBoundingBox.min.x,
      parsedStructCoordBoundingBox.max.y - parsedStructCoordBoundingBox.min.y,
    );
    const parsedStructSizeInPixels = {
      width:
        parsedStructSize.x *
        this.render.options.microModeScale *
        this.render.options.zoom,
      height:
        parsedStructSize.y *
        this.render.options.microModeScale *
        this.render.options.zoom,
    };
    const clientAreaBoundingBox =
      this.render.clientArea.getBoundingClientRect();

    if (
      parsedStructSizeInPixels.width + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.width &&
      parsedStructSizeInPixels.height + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.height
    ) {
      return;
    }

    let newZoomValue =
      this.render.options.zoom /
      (parsedStructSizeInPixels.height - clientAreaBoundingBox.height >
      parsedStructSizeInPixels.width - clientAreaBoundingBox.width
        ? parsedStructSizeInPixels.height / clientAreaBoundingBox.height
        : parsedStructSizeInPixels.width / clientAreaBoundingBox.width);

    if (newZoomValue >= MAX_ZOOM_VALUE) {
      this.zoom(MAX_ZOOM_VALUE);
      return;
    }

    newZoomValue -= MARGIN_IN_PIXELS / clientAreaBoundingBox.width;

    this.zoom(
      newZoomValue < MIN_ZOOM_VALUE
        ? MIN_ZOOM_VALUE
        : Number(newZoomValue.toFixed(2)),
    );
  }

  selection(ci?: any) {
    if (arguments.length === 0) {
      return this._selection; // eslint-disable-line
    }

    const struct = this.struct();
    let ReStruct = this.render.ctab;
    let selectAll = false;
    this._selection = null; // eslint-disable-line
    if (ci === 'all') {
      selectAll = true;
      // TODO: better way will be this.struct()
      ci = structObjects.reduce((res, key) => {
        let restructItemsIds: number[] = Array.from(ReStruct[key].keys());
        restructItemsIds = restructItemsIds.filter(
          (restructItemId) =>
            !struct.isTargetFromMacromolecule({ map: key, id: restructItemId }),
        );
        res[key] = restructItemsIds;
        return res;
      }, {});
    }

    if (ci === 'descriptors') {
      ReStruct = this.render.ctab;
      ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) };
    }

    if (ci) {
      const res: Selection = {};

      Object.keys(ci).forEach((key) => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice();
      });

      if (Object.keys(res).length !== 0) {
        this._selection = res; // eslint-disable-line
      }
      const stereoFlags = selectStereoFlagsIfNecessary(
        this.struct().atoms,
        this.explicitSelected().atoms,
      );
      if (stereoFlags.length !== 0) {
        this._selection && this._selection.enhancedFlags
          ? (this._selection.enhancedFlags = Array.from(
              new Set([...this._selection.enhancedFlags, ...stereoFlags]),
            ))
          : (res.enhancedFlags = stereoFlags);
      }
    }

    this.render.ctab.setSelection(this._selection); // eslint-disable-line
    this.event.selectionChange.dispatch(this._selection); // eslint-disable-line

    if (selectAll) {
      this.rotateController.rerender();
    } else if (this._selection === null) {
      this.rotateController.clean();
    }

    this.render.update(false, null);
    return this._selection; // eslint-disable-line
  }

  hover(
    ci: { id: number; map: string } | null,
    newTool?: any,
    event?: PointerEvent,
  ) {
    const tool = newTool || this._tool; // eslint-disable-line

    if (
      'ci' in tool &&
      (!ci || tool.ci.map !== ci.map || tool.ci.id !== ci.id)
    ) {
      setHover(tool.ci, false, this.render);
      delete tool.ci;
    }

    if (ci && setHover(ci, true, this.render)) tool.ci = ci;

    if (!event) return;

    setFunctionalGroupsTooltip({
      editor: this,
      event,
      isShow: true,
    });
  }

  update(action: Action | true, ignoreHistory?: boolean) {
    setFunctionalGroupsTooltip({
      editor: this,
      isShow: false,
    });

    if (action === true) {
      this.render.update(true, null); // force
    } else {
      if (!ignoreHistory && !action.isDummy()) {
        this.historyStack.splice(this.historyPtr, HISTORY_SIZE + 1, action);
        if (this.historyStack.length > HISTORY_SIZE) {
          this.historyStack.shift();
        }
        this.historyPtr = this.historyStack.length;
        this.event.change.dispatch(action); // TODO: stoppable here
      }
      this.render.update(false, null);
    }
  }

  historySize() {
    return {
      undo: this.historyPtr,
      redo: this.historyStack.length - this.historyPtr,
    };
  }

  undo() {
    if (this.historyPtr === 0) {
      throw new Error('Undo stack is empty');
    }
    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    this.historyPtr--;
    const stack = this.historyStack[this.historyPtr];
    const action = stack.perform(this.render.ctab);

    this.historyStack[this.historyPtr] = action;

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch();
    } else {
      this.event.change.dispatch(action);
    }

    this.render.update();
  }

  redo() {
    if (this.historyPtr === this.historyStack.length) {
      throw new Error('Redo stack is empty');
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    const action = this.historyStack[this.historyPtr].perform(this.render.ctab);
    this.historyStack[this.historyPtr] = action;
    this.historyPtr++;

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch();
    } else {
      this.event.change.dispatch(action);
    }

    this.render.update();
  }

  subscribe(eventName: any, handler: any) {
    const subscriber = {
      handler,
    };

    switch (eventName) {
      case 'change': {
        const subscribeFuncWrapper = (action) =>
          customOnChangeHandler(action, handler);
        subscriber.handler = subscribeFuncWrapper;
        this.event[eventName].add(subscribeFuncWrapper);
        break;
      }

      default:
        this.event[eventName].add(handler);
    }

    return subscriber;
  }

  unsubscribe(eventName: any, subscriber: any) {
    // Only for event type - subscription
    this.event[eventName].remove(subscriber.handler);
  }

  findItem(event: any, maps: Array<string> | null, skip: any = null) {
    const pos = new Vec2(this.render.page2obj(event));

    return closest.item(this.render.ctab, pos, maps, skip, this.render.options);
  }

  findMerge(srcItems: any, maps: any) {
    return closest.merge(this.render.ctab, srcItems, maps, this.render.options);
  }

  explicitSelected() {
    const selection = this.selection() || {};
    const res = structObjects.reduce((acc, key) => {
      acc[key] = selection[key] ? selection[key].slice() : [];
      return acc;
    }, {} as any);

    const struct = this.render.ctab.molecule;

    // "auto-select" the atoms for the bonds in selection
    if (res.bonds) {
      res.bonds.forEach((bid) => {
        const bond = struct.bonds.get(bid)!;
        res.atoms = res.atoms || [];
        if (res.atoms.indexOf(bond.begin) < 0) {
          res.atoms.push(bond.begin);
        }

        if (res.atoms.indexOf(bond.end) < 0) {
          res.atoms.push(bond.end);
        }
      });
    }

    // "auto-select" the bonds with both atoms selected
    if (res.atoms && res.bonds) {
      struct.bonds.forEach((bond, bid) => {
        if (
          res.bonds.indexOf(bid) < 0 &&
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds = res.bonds || [];
          res.bonds.push(bid);
        }
      });
    }

    return res;
  }

  structSelected() {
    const struct = this.render.ctab.molecule;
    const selection = this.explicitSelected();
    const dst = struct.clone(
      new Pile(selection.atoms),
      new Pile(selection.bonds),
      true,
      null,
      new Pile(selection.simpleObjects),
      new Pile(selection.texts),
    );

    // Copy by its own as Struct.clone doesn't support
    // arrows/pluses id sets
    struct.rxnArrows.forEach((item, id) => {
      if (selection.rxnArrows.indexOf(id) !== -1)
        dst.rxnArrows.add(item.clone());
    });
    struct.rxnPluses.forEach((item, id) => {
      if (selection.rxnPluses.indexOf(id) !== -1)
        dst.rxnPluses.add(item.clone());
    });

    dst.isReaction = struct.isReaction && struct.isRxn();

    return dst;
  }

  alignDescriptors() {
    this.selection(null);
    const action = fromDescriptorsAlign(this.render.ctab);
    this.update(action);
    this.render.update(true);
  }

  setMacromoleculeConvertionError(errorMessage: string) {
    this.macromoleculeConvertionError = errorMessage;
  }

  clearMacromoleculeConvertionError() {
    this.macromoleculeConvertionError = null;
  }
}

/**
 * Main button pressed, usually the left button or the un-initialized state
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

function resetSelectionOnCanvasClick(
  editor: Editor,
  eventName: string,
  clientArea: HTMLElement,
  event,
) {
  if (
    eventName === 'mouseup' &&
    editor.selection() &&
    clientArea.contains(event.target)
  ) {
    editor.selection(null);
  }
}

function updateLastCursorPosition(editor: Editor, event) {
  const events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
  if (events.includes(event.type)) {
    const clientAreaBoundingBox =
      editor.render.clientArea.getBoundingClientRect();

    editor.lastCursorPosition = {
      x: event.clientX - clientAreaBoundingBox.x,
      y: event.clientY - clientAreaBoundingBox.y,
    };
  }
}

function isContextMenuClosed(contextMenu: contextMenuInfo) {
  return !Object.values(contextMenu).some(Boolean);
}

function useToolIfNeeded(
  editor: Editor,
  eventHandlerName: ToolEventHandlerName,
  clientArea: HTMLElement,
  event,
) {
  const editorTool = editor.tool();
  if (!editorTool) {
    return false;
  }

  editor.lastEvent = event;
  const conditions = [
    eventHandlerName in editorTool,
    clientArea.contains(event.target) || editorTool.isSelectionRunning?.(),
    isContextMenuClosed(editor.contextMenu),
  ];

  if (conditions.every((condition) => condition)) {
    editorTool[eventHandlerName]?.(event);
    return true;
  }

  return false;
}

function domEventSetup(editor: Editor, clientArea: HTMLElement) {
  // TODO: addEventListener('resize', ...);
  const trackedDomEvents: {
    target: Node;
    eventName: string;
    toolEventHandler: ToolEventHandlerName;
  }[] = [
    {
      target: clientArea,
      eventName: 'click',
      toolEventHandler: 'click',
    },
    {
      target: clientArea,
      eventName: 'dblclick',
      toolEventHandler: 'dblclick',
    },
    {
      target: clientArea,
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
      target: clientArea,
      eventName: 'mouseleave',
      toolEventHandler: 'mouseLeaveClientArea',
    },
    {
      target: clientArea,
      eventName: 'mouseover',
      toolEventHandler: 'mouseover',
    },
  ];

  trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
    editor.event[eventName] = new DOMSubscription();
    const subs = editor.event[eventName];

    target.addEventListener(eventName, (...args) => {
      if (window.isPolymerEditorTurnedOn) return;
      subs.dispatch(...args);
    });

    subs.add((event) => {
      updateLastCursorPosition(editor, event);

      if (
        ['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) &&
        !isMouseMainButtonPressed(event)
      ) {
        return true;
      }

      if (eventName !== 'mouseup' && eventName !== 'mouseleave') {
        // to complete drag actions
        if (!event.target || event.target.nodeName === 'DIV') {
          // click on scroll
          editor.hover(null);
          return true;
        }
      }

      const isToolUsed = useToolIfNeeded(
        editor,
        toolEventHandler,
        clientArea,
        event,
      );
      if (isToolUsed) {
        return true;
      }

      resetSelectionOnCanvasClick(editor, eventName, clientArea, event);

      return true;
    }, -1);
  });
}

export { Editor };
export default Editor;

function setHover(ci: any, visible: any, render: any) {
  if (highlightTargets.indexOf(ci.map) === -1) {
    return false;
  }

  let item: any = null;

  if (ci.map === 'merge') {
    Object.keys(ci.items).forEach((mp) => {
      ci.items[mp].forEach((dstId) => {
        item = render.ctab[mp].get(dstId)!;

        if (item) {
          item.setHover(visible, render);
        }
      });
    });

    return true;
  }

  if (ci.map === 'functionalGroups') ci.map = 'sgroups'; // TODO: Refactor object

  item = (render.ctab[ci.map] as Map<any, any>).get(ci.id);
  if (!item) {
    return true; // TODO: fix, attempt to highlight a deleted item
  }

  if (
    (ci.map === 'sgroups' && item.item.type === 'DAT') ||
    ci.map === 'sgroupData'
  ) {
    // set highlight for both the group and the data item
    const item1 = render.ctab.sgroups.get(ci.id);
    if (item1) {
      item1.setHover(visible, render);
    }

    const item2 = render.ctab.sgroupData.get(ci.id);
    if (item2) {
      item2.setHover(visible, render);
    }
  } else {
    item.setHover(visible, render);
  }
  return true;
}
