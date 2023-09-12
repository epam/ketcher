import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  readFileContents,
  pasteFromClipboard,
  waitForLoad,
  waitForPageInit,
} from '@utils';
import { getSmarts } from '@utils/formats';

async function saveSmarts(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function previewSmarts(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
}

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g. [#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1>[#7]>[#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1)
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smartsFileExpected = await readFileContents(
      'tests/test-data/expected-smarts-file.smarts',
    );
    const smartsFile = await getSmarts(page);
    expect(smartsFile).toEqual(smartsFileExpected);

    await previewSmarts(page);
  });

  test(`Detection molecule below arrow as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g.
      [#6]1(-[#6])-[#6](-[#8])=[#6]-[#6](-[#16])=[#6](-[#7])-[#6]=1>[#17]>[#6]1(-[#35])-[#6](-[#6])=[#6]-[#6](-[#53])=[#6](-[#8])-[#6]=1
    )
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    const smartsFileExpected = await readFileContents(
      'tests/test-data/expected-smarts-below.smarts',
    );
    const smartsFile = await getSmarts(page);
    expect(smartsFile).toEqual(smartsFileExpected);

    await previewSmarts(page);
  });

  test('Paste from clipboard in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4687
    Description: Reagent 'Cl' displays above reaction arrow
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(
      page,
      '[#6]-[#6]-1=[#6]-[#6](-[#7])=[#6](-[#16])-[#6]=[#6]-1-[#8]>Cl>[#6]-[#6]-1=[#6]-[#6](I)=[#6](-[#8])-[#6]=[#6]-1Br',
    );
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open from file in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4689
    Description: Reagent 'Cl' below the reaction arrow
    */
    await openFileAndAddToCanvas('expected-smarts-below.smarts', page);
  });

  test('Structure is opened with Not List atoms saved in "Daylight SMARTS" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4706
    Description: Chain is opened with Not List atoms ![Zr,Au,Zn]
    */
    await openFileAndAddToCanvas('not-list-atoms-smarts.smarts', page);
  });
});

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4685
    Description: File saved in format (e.g. "ketcher.smarts")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smartsFileExpected = await readFileContents(
      'tests/test-data/expected-smarts-file.smarts',
    );
    const smartsFile = await getSmarts(page);
    expect(smartsFile).toEqual(smartsFileExpected);

    await saveSmarts(page);
  });
});
