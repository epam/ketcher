import { getSuperatomLabel } from 'application/render/restruct/resgroup';

describe('getSuperatomLabel', () => {
  it('returns the trimmed name when present', () => {
    expect(
      getSuperatomLabel({ data: { name: '  Boc  ', class: undefined } }),
    ).toBe('Boc');
  });

  it('resolves SUGAR/BASE/PHOSPHATE nucleotide component classes to their labels when name is empty', () => {
    // This is the exact shape produced after importing the KET fixture from
    // the bug report: SUP S-groups with class SUGAR/BASE/PHOSPHATE and an
    // empty name (`""`, not null/undefined).
    expect(getSuperatomLabel({ data: { name: '', class: 'SUGAR' } })).toBe(
      'Sugar',
    );
    expect(getSuperatomLabel({ data: { name: '', class: 'BASE' } })).toBe(
      'Base',
    );
    expect(getSuperatomLabel({ data: { name: '', class: 'PHOSPHATE' } })).toBe(
      'Phosphate',
    );
  });

  it('resolves nucleotide component classes when name is whitespace-only', () => {
    expect(getSuperatomLabel({ data: { name: '   ', class: 'SUGAR' } })).toBe(
      'Sugar',
    );
  });

  it('prefers an explicit non-empty name over the class label', () => {
    expect(
      getSuperatomLabel({ data: { name: 'CustomSugar', class: 'SUGAR' } }),
    ).toBe('CustomSugar');
  });

  it('returns an empty string when there is neither a name nor a known class', () => {
    expect(getSuperatomLabel({ data: { name: '', class: undefined } })).toBe(
      '',
    );
    expect(
      getSuperatomLabel({ data: { name: '', class: 'UNKNOWN_CLASS' } }),
    ).toBe('');
  });
});
