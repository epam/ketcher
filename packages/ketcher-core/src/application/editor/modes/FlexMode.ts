import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
import { CoreEditor } from '../Editor';
import { Coordinates } from '../internal';
import { Command } from 'domain/entities/Command';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { ZoomTool } from '../tools';
import { Vec2 } from 'domain/entities';
export class FlexMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    const modelChanges =
      editor.drawingEntitiesManager.applyFlexLayoutMode(true);

    command.merge(editor.drawingEntitiesManager.recalculateCanvasMatrix());

    editor.renderersContainer.update(modelChanges);

    const drawnEntitiesBoundingBox =
      RenderersManager.getRenderedStructuresBbox();
    const zoom = ZoomTool.instance;

    zoom.scrollTo(
      new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top),
    );

    return command;
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance();
    return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
  }

  applyAdditionalPasteOperations() {
    return new Command();
  }

  isPasteAllowedByMode(): boolean {
    return true;
  }

  isPasteAvailable(): boolean {
    return true;
  }

  scrollForView(): void {}
}
