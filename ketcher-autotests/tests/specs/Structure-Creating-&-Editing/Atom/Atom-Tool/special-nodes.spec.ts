import { test } from '@playwright/test';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';
import { selectExtendedTableElement } from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';
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

  const atoms = [
    ExtendedTableButton.H_PLUS,
    ExtendedTableButton.D,
    ExtendedTableButton.T,
    ExtendedTableButton.R,
    ExtendedTableButton.Pol,
  ] as const;
  for (const atom of atoms) {
    test(`${atom} calculated values`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      // Description: verify Calculated values for atoms
      // results of this test are not fully correct. when calculte values function is fixed - update scrshots
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await selectExtendedTableElement(page, atom, 'Add');
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
      await selectExtendedTableElement(page, atom);
      await takeEditorScreenshot(page);
    });
  }

  for (const atom of atoms) {
    test(`${atom} is present on canvas`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await selectExtendedTableElement(page, atom, 'Add');
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });
  }

  for (const atom of atoms) {
    test(`${atom} adding to multiple atoms of structure`, async ({ page }) => {
      // Test case: EPMLSOPKET-1469, 1741, 1473, 1481, 1483
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/heteroatoms-structure.mol',
      );
      await extendedTableButton.click();
      await selectExtendedTableElement(page, atom, 'Add');
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

  const atoms = [
    ExtendedTableButton.H_PLUS,
    ExtendedTableButton.D,
    ExtendedTableButton.T,
    ExtendedTableButton.R,
    ExtendedTableButton.Pol,
  ] as const;
  for (const atom of atoms) {
    test(`${atom} recognition`, async ({ page }) => {
      // Test case: EPMLSOPKET-1470, 1472, 1480, 1482, 1484
      const extendedTableButton = RightToolbar(page).extendedTableButton;

      await extendedTableButton.click();
      await selectExtendedTableElement(page, atom, 'Add');
      await clickInTheMiddleOfTheScreen(page);
      await IndigoFunctionsToolbar(page).checkStructure();
      await takeEditorScreenshot(page, {
        mask: [StructureCheckDialog(page).lastCheckInfo],
      });
    });
  }
});
