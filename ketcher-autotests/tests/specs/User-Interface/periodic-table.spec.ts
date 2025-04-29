import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Periodic table check', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-4234
      Description: Open periodic table
      */
    const periodicTableButton = rightToolbar(page).periodicTableButton;
    await periodicTableButton.click();
    await takeEditorScreenshot(page);
  });

  const atoms = [
    Atom.Hydrogen,
    Atom.Carbon,
    Atom.Nitrogen,
    Atom.Oxygen,
    Atom.Sulfur,
    Atom.Phosphorus,
    Atom.Fluorine,
    Atom.Chlorine,
    Atom.Bromine,
    Atom.Iodine,
  ];

  for (const atom of atoms) {
    test(`Check atoms ${atom}`, async ({ page }) => {
      const atomToolbar = rightToolbar(page);

      await atomToolbar.clickAtom(atom);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });
  }
});
