/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
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
  dragMouseAndMoveTo,
} from '@utils';

// const SHIFT = 50;

test.describe('Click and drag Salts and Solvents on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Formic acid appears near Oxygen', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11555
      Description: when click & drag with a Salts and Solvents on atom
      Salts appears near atom where the left mouse button was released
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.FormicAcid,
    );
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Acetic acid appears near Cbz', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11556
      Description: when click & drag with a Salts and Solvents on Functional Group
      Salts appears near FG where the left mouse button was released
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.AceticAcid,
    );
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Propionic acid appears near Methane sulphonic acid', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11557
      Description: when click & drag with a Salts and Solvents on Salts and Solvents
      Salts appears near Salts where the left mouse button was released
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.PropionicAcid,
    );
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Isobutanol appears near Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11558
      Description: when click & drag with a Salts and Solvents
      on an atom connected with bond to another atom Salts appears
      near atom where the left mouse button was released
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.Isobutanol,
    );
    await dragMouseAndMoveTo(page, -50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('AceticAcid appears near FMOC Functional Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11559
      Description: when click & drag with a Salts and Solvents
      on a FG connected with bond to another FG Salts appears
      near FG where the left mouse button was released
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.AceticAcid,
    );
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });
});
