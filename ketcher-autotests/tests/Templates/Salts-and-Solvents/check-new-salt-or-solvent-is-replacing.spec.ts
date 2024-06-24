import { test } from '@playwright/test';
import {
  selectAtomInToolbar,
  AtomButton,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  FunctionalGroups,
  selectFunctionalGroups,
  putAceticAcidOnCanvasByClickingInTheMiddleOfTheScreen,
} from '@utils';

test.describe('Salts and Solvents replacement', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(
    'Verify if the new Salt or Solvent is replacing old one',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-12972 - 'Check that new Salt or Solvent is replacing the previously added one'
      */
      test.slow();

      await selectSaltsAndSolvents(SaltsAndSolvents.AceticAnhydride, page);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
      await putAceticAcidOnCanvasByClickingInTheMiddleOfTheScreen(page);
    },
  );

  test('Salts and Solvents should replace Atoms, Functional Groups, and Salts and Solvents', async ({
    page,
  }) => {
    /*
Test case: EPMLSOPKET-12969 - 'Check that in all cases, there must be a replacement'
  */
    const originalTimeout = 10000;
    const longerTimeout = 30000;
    page.setDefaultTimeout(longerTimeout);

    await selectAtomInToolbar(AtomButton.Carbon, page);
    await clickInTheMiddleOfTheScreen(page);
    await putAceticAcidOnCanvasByClickingInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await selectFunctionalGroups(FunctionalGroups.Bz, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.AceticAnhydride, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await putAceticAcidOnCanvasByClickingInTheMiddleOfTheScreen(page);

    page.setDefaultTimeout(originalTimeout);
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
