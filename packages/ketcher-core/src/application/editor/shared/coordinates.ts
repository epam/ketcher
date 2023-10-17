import { Vec2 } from 'domain/entities';
import { zoomProvider } from '../tools/Zoom';
import { provideEditorSettings } from '../editorSettings';

class Coordinates {
  static pageToView(position: Vec2) {
    return zoomProvider.getZoomTool().scaleCoordinates(position);
  }

  static pageToModel(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(1 / settings.scale);
  }

  static viewToModel(position: Vec2) {
    const settings = provideEditorSettings();
    const pos = zoomProvider.getZoomTool().invertZoom(position);
    return pos.scaled(1 / settings.scale);
  }

  static modelToView(position: Vec2) {
    const settings = provideEditorSettings();
    return zoomProvider
      .getZoomTool()
      .scaleCoordinates(position.scaled(settings.scale));
  }

  static modelToPage(position: Vec2) {
    const settings = provideEditorSettings();
    return position.scaled(settings.scale);
  }
}

export default Coordinates;
