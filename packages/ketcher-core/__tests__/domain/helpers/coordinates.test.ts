import { Vec2 } from 'domain/entities/vec2';
import { Coordinates, CoordinatesSource } from 'domain/helpers/coordinates';

// The zoom is scale 1.2 with an offset of 40, the transform the application
// test of Coordinates uses.
const ZOOM = 1.2;
const OFFSET = 40;

function createSource(macroModeScale: () => number): CoordinatesSource {
  return {
    macroModeScale,
    scaleCoordinates: (position) =>
      new Vec2(position.x * ZOOM + OFFSET, position.y * ZOOM + OFFSET, 0),
    invertZoom: (position) =>
      new Vec2((position.x - OFFSET) / ZOOM, (position.y - OFFSET) / ZOOM, 0),
  };
}

describe('Coordinates in the domain', () => {
  const position = new Vec2(100, 100, 0);

  describe('without a bound source', () => {
    const methods = [
      'canvasToModel',
      'viewToModel',
      'modelToView',
      'modelToCanvas',
      'canvasToView',
      'viewToCanvas',
    ] as const;

    it.each(methods)('should throw from %s', (method) => {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const unbound = require('domain/helpers/coordinates').Coordinates;

        expect(() => unbound[method](position)).toThrow(
          new Error(
            'Coordinates: no source bound. Import application/editor/shared/coordinates.',
          ),
        );
      });
    });
  });

  describe('with a bound source', () => {
    let scale: number;

    beforeEach(() => {
      scale = 40;
      Coordinates.bind(createSource(() => scale));
    });

    it('should convert canvas coordinates to model coordinates', () => {
      expect(Coordinates.canvasToModel(position)).toEqual(
        new Vec2(2.5, 2.5, 0),
      );
    });

    it('should convert view coordinates to model coordinates', () => {
      expect(Coordinates.viewToModel(position)).toEqual(
        new Vec2(1.25, 1.25, 0),
      );
    });

    it('should convert model coordinates to view coordinates', () => {
      expect(Coordinates.modelToView(position)).toEqual(
        new Vec2(4840, 4840, 0),
      );
    });

    it('should convert model coordinates to canvas coordinates', () => {
      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(4000, 4000, 0),
      );
    });

    it('should convert canvas coordinates to view coordinates', () => {
      expect(Coordinates.canvasToView(position)).toEqual(new Vec2(160, 160, 0));
    });

    it('should convert view coordinates to canvas coordinates', () => {
      expect(Coordinates.viewToCanvas(position)).toEqual(new Vec2(50, 50, 0));
    });

    it('should read the scale on every call', () => {
      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(4000, 4000, 0),
      );

      scale = 20;

      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(2000, 2000, 0),
      );
      expect(Coordinates.canvasToModel(position)).toEqual(new Vec2(5, 5, 0));
      // 100 * 20 = 2000 on the canvas, then zoom 1.2 and offset 40
      expect(Coordinates.modelToView(position)).toEqual(
        new Vec2(2440, 2440, 0),
      );
      // (100 - 40) / 1.2 = 50 on the canvas, then 50 / 20
      expect(Coordinates.viewToModel(position)).toEqual(new Vec2(2.5, 2.5, 0));
    });

    it('should use the source bound last', () => {
      Coordinates.bind(createSource(() => 10));

      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(1000, 1000, 0),
      );
    });
  });
});
