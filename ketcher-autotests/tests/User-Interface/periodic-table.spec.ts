import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  AtomButton,
  selectAtomInToolbar,
  clickInTheMiddleOfTheScreen,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Periodic table check', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-4234
      Description: Open periodic table
      */
    await selectAtomInToolbar(AtomButton.Periodic, page);
  });

  const atoms = [
    AtomButton.Hydrogen,
    AtomButton.Carbon,
    AtomButton.Nitrogen,
    AtomButton.Oxygen,
    AtomButton.Sulfur,
    AtomButton.Phosphorus,
    AtomButton.Fluorine,
    AtomButton.Chlorine,
    AtomButton.Bromine,
    AtomButton.Iodine,
  ];

  for (const atom of atoms) {
    test(`Check atoms ${atom}`, async ({ page }) => {
      await selectAtomInToolbar(atom, page);
      await clickInTheMiddleOfTheScreen(page);
    });
  }
});
