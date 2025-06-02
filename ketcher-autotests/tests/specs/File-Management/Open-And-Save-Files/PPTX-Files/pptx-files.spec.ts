import { Page, test } from '@playwright/test';
import {
  waitForPageInit,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  openFile,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { OpenPPTXFileDialog } from '@tests/pages/molecules/OpenPPTXFileDialog';
/* eslint-disable no-magic-numbers */

async function openPPTXFileAndValidateStructurePreview(
  page: Page,
  filePath: string,
  numberOf: {
    Structure: number;
  } = { Structure: 1 },
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(filePath, page);
  });
  const openPPTXFileDialog = OpenPPTXFileDialog(page);
  if (numberOf.Structure !== 1) {
    await openPPTXFileDialog.selectStructure(structure);
  }
  await takeEditorScreenshot(page);
  await openPPTXFileDialog.pressOpenAsNewProjectButton();
}

test.describe('PPTX files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('open pptx file', async ({ page }) => {
    await CommonTopLeftToolbar(page).openFile();
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/pptx-with-chem-draw.pptx', page);
    });
    await takeEditorScreenshot(page);
    await OpenPPTXFileDialog(page).selectStructure({ Structure: 2 });
    await takeEditorScreenshot(page);
  });

  test('open empty pptx file', async ({ page }) => {
    await CommonTopLeftToolbar(page).openFile();
    await openFile('PPTX/pptx-empty.pptx', page);
    await takeEditorScreenshot(page);
  });

  test(
    'User can import canvas with 50 big molecules from .pptx file',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 1
    Description: User can import canvas with 50 big molecules from .pptx file
    Scenario:
    1. Clear canvas
    2. Load from: 50 mols on 1 canvas.pptx
    3. In appeared dialog select Structure 1
    4. Validate preview area
    5. Press Open as New Project button
    6. Validate canvas
    */
      const maxTimeout = 150000;
      test.setTimeout(maxTimeout);
      const originalTimeout = 10000;
      const longerTimeout = 30000;
      page.setDefaultTimeout(longerTimeout);

      await openPPTXFileAndValidateStructurePreview(
        page,
        'PPTX/50 mols on 1 canvas.pptx',
      );
      await takeEditorScreenshot(page);

      page.setDefaultTimeout(originalTimeout);
    },
  );

  test(
    'User can import from .pptx file with 1000 single molecules',
    {
      tag: ['@SlowTest', '@IncorrectResultBecauseOfBug'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 2
    Description: User can import from .pptx file with 1000 single molecules
    Scenario:
    1. Clear canvas
    2. Load from: 1000 moleculs.pptx
    3. In appeared dialog - Validate it has 1000 structures in list
    4. Select last structure from the list (Structure 1000)
    5. Press Open as New Project button
    6. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/4015 issue.
    */
      const maxTimeout = 150000;
      test.setTimeout(maxTimeout);

      await openPPTXFileAndValidateStructurePreview(
        page,
        'PPTX/1000 moleculs.pptx',
        {
          Structure: 1000,
        },
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'User can import from .pptx file with lots of different types of content',
    {
      tag: ['@SlowTest', '@IncorrectResultBecauseOfBug'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 3
    Description: User can import from .pptx file with lots of different types of content
    Scenario:
    1. Clear canvas
    2. Load from: BigPPT (79 molecules and many objects).pptx
    3. In appeared dialog - Validate it has 79 structures in list
    4. Navigate from 10 to 20 Structure in list and Validate every preview area
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/4015 issue.
    */
      const maxTimeout = 150000;
      test.setTimeout(maxTimeout);

      await CommonTopLeftToolbar(page).openFile();
      await waitForSpinnerFinishedWork(page, async () => {
        await openFile(
          'PPTX/BigPPT (79 molecules and many objects).pptx',
          page,
        );
      });

      for (let count = 10; count <= 20; count++) {
        await OpenPPTXFileDialog(page).selectStructure({ Structure: count });
        await takeEditorScreenshot(page);
      }
      await OpenPPTXFileDialog(page).selectStructure({ Structure: 79 });
      await takeEditorScreenshot(page);
    },
  );

  test(
    'User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Arrows @IncorrectResultBecauseOfBug',
    {
      tag: ['@SlowTest', '@IncorrectResultBecauseOfBug'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 4
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Arrows
    Scenario:
    1. Clear canvas
    2. Load from: ARROWS.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    6. Repeat for every structure (1-14)
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/4015 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1766 issue.
    Update screenshots after fix.
    */
      test.info().fixme();
      const maxTimeout = 210000;
      test.setTimeout(maxTimeout);

      const structures = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
      for await (const count of structures) {
        await openPPTXFileAndValidateStructurePreview(
          page,
          'PPTX/ARROWS.pptx',
          { Structure: count },
        );
        await takeEditorScreenshot(page);
      }
    },
  );

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Brackets @IncorrectResultBecauseOfBug', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 5
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Brackets
    Scenario:
    1. Clear canvas
    2. Load from: Brackets.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    */
    await openPPTXFileAndValidateStructurePreview(page, 'PPTX/Brackets.pptx');
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Chromotography tools', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 6
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Chromotography tools
    Scenario:
    1. Clear canvas
    2. Load from: Chromotography tools.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    */
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Chromotography tools.pptx',
    );
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Geometry figures', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 7
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Geometry figures
    Scenario:
    1. Clear canvas
    2. Load from: Geometry figures.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    Expected result: Most of figures we don't suppot and ignores
    */
    for (let count = 1; count <= 2; count++) {
      await openPPTXFileAndValidateStructurePreview(
        page,
        'PPTX/Geometry figures.pptx',
        {
          Structure: count,
        },
      );
      await takeEditorScreenshot(page);
    }
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Orbitals', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 8
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Orbitals
    Scenario:
    1. Clear canvas
    2. Load from: Orbitals.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    Expected result: No orbitals since are not support them - we simply ignore them
    */
    await openPPTXFileAndValidateStructurePreview(page, 'PPTX/Orbitals.pptx');
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Text messages', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 9
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Text messages
    Scenario:
    1. Clear canvas
    2. Load from: Text messages.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    */
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Text messages.pptx',
    );
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Pluses and minuses', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 10
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Pluses and minuses
    Scenario:
    1. Clear canvas
    2. Load from: Pluses and minuses.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    Expected result: Seems that ChemDraw's pluses and minises are simply atom modifiers - we don' support them in such way
    */
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Pluses and minuses.pptx',
    );
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Tables', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 11
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Tables
    Scenario:
    1. Clear canvas
    2. Load from: Tables.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    Expected result: We don't support tables so they are ignored
    */
    await openPPTXFileAndValidateStructurePreview(page, 'PPTX/Tables.pptx');
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Attachment points @IncorrectResultBecauseOfBug', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4016 - Test case 12
    Description: User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Attachment points
    Scenario:
    1. Clear canvas
    2. Load from: Attachment points.pptx
    3. In appeared dialog - Validate Preview area
    4. Press Open as New Project button
    5. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1725 issue.
    Update screenshots after fix.
    */
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Attachment points.pptx',
    );
    await takeEditorScreenshot(page);
  });
});
