import { Subscription } from 'subscription';
import { ToolEventHandlerName } from 'application/editor/tools/Tool';

export const editorEvents = {
  selectMonomer: new Subscription(),
  selectPreset: new Subscription(),
  selectTool: new Subscription(),
  error: new Subscription(),
  mouseOverPolymerBond: new Subscription(),
  mouseLeavePolymerBond: new Subscription(),
  mouseOverMonomer: new Subscription(),
  mouseLeaveMonomer: new Subscription(),
  mouseOverDrawingEntity: new Subscription(),
  mouseLeaveDrawingEntity: new Subscription(),
  mouseUpMonomer: new Subscription(),
};

export const renderersEvents: ToolEventHandlerName[] = [
  'mouseOverPolymerBond',
  'mouseLeavePolymerBond',
  'mouseOverMonomer',
  'mouseLeaveMonomer',
  'mouseOverDrawingEntity',
  'mouseLeaveDrawingEntity',
  'mouseUpMonomer',
];
