import { test, expect, Page, Locator } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  ModifyAminoAcidsOption,
  MonomerOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { MacroFileType } from '@utils/canvas/types';
import { pasteFromClipboardAndAddToMacromoleculesCanvas } from '@utils/files/readFile';
import {
  getMonomerHighlightLocator,
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';

const PEPTIDES_HELM = 'PEPTIDE1{A.G.A.C.A}$$$$V2.0';
const NUCLEOTIDE_HELM = 'RNA1{R(A)P}$$$$V2.0';
const ALANINE_COUNT = 3;

const ALL_LAYOUT_MODES = [
  LayoutMode.Flex,
  LayoutMode.Snake,
  LayoutMode.Sequence,
] as const;

type Box = { x: number; y: number; width: number; height: number };

let page: Page;

const isSequence = (mode: LayoutMode) => mode === LayoutMode.Sequence;

const getMonomers = (mode: LayoutMode, alias: string): Locator =>
  isSequence(mode)
    ? getSymbolLocator(page, { symbolAlias: alias })
    : getMonomerLocator(page, { monomerAlias: alias });

const getEditAllOption = (mode: LayoutMode) =>
  isSequence(mode)
    ? SequenceSymbolOption.EditAllMonomers
    : MonomerOption.EditAllMonomers;

const getEditMonomerOption = (mode: LayoutMode) =>
  isSequence(mode)
    ? SequenceSymbolOption.EditMonomer
    : MonomerOption.EditMonomer;

const getModifyAminoAcidsOption = (mode: LayoutMode) =>
  isSequence(mode)
    ? SequenceSymbolOption.ModifyAminoAcids
    : MonomerOption.ModifyAminoAcids;

const switchLayout = async (mode: LayoutMode) => {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(mode);
  await getMonomers(mode, 'A').first().waitFor({ state: 'visible' });
};

const hoverEditAll = async (mode: LayoutMode, target?: Locator) => {
  await ContextMenu(page, target ?? getMonomers(mode, 'A').first()).hover(
    getEditAllOption(mode),
  );
};

const closeContextMenu = async () => {
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="menu"]:visible')).toHaveCount(0);
};

const getBoxes = async (locator: Locator): Promise<Box[]> =>
  Promise.all(
    (await locator.all()).map(async (item) => {
      const box = await item.boundingBox();
      if (!box) {
        throw new Error('Element is not visible on the canvas');
      }
      return box;
    }),
  );

const getCenter = (box: Box) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const contains = (box: Box, point: { x: number; y: number }) =>
  point.x >= box.x &&
  point.x <= box.x + box.width &&
  point.y >= box.y &&
  point.y <= box.y + box.height;

const countHighlightsOver = async (monomers: Locator) => {
  const highlights = await getBoxes(getMonomerHighlightLocator(page));
  const centers = (await getBoxes(monomers)).map(getCenter);
  return centers.filter((center) =>
    highlights.some((highlight) => contains(highlight, center)),
  ).length;
};

const getIndicatorSignature = (locator: Locator) =>
  locator.first().evaluate((element) => ({
    tag: element.tagName.toLowerCase(),
    stroke: element.getAttribute('stroke'),
    radius: element.getAttribute('r'),
    fill:
      element.getAttribute('fill') ??
      element.querySelector('rect')?.getAttribute('fill') ??
      null,
  }));

test.describe('Highlight of the monomers that "Edit All" will change', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      PEPTIDES_HELM,
    );
  });

  test.afterEach(async () => {
    await closeContextMenu();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  for (const mode of ALL_LAYOUT_MODES) {
    test(`Verify that hovering "Edit All" marks every instance of the monomer in ${mode}`, async () => {
      /*
      Test case: #12191
      Description: One mark per matching monomer, on the monomer, and none on the other monomers
      */
      await switchLayout(mode);

      await hoverEditAll(mode);

      await expect(getMonomerHighlightLocator(page)).toHaveCount(ALANINE_COUNT);
      expect(await countHighlightsOver(getMonomers(mode, 'A'))).toBe(
        ALANINE_COUNT,
      );
      expect(await countHighlightsOver(getMonomers(mode, 'G'))).toBe(0);
      expect(await countHighlightsOver(getMonomers(mode, 'C'))).toBe(0);
    });
  }

  test('Verify that the marks are removed when the pointer leaves "Edit All"', async () => {
    /*
    Test case: #12191
    Description: Marks are shown only while the item is hovered
    */
    await hoverEditAll(LayoutMode.Flex);
    await expect(getMonomerHighlightLocator(page)).toHaveCount(ALANINE_COUNT);

    await ContextMenu(page, getMonomers(LayoutMode.Flex, 'A').first())
      .getOptionLocator(getEditMonomerOption(LayoutMode.Flex))
      .hover();

    await expect(getMonomerHighlightLocator(page)).toHaveCount(0);
  });

  test('Verify that the marks are removed when the context menu is closed', async () => {
    /*
    Test case: #12191
    Description: Closing the menu with Escape while "Edit All" is hovered leaves no marks
    */
    await hoverEditAll(LayoutMode.Flex);
    await expect(getMonomerHighlightLocator(page)).toHaveCount(ALANINE_COUNT);

    await closeContextMenu();

    await expect(getMonomerHighlightLocator(page)).toHaveCount(0);
  });

  test('Verify that choosing "Edit All" asks for confirmation and removes the marks', async () => {
    /*
    Test case: #12191
    Description: The marks do not stay behind the confirmation dialog
    */
    await ContextMenu(page, getMonomers(LayoutMode.Flex, 'A').first()).click(
      MonomerOption.EditAllMonomers,
    );

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.getMessageBodyText()).toContain(
      `${ALANINE_COUNT} monomers`,
    );
    await expect(getMonomerHighlightLocator(page)).toHaveCount(0);
    await dialog.cancel();
  });

  test('Verify that the marks are the same as for "Modify amino acids"', async () => {
    /*
    Test case: #12191
    Description: Both menu entries use one indicator, in every layout
    */
    for (const mode of [LayoutMode.Flex, LayoutMode.Sequence]) {
      await switchLayout(mode);
      const target = getMonomers(mode, 'A').first();

      await hoverEditAll(mode, target);
      await expect(getMonomerHighlightLocator(page)).not.toHaveCount(0);
      const editAllSignature = await getIndicatorSignature(
        getMonomerHighlightLocator(page),
      );
      await closeContextMenu();

      await ContextMenu(page, target).hover([
        getModifyAminoAcidsOption(mode),
        ModifyAminoAcidsOption.Inversion,
      ]);
      await expect(getMonomerHighlightLocator(page)).not.toHaveCount(0);
      const modifySignature = await getIndicatorSignature(
        getMonomerHighlightLocator(page),
      );
      await closeContextMenu();

      expect(editAllSignature).toEqual(modifySignature);
    }
  });

  test('Verify that nothing is marked when "Edit All" is disabled for a nucleotide', async () => {
    /*
    Test case: #12191
    Description: A sequence symbol that stands for several monomers cannot be edited, so no marks are shown
    */
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      NUCLEOTIDE_HELM,
    );
    await switchLayout(LayoutMode.Sequence);
    const nucleotide = getSymbolLocator(page, { symbolAlias: 'A' }).first();

    expect(
      await ContextMenu(page, nucleotide).isOptionEnabled(
        SequenceSymbolOption.EditAllMonomers,
      ),
    ).toBe(false);
    await hoverEditAll(LayoutMode.Sequence, nucleotide);

    await expect(getMonomerHighlightLocator(page)).toHaveCount(0);
  });
});
