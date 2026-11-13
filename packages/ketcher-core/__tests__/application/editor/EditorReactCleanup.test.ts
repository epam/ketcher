import { act, createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CoreEditor, FlexMode } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { ToolName } from 'application/editor/tools/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Vec2 } from 'domain/entities';
import { notifyRenderComplete } from 'application/render/notifyRenderComplete';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

describe('CoreEditor mounted React cleanup', () => {
  it('flushes the latest drag and cancels the frame before effect teardown removes the canvas', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    let editor!: CoreEditor;
    let canvas!: SVGSVGElement;
    const actEnvironment = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    };
    const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const originalBBox = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      'getBBox',
    );
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    });
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.set(++nextFrameId, callback);
        return nextFrameId;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });

    // This mounts the real patched core in a React effect. The macromolecules
    // Editor component and its Redux create/destroy actions are not mounted.
    function MountedEditor() {
      useEffect(() => {
        canvas = createPolymerEditorCanvas();
        editor = new CoreEditor({
          theme: coreEditorTheme,
          canvas,
          renderersContainer: createRenderersManager(polymerEditorTheme),
        });
        editor.setMode(new FlexMode());
        editor.selectTool(ToolName.selectRectangle);
        return () => {
          editor.destroy();
          canvas.remove();
        };
      }, []);
      return null;
    }

    try {
      await act(async () => root.render(createElement(MountedEditor)));
      const manager = editor.drawingEntitiesManager;
      editor.renderersContainer.update(
        manager.addMonomer(peptideMonomerItem, new Vec2(3, 1)),
      );
      const monomer = manager.monomersArray[0];
      editor.renderersContainer.update(manager.selectDrawingEntity(monomer));
      const tool = editor.selectedTool as SelectRectangle;
      editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
        monomer.position,
      );
      tool.mousedown({
        target: { __data__: monomer.renderer },
      } as unknown as MouseEvent);
      editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
        new Vec2(3.2, 1),
      );
      tool.mousemove(new MouseEvent('mousemove', { ctrlKey: true }));
      const draw = jest.spyOn(editor.renderersContainer, 'moveDrawingEntity');
      expect(frames.size).toBe(1);
      expect(monomer.position.x).toBeCloseTo(3.2);

      await act(async () => root.unmount());
      expect(frames.size).toBe(0);
      expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(draw).toHaveBeenCalledTimes(1);
      expect(draw).toHaveBeenCalledWith(monomer);
      expect(monomer.position.x).toBeCloseTo(3.2);
      expect(canvas.isConnected).toBe(false);
    } finally {
      await act(async () => root.unmount());
      notifyRenderComplete.cancel();
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
      container.remove();
      canvas?.remove();
      jest.restoreAllMocks();
      if (originalBBox) {
        Object.defineProperty(SVGElement.prototype, 'getBBox', originalBBox);
      } else {
        Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
      }
    }
  });
});
