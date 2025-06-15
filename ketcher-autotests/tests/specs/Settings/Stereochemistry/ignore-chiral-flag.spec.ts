/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { openStructureLibrary } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  copyAndPaste,
  cutAndPaste,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { scrollSettingBar } from '@utils/scrollSettingBar';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { StereochemistrySetting } from '@tests/pages/constants/settingsDialog/Constants';

async function templateFromLAminoAcidsCategory(page: Page) {
  await openStructureLibrary(page);
  await page.getByRole('button', { name: 'L-Amino Acids (20)' }).click();
  await scrollSettingBar(page, 80);
  await page.getByText('ARG-L-Arginine').click();
  await clickInTheMiddleOfTheScreen(page);
}

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
    await templateFromLAminoAcidsCategory(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, pointX, pointY);
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Cut/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16921
    const pointY = 204;
    const pointZ = 211;
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await templateFromLAminoAcidsCategory(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, pointY, pointZ);
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Undo', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16919
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await templateFromLAminoAcidsCategory(page);
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
