import { Atom } from 'domain/entities/atom';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

function makeStructWithAtoms(
  positions: Vec2[],
  fragmentIds?: number[],
): { struct: Struct; ids: number[] } {
  const struct = new Struct();
  const ids = positions.map((pp, i) => {
    const fragment = fragmentIds ? fragmentIds[i] : 0;
    return struct.atoms.add(new Atom({ label: 'C', pp, fragment }));
  });
  return { struct, ids };
}

describe('SuperAttachmentPoint', () => {
  describe('pp (bounding-box center)', () => {
    it('is the bounding-box center, not the mean centroid, for an asymmetric set', () => {
      // Asymmetric layout: 3 atoms clustered left, 1 far right.
      const { struct, ids } = makeStructWithAtoms([
        new Vec2(0, 0),
        new Vec2(0, 1),
        new Vec2(0, -1),
        new Vec2(10, 0),
      ]);
      const sap = new SuperAttachmentPoint({ atoms: ids });
      sap.recomputeCenter(struct);

      // Mean centroid would be (2.5, 0). Bounding-box center is (5, 0).
      expect(sap.pp.x).toBe(5);
      expect(sap.pp.y).toBe(0);
    });

    it('uses bounding-box center (asymmetric in y) for a regular pentagon', () => {
      // Vertices on the unit circle at angles -90°, -18°, 54°, 126°, 198°.
      // x range: ±cos(18°) ≈ ±0.9511 → x center 0
      // y range: -1 (bottom vertex) to sin(54°) ≈ 0.809 (upper vertices)
      // → bbox center y = (-1 + 0.809…)/2 ≈ -0.0955
      const points: Vec2[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
        points.push(new Vec2(Math.cos(angle), Math.sin(angle)));
      }
      const { struct, ids } = makeStructWithAtoms(points);
      const sap = new SuperAttachmentPoint({ atoms: ids });
      sap.recomputeCenter(struct);

      expect(sap.pp.x).toBeCloseTo(0, 6);
      // Verifies bbox-center, not centroid (centroid would be (0, 0)).
      expect(sap.pp.y).toBeCloseTo(
        (-1 + Math.sin((54 * Math.PI) / 180)) / 2,
        6,
      );
      expect(sap.pp.y).not.toBeCloseTo(0, 2);
    });

    it('recomputes when the underlying atom positions change', () => {
      const { struct, ids } = makeStructWithAtoms([
        new Vec2(0, 0),
        new Vec2(2, 2),
      ]);
      const sap = new SuperAttachmentPoint({ atoms: ids });
      sap.recomputeCenter(struct);
      expect(sap.pp.x).toBe(1);
      expect(sap.pp.y).toBe(1);

      const movedAtom = struct.atoms.get(ids[1]);
      if (!movedAtom) throw new Error('atom missing');
      movedAtom.pp = new Vec2(4, 4);
      sap.recomputeCenter(struct);
      expect(sap.pp.x).toBe(2);
      expect(sap.pp.y).toBe(2);
    });
  });

  describe('fragmentId getter', () => {
    it('returns the fragment id of the first member atom', () => {
      const { struct, ids } = makeStructWithAtoms(
        [new Vec2(0, 0), new Vec2(1, 0), new Vec2(2, 0)],
        [7, 7, 7],
      );
      const sap = new SuperAttachmentPoint({ atoms: ids });
      expect(sap.fragmentId(struct)).toBe(7);
    });

    it('returns -1 if the first member atom is missing from the struct', () => {
      const sap = new SuperAttachmentPoint({ atoms: [999, 1000] });
      expect(sap.fragmentId(new Struct())).toBe(-1);
    });
  });
});
