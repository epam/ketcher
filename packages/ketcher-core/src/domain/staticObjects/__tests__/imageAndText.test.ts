import {
  imageHalfSizePx,
  validateImageDimensions,
  validateImageMimeType,
} from '../image';
import { parseTextContent, resolveTextEdit } from '../text';

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

describe('parseTextContent', () => {
  const lexical = (children: unknown[]) =>
    JSON.stringify({ root: { type: 'root', children } });

  it('returns null for content that is not Lexical JSON', () => {
    expect(parseTextContent('not json')).toBeNull();
    expect(parseTextContent(JSON.stringify({ blocks: [] }))).toBeNull();
  });

  it('maps paragraphs and formatted runs', () => {
    const paragraphs = parseTextContent(
      lexical([
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'H', format: 1, style: '' },
            { type: 'text', text: '2', format: 32, style: 'font-size: 20px' },
            { type: 'linebreak' },
          ],
        },
        { type: 'paragraph', children: [] },
      ]),
    );

    expect(paragraphs).toEqual([
      [
        {
          text: 'H',
          bold: true,
          italic: false,
          script: 'normal',
          fontSizePx: undefined,
        },
        {
          text: '2',
          bold: false,
          italic: false,
          script: 'subscript',
          fontSizePx: 20,
        },
      ],
      [],
    ]);
  });

  it('keeps runs of spaces visible', () => {
    const paragraphs = parseTextContent(
      lexical([
        { type: 'paragraph', children: [{ type: 'text', text: 'a  b' }] },
      ]),
    );

    expect(paragraphs?.[0][0].text).toBe('a  b');
  });
});
