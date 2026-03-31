import {
  adjustCalculatedMassForCharge,
  ELECTRON_MASS_AMU,
} from 'domain/services/struct/calculateMass';
import { CalculateData, CalculateResult } from 'domain/services/struct';

function createStructWithCharges(charges: number[]) {
  const atomIds = charges.map((_, index) => index);

  return {
    atomIds,
    struct: JSON.stringify({
      root: {
        nodes: [{ $ref: 'mol0' }],
      },
      mol0: {
        type: 'molecule',
        atoms: charges.map((charge, index) => ({
          label: 'C',
          charge,
          location: [index, 0, 0],
        })),
      },
    }),
  };
}

describe('adjustCalculatedMassForCharge', () => {
  it('subtracts electron mass from monoisotopic mass for positive charge', () => {
    const { struct } = createStructWithCharges([1]);
    const data: CalculateData = {
      struct,
      properties: ['monoisotopic-mass'],
    };
    const result = adjustCalculatedMassForCharge(data, {
      'monoisotopic-mass': 18.0343738,
    } as CalculateResult);

    expect(result['monoisotopic-mass']).toBeCloseTo(
      18.0343738 - ELECTRON_MASS_AMU,
      10,
    );
  });

  it('adds electron mass for negative charge', () => {
    const { struct } = createStructWithCharges([-1]);
    const data: CalculateData = {
      struct,
      properties: ['monoisotopic-mass'],
    };
    const result = adjustCalculatedMassForCharge(data, {
      'monoisotopic-mass': 35.9766777,
    } as CalculateResult);

    expect(result['monoisotopic-mass']).toBeCloseTo(
      35.9766777 + ELECTRON_MASS_AMU,
      10,
    );
  });

  it('uses selected atoms charge when a selection is provided', () => {
    const { atomIds, struct } = createStructWithCharges([1, -1]);
    const data: CalculateData = {
      struct,
      properties: ['monoisotopic-mass'],
      selected: [atomIds[0]],
    };
    const result = adjustCalculatedMassForCharge(data, {
      'monoisotopic-mass': 10,
    } as CalculateResult);

    expect(result['monoisotopic-mass']).toBeCloseTo(10 - ELECTRON_MASS_AMU, 10);
  });

  it('preserves string precision when adjusting mass returned as a string', () => {
    const { struct } = createStructWithCharges([1]);
    const data: CalculateData = {
      struct,
      properties: ['monoisotopic-mass'],
    };
    const result = adjustCalculatedMassForCharge(data, {
      'monoisotopic-mass': '18.0343738',
    } as CalculateResult);

    expect(result['monoisotopic-mass']).toBe('18.0338252');
  });
});
