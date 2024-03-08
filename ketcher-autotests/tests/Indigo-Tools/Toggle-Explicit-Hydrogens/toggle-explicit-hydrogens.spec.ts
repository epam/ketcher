/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  waitForPageInit,
  drawBenzeneRing,
  selectRing,
  RingButton,
  openFileAndAddToCanvasAsNewProject,
  screenshotBetweenUndoRedo,
} from '@utils';

test.describe('Toggle-Explicit-Hydrogens Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Empty canvas', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
  });

  test('Show and then hide hydrogens', async ({ page }) => {
    await drawBenzeneRing(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);

    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
  });

  test('(Undo/Redo)', async ({ page }) => {
    await drawBenzeneRing(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Adding hydrogens not moves molecules to center of canvas', async ({
    page,
  }) => {
    /* 
    Test case: #4128 https://github.com/epam/ketcher/issues/4128
    Description: Adding hydrogens not moves molecules to center of canvas.
    */
    const x = 200;
    const y = 200;
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(x, y);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('4. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Cases [1-7], 14, [18-20]
  Description: User can expand hydrogens for atoms and molecules with different properties
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1594 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1553 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1551 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1556 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1557 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All Special Atoms.ket',
    // All Special Atoms - https://github.com/epam/Indigo/issues/1594
    'Any Atom + charges + Simple molecules + charges.ket',
    // (NO hydrogens should be added) - our behavior is different from Marvin and BOIVIA (approved by @AlexanderSavelyev and Valentin)
    'Any Atom + Exact change Simple molecules + Exact change.ket',
    'Any Atom + Inversions Simple molecules + Inversions.ket',
    'Any Atom + Radical.ket',
    // Any Atom + Radical - https://github.com/epam/Indigo/issues/1553
    'Any Atom + Valences.ket',
    'Molecules + Alias.ket',
    'PeriodicTable.ket',
    'Simple molecules + Radical.ket',
    // Simple molecules + Radical - https://github.com/epam/Indigo/issues/1556, https://github.com/epam/Indigo/issues/1557
    'Simple molecules + Valences.ket',
    // Simple molecules + Valences - https://github.com/epam/Indigo/issues/1551
    'Simple Molecules.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Ordinary Atoms/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);

      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('5. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Cases [8-10], 12, 13, [15-17], 21, 22
  Description: User can expand hydrogens for atoms with query features set
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'Aromaticity - aromatic Aromaticity - aliphatic.ket',
    'Chirality - Anticlockwise Chirality - Clockwise.ket',
    'Connectivity.ket',
    'H count.ket',
    'Implicit H count.ket',
    'Ring bond count.ket',
    'Ring membership.ket',
    'Ring size.ket',
    'Substitution count.ket',
    'Unsaturated.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Custom Query Atoms/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);

      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('6. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Case 11
  Description: User can expand hydrogens for atoms with custom query features set
  1. Clear canvas
  2. Open from file: Custom query.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1788 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1789 issue.
  Screenshots have to be corrected after fix.
  Commented code - should be uncommented.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['Custom Query.ket'];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Custom Query Atoms/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      /*
       await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      */
    });
  }
});

test.describe('7. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Cases [23-33] 
  Description: User can expand hydrogens for atoms having Custom query feature atom on the canvas
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1553 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1594 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'Any Atom + charges + Simple molecules + charges  with Custom query feature atom on the canvas.ket',
    // ^-- NO hydrogens should be added - our behavior is different from Marvin and BOIVIA (approved by @AlexanderSavelyev and Valentin)
    'Any Atom + Exact change Simple molecules + Exact change  with Custom query feature atom on the canvas.ket',
    'Any Atom + Inversions Simple molecules + Inversions  with Custom query feature atom on the canvas.ket',
    'Any Atom + Radical  with Custom query feature atom on the canvas.ket',
    // ^-- https://github.com/epam/Indigo/issues/1553
    'Any Atom + Valences  with Custom query feature atom on the canvas.ket',
    'Molecules + Alias  with Custom query feature atom on the canvas.ket',
    'Periodic Table  with Custom query feature atom on the canvas.ket',
    'Simple Molecules  with Custom query feature atom on the canvas.ket',
    'Simple molecules + Radical  with Custom query feature atom on the canvas.ket',
    'Simple molecules + Valences  with Custom query feature atom on the canvas.ket',
    'Special Atoms  with Custom query feature atom on the canvas.ket',
    // ^-- https://github.com/epam/Indigo/issues/1594
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Ordinary Atoms with Custom query feature atom on the canvas/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);

      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('8. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Cases 34 
  Description: User can expand hydrogens for simple molecules wrapped into different types on groups
  1. Clear canvas
  2. Open from file: Ordinary Atoms - All Groups.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  Screenshots have to be corrected after fix.
  Commented code should be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['Ordinary Atoms - All Groups.ket'];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Ordinary Atoms/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      /*
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      */
    });
  }
});

test.describe('9. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3939 - Cases 35 
  Description: User can expand hydrogens for simple molecules wrapped into different types on groups with custom query feature atom presented on the canvas
  1. Clear canvas
  2. Open from file: Ordinary Atoms - All Groups - with Custom query feature atom on the canvas.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  Screenshots have to be corrected after fix.
  Commented code should be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'Ordinary Atoms - All Groups - with Custom query feature atom on the canvas.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/Atoms/Ordinary Atoms with Custom query feature atom on the canvas/${fileName}`,
        page,
      );
      await page.mouse.click(20, 20);
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      /*
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
      */
    });
  }
});
