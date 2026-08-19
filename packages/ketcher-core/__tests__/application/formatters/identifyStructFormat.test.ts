import { identifyStructFormat } from 'application/formatters/identifyStructFormat';
import { SupportedFormat } from 'application/formatters/structFormatter.types';

describe('identifyStructFormat', () => {
  describe('IDT format detection', () => {
    it('recognizes phosphorothioate base sequence', () => {
      expect(
        identifyStructFormat('A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T'),
      ).toBe(SupportedFormat.idt);
    });

    it('recognizes IDT modification token', () => {
      expect(identifyStructFormat('/5FITC/AC')).toBe(SupportedFormat.idt);
      expect(identifyStructFormat('AC/3FAM/')).toBe(SupportedFormat.idt);
      expect(identifyStructFormat('A/iSp3/C')).toBe(SupportedFormat.idt);
    });

    it('does not misidentify plain SMILES as IDT', () => {
      expect(identifyStructFormat('CCO')).toBe(SupportedFormat.smiles);
      expect(identifyStructFormat('C1CCCCC1')).toBe(SupportedFormat.smiles);
    });

    it('does not misidentify single nucleotide as IDT (ambiguous)', () => {
      // Single letter — IDT base sequence requires at least two nucleotides with *
      expect(identifyStructFormat('A')).not.toBe(SupportedFormat.idt);
    });
  });
});
