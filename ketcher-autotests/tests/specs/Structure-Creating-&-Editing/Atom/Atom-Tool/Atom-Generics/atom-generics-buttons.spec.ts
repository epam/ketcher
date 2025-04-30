import { test } from '@playwright/test';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  takeEditorScreenshot,
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
      const extendedTableButton = rightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickOnAtom(page, 'S', 0);
      await takeEditorScreenshot(page);
    });
  }
});
