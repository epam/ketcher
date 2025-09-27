import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  waitForPageInit,
} from '@utils';
import { selectExtendedTableElement } from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';

test.describe('Generic nodes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );
  });

  test('G and G* adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1503
      */
    await selectExtendedTableElement(page, ExtendedTableButton.G);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.GH);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.G_STAR);
    await clickOnAtom(page, 'F', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.GH_STAR);
    await clickOnAtom(page, 'I', 0);
    await takeEditorScreenshot(page);
  });

  test('Acylic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1505
      */
    await selectExtendedTableElement(page, ExtendedTableButton.ACY);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ACH);
    await clickOnAtom(page, 'F', 0);
    await takeEditorScreenshot(page);
  });

  test('Acylic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1508
      */
    await selectExtendedTableElement(page, ExtendedTableButton.ABC);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ABH);
    await clickOnAtom(page, 'F', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AYH);
    await clickOnAtom(page, 'I', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AYL);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ALK);
    await clickOnAtom(page, 'H', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ALH);
    await clickOnAtom(page, 'P', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AEL);
    await clickOnAtom(page, 'Br', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AEH);
    await clickOnAtom(page, 'Cl', 0);
    await takeEditorScreenshot(page);
  });

  test('Acylic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1512
      */
    await selectExtendedTableElement(page, ExtendedTableButton.AHC);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AHH);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AOX);
    await clickOnAtom(page, 'Br', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.AOH);
    await clickOnAtom(page, 'Cl', 0);
    await takeEditorScreenshot(page);
  });

  test('Cyclic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1516
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CYC);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CYH);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CXX);
    await clickOnAtom(page, 'Cl', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CXH);
    await clickOnAtom(page, 'Br', 0);
    await takeEditorScreenshot(page);
  });

  test('Cyclic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1524
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CBC);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CBH);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ARY);
    await clickOnAtom(page, 'Cl', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.ARH);
    await clickOnAtom(page, 'Br', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CAL);
    await clickOnAtom(page, 'H', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CAH);
    await clickOnAtom(page, 'P', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CEL);
    await clickOnAtom(page, 'I', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CEH);
    await clickOnAtom(page, 'N', 0);
    await takeEditorScreenshot(page);
  });

  test('Cyclic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1526
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CHC);
    await clickOnAtom(page, 'S', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.CHH);
    await clickOnAtom(page, 'O', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.HAR);
    await clickOnAtom(page, 'Cl', 0);
    await selectExtendedTableElement(page, ExtendedTableButton.HAH);
    await clickOnAtom(page, 'Br', 0);
    await takeEditorScreenshot(page);
  });
});
