/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { MacroBondOption } from '@tests/pages/constants/contextMenu/Constants';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
import { delay, takeElementScreenshot } from '@utils/canvas';
import { openFileAndAddToCanvasMacro } from '@utils/index';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';

let page: Page;

test.describe('Monomer bond tool', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check that "Edit Connection Points" dialogues have their title changed to "Edit Attachment Points"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8719
     * Description: "Edit Connection Points" dialogues have their title changed to "Edit Attachment Points"
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Add macromolecule to the canvas
     * 3. Click on the Polymer Bond Tool and right-click on the bond
     *
     * Version 3.10
     */
    const bondLine = getBondLocator(page, {});
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Chromium-popup/two-nucleotides.ket',
    );
    await ContextMenu(page, bondLine).open();
    await delay(0.2);
    await takeElementScreenshot(
      page,
      ContextMenu(page, bondLine).contextMenuBody,
      { padding: 1 },
    );
  });

  test('Case 2: Check that "Edit Connection Points" dialogues have their title changed to "Edit Attachment Points" in opened context window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8719
     * Description: "Edit Connection Points" dialogues have their title changed to "Edit Attachment Points" in opened context window
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Add macromolecule to the canvas
     * 3. Click on the Polymer Bond Tool and right-click on the bond
     * 4. Open menu
     *
     * Version 3.10
     */
    const bondLine = getBondLocator(page, {});
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Chromium-popup/two-nucleotides.ket',
    );
    await ContextMenu(page, bondLine).click(
      MacroBondOption.EditAttachmentPoints,
    );
    await takeElementScreenshot(page, AttachmentPointsDialog(page).window);
  });

  test('Case 3: Check that "Select Connection Points" dialogues have their title changed to "Select Attachment Points" in opened context window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8719
     * Description: "Edit Connection Points" dialogues have their title changed to "Edit Attachment Points" in opened context window
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Add two CHEMs to the canvas
     * 3. Connect it from center to center
     *
     * Version 3.10
     */
    await openFileAndAddToCanvasMacro(page, 'KET/chems-not-connected.ket');
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await bondTwoMonomers(
      page,
      getMonomerLocator(page, Chem.Test_6_Ch),
      getMonomerLocator(page, Chem.A6OH),
    );
    await takeElementScreenshot(page, AttachmentPointsDialog(page).window);
    await AttachmentPointsDialog(page).cancel();
  });
});
