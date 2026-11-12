import type { Vec2 } from 'domain/entities/vec2';

export interface CoordinatesSource {
  // Read on every call and never cached: the editor mutates the scale at runtime.
  macroModeScale(): number;
  // Zoom: canvas -> view.
  scaleCoordinates(position: Vec2): Vec2;
  // Zoom: view -> canvas.
  invertZoom(position: Vec2): Vec2;
}

let source: CoordinatesSource | undefined;

function requireSource(): CoordinatesSource {
  if (!source) {
    throw new Error(
      'Coordinates: no source bound. Import application/editor/shared/coordinates.',
    );
  }
  return source;
}

/**
 * `model` -- The original coordinates of entities, namely angstroms
 * `canvas` -- The real coordinates used to draw entities
 * `view` -- The zoomed canvas coordinates
 */
export class Coordinates {
  static bind(newSource: CoordinatesSource): void {
    source = newSource;
  }

  static canvasToModel(position: Vec2) {
    const scale = requireSource().macroModeScale();
    return position.scaled(1 / scale);
  }

  static viewToModel(position: Vec2) {
    const current = requireSource();
    const scale = current.macroModeScale();
    const pos = current.invertZoom(position);
    return pos.scaled(1 / scale);
  }

  static modelToView(position: Vec2) {
    const current = requireSource();
    const scale = current.macroModeScale();
    return current.scaleCoordinates(position.scaled(scale));
  }

  static modelToCanvas(position: Vec2) {
    const scale = requireSource().macroModeScale();
    return position.scaled(scale);
  }

  // convert the original coordinates to transformed coordinates after the d3 transformation
  static canvasToView(position: Vec2) {
    return requireSource().scaleCoordinates(position);
  }

  // convert the transformed coordinates to coordinates before the d3 transformation
  static viewToCanvas(position: Vec2) {
    return requireSource().invertZoom(position);
  }
}
