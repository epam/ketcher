import { Vec2 } from 'domain/entities';
import { provideEditorSettings } from '../editorSettings';
import ZoomTool from '../tools/Zoom';

class Coordinates {
  static pageToModel(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(1 / settings.scale);
  }

  static viewToModel(position: Vec2) {
    const settings = provideEditorSettings();
    const pos = ZoomTool.instance.invertZoom(position);
    return pos.scaled(1 / settings.scale);
  }

  static modelToView(position: Vec2) {
    const settings = provideEditorSettings();
    return ZoomTool.instance.scaleCoordinates(position.scaled(settings.scale));
  }

  static modelToPage(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(settings.scale);
  }

  // convert the original coordinates to transformed coordinates after the d3 transformation
  static pageToView(position: Vec2) {
    return ZoomTool.instance.scaleCoordinates(position);
  }

  // convert the transformed coordinates to coordinates before the d3 transformation
  static viewToPage(position: Vec2) {
    return ZoomTool.instance.invertZoom(position);
  }
}

export default Coordinates;
