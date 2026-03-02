import {
  getPhosphatePositionAvailability,
  getValidations,
} from './rnaValidations';

const sugarWithR1R2R3 = {
  props: {
    MonomerCaps: {
      R1: {},
      R2: {},
      R3: {},
    },
  },
};

const sugarWithR2Only = {
  props: {
    MonomerCaps: {
      R2: {},
      R3: {},
    },
  },
};

const phosphateWithR1R2 = {
  props: {
    MonomerCaps: {
      R1: {},
      R2: {},
    },
  },
};

const phosphateWithR1Only = {
  props: {
    MonomerCaps: {
      R1: {},
    },
  },
};

describe('rnaValidations', () => {
  it('returns both phosphate orientations as available when sugar and phosphate support both', () => {
    expect(
      getPhosphatePositionAvailability({
        sugar: sugarWithR1R2R3 as never,
        phosphate: phosphateWithR1R2 as never,
      }),
    ).toEqual({
      is3PrimeAvailable: true,
      is5PrimeAvailable: true,
    });
  });

  it('disables 5 prime orientation when sugar does not have R1', () => {
    expect(
      getPhosphatePositionAvailability({
        sugar: sugarWithR2Only as never,
        phosphate: phosphateWithR1R2 as never,
      }),
    ).toEqual({
      is3PrimeAvailable: true,
      is5PrimeAvailable: false,
    });
  });

  it('applies 5 prime validation to phosphates when 5 prime orientation is selected', () => {
    const { phosphateValidations } = getValidations(
      {
        sugar: sugarWithR1R2R3 as never,
        phosphatePosition: 'left',
      },
      true,
    );

    expect(phosphateValidations).toContain('R2');
    expect(phosphateValidations).not.toContain('R1');
  });

  it('applies inferred phosphate requirements when orientation is not selected', () => {
    const { phosphateValidations } = getValidations(
      {
        sugar: sugarWithR2Only as never,
        phosphate: phosphateWithR1Only as never,
      },
      true,
    );

    expect(phosphateValidations).toContain('R1');
    expect(phosphateValidations).not.toContain('R2');
  });
});
