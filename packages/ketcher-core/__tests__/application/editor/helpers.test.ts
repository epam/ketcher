import { validateMonomerGroupTemplatesInSdf } from 'application/editor/helpers';

const buildSdfRecord = (fields: Array<[string, string]>): string => {
  const header = [
    '',
    '  -INDIGO-10092514292D',
    '',
    '  0  0  0  0  0  0  0  0  0  0  0 V3000',
    'M  V30 BEGIN CTAB',
    'M  V30 END CTAB',
    'M  END',
  ].join('\n');

  const tags = fields
    .map(([name, value]) => `>  <${name}>\n${value}\n`)
    .join('\n');

  return `${header}\n${tags}\n$$$$\n`;
};

describe('validateMonomerGroupTemplatesInSdf', () => {
  it('does nothing when format is not SDF', () => {
    expect(() =>
      validateMonomerGroupTemplatesInSdf('{"root":{"templates":[]}}', {
        format: 'ket',
      }),
    ).not.toThrow();
  });

  it('passes when monomerGroupTemplate has a non-empty groupName', () => {
    const sdf = buildSdfRecord([
      ['type', 'monomerGroupTemplate'],
      ['groupName', 'MyPreset'],
      ['groupClass', 'RNA'],
    ]);

    expect(() =>
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' }),
    ).not.toThrow();
  });

  it('throws when monomerGroupTemplate has no groupName field', () => {
    const sdf = buildSdfRecord([
      ['type', 'monomerGroupTemplate'],
      ['groupClass', 'RNA'],
    ]);

    expect(() =>
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' }),
    ).toThrow(/"groupName" is mandatory/);
  });

  it('throws when groupName is an empty string', () => {
    const sdf = buildSdfRecord([
      ['type', 'monomerGroupTemplate'],
      ['groupName', ''],
      ['groupClass', 'RNA'],
    ]);

    expect(() =>
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' }),
    ).toThrow(/"groupName" is mandatory/);
  });

  it('throws when groupName contains only whitespace', () => {
    const sdf = buildSdfRecord([
      ['type', 'monomerGroupTemplate'],
      ['groupName', '   '],
      ['groupClass', 'RNA'],
    ]);

    expect(() =>
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' }),
    ).toThrow(/"groupName" is mandatory/);
  });

  it('ignores non-preset records (monomerTemplate without groupName is fine)', () => {
    const sdf = buildSdfRecord([['type', 'monomerTemplate']]);

    expect(() =>
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' }),
    ).not.toThrow();
  });

  it('aggregates errors across multiple invalid presets in a single SDF', () => {
    const sdf =
      buildSdfRecord([
        ['type', 'monomerGroupTemplate'],
        ['groupClass', 'RNA'],
      ]) +
      buildSdfRecord([
        ['type', 'monomerGroupTemplate'],
        ['groupName', ''],
        ['groupClass', 'DNA'],
      ]);

    let caught: Error | undefined;
    try {
      validateMonomerGroupTemplatesInSdf(sdf, { format: 'sdf' });
    } catch (error) {
      caught = error as Error;
    }

    expect(caught).toBeDefined();
    expect(caught?.message).toMatch(/Preset #1/);
    expect(caught?.message).toMatch(/Preset #2/);
  });

  it('autodetects sdfV3000 format when params.format is omitted', () => {
    const sdf = buildSdfRecord([
      ['type', 'monomerGroupTemplate'],
      ['groupClass', 'RNA'],
    ]);

    expect(() => validateMonomerGroupTemplatesInSdf(sdf)).toThrow(
      /"groupName" is mandatory/,
    );
  });
});
