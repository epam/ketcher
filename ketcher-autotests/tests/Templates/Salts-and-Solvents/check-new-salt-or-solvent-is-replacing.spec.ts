import { test } from '@playwright/test';
import {
  selectAtomInToolbar,
  AtomButton,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Salts and Solvents replacement', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Verify if the new Salt or Solvent is replacing old one', async ({
    page,
  }) => {
    /*
Test case: EPMLSOPKET-12972 - 'Check that new Salt or Solvent is replacing the previously added one'
  */
    await selectSaltsAndSolvents(SaltsAndSolvents.AceticAnhydride, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.AceticAcid, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Verify if Methan Sulphonic Acid replace the Nitrogen atom', async ({
    page,
  }) => {
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
  });
});
