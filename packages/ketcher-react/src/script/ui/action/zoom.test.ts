import zoomActions from './zoom';

describe.each([
  ['zoom', 1],
  ['zoom-in', 1.1],
  ['zoom-out', 0.9],
] as const)('%s action', (actionName, expectedZoom) => {
  const zoomEvent = new WheelEvent('wheel', { ctrlKey: true });
  const runAction = (editor: unknown) => {
    if (actionName === 'zoom') {
      zoomActions.zoom.action(editor);
    } else {
      zoomActions[actionName].action(zoomEvent)(editor);
    }
  };

  it.each([null, undefined])(
    'changes zoom without refreshing the tool when lastEvent is %s',
    (lastEvent) => {
      const mousemove = jest.fn();
      const editor = {
        zoom: jest.fn(() => 1),
        tool: jest.fn(() => ({ mousemove })),
        lastEvent,
      };

      runAction(editor);

      const expectedArgs =
        actionName === 'zoom' ? [expectedZoom] : [expectedZoom, zoomEvent];
      expect(editor.zoom).toHaveBeenLastCalledWith(...expectedArgs);
      expect(mousemove).not.toHaveBeenCalled();
    },
  );

  it('refreshes the tool with the recorded mouse event', () => {
    const lastEvent = new MouseEvent('mousemove', { altKey: true });
    const mousemove = jest.fn();
    const tool = { mousemove };
    const editor = {
      zoom: jest.fn(() => 1),
      tool: jest.fn(() => tool),
      lastEvent,
    };

    runAction(editor);

    expect(mousemove).toHaveBeenCalledTimes(1);
    expect(mousemove).toHaveBeenCalledWith(lastEvent);
    expect(mousemove.mock.contexts[0]).toBe(tool);
  });
});
