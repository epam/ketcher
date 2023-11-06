import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectAtomInToolbar,
  AtomButton,
  clickOnAtom,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

test.describe('Generic node', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );
  });

  const Atomstests = ['A', 'AH', 'Q', 'QH', 'M', 'MH', 'X', 'XH'];
  for (const atom of Atomstests) {
    test(`adding atoms_${atom}`, async ({ page }) => {
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickOnAtom(page, 'S', 0);
      await takeEditorScreenshot(page);
    });
  }
});
