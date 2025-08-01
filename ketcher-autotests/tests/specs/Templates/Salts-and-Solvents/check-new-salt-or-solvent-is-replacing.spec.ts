import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import {
  FunctionalGroupsTabItems,
  SaltsAndSolventsTabItems,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
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

      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addSaltsAndSolvents(
        SaltsAndSolventsTabItems.AceticAnhydride,
      );
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addSaltsAndSolvents(
        SaltsAndSolventsTabItems.AceticAcid,
      );
      await clickInTheMiddleOfTheScreen(page);
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
      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addSaltsAndSolvents(
        SaltsAndSolventsTabItems.AceticAcid,
      );
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addFunctionalGroup(
        FunctionalGroupsTabItems.Bz,
      );
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addSaltsAndSolvents(
        SaltsAndSolventsTabItems.AceticAcid,
      );
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addSaltsAndSolvents(
        SaltsAndSolventsTabItems.AceticAcid,
      );
      await clickInTheMiddleOfTheScreen(page);
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
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
