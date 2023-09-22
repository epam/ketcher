import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  readFileContents,
  FILE_TEST_DATA,
  saveToFile,
  waitForLoad,
  waitForPageInit,
} from '@utils';
import { getRxn } from '@utils/formats';

function getComparableDataFromRxn(
  rxnData: string,
  start: number,
  end?: number,
) {
  return rxnData.split('\n').slice(start, end).join('\n');
}

function getRxnFileFilteredBySymbols(
  rxnFile: string,
  metaDataIndexes: number[],
) {
  return rxnFile
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index))
    .join('\n');
}

async function saveAsMdlRxnV3000(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'MDL Rxnfile V3000' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function pasteFromClipboard(page: Page, fileFormats: string) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileFormats);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
}

test.describe('Reagents RXN format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Detection molecule as reagent and write reagent information in "MDL rxnfile V2000" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4671
    Description: Files are compared for reagent presence
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('mdl-rxnfile-v2000-expected.rxn', expectedFile);

    const rxnFileExpected = await readFileContents(
      'tests/test-data/mdl-rxnfile-v2000-expected.rxn',
    );
    const COMPARABLE_DATA_START = 46;
    const COMPARABLE_DATA_END = 48;
    const rxnFile = await getRxn(page, 'v2000');
    const actualComparableData = getComparableDataFromRxn(
      rxnFile,
      COMPARABLE_DATA_START,
      COMPARABLE_DATA_END,
    );
    const expectedComparableData = getComparableDataFromRxn(
      rxnFileExpected,
      COMPARABLE_DATA_START,
      COMPARABLE_DATA_END,
    );

    expect(actualComparableData).toEqual(expectedComparableData);
  });

  test('Detection molecule as reagent and write reagent information in "MDL rxnfile V3000" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4672
    Description: Files are compared for reagent presence
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile('mdl-rxnfile-v3000-expected.rxn', expectedFile);

    const rxnFileExpected = await readFileContents(
      'tests/test-data/mdl-rxnfile-v3000-expected.rxn',
    );
    const COMPARABLE_DATA_START = 5;
    const COMPARABLE_DATA_END = 58;
    const rxnFile = await getRxn(page, 'v3000');

    const actualComparableData = getComparableDataFromRxn(
      rxnFile,
      COMPARABLE_DATA_START,
      COMPARABLE_DATA_END,
    );
    const expectedComparableData = getComparableDataFromRxn(
      rxnFileExpected,
      COMPARABLE_DATA_START,
      COMPARABLE_DATA_END,
    );
    expect(actualComparableData).toEqual(expectedComparableData);
  });

  test('File saves in "MDL rxnfile V2000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4675
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('mdl-rxnfile-v2000-expected.rxn', expectedFile);

    const rxnFileExpected = await readFileContents(
      'tests/test-data/mdl-rxnfile-v2000-expected.rxn',
    );
    const rxnFile = await getRxn(page, 'v2000');
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEXES = [2, 7, 25, 43];

    const filteredRxnFileExpected = getRxnFileFilteredBySymbols(
      rxnFileExpected,
      METADATA_STRING_INDEXES,
    );

    const filteredRxnFile = getRxnFileFilteredBySymbols(
      rxnFile,
      METADATA_STRING_INDEXES,
    );

    expect(filteredRxnFile).toEqual(filteredRxnFileExpected);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  test('File saves in "MDL rxnfile V3000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4676
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Rxn-V3000/benzene-arrow-benzene-reagent-nh3-expected.rxn',
      expectedFile,
    );

    const rxnFileExpected = await readFileContents(
      'tests/test-data/Rxn-V3000/benzene-arrow-benzene-reagent-nh3-expected.rxn',
    );
    const rxnFile = await getRxn(page, 'v3000');
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRINGS_INDEXES = [2];

    const filteredRxnFileExpected = getRxnFileFilteredBySymbols(
      rxnFileExpected,
      METADATA_STRINGS_INDEXES,
    );
    const filteredRxnFile = getRxnFileFilteredBySymbols(
      rxnFile,
      METADATA_STRINGS_INDEXES,
    );
    expect(filteredRxnFile).toEqual(filteredRxnFileExpected);

    await saveAsMdlRxnV3000(page);
  });
});

test.describe('Reagents RXN format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open from file in "RXN V2000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4679
      Description: Reagent 'NH3' above the reaction arrow
      */
    await openFileAndAddToCanvas('mdl-rxnfile-v2000-expected.rxn', page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open from file in "RXN V3000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4680
      Description: Reagent 'NH3' above the reaction arrow
      */
    await openFileAndAddToCanvas('mdl-rxnfile-v3000-expected.rxn', page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "RXN V2000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4677
      Description: Reagent 'Cl' displays below reaction arrow
      */
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "RXN V3000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4678
      Description: Reagent 'Cl' displays below reaction arrow
      */
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV3000,
    );
    await clickInTheMiddleOfTheScreen(page);
  });
});
