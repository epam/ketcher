import { RxnArrow, RxnArrowMode, Struct, Vec2 } from 'domain/entities';

describe('Paste Action', () => {
  describe('getCoordBoundingBox for reaction arrows', () => {
    it('should calculate bounding box correctly for multiple reaction arrows', () => {
      // Create a struct with multiple reaction arrows
      const struct = new Struct();

      // Add three reaction arrows at different positions
      const arrow1 = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(0, 0), new Vec2(2, 0)],
      });
      const arrow2 = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(4, 0), new Vec2(6, 0)],
      });
      const arrow3 = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(8, 0), new Vec2(10, 0)],
      });

      struct.rxnArrows.set(0, arrow1);
      struct.rxnArrows.set(1, arrow2);
      struct.rxnArrows.set(2, arrow3);

      // Get the bounding box
      const bbox = struct.getCoordBoundingBox();

      // The bounding box should include all arrow positions
      // min should be (0, 0), max should be (10, 0)
      expect(bbox).toBeDefined();
      expect(bbox.min.x).toBeCloseTo(0, 5);
      expect(bbox.min.y).toBeCloseTo(0, 5);
      expect(bbox.max.x).toBeCloseTo(10, 5);
      expect(bbox.max.y).toBeCloseTo(0, 5);

      // Center should be at (5, 0)
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerY = (bbox.min.y + bbox.max.y) / 2;
      expect(centerX).toBeCloseTo(5, 5);
      expect(centerY).toBeCloseTo(0, 5);
    });

    it('should calculate bounding box correctly for single reaction arrow', () => {
      const struct = new Struct();

      // Add single reaction arrow
      const arrow = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(0, 0), new Vec2(10, 0)],
      });

      struct.rxnArrows.set(0, arrow);

      const bbox = struct.getCoordBoundingBox();

      expect(bbox).toBeDefined();
      expect(bbox.min.x).toBeCloseTo(0, 5);
      expect(bbox.min.y).toBeCloseTo(0, 5);
      expect(bbox.max.x).toBeCloseTo(10, 5);
      expect(bbox.max.y).toBeCloseTo(0, 5);

      // Center should be at (5, 0)
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerY = (bbox.min.y + bbox.max.y) / 2;
      expect(centerX).toBeCloseTo(5, 5);
      expect(centerY).toBeCloseTo(0, 5);
    });

    it('should calculate bounding box correctly for reaction arrows at different positions', () => {
      const struct = new Struct();

      // Add two reaction arrows at different y positions
      const arrow1 = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(0, 0), new Vec2(10, 0)],
      });
      const arrow2 = new RxnArrow({
        mode: RxnArrowMode.FilledTriangle,
        pos: [new Vec2(0, 10), new Vec2(10, 10)],
      });

      struct.rxnArrows.set(0, arrow1);
      struct.rxnArrows.set(1, arrow2);

      const bbox = struct.getCoordBoundingBox();

      expect(bbox).toBeDefined();
      expect(bbox.min.x).toBeCloseTo(0, 5);
      expect(bbox.min.y).toBeCloseTo(0, 5);
      expect(bbox.max.x).toBeCloseTo(10, 5);
      expect(bbox.max.y).toBeCloseTo(10, 5);

      // Center should be at (5, 5)
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerY = (bbox.min.y + bbox.max.y) / 2;
      expect(centerX).toBeCloseTo(5, 5);
      expect(centerY).toBeCloseTo(5, 5);
    });

    it('should calculate bounding box correctly for arrows with vertical orientation', () => {
      const struct = new Struct();

      // Add vertical arrow
      const arrow = new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(5, 0), new Vec2(5, 10)],
      });

      struct.rxnArrows.set(0, arrow);

      const bbox = struct.getCoordBoundingBox();

      expect(bbox).toBeDefined();
      expect(bbox.min.x).toBeCloseTo(5, 5);
      expect(bbox.min.y).toBeCloseTo(0, 5);
      expect(bbox.max.x).toBeCloseTo(5, 5);
      expect(bbox.max.y).toBeCloseTo(10, 5);

      // Center should be at (5, 5)
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerY = (bbox.min.y + bbox.max.y) / 2;
      expect(centerX).toBeCloseTo(5, 5);
      expect(centerY).toBeCloseTo(5, 5);
    });
  });
});
