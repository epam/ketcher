import { Subscription } from 'subscription';
import { ToolEventHandlerName } from 'application/editor/tools/Tool';

export let editorEvents;

export function resetEditorEvents() {
  editorEvents = {
    selectMonomer: new Subscription(),
    selectPreset: new Subscription(),
    selectTool: new Subscription(),
    createBondViaModal: new Subscription(),
    cancelBondCreationViaModal: new Subscription(),
    selectMode: new Subscription(),
    snakeModeChange: new Subscription(),
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
