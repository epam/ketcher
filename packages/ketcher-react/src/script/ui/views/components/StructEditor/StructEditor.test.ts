import StructEditor from './StructEditor';
import type Editor from '../../../../editor';

describe('canvas wheel events', () => {
  it.each([null, undefined, new MouseEvent('mousemove', { altKey: true })])(
    'scrolls safely with lastEvent %s',
    (lastEvent) => {
      const component = new StructEditor({ ketcherId: 'wheel-test' });
      const mousemove = jest.fn();
      const tool = { mousemove };
      const updateFloatingToolsPosition = jest.fn();
      const updatePosition = jest.fn();
      component.editor = {
        lastEvent,
        tool: jest.fn(() => tool),
        rotateController: { updateFloatingToolsPosition },
        hoverIcon: { updatePosition },
      } as unknown as Editor;
      const scrollCanvas = jest
        .spyOn(component, 'scrollCanvas')
        .mockImplementation(() => {});
      const event = new WheelEvent('wheel', { deltaY: 100 });

      component.handleWheel(event);

      expect(scrollCanvas).toHaveBeenCalledWith(event);
      expect(updateFloatingToolsPosition).toHaveBeenCalledTimes(1);
      expect(updatePosition).toHaveBeenCalledTimes(1);
      if (lastEvent) {
        expect(mousemove).toHaveBeenCalledWith(lastEvent);
        expect(mousemove.mock.contexts[0]).toBe(tool);
      } else {
        expect(mousemove).not.toHaveBeenCalled();
      }
    },
  );
});
