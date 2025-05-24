import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
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
    const periodicTableButton = RightToolbar(page).periodicTableButton;
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
    test(`Check atoms ${
      Object.entries(Atom).find(([, value]) => value === atom)?.[0]
    }`, async ({ page }) => {
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(atom);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });
  }
});
