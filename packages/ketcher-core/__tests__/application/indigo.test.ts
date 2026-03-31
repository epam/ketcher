import { Atom, Struct } from 'domain/entities';
import { Indigo } from 'application/indigo';

describe('Indigo calculate', () => {
  it('should subtract electron mass from exact mass for positively charged structures', async () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'N', charge: 1 }));
    const structService = {
      calculate: jest.fn().mockResolvedValue({
        'monoisotopic-mass': '18.0343738',
        'molecular-weight': '18.0390000',
        'most-abundant-mass': '18.0343738',
        gross: 'H4 N',
        'mass-composition': 'H 22.35 N 77.65',
      }),
    };

    const indigo = new Indigo(structService);
    const values = await indigo.calculate(struct);

    expect(values['monoisotopic-mass']).toBe('18.03382522009054');
    expect(structService.calculate).toHaveBeenCalledTimes(1);
  });
});
