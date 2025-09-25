/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MicroAtomOption,
  MicroBondOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  BondType,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Connection rules for molecules with monomers: ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Delete molecule attachment point with connection between monomer and molecule`, async ({
    page,
  }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/molecule-connected-to-monomers.ket',
    );
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 21 }),
    ).click(MicroAtomOption.Delete);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test(`Delete connection between monomer and molecule`, async ({ page }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/molecule-connected-to-monomers.ket',
    );
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 18);
    await ContextMenu(page, point).click(MicroBondOption.Delete);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });
});
