import { test } from '@playwright/test';
import {
  waitForPageInit,
  selectTopPanelButton,
  TopPanelButton,
  openFile,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  pressButton,
} from '@utils';
/* eslint-disable no-magic-numbers */
test.describe('PPTX files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('open pptx file', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('PPTX/pptx-with-chem-draw.pptx', page);
    await takeEditorScreenshot(page);
    await page.getByText('Structure 2').click();
    await takeEditorScreenshot(page);
  });

  test('open empty pptx file', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('PPTX/pptx-empty.pptx', page);
    await takeEditorScreenshot(page);
  });

  test('User can import canvas with 50 big molecules from .pptx file', async ({
    page,
  }) => {
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/50 mols on 1 canvas.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with 1000 single molecules', async ({
    page,
  }) => {
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/1000 moleculs.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1000', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with lots of different types of content', async ({
    page,
  }) => {
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/BigPPT (79 molecules and many objects).pptx', page);
    });
    for (let count = 10; count <= 20; count++) {
      await waitForSpinnerFinishedWork(page, async () => {
        await page.getByText(`Structure ${count}`, { exact: true }).click();
      });
      await takeEditorScreenshot(page);
    }
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 79').click();
    });
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Arrows', async ({
    page,
  }) => {
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
    const maxTimeout = 120000;
    test.setTimeout(maxTimeout);

    const structures = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    for await (const count of structures) {
      await selectTopPanelButton(TopPanelButton.Open, page);
      await waitForSpinnerFinishedWork(page, async () => {
        await openFile('PPTX/ARROWS.pptx', page);
      });

      await waitForSpinnerFinishedWork(page, async () => {
        await page.getByText(`Structure ${count}`, { exact: true }).click();
      });
      await takeEditorScreenshot(page);
      await waitForSpinnerFinishedWork(page, async () => {
        await pressButton(page, 'Open as New Project');
      });
      //  Some times - waitForSpinnerFinishedWork doesn't wait till Spinner finished work, so I need that delay as workaround
      //  await new Promise(resolve => setTimeout(resolve, 1000));
      await takeEditorScreenshot(page);
    }
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Brackets', async ({
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
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/4071 issue.
    Uncomment code after fix and update screenshots!
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Brackets.pptx', page);
    });
    //    await waitForSpinnerFinishedWork(page, async () => {
    //      await page.getByText('Structure 1', {exact: true}).click();
    //    });
    await takeEditorScreenshot(page);
    //    await waitForSpinnerFinishedWork(page, async () => {
    //      await pressButton(page, 'Open as New Project');
    //    });
    //    await takeEditorScreenshot(page);
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Chromotography tools.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await waitForSpinnerFinishedWork(page, async () => {
        await openFile('PPTX/Geometry figures.pptx', page);
      });
      await waitForSpinnerFinishedWork(page, async () => {
        await page.getByText(`Structure ${count}`, { exact: true }).click();
      });
      await takeEditorScreenshot(page);
      await waitForSpinnerFinishedWork(page, async () => {
        await pressButton(page, 'Open as New Project');
      });
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Orbitals.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
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
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1679 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1683 issue.
    Update screenshots after fix.
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Text messages.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Pluses and minuses.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Tables.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);
  });

  test('User can import from .pptx file with CDX content containing basic ChemDraw 15.0 object: Attachment points', async ({
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await openFile('PPTX/Attachment points.pptx', page);
    });
    await waitForSpinnerFinishedWork(page, async () => {
      await page.getByText('Structure 1', { exact: true }).click();
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);
  });
});
