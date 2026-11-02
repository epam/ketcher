import { Coordinates } from 'domain/helpers/coordinates';
import { provideEditorSettings } from '../editorSettings';
import ZoomTool from '../tools/Zoom';

// The domain cannot import the editor (A4), so it asks this source for the scale and
// the zoom. Every application importer of Coordinates loads this module, so the
// binding runs before any use.
Coordinates.bind({
  macroModeScale: () => provideEditorSettings().macroModeScale,
  scaleCoordinates: (position) => ZoomTool.instance.scaleCoordinates(position),
  invertZoom: (position) => ZoomTool.instance.invertZoom(position),
});
export { Coordinates };
