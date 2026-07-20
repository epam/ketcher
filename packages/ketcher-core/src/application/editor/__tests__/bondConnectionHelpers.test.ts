/**
 * Unit tests for shouldInvokeConnectionModal and findPresetMonomerForBonding.
 *
 * We stub only the BaseMonomer properties actually checked by the functions,
 * keeping tests focused and avoiding the need to construct full domain objects.
 */
import {
  shouldInvokeConnectionModal,
  findPresetMonomerForBonding,
} from 'application/editor/tools/bondConnectionHelpers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AmbiguousMonomer } from 'domain/entities';
import { UnresolvedMonomer } from 'domain/entities';
import { UnsplitNucleotide } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'application/formatters';

/** Create a minimal stub satisfying the BaseMonomer interface */
function makeMonomer(overrides: Partial<BaseMonomer> = {}): BaseMonomer {
  return {
    hasFreeAttachmentPoint: true,
    chosenFirstAttachmentPointForBond: null,
    chosenSecondAttachmentPointForBond: null,
    hasPotentialBonds: () => true,
    unUsedAttachmentPointsNamesList: [
      AttachmentPointName.R1,
      AttachmentPointName.R2,
    ],
    listOfAttachmentPoints: [AttachmentPointName.R1, AttachmentPointName.R2],
    isAttachmentPointUsed: (_ap: AttachmentPointName) => false,
    ...overrides,
  } as unknown as BaseMonomer;
}

/** Produce an instance that looks like a Peptide to instanceof checks */
function makePeptide(overrides: Partial<BaseMonomer> = {}): Peptide {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, Peptide.prototype);
  return stub as Peptide;
}

function makeChem(overrides: Partial<BaseMonomer> = {}): Chem {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, Chem.prototype);
  return stub as Chem;
}

function makeSugar(overrides: Partial<BaseMonomer> = {}): Sugar {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, Sugar.prototype);
  return stub as Sugar;
}

function makeRNABase(overrides: Partial<BaseMonomer> = {}): RNABase {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, RNABase.prototype);
  return stub as RNABase;
}

function makePhosphate(overrides: Partial<BaseMonomer> = {}): Phosphate {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, Phosphate.prototype);
  return stub as Phosphate;
}

function makeUnresolved(
  overrides: Partial<BaseMonomer> = {},
): UnresolvedMonomer {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, UnresolvedMonomer.prototype);
  return stub as UnresolvedMonomer;
}

function makeUnsplitNucleotide(
  overrides: Partial<BaseMonomer> = {},
): UnsplitNucleotide {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, UnsplitNucleotide.prototype);
  return stub as UnsplitNucleotide;
}

function makeAmbiguousMonomer(
  monomerClass: KetMonomerClass,
  overrides: Partial<BaseMonomer> = {},
): AmbiguousMonomer {
  const stub = makeMonomer(overrides);
  Object.setPrototypeOf(stub, AmbiguousMonomer.prototype);
  (
    stub as unknown as AmbiguousMonomer & { monomerClass: KetMonomerClass }
  ).monomerClass = monomerClass;
  return stub as AmbiguousMonomer;
}

describe('shouldInvokeConnectionModal', () => {
  describe('hydrogen bond — returns undefined', () => {
    it('returns undefined when isHydrogenBond is true', () => {
      const a = makePeptide();
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b, true, true)).toBeUndefined();
    });
  });

  describe('No modal cases', () => {
    it('returns false when second monomer has no free AP', () => {
      const a = makePeptide();
      const b = makePeptide({ hasFreeAttachmentPoint: false });
      expect(shouldInvokeConnectionModal(a, b)).toBe(false);
    });

    it('returns false when both monomers have APs already chosen', () => {
      const a = makePeptide({
        chosenFirstAttachmentPointForBond: AttachmentPointName.R1,
      });
      const b = makePeptide({
        chosenSecondAttachmentPointForBond: AttachmentPointName.R2,
      });
      expect(shouldInvokeConnectionModal(a, b)).toBe(false);
    });

    it('returns false when both monomers have only 1 unused AP', () => {
      const a = makePeptide({
        unUsedAttachmentPointsNamesList: [AttachmentPointName.R1],
      });
      const b = makePeptide({
        unUsedAttachmentPointsNamesList: [AttachmentPointName.R2],
      });
      expect(shouldInvokeConnectionModal(a, b)).toBe(false);
    });
  });

  describe('Modal: Chem monomers', () => {
    it('returns true when first monomer is Chem', () => {
      const a = makeChem();
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when second monomer is Chem', () => {
      const a = makePeptide();
      const b = makeChem();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when first is AmbiguousMonomer of class CHEM', () => {
      const a = makeAmbiguousMonomer(KetMonomerClass.CHEM);
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when second is AmbiguousMonomer of class CHEM', () => {
      const a = makePeptide();
      const b = makeAmbiguousMonomer(KetMonomerClass.CHEM);
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });
  });

  describe('Modal: UnresolvedMonomer', () => {
    it('returns true when first monomer is unresolved', () => {
      const a = makeUnresolved();
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when second monomer is unresolved', () => {
      const a = makePeptide();
      const b = makeUnresolved();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });
  });

  describe('Modal: RNA + Peptide / UnsplitNucleotide cross-class', () => {
    it('returns true when first is Sugar and second is Peptide', () => {
      const a = makeSugar();
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when first is Phosphate and second is Peptide', () => {
      const a = makePhosphate();
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when first is RNABase and second is UnsplitNucleotide', () => {
      const a = makeRNABase();
      const b = makeUnsplitNucleotide();
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns true when first is Sugar and second is AmbiguousMonomer(AminoAcid)', () => {
      const a = makeSugar();
      const b = makeAmbiguousMonomer(KetMonomerClass.AminoAcid);
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });
  });

  describe('Modal: Peptide-Peptide with blocked R1-R2 and multiple APs', () => {
    it('returns true when both have >2 APs, both R1 used, more than 1 free AP each', () => {
      const a = makePeptide({
        listOfAttachmentPoints: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
          AttachmentPointName.R3,
        ],
        unUsedAttachmentPointsNamesList: [
          AttachmentPointName.R2,
          AttachmentPointName.R3,
        ],
        isAttachmentPointUsed: (ap) => ap === AttachmentPointName.R1,
      });
      const b = makePeptide({
        listOfAttachmentPoints: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
          AttachmentPointName.R3,
        ],
        unUsedAttachmentPointsNamesList: [
          AttachmentPointName.R2,
          AttachmentPointName.R3,
        ],
        isAttachmentPointUsed: (ap) => ap === AttachmentPointName.R1,
      });
      expect(shouldInvokeConnectionModal(a, b)).toBe(true);
    });

    it('returns false when both Peptides have only 2 APs and R1-R2 are free', () => {
      const a = makePeptide({
        listOfAttachmentPoints: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
        ],
        unUsedAttachmentPointsNamesList: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
        ],
        isAttachmentPointUsed: (_ap) => false,
      });
      const b = makePeptide({
        listOfAttachmentPoints: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
        ],
        unUsedAttachmentPointsNamesList: [
          AttachmentPointName.R1,
          AttachmentPointName.R2,
        ],
        isAttachmentPointUsed: (_ap) => false,
      });
      expect(shouldInvokeConnectionModal(a, b)).toBe(false);
    });
  });

  describe('checkForPotentialBonds flag', () => {
    it('returns true when checkForPotentialBonds=true and first monomer has no potential bonds', () => {
      const a = makePeptide({ hasPotentialBonds: () => false });
      const b = makePeptide();
      expect(shouldInvokeConnectionModal(a, b, true)).toBe(true);
    });

    it('does NOT return true for missing potential bonds when checkForPotentialBonds=false', () => {
      const b = makePeptide({
        unUsedAttachmentPointsNamesList: [AttachmentPointName.R1],
      });
      // With checkForPotentialBonds=false and only 1 free AP on both, no-modal path wins
      const aWith1Free = makePeptide({
        hasPotentialBonds: () => false,
        unUsedAttachmentPointsNamesList: [AttachmentPointName.R2],
      });
      expect(shouldInvokeConnectionModal(aWith1Free, b, false)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Tests for findPresetMonomerForBonding
// ---------------------------------------------------------------------------

describe('findPresetMonomerForBonding', () => {
  /**
   * Build a stub monomer that optionally passes instanceof checks for
   * Sugar, Phosphate, or RNABase, and has a configurable free AP list.
   */
  function makeStub(
    type: 'Sugar' | 'Phosphate' | 'RNABase' | 'Peptide',
    freeAPs: AttachmentPointName[] = [
      AttachmentPointName.R1,
      AttachmentPointName.R2,
    ],
  ): BaseMonomer {
    const stub = {
      hasFreeAttachmentPoint: freeAPs.length > 0,
      isAttachmentPointExistAndFree: (ap: AttachmentPointName) =>
        freeAPs.includes(ap),
      unUsedAttachmentPointsNamesList: freeAPs,
    } as unknown as BaseMonomer;

    if (type === 'Sugar') Object.setPrototypeOf(stub, Sugar.prototype);
    else if (type === 'Phosphate')
      Object.setPrototypeOf(stub, Phosphate.prototype);
    else if (type === 'RNABase') Object.setPrototypeOf(stub, RNABase.prototype);
    else Object.setPrototypeOf(stub, makePeptide().constructor.prototype);

    return stub;
  }

  describe('R1 target → component with free R2', () => {
    it('returns the monomer that has a free R2 when target is R1', () => {
      const sugar = makeStub('Sugar', [AttachmentPointName.R2]);
      const phosphate = makeStub('Phosphate', [AttachmentPointName.R1]);
      const result = findPresetMonomerForBonding(
        [phosphate, sugar],
        AttachmentPointName.R1,
      );
      expect(result).toBe(sugar);
    });
  });

  describe('R2 target → component with free R1', () => {
    it('returns the monomer that has a free R1 when target is R2', () => {
      const sugar = makeStub('Sugar', [AttachmentPointName.R2]);
      const phosphate = makeStub('Phosphate', [AttachmentPointName.R1]);
      const result = findPresetMonomerForBonding(
        [sugar, phosphate],
        AttachmentPointName.R2,
      );
      expect(result).toBe(phosphate);
    });
  });

  describe('Rn target (n>2) → sugar fallback, then phosphate, then base', () => {
    it('returns sugar when target is R3 and sugar has free APs', () => {
      const sugar = makeStub('Sugar', [AttachmentPointName.R1]);
      const phosphate = makeStub('Phosphate', [AttachmentPointName.R1]);
      const base = makeStub('RNABase', [AttachmentPointName.R1]);
      const result = findPresetMonomerForBonding(
        [phosphate, sugar, base],
        AttachmentPointName.R3,
      );
      expect(result).toBe(sugar);
    });

    it('returns phosphate when sugar has no free APs', () => {
      const sugar = makeStub('Sugar', []); // no free APs
      const phosphate = makeStub('Phosphate', [AttachmentPointName.R1]);
      const base = makeStub('RNABase', [AttachmentPointName.R1]);
      const result = findPresetMonomerForBonding(
        [sugar, phosphate, base],
        AttachmentPointName.R3,
      );
      expect(result).toBe(phosphate);
    });

    it('returns base when sugar and phosphate have no free APs', () => {
      const sugar = makeStub('Sugar', []);
      const phosphate = makeStub('Phosphate', []);
      const base = makeStub('RNABase', [AttachmentPointName.R1]);
      const result = findPresetMonomerForBonding(
        [sugar, phosphate, base],
        AttachmentPointName.R3,
      );
      expect(result).toBe(base);
    });
  });

  describe('All exhausted → undefined (place without bonding)', () => {
    it('returns undefined when no monomer in the preset has any free AP', () => {
      const sugar = makeStub('Sugar', []);
      const phosphate = makeStub('Phosphate', []);
      const base = makeStub('RNABase', []);
      const result = findPresetMonomerForBonding(
        [sugar, phosphate, base],
        AttachmentPointName.R1,
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined for an empty preset (no monomers)', () => {
      const result = findPresetMonomerForBonding([], AttachmentPointName.R1);
      expect(result).toBeUndefined();
    });
  });
});
