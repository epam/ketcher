import { identifyStructFormat } from 'application/formatters/identifyStructFormat';
import { SupportedFormat } from 'application/formatters/structFormatter.types';

describe('identifyStructFormat', () => {
  describe('RDF format detection', () => {
    it('recognizes RDF with a V2000 molfile', () => {
      const rdf = [
        '$RDFILE 1',
        '  Ketcher  8 82415122D 1   1.00000     0.00000     0',
        '',
        '  1  0  0  0  0  0            999 V2000',
        'M  END',
      ].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.rdf);
    });

    it('recognizes RDF with a V3000 molfile', () => {
      const rdf = [
        '$RDFILE 1',
        '  Ketcher  8 82415122D 1   1.00000     0.00000     0',
        '',
        '  0  0  0     0  0            999 V3000',
        'M  END',
      ].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.rdfV3000);
    });

    it('recognizes RDF with a V3000 reaction header', () => {
      expect(identifyStructFormat('$RDFILE 1\n$RXN V3000')).toBe(
        SupportedFormat.rdfV3000,
      );
    });

    it('prioritizes RDF over an embedded RXN marker', () => {
      expect(identifyStructFormat('$RDFILE 1\n$RXN\nV2000')).toBe(
        SupportedFormat.rdf,
      );
    });

    it('does not identify an embedded RDF marker as the file format', () => {
      expect(identifyStructFormat('Molecule name\n$RDFILE 1\nV2000')).toBe(
        SupportedFormat.mol,
      );
    });

    it('does not identify a V3000 mention outside the version marker', () => {
      const rdf = [
        '$RDFILE 1',
        'V3000 is mentioned in a comment',
        '  1  0  0  0  0  0            999 V2000',
      ].join('\n');

      expect(identifyStructFormat(rdf)).toBe(SupportedFormat.rdf);
    });
  });

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
