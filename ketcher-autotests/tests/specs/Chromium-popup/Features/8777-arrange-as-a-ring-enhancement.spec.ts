/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Page, test, expect } from '@fixtures';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { dragMouseTo, selectAllStructuresOnCanvas } from '@utils';
import {
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
} from '@utils/files/readFile';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getArrowLocator } from '@utils/canvas/arrow-signes/getArrowLocator';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;

test.describe('Change the logic for activation of Arrange as a Ring tool and context menu item', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Verify Arrange as a Ring tool and context menu item unavailability for no circular structure in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for no circular structure in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load non-circular structure (chain without circular connections)
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load a linear chain without circular structure
    await openFileAndAddToCanvasMacro(
      page,
      'KET/amino-acids-for-modification.ket',
    );
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'A' });
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });

  test('Case 2 - Verify Arrange as a Ring tool and context menu item availability for one circular structure in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item availability for one circular structure in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load single circular structure (3+ monomers connected in circle)
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is enabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is enabled in context menu
     *
     * Version 3.12.0
     */
    // Load circular structure with 3 connected monomers
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-sugar-connected-to-each-other.ket',
    );
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is enabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeEnabled();

    // Verify context menu option is enabled
    const firstMonomer = getMonomerLocator(page, Sugar._12ddR).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeTruthy();
  });

  test('Case 3 - Verify Arrange as a Ring tool and context menu item availability for two circular structures in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item availability for two circular structures in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Create/Load structure with two separate circular structures
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is enabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is enabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with multiple circular components using HELM
    await openFileAndAddToCanvasAsNewProject(page, 'KET/2-fused-rings.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 250);
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is enabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeEnabled();

    // Verify context menu option is enabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'D' }).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeTruthy();
  });

  test('Case 4 - Verify Arrange as a Ring tool and context menu item availability for three circular structures in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item availability for three circular structures in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Create/Load structure with three separate circular structures
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is enabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is enabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with three circular components using HELM
    await openFileAndAddToCanvasAsNewProject(page, 'KET/3-fused-rings.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 250);
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is enabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeEnabled();

    // Verify context menu option is enabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'D' }).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeTruthy();
  });

  test('Case 5 - Verify Arrange as a Ring tool and context menu item unavailability for one circular structure and small molecule connected to chain in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for one circular structure and small molecule connected to chain in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load structure with circular component and small molecule connected to the chain
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with circular component and connected small molecules
    await openFileAndAddToCanvasMacro(page, 'KET/rna-with-small-molecules.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 250);
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'R' }).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });

  test('Case 6 - Verify Arrange as a Ring tool and context menu item unavailability for one circular structure and small molecule NOT connected to chain in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for one circular structure and small molecule NOT connected to chain in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load structure with circular component and standalone small molecule
     * 3. Select all structures including the standalone small molecule
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // First load circular structure
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-sugar-connected-to-each-other.ket',
    );

    // Add standalone small molecules
    await openFileAndAddToCanvasMacro(
      page,
      'KET/two-standalone-small-molecules.ket',
    );
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled when small molecules are included
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, Sugar._12ddR).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });

  test('Case 7 - Verify Arrange as a Ring tool and context menu item unavailability for one circular structure and plus/arrow in the selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for one circular structure and plus/arrow in the selection
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load structure with circular component and reaction arrow/plus
     * 3. Select all structures including arrow/plus
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with circular component and reaction elements
    await openFileAndAddToCanvasMacro(page, 'KET/circular-and-plus.ket');
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled when reaction elements are included
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'A' });
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });

  test('Case 8 - Verify Arrange as a Ring tool and context menu item unavailability for plus/arrow in the selection only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for plus/arrow in the selection only
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load structure with only reaction arrow/plus elements
     * 3. Select arrow/plus elements
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with only reaction elements (no monomers)
    await openFileAndAddToCanvasMacro(
      page,
      'KET/multi-tailed-arrow-2-tails-1.ket',
    );
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const arrow = getArrowLocator(page, { arrowId: 0 });
    await expect(
      ContextMenu(page, arrow).isOptionEnabled(MonomerOption.ArrangeAsARing),
    ).resolves.toBeFalsy();
  });

  test('Case 9 - Verify Arrange as a Ring tool and context menu item unavailability for small molecule in the selection only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for small molecule in the selection only
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load structure with only small molecules
     * 3. Select small molecules
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load structure with only small molecules
    await openFileAndAddToCanvasMacro(page, 'KET/benzene-ring.ket');
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const molecule = getAtomLocator(page, { atomId: 0 });
    await expect(
      ContextMenu(page, molecule).isOptionEnabled(MonomerOption.ArrangeAsARing),
    ).resolves.toBeFalsy();
  });

  test('Case 10 - Verify Arrange as a Ring tool and context menu item unavailability for chain without circular structure and small molecule connected to chain in the selection only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for chain without circular structure and small molecule connected to chain in the selection only
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load linear chain structure with connected small molecules
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load linear chain with connected small molecules
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-to-small-molecules-in-different-rows.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 350);
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'C' }).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });

  test('Case 11 - Verify Arrange as a Ring tool and context menu item unavailability for chain without circular structure and small molecule NOT connected to chain in the selection only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10015
     * Description: Verify 'Arrange as a Ring' tool and context menu item unavailability for chain without circular structure and small molecule NOT connected to chain in the selection only
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load linear chain structure with separate small molecules
     * 3. Select all structures
     * 4. Verify that 'Arrange as a Ring' button is disabled in toolbar
     * 5. Verify that 'Arrange as a Ring' option is disabled in context menu
     *
     * Version 3.12.0
     */
    // Load linear chain structure first
    await openFileAndAddToCanvasMacro(
      page,
      'KET/rna-sequence-without-small-molecules.ket',
    );

    // Add separate small molecules
    await openFileAndAddToCanvasMacro(
      page,
      'KET/two-standalone-small-molecules.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 250);
    await selectAllStructuresOnCanvas(page);

    // Verify toolbar button is disabled
    await expect(
      MacromoleculesTopToolbar(page).arrangeAsRingButton,
    ).toBeDisabled();

    // Verify context menu option is disabled
    const firstMonomer = getMonomerLocator(page, { monomerAlias: 'R' }).first();
    await expect(
      ContextMenu(page, firstMonomer).isOptionEnabled(
        MonomerOption.ArrangeAsARing,
      ),
    ).resolves.toBeFalsy();
  });
});
