import { Subscription } from 'subscription';
import { ToolEventHandlerName } from 'application/editor/tools/Tool';
import { CoreEditor } from 'application/editor/Editor';
import ZoomTool from 'application/editor/tools/Zoom';
import { SequenceType } from 'domain/entities';

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
    openErrorModal: new Subscription(),
    openMonomerConnectionModal: new Subscription(),
    mouseOverPolymerBond: new Subscription(),
    mouseLeavePolymerBond: new Subscription(),
    mouseOnMovePolymerBond: new Subscription(),
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
    rightClickSequence: new Subscription(),
    rightClickCanvas: new Subscription(),
    rightClickPolymerBond: new Subscription(),
    editSequence: new Subscription(),
    startNewSequence: new Subscription(),
    turnOnSequenceEditInRNABuilderMode: new Subscription(),
    turnOffSequenceEditInRNABuilderMode: new Subscription(),
    modifySequenceInRnaBuilder: new Subscription(),
    mouseOverSequenceItem: new Subscription(),
    mouseOnMoveSequenceItem: new Subscription(),
    mouseLeaveSequenceItem: new Subscription(),
    changeSequenceTypeEnterMode: new Subscription(),
    toggleSequenceEditMode: new Subscription(),
    toggleSequenceEditInRNABuilderMode: new Subscription(),
    clickOnSequenceItem: new Subscription(),
    mousedownBetweenSequenceItems: new Subscription(),
    mouseDownOnSequenceItem: new Subscription(),
    doubleClickOnSequenceItem: new Subscription(),
    openConfirmationDialog: new Subscription(),
    mouseUpAtom: new Subscription(),
  };
}
resetEditorEvents();
export const renderersEvents: ToolEventHandlerName[] = [
  'mouseOverPolymerBond',
  'mouseLeavePolymerBond',
  'mouseOnMovePolymerBond',
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
  'rightClickSequence',
  'rightClickCanvas',
  'rightClickPolymerBond',
  'editSequence',
  'startNewSequence',
  'turnOnSequenceEditInRNABuilderMode',
  'turnOffSequenceEditInRNABuilderMode',
  'modifySequenceInRnaBuilder',
  'mouseOverSequenceItem',
  'mouseOnMoveSequenceItem',
  'mouseLeaveSequenceItem',
  'changeSequenceTypeEnterMode',
  'toggleSequenceEditMode',
  'toggleSequenceEditInRNABuilderMode',
  'clickOnSequenceItem',
  'mousedownBetweenSequenceItems',
  'mouseDownOnSequenceItem',
  'doubleClickOnSequenceItem',
  'mouseUpAtom',
];

export const hotkeysConfiguration = {
  RNASequenceType: {
    shortcut: ['Control+Alt+r'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.RNA);
    },
  },
  DNASequenceType: {
    shortcut: ['Control+Alt+d'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.DNA);
    },
  },
  PEPTIDESequenceTYpe: {
    shortcut: ['Control+Alt+p'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.PEPTIDE);
    },
  },
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
      // TODO create an ability to stop event propagation from mode event handlers to keyboard shortcuts handlers
      if (editor.isSequenceEditMode) return;
      editor.events.selectTool.dispatch('erase');
      editor.events.selectTool.dispatch('select-rectangle');
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
