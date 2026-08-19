import { getSuperatomLabel } from 'application/render/restruct/resgroup';
import { SGroup } from 'domain/entities/sgroup';

const createSuperatomSGroup = (
  name: SGroup['data']['name'],
  sgroupClass: SGroup['data']['class'],
): SGroup => {
  const sgroup = new SGroup(SGroup.TYPES.SUP);

  sgroup.data.name = name;
  sgroup.data.class = sgroupClass;

  return sgroup;
};

describe('getSuperatomLabel', () => {
  it('returns the trimmed name when present', () => {
    expect(getSuperatomLabel(createSuperatomSGroup('  Boc  ', undefined))).toBe(
      'Boc',
    );
  });

  it('resolves SUGAR/BASE/PHOSPHATE nucleotide component classes to their labels when name is empty', () => {
    // This is the exact shape produced after importing the KET fixture from
    // the bug report: SUP S-groups with class SUGAR/BASE/PHOSPHATE and an
    // empty name (`""`, not null/undefined).
    expect(getSuperatomLabel(createSuperatomSGroup('', 'SUGAR'))).toBe('Sugar');
    expect(getSuperatomLabel(createSuperatomSGroup('', 'BASE'))).toBe('Base');
    expect(getSuperatomLabel(createSuperatomSGroup('', 'PHOSPHATE'))).toBe(
      'Phosphate',
    );
  });

  it('resolves nucleotide component classes when name is whitespace-only', () => {
    expect(getSuperatomLabel(createSuperatomSGroup('   ', 'SUGAR'))).toBe(
      'Sugar',
    );
  });

  it('prefers an explicit non-empty name over the class label', () => {
    expect(
      getSuperatomLabel(createSuperatomSGroup('CustomSugar', 'SUGAR')),
    ).toBe('CustomSugar');
  });

  it('returns an empty string when there is neither a name nor a known class', () => {
    expect(getSuperatomLabel(createSuperatomSGroup('', undefined))).toBe('');
    expect(getSuperatomLabel(createSuperatomSGroup('', 'UNKNOWN_CLASS'))).toBe(
      '',
    );
  });
});
