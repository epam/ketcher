import type { TFunction } from 'i18next';
import { localizeOptions } from './localizeOptions';
import type { Option } from 'components/shared/dropDown/dropDown';

const translations: Record<string, string> = {
  'open.formats.sequence': 'Secuencia',
};

const t = ((key: string) => translations[key] ?? key) as unknown as TFunction;

describe('localizeOptions', () => {
  it('replaces the label with the translation when labelKey is present', () => {
    const options: Array<Option> = [
      { id: 'ket', label: 'Ket Format' },
      { id: 'seq', label: 'Sequence', labelKey: 'open.formats.sequence' },
    ];

    expect(localizeOptions(options, t)).toEqual([
      { id: 'ket', label: 'Ket Format' },
      { id: 'seq', label: 'Secuencia', labelKey: 'open.formats.sequence' },
    ]);
  });

  it('keeps options without labelKey unchanged', () => {
    const option: Option = { id: 'ket', label: 'Ket Format' };

    expect(localizeOptions([option], t)[0]).toBe(option);
  });

  it('does not mutate the input options', () => {
    const options: Array<Option> = [
      { id: 'seq', label: 'Sequence', labelKey: 'open.formats.sequence' },
    ];

    localizeOptions(options, t);

    expect(options[0].label).toBe('Sequence');
  });

  it('preserves extra fields from the original option type', () => {
    const options = [
      { id: 'ket' as const, label: 'Ket Format', extra: 'kept' },
    ];

    expect(localizeOptions(options, t)).toEqual([
      { id: 'ket', label: 'Ket Format', extra: 'kept' },
    ]);
  });
});
