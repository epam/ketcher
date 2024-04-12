import { BaseMode } from 'application/editor/modes/BaseMode';
import { LayoutMode } from 'application/editor/modes';
import ZoomTool from '../tools/Zoom';
import { CoreEditor } from '../Editor';
import { Coordinates } from '../internal';
import { Command } from 'domain/entities/Command';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { Vec2 } from 'domain/entities';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class SnakeMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('snake-layout-mode', previousMode);
  }

  public initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );
    editor.drawingEntitiesManager.applyFlexLayoutMode();

    command.merge(modelChanges);
    editor.renderersContainer.update(modelChanges);
    command.setUndoOperationReverse();

    return command;
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance();

    return Coordinates.modelToCanvas(
      editor.drawingEntitiesManager.bottomRightMonomerPosition,
    );
  }

  scrollForView() {
    const zoom = ZoomTool.instance;
    const drawnEntitiesBoundingBox =
      RenderersManager.getRenderedStructuresBbox();

    if (zoom.isFitToCanvasHeight(drawnEntitiesBoundingBox.height)) {
      zoom.scrollTo(
        new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top),
        false,
        2,
      );
    } else {
      zoom.scrollTo(
        new Vec2(
          drawnEntitiesBoundingBox.left,
          drawnEntitiesBoundingBox.bottom,
        ),
        true,
        2,
      );
    }
  }

  applyAdditionalPasteOperations() {
    const command = new Command();
    command.addOperation(new ReinitializeModeOperation());

    return command;
  }

  isPasteAllowedByMode(): boolean {
    return true;
  }
}
