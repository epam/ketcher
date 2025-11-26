import { AmbiguousMonomer, BaseMonomer, KetMonomerClass } from 'ketcher-core';
import getMonomerName from './getMonomerName';

// Mock the AmbiguousMonomer class
jest.mock('ketcher-core', () => {
  const actualKetcherCore = jest.requireActual('ketcher-core');
  return {
    ...actualKetcherCore,
    AmbiguousMonomer: class MockAmbiguousMonomer {
      constructor(
        public variantMonomerItem: {
          label: string;
          options: Array<{ templateId: string }>;
        },
      ) {}
      monomerClass: string = '';
    },
    BaseMonomer: class MockBaseMonomer {
      constructor(public monomerItem: { props: { Name: string } }) {}
    },
  };
});

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
      const mockMonomer = new AmbiguousMonomer({
        label: 'N',
        options: [{ templateId: 'thymine_base' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.Base;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Any DNA base');
    });

    it('should return "Ambiguous DNA Base" for B label', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'B',
        options: [{ templateId: 'thymine_base' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.Base;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Ambiguous DNA Base');
    });

    it('should return "Ambiguous DNA Base" for D, H, K, W, Y labels', () => {
      const labels = ['D', 'H', 'K', 'W', 'Y'];
      labels.forEach((label) => {
        const mockMonomer = new AmbiguousMonomer({
          label,
          options: [{ templateId: 'thymine_component' }],
        } as any);
        mockMonomer.monomerClass = KetMonomerClass.Base;

        const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

        expect(result).toBe('Ambiguous DNA Base');
      });
    });
  });

  describe('for Ambiguous RNA Bases', () => {
    it('should return "Any RNA Base" for N label', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'N',
        options: [{ templateId: 'uracil_base' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.Base;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Any RNA Base');
    });

    it('should return "Ambiguous RNA Base" for B label', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'B',
        options: [{ templateId: 'uracil_base' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.Base;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Ambiguous RNA Base');
    });

    it('should return "Ambiguous RNA Base" for D, H, K, W, Y labels', () => {
      const labels = ['D', 'H', 'K', 'W', 'Y'];
      labels.forEach((label) => {
        const mockMonomer = new AmbiguousMonomer({
          label,
          options: [{ templateId: 'uracil_component' }],
        } as any);
        mockMonomer.monomerClass = KetMonomerClass.Base;

        const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

        expect(result).toBe('Ambiguous RNA Base');
      });
    });
  });

  describe('for Ambiguous Bases (generic)', () => {
    it('should return "Ambiguous Base" for M, R, S, V labels', () => {
      const labels = ['M', 'R', 'S', 'V'];
      labels.forEach((label) => {
        const mockMonomer = new AmbiguousMonomer({
          label,
          options: [{ templateId: 'adenine_base' }], // No thymine or uracil
        } as any);
        mockMonomer.monomerClass = KetMonomerClass.Base;

        const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

        expect(result).toBe('Ambiguous Base');
      });
    });
  });

  describe('for Ambiguous Amino acids', () => {
    it('should return "Any Amino acid" for X label', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'X',
        options: [{ templateId: 'some_amino_acid' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.AminoAcid;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Any Amino acid');
    });

    it('should return "Ambiguous Amino acid" for B label', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'B',
        options: [{ templateId: 'some_amino_acid' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.AminoAcid;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Ambiguous Amino acid');
    });

    it('should return "Ambiguous Amino acid" for J, Z labels', () => {
      const labels = ['J', 'Z'];
      labels.forEach((label) => {
        const mockMonomer = new AmbiguousMonomer({
          label,
          options: [{ templateId: 'some_amino_acid' }],
        } as any);
        mockMonomer.monomerClass = KetMonomerClass.AminoAcid;

        const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

        expect(result).toBe('Ambiguous Amino acid');
      });
    });
  });

  describe('for other Ambiguous monomers', () => {
    it('should return generic "Ambiguous" label for other classes', () => {
      const mockMonomer = new AmbiguousMonomer({
        label: 'X',
        options: [{ templateId: 'some_chem' }],
      } as any);
      mockMonomer.monomerClass = KetMonomerClass.CHEM;

      const result = getMonomerName(mockMonomer as unknown as BaseMonomer);

      expect(result).toBe('Ambiguous CHEM');
    });
  });
});
