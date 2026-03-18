import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
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
      await takeEditorScreenshot(page);
    },
  );

  test.fixme(
    'Salts and Solvents should replace Atoms, Functional Groups, and Salts and Solvents',
    async ({ page }) => {
      /*
Test case: EPMLSOPKET-12969 - 'Check that in all cases, there must be a replacement'
  */
      const originalTimeout = 10000;
      const longerTimeout = 30000;
      page.setDefaultTimeout(longerTimeout);
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Carbon);
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
      await takeEditorScreenshot(page);
    },
  );

  test('Verify if Methan Sulphonic Acid replace the Nitrogen atom', async ({
    page,
  }) => {
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
