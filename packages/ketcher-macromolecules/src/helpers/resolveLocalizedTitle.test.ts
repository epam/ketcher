import type { TFunction } from 'i18next';
import { resolveLocalizedTitle } from './resolveLocalizedTitle';

const translations: Record<string, string> = {
  'macromolecules:library.noNaturalAnalogue': 'No natural analogue',
};

const t = jest.fn(
  (key: string) => translations[key] ?? key,
) as unknown as TFunction;

describe('resolveLocalizedTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined for an undefined title', () => {
    expect(resolveLocalizedTitle(undefined, t)).toBeUndefined();
  });

  it('translates a namespace-qualified key', () => {
    expect(
      resolveLocalizedTitle('macromolecules:library.noNaturalAnalogue', t),
    ).toBe('No natural analogue');
  });

  it('returns a literal title unchanged without calling t', () => {
    expect(resolveLocalizedTitle('A', t)).toBe('A');
    expect(t).not.toHaveBeenCalled();
  });
});
