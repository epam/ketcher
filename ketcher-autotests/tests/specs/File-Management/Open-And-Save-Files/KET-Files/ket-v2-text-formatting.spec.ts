/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
  clickInTheMiddleOfTheCanvas,
} from '@utils';
import { getKet } from '@utils/formats';
import { getTextLabelLocator } from '@utils/canvas/text/getTextLabelLocator';
import { zoomOutByKeyboard } from '@utils/keyboard';

const KET_V2_TEXT_FILE = 'KET/text-formatting-v2.ket';

type KetTextPart = {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  superscript?: boolean;
  subscript?: boolean;
  font?: { family?: string; size?: number };
};

type KetTextParagraph = {
  parts?: KetTextPart[];
};

type KetTextNode = {
  type: string;
  paragraphs?: KetTextParagraph[];
  boundingBox?: { x: number; y: number; width: number; height: number };
};

type KetParsed = {
  ket_version?: string;
  root: { nodes: KetTextNode[] };
};

/**
 * Helper: find a text node in the exported KET whose paragraphs→parts
 * contain a part matching the given predicate.
 */
function findTextNode(
  textNodes: KetTextNode[],
  partPredicate: (part: KetTextPart) => boolean,
): KetTextNode | undefined {
  return textNodes.find((n) =>
    n.paragraphs?.some((p) => p.parts?.some(partPredicate)),
  );
}

test.describe('KET v2.0 text formatting — Open file and verify text', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  // ---------------------------------------------------------------------------
  // 1. Open file and verify all text objects are rendered on canvas
  //    Covers: boundingBox, all part-level styles, alignment, indent,
  //    root/paragraph/part font defaults, mixed parts, multi-paragraph.
  // ---------------------------------------------------------------------------
  test('Open KET v2.0 file via Open file dialog — all text formatting variants appear on canvas', async ({
    page,
  }) => {
    /**
     * Fixture exercises every "text" type field from the KET v2
     * specification at root, paragraph and part levels:
     *   boundingBox (x, y, width, height)
     *   alignment (left / center / right) — root & paragraph
     *   indent (first_line, left, right) — root & paragraph
     *   font.family, font.size — root, paragraph & part
     *   color — root, paragraph & part
     *   bold, italic, subscript, superscript — root, paragraph & part
     *   paragraphs with per-paragraph overrides
     *   parts with mixed inline formatting
     */
    await openFileAndAddToCanvas(page, KET_V2_TEXT_FILE);

    // Part-level styles
    await expect(
      getTextLabelLocator(page, { text: 'Plain text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Bold text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Italic text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Subscript text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Superscript text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Font size 30' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Arial family' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Red colored' }),
    ).toBeVisible();

    // Mixed inline styles in single paragraph
    await expect(getTextLabelLocator(page, { text: 'Mixed' })).toBeVisible();

    // Multi-paragraph
    await expect(
      getTextLabelLocator(page, { text: 'First paragraph bold' }),
    ).toBeVisible();

    // Alignment (root & paragraph level)
    await expect(
      getTextLabelLocator(page, { text: 'Center aligned root' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Right aligned root' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Para left aligned' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Para center aligned' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Para right aligned' }),
    ).toBeVisible();

    // Indent (root & paragraph level)
    await expect(
      getTextLabelLocator(page, { text: 'Root indented text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Paragraph indented text' }),
    ).toBeVisible();

    // Root-level font/color/bold defaults
    await expect(
      getTextLabelLocator(page, { text: 'Root styled defaults' }),
    ).toBeVisible();

    // Paragraph-level font/color/bold/italic defaults
    await expect(
      getTextLabelLocator(page, { text: 'Paragraph styled defaults' }),
    ).toBeVisible();

    // Inheritance chain: root → paragraph → part
    await expect(
      getTextLabelLocator(page, { text: 'Root+Para' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Inherits root styles' }),
    ).toBeVisible();

    // Zoom out so all text objects fit within the snapshot area
    await clickInTheMiddleOfTheCanvas(page);
    await zoomOutByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  // ---------------------------------------------------------------------------
  // 2. Round-trip: open → getKet → verify all preserved fields
  //    Single test covering boundingBox, part-level formatting, mixed parts,
  //    multi-paragraph count and per-paragraph formatting.
  // ---------------------------------------------------------------------------
  test('Round-trip: all formatting fields are preserved after open and re-export as KET', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, KET_V2_TEXT_FILE);

    const ketOutput = await getKet(page);
    const parsed: KetParsed = JSON.parse(ketOutput);

    // ket_version
    expect(parsed.ket_version).toBe('2.0.0');

    const textNodes = parsed.root.nodes.filter((n) => n.type === 'text');
    // Fixture has 18 text objects
    expect(textNodes.length).toBe(18);

    // --- boundingBox on every node ---
    for (const node of textNodes) {
      expect(node.boundingBox).toBeDefined();
      const bb = node.boundingBox;
      if (!bb) throw new Error('Expected boundingBox to be defined');
      expect(typeof bb.x).toBe('number');
      expect(typeof bb.y).toBe('number');
      expect(bb.width).toBeGreaterThan(0);
      expect(bb.height).toBeGreaterThan(0);
    }

    // --- Part-level: bold ---
    expect(
      findTextNode(textNodes, (p) => Boolean(p.text === 'Bold text' && p.bold)),
    ).toBeDefined();

    // --- Part-level: italic ---
    expect(
      findTextNode(textNodes, (p) =>
        Boolean(p.text === 'Italic text' && p.italic),
      ),
    ).toBeDefined();

    // --- Part-level: subscript ---
    expect(
      findTextNode(textNodes, (p) =>
        Boolean(p.text === 'Subscript text' && p.subscript),
      ),
    ).toBeDefined();

    // --- Part-level: superscript ---
    expect(
      findTextNode(textNodes, (p) =>
        Boolean(p.text === 'Superscript text' && p.superscript),
      ),
    ).toBeDefined();

    // --- Part-level: font.size ---
    expect(
      findTextNode(
        textNodes,
        (p) => p.text === 'Font size 30' && p.font?.size === 30,
      ),
    ).toBeDefined();

    // --- Part-level: font.family ---
    expect(
      findTextNode(
        textNodes,
        (p) => p.text === 'Arial family' && p.font?.family === 'Arial',
      ),
    ).toBeDefined();

    // --- Part-level: color ---
    expect(
      findTextNode(
        textNodes,
        (p) => p.text === 'Red colored' && p.color === '#FF0000',
      ),
    ).toBeDefined();

    // --- Mixed-formatting paragraph: 5 parts with distinct styles ---
    const mixedNode = findTextNode(textNodes, (p) => p.text === 'Mixed ');
    expect(mixedNode).toBeDefined();

    if (!mixedNode?.paragraphs) {
      throw new Error('Expected mixedNode.paragraphs to be defined');
    }
    const mixedPara = mixedNode.paragraphs.find((p) =>
      p.parts?.some((part) => part.text === 'Mixed '),
    );
    if (!mixedPara?.parts) {
      throw new Error('Expected mixedPara.parts to be defined');
    }
    expect(mixedPara.parts.length).toBeGreaterThanOrEqual(5);

    const boldPart = mixedPara.parts.find((p) => p.text === 'Mixed ');
    if (!boldPart) throw new Error('Expected boldPart to be defined');
    expect(boldPart.bold).toBe(true);
    expect(boldPart.font?.size).toBe(20);

    const italicBluePart = mixedPara.parts.find(
      (p) => p.text === 'formatting ',
    );
    if (!italicBluePart) {
      throw new Error('Expected italicBluePart to be defined');
    }
    expect(italicBluePart.italic).toBe(true);
    expect(italicBluePart.color).toBe('#0000FF');

    const boldItalicPart = mixedPara.parts.find((p) => p.text === 'in ');
    if (!boldItalicPart) {
      throw new Error('Expected boldItalicPart to be defined');
    }
    expect(boldItalicPart.bold).toBe(true);
    expect(boldItalicPart.italic).toBe(true);

    const superPart = mixedPara.parts.find((p) => p.text === 'one');
    if (!superPart) throw new Error('Expected superPart to be defined');
    expect(superPart.superscript).toBe(true);

    const subFontPart = mixedPara.parts.find((p) => p.text === ' line');
    if (!subFontPart) throw new Error('Expected subFontPart to be defined');
    expect(subFontPart.subscript).toBe(true);
    expect(subFontPart.font?.family).toBe('Tahoma');

    // --- Multi-paragraph: 3 paragraphs with per-paragraph formatting ---
    const multiParaNode = findTextNode(
      textNodes,
      (p) => p.text === 'First paragraph bold',
    );
    expect(multiParaNode).toBeDefined();
    if (!multiParaNode?.paragraphs) {
      throw new Error('Expected multiParaNode.paragraphs to be defined');
    }
    expect(multiParaNode.paragraphs.length).toBe(3);

    const para1Part = multiParaNode.paragraphs[0].parts?.[0];
    if (!para1Part) throw new Error('Expected para1Part to be defined');
    expect(para1Part.bold).toBe(true);

    const para2Part = multiParaNode.paragraphs[1].parts?.[0];
    if (!para2Part) throw new Error('Expected para2Part to be defined');
    expect(para2Part.italic).toBe(true);
    expect(para2Part.color).toBe('#00AA00');

    const para3Part = multiParaNode.paragraphs[2].parts?.[0];
    if (!para3Part) throw new Error('Expected para3Part to be defined');
    expect(para3Part.font?.size).toBe(25);

    await clickInTheMiddleOfTheCanvas(page);
    await zoomOutByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  // ---------------------------------------------------------------------------
  // 3. Paste from Clipboard — alternative load path
  // ---------------------------------------------------------------------------
  test('KET v2.0 text can be loaded via Paste from Clipboard', async ({
    page,
  }) => {
    const fileContent = await readFileContent(KET_V2_TEXT_FILE);

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheCanvas(page);

    // Spot-check representative text objects from different categories
    await expect(
      getTextLabelLocator(page, { text: 'Plain text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Bold text' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Center aligned root' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Root styled defaults' }),
    ).toBeVisible();
    await expect(
      getTextLabelLocator(page, { text: 'Inherits root styles' }),
    ).toBeVisible();

    await clickInTheMiddleOfTheCanvas(page);
    await zoomOutByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });
});
