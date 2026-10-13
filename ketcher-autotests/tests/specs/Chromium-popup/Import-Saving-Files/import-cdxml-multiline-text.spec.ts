import { test, expect, Page } from '@fixtures';
import { getTextLabelLocator } from '@utils/canvas/text/getTextLabelLocator';
import { getKet, openFileAndAddToCanvasAsNewProject } from '@utils';

const CDXML_FILE = 'CDXML/multiline-text-with-formatting.cdxml';

const EXPECTED_LINES = [
  '2-fluoro-4-(7-(quinolin-6-ylmethyl)imidazo',
  '[1,2-b][1,2,4]triazin-2-yl)benzonitrile',
  'Chemical Formula: C22H13FN6',
  'Molecular Weight: 380.39',
];
const ITALIC_LINE_INDEX = 1;
const FORMULA_LINE_INDEX = 2;

// Rounding of text metrics between neighbours in one row
const POSITION_TOLERANCE_IN_PIXELS = 2;
// A label that spans two lines is about twice as high as a one-line label
const MAX_LABEL_HEIGHT_IN_LINES = 1.5;

type KetTextPart = { text: string; italic?: boolean; subscript?: boolean };
type KetParagraph = { parts: KetTextPart[] };
type KetNode = { type?: string; paragraphs?: KetParagraph[] };

let page: Page;

const getCaptionParagraphs = async (): Promise<KetParagraph[]> => {
  const ket = JSON.parse(await getKet(page));
  const textNode = (ket.root.nodes as KetNode[]).find(
    (node) => node.type === 'text',
  );
  if (!textNode?.paragraphs) {
    throw new Error('The structure has no text object');
  }
  return textNode.paragraphs;
};

const getPartTexts = (paragraph: KetParagraph, filter?: keyof KetTextPart) =>
  paragraph.parts
    .filter((part) => !filter || part[filter])
    .map((part) => part.text);

// One text label is drawn per part, in the order of the paragraphs and parts
const getLabelBoxes = async () => {
  const labels = await getTextLabelLocator(page, {}).all();
  const boxes = await Promise.all(labels.map((label) => label.boundingBox()));
  return boxes.map((box) => {
    if (!box) {
      throw new Error('A text label is not visible on the canvas');
    }
    return box;
  });
};

test.describe('Import of a multi-line CDXML caption', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {
    await openFileAndAddToCanvasAsNewProject(page, CDXML_FILE);
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Verify that every line of the caption is imported as its own paragraph', async () => {
    /*
    Test case: #12037
    Description: Lines of a ChemDraw caption (name, formula, molecular weight) are not merged into one paragraph
    */
    const paragraphs = await getCaptionParagraphs();

    expect(
      paragraphs.map((paragraph) => getPartTexts(paragraph).join('')),
    ).toEqual(EXPECTED_LINES);
  });

  test('Verify that line breaks are not left inside the text of the caption', async () => {
    /*
    Test case: #12037
    Description: Parts of the imported text contain no line breaks that the editor would draw in one row
    */
    const paragraphs = await getCaptionParagraphs();

    paragraphs.forEach((paragraph) => {
      getPartTexts(paragraph).forEach((text) => {
        expect(text).not.toMatch(/[\r\n]/);
      });
    });
  });

  test('Verify that italic and subscript formatting stays on its own line', async () => {
    /*
    Test case: #12037
    Description: The italic "b" and the subscript digits of the formula are kept after the lines are separated
    */
    const paragraphs = await getCaptionParagraphs();

    expect(getPartTexts(paragraphs[ITALIC_LINE_INDEX], 'italic')).toEqual([
      'b',
    ]);
    expect(getPartTexts(paragraphs[FORMULA_LINE_INDEX], 'subscript')).toEqual([
      '22',
      '13',
      '6',
    ]);
    expect(
      paragraphs.flatMap((paragraph) => getPartTexts(paragraph, 'subscript')),
    ).toHaveLength(3);
  });

  test('Verify that no text label of the caption spans more than one line', async () => {
    /*
    Test case: #12037
    Description: Every drawn label is one line high, so the lines cannot lie on top of each other
    */
    const paragraphs = await getCaptionParagraphs();
    const boxes = await getLabelBoxes();
    const isSubscript = paragraphs.flatMap((paragraph) =>
      paragraph.parts.map((part) => Boolean(part.subscript)),
    );
    expect(boxes).toHaveLength(isSubscript.length);

    // Subscripts are smaller, the other labels share the same font size
    const heights = boxes
      .filter((_, index) => !isSubscript[index])
      .map((box) => box.height);
    const lineHeight = Math.min(...heights);

    heights.forEach((height) => {
      expect(height).toBeLessThanOrEqual(
        lineHeight * MAX_LABEL_HEIGHT_IN_LINES,
      );
    });
  });

  test('Verify that each line of the caption starts at the left edge of the text', async () => {
    /*
    Test case: #12037
    Description: Text after a line break starts a new line instead of continuing at the end of the first one
    */
    const boxes = await getLabelBoxes();
    const leftEdge = Math.min(...boxes.map((box) => box.x));

    const labelsAtLeftEdge = boxes.filter(
      (box) => box.x - leftEdge <= POSITION_TOLERANCE_IN_PIXELS,
    );

    expect(labelsAtLeftEdge).toHaveLength(EXPECTED_LINES.length);
  });
});
