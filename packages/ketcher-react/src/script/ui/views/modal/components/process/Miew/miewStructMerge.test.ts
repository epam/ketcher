import {
  Atom,
  RxnArrow,
  RxnArrowMode,
  RxnPlus,
  SGroup,
  Struct,
  Text,
  Vec2,
  MonomerMicromolecule,
  Peptide,
} from 'ketcher-core';
import {
  alignToCentroid,
  collapseExpandedSuperatoms,
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

      const merged = mergeCoordinatesFromResult(result, original);

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

      const merged = mergeCoordinatesFromResult(result, original);

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

  describe('repeated Miew Apply operations', () => {
    it('preserves structure metadata across multiple Apply operations without throwing', () => {
      const struct = new Struct();

      const sugarAtoms = [
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) })),
        struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(0.5, 1) })),
      ];

      const baseAtoms = [
        struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(2, 0) })),
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(3, 0) })),
        struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(2.5, 1) })),
      ];

      const phosphateAtoms = [
        struct.atoms.add(new Atom({ label: 'P', pp: new Vec2(4, 0) })),
        struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(5, 0) })),
      ];

      const sugarGroup = new SGroup('SUP');
      sugarGroup.data.class = 'SUGAR';
      sugarGroup.data.name = 'Ribose';
      sugarGroup.data.expanded = false;
      sugarGroup.atoms = sugarAtoms;
      struct.sgroups.add(sugarGroup);

      const baseGroup = new SGroup('SUP');
      baseGroup.data.class = 'BASE';
      baseGroup.data.name = 'Adenine';
      baseGroup.data.expanded = false;
      baseGroup.atoms = baseAtoms;
      struct.sgroups.add(baseGroup);

      const phosphateGroup = new SGroup('SUP');
      phosphateGroup.data.class = 'PHOSPHATE';
      phosphateGroup.data.name = 'PO4';
      phosphateGroup.data.expanded = false;
      phosphateGroup.atoms = phosphateAtoms;
      struct.sgroups.add(phosphateGroup);

      const firstResult = new Struct();
      sugarAtoms.forEach((id) => {
        const origAtom = struct.atoms.get(id);
        if (!origAtom) return;
        firstResult.atoms.add(
          new Atom({
            label: origAtom.label,
            pp: new Vec2(
              origAtom.pp.x + 0.1,
              origAtom.pp.y + 0.1,
              origAtom.pp.z + 0.05,
            ),
          }),
        );
      });
      baseAtoms.forEach((id) => {
        const origAtom = struct.atoms.get(id);
        if (!origAtom) return;
        firstResult.atoms.add(
          new Atom({
            label: origAtom.label,
            pp: new Vec2(
              origAtom.pp.x + 0.1,
              origAtom.pp.y + 0.1,
              origAtom.pp.z + 0.05,
            ),
          }),
        );
      });
      phosphateAtoms.forEach((id) => {
        const origAtom = struct.atoms.get(id);
        if (!origAtom) return;
        firstResult.atoms.add(
          new Atom({
            label: origAtom.label,
            pp: new Vec2(
              origAtom.pp.x + 0.1,
              origAtom.pp.y + 0.1,
              origAtom.pp.z + 0.05,
            ),
          }),
        );
      });

      const firstPreserved = struct.clone();
      firstPreserved.enableInitiallySelected();
      const firstMerged = mergeCoordinatesFromResult(
        firstResult,
        firstPreserved,
      );
      expect(firstMerged).toBe(true);

      firstPreserved.disableInitiallySelected();

      expect(firstPreserved.atoms.size).toBe(8);
      expect(firstPreserved.sgroups.size).toBe(3);

      const firstSugar = Array.from(firstPreserved.sgroups.values())[0];
      expect(firstSugar.data.class).toBe('SUGAR');
      expect(firstSugar.data.name).toBe('Ribose');
      expect(firstSugar.atoms).toEqual(sugarAtoms);

      const firstBase = Array.from(firstPreserved.sgroups.values())[1];
      expect(firstBase.data.class).toBe('BASE');
      expect(firstBase.data.name).toBe('Adenine');

      const firstPhosphate = Array.from(firstPreserved.sgroups.values())[2];
      expect(firstPhosphate.data.class).toBe('PHOSPHATE');
      expect(firstPhosphate.data.name).toBe('PO4');

      const firstAtom = firstPreserved.atoms.get(sugarAtoms[0]);
      expect(firstAtom).toBeDefined();
      if (!firstAtom) return;
      expect(firstAtom.pp.x).toBeCloseTo(0.1);
      expect(firstAtom.pp.z).toBeCloseTo(0.05);

      const secondResult = new Struct();
      firstPreserved.atoms.forEach((atom) => {
        secondResult.atoms.add(
          new Atom({
            label: atom.label,
            pp: new Vec2(atom.pp.x + 0.05, atom.pp.y + 0.05, atom.pp.z + 0.02),
          }),
        );
      });

      const secondPreserved = firstPreserved.clone();

      secondPreserved.enableInitiallySelected();

      expect(() => {
        secondPreserved.atoms.forEach((atom) => {
          atom.getInitiallySelected();
        });
      }).not.toThrow();

      const secondMerged = mergeCoordinatesFromResult(
        secondResult,
        secondPreserved,
      );
      expect(secondMerged).toBe(true);

      expect(secondPreserved.atoms.size).toBe(8);
      expect(secondPreserved.sgroups.size).toBe(3);

      const secondSugar = Array.from(secondPreserved.sgroups.values())[0];
      expect(secondSugar.data.class).toBe('SUGAR');
      expect(secondSugar.data.name).toBe('Ribose');
      expect(secondSugar.atoms).toEqual(sugarAtoms);

      const secondBase = Array.from(secondPreserved.sgroups.values())[1];
      expect(secondBase.data.class).toBe('BASE');
      expect(secondBase.data.name).toBe('Adenine');

      const secondPhosphate = Array.from(secondPreserved.sgroups.values())[2];
      expect(secondPhosphate.data.class).toBe('PHOSPHATE');
      expect(secondPhosphate.data.name).toBe('PO4');

      const secondAtom = secondPreserved.atoms.get(sugarAtoms[0]);
      expect(secondAtom).toBeDefined();
      if (!secondAtom) return;
      expect(secondAtom.pp.x).toBeCloseTo(0.15);
      expect(secondAtom.pp.z).toBeCloseTo(0.07);
    });

    it('returns early without loading when coordinate mapping fails (atom count mismatch)', () => {
      const struct = new Struct();
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));

      const sgroup = new SGroup('SUP');
      sgroup.data.name = 'MyGroup';
      sgroup.atoms = [0, 1];
      struct.sgroups.add(sgroup);

      struct.disableInitiallySelected();

      const result = new Struct();
      result.atoms.add(new Atom({ label: 'C', pp: new Vec2(5, 5) }));

      const preserved = struct.clone();
      preserved.enableInitiallySelected();

      const merged = mergeCoordinatesFromResult(result, preserved);

      expect(merged).toBe(false);

      const origAtom = preserved.atoms.get(0);
      expect(origAtom).toBeDefined();
      if (!origAtom) return;
      expect(origAtom.pp.x).toBeCloseTo(0);
      expect(origAtom.pp.y).toBeCloseTo(0);

      expect(preserved.sgroups.size).toBe(1);
      const preservedGroup = Array.from(preserved.sgroups.values())[0];
      expect(preservedGroup.data.name).toBe('MyGroup');
    });
  });

  describe('collapseExpandedSuperatoms', () => {
    it('normalizes an initially expanded nucleotide SUP group to the contracted state produced by the old Miew/CML Apply flow, preserving metadata and atom membership', () => {
      // Start from the exact shape of the bug report: expanded SUP groups with
      // class SUGAR/BASE/PHOSPHATE and empty names.
      const struct = new Struct();

      const sugarAtoms = [
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) })),
        struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(0.5, 1) })),
      ];
      const baseAtoms = [
        struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(2, 0) })),
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(3, 0) })),
      ];
      const phosphateAtoms = [
        struct.atoms.add(new Atom({ label: 'P', pp: new Vec2(4, 0) })),
        struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(5, 0) })),
      ];

      const sugarGroup = new SGroup('SUP');
      sugarGroup.data.class = 'SUGAR';
      sugarGroup.data.name = '';
      sugarGroup.data.expanded = true;
      sugarGroup.atoms = sugarAtoms;
      struct.sgroups.add(sugarGroup);

      const baseGroup = new SGroup('SUP');
      baseGroup.data.class = 'BASE';
      baseGroup.data.name = '';
      baseGroup.data.expanded = true;
      baseGroup.atoms = baseAtoms;
      struct.sgroups.add(baseGroup);

      const phosphateGroup = new SGroup('SUP');
      phosphateGroup.data.class = 'PHOSPHATE';
      phosphateGroup.data.name = '';
      phosphateGroup.data.expanded = true;
      phosphateGroup.atoms = phosphateAtoms;
      struct.sgroups.add(phosphateGroup);

      const originalAtomCount = struct.atoms.size;
      const originalBondCount = struct.bonds.size;
      const preserved = struct.clone();
      preserved.enableInitiallySelected();

      const result = new Struct();
      preserved.atoms.forEach((atom) => {
        result.atoms.add(
          new Atom({
            label: atom.label,
            pp: new Vec2(atom.pp.x + 0.1, atom.pp.y + 0.1, atom.pp.z + 0.05),
          }),
        );
      });

      expect(mergeCoordinatesFromResult(result, preserved)).toBe(true);

      collapseExpandedSuperatoms(preserved);

      expect(preserved.atoms.size).toBe(originalAtomCount);
      expect(preserved.bonds.size).toBe(originalBondCount);

      const groups = Array.from(preserved.sgroups.values());
      expect(groups).toHaveLength(3);

      groups.forEach((group) => {
        expect(group.type).toBe(SGroup.TYPES.SUP);
        expect(group.data.expanded).toBe(false);
      });

      expect(groups[0].data.class).toBe('SUGAR');
      expect(groups[0].atoms).toEqual(sugarAtoms);
      expect(groups[1].data.class).toBe('BASE');
      expect(groups[1].atoms).toEqual(baseAtoms);
      expect(groups[2].data.class).toBe('PHOSPHATE');
      expect(groups[2].atoms).toEqual(phosphateAtoms);

      expect(groups[0].superatomLabel).toBe('Sugar');
      expect(groups[1].superatomLabel).toBe('Base');
      expect(groups[2].superatomLabel).toBe('Phosphate');
    });

    it('collapses a regular named SUP group too, matching the old unconditional CML import contraction', () => {
      const struct = new Struct();
      const atoms = [
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
        struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(1, 0) })),
      ];

      const group = new SGroup('SUP');
      group.data.name = 'Boc';
      group.data.expanded = true;
      group.atoms = atoms;
      struct.sgroups.add(group);

      const preserved = struct.clone();
      preserved.enableInitiallySelected();

      collapseExpandedSuperatoms(preserved);

      const collapsed = Array.from(preserved.sgroups.values())[0];
      expect(collapsed.type).toBe(SGroup.TYPES.SUP);
      expect(collapsed.data.expanded).toBe(false);
      expect(collapsed.data.name).toBe('Boc');
      expect(collapsed.atoms).toEqual(atoms);
    });

    it('leaves non-SUP S-groups untouched', () => {
      const struct = new Struct();
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));

      const dataGroup = new SGroup('DAT');
      dataGroup.data.expanded = true;
      dataGroup.atoms = [0];
      struct.sgroups.add(dataGroup);

      collapseExpandedSuperatoms(struct);

      const group = Array.from(struct.sgroups.values())[0];
      expect(group.type).toBe('DAT');
      expect(group.data.expanded).toBe(true);
    });

    it('collapses MonomerMicromolecule instances and updates both sgroup.data.expanded and monomer.monomerItem.expanded', () => {
      const struct = new Struct();
      const atoms = [
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
        struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(1, 0) })),
      ];

      const mockMonomerItem: any = {
        label: 'A',
        props: {
          MonomerName: 'Alanine',
          MonomerNaturalAnalogCode: 'A',
          MonomerType: 'PEPTIDE',
        },
        struct: new Struct(),
        expanded: true,
      };

      const monomer = new Peptide(mockMonomerItem);
      monomer.monomerItem.expanded = true;

      const monomerMicromolecule = new MonomerMicromolecule(
        SGroup.TYPES.SUP,
        monomer,
      );
      monomerMicromolecule.atoms = atoms;
      monomerMicromolecule.pp = new Vec2(0.5, 0);
      struct.sgroups.add(monomerMicromolecule);

      expect(monomerMicromolecule.data.expanded).toBe(true);
      expect(monomer.monomerItem.expanded).toBe(true);

      collapseExpandedSuperatoms(struct);

      const collapsedGroup = Array.from(
        struct.sgroups.values(),
      )[0] as MonomerMicromolecule;
      expect(collapsedGroup).toBeInstanceOf(MonomerMicromolecule);
      expect(collapsedGroup.data.expanded).toBe(false);
      expect(collapsedGroup.monomer?.monomerItem.expanded).toBe(false);
    });
  });
});
