import { CoordinateTransformation, Render } from 'application/render';
import { Vec2 } from 'domain/entities';

describe('CoordinateTransformation', () => {
  const CLIENT_AREA_TOP = 13;
  const CLIENT_AREA_LEFT = 14;
  const render = {
    viewBox: {
      minX: 10,
      minY: 10,
      width: 200,
      height: 100,
    },
    options: {
      zoom: 0.5,
      scale: 40,
    },
    clientArea: {
      getBoundingClientRect: () => ({
        top: CLIENT_AREA_TOP,
        left: CLIENT_AREA_LEFT,
      }),
    },
  } as Render;

  const protoPoint = new Vec2(10, 10);
  const pointInCanvas = protoPoint.scaled(render.options.scale);
  const pointInViewBox = pointInCanvas
    .sub(new Vec2(render.viewBox.minX, render.viewBox.minY))
    .scaled(render.options.zoom);
  const pageEvent = {
    clientX: pointInViewBox.x + CLIENT_AREA_LEFT,
    clientY: pointInViewBox.y + CLIENT_AREA_TOP,
  };

  test('canvasToViewBox', () => {
    const point = CoordinateTransformation.canvasToViewBox(
      pointInCanvas,
      render,
    );
    expect(point).toStrictEqual(pointInViewBox);
  });

  test('protoToViewBox', () => {
    const point = CoordinateTransformation.protoToViewBox(protoPoint, render);
    expect(point).toStrictEqual(pointInViewBox);
  });

  test('viewBoxToCanvas', () => {
    const point = CoordinateTransformation.viewBoxToCanvas(
      pointInViewBox,
      render,
    );
    expect(point).toStrictEqual(pointInCanvas);
  });

  test('viewBoxToProto', () => {
    const point = CoordinateTransformation.viewBoxToProto(
      pointInViewBox,
      render,
    );
    expect(point).toStrictEqual(protoPoint);
  });

  test('pageEventToCanvas', () => {
    const point = CoordinateTransformation.pageEventToCanvas(pageEvent, render);
    expect(point).toStrictEqual(pointInCanvas);
  });

  test('pageEventToProto', () => {
    const point = CoordinateTransformation.pageEventToProto(pageEvent, render);
    expect(point).toStrictEqual(protoPoint);
  });
});
