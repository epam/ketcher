import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectAtomInToolbar,
  AtomButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  waitForPageInit,
} from '@utils';

test.describe('Special nodes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const atoms = ['H+', 'D', 'T', 'R', 'Pol'];
  for (const atom of atoms) {
    test(`${atom} calculated values`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      // Description: verify Calculated values for atoms
      // results of this test are not fully correct. when calculte values function is fixed - update scrshots
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
      await selectTopPanelButton(TopPanelButton.Calculated, page);
    });
  }

  for (const atom of atoms) {
    test(`UI ${atom}`, async ({ page }) => {
      // Test case: EPMLSOPKET-1468
      // Checking UI and functionality of Special Nodes
      // buttons in Extended table dialog
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
    });
  }

  for (const atom of atoms) {
    test(`${atom} is present on canvas`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
    });
  }

  for (const atom of atoms) {
    test(`${atom} adding to multiple atoms of structure`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      await openFileAndAddToCanvas(
        'Molfiles-V2000/heteroatoms-structure.mol',
        page,
      );
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await page.keyboard.down('Shift');
      await clickOnAtom(page, 'S', 0);
      await clickOnAtom(page, 'F', 0);
      await page.keyboard.up('Shift');
    });
  }
});

test.describe('Special node', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  const atoms = ['H+', 'D', 'T', 'R', 'Pol'];
  for (const atom of atoms) {
    test(`${atom} recognition`, async ({ page }) => {
      // Test case: EPMLSOPKET-1470, 1472, 1480, 1482, 1484
      await selectAtomInToolbar(AtomButton.Extended, page);
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
      await selectTopPanelButton(TopPanelButton.Check, page);
    });
  }
});
