import {
  isDeoxyriboseSugarLabel,
  resolveMirroredBaseLabel,
} from 'domain/helpers/antisenseBaseSync';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('isDeoxyriboseSugarLabel', () => {
  it('recognizes the unmodified DNA sugar', () => {
    expect(isDeoxyriboseSugarLabel('dR')).toBe(true);
  });

  it('treats the RNA sugar as not deoxyribose', () => {
    expect(isDeoxyriboseSugarLabel('R')).toBe(false);
  });

  it('treats an absent label as not deoxyribose', () => {
    expect(isDeoxyriboseSugarLabel(undefined)).toBe(false);
  });
});

describe('resolveMirroredBaseLabel', () => {
  it('returns nothing when the natural analogue is unchanged', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'C',
        newNaturalAnalogue: 'C',
        oppositeSugarLabel: 'R',
      }),
    ).toBeUndefined();
  });

  it('maps adenine to uracil on a ribose partner', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'C',
        newNaturalAnalogue: 'A',
        oppositeSugarLabel: 'R',
      }),
    ).toBe('U');
  });

  it('maps adenine to thymine on a deoxyribose partner', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'C',
        newNaturalAnalogue: 'A',
        oppositeSugarLabel: 'dR',
      }),
    ).toBe('T');
  });

  it('maps cytosine to guanine regardless of the partner sugar', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'A',
        newNaturalAnalogue: 'C',
        oppositeSugarLabel: 'dR',
      }),
    ).toBe('G');
  });

  it('round-trips ambiguous IUPAC codes', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'A',
        newNaturalAnalogue: 'Y',
        oppositeSugarLabel: 'R',
      }),
    ).toBe('R');
  });

  it('returns nothing for an analogue with no entry in the table', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'A',
        newNaturalAnalogue: 'Zz',
        oppositeSugarLabel: 'R',
      }),
    ).toBeUndefined();
  });

  it('returns nothing when the new analogue is missing', () => {
    expect(
      resolveMirroredBaseLabel({
        previousNaturalAnalogue: 'A',
        newNaturalAnalogue: undefined,
        oppositeSugarLabel: 'R',
      }),
    ).toBeUndefined();
  });
});
