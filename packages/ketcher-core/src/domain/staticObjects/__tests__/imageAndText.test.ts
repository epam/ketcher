import {
  imageHalfSizePx,
  validateImageDimensions,
  validateImageMimeType,
} from '../image';
import { resolveTextEdit } from '../text';

describe('validateImageMimeType', () => {
  it.each(['image/png', 'image/svg+xml'])('accepts %s', (mimeType) => {
    expect(validateImageMimeType(mimeType)).toBeNull();
  });

  it.each(['image/jpeg', 'image/svg', '', undefined])(
    'rejects %s',
    (mimeType) => {
      expect(validateImageMimeType(mimeType)).toBe('unsupportedType');
    },
  );
});

describe('validateImageDimensions', () => {
  it('accepts images of at least 16x16 pixels', () => {
    expect(
      validateImageDimensions({ widthPx: 16, heightPx: 16, dataUrlLength: 10 }),
    ).toBeNull();
  });

  it('rejects smaller images', () => {
    expect(
      validateImageDimensions({ widthPx: 15, heightPx: 40, dataUrlLength: 10 }),
    ).toBe('tooSmall');
  });

  it('accepts a sizeless image with enough data', () => {
    expect(
      validateImageDimensions({ widthPx: 0, heightPx: 0, dataUrlLength: 320 }),
    ).toBeNull();
  });

  it('rejects a sizeless image with too little data', () => {
    expect(
      validateImageDimensions({ widthPx: 0, heightPx: 0, dataUrlLength: 319 }),
    ).toBe('tooSmall');
  });
});

describe('imageHalfSizePx', () => {
  it('halves the pixel size', () => {
    const halfSize = imageHalfSizePx({
      widthPx: 40,
      heightPx: 20,
      dataUrlLength: 10,
    });

    expect([halfSize.x, halfSize.y]).toEqual([20, 10]);
  });

  it('uses the minimum dimension for a sizeless image', () => {
    const halfSize = imageHalfSizePx({
      widthPx: 0,
      heightPx: 0,
      dataUrlLength: 400,
    });

    expect([halfSize.x, halfSize.y]).toEqual([16, 16]);
  });
});

describe('resolveTextEdit', () => {
  it.each([
    [true, '', 'abc', 'create'],
    [true, '', '', 'noop'],
    [false, 'abc', '', 'delete'],
    [false, 'abc', 'abd', 'update'],
    [false, 'abc', 'abc', 'noop'],
  ] as const)(
    'isNew=%s, %j -> %j resolves to %s',
    (isNew, originalContent, nextContent, expected) => {
      expect(resolveTextEdit({ isNew, originalContent, nextContent })).toBe(
        expected,
      );
    },
  );
});
