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
    error: new Subscription(),
    openMonomerConnectionModal: new Subscription(),
    mouseOverPolymerBond: new Subscription(),
    mouseLeavePolymerBond: new Subscription(),
    mouseOverMonomer: new Subscription(),
    mouseOnMoveMonomer: new Subscription(),
    mouseLeaveMonomer: new Subscription(),
    mouseOverAP: new Subscription(),
    mouseLeaveAP: new Subscription(),
    mouseUpAP: new Subscription(),
    mouseDownAP: new Subscription(),
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
  'mouseOverAP',
  'mouseLeaveAP',
  'mouseUpAP',
  'mouseDownAP',
  'mouseLeaveMonomer',
  'mouseOverDrawingEntity',
  'mouseLeaveDrawingEntity',
  'mouseUpMonomer',
];
