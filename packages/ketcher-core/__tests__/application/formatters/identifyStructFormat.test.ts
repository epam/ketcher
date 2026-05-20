import { identifyStructFormat, SupportedFormat } from 'application/formatters';

describe('identifyStructFormat', () => {
  it('should identify single-line IDT input before SMILES fallback', () => {
    expect(
      identifyStructFormat('A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T'),
    ).toBe(SupportedFormat.idt);
  });

  it('should keep ordinary single-line SMILES as SMILES', () => {
    expect(identifyStructFormat('CCO')).toBe(SupportedFormat.smiles);
  });

  it('should keep stereo SMILES with slash bonds as SMILES', () => {
    expect(identifyStructFormat('F/C=C/F')).toBe(SupportedFormat.smiles);
  });

  it('should keep wildcard SMILES as SMILES', () => {
    expect(identifyStructFormat('[*]CCO')).toBe(SupportedFormat.smiles);
  });

  it('should keep CDXML with closing tags as CDXML', () => {
    expect(identifyStructFormat('<?xml version="1.0"?><CDXML></CDXML>')).toBe(
      SupportedFormat.cdxml,
    );
  });
});
