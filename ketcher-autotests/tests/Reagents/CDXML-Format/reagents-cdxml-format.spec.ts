import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  FILE_TEST_DATA,
  waitForLoad,
  waitForPageInit,
} from '@utils';
import { clickOnFileDropdown } from '@utils/formats';

async function previewCDXML(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileDropdown(page);
  await page.getByRole('option', { name: 'CDXML' }).click();
}

async function pasteCDXML(page: Page, fileFormat: string) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileFormat);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
}

test.describe('Reagents CDXML format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Detection molecule as reagent and write reagent information in "CDXML" format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule NH3 above arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await previewCDXML(page);
  });

  test(`Detection molecule as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await previewCDXML(page);
  });

  test(`Detection text above arrow as reagent
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text NH3 as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('KET/reagent-nh3-text-above-arrow.ket', page);
    await previewCDXML(page);
  });

  test(`Detection text as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('KET/reagent-hcl-text-below-arrow.ket', page);
    await previewCDXML(page);
  });

  test('File saves in "CDXML" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4721
    Description: File saved in format (e.g. "ketcher.cdxml")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileDropdown(page);
    await page.getByRole('option', { name: 'CDXML' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  test('Paste from clipboard in "CDXML" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4722
      Description: Reagent 'NH3' displays above reaction arrow
      */
    await pasteCDXML(page, FILE_TEST_DATA.benzeneArrowBenzeneReagentNh3);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
  });

  test('Open File CDXML with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
  });

  test('Open File CDXML with molecules above and below one arrow', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-5255
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas('molecules-above-and-below-arrow.cdxml', page);
  });

  test('Open File CDXML with multistep reactions', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-5256
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas('CDXML/cdxml-multistep.cdxml', page);
  });
});
