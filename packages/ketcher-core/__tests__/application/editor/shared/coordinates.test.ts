import Coordinates from 'application/editor/shared/coordinates';
import ZoomTool from 'application/editor/tools/Zoom';
import { ZoomTransform } from 'd3';
import { Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

describe('Coordinates', () => {
  const position = new Vec2(100, 100, 0);
  ZoomTool.getInstance(new DrawingEntitiesManager());
  ZoomTool.instance.setZoomTransform(new ZoomTransform(1.2, 40, 40));

  it('should convert page coordinates to model coordinates', () => {
    const converted = Coordinates.pageToModel(position);
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
    const coordinates = Coordinates.modelToPage(position);
    const converted = new Vec2(4000, 4000, 0);
    expect(coordinates).toEqual(converted);
  });

  it('should convert page coordinates to view coordinates', () => {
    const coordinates = Coordinates.pageToView(position);
    const converted = new Vec2(160, 160, 0);
    expect(coordinates).toEqual(converted);
  });

  it('should convert view coordinates to page coordinates', () => {
    const coordinates = Coordinates.viewToPage(position);
    const converted = new Vec2(50, 50, 0);
    expect(coordinates).toEqual(converted);
  });
});
