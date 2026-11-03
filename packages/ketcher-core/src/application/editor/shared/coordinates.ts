import { Coordinates } from 'domain/helpers/coordinates';
import { provideEditorSettings } from '../editorSettings';
import ZoomTool from '../tools/Zoom';

// The domain cannot import the editor (A4), so the editor supplies the scale and
// the zoom here. Application code imports Coordinates from this module, which makes
// the binding run before the first use.
Coordinates.bind({
  macroModeScale: () => provideEditorSettings().macroModeScale,
  scaleCoordinates: (position) => ZoomTool.instance.scaleCoordinates(position),
  invertZoom: (position) => ZoomTool.instance.invertZoom(position),
});
export { Coordinates };
