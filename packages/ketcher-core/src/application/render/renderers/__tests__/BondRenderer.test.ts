import { BondRenderer } from '../BondRenderer';
import { Vec2 } from 'domain/entities/vec2';
import type { Atom } from 'domain/entities/CoreAtom';
import type { HalfEdge } from 'application/render/view-model/HalfEdge';
import { Coordinates } from 'application/editor/shared/coordinates';

describe('R-group bond endpoint', () => {
  beforeEach(() => {
    jest
      .spyOn(Coordinates, 'modelToCanvas')
      .mockImplementation((position) => position.scaled(40));
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    [1, 14],
    [0.5, 10],
  ])(
    'matches molecules-mode padding for bond length %s',
    (length, expected) => {
      const atom = {
        label: 'R#',
        position: new Vec2(0, 0),
        renderer: {
          isLabelVisible: true,
          scaledPosition: new Vec2(0, 0),
          labelBBoxes: [{ x: -8, y: -6, width: 16, height: 12 }],
        },
      } as unknown as Atom;
      const halfEdge = {
        firstAtom: atom,
        secondAtom: { position: new Vec2(length, 0) },
        direction: new Vec2(1, 0),
      } as HalfEdge;

      const shift = (
        BondRenderer.prototype as unknown as {
          shiftPositionIfAtomLabelVisible: (
            position: Vec2,
            atom: Atom,
            halfEdge: HalfEdge,
          ) => Vec2;
        }
      ).shiftPositionIfAtomLabelVisible;

      expect(shift.call({}, new Vec2(0, 0), atom, halfEdge).x).toBe(expected);
    },
  );
});
