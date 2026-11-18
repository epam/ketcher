import { KetSerializer } from 'domain/serializers';

// Lexical TextNode format bits.
const BOLD = 1;
const ITALIC = 2;
const SUBSCRIPT = 32;
const SUPERSCRIPT = 64;

function oldFormatTextKet(content: string) {
  return JSON.stringify({
    root: {
      nodes: [
        {
          type: 'text',
          data: { content, position: { x: 1, y: 2, z: 0 } },
        },
      ],
    },
  });
}

function deserializedTextContent(content: string) {
  const struct = new KetSerializer().deserialize(oldFormatTextKet(content));
  return struct.texts.get(0)?.content;
}

function lexicalText(text: string, format: number) {
  return { type: 'text', text, format, style: '', version: 1 };
}

describe('KetSerializer.deserialize of an old-format text node', () => {
  it('stores Draft.js content as Lexical paragraphs with the inline styles as format flags', () => {
    const draftContent = JSON.stringify({
      blocks: [
        {
          key: 'first',
          text: 'Bold italic',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: 11, style: 'BOLD' },
            { offset: 5, length: 6, style: 'ITALIC' },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: 'second',
          text: 'H2O x2',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            { offset: 1, length: 1, style: 'SUBSCRIPT' },
            { offset: 5, length: 1, style: 'SUPERSCRIPT' },
          ],
          entityRanges: [],
          data: {},
        },
      ],
      entityMap: {},
    });

    const content = deserializedTextContent(draftContent);

    expect(JSON.parse(content ?? '')).toEqual({
      root: {
        type: 'root',
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              lexicalText('Bold ', BOLD),
              lexicalText('italic', BOLD | ITALIC),
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              lexicalText('H', 0),
              lexicalText('2', SUBSCRIPT),
              lexicalText('O x', 0),
              lexicalText('2', SUPERSCRIPT),
            ],
          },
        ],
      },
    });
  });

  it('keeps plain-text content unchanged', () => {
    expect(deserializedTextContent('Plain text')).toBe('Plain text');
  });

  it('keeps Lexical content unchanged', () => {
    const lexicalContent = JSON.stringify({
      root: {
        type: 'root',
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [lexicalText('Already Lexical', BOLD)],
          },
        ],
      },
    });

    expect(deserializedTextContent(lexicalContent)).toBe(lexicalContent);
  });
});
