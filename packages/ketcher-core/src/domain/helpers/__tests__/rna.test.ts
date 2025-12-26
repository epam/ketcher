import { getPeptideLibraryItem, getRnaPartLibraryItem } from '../rna';
import { CoreEditor } from 'application/editor/internal';
import { KetMonomerClass } from 'application/formatters';

describe('RNA/Peptide Helper Functions', () => {
  let mockEditor: CoreEditor;

  beforeEach(() => {
    // Create a mock editor with a monomer library
    mockEditor = {
      monomersLibrary: [
        // Regular peptide
        {
          props: {
            MonomerType: 'PEPTIDE',
            MonomerName: 'A',
            MonomerClass: 'AminoAcid',
          },
        },
        // Ambiguous peptide
        {
          isAmbiguous: true,
          label: 'B',
          monomers: [
            {
              props: { MonomerClass: 'AminoAcid' },
              monomerItem: { props: { MonomerClass: 'AminoAcid' } },
            },
            {
              props: { MonomerClass: 'AminoAcid' },
              monomerItem: { props: { MonomerClass: 'AminoAcid' } },
            },
          ],
          options: [],
        },
        // Another ambiguous peptide
        {
          isAmbiguous: true,
          label: 'X',
          monomers: [
            {
              props: { MonomerClass: 'AminoAcid' },
              monomerItem: { props: { MonomerClass: 'AminoAcid' } },
            },
          ],
          options: [],
        },
        // Ambiguous RNA base
        {
          isAmbiguous: true,
          label: 'N',
          monomers: [
            {
              props: { MonomerClass: 'Base' },
              monomerItem: { props: { MonomerClass: 'Base' } },
            },
            {
              props: { MonomerClass: 'Base' },
              monomerItem: { props: { MonomerClass: 'Base' } },
            },
          ],
          options: [{ templateId: 'Uracil' }, { templateId: 'Cytosine' }],
        },
      ],
    } as unknown as CoreEditor;
  });

  describe('getPeptideLibraryItem', () => {
    it('should find regular peptide by name', () => {
      const result = getPeptideLibraryItem(mockEditor, 'A');
      expect(result).toBeDefined();
      expect(result?.props?.MonomerName).toBe('A');
    });

    it('should find ambiguous peptide by label', () => {
      const result = getPeptideLibraryItem(mockEditor, 'B');
      expect(result).toBeDefined();
      expect(result?.isAmbiguous).toBe(true);
      expect(result?.label).toBe('B');
    });

    it('should find ambiguous peptide X', () => {
      const result = getPeptideLibraryItem(mockEditor, 'X');
      expect(result).toBeDefined();
      expect(result?.isAmbiguous).toBe(true);
      expect(result?.label).toBe('X');
    });

    it('should return undefined for non-existent peptide', () => {
      const result = getPeptideLibraryItem(mockEditor, 'NonExistent');
      expect(result).toBeUndefined();
    });

    it('should not return RNA base when searching for peptide', () => {
      const result = getPeptideLibraryItem(mockEditor, 'N');
      expect(result).toBeUndefined();
    });
  });

  describe('getRnaPartLibraryItem', () => {
    it('should find ambiguous RNA base by label', () => {
      const result = getRnaPartLibraryItem(
        mockEditor,
        'N',
        KetMonomerClass.Base,
        false,
      );
      expect(result).toBeDefined();
      expect(result?.isAmbiguous).toBe(true);
      expect(result?.label).toBe('N');
    });

    it('should not return peptide when searching for RNA base', () => {
      const result = getRnaPartLibraryItem(
        mockEditor,
        'B',
        KetMonomerClass.Base,
        false,
      );
      expect(result).toBeUndefined();
    });
  });
});
