import { Page, expect, test } from '@fixtures';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { expandMonomer } from '@utils/canvas/monomer/helpers';
import { openFileAndAddToCanvasAsNewProjectMacro } from '@utils/files/readFile';
import { takeEditorScreenshot } from '@utils/canvas';
import { waitForKetcherInit, waitForIndigoToLoad } from '@utils';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

let page: Page;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('Added configuration for Ketcher to disable expand monomers functionality', () => {
  test('Case 1 - Expand monomer option is visible in context menu by default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12684
     * Description: Verify expand monomer option is visible in context menu when functionality is not disabled
     * Scenario:
     * 1. Open Ketcher without disabledFunctionality config
     * 2. Load a KET file containing monomers
     * 3. Right-click on a monomer abbreviation on the canvas
     * 4. Verify 'Expand monomer' option is visible in context menu
     *
     * Version 3.22.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/monomers-cycled.ket');

    const monomer = getAbbreviationLocator(page, { name: '1Nal' }).first();

    const isExpandVisible = await ContextMenu(page, monomer).isOptionVisible(
      MonomerOnMicroOption.ExpandMonomer,
    );

    expect(isExpandVisible).toBe(true);
  });

  test('Case 2 - Monomers can be expanded correctly when expand monomers functionality is enabled', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12684
     * Description: Verify that monomers can be expanded via context menu when functionality is enabled
     * Scenario:
     * 1. Open Ketcher without disabledFunctionality config
     * 2. Load a KET file containing monomers
     * 3. Right-click on a monomer abbreviation and select 'Expand monomer'
     * 4. Verify the monomer is expanded, showing its full chemical structure
     *
     * Version 3.22.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/monomers-cycled.ket');

    const monomer = getAbbreviationLocator(page, { name: '1Nal' }).first();

    await expandMonomer(page, monomer);

    await takeEditorScreenshot(page);
  });

  test('Case 3 - Expand monomer option is hidden when disabledFunctionality=expandMonomers is configured', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12684
     * Description: Verify expand monomer option is hidden in context menu when disabled via URL config
     * Scenario:
     * 1. Open Ketcher with ?disabledFunctionality=expandMonomers in URL
     * 2. Switch to Molecules editor mode
     * 3. Load a KET file containing monomers
     * 4. Right-click on a monomer abbreviation on the canvas
     * 5. Verify 'Expand monomer' option is NOT visible in context menu
     *
     * Version 3.22.0
     */
    await page.goto('/popup?disabledFunctionality=expandMonomers');
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForIndigoToLoad(page);

    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/monomers-cycled.ket');

    const monomer = getAbbreviationLocator(page, { name: '1Nal' }).first();

    const isExpandVisible = await ContextMenu(page, monomer).isOptionVisible(
      MonomerOnMicroOption.ExpandMonomer,
    );

    expect(isExpandVisible).toBe(false);

    await page.goto('/popup');
  });

  test('Case 4 - Other editor context menu options remain available when expand monomers is disabled', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12684
     * Description: Verify other monomer context menu options still appear when expand monomers is disabled
     * Scenario:
     * 1. Open Ketcher with ?disabledFunctionality=expandMonomers in URL
     * 2. Switch to Molecules editor mode
     * 3. Load a KET file containing monomers
     * 4. Right-click on a monomer abbreviation on the canvas
     * 5. Verify 'Edit Monomer' option is visible in context menu
     * 6. Verify 'Remove Grouping' option is visible in context menu
     *
     * Version 3.22.0
     */
    await page.goto('/popup?disabledFunctionality=expandMonomers');
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForIndigoToLoad(page);

    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/monomers-cycled.ket');

    const monomer = getAbbreviationLocator(page, { name: '1Nal' }).first();

    const isEditMonomerVisible = await ContextMenu(page, monomer).isOptionVisible(
      MonomerOnMicroOption.EditMonomer,
    );
    expect(isEditMonomerVisible).toBe(true);

    const isRemoveGroupingVisible = await ContextMenu(page, monomer).isOptionVisible(
      MonomerOnMicroOption.RemoveGrouping,
    );
    expect(isRemoveGroupingVisible).toBe(true);

    await page.goto('/popup');
  });

  test('Case 5 - Invalid disabledFunctionality value does not remove expand monomer option', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12684
     * Description: Verify that an unknown disabledFunctionality value is ignored and expand monomer remains available
     * Scenario:
     * 1. Open Ketcher with ?disabledFunctionality=unknownFeature in URL
     * 2. Switch to Molecules editor mode
     * 3. Load a KET file containing monomers
     * 4. Right-click on a monomer abbreviation on the canvas
     * 5. Verify 'Expand monomer' option is still visible in context menu
     *
     * Version 3.22.0
     */
    await page.goto('/popup?disabledFunctionality=unknownFeature');
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForIndigoToLoad(page);

    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/monomers-cycled.ket');

    const monomer = getAbbreviationLocator(page, { name: '1Nal' }).first();

    const isExpandVisible = await ContextMenu(page, monomer).isOptionVisible(
      MonomerOnMicroOption.ExpandMonomer,
    );

    expect(isExpandVisible).toBe(true);

    await page.goto('/popup');
  });
});
