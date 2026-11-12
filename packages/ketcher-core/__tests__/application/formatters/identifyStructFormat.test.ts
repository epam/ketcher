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

  describe('RDF detection (#5273)', () => {
    const molfileV2000 = [
      '  Ketcher  8 82415122D 1   1.00000     0.00000     0',
      '',
      '  1  0  0  0  0  0  0  0  0  0999 V2000',
      '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
      'M  END',
    ];

    it('leaves an RDF file with a molecule in place of the molfile name to Indigo', () => {
      const rdf = ['$RDFILE 1', ...molfileV2000].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.unknown);
    });

    it('leaves an RDF file with molecule records to Indigo', () => {
      const rdf = [
        '$RDFILE 1',
        '$DATM    08/08/24 14:15',
        '$MFMT',
        '',
        ...molfileV2000,
      ].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.unknown);
    });

    it('keeps reading an RDF file with reactions as RXN', () => {
      const rdf = [
        '$RDFILE 1',
        '$DATM    08/08/24 14:15',
        '$RFMT',
        '$RXN',
        '',
        '',
        '',
        '  1  0',
      ].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.rxn);
    });

    it('keeps reading a plain V2000 molfile as MOL', () => {
      expect(identifyStructFormat(['', ...molfileV2000].join('\n'))).toBe(
        SupportedFormat.mol,
      );
    });
  });
});
