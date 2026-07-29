import {
  Atom,
  RxnArrow,
  RxnArrowMode,
  RxnPlus,
  Struct,
  Text,
  Vec2,
} from 'ketcher-core';
import {
  alignToCentroid,
  mergeMetaObjects,
  needsMetaPreservation,
} from './miewStructMerge';

describe('miewStructMerge', () => {
  describe('needsMetaPreservation', () => {
    it('returns false for a plain molecule', () => {
      const struct = new Struct();
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      expect(needsMetaPreservation(struct)).toBe(false);
    });

    it('returns true when reaction symbols are present', () => {
      const struct = new Struct();
      struct.rxnPluses.add(new RxnPlus({ pp: new Vec2(1, 1) }));
      expect(needsMetaPreservation(struct)).toBe(true);
    });
  });

  describe('alignToCentroid', () => {
    it('translates result atoms to match the original centroid', () => {
      const original = new Struct();
      original.atoms.add(new Atom({ label: 'C', pp: new Vec2(10, 10) }));
      original.atoms.add(new Atom({ label: 'C', pp: new Vec2(12, 10) }));

      const result = new Struct();
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(2, 0) }));

      alignToCentroid(result, original);

      const atoms = Array.from(result.atoms.values());
      expect(atoms[0].pp.x).toBeCloseTo(10);
      expect(atoms[0].pp.y).toBeCloseTo(10);
      expect(atoms[1].pp.x).toBeCloseTo(12);
      expect(atoms[1].pp.y).toBeCloseTo(10);
    });
  });

  describe('mergeMetaObjects', () => {
    it('copies reaction symbols and text from the original struct', () => {
      const original = new Struct();
      original.isReaction = true;
      original.rxnPluses.add(new RxnPlus({ pp: new Vec2(5, 5) }));
      original.addRxnArrow(
        new RxnArrow({
          mode: RxnArrowMode.OpenAngle,
          pos: [new Vec2(0, 0), new Vec2(1, 0)],
        }),
      );
      original.texts.add(
        new Text({
          content: 'note',
          position: new Vec2(3, 3),
          pos: [],
        }),
      );

      const result = new Struct();
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));

      mergeMetaObjects(result, original);

      expect(result.isReaction).toBe(true);
      expect(result.rxnPluses.size).toBe(1);
      expect(result.rxnArrows.size).toBe(1);
      expect(result.texts.size).toBe(1);
    });

    it('resets INVALID initiallySelected on cloned meta so getSelectionFromStruct is safe', () => {
      const original = new Struct();
      const plus = new RxnPlus({ pp: new Vec2(1, 1) });
      original.rxnPluses.add(plus);
      original.disableInitiallySelected();

      const result = new Struct();
      mergeMetaObjects(result, original);

      const cloned = Array.from(result.rxnPluses.values())[0];
      expect(() => cloned.getInitiallySelected()).not.toThrow();
    });
  });
});
