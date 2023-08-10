import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectAtomInToolbar,
  AtomButton,
  clickOnAtom,
} from '@utils';

test.describe('Generic nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('G and G* adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1503
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'G', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'GH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'G', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'G*', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'GH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'GH*', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'G*', 0);
  });

  test('Acylic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1505
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ACY', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ACH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ACY', 0);
  });

  test('Acylic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1508
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ABC', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ABH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ABC', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AYH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ABH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AYL', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AYH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ALK', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AYL', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ALH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ALK', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AEL', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ALH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AEH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AEL', 0);
  });

  test('Acylic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1512
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AHC', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AHH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AHC', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AOX', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AHH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AOH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'AOX', 0);
  });

  test('Cyclic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1516
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CYC', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CYH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CYC', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CXX', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CYH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CXH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CXX', 0);
  });

  test('Cyclic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1524
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CBC', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CBH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CBC', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ARY', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CBH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'ARH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ARY', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CAL', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'ARH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CAH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CAL', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CEL', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CAH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CEH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CEL', 0);
  });

  test('Cyclic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1526
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CHC', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'CHH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CHC', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'HAR', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'CHH', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'HAH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'HAR', 0);
  });
});
