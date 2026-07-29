import { MAX_CUSTOM_COLORS, presetColors } from './ColorPicker.constants';
import {
  addCustomColor,
  hexToHsl,
  hslToHex,
  isValidHex,
  normalizeHexColor,
  sanitizeCustomColors,
  sanitizeHexInput,
} from './ColorPicker.utils';

describe('isValidHex', () => {
  it('accepts a valid 6-character lowercase hex string', () => {
    expect(isValidHex('ff3232')).toBe(true);
  });

  it('accepts a valid 6-character uppercase hex string', () => {
    expect(isValidHex('FF3232')).toBe(true);
  });

  it('accepts mixed-case 6-character hex string', () => {
    expect(isValidHex('aAbBcC')).toBe(true);
  });

  it('rejects a string shorter than 6 characters', () => {
    expect(isValidHex('ff323')).toBe(false);
  });

  it('rejects a string longer than 6 characters', () => {
    expect(isValidHex('ff32321')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidHex('')).toBe(false);
  });

  it('rejects a string with a leading #', () => {
    expect(isValidHex('#ff3232')).toBe(false);
  });

  it('rejects a string with non-hex characters', () => {
    expect(isValidHex('gg3232')).toBe(false);
  });
});

describe('normalizeHexColor', () => {
  it('converts lowercase to uppercase', () => {
    expect(normalizeHexColor('#ff3232')).toBe('#FF3232');
  });

  it('keeps already-uppercase strings unchanged', () => {
    expect(normalizeHexColor('#FF3232')).toBe('#FF3232');
  });
});

describe('hexToHsl', () => {
  it('converts red correctly', () => {
    expect(hexToHsl('#FF0000')).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('converts green correctly', () => {
    expect(hexToHsl('#00FF00')).toEqual({ h: 120, s: 100, l: 50 });
  });

  it('converts blue correctly', () => {
    expect(hexToHsl('#0000FF')).toEqual({ h: 240, s: 100, l: 50 });
  });

  it('converts white correctly', () => {
    expect(hexToHsl('#FFFFFF')).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts black correctly', () => {
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('works without leading #', () => {
    expect(hexToHsl('FF0000')).toEqual({ h: 0, s: 100, l: 50 });
  });
});

describe('hslToHex', () => {
  it('converts red correctly', () => {
    expect(hslToHex(0, 100, 50)).toBe('#FF0000');
  });

  it('converts green correctly', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00FF00');
  });

  it('converts blue correctly', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000FF');
  });

  it('converts white correctly', () => {
    expect(hslToHex(0, 0, 100)).toBe('#FFFFFF');
  });

  it('converts black correctly', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });
});

describe('hexToHsl / hslToHex round-trip', () => {
  it.each(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'])(
    'round-trips %s without loss',
    (hex) => {
      const { h, s, l } = hexToHsl(hex);
      expect(hslToHex(h, s, l)).toBe(hex);
    },
  );
});

describe('sanitizeCustomColors', () => {
  it('returns empty array for empty input', () => {
    expect(sanitizeCustomColors([])).toEqual([]);
  });

  it('removes colors with invalid format', () => {
    expect(
      sanitizeCustomColors(['not-a-color', '#12345', '#1234567', '']),
    ).toEqual([]);
  });

  it('removes preset colors', () => {
    const preset = presetColors[0];
    expect(sanitizeCustomColors([preset])).toEqual([]);
  });

  it('removes duplicate colors (case-insensitive)', () => {
    expect(sanitizeCustomColors(['#aabbcc', '#AABBCC', '#AaBbCc'])).toEqual([
      '#AABBCC',
    ]);
  });

  it('normalizes colors to uppercase', () => {
    expect(sanitizeCustomColors(['#aabbcc'])).toEqual(['#AABBCC']);
  });

  it(`caps the list at MAX_CUSTOM_COLORS (${MAX_CUSTOM_COLORS})`, () => {
    const colors = Array.from(
      { length: MAX_CUSTOM_COLORS + 3 },
      (_, i) => `#${String(i + 1).padStart(6, '0')}`,
    );
    const result = sanitizeCustomColors(colors);
    expect(result).toHaveLength(MAX_CUSTOM_COLORS);
  });

  it('keeps valid non-preset colors', () => {
    expect(sanitizeCustomColors(['#123456', '#abcdef'])).toEqual([
      '#123456',
      '#ABCDEF',
    ]);
  });
});

describe('sanitizeHexInput', () => {
  it('strips non-hex characters', () => {
    expect(sanitizeHexInput('GG!!ZZ')).toBe('');
  });

  it('truncates input longer than 6 characters', () => {
    expect(sanitizeHexInput('AABBCCDD')).toBe('AABBCC');
  });

  it('converts to uppercase', () => {
    expect(sanitizeHexInput('aabbcc')).toBe('AABBCC');
  });

  it('keeps valid hex characters mixed with invalid ones', () => {
    expect(sanitizeHexInput('FF-00-4d')).toBe('FF004D');
  });
});

describe('addCustomColor', () => {
  it('prepends a new custom color to the list', () => {
    expect(addCustomColor(['#ABCDEF'], '#123456')).toEqual([
      '#123456',
      '#ABCDEF',
    ]);
  });

  it('does NOT add a preset color', () => {
    const preset = presetColors[0];
    const existing = ['#123456'];
    expect(addCustomColor(existing, preset)).toEqual(['#123456']);
  });

  it('deduplicates when the color already exists in the list', () => {
    const result = addCustomColor(['#123456', '#ABCDEF'], '#123456');
    expect(result).toEqual(['#123456', '#ABCDEF']);
  });

  it('normalizes the added color to uppercase', () => {
    expect(addCustomColor([], '#aabbcc')).toEqual(['#AABBCC']);
  });

  it(`drops oldest entry when list exceeds MAX_CUSTOM_COLORS (${MAX_CUSTOM_COLORS})`, () => {
    const colors = Array.from(
      { length: MAX_CUSTOM_COLORS },
      (_, i) => `#${String(i + 1).padStart(6, '0')}`,
    );
    const result = addCustomColor(colors, '#AABBCC');
    expect(result).toHaveLength(MAX_CUSTOM_COLORS);
    expect(result[0]).toBe('#AABBCC');
    expect(result).not.toContain(colors[colors.length - 1]);
  });
});
