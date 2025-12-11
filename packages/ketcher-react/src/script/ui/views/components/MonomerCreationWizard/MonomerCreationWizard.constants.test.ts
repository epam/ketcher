import { MonomerTypeSelectConfig } from './MonomerCreationWizard.constants';

jest.mock('ketcher-core', () => ({
  KetMonomerClass: {
    AminoAcid: 'AminoAcid',
    Sugar: 'Sugar',
    Base: 'Base',
    Phosphate: 'Phosphate',
    RNA: 'RNA',
    CHEM: 'CHEM',
  },
}));

describe('MonomerCreationWizard constants', () => {
  it('places Nucleotide (preset) after Nucleotide (monomer)', () => {
    const labels = MonomerTypeSelectConfig.map(({ label }) => label);
    const monomerIndex = labels.indexOf('Nucleotide (monomer)');
    const presetIndex = labels.indexOf('Nucleotide (preset)');
    const chemIndex = labels.indexOf('CHEM');

    expect(monomerIndex).toBeGreaterThan(-1);
    expect(presetIndex).toBeGreaterThan(monomerIndex);
    expect(chemIndex).toBeGreaterThan(presetIndex);
  });
});
