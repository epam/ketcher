import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { selectExtendedTableElement } from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

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
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.GH);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.G_STAR);
    await getAtomLocator(page, { atomLabel: 'F' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.GH_STAR);
    await getAtomLocator(page, { atomLabel: 'I' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Acylic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1505
      */
    await selectExtendedTableElement(page, ExtendedTableButton.ACY);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ACH);
    await getAtomLocator(page, { atomLabel: 'F' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Acylic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1508
      */
    await selectExtendedTableElement(page, ExtendedTableButton.ABC);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ABH);
    await getAtomLocator(page, { atomLabel: 'F' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AYH);
    await getAtomLocator(page, { atomLabel: 'I' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AYL);
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ALK);
    await getAtomLocator(page, { atomLabel: 'H' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ALH);
    await getAtomLocator(page, { atomLabel: 'P' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AEL);
    await getAtomLocator(page, { atomLabel: 'Br' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AEH);
    await getAtomLocator(page, { atomLabel: 'Cl' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Acylic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1512
      */
    await selectExtendedTableElement(page, ExtendedTableButton.AHC);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AHH);
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AOX);
    await getAtomLocator(page, { atomLabel: 'Br' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.AOH);
    await getAtomLocator(page, { atomLabel: 'Cl' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Cyclic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1516
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CYC);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CYH);
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CXX);
    await getAtomLocator(page, { atomLabel: 'Cl' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CXH);
    await getAtomLocator(page, { atomLabel: 'Br' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Cyclic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1524
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CBC);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CBH);
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ARY);
    await getAtomLocator(page, { atomLabel: 'Cl' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.ARH);
    await getAtomLocator(page, { atomLabel: 'Br' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CAL);
    await getAtomLocator(page, { atomLabel: 'H' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CAH);
    await getAtomLocator(page, { atomLabel: 'P' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CEL);
    await getAtomLocator(page, { atomLabel: 'I' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CEH);
    await getAtomLocator(page, { atomLabel: 'N' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Cyclic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1526
      */
    await selectExtendedTableElement(page, ExtendedTableButton.CHC);
    await getAtomLocator(page, { atomLabel: 'S' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.CHH);
    await getAtomLocator(page, { atomLabel: 'O' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.HAR);
    await getAtomLocator(page, { atomLabel: 'Cl' }).first().click({
      force: true,
    });
    await selectExtendedTableElement(page, ExtendedTableButton.HAH);
    await getAtomLocator(page, { atomLabel: 'Br' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });
});
