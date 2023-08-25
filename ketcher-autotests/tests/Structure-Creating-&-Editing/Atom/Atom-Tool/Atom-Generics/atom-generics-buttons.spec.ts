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

  test('Any Atom adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1495
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'A', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'AH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'A', 0);
  });

  test('Except C or H adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1496
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Q', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'QH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'Q', 0);
  });

  test('Any metal adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1498
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'MH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'M', 0);
  });

  test('Any halogen adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1500
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'X', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'XH', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'X', 0);
  });
});
