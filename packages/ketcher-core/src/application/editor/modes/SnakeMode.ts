import { BaseMode } from 'application/editor/modes/BaseMode';
import { LayoutMode } from 'application/editor/modes/types';
import ZoomTool from '../tools/Zoom';
import { Coordinates } from '../internal';
import { provideEditorInstance } from '../editorSingleton';
import { Command } from 'domain/entities/Command';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { registerMode } from './modesRegistry';
import { getRenderedStructuresBbox } from 'application/render/renderers/utils';

export class SnakeMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('snake-layout-mode', previousMode);
  }

  public initialize(_needRemoveSelection: boolean, _isUndo = false) {
    const command = super.initialize();
    const editor = provideEditorInstance();

    // Prevent layout to be called if turn on snake mode by undo operation
    // because during undo to flex mode if monomers were not moved
    // we need just redraw canvas to apply new bond view style (straight instead of curved)
    const modelChanges = _isUndo
      ? new Command()
      : editor.drawingEntitiesManager.applySnakeLayout(true);

    editor.drawingEntitiesManager.applyFlexLayoutMode();
    command.merge(modelChanges);
    editor.renderersContainer.update(modelChanges);
    command.setUndoOperationReverse();

    if (editor.drawingEntitiesManager.hasMonomers) {
      editor.scrollToTopLeftCorner();
    }

    return command;
  }

  getNewNodePosition() {
    const editor = provideEditorInstance();

    return Coordinates.modelToCanvas(
      editor.drawingEntitiesManager.bottomRightMonomerPosition,
    );
  }

  async scrollForView() {
    const zoom = ZoomTool.instance;
    const drawnEntitiesBoundingBox = getRenderedStructuresBbox();

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

  applyAdditionalPasteOperations(
    mergedDrawingEntities: DrawingEntitiesManager,
  ) {
    const command = new Command();
    const editor = provideEditorInstance();

    command.addOperation(new ReinitializeModeOperation());
    command.merge(
      editor.drawingEntitiesManager.selectDrawingEntities(
        mergedDrawingEntities.allEntitiesArray,
      ),
    );

    return command;
  }

  isPasteAllowedByMode(): boolean {
    return true;
  }

  isPasteAvailable(): boolean {
    return true;
  }
}

registerMode('snake-layout-mode', SnakeMode);
