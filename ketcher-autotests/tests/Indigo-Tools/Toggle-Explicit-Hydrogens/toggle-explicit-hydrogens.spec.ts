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

  test(
    'Validate that the schema with retrosynthetic arrow after clicking on Explicit hysrogens tool',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2318
    After fix we need update file and screenshot.
     */
      await openFileAndAddToCanvasAsNewProject(
        'KET/schema-with-retrosynthetic-arrow-for-options.ket',
        page,
      );
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        );
      });
      await takeEditorScreenshot(page);
    },
  );
});

test.describe('1. Molecules connected ', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3959 - Case [1-21]
  Description: User can expand hydrogens for molecules connected by ordinary type of bonds
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All types of bond - Chain topology - Center reaction center.ket',
    'All types of bond - Chain topology - Made broken and changes reaction center.ket',
    'All types of bond - Chain topology - Made broken reaction center.ket',
    'All types of bond - Chain topology - No change reaction center.ket',
    'All types of bond - Chain topology - Not center reaction center.ket',
    'All types of bond - Chain topology - Order changes reaction center.ket',
    'All types of bond - Chain topology.ket',
    'All types of bond - Either topology - Center reaction center.ket',
    'All types of bond - Either topology - Mad-broken reaction center.ket',
    'All types of bond - Either topology - Made-Broken and changes reaction center.ket',
    'All types of bond - Either topology - No change reaction center.ket',
    'All types of bond - Either topology - Not center reaction center.ket',
    'All types of bond - Either topology - Order changes reaction center.ket',
    'All types of bond - Ring topology - Center reaction center.ket',
    'All types of bond - Ring topology - Made-Broken and changes reaction center.ket',
    'All types of bond - Ring topology - Made-broken reaction center.ket',
    'All types of bond - Ring topology - No change reaction center.ket',
    'All types of bond - Ring topology - Not center reaction center.ket',
    'All types of bond - Ring topology - Order changes reaction center.ket',
    'All types of bond - Ring topology.ket',
    'All types of bond.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/${fileName}`,
        page,
      );
      await page.mouse.click(200, 200);
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

test.describe('2. Molecules connected ', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3959 - Case 23
  Description: User can expand hydrogens for molecules connected by custom query bonds
  1. Clear canvas
  2. Open from file: All Custom Query Bonds.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1622 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1623 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['All Custom Query Bonds.ket'];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Custom Query Bonds/${fileName}`,
        page,
      );
      await page.mouse.click(200, 200);
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

test.describe('3. Molecules connected ', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/3959 - Case [22-43]
  Description: User can expand hydrogens for molecules connected by custom query bonds
  1. Clear canvas
  2. Open from file: All Custom Query Bonds.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas

  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All types of bond with Query feature atom on the canvas - Chain topology - Center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology - Made broken and changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology - Made broken reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology - No change reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology - Not center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology - Order changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Chain topology.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - Center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - Made-Broken and changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - Made-broken reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - No change reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - Not center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Either topology - Order changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - Center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - Made-Broken and changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - Made-broken reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - No change reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - Not center reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology - Order changes reaction center.ket',
    'All types of bond with Query feature atom on the canvas - Ring topology.ket',
    'All types of bond with Query feature atom on the canvas.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/All types of bond with Query feature atom on the canvas/${fileName}`,
        page,
      );
      await page.mouse.click(200, 200);
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

  const fileNames = ['Custom Query1.ket'];

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

test.describe('10. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 44-50, 53-56
  Description: User can expand hydrogens for molecules connected by different custom query bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1579 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1793 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1795 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1621 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3977 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All Custom Query Bonds connected with R-group labels.ket',
    'All Custom Query Bonds in one R-group.ket',
    // ^-- https://github.com/epam/Indigo/issues/1793
    'All Custom Query Bonds in R-group each.ket',
    'All Custom Query Bonds with Connection points.ket',
    // ^-- https://github.com/epam/Indigo/issues/1795, https://github.com/epam/Indigo/issues/1621
    'All Custom Query Bonds with S-Group - Data - Absolute.ket',
    'All Custom Query Bonds with S-Group - Data - Attached.ket',
    'All Custom Query Bonds with S-Group - Data - Relative.ket',
    // ^-- https://github.com/epam/ketcher/issues/3977
    'All Custom Query Bonds with S-Group - SRU Polymer - Either Unknown.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All Custom Query Bonds with S-Group - SRU Polymer - Head-to-head.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All Custom Query Bonds with S-Group - SRU Polymer - Head-to-tail.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All Custom Query Bonds with S-Group - Superatom.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Custom Query Bonds/Groups/${fileName}`,
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

test.describe('11. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Case 51
  Description: User can expand hydrogens for molecules connected by different custom query bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: All Custom Query Bonds with S-Group - Multiple group.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  Screenshots have to be corrected after fix.
  Commented code have to be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All Custom Query Bonds with S-Group - Multiple group.ket',
    // ^-- IMPORTANT: Result of execution is incorrect because of  https://github.com/epam/Indigo/issues/1626 issue.
  ];

  for (const fileName of fileNames) {
    test(
      `by ${fileName}`,
      {
        tag: ['@SlowTest', '@IncorrectResultBecauseOfBug'],
      },
      async ({ page }) => {
        test.slow();
        await openFileAndAddToCanvasAsNewProject(
          `KET/Toggle-Explicit-Hydrogens/All types of bond/Custom Query Bonds/Groups/${fileName}`,
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
      },
    );
  }
});

test.describe('12. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 52
  Description: User can expand hydrogens for molecules connected by different custom query bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: All Custom Query Bonds with S-Group - Query component.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1625 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1794 issue.
  Screenshots have to be corrected after fix.
  Commented code have to be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All Custom Query Bonds with S-Group - Query component.ket',
    // ^-- https://github.com/epam/Indigo/issues/1794, https://github.com/epam/Indigo/issues/1625
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Custom Query Bonds/Groups/${fileName}`,
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

test.describe('13. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 57-62, 65-74, 77-80
  Description: User can expand hydrogens for molecules connected by different ordinary bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1579 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1793 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1795 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1621 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3977 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All types of bond - Either topology - Unmarked - R-Group fragmens - Attachment points.ket',
    'All types of bond - Either topology - Unmarked - R-Group fragmens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1793
    'All types of bond - Either topology - Unmarked - R-Group labels.ket',
    'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
    // ^-- https://github.com/epam/ketcher/issues/3977
    'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Attached.ket',
    'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Relative.ket',
    // ^-- https://github.com/epam/ketcher/issues/3977
    'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All types of bond - Either topology - Unmarked - S-Group - Superatom.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All types of bond - Ring topology - Unmarked - R-Group fragmens - Attachment points.ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - R-Group fragmens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1793
    'All types of bond - Ring topology - Unmarked - R-Group labels.ket',
    // ^-- https://github.com/epam/Indigo/issues/1793, https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
    // ^-- https://github.com/epam/ketcher/issues/3977, https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Attached.ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Relative.ket',
    // ^-- https://github.com/epam/ketcher/issues/3977
    'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976, https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976, https://github.com/epam/Indigo/issues/1611
    'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976
    'All types of bond - Ring topology - Unmarked - S-Group - Superatom.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976, https://github.com/epam/Indigo/issues/1611
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/Groups/${fileName}`,
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
      // await takeEditorScreenshot(page);
    });
  }
});

test.describe('14. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 63, 75
  Description: User can expand hydrogens for molecules connected by different bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: All types of bond - [Either|Ring] topology - Unmarked - S-Group - Multipal group.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  Screenshots have to be corrected after fix.
  Commented code have to be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All types of bond - Either topology - Unmarked - S-Group - Multipal group.ket',
    // ^-- https://github.com/epam/ketcher/issues/3976, https://github.com/epam/Indigo/issues/1626
    'All types of bond - Ring topology - Unmarked - S-Group - Multipal group.ket',
    // ^-- https://github.com/epam/Indigo/issues/1626
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/Groups/${fileName}`,
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

test.describe('15. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 64, 76
  Description: User can expand hydrogens for molecules connected by different bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: All types of bond - [Either|Ring] topology - Unmarked - S-Group - Query component.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1625 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1794 issue.
  Screenshots have to be corrected after fix.
  Commented code have to be uncommented
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All types of bond - Either topology - Unmarked - S-Group - Query component.ket',
    // ^-- https://github.com/epam/Indigo/issues/1794, https://github.com/epam/Indigo/issues/1625
    'All types of bond - Ring topology - Unmarked - S-Group - Query component.ket',
    // ^-- https://github.com/epam/Indigo/issues/1794, https://github.com/epam/Indigo/issues/1625
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/Groups/${fileName}`,
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

test.describe('16. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 81-86, 89-98, 100-104
  Description: User can expand hydrogens for molecules connected by different bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: ${fileName}
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1579 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1793 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1795 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1621 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3977 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/3976 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1535 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'Bonds with QFA on the canvas - Either topology - Unmarked - R-Group fragmens - At.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - R-Group fragmens.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - R-Group labels.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Attached.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Relative.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Superatom.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - R-Group fragmens - Attachment points.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - R-Group fragmens.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - R-Group labels.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Attached.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Relative.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Superatom.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/Groups/Groups with Query feature atom on the canvas/${fileName}`,
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

test.describe('17. Fold/unfold hydrogens for', () => {
  /* 
  Test case: https://github.com/epam/ketcher/issues/4018 - Cases 87,88, 99,100
  Description: User can expand hydrogens for molecules connected by different bonds wrapped into different types on groups
  1. Clear canvas
  2. Open from file: All types of bond - [Either|Ring] topology - Unmarked - S-Group - Query component.ket
  3. Press Add/Remove explicit hydrogens button
  4. Validate canvas
  5. Press Add/Remove explicit hydrogens button
  6. Validate canvas
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1625 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1794 issue.
  IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1626 issue.
  Screenshots have to be corrected after fix.
  */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Multipal group.ket',
    // ^-- https://github.com/epam/Indigo/issues/1626, https://github.com/epam/Indigo/issues/1794
    'Bonds with QFA on the canvas - Either topology - Unmarked - S-Group - Query component.ket',
    // ^-- https://github.com/epam/Indigo/issues/1625, https://github.com/epam/Indigo/issues/1794
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Multipal group.ket',
    // ^-- https://github.com/epam/Indigo/issues/1626, https://github.com/epam/Indigo/issues/1794
    'Bonds with QFA on the canvas - Ring topology - Unmarked - S-Group - Query component.ket',
    // ^-- https://github.com/epam/Indigo/issues/1625, https://github.com/epam/Indigo/issues/1794
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens/All types of bond/Ordinary Bonds/Groups/Groups with Query feature atom on the canvas/${fileName}`,
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
