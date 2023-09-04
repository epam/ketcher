import { expect, test, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  clickOnAtom,
  clickOnBond,
  BondTool,
  selectNestedTool,
  ArrowTool,
  selectAtomInToolbar,
  AtomButton,
  BondType,
  clickOnTheCanvas,
  selectTopPanelButton,
  TopPanelButton,
  RgroupTool,
  pressButton,
  selectLeftPanelButton,
  LeftPanelButton,
  selectAction,
  dragMouseTo,
  setAttachmentPoints,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils';
import { getRxn } from '@utils/formats';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';

async function savedFileInfoStartsWithRxn(page: Page, wantedResult = false) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  const textareaSelector = 'textarea[class^="Save-module_previewArea"]';
  const textareaElement = await page.$(textareaSelector);
  const textareaText = await textareaElement?.textContent();
  const expectedSentence = '$RXN';
  wantedResult
    ? expect(textareaText?.startsWith(expectedSentence)).toBeTruthy()
    : expect(textareaText?.startsWith(expectedSentence)).toBeFalsy();
}

test('Open and Save file - Reaction with atom and bond properties', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1897
   * Description: Reaction with atom and bond properties
   */
  const xOffsetFromCenter = 40;
  await page.goto('');
  await drawBenzeneRing(page);
  await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
  await clickOnBond(page, BondType.DOUBLE, 1);
  await selectNestedTool(page, BondTool.TRIPPLE);
  await clickOnBond(page, BondType.DOUBLE, 1);
  await selectAtomInToolbar(AtomButton.Nitrogen, page);
  await clickOnAtom(page, 'C', 1);
  await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
  await clickOnTheCanvas(page, xOffsetFromCenter, 0);

  const expectedFile = await getRxn(page);
  await saveToFile(
    'RXN/reaction-with-atom-and-bond-properties-saved.rxn',
    expectedFile,
  );

  await selectAction(TopPanelButton.Clear, page);

  await openFileAndAddToCanvas(
    'RXN/reaction-with-atom-and-bond-properties-saved.rxn',
    page,
  );

  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains Rgroup', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1901
   * Description: Reaction from file that contains Rgroup
   */
  const xOffsetFromCenter = 40;
  await page.goto('');
  await drawBenzeneRing(page);
  await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
  await clickOnAtom(page, 'C', 1);
  await page.getByRole('button', { name: 'R7' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
  await clickOnTheCanvas(page, xOffsetFromCenter, 0);
  await selectTopPanelButton(TopPanelButton.Save, page);
  const saveButtonOne = page.getByRole('button', { name: 'Save', exact: true });
  await expect(saveButtonOne).not.toHaveAttribute('disabled', 'disabled');

  await pressButton(page, 'Cancel');
  await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
  await setAttachmentPoints(
    page,
    { label: 'C', index: 2 },
    { primary: true },
    'Apply',
  );
  await selectTopPanelButton(TopPanelButton.Save, page);
  const saveButtonTwo = page.getByRole('button', { name: 'Save', exact: true });
  await expect(saveButtonTwo).not.toHaveAttribute('disabled', 'disabled');

  await page.getByRole('button', { name: 'Cancel' }).click();
  await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
  const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
  await page.mouse.click(x, y);
  await page.getByRole('button', { name: 'R22' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await selectTopPanelButton(TopPanelButton.Save, page);
  const saveButtonThree = page.getByRole('button', {
    name: 'Save',
    exact: true,
  });
  await expect(saveButtonThree).not.toHaveAttribute('disabled', 'disabled');
});

// EPMLSOPKET-1903 - TO DO
// TO DO: while saving file showed ERROR: array: invalid index -2 (size=0)
// Need to create new bug looks like it connected to #2389 issue
test.fixme(
  'Open and Save file - Reaction from file that contains Sgroup',
  async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1903
     * Description: Reaction from file that contains Sgroup
     */
    await page.goto('');
    await openFileAndAddToCanvas(
      'RXN/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    const expectedFile = await getRxn(page);
    await saveToFile(
      'RXN/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      expectedFile,
    );
    await openFileAndAddToCanvas(
      'RXN/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  },
);

test('Open and Save file - File without arrow or(and) plus-symbol', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1905
   * Description: File without arrow or(and) plus-symbol
   */
  await page.goto('');
  await selectLeftPanelButton(LeftPanelButton.Chain, page);
  await moveMouseToTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const xDelta = 300;
  const xDeltaHalf = 150;
  const yDelta50 = 50;
  const yDelta20 = 20;
  const xCoordinatesWithShift = x + xDelta;
  const xCoordinatesWithShiftHalf = x + xDeltaHalf;
  const yCoordinatesWithShift = y + yDelta50;
  await dragMouseTo(xCoordinatesWithShift, y, page);
  await savedFileInfoStartsWithRxn(page);

  await pressButton(page, 'Cancel');
  await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
  await page.mouse.click(xCoordinatesWithShiftHalf, yCoordinatesWithShift);
  const ySecondChain = yCoordinatesWithShift + yDelta50;
  await selectLeftPanelButton(LeftPanelButton.Chain, page);
  await page.mouse.move(x, ySecondChain);
  await dragMouseTo(xCoordinatesWithShift, ySecondChain, page);
  await savedFileInfoStartsWithRxn(page);

  await pressButton(page, 'Cancel');
  await selectLeftPanelButton(LeftPanelButton.Erase, page);
  await page.mouse.click(xCoordinatesWithShiftHalf, yCoordinatesWithShift);
  await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
  const yArrowStart = y + yDelta20;
  const yArrowEnd = yArrowStart + yDelta20;
  await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
  await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
  await savedFileInfoStartsWithRxn(page, true);

  await pressButton(page, 'Cancel');
  await selectTopPanelButton(TopPanelButton.Clear, page);
  await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
  await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
  await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
  await savedFileInfoStartsWithRxn(page, true);
});

// EPMLSOPKET-8904 - TO DO
// TO DO: looks like issue was not fixed
// Need to recheck issue #1837, added new screenshot there
test.fixme(
  'Open and Save file - Structure is not missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures',
  async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-8904
     * Description: Structure isn't missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures
     */
    await page.goto('');
    const RING_OFFSET = 150;
    const ARROW_OFFSET = 20;
    const ARROW_LENGTH = 100;
    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    const xOffsetFromCenter = 50;
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    const expectedFileV2000 = await getRxn(page);
    await takeEditorScreenshot(page);
    await saveToFile(
      'RXN/structure-with-two-reaction-arrows-v2000-saved.rxn',
      expectedFileV2000,
    );
    const expectedFileV3000 = await getRxn(page);
    await saveToFile(
      'RXN/structure-with-two-reaction-arrows-v3000-saved.rxn',
      expectedFileV3000,
    );
    await selectAction(TopPanelButton.Clear, page);
    await openFileAndAddToCanvas(
      'RXN/structure-with-two-reaction-arrows-v3000-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  },
);

test('Open and Save file - Import the structure from the saved RXN 2000/3000 file', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-12964
   * Description: Import the structure from the saved RXN 2000/3000 file
   */
  await page.goto('');
  await openFileAndAddToCanvas(
    'RXN/reaction-with-several-components.rxn',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open the RXN v2000/v3000 files with S-Group Properties Type = Multiple group', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-12967 for Open RXN v3000 file with 'S-Group Properties Type = Multiple group rxnV3000Multiple.zip
   * Description: Open the RXN v2000/v3000 files with S-Group Properties Type = Multiple group
   */
  await page.goto('');
  await openFileAndAddToCanvas(
    'RXN/structure-with-s-groups-with-unsupported-s-group-type-V3000.rxn',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1899(1)
   * Description: Reaction with abbreviations is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('sec_butyl_abr.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1899(2)
   * Description: Reaction with abbreviations is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('sec_butyl_abr.rxn', page);
  const expectedFile = await getRxn(page, 'v2000');
  await saveToFile('sec-butyl-abr-expectedV2000.rxn', expectedFile);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2, 7, 23, 54];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/sec-butyl-abr-expectedV2000.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});

test('Open and Save file - Reaction from file that contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1904(1)
   * Description: Reaction with heteroatoms is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('Heteroatoms.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1904(2)
   * Description: Reaction with heteroatoms is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('Heteroatoms.rxn', page);
  const expectedFile = await getRxn(page, 'v2000');
  await saveToFile('heteroatoms-expectedV2000.rxn', expectedFile);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2, 7, 30, 39, 62];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/heteroatoms-expectedV2000.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});

test('Open and Save file - V3000 rxn file contains Rgroup 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1902(1)
   * Description: Reaction can be opened correctly from rxn V3000 file
   */
  await page.goto('');

  await openFileAndAddToCanvas('Rgroup_V3000.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - V3000 rxn file contains Rgroup 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1902(2)
   * Description: Reaction can be saved correctly to rxn V3000 file
   */
  await page.goto('');

  await openFileAndAddToCanvas('Rgroup_V3000.rxn', page);
  const expectedFile = await getRxn(page, 'v3000');
  await saveToFile('r-group-V3000-expectedV3000.rxn', expectedFile);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/r-group-V3000-expectedV3000.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});
