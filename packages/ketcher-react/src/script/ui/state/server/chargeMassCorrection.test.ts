import { Atom, correctCalculatedExactMass, Struct } from 'ketcher-core';

describe('correctCalculatedExactMass', () => {
  it('should subtract electron mass for positively charged structures', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'N', charge: 1 }));
    const values = {
      'monoisotopic-mass': 18.0343738,
      gross: 'H4N',
    };

    expect(
      correctCalculatedExactMass(values, struct)['monoisotopic-mass'],
    ).toBeCloseTo(18.03382522009054, 12);
  });

  it('should add electron mass for negatively charged structures', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'O', charge: -1 }));
    const values = {
      'monoisotopic-mass': 17.0027396,
    };

    expect(
      correctCalculatedExactMass(values, struct)['monoisotopic-mass'],
    ).toBeCloseTo(17.00328817990946, 12);
  });

  it('should correct exact mass for selected atoms only', () => {
    const struct = new Struct();
    const chargedAtomId = struct.atoms.add(new Atom({ label: 'N', charge: 1 }));
    struct.atoms.add(new Atom({ label: 'Cl', charge: -1 }));
    const values = {
      'monoisotopic-mass': 18.0343738,
    };

    expect(
      correctCalculatedExactMass(values, struct, [chargedAtomId])[
        'monoisotopic-mass'
      ],
    ).toBeCloseTo(18.03382522009054, 12);
  });

  it('should leave non-numeric exact mass values unchanged', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'N', charge: 1 }));
    const values = {
      'monoisotopic-mass': '[18.034] > [17.026]',
    };

    expect(correctCalculatedExactMass(values, struct)).toEqual(values);
  });
});
