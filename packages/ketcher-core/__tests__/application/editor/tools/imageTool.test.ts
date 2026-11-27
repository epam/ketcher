import { CoreEditor } from 'application/editor';
import { ImageTool } from 'application/editor/tools/Image';
import {
  isImageSizeValid,
  isSupportedImageType,
} from 'application/editor/shared/imageFile';
import { Coordinates } from 'application/editor/shared/coordinates';
import { ToolName } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const SRC = 'data:image/png;base64,AAAA';

function createEditor() {
  return new CoreEditor({
    theme: {},
    canvas: createPolymerEditorCanvas(),
    renderersContainer: createRenderersManager(),
  });
}

describe('image file checks', () => {
  it('accepts png and svg and rejects other types', () => {
    expect(isSupportedImageType('image/png')).toBe(true);
    expect(isSupportedImageType('image/svg+xml')).toBe(true);
    expect(isSupportedImageType('image/jpeg')).toBe(false);
    expect(isSupportedImageType('')).toBe(false);
  });

  it('requires at least 16 by 16 pixels unless the image is sizeless', () => {
    expect(isImageSizeValid({ src: SRC, width: 16, height: 16 })).toBe(true);
    expect(isImageSizeValid({ src: SRC, width: 15, height: 40 })).toBe(false);
    expect(
      isImageSizeValid({ src: 'x'.repeat(400), width: 0, height: 0 }),
    ).toBe(true);
  });
});

describe('ImageTool', () => {
  it('inserts an image centred on the click point at its pixel size and returns to select', () => {
    const editor = createEditor();
    const dispatch = vi.spyOn(editor.events.selectTool, 'dispatch');
    const tool = new ImageTool(editor);
    const click = new Vec2(100, 80);

    tool.insertImage({ src: SRC, width: 40, height: 20 }, click);

    const [image] = editor.drawingEntitiesManager.images.values();
    const expectedCenter = Coordinates.canvasToModel(click);
    expect(editor.drawingEntitiesManager.images.size).toBe(1);
    expect(image.center.x).toBeCloseTo(expectedCenter.x);
    expect(image.center.y).toBeCloseTo(expectedCenter.y);
    expect(image.getState().halfSize.x).toBeCloseTo(
      Coordinates.canvasToModel(new Vec2(20, 0)).x,
    );
    expect(dispatch).toHaveBeenLastCalledWith([ToolName.selectRectangle]);
  });

  it('refuses an image smaller than 16 by 16 pixels', () => {
    const editor = createEditor();
    const tool = new ImageTool(editor);

    tool.insertImage({ src: SRC, width: 8, height: 8 }, new Vec2(10, 10));

    expect(editor.drawingEntitiesManager.images.size).toBe(0);
  });
});
