/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { copyAndPaste, cutAndPaste } from '@utils/canvas/selectSelection';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { StereochemistrySetting } from '@tests/pages/constants/settingsDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  LAminoAcidsTemplate,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';

test.describe('Ignore Chiral Flag', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Copy/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16920
    const pointX = 204;
    const pointY = 211;
    await resetSettingsValuesToDefault(page);
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.LAminoAcids,
      LAminoAcidsTemplate.ARGLArginine,
    );
    await clickInTheMiddleOfTheScreen(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, pointX, pointY, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Cut/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16921
    const pointY = 204;
    const pointZ = 211;
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.LAminoAcids,
      LAminoAcidsTemplate.ARGLArginine,
    );
    await clickInTheMiddleOfTheScreen(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, pointY, pointZ, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Undo', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16919
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.LAminoAcids,
      LAminoAcidsTemplate.ARGLArginine,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" flag and stereocenters', async ({
    page,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/6161
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/non-proprietary-structure.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" flag and stereocenters2', async ({
    page,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/6161
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/non-proprietary-structure.mol',
    );
    await takeEditorScreenshot(page);
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await takeEditorScreenshot(page);
  });
});
