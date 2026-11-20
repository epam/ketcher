import zoomActions from './zoom';
import type { ActionStateEditor } from './action.types';

describe.each([
  ['zoom', 1],
  ['zoom-in', 1.1],
  ['zoom-out', 0.9],
] as const)('%s action', (actionName, expectedZoom) => {
  const zoomEvent = new WheelEvent('wheel', { ctrlKey: true });
  const runAction = (editor: ActionStateEditor) => {
    if (actionName === 'zoom') {
      const action = zoomActions.zoom.action;
      if (typeof action !== 'function') {
        throw new Error('The zoom action must be a function');
      }
      action(editor);
    } else {
      zoomActions[actionName].action(zoomEvent)(editor);
    }
  };

  it.each([null, undefined])(
    'changes zoom without refreshing the tool when lastEvent is %s',
    (lastEvent) => {
      const mousemove = jest.fn();
      const zoom = jest.fn(() => 1);
      const editor = {
        zoom,
        tool: jest.fn(() => ({ mousemove })),
        lastEvent,
      } as unknown as ActionStateEditor;

      runAction(editor);

      const expectedArgs =
        actionName === 'zoom' ? [expectedZoom] : [expectedZoom, zoomEvent];
      expect(zoom).toHaveBeenLastCalledWith(...expectedArgs);
      expect(mousemove).not.toHaveBeenCalled();
    },
  );

  it('refreshes the tool with the recorded mouse event', () => {
    const lastEvent = new MouseEvent('mousemove', { altKey: true });
    const mousemove = jest.fn();
    const tool = { mousemove };
    const zoom = jest.fn(() => 1);
    const editor = {
      zoom,
      tool: jest.fn(() => tool),
      lastEvent,
    } as unknown as ActionStateEditor;

    runAction(editor);

    expect(mousemove).toHaveBeenCalledTimes(1);
    expect(mousemove).toHaveBeenCalledWith(lastEvent);
    expect(mousemove.mock.contexts[0]).toBe(tool);
  });
});
