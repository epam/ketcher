import { Coordinates } from 'application/editor/shared/coordinates';
import ZoomTool from 'application/editor/tools/Zoom';
import { ZoomTransform } from 'd3';
import { Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { provideEditorSettings } from 'application/editor/editorSettings';

describe('Coordinates', () => {
  const position = new Vec2(100, 100, 0);
  ZoomTool.initInstance(new DrawingEntitiesManager());
  ZoomTool.instance.setZoomTransform(new ZoomTransform(1.2, 40, 40));

  it('should convert page coordinates to model coordinates', () => {
    const converted = Coordinates.canvasToModel(position);
    const coordinates = new Vec2(2.5, 2.5, 0);
    expect(converted).toEqual(coordinates);
  });

  it('should convert view coordinates to model coordinates', () => {
    const converted = Coordinates.viewToModel(position);
    const coordinates = new Vec2(1.25, 1.25, 0);
    expect(converted).toEqual(coordinates);
  });

  it('should convert modal coordinates to view coordinates', () => {
    const coordinates = Coordinates.modelToView(position);
    const converted = new Vec2(4840, 4840, 0);
    expect(coordinates).toEqual(converted);
  });

  it('should convert modal coordinates to page coordinates', () => {
    const coordinates = Coordinates.modelToCanvas(position);
    const converted = new Vec2(4000, 4000, 0);
    expect(coordinates).toEqual(converted);
  });

  it('should convert page coordinates to view coordinates', () => {
    const coordinates = Coordinates.canvasToView(position);
    const converted = new Vec2(160, 160, 0);
    expect(coordinates).toEqual(converted);
  });

  it('should convert view coordinates to page coordinates', () => {
    const coordinates = Coordinates.viewToCanvas(position);
    const converted = new Vec2(50, 50, 0);
    expect(coordinates).toEqual(converted);
  });

  describe('scale mutated at runtime', () => {
    const settings = provideEditorSettings();

    afterEach(() => {
      settings.macroModeScale = 40;
    });

    it('should read the scale on every call in canvasToModel', () => {
      settings.macroModeScale = 20;

      expect(Coordinates.canvasToModel(position)).toEqual(new Vec2(5, 5, 0));
    });

    it('should read the scale on every call in modelToCanvas', () => {
      settings.macroModeScale = 20;

      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(2000, 2000, 0),
      );
    });

    it('should read the scale on every call in modelToView and viewToModel', () => {
      settings.macroModeScale = 20;

      // 100 * 20 = 2000 on the canvas, then zoom 1.2 and offset 40
      expect(Coordinates.modelToView(position)).toEqual(
        new Vec2(2440, 2440, 0),
      );
      // (100 - 40) / 1.2 = 50 on the canvas, then 50 / 20
      expect(Coordinates.viewToModel(position)).toEqual(new Vec2(2.5, 2.5, 0));
    });

    it('should return to the default scale after it is restored', () => {
      settings.macroModeScale = 20;
      settings.macroModeScale = 40;

      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(4000, 4000, 0),
      );
    });
  });

  describe('without a zoom tool instance', () => {
    const zoomTool = ZoomTool.instance;

    beforeEach(() => {
      Reflect.set(ZoomTool, '_instance', undefined);
    });

    afterEach(() => {
      Reflect.set(ZoomTool, '_instance', zoomTool);
    });

    it('should convert between canvas and model coordinates', () => {
      expect(Coordinates.canvasToModel(position)).toEqual(
        new Vec2(2.5, 2.5, 0),
      );
      expect(Coordinates.modelToCanvas(position)).toEqual(
        new Vec2(4000, 4000, 0),
      );
    });

    it('should throw for the conversions that need the zoom', () => {
      expect(() => Coordinates.modelToView(position)).toThrow(TypeError);
      expect(() => Coordinates.viewToModel(position)).toThrow(TypeError);
      expect(() => Coordinates.canvasToView(position)).toThrow(TypeError);
      expect(() => Coordinates.viewToCanvas(position)).toThrow(TypeError);
    });
  });
});
