import type { ReStruct } from 'application/render';
import { ImageResize } from 'application/editor/operations/image/imageResize';
import { fromImageResize } from 'application/editor/actions/image';
import { Image } from 'domain/entities/image';
import { Vec2 } from 'domain/entities/vec2';

function setup(halfSize = new Vec2(4, 2)) {
  const image = new Image('bitmap', new Vec2(10, 10), halfSize);
  // Keep the real image/action/operation pipeline; stub only rendering.
  const reStruct = {
    molecule: { images: new Map([[0, image]]) },
    images: new Map([
      [0, { visel: { paths: [{ next: undefined }] }, show: jest.fn() }],
    ]),
    clearVisel: jest.fn(),
    render: { options: {} },
  } as unknown as ReStruct;
  return { image, reStruct };
}

describe('ImageResize inversion', () => {
  it('restores complete bounds after the dragged corner crosses the opposite anchor', () => {
    const { image, reStruct } = setup();
    const before = image.getReferencePositions();
    const operation = new ImageResize(0, new Vec2(2, 6), 'bottomRightPosition');
    const undo = operation.perform(reStruct);
    expect(undo.isDummy(reStruct)).toBe(false);
    const resized = image.getReferencePositions();
    const redo = undo.perform(reStruct);
    expect(image.getReferencePositions()).toEqual(before);
    expect(undo.isDummy(reStruct)).toBe(true);
    redo.perform(reStruct);
    expect(image.getReferencePositions()).toEqual(resized);
  });
});

const corners = [
  ['topLeftPosition', 'bottomRightPosition', -1, -1],
  ['topRightPosition', 'bottomLeftPosition', 1, -1],
  ['bottomRightPosition', 'topLeftPosition', 1, 1],
  ['bottomLeftPosition', 'topRightPosition', -1, 1],
] as const;

describe('Proportional image corner resizing', () => {
  describe.each(corners)('%s', (name, oppositeName, signX, signY) => {
    it.each([
      [16, 3, 2],
      [6, 8, 2],
      [4, 1, 0.5],
      [2, 2, 0.5],
      [0, 2, 0.5],
      [4, 0, 0.5],
    ])('constrains displacement (%s, %s) to scale %s', (dx, dy, scale) => {
      const { image, reStruct } = setup();
      const before = image.getReferencePositions();
      const anchor = before[oppositeName];
      const offset = new Vec2(0.25, -0.5);
      const target = anchor.add(new Vec2(signX * dx, signY * dy));
      const undo = fromImageResize(reStruct, 0, target.sub(offset), {
        name,
        offset,
      });
      const after = image.getReferencePositions();
      expect(after[oppositeName]).toEqual(anchor);
      expect(after[name]).toEqual(
        anchor.add(new Vec2(signX * 8 * scale, signY * 4 * scale)),
      );
      const redo = undo.perform(reStruct);
      expect(image.getReferencePositions()).toEqual(before);
      redo.perform(reStruct);
      expect(image.getReferencePositions()).toEqual(after);
    });

    it.each([
      [-1, 1],
      [1, -1],
      [-1, -1],
      [0, 0],
    ])(
      'normalizes crossing (%s, %s) and restores every preview exactly',
      (crossX, crossY) => {
        const { image, reStruct } = setup();
        const before = image.getReferencePositions();
        const anchor = before[oppositeName];
        for (const scale of [0.5, 2, 1]) {
          const target = anchor.add(
            new Vec2(signX * crossX * 8 * scale, signY * crossY * 4 * scale),
          );
          const undo = fromImageResize(reStruct, 0, target, {
            name,
            offset: new Vec2(),
          });
          const after = image.getReferencePositions();
          const size = after.bottomRightPosition.sub(after.topLeftPosition);
          const expectedScale = crossX === 0 && crossY === 0 ? 0 : scale;
          expect(size).toEqual(new Vec2(8 * expectedScale, 4 * expectedScale));
          expect(image.getCornerPositions()).toContainEqual(anchor);
          const redo = undo.perform(reStruct);
          expect(image.getReferencePositions()).toEqual(before);
          redo.perform(reStruct);
          expect(image.getReferencePositions()).toEqual(after);
          undo.perform(reStruct);
          expect(image.getReferencePositions()).toEqual(before);
        }
      },
    );
  });

  it.each([
    ['topMiddlePosition', new Vec2(100, 6), new Vec2(6, 6), new Vec2(14, 12)],
    [
      'bottomMiddlePosition',
      new Vec2(100, 14),
      new Vec2(6, 8),
      new Vec2(14, 14),
    ],
    ['leftMiddlePosition', new Vec2(4, 100), new Vec2(4, 8), new Vec2(14, 12)],
    [
      'rightMiddlePosition',
      new Vec2(18, 100),
      new Vec2(6, 8),
      new Vec2(18, 12),
    ],
  ] as const)('keeps %s independent', (name, target, topLeft, bottomRight) => {
    const { image, reStruct } = setup();
    fromImageResize(reStruct, 0, target, { name, offset: new Vec2() });
    expect(image.getTopLeftPosition()).toEqual(topLeft);
    expect(image.getBottomRightPosition()).toEqual(bottomRight);
  });

  it('preserves the ratio after a middle handle distorts the image', () => {
    const { image, reStruct } = setup();
    fromImageResize(reStruct, 0, new Vec2(18, 10), {
      name: 'rightMiddlePosition',
      offset: new Vec2(),
    });
    const before = image.getReferencePositions();
    const undo = fromImageResize(reStruct, 0, new Vec2(12, 7), {
      name: 'bottomRightPosition',
      offset: new Vec2(),
    });
    expect(
      image.getBottomRightPosition().sub(image.getTopLeftPosition()),
    ).toEqual(new Vec2(6, 2));
    undo.perform(reStruct);
    expect(image.getReferencePositions()).toEqual(before);
  });

  it.each([new Vec2(0, 2), new Vec2(4, 0), new Vec2(0, 0)])(
    'retains unconstrained resizing for degenerate half-size %s',
    (halfSize) => {
      const { image, reStruct } = setup(halfSize);
      const anchor = image.getTopLeftPosition();
      const undo = fromImageResize(reStruct, 0, new Vec2(16, 15), {
        name: 'bottomRightPosition',
        offset: new Vec2(),
      });
      expect(image.getTopLeftPosition()).toEqual(anchor);
      expect(image.getBottomRightPosition()).toEqual(new Vec2(16, 15));
      undo.perform(reStruct);
      expect(image.center()).toEqual(new Vec2(10, 10));
      expect(
        image.getBottomRightPosition().sub(image.getTopLeftPosition()),
      ).toEqual(halfSize.scaled(2));
    },
  );
});
