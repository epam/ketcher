import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { SimpleObject, SimpleObjectMode } from 'domain/entities/simpleObject';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

function chain(bondLengths: number[]): Struct {
  const struct = new Struct();
  let x = 0;
  let previous = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));

  bondLengths.forEach((length) => {
    x += length;
    const next = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) }));
    struct.bonds.add(
      new Bond({
        begin: previous,
        end: next,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    previous = next;
  });

  return struct;
}

function span(struct: Struct): number {
  const first = struct.atoms.get(0);
  const last = struct.atoms.get(struct.atoms.size - 1);
  if (!first || !last) {
    throw new Error('atoms missing');
  }
  return last.pp.x - first.pp.x;
}

describe('Struct.median', () => {
  it('returns -1 for an empty set', () => {
    expect(Struct.median([])).toBe(-1);
  });

  it('returns the middle value for an odd count', () => {
    expect(Struct.median([3, 1, 2])).toBe(2);
  });

  it('averages the two middle values for an even count', () => {
    expect(Struct.median([4, 1, 3, 2])).toBe(2.5);
  });

  it('ignores outliers that would drag the mean away', () => {
    expect(Struct.median([1, 1, 1, 1, 4, 4])).toBe(1);
  });
});

describe('Struct.rescale', () => {
  it('normalizes the median bond length to 1', () => {
    const struct = chain([1.54, 1.54, 1.54]);
    struct.rescale();
    expect(struct.getMedianBondLength()).toBeCloseTo(1, 6);
  });

  it('is idempotent — repeated loads do not shrink the structure further', () => {
    const struct = chain([1, 1, 1, 1.6, 1.6]);
    struct.rescale();
    const afterFirst = span(struct);
    struct.rescale();
    expect(span(struct)).toBeCloseTo(afterFirst, 6);
  });

  it('does nothing when the structure has no bonds', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    expect(() => struct.rescale()).not.toThrow();
  });

  describe('scale-sanity guard', () => {
    it('rescales at the lower boundary (median 100 → scale 0.01)', () => {
      const struct = chain([100]);
      struct.rescale();
      expect(struct.getMedianBondLength()).toBeCloseTo(1, 6);
    });

    it('rescales at the upper boundary (median 0.01 → scale 100)', () => {
      const struct = chain([0.01]);
      struct.rescale();
      expect(struct.getMedianBondLength()).toBeCloseTo(1, 6);
    });

    it('refuses a median of 10000 (scale would be 0.0001×)', () => {
      const struct = chain([10000]);
      struct.rescale();
      expect(struct.getMedianBondLength()).toBe(10000);
    });

    it('refuses a median of 0.0001 (scale would be 10000×)', () => {
      const struct = chain([0.0001]);
      struct.rescale();
      expect(struct.getMedianBondLength()).toBeCloseTo(0.0001, 8);
    });
  });

  // Issue #5275: a ring with a few distorted bonds used to drag the *average*
  // bond length far from 1, so loading the file shrank everything on the canvas —
  // shapes, texts and images included — not just the distorted ring.
  describe('issue #5275 — distorted bonds must not shrink the rest of the canvas', () => {
    function corruptedRingWithShape(pullDistance: number): Struct {
      const struct = new Struct();
      const ids: number[] = [];

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        ids.push(
          struct.atoms.add(
            new Atom({
              label: 'C',
              pp: new Vec2(Math.cos(angle), Math.sin(angle)),
            }),
          ),
        );
      }

      // One atom dragged away from the ring, as in the bug report.
      const dragged = struct.atoms.get(ids[0]);
      if (!dragged) {
        throw new Error('atom missing');
      }
      dragged.pp = new Vec2(pullDistance, 0);

      for (let i = 0; i < 6; i++) {
        struct.bonds.add(
          new Bond({
            begin: ids[i],
            end: ids[(i + 1) % 6],
            type: Bond.PATTERN.TYPE.SINGLE,
          }),
        );
      }

      struct.simpleObjects.add(
        new SimpleObject({
          mode: SimpleObjectMode.rectangle,
          pos: [new Vec2(5, 5), new Vec2(7, 6)],
        }),
      );

      return struct;
    }

    function shapeDiagonal(struct: Struct): number {
      const shape = struct.simpleObjects.get(0);
      if (!shape) {
        throw new Error('shape missing');
      }
      return Vec2.dist(shape.pos[0], shape.pos[1]);
    }

    it.each([3, 5, 10])(
      'keeps shape size when one atom is dragged to x=%p',
      (pullDistance) => {
        const struct = corruptedRingWithShape(pullDistance);

        // The mean is what used to cause the shrink; the median is unaffected.
        expect(struct.getAvgBondLength()).toBeGreaterThan(1.5);
        expect(struct.getMedianBondLength()).toBeCloseTo(1, 6);

        const before = shapeDiagonal(struct);
        struct.rescale();
        expect(shapeDiagonal(struct)).toBeCloseTo(before, 6);
      },
    );
  });
});
