import { BaseMonomer, KetMonomerClass } from 'ketcher-core';
import getMonomerName from './getMonomerName';

interface MockVariantMonomerItem {
  label: string;
  options: Array<{ templateId: string }>;
}

// Mock the AmbiguousMonomer class
jest.mock('ketcher-core', () => {
  const actualKetcherCore = jest.requireActual('ketcher-core');

  // Create a mock class that will be recognized by instanceof check
  class MockAmbiguousMonomer {
    variantMonomerItem: {
      label: string;
      options: Array<{ templateId: string }>;
    };

    monomerClass = '';

    constructor(variantMonomerItem: {
      label: string;
      options: Array<{ templateId: string }>;
    }) {
      this.variantMonomerItem = variantMonomerItem;
    }
  }

  return {
    ...actualKetcherCore,
    AmbiguousMonomer: MockAmbiguousMonomer,
  };
});

// Import after mocking to get the mocked version
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AmbiguousMonomer } = require('ketcher-core');

const createMockAmbiguousMonomer = (
  variantMonomerItem: MockVariantMonomerItem,
  monomerClass: string,
) => {
  const monomer = new AmbiguousMonomer(variantMonomerItem);
  monomer.monomerClass = monomerClass;
  return monomer as unknown as BaseMonomer;
};

describe('getMonomerName', () => {
  describe('for regular monomers', () => {
    it('should return the monomer name from props', () => {
      const mockMonomer = {
        monomerItem: { props: { Name: 'Adenine' } },
      } as unknown as BaseMonomer;

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Adenine');
    });
  });

  describe('for Ambiguous DNA Bases', () => {
    it('should return "Any DNA base" for N label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'N', options: [{ templateId: 'thymine_base' }] },
        KetMonomerClass.Base,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Any DNA base');
    });

    it('should return "Ambiguous DNA Base" for B label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'B', options: [{ templateId: 'thymine_base' }] },
        KetMonomerClass.Base,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Ambiguous DNA Base');
    });

    it('should return "Ambiguous DNA Base" for D, H, K, W, Y labels', () => {
      const labels = ['D', 'H', 'K', 'W', 'Y'];
      labels.forEach((label) => {
        const mockMonomer = createMockAmbiguousMonomer(
          { label, options: [{ templateId: 'thymine_component' }] },
          KetMonomerClass.Base,
        );

        const result = getMonomerName(mockMonomer);

        expect(result).toBe('Ambiguous DNA Base');
      });
    });
  });

  describe('for Ambiguous RNA Bases', () => {
    it('should return "Any RNA Base" for N label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'N', options: [{ templateId: 'uracil_base' }] },
        KetMonomerClass.Base,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Any RNA Base');
    });

    it('should return "Ambiguous RNA Base" for B label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'B', options: [{ templateId: 'uracil_base' }] },
        KetMonomerClass.Base,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Ambiguous RNA Base');
    });

    it('should return "Ambiguous RNA Base" for D, H, K, W, Y labels', () => {
      const labels = ['D', 'H', 'K', 'W', 'Y'];
      labels.forEach((label) => {
        const mockMonomer = createMockAmbiguousMonomer(
          { label, options: [{ templateId: 'uracil_component' }] },
          KetMonomerClass.Base,
        );

        const result = getMonomerName(mockMonomer);

        expect(result).toBe('Ambiguous RNA Base');
      });
    });
  });

  describe('for Ambiguous Bases (generic)', () => {
    it('should return "Ambiguous Base" for M, R, S, V labels', () => {
      const labels = ['M', 'R', 'S', 'V'];
      labels.forEach((label) => {
        // No thymine or uracil in options
        const mockMonomer = createMockAmbiguousMonomer(
          { label, options: [{ templateId: 'adenine_base' }] },
          KetMonomerClass.Base,
        );

        const result = getMonomerName(mockMonomer);

        expect(result).toBe('Ambiguous Base');
      });
    });
  });

  describe('for Ambiguous Amino acids', () => {
    it('should return "Any Amino acid" for X label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'X', options: [{ templateId: 'some_amino_acid' }] },
        KetMonomerClass.AminoAcid,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Any Amino acid');
    });

    it('should return "Ambiguous Amino acid" for B label', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'B', options: [{ templateId: 'some_amino_acid' }] },
        KetMonomerClass.AminoAcid,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Ambiguous Amino acid');
    });

    it('should return "Ambiguous Amino acid" for J, Z labels', () => {
      const labels = ['J', 'Z'];
      labels.forEach((label) => {
        const mockMonomer = createMockAmbiguousMonomer(
          { label, options: [{ templateId: 'some_amino_acid' }] },
          KetMonomerClass.AminoAcid,
        );

        const result = getMonomerName(mockMonomer);

        expect(result).toBe('Ambiguous Amino acid');
      });
    });
  });

  describe('for other Ambiguous monomers', () => {
    it('should return generic "Ambiguous" label for other classes', () => {
      const mockMonomer = createMockAmbiguousMonomer(
        { label: 'X', options: [{ templateId: 'some_chem' }] },
        KetMonomerClass.CHEM,
      );

      const result = getMonomerName(mockMonomer);

      expect(result).toBe('Ambiguous CHEM');
    });
  });
});
