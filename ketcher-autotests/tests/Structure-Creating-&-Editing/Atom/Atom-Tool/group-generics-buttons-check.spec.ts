import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectAtomInToolbar,
  AtomButton,
  clickOnAtom,
  waitForPageInit,
} from '@utils';
import { AtomExtendedType, AtomLabelType } from '@utils/clicks/types';

async function selectExtendedAtom(
  page: Page,
  extendedAtom: AtomExtendedType,
  atomToClick: AtomLabelType,
) {
  await selectAtomInToolbar(AtomButton.Extended, page);
  await page.getByRole('button', { name: extendedAtom, exact: true }).click();
  await page.getByTestId('OK').click();
  await clickOnAtom(page, atomToClick, 0);
}

test.describe('Generic nodes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('G and G* adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1503
      */
    await selectExtendedAtom(page, 'G', 'O');
    await selectExtendedAtom(page, 'GH', 'S');
    await selectExtendedAtom(page, 'G*', 'F');
    await selectExtendedAtom(page, 'GH*', 'I');
  });

  test('Acylic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1505
      */
    await selectExtendedAtom(page, 'ACY', 'S');
    await selectExtendedAtom(page, 'ACH', 'F');
  });

  test('Acylic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1508
      */
    await selectExtendedAtom(page, 'ABC', 'S');
    await selectExtendedAtom(page, 'ABH', 'F');
    await selectExtendedAtom(page, 'AYH', 'I');
    await selectExtendedAtom(page, 'AYL', 'O');
    await selectExtendedAtom(page, 'ALK', 'H');
    await selectExtendedAtom(page, 'ALH', 'P');
    await selectExtendedAtom(page, 'AEL', 'Br');
    await selectExtendedAtom(page, 'AEH', 'Cl');
  });

  test('Acylic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1512
      */
    await selectExtendedAtom(page, 'AHC', 'S');
    await selectExtendedAtom(page, 'AHH', 'O');
    await selectExtendedAtom(page, 'AOX', 'Br');
    await selectExtendedAtom(page, 'AOH', 'Cl');
  });

  test('Cyclic atoms adding to the atom of structure', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1516
      */
    await selectExtendedAtom(page, 'CYC', 'S');
    await selectExtendedAtom(page, 'CYH', 'O');
    await selectExtendedAtom(page, 'CXX', 'Cl');
    await selectExtendedAtom(page, 'CXH', 'Br');
  });

  test('Cyclic Carbo atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1524
      */
    await selectExtendedAtom(page, 'CBC', 'S');
    await selectExtendedAtom(page, 'CBH', 'O');
    await selectExtendedAtom(page, 'ARY', 'Cl');
    await selectExtendedAtom(page, 'ARH', 'Br');
    await selectExtendedAtom(page, 'CAL', 'H');
    await selectExtendedAtom(page, 'CAH', 'P');
    await selectExtendedAtom(page, 'CEL', 'I');
    await selectExtendedAtom(page, 'CEH', 'N');
  });

  test('Cyclic Hetero atoms adding to the atom of structure', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1526
      */
    await selectExtendedAtom(page, 'CHC', 'S');
    await selectExtendedAtom(page, 'CHH', 'O');
    await selectExtendedAtom(page, 'HAR', 'Cl');
    await selectExtendedAtom(page, 'HAH', 'Br');
  });
});
