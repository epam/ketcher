/* eslint-disable no-magic-numbers */
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
  waitForRender,
  dragMouseAndMoveTo,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';

// const SHIFT = 50;

test.describe('Click and drag FG on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Cbz forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11550
      Description: when click & drag with an FG on atom it should forms a bond between
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await dragMouseAndMoveTo(page, 50);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Boc forms a bond with Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11551
      Description: when click & drag with an FG on FG it should forms a bond between it
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await dragMouseAndMoveTo(page, 50);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Boc appears near FormicAcid where the left mouse button was released', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11552
      Description: when click & drag with an FG on Salts and Solvents
      FG appears near Salt and Solvents where the left mouse button was released
      Bug: https://github.com/epam/ketcher/issues/2278
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.FormicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await dragMouseAndMoveTo(page, 50);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('CF3 forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11553
      Description: when click & drag with an FG on an atom connected with bond to another atom
      it should forms a bond
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await dragMouseAndMoveTo(page, 50);
    await resetCurrentTool(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CF3,
    );
    await dragMouseAndMoveTo(page, -50);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Ms forms a bond with FMOC', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11554
      Description: when click & drag with an FG on an FG connected with bond to another FG
      it should forms a bond
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);

    await waitForRender(page, async () => {
      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addFunctionalGroup(
        FunctionalGroupsTabItems.CO2Et,
      );
      await dragMouseAndMoveTo(page, 50);
    });
    await resetCurrentTool(page);

    await waitForRender(page, async () => {
      await BottomToolbar(page).StructureLibrary();
      await StructureLibraryDialog(page).addFunctionalGroup(
        FunctionalGroupsTabItems.Ms,
      );
      await dragMouseAndMoveTo(page, -50);
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
