import { Atom, Bond, Struct } from 'ketcher-core';
import {
  isAtomSelectionContinuous,
  isStructureContinuous,
} from './structureContinuity';

// Builds a structure: 0—1—2 (a connected chain) plus an isolated atom 3.
function buildStruct() {
  const struct = new Struct();
  const a0 = struct.atoms.add(new Atom({ label: 'C' }));
  const a1 = struct.atoms.add(new Atom({ label: 'C' }));
  const a2 = struct.atoms.add(new Atom({ label: 'C' }));
  const a3 = struct.atoms.add(new Atom({ label: 'C' }));
  const b0 = struct.bonds.add(new Bond({ begin: a0, end: a1, type: 1 }));
  const b1 = struct.bonds.add(new Bond({ begin: a1, end: a2, type: 1 }));
  return { struct, a0, a1, a2, a3, b0, b1 };
}

describe('structureContinuity', () => {
  describe('isAtomSelectionContinuous', () => {
    it('returns true for a connected set of atoms', () => {
      const { struct, a0, a1, a2 } = buildStruct();
      expect(isAtomSelectionContinuous(struct, [a0, a1, a2])).toBe(true);
    });

    it('returns false when the selected atoms are only connected through an unselected atom', () => {
      const { struct, a0, a2 } = buildStruct();
      expect(isAtomSelectionContinuous(struct, [a0, a2])).toBe(false);
    });

    it('returns false when an isolated atom is included', () => {
      const { struct, a0, a1, a2, a3 } = buildStruct();
      expect(isAtomSelectionContinuous(struct, [a0, a1, a2, a3])).toBe(false);
    });

    it('treats a single atom as continuous', () => {
      const { struct, a0 } = buildStruct();
      expect(isAtomSelectionContinuous(struct, [a0])).toBe(true);
    });

    it('treats an empty selection as continuous', () => {
      const { struct } = buildStruct();
      expect(isAtomSelectionContinuous(struct, [])).toBe(true);
    });
  });

  describe('isStructureContinuous', () => {
    it('uses the bonds provided in the selection', () => {
      const { struct, a0, a1, a2, b0, b1 } = buildStruct();
      expect(
        isStructureContinuous(struct, { atoms: [a0, a1, a2], bonds: [b0, b1] }),
      ).toBe(true);
      expect(
        isStructureContinuous(struct, { atoms: [a0, a2], bonds: [] }),
      ).toBe(false);
    });

    it('returns false for an empty atom set', () => {
      const { struct } = buildStruct();
      expect(isStructureContinuous(struct, { atoms: [], bonds: [] })).toBe(
        false,
      );
    });
  });
});
