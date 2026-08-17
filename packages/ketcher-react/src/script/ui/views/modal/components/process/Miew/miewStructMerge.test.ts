import {
  Atom,
  RxnArrow,
  RxnArrowMode,
  RxnPlus,
  SGroup,
  Struct,
  Text,
  Vec2,
} from 'ketcher-core';
import {
  alignToCentroid,
  mergeCoordinatesFromResult,
  mergeMetaObjects,
  needsMetaPreservation,
  needsStructurePreservation,
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

  describe('needsStructurePreservation', () => {
    it('returns false for a plain molecule with no S-groups or R-groups', () => {
      const struct = new Struct();
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      expect(needsStructurePreservation(struct)).toBe(false);
    });

    it('returns true for a structure with a nucleotide-component SUP S-group', () => {
      const struct = new Struct();
      const sgroup = new SGroup('SUP');
      sgroup.data.class = 'SUGAR';
      struct.sgroups.add(sgroup);
      expect(needsStructurePreservation(struct)).toBe(true);
    });

    it('returns true for a structure with a regular named SUP S-group', () => {
      const struct = new Struct();
      const sgroup = new SGroup('SUP');
      sgroup.data.name = 'Boc';
      struct.sgroups.add(sgroup);
      expect(needsStructurePreservation(struct)).toBe(true);
    });
  });

  describe('mergeCoordinatesFromResult', () => {
    it('copies result atom coordinates onto the original struct while preserving its S-groups/class/name', () => {
      const original = new Struct();
      const a0 = new Atom({ label: 'C', pp: new Vec2(0, 0) });
      const a1 = new Atom({ label: 'C', pp: new Vec2(1, 0) });
      original.atoms.add(a0);
      original.atoms.add(a1);
      const sgroup = new SGroup('SUP');
      sgroup.data.class = 'SUGAR';
      sgroup.data.name = '';
      sgroup.data.expanded = false;
      sgroup.atoms = [0, 1];
      original.sgroups.add(sgroup);

      const result = new Struct();
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(5, 5, 1) }));
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(6, 5, 1) }));

      const merged = mergeCoordinatesFromResult(original, result);

      expect(merged).toBe(true);

      const atoms = Array.from(original.atoms.values());
      expect(atoms[0].pp.x).toBeCloseTo(5);
      expect(atoms[0].pp.y).toBeCloseTo(5);
      expect(atoms[0].pp.z).toBeCloseTo(1);
      expect(atoms[1].pp.x).toBeCloseTo(6);
      expect(atoms[1].pp.y).toBeCloseTo(5);

      // Metadata that the CML/Miew round-trip cannot represent must survive
      // untouched.
      expect(original.sgroups.size).toBe(1);
      const preservedSgroup = Array.from(original.sgroups.values())[0];
      expect(preservedSgroup.data.class).toBe('SUGAR');
      expect(preservedSgroup.data.expanded).toBe(false);
      expect(preservedSgroup.atoms).toEqual([0, 1]);
    });

    it('returns false and leaves the original struct untouched when atom counts differ', () => {
      const original = new Struct();
      original.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      original.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));

      const result = new Struct();
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(9, 9) }));

      const merged = mergeCoordinatesFromResult(original, result);

      expect(merged).toBe(false);
      const atoms = Array.from(original.atoms.values());
      expect(atoms[0].pp.x).toBeCloseTo(0);
      expect(atoms[1].pp.x).toBeCloseTo(1);
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
