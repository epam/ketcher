import { expect, test, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  clickOnAtom,
  selectNestedTool,
  ArrowTool,
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
  waitForPageInit,
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

test.describe('Tests for Open and Save RXN file operations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save file - Reaction with atom and bond properties', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1897
     * Description: Reaction with atom and bond properties
     */
    await openFileAndAddToCanvas(
      'Rxn-V2000/reaction-with-atom-and-bond-properties-saved.rxn',
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
    await drawBenzeneRing(page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 1);
    await page.getByRole('button', { name: 'R7' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await selectTopPanelButton(TopPanelButton.Save, page);
    const saveButtonOne = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
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
    const saveButtonTwo = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
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

  test('Open and Save file - Reaction from file that contains Sgroup', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1903
     * Description: Reaction from file that contains Sgroup
     */
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    const expectedFile = await getRxn(page);
    await saveToFile(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      expectedFile,
    );
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - File without arrow or(and) plus-symbol', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1905
     * Description: File without arrow or(and) plus-symbol
     */
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
    await savedFileInfoStartsWithRxn(page);

    await pressButton(page, 'Cancel');
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
    await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
    await savedFileInfoStartsWithRxn(page, true);
  });

  test('Open and Save file - Structure is not missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-8904
     * Description: Structure isn't missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures
     */
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
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
      expectedFileV2000,
    );
    const expectedFileV3000 = await getRxn(page);
    await saveToFile(
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
      expectedFileV3000,
    );
    await selectAction(TopPanelButton.Clear, page);
    await openFileAndAddToCanvas(
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);

    await selectAction(TopPanelButton.Clear, page);
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Import the structure from the saved RXN 2000/3000 file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12964
     * Description: Import the structure from the saved RXN 2000/3000 file
     */
    await openFileAndAddToCanvas(
      'Rxn-V3000/reaction-with-several-components.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v3000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v3000 file with 'S-Group Properties Type = Multiple group rxnV3000Multiple.zip
     * Description: Open the RXN v3000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      'Rxn-V3000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v2000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v2000 file with 'S-Group Properties Type = Multiple group rxnV2000Multiple.zip
     * Description: Open the RXN v2000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
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
    await openFileAndAddToCanvas('Rxn-V2000/sec-butyl-abr.rxn', page);
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains abbreviation 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1899(2)
     * Description: Reaction with abbreviations is opened and saved correctly
     */
    await openFileAndAddToCanvas('Rxn-V2000/sec-butyl-abr.rxn', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('Rxn-V2000/sec-butyl-abr-expectedV2000.rxn', expectedFile);

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRINGS_INDEXES = [2, 7, 23, 54];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/sec-butyl-abr-expectedV2000.rxn',
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
    await openFileAndAddToCanvas('Rxn-V2000/heteroatoms.rxn', page);
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
    await openFileAndAddToCanvas('Rxn-V2000/heteroatoms.rxn', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('Rxn-V2000/heteroatoms-expectedV2000.rxn', expectedFile);

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRINGS_INDEXES = [2, 7, 30, 39, 62];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/heteroatoms-expectedV2000.rxn',
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
    await openFileAndAddToCanvas('Rxn-V3000/r-group-V3000.rxn', page);
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
    await openFileAndAddToCanvas('Rxn-V3000/r-group-V3000.rxn', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile('Rxn-V3000/r-group-V3000-expectedV3000.rxn', expectedFile);

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRINGS_INDEXES = [2];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V3000/r-group-V3000-expectedV3000.rxn',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });
});
