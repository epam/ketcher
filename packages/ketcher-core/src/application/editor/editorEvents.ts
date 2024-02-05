import { Subscription } from 'subscription';
import { ToolEventHandlerName } from 'application/editor/tools/Tool';
import { CoreEditor } from 'application/editor/Editor';
import ZoomTool from 'application/editor/tools/Zoom';

export let editorEvents;

export function resetEditorEvents() {
  editorEvents = {
    selectMonomer: new Subscription(),
    selectPreset: new Subscription(),
    selectTool: new Subscription(),
    createBondViaModal: new Subscription(),
    cancelBondCreationViaModal: new Subscription(),
    selectMode: new Subscription(),
    layoutModeChange: new Subscription(),
    selectHistory: new Subscription(),
    error: new Subscription(),
    openMonomerConnectionModal: new Subscription(),
    mouseOverPolymerBond: new Subscription(),
    mouseLeavePolymerBond: new Subscription(),
    mouseOverMonomer: new Subscription(),
    mouseOnMoveMonomer: new Subscription(),
    mouseLeaveMonomer: new Subscription(),
    mouseOverAttachmentPoint: new Subscription(),
    mouseLeaveAttachmentPoint: new Subscription(),
    mouseUpAttachmentPoint: new Subscription(),
    mouseDownAttachmentPoint: new Subscription(),
    mouseOverDrawingEntity: new Subscription(),
    mouseLeaveDrawingEntity: new Subscription(),
    mouseUpMonomer: new Subscription(),
  };
}
resetEditorEvents();
export const renderersEvents: ToolEventHandlerName[] = [
  'mouseOverPolymerBond',
  'mouseLeavePolymerBond',
  'mouseOverMonomer',
  'mouseOnMoveMonomer',
  'mouseOverAttachmentPoint',
  'mouseLeaveAttachmentPoint',
  'mouseUpAttachmentPoint',
  'mouseDownAttachmentPoint',
  'mouseLeaveMonomer',
  'mouseOverDrawingEntity',
  'mouseLeaveDrawingEntity',
  'mouseUpMonomer',
];

export const hotkeysConfiguration = {
  exit: {
    shortcut: ['Shift+Tab', 'Escape'],
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch('select-rectangle');
    },
  },
  undo: {
    shortcut: 'Mod+z',
    handler: (editor: CoreEditor) => {
      editor.onSelectHistory('undo');
    },
  },
  redo: {
    shortcut: ['Mod+Shift+z', 'Mod+y'],
    handler: (editor: CoreEditor) => {
      editor.onSelectHistory('redo');
    },
  },
  erase: {
    shortcut: ['Delete', 'Backspace'],
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch('erase');
    },
  },
  clear: {
    shortcut: ['Mod+Delete', 'Mod+Backspace'],
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch('clear');
      editor.events.selectTool.dispatch('select-rectangle');
    },
  },
  'zoom-plus': {
    shortcut: 'Mod+=',
    handler: () => {
      ZoomTool.instance.zoomIn();
    },
  },
  'zoom-minus': {
    shortcut: 'Mod+-',
    handler: () => {
      ZoomTool.instance.zoomOut();
    },
  },
  'zoom-reset': {
    shortcut: 'Mod+0',
    handler: () => {
      ZoomTool.instance.resetZoom();
    },
  },
  'select-all': {
    shortcut: 'Mod+a',
    handler: (editor: CoreEditor) => {
      const modelChanges =
        editor.drawingEntitiesManager.selectAllDrawingEntities();
      editor.renderersContainer.update(modelChanges);
    },
  },
};
