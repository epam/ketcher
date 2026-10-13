import { KetSerializer } from '../ketSerializer';

describe('KetSerializer macromolecule template validation', () => {
  it('throws a descriptive error when a root template reference has no definition', () => {
    const templateRef = 'monomerTemplate-Test-6-P___Test-6-AP-Peptide';
    const ket = JSON.stringify({
      root: {
        nodes: [],
        connections: [],
        templates: [{ $ref: templateRef }],
      },
    });

    expect(() =>
      new KetSerializer().parseAndValidateMacromolecules(ket),
    ).toThrow(`File doesn't contain definition for "${templateRef}" template`);
  });

  it('accepts a root template reference with a definition', () => {
    const templateRef = 'monomerTemplate-defined';
    const ket = JSON.stringify({
      root: {
        nodes: [],
        connections: [],
        templates: [{ $ref: templateRef }],
      },
      [templateRef]: { type: 'monomerTemplate' },
    });

    expect(() =>
      new KetSerializer().parseAndValidateMacromolecules(ket),
    ).not.toThrow();
  });
});
