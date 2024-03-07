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
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
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
