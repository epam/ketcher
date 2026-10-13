import {
  type DraftEditorState,
  convertDraftToLexical,
} from 'application/render/restruct/draftToLexical';
import type {
  SerializedParagraphNode,
  SerializedTextNode,
} from 'application/render/restruct/retext';

const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const FONT_SIZE_STYLE = 'font-size:15px;';

const getTextNodes = (paragraph: SerializedParagraphNode) =>
  paragraph.children as SerializedTextNode[];

const getParagraphTexts = (draft: DraftEditorState) =>
  convertDraftToLexical(draft).root.children.map((paragraph) =>
    getTextNodes(paragraph)
      .map((node) => node.text)
      .join(''),
  );

// Text of a multi-line caption as Indigo returns it for a ChemDraw CDXML file
const indigoCaption: DraftEditorState = {
  blocks: [
    {
      text: '2-fluoro-4-(7-(quinolin-6-ylmethyl)imidazo\n[1,2-b][1,2,4]triazin-2-yl)benzonitrile\nChemical Formula: C22H13FN6\nMolecular Weight: 380.39',
      type: 'unstyled',
      inlineStyleRanges: [
        { offset: 48, length: 1, style: 'ITALIC' },
        { offset: 102, length: 2, style: 'SUBSCRIPT' },
        { offset: 105, length: 2, style: 'SUBSCRIPT' },
        { offset: 109, length: 2, style: 'SUBSCRIPT' },
        { offset: 0, length: 135, style: 'CUSTOM_FONT_SIZE_15px' },
      ],
      entityRanges: [],
      data: {},
    },
  ],
  entityMap: {},
};

describe('convertDraftToLexical', () => {
  describe('line breaks inside a block', () => {
    it('makes a paragraph of every line, so the lines are not laid out in one row', () => {
      expect(getParagraphTexts(indigoCaption)).toEqual([
        '2-fluoro-4-(7-(quinolin-6-ylmethyl)imidazo',
        '[1,2-b][1,2,4]triazin-2-yl)benzonitrile',
        'Chemical Formula: C22H13FN6',
        'Molecular Weight: 380.39',
      ]);
    });

    it('keeps the italic text on the line it belongs to', () => {
      const paragraphs = convertDraftToLexical(indigoCaption).root.children;

      const italic = getTextNodes(paragraphs[1]).filter(
        (node) => node.format === IS_ITALIC,
      );
      expect(italic.map((node) => node.text)).toEqual(['b']);
    });

    it('keeps the subscripts of the formula on its line', () => {
      const paragraphs = convertDraftToLexical(indigoCaption).root.children;

      const subscripts = getTextNodes(paragraphs[2]).filter(
        (node) => node.format === IS_SUBSCRIPT,
      );
      expect(subscripts.map((node) => node.text)).toEqual(['22', '13', '6']);
      expect(
        paragraphs.flatMap((paragraph) =>
          getTextNodes(paragraph).filter(
            (node) => node.format === IS_SUBSCRIPT,
          ),
        ),
      ).toHaveLength(3);
    });

    it('keeps the font size on every line', () => {
      const paragraphs = convertDraftToLexical(indigoCaption).root.children;

      paragraphs.forEach((paragraph) => {
        getTextNodes(paragraph).forEach((node) => {
          expect(node.style).toBe(FONT_SIZE_STYLE);
        });
      });
    });

    it('does not leave line breaks in the text nodes', () => {
      const paragraphs = convertDraftToLexical(indigoCaption).root.children;

      paragraphs.forEach((paragraph) => {
        getTextNodes(paragraph).forEach((node) => {
          expect(node.text).not.toMatch(/[\r\n]/);
        });
      });
    });

    it('keeps a style that runs over a line break on both lines', () => {
      const draft: DraftEditorState = {
        blocks: [
          {
            text: 'abc\ndef',
            type: 'unstyled',
            inlineStyleRanges: [{ offset: 1, length: 5, style: 'BOLD' }],
          },
        ],
      };

      const [first, second] = convertDraftToLexical(draft).root.children;

      expect(getTextNodes(first).map((n) => [n.text, n.format])).toEqual([
        ['a', 0],
        ['bc', 1],
      ]);
      expect(getTextNodes(second).map((n) => [n.text, n.format])).toEqual([
        ['de', 1],
        ['f', 0],
      ]);
    });

    it('turns an empty line into an empty paragraph', () => {
      const draft: DraftEditorState = {
        blocks: [{ text: 'first\n\nthird', type: 'unstyled' }],
      };

      const paragraphs = convertDraftToLexical(draft).root.children;

      expect(getParagraphTexts(draft)).toEqual(['first', '', 'third']);
      expect(getTextNodes(paragraphs[1])).toHaveLength(1);
    });

    it('adds an empty paragraph for a trailing line break', () => {
      const draft: DraftEditorState = {
        blocks: [{ text: 'first\n', type: 'unstyled' }],
      };

      expect(getParagraphTexts(draft)).toEqual(['first', '']);
    });

    it('treats carriage returns as line breaks', () => {
      const draft: DraftEditorState = {
        blocks: [{ text: 'first\r\nsecond', type: 'unstyled' }],
      };

      expect(getParagraphTexts(draft)).toEqual(['first', 'second']);
    });

    it('splits every block that has line breaks and keeps the order of the blocks', () => {
      const draft: DraftEditorState = {
        blocks: [
          { text: 'a\nb', type: 'unstyled' },
          { text: 'c', type: 'unstyled' },
          { text: 'd\ne', type: 'unstyled' },
        ],
      };

      expect(getParagraphTexts(draft)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('blocks without line breaks', () => {
    it('keeps one paragraph per block with its styled segments', () => {
      const draft: DraftEditorState = {
        blocks: [
          {
            text: 'H2O',
            type: 'unstyled',
            inlineStyleRanges: [{ offset: 1, length: 1, style: 'SUBSCRIPT' }],
          },
        ],
      };

      const paragraphs = convertDraftToLexical(draft).root.children;

      expect(paragraphs).toHaveLength(1);
      expect(
        getTextNodes(paragraphs[0]).map((n) => [n.text, n.format]),
      ).toEqual([
        ['H', 0],
        ['2', IS_SUBSCRIPT],
        ['O', 0],
      ]);
    });

    it('keeps an empty block as an empty paragraph', () => {
      const draft: DraftEditorState = {
        blocks: [
          { text: 'first', type: 'unstyled' },
          { text: '', type: 'unstyled' },
        ],
      };

      expect(getParagraphTexts(draft)).toEqual(['first', '']);
    });

    it('returns an empty root when there are no blocks', () => {
      expect(convertDraftToLexical({ blocks: [] }).root.children).toEqual([]);
      expect(convertDraftToLexical({}).root.children).toEqual([]);
    });
  });
});
