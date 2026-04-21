/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { test } from '@fixtures';
import { openFileAndAddToCanvasAsNewProject } from '@utils/files/readFile';
import {
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
} from '@utils/canvas';
import { arrangeAsARingByKeyboard } from '@utils/keyboard';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { dragMouseTo } from '@utils/index';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

let page: Page;

test.describe('Copolymer S-Group type', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Check that structure with more than one ring is formed correctly', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9761
     * Description: Check that when there are more than one chain of monomers connected to each other and they are arranged as ring structures,
     * the layout applied in a way that allows for the first structure to be fixed in its place and the rest of the monomers arranged in an n-agon in relation to it
     * Scenario:
     * 1. Go to Flex mode
     * 2. Load from file: 3-fused-rings.ket
     * 3. Select all structures on canvas
     * 4. Arrange three chains of monomers as rings via keyboard shortcut
     * 5. Check that all circular structures formed in relation to the smaller ring and
     * that when forming the second and third circular structure, the bond length stay the same as it was between the monomers in the first layouted n-agon, 1,5Å
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await openFileAndAddToCanvasAsNewProject(page, 'KET/3-fused-rings.ket');
    await selectAllStructuresOnCanvas(page);
    await arrangeAsARingByKeyboard(page);
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 800, 250);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'D' }).first(),
      { padding: 180 },
    );
  });

  test('Check that the layout applied in a way that allows for the first structure to be fixed in its place', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9761
     * Description: Check that when one circular structure is already formed and the user makes a selection
     * that includes monomers connected to it outside of the circle and also monomers that are a part the circle in order to make a bicircular structure,
     * the layout applied in a way that allows for the first structure to be fixed in its place and the rest of the monomers arranged in an n-agon in relation to it
     * This test also validates the following requirements:
     * 1. Indigo first check if part of the selection belongs to an already formed regular n-agon
     * 2. The part of the selection that already belongs to an n-agon stay fixed and the second circular structure formed in relation to it
     * 3. When forming the second circular structure, the bond length stay the same as it was between the monomers in the first layouted n-agon, 1,5Å
     * Scenario:
     * 1. Go to Flex mode
     * 2. Load from file: 3-fused-rings-preformed.ket
     * 3. Select all structures on canvas
     * 4. Arrange three chains of monomers as rings via keyboard shortcut
     * 5. Check that all circular structures formed in relation to the smaller ring and
     * that when forming the second and third circular structure, the bond length stay the same as it was between the monomers in the first layouted n-agon, 1,5Å
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/3-fused-rings-preformed.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await arrangeAsARingByKeyboard(page);
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(400, 250);
    await dragMouseTo(page, 500, 250);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'D' }).first(),
      { padding: 200 },
    );
  });
});
