import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  openFile,
  pressButton,
  delay,
  takeEditorScreenshot,
} from '@utils';

test.describe('Reagents molecule below arrow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      'https://rc.test.lifescience.opensource.epam.com/KetcherDemo/index.html'
    );
  });

  test('Open File RXN v3000 with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('benzene-arrow-benzene-reagent-hcl.rxn', page);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);

    await delay(3);
    await takeEditorScreenshot(page);
  });

  test('Open File CDXML with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('benzene-arrow-benzene-reagent-hcl.cdxml', page);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);

    await delay(3);
    await takeEditorScreenshot(page);
  });

  test('Save SVG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4701
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('benzene-arrow-benzene-reagent-hcl.ket', page);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'SVG Document' }).click();

    await delay(3);
    await takeEditorScreenshot(page);
  });

  test('Save PNG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4698
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('benzene-arrow-benzene-reagent-hcl.ket', page);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'PNG Image' }).click();

    await delay(3);
    await takeEditorScreenshot(page);
  });
});
