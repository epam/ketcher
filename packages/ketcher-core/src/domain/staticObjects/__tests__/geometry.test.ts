import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import {
  constrainToCircle,
  getBoundingBox,
  getBoxHandles,
  getCenter,
  getHandles,
  getHandlesOnOutline,
  hitTest,
  moveShape,
  resizeBox,
  resizeShape,
} from '../geometry';
import type { ShapeGeometry } from '../types';

const shape = (
  kind: SimpleObjectMode,
  start: [number, number],
  end: [number, number],
): ShapeGeometry => ({
  kind,
  start: new Vec2(start[0], start[1]),
  end: new Vec2(end[0], end[1]),
});

const xy = (point: Vec2 | undefined) => (point ? [point.x, point.y] : null);

const TOLERANCE = { outline: 0.3, handle: 0.2 };

describe('getBoundingBox', () => {
  it('normalises reversed points', () => {
    const box = getBoundingBox(
      shape(SimpleObjectMode.rectangle, [4, 3], [1, 1]),
    );

    expect(xy(box.min)).toEqual([1, 1]);
    expect(xy(box.max)).toEqual([4, 3]);
  });
});

describe('getCenter', () => {
  it.each([
    SimpleObjectMode.ellipse,
    SimpleObjectMode.rectangle,
    SimpleObjectMode.line,
  ])('returns the midpoint for %s', (kind) => {
    expect(xy(getCenter(shape(kind, [0, 0], [4, 2])))).toEqual([2, 1]);
  });
});

describe('getHandles', () => {
  it('returns the 8 bounding-box handles of a rectangle in legacy order', () => {
    const handles = getHandles(
      shape(SimpleObjectMode.rectangle, [4, 2], [0, 0]),
    );

    expect([...handles.keys()]).toEqual([
      'top',
      'right',
      'bottom',
      'left',
      'topLeft',
      'bottomLeft',
      'bottomRight',
      'topRight',
    ]);
    expect([...handles.values()].map(xy)).toEqual([
      [2, 0],
      [4, 1],
      [2, 2],
      [0, 1],
      [0, 0],
      [0, 2],
      [4, 2],
      [4, 0],
    ]);
  });

  it('returns 8 handles for an ellipse', () => {
    expect(
      getHandles(shape(SimpleObjectMode.ellipse, [0, 0], [4, 2])).size,
    ).toBe(8);
  });

  it('returns the two endpoints of a line', () => {
    const handles = getHandles(shape(SimpleObjectMode.line, [1, 2], [3, 4]));

    expect([...handles.keys()]).toEqual(['start', 'end']);
    expect(xy(handles.get('end'))).toEqual([3, 4]);
  });
});

describe('getHandlesOnOutline', () => {
  it('keeps only edge midpoints for an ellipse', () => {
    const handles = getHandlesOnOutline(
      shape(SimpleObjectMode.ellipse, [0, 0], [4, 2]),
    );

    expect([...handles.keys()]).toEqual(['top', 'right', 'bottom', 'left']);
  });

  it('keeps all 8 handles for a rectangle', () => {
    expect(
      getHandlesOnOutline(shape(SimpleObjectMode.rectangle, [0, 0], [4, 2]))
        .size,
    ).toBe(8);
  });
});

describe('hitTest', () => {
  it('returns null when the point is far from the shape', () => {
    expect(
      hitTest(
        shape(SimpleObjectMode.line, [0, 0], [10, 0]),
        new Vec2(5, 2),
        TOLERANCE,
      ),
    ).toBeNull();
  });

  it('measures the distance to a line segment', () => {
    const result = hitTest(
      shape(SimpleObjectMode.line, [0, 0], [10, 0]),
      new Vec2(5, 0.1),
      TOLERANCE,
    );

    expect(result?.distance).toBeCloseTo(0.1);
    expect(result?.handle).toBeNull();
  });

  it('reports the nearest handle within the handle tolerance', () => {
    const result = hitTest(
      shape(SimpleObjectMode.line, [0, 0], [10, 0]),
      new Vec2(9.9, 0),
      TOLERANCE,
    );

    expect(result?.handle).toBe('end');
    expect(xy(result?.handlePosition ?? undefined)).toEqual([10, 0]);
  });

  it('measures the distance to the nearest rectangle edge from inside', () => {
    const result = hitTest(
      shape(SimpleObjectMode.rectangle, [0, 0], [10, 4]),
      new Vec2(5, 3.9),
      TOLERANCE,
    );

    expect(result?.distance).toBeCloseTo(0.1);
  });

  it('measures the euclidean distance to a rectangle corner from outside', () => {
    const result = hitTest(
      shape(SimpleObjectMode.rectangle, [0, 0], [10, 4]),
      new Vec2(10.1, 4.1),
      { outline: 1, handle: 0 },
    );

    expect(result?.distance).toBeCloseTo(Math.hypot(0.1, 0.1));
  });

  it('uses the normalised ellipse equation', () => {
    const ellipse = shape(SimpleObjectMode.ellipse, [0, 0], [4, 2]);

    expect(
      hitTest(ellipse, new Vec2(4, 1), { outline: 1, handle: 0 })?.distance,
    ).toBeCloseTo(0);
    expect(
      hitTest(ellipse, new Vec2(2, 1), { outline: 2, handle: 0 })?.distance,
    ).toBeCloseTo(1);
  });

  it('treats a flat ellipse as a segment', () => {
    const result = hitTest(
      shape(SimpleObjectMode.ellipse, [0, 0], [4, 0]),
      new Vec2(2, 0.1),
      TOLERANCE,
    );

    expect(result?.distance).toBeCloseTo(0.1);
  });
});

describe('moveShape', () => {
  it('translates both points without mutating the input', () => {
    const original = shape(SimpleObjectMode.line, [0, 0], [1, 1]);
    const moved = moveShape(original, new Vec2(2, 3));

    expect(xy(moved.start)).toEqual([2, 3]);
    expect(xy(moved.end)).toEqual([3, 4]);
    expect(xy(original.start)).toEqual([0, 0]);
  });
});

describe('resizeShape', () => {
  it('moves the point that holds the dragged corner', () => {
    const resized = resizeShape(
      shape(SimpleObjectMode.rectangle, [4, 2], [0, 0]),
      'bottomRight',
      new Vec2(6, 5),
    );

    expect(xy(resized.start)).toEqual([6, 5]);
    expect(xy(resized.end)).toEqual([0, 0]);
  });

  it('moves only one coordinate for an edge handle', () => {
    const resized = resizeShape(
      shape(SimpleObjectMode.ellipse, [0, 0], [4, 2]),
      'top',
      new Vec2(100, -1),
    );

    expect(xy(resized.start)).toEqual([0, -1]);
    expect(xy(resized.end)).toEqual([4, 2]);
  });

  it('moves the end point when both points share the coordinate', () => {
    const resized = resizeShape(
      shape(SimpleObjectMode.rectangle, [2, 0], [2, 4]),
      'right',
      new Vec2(5, 0),
    );

    expect(xy(resized.start)).toEqual([2, 0]);
    expect(xy(resized.end)).toEqual([5, 4]);
  });

  it('moves a line endpoint', () => {
    const resized = resizeShape(
      shape(SimpleObjectMode.line, [0, 0], [1, 1]),
      'start',
      new Vec2(-1, -2),
    );

    expect(xy(resized.start)).toEqual([-1, -2]);
    expect(xy(resized.end)).toEqual([1, 1]);
  });

  it('keeps tracking the same point after crossing the opposite edge', () => {
    const resized = resizeShape(
      shape(SimpleObjectMode.rectangle, [0, 0], [4, 2]),
      'right',
      new Vec2(-3, 0),
    );

    expect(xy(resized.end)).toEqual([-3, 2]);
  });
});

describe('resizeBox', () => {
  it('moves the edges named by the handle', () => {
    const box = resizeBox(
      { min: new Vec2(0, 0), max: new Vec2(4, 2) },
      'topLeft',
      new Vec2(-1, -1),
    );

    expect(xy(box.min)).toEqual([-1, -1]);
    expect(xy(box.max)).toEqual([4, 2]);
  });

  it('moves a single edge for an edge handle', () => {
    const box = resizeBox(
      { min: new Vec2(0, 0), max: new Vec2(4, 2) },
      'bottom',
      new Vec2(10, 5),
    );

    expect(xy(box.min)).toEqual([0, 0]);
    expect(xy(box.max)).toEqual([4, 5]);
  });
});

describe('getBoxHandles', () => {
  it('derives handles from a box', () => {
    const handles = getBoxHandles({ min: new Vec2(0, 0), max: new Vec2(2, 2) });

    expect(xy(handles.get('right'))).toEqual([2, 1]);
  });
});

describe('constrainToCircle', () => {
  it.each([
    [
      [3, 1],
      [1, 1],
    ],
    [
      [-3, 1],
      [-1, 1],
    ],
    [
      [1, -3],
      [1, -1],
    ],
    [
      [-2, -5],
      [-2, -2],
    ],
  ])('snaps %j to %j', (end, expected) => {
    expect(
      xy(constrainToCircle(new Vec2(0, 0), new Vec2(end[0], end[1]))),
    ).toEqual(expected);
  });
});
