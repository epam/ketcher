import { Vec2 } from 'domain/entities';
import { provideEditorSettings } from '../editorSettings';
import ZoomTool from '../tools/Zoom';
/**
 * `model` -- The original coordinates of entities, namely angstroms
 * `canvas` -- The real coordinates used to draw entities
 * `view` -- The zoomed canvas coordinates
 */
export class Coordinates {
  static canvasToModel(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(1 / settings.macroModeScale);
  }

  static viewToModel(position: Vec2) {
    const settings = provideEditorSettings();
    const pos = ZoomTool.instance.invertZoom(position);
    return pos.scaled(1 / settings.macroModeScale);
  }

  static modelToView(position: Vec2) {
    const settings = provideEditorSettings();
    return ZoomTool.instance.scaleCoordinates(
      position.scaled(settings.macroModeScale),
    );
  }

  static modelToCanvas(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(settings.macroModeScale);
  }

  // convert the original coordinates to transformed coordinates after the d3 transformation
  static canvasToView(position: Vec2) {
    return ZoomTool.instance.scaleCoordinates(position);
  }

  // convert the transformed coordinates to coordinates before the d3 transformation
  static viewToCanvas(position: Vec2) {
    return ZoomTool.instance.invertZoom(position);
  }
}
