import zoom from './zoom';
import type { ActionStateEditor } from './action.types';

describe('zoom actions', () => {
  it('forwards wheel events when zooming in', () => {
    const event = new WheelEvent('wheel');
    const zoomEditor = jest.fn().mockReturnValue(1);
    const editor = {
      zoom: zoomEditor,
      tool: jest.fn(),
      lastEvent: null,
    } as unknown as ActionStateEditor;
    const createZoomInAction = zoom['zoom-in'].action as unknown as (
      event?: WheelEvent,
    ) => (editor: ActionStateEditor) => void;

    createZoomInAction(event)(editor);

    expect(zoomEditor).toHaveBeenLastCalledWith(1.1, event);
  });

  it('forwards wheel events when zooming out', () => {
    const event = new WheelEvent('wheel');
    const zoomEditor = jest.fn().mockReturnValue(1);
    const editor = {
      zoom: zoomEditor,
      tool: jest.fn(),
      lastEvent: null,
    } as unknown as ActionStateEditor;
    const createZoomOutAction = zoom['zoom-out'].action as unknown as (
      event?: WheelEvent,
    ) => (editor: ActionStateEditor) => void;

    createZoomOutAction(event)(editor);

    expect(zoomEditor).toHaveBeenLastCalledWith(0.9, event);
  });
});
