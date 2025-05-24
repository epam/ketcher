import { test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  waitForPageInit,
} from '@utils';

test.describe('Special nodes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const atoms = ['H+', 'D', 'T', 'R', 'Pol'];
  for (const atom of atoms) {
    test(`${atom} calculated values`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      // Description: verify Calculated values for atoms
      // results of this test are not fully correct. when calculte values function is fixed - update scrshots
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
      await IndigoFunctionsToolbar(page).calculatedValues();
      await takeEditorScreenshot(page);
    });
  }

  for (const atom of atoms) {
    test(`UI ${atom}`, async ({ page }) => {
      // Test case: EPMLSOPKET-1468
      // Checking UI and functionality of Special Nodes
      // buttons in Extended table dialog
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await takeEditorScreenshot(page);
    });
  }

  for (const atom of atoms) {
    test(`${atom} is present on canvas`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });
  }

  for (const atom of atoms) {
    test(`${atom} adding to multiple atoms of structure`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await openFileAndAddToCanvas(
        'Molfiles-V2000/heteroatoms-structure.mol',
        page,
      );
      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await page.keyboard.down('Shift');
      await clickOnAtom(page, 'S', 0);
      await clickOnAtom(page, 'F', 0);
      await page.keyboard.up('Shift');
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('Special node', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const atoms = ['H+', 'D', 'T', 'R', 'Pol'];
  for (const atom of atoms) {
    test(`${atom} recognition`, async ({ page }) => {
      // Test case: EPMLSOPKET-1470, 1472, 1480, 1482, 1484
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await page.getByRole('button', { name: atom, exact: true }).click();
      await page.getByTestId('OK').click();
      await clickInTheMiddleOfTheScreen(page);
      await IndigoFunctionsToolbar(page).checkStructure();
      await takeEditorScreenshot(page, {
        mask: [page.locator('[class*="Check-module_checkInfo"] > span')],
      });
    });
  }
});
