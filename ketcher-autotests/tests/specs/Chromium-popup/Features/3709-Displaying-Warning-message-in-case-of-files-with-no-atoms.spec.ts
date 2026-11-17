import { test, expect } from '@fixtures';
import {
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  MacroFileType,
} from '@utils';
import { NotificationBannerOnMicro } from '@tests/pages/molecules/canvas/NotificationBannerOnMicro';
import { NotificationBannerOnMacro } from '@tests/pages/macromolecules/canvas/NotificationBannerOnMacro';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

const V2000_ZERO_ATOMS = 'Molfiles-V2000/empty-canvas-expected.mol';
const V3000_ZERO_ATOMS =
  'Molfiles-V3000/Chromium-popup/3709-warning-no-atoms/v3000-no-atoms-with-counts.mol';
const V3000_WITH_ATOMS = 'Molfiles-V3000/aromatic-benzene-v3000.mol';

test.describe('Warning message when opening files with no atoms: ', () => {
  test('Case 1 - V2000 mol with zero atoms displays "No structure" warning in Molecules mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12676
     * Description: Opening a V2000 mol file with zero atoms (counts line specifies 0 atoms)
     * displays the "No structure" warning notification in Molecules mode
     * Scenario:
     * 1. Open the application in Molecules mode
     * 2. Open a V2000 mol file that specifies 0 atoms in its counts line
     * 3. Verify the "No structure" warning notification is displayed
     *
     * Version 2.4.0
     */
    await waitForPageInit(page);

    await openFileAndAddToCanvasAsNewProject(page, V2000_ZERO_ATOMS);

    const notification = NotificationBannerOnMicro(page);
    await notification.waitForBecomeVisible();
    expect(await notification.getNotificationText()).toContain('No structure');
  });

  test('Case 2 - V3000 mol with COUNTS 0 0 0 0 0 displays "No structure" warning in Molecules mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12676
     * Description: Opening a V3000 mol file with a complete CTAB section but zero atoms
     * (COUNTS 0 0 0 0 0) displays the "No structure" warning notification in Molecules mode
     * Scenario:
     * 1. Open the application in Molecules mode
     * 2. Open a V3000 mol file with M V30 COUNTS 0 0 0 0 0 and no atom block
     * 3. Verify the "No structure" warning notification is displayed
     *
     * Version 2.4.0
     */
    await waitForPageInit(page);

    await openFileAndAddToCanvasAsNewProject(page, V3000_ZERO_ATOMS);

    const notification = NotificationBannerOnMicro(page);
    await notification.waitForBecomeVisible();
    expect(await notification.getNotificationText()).toContain('No structure');
  });

  test('Case 3 - V3000 mol with atoms does not display "No structure" warning in Molecules mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12676
     * Description: Opening a mol file that includes at least one atom does not display
     * the "No structure" warning notification in Molecules mode
     * Scenario:
     * 1. Open the application in Molecules mode
     * 2. Open a V3000 mol file with actual atom data
     * 3. Verify the "No structure" warning notification is NOT displayed
     *
     * Version 2.4.0
     */
    await waitForPageInit(page);

    await openFileAndAddToCanvasAsNewProject(page, V3000_WITH_ATOMS);

    await expect(NotificationBannerOnMicro(page).message).not.toBeVisible();
  });

  test('Case 4 - V3000 mol with zero atoms displays "No structure" warning in Macromolecules Flex mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12676
     * Description: Opening a V3000 mol file with zero atoms displays the "No structure"
     * warning notification in Macromolecules Flex mode
     * Scenario:
     * 1. Open the application and switch to Macromolecules editor in Flex mode
     * 2. Open a V3000 mol file with COUNTS 0 0 0 0 0 and no atom block
     * 3. Verify the "No structure" warning notification is displayed
     *
     * Version 2.4.0
     */
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      V3000_ZERO_ATOMS,
      MacroFileType.MOLv3000,
    );

    const notification = NotificationBannerOnMacro(page);
    await notification.waitForBecomeVisible();
    expect(await notification.getNotificationText()).toContain('No structure');
  });

  test('Case 5 - V3000 mol with atoms does not display "No structure" warning in Macromolecules Flex mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12676
     * Description: Opening a mol file with valid atom data does not display the "No structure"
     * warning notification in Macromolecules Flex mode
     * Scenario:
     * 1. Open the application and switch to Macromolecules editor in Flex mode
     * 2. Open a V3000 mol file with actual atom data
     * 3. Verify the "No structure" warning notification is NOT displayed
     *
     * Version 2.4.0
     */
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      V3000_WITH_ATOMS,
      MacroFileType.MOLv3000,
    );

    await expect(NotificationBannerOnMacro(page).message).not.toBeVisible();
  });
});
