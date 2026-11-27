import type { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { Coordinates } from 'application/editor/shared/coordinates';
import {
  getSupportedImageAccept,
  isImageSizeValid,
  type LoadedImageFile,
  MIN_IMAGE_DIMENSION,
  readImageFile,
} from 'application/editor/shared/imageFile';
import type { BaseTool } from 'application/editor/tools/Tool';
import { ToolName } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities/vec2';
import { KetcherLogger } from 'utilities';

const TAG = 'ImageTool';

export class ImageTool implements BaseTool {
  constructor(private readonly editor: CoreEditor) {}

  public click() {
    const clickPosition = new Vec2(this.editor.lastCursorPositionOfCanvas);
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = getSupportedImageAccept();
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      readImageFile(file)
        .then((loaded) => this.insertImage(loaded, clickPosition))
        .catch((error) => KetcherLogger.error(`${TAG}:load`, error));
    };
    input.click();
  }

  public insertImage(loaded: LoadedImageFile, clickPosition: Vec2) {
    if (!isImageSizeValid(loaded)) {
      KetcherLogger.error(
        `${TAG}:size`,
        `Image should be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels`,
      );
      return;
    }

    const isSizeless = loaded.width === 0 && loaded.height === 0;
    const canvasHalfSize = isSizeless
      ? new Vec2(MIN_IMAGE_DIMENSION, MIN_IMAGE_DIMENSION)
      : new Vec2(loaded.width / 2, loaded.height / 2);

    const command = this.editor.drawingEntitiesManager.addImage(
      loaded.src,
      Coordinates.canvasToModel(clickPosition),
      Coordinates.canvasToModel(canvasHalfSize),
    );
    this.editor.renderersContainer.update(command);
    EditorHistory.getInstance(this.editor).update(command);
    this.editor.events.selectTool.dispatch([ToolName.selectRectangle]);
  }

  public destroy() {}
}
