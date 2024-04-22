/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  openFileAndAddToCanvasAsNewProject,
  selectClearCanvasTool,
  waitForPageInit,
} from '@utils';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const sharedContext = await browser.newContext();

  // Reminder: do not pass page as async paramenter to test
  page = await sharedContext.newPage();
  await waitForPageInit(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  browser.close();
});

test.describe('1. User can expand hydrogens for ', () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4258 - Case 1
    Description: User can expand hydrogens for molecules connected by ordinary type of bonds
    1. Clear canvas
    2. Open from file: ${fileName}
    3. Press Add/Remove explicit hydrogens button
    4. Validate canvas
    5. Press Add/Remove explicit hydrogens button
    6. Validate canvas
  
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1818 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1819 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1832 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1833 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1834 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1835 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1836 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1837 issue.
    Screenshots have to be corrected after fix.
    */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  // The reason of tests failing will be investigated after release 2.21.0-rc.1
  const temporaryFailedTestsFileNames = [
    'Aromatic/Aromatic (Ring Topology) - Five hydrogens.ket',
    'Aromatic/Aromatic (Ring Topology) - Four hydrogens.ket',
    'Aromatic/Aromatic (Ring Topology) - Three hydrogens.ket',
    'Dative/Dative - Five hydrogens (c5).ket',
    'Dative/Dative - Four hydrogens (C).ket',
    'Dative/Dative - Six hydrogens (c6).ket',
    'Dative/Dative - Three hydrogens (N).ket',
    'Double/Double (Ring Topology) - Four hydrogens.ket',
    'Double/Double (Ring Topology) - Three hydrogens.ket',
    'Double/Double - Four hydrogens.ket',
    'Double/Double - Three hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Three hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans - Three hydrogens.ket',
    'Hydrogen/Hydrogen - Five hydrogens (C5).ket',
    'Hydrogen/Hydrogen - Four hydrogens (Ge).ket',
    'Hydrogen/Hydrogen - Six hydrogens (C6).ket',
    'Hydrogen/Hydrogen - Three hydrogens (N).ket',
    'Single/Single (Ring Topology) - Five hydrogens (S).ket',
    'Single/Single (Ring Topology) - Four hydrogens (S).ket',
    'Single/Single (Ring Topology) - Three hydrogens (S).ket',
    'Single/Single - Five hydrogens (S).ket',
    'Single/Single - Four hydrogens (S).ket',
    'Single/Single - Three hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - Five hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - Four hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - Three hydrogens (S).ket',
    'Single Down/Single Down - Five hydrogens (S).ket',
    'Single Down/Single Down - Four hydrogens (S).ket',
    'Single Down/Single Down - Three hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - Five hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - Four hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - Three hydrogens (S).ket',
    'Single Up/Single Up - Five hydrogens (S).ket',
    'Single Up/Single Up - Four hydrogens (S).ket',
    'Single Up/Single Up - Three hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Five hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Four hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Three hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - Five hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - Four hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - Three hydrogens (S).ket',
  ];

  const fileNames = [
    'Any/Any (Ring Topology) - Any Valenece Atom (Any Atom).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Eight Valenece Atom (c8).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Five Valenece Atom (c5).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Four Valenece Atom.ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - One Valenece Atom (Cl).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Seven Valenece Atom (c7).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Six Valenece Atom (c6).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Three Valenece Atom (N).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any (Ring Topology) - Two Valenece Atom (O).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Any/Any - Any Valenece Atom (Any Atom).ket',
    'Any/Any - Eight Valenece Atom (c8).ket',
    'Any/Any - Five Valenece Atom (c5).ket',
    'Any/Any - Four Valenece Atom.ket',
    'Any/Any - One Valenece Atom (Cl).ket',
    'Any/Any - Seven Valenece Atom (c7).ket',
    'Any/Any - Six Valenece Atom (c6).ket',
    'Any/Any - Three Valenece Atom (N).ket',
    'Any/Any - Two Valenece Atom (O).ket',
    'Aromatic/Aromatic (Ring Topology) - Five hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1819
    'Aromatic/Aromatic (Ring Topology) - Four hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1819
    'Aromatic/Aromatic (Ring Topology) - One hydrogens (Ge).ket',
    // ^-- https://github.com/epam/Indigo/issues/1818
    'Aromatic/Aromatic (Ring Topology) - Three hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1819
    'Aromatic/Aromatic (Ring Topology) - Two hydrogens.ket',
    'Aromatic/Aromatic (Ring Topology) - Zero hydrogens (Any Atom).ket',
    // ^-- https://github.com/epam/Indigo/issues/1611
    'Aromatic/Aromatic (Ring Topology) - Zero hydrogens.ket',
    'Aromatic/Aromatic - Five hydrogens.ket',
    'Aromatic/Aromatic - Four hydrogens.ket',
    'Aromatic/Aromatic - One hydrogens (Ge).ket',
    // ^-- https://github.com/epam/Indigo/issues/1818
    'Aromatic/Aromatic - Three hydrogens.ket',
    'Aromatic/Aromatic - Two hydrogens.ket',
    'Aromatic/Aromatic - Zero hydrogens (Any Atom).ket',
    'Aromatic/Aromatic - Zero hydrogens.ket',
    'Custom/Custom - Zero hydrogens (Any Atom).ket',
    'Custom/Custom - Zero hydrogens (S).ket',
    'Dative/Dative (Ring Topology) - Eight hydrogens (c7).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Five hydrogens (c5).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Four hydrogens (C).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - One hydrogens (He).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Seven hydrogens (c7).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Six hydrogens (c6).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Three hydrogens (N).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Two hydrogens (O).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Dative/Dative (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Dative/Dative (Ring Topology) - Zero hydrogens (He).ket',
    // 'Dative/Dative - Eight hydrogens (c7).ket',
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    'Dative/Dative - Five hydrogens (c5).ket',
    'Dative/Dative - Four hydrogens (C).ket',
    'Dative/Dative - One hydrogens (He).ket',
    // 'Dative/Dative - Seven hydrogens (c7).ket',
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    'Dative/Dative - Six hydrogens (c6).ket',
    'Dative/Dative - Three hydrogens (N).ket',
    'Dative/Dative - Two hydrogens (O).ket',
    'Dative/Dative - Zero hydrogens (Any Atom).ket',
    'Dative/Dative - Zero hydrogens (He).ket',
    'Double/Double (Ring Topology) - Four hydrogens.ket',
    'Double/Double (Ring Topology) - One hydrogens.ket',
    'Double/Double (Ring Topology) - Three hydrogens.ket',
    'Double/Double (Ring Topology) - Two hydrogens.ket',
    'Double/Double (Ring Topology) - Zero hydrogens (1).ket',
    'Double/Double (Ring Topology) - Zero hydrogens.ket',
    'Double/Double - Four hydrogens.ket',
    'Double/Double - One hydrogens.ket',
    'Double/Double - Three hydrogens.ket',
    'Double/Double - Two hydrogens.ket',
    'Double/Double - Zero hydrogens (Any atom).ket',
    'Double/Double - Zero hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - One hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Three hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Two hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Zero hydrogens (Any atom).ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Zero hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans - One hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans - Three hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans - Two hydrogens.ket',
    'Double CIS-Trans/Double CIS-Trans - Zero hydrogens (Any atom).ket',
    'Double CIS-Trans/Double CIS-Trans - Zero hydrogens.ket',
    'Double-Aromatic/Double-Aromatic (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Double-Aromatic/Double-Aromatic (Ring Topology) - Zero hydrogens (C).ket',
    'Double-Aromatic/Double-Aromatic - Zero hydrogens (Any Atom).ket',
    'Double-Aromatic/Double-Aromatic - Zero hydrogens (C).ket',
    'Hydrogen/Hydrogen (Ring Topology) - Eight hydrogens (C8).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Five hydrogens (C5).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Four hydrogens (Ge).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - One hydrogens (Br).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Seven hydrogens (C7).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Six hydrogens (C6).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Three hydrogens (N).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Two hydrogens (O).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    'Hydrogen/Hydrogen (Ring Topology) - Zero hydrogens (Any Atom).ket',
    // ^-- https://github.com/epam/Indigo/issues/1832
    // 'Hydrogen/Hydrogen - Eight hydrogens (C8).ket',
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    'Hydrogen/Hydrogen - Five hydrogens (C5).ket',
    'Hydrogen/Hydrogen - Four hydrogens (Ge).ket',
    'Hydrogen/Hydrogen - One hydrogens (Br).ket',
    // 'Hydrogen/Hydrogen - Seven hydrogens (C7).ket',
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    'Hydrogen/Hydrogen - Six hydrogens (C6).ket',
    'Hydrogen/Hydrogen - Three hydrogens (N).ket',
    'Hydrogen/Hydrogen - Two hydrogens (O).ket',
    'Hydrogen/Hydrogen - Zero hydrogens (Any Atom).ket',
    'Single/Single (Ring Topology) - Five hydrogens (S).ket',
    'Single/Single (Ring Topology) - Four hydrogens (S).ket',
    'Single/Single (Ring Topology) - One hydrogens.ket',
    'Single/Single (Ring Topology) - Three hydrogens (S).ket',
    'Single/Single (Ring Topology) - Two hydrogens (C).ket',
    'Single/Single (Ring Topology) - Two hydrogens (Ge).ket',
    'Single/Single (Ring Topology) - Zero hydrogens  (Any Atom).ket',
    'Single/Single (Ring Topology) - Zero hydrogens.ket',
    'Single/Single - Five hydrogens (S).ket',
    // ^-- https://github.com/epam/Indigo/issues/1833
    'Single/Single - Four hydrogens (S).ket',
    'Single/Single - One hydrogens.ket',
    'Single/Single - Three hydrogens (S).ket',
    // ^-- https://github.com/epam/Indigo/issues/1833
    'Single/Single - Two hydrogens (C).ket',
    'Single/Single - Two hydrogens (Ge).ket',
    'Single/Single - Zero hydrogens  (Any Atom).ket',
    'Single/Single - Zero hydrogens.ket',
    'Single Down/Single Down (Ring Topology) - Five hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - Four hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Down/Single Down (Ring Topology) - Three hydrogens (S).ket',
    'Single Down/Single Down (Ring Topology) - Two hydrogens (Ge).ket',
    'Single Down/Single Down (Ring Topology) - Zero hydrogens  (Any Atom).ket',
    'Single Down/Single Down (Ring Topology) - Zero hydrogens.ket',
    'Single Down/Single Down - Five hydrogens (S).ket',
    'Single Down/Single Down - Four hydrogens (S).ket',
    'Single Down/Single Down - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Down/Single Down - Three hydrogens (S).ket',
    'Single Down/Single Down - Two hydrogens (Ge).ket',
    'Single Down/Single Down - Zero hydrogens  (Any Atom).ket',
    'Single Down/Single Down - Zero hydrogens.ket',
    'Single Up/Single Up (Ring Topology) - Five hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - Four hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Up/Single Up (Ring Topology) - Three hydrogens (S).ket',
    'Single Up/Single Up (Ring Topology) - Two hydrogens (Ge).ket',
    'Single Up/Single Up (Ring Topology) - Zero hydrogens  (Any Atom).ket',
    'Single Up/Single Up (Ring Topology) - Zero hydrogens.ket',
    'Single Up/Single Up - Five hydrogens (S).ket',
    'Single Up/Single Up - Four hydrogens (S).ket',
    'Single Up/Single Up - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Up/Single Up - Three hydrogens (S).ket',
    'Single Up/Single Up - Two hydrogens (Ge).ket',
    'Single Up/Single Up - Zero hydrogens  (Any Atom).ket',
    'Single Up/Single Up - Zero hydrogens.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Five hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Four hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Up-Down/Single Up-Down (Ring Topology) - Three hydrogens (S).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Two hydrogens (Ge).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Zero hydrogens.ket',
    'Single Up-Down/Single Up-Down - Five hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - Four hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1836, https://github.com/epam/Indigo/issues/1837
    'Single Up-Down/Single Up-Down - Three hydrogens (S).ket',
    'Single Up-Down/Single Up-Down - Two hydrogens (Ge).ket',
    'Single Up-Down/Single Up-Down - Zero hydrogens (Any Atom).ket',
    'Single Up-Down/Single Up-Down - Zero hydrogens.ket',
    'Single-Aromatic/Single-Aromatic (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Single-Aromatic/Single-Aromatic (Ring Topology) - Zero hydrogens (C).ket',
    'Single-Aromatic/Single-Aromatic - Zero hydrogens (Any Atom).ket',
    'Single-Aromatic/Single-Aromatic - Zero hydrogens (C).ket',
    'Single-Double/Single-Double (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Single-Double/Single-Double (Ring Topology) - Zero hydrogens (C).ket',
    'Single-Double/Single-Double - Zero hydrogens (Any Atom).ket',
    'Single-Double/Single-Double - Zero hydrogens (C).ket',
    'Triple/Triple (Ring Topology) - One hydrogens.ket',
    'Triple/Triple (Ring Topology) - Two hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1834
    'Triple/Triple (Ring Topology) - Zero hydrogens (Any Atom).ket',
    'Triple/Triple (Ring Topology) - Zero hydrogens (S).ket',
    'Triple/Triple - One hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1833
    'Triple/Triple - Two hydrogens.ket',
    // ^-- https://github.com/epam/Indigo/issues/1834, https://github.com/epam/Indigo/issues/1833
    'Triple/Triple - Zero hydrogens (Any Atom).ket',
    'Triple/Triple - Zero hydrogens (S).ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      if (temporaryFailedTestsFileNames.includes(fileName)) {
        test.fail();
      }

      test.setTimeout(120000);
      // Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens-With-Respect-To-Selected-Atoms/All types of bond/${fileName}`,
        page,
      );
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

test.describe('2. User can expand hydrogens for ', () => {
  /* 
      Test case: https://github.com/epam/ketcher/issues/4258 - Case 1
      Description: User can (having atomatic atom on the canvas) expand hydrogens for molecules connected by ordinary type of bonds
      1. Clear canvas
      2. Open from file: ${fileName}
      3. Press Add/Remove explicit hydrogens button
      4. Validate canvas
      5. Press Add/Remove explicit hydrogens button
      6. Validate canvas
    
      Note: Cases with atomatic atom on the canvas needed because we process canvas in different way (by another code) if it has query something on the canvas

      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1818 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1819 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1611 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1832 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1833 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1834 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1835 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1836 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1837 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1838 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1627 issue.
      IMPORTANT: Test results are not correct because of https://github.com/epam/Indigo/issues/1627 issue.
      Screenshots have to be corrected after fix.
      */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  // The reason of tests failing will be investigated after release 2.21.0-rc.1
  const temporaryFailedTestsFileNames = [
    'Aromatic/Aromatic (Ring Topology) - Five hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Four hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Three hydrogens+A.ket',
    'Aromatic/Aromatic - Five hydrogens+A.ket',
    'Aromatic/Aromatic - Four hydrogens+A.ket',
    'Aromatic/Aromatic - Three hydrogens+A.ket',
    'Double/Double (Ring Topology) - Four hydrogens+A.ket',
    'Double/Double (Ring Topology) - Three hydrogens+A.ket',
    'Double/Double - Four hydrogens+A.ket',
    'Double/Double - Three hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Three hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans - Three hydrogens+A.ket',
    'Single/Single (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single/Single (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single/Single (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single/Single - Five hydrogens (S)+A.ket',
    'Single/Single - Four hydrogens (S)+A.ket',
    'Single/Single - Three hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Down/Single Down - Five hydrogens (S)+A.ket',
    'Single Down/Single Down - Four hydrogens (S)+A.ket',
    'Single Down/Single Down - Three hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Up/Single Up - Five hydrogens (S)+A.ket',
    'Single Up/Single Up - Four hydrogens (S)+A.ket',
    'Single Up/Single Up - Three hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - Five hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - Four hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - Three hydrogens (S)+A.ket',
  ];

  const fileNames = [
    'Any/Any (Ring Topology) - Any Valenece Atom (Any Atom)+A.ket',
    'Any/Any (Ring Topology) - Eight Valenece Atom (c8)+A.ket',
    'Any/Any (Ring Topology) - Five Valenece Atom (c5)+A.ket',
    'Any/Any (Ring Topology) - Four Valenece Atom+A.ket',
    'Any/Any (Ring Topology) - One Valenece Atom (Cl)+A.ket',
    'Any/Any (Ring Topology) - Seven Valenece Atom (c7)+A.ket',
    'Any/Any (Ring Topology) - Six Valenece Atom (c6)+A.ket',
    'Any/Any (Ring Topology) - Three Valenece Atom (N)+A.ket',
    'Any/Any (Ring Topology) - Two Valenece Atom (O)+A.ket',
    'Any/Any - Any Valenece Atom (Any Atom)+A.ket',
    'Any/Any - Eight Valenece Atom (c8)+A.ket',
    'Any/Any - Five Valenece Atom (c5)+A.ket',
    'Any/Any - Four Valenece Atom+A.ket',
    'Any/Any - One Valenece Atom (Cl)+A.ket',
    'Any/Any - Seven Valenece Atom (c7)+A.ket',
    'Any/Any - Six Valenece Atom (c6)+A.ket',
    'Any/Any - Three Valenece Atom (N)+A.ket',
    'Any/Any - Two Valenece Atom (O)+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Five hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Four hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - One hydrogens (Ge)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1818
    'Aromatic/Aromatic (Ring Topology) - Three hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Two hydrogens+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Aromatic/Aromatic (Ring Topology) - Zero hydrogens+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1838
    'Aromatic/Aromatic - Five hydrogens+A.ket',
    'Aromatic/Aromatic - Four hydrogens+A.ket',
    'Aromatic/Aromatic - One hydrogens (Ge)+A.ket',
    'Aromatic/Aromatic - Three hydrogens+A.ket',
    'Aromatic/Aromatic - Two hydrogens+A.ket',
    'Aromatic/Aromatic - Zero hydrogens (Any Atom)+A.ket',
    'Aromatic/Aromatic - Zero hydrogens+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1838
    'Custom/Custom - Zero hydrogens (Any Atom)+A.ket',
    'Custom/Custom - Zero hydrogens (S)+A.ket',
    'Dative/Dative (Ring Topology) - Eight hydrogens (c7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Five hydrogens (c5)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Four hydrogens (C)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - One hydrogens (He)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Seven hydrogens (c7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Six hydrogens (c6)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Three hydrogens (N)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Two hydrogens (O)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Dative/Dative (Ring Topology) - Zero hydrogens (He)+A.ket',
    // 'Dative/Dative - Eight hydrogens (c7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    // 'Dative/Dative - Five hydrogens (c5)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    // ^-- Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
    'Dative/Dative - Four hydrogens (C)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - One hydrogens (He)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - Seven hydrogens (c7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - Six hydrogens (c6)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - Three hydrogens (N)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - Two hydrogens (O)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Dative/Dative - Zero hydrogens (Any Atom)+A.ket',
    'Dative/Dative - Zero hydrogens (He)+A.ket',
    'Double/Double (Ring Topology) - Four hydrogens+A.ket',
    'Double/Double (Ring Topology) - One hydrogens+A.ket',
    'Double/Double (Ring Topology) - Three hydrogens+A.ket',
    'Double/Double (Ring Topology) - Two hydrogens+A.ket',
    'Double/Double (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Double/Double (Ring Topology) - Zero hydrogens+A.ket',
    'Double/Double - Four hydrogens+A.ket',
    'Double/Double - One hydrogens+A.ket',
    'Double/Double - Three hydrogens+A.ket',
    'Double/Double - Two hydrogens+A.ket',
    'Double/Double - Zero hydrogens (Any atom)+A.ket',
    'Double/Double - Zero hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - One hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Three hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Two hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Zero hydrogens (Any atom)+A.ket',
    'Double CIS-Trans/Double CIS-Trans (Ring Topology) - Zero hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans - One hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans - Three hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans - Two hydrogens+A.ket',
    'Double CIS-Trans/Double CIS-Trans - Zero hydrogens (Any atom)+A.ket',
    'Double CIS-Trans/Double CIS-Trans - Zero hydrogens+A.ket',
    'Double-Aromatic/Double-Aromatic (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Double-Aromatic/Double-Aromatic (Ring Topology) - Zero hydrogens (C)+A.ket',
    'Double-Aromatic/Double-Aromatic - Zero hydrogens (Any Atom)+A.ket',
    'Double-Aromatic/Double-Aromatic - Zero hydrogens (C)+A.ket',
    'Hydrogen/Hydrogen (Ring Topology) - Eight hydrogens (C8)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Five hydrogens (C5)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Four hydrogens (Ge)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - One hydrogens (Br)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Seven hydrogens (C7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Six hydrogens (C6)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Three hydrogens (N)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Two hydrogens (O)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Hydrogen/Hydrogen - Eight hydrogens (C8)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Five hydrogens (C5)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Four hydrogens (Ge)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - One hydrogens (Br)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Seven hydrogens (C7)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Six hydrogens (C6)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Three hydrogens (N)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Two hydrogens (O)+A.ket',
    // ^-- https://github.com/epam/Indigo/issues/1627
    'Hydrogen/Hydrogen - Zero hydrogens (Any Atom)+A.ket',
    'Single/Single (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single/Single (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single/Single (Ring Topology) - One hydrogens+A.ket',
    'Single/Single (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single/Single (Ring Topology) - Two hydrogens (C)+A.ket',
    'Single/Single (Ring Topology) - Two hydrogens (Ge)+A.ket',
    'Single/Single (Ring Topology) - Zero hydrogens  (Any Atom)+A.ket',
    'Single/Single (Ring Topology) - Zero hydrogens+A.ket',
    'Single/Single - Five hydrogens (S)+A.ket',
    'Single/Single - Four hydrogens (S)+A.ket',
    'Single/Single - One hydrogens+A.ket',
    'Single/Single - Three hydrogens (S)+A.ket',
    'Single/Single - Two hydrogens (C)+A.ket',
    'Single/Single - Two hydrogens (Ge)+A.ket',
    'Single/Single - Zero hydrogens  (Any Atom)+A.ket',
    'Single/Single - Zero hydrogens+A.ket',
    'Single Down/Single Down (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - One hydrogens+A.ket',
    'Single Down/Single Down (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Down/Single Down (Ring Topology) - Two hydrogens (Ge)+A.ket',
    'Single Down/Single Down (Ring Topology) - Zero hydrogens  (Any Atom)+A.ket',
    'Single Down/Single Down (Ring Topology) - Zero hydrogens+A.ket',
    'Single Down/Single Down - Five hydrogens (S)+A.ket',
    'Single Down/Single Down - Four hydrogens (S)+A.ket',
    'Single Down/Single Down - One hydrogens+A.ket',
    'Single Down/Single Down - Three hydrogens (S)+A.ket',
    'Single Down/Single Down - Two hydrogens (Ge)+A.ket',
    'Single Down/Single Down - Zero hydrogens  (Any Atom)+A.ket',
    'Single Down/Single Down - Zero hydrogens+A.ket',
    'Single Up/Single Up (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - One hydrogens+A.ket',
    'Single Up/Single Up (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Up/Single Up (Ring Topology) - Two hydrogens (Ge)+A.ket',
    'Single Up/Single Up (Ring Topology) - Zero hydrogens  (Any Atom)+A.ket',
    'Single Up/Single Up (Ring Topology) - Zero hydrogens+A.ket',
    'Single Up/Single Up - Five hydrogens (S)+A.ket',
    'Single Up/Single Up - Four hydrogens (S)+A.ket',
    'Single Up/Single Up - One hydrogens+A.ket',
    'Single Up/Single Up - Three hydrogens (S)+A.ket',
    'Single Up/Single Up - Two hydrogens (Ge)+A.ket',
    'Single Up/Single Up - Zero hydrogens  (Any Atom)+A.ket',
    'Single Up/Single Up - Zero hydrogens+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Five hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Four hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - One hydrogens+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Three hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Two hydrogens (Ge)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Single Up-Down/Single Up-Down (Ring Topology) - Zero hydrogens+A.ket',
    'Single Up-Down/Single Up-Down - Five hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - Four hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - One hydrogens+A.ket',
    'Single Up-Down/Single Up-Down - Three hydrogens (S)+A.ket',
    'Single Up-Down/Single Up-Down - Two hydrogens (Ge)+A.ket',
    'Single Up-Down/Single Up-Down - Zero hydrogens (Any Atom)+A.ket',
    'Single Up-Down/Single Up-Down - Zero hydrogens+A.ket',
    'Single-Aromatic/Single-Aromatic (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Single-Aromatic/Single-Aromatic (Ring Topology) - Zero hydrogens (C)+A.ket',
    'Single-Aromatic/Single-Aromatic - Zero hydrogens (Any Atom)+A.ket',
    'Single-Aromatic/Single-Aromatic - Zero hydrogens (C)+A.ket',
    'Single-Double/Single-Double (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Single-Double/Single-Double (Ring Topology) - Zero hydrogens (C)+A.ket',
    'Single-Double/Single-Double - Zero hydrogens (Any Atom)+A.ket',
    'Single-Double/Single-Double - Zero hydrogens (C)+A.ket',
    'Triple/Triple (Ring Topology) - One hydrogens+A.ket',
    'Triple/Triple (Ring Topology) - Two hydrogens+A.ket',
    'Triple/Triple (Ring Topology) - Zero hydrogens (Any Atom)+A.ket',
    'Triple/Triple (Ring Topology) - Zero hydrogens (S)+A.ket',
    'Triple/Triple - One hydrogens+A.ket',
    'Triple/Triple - Two hydrogens+A.ket',
    'Triple/Triple - Zero hydrogens (Any Atom)+A.ket',
    'Triple/Triple - Zero hydrogens (S)+A.ket',
  ];

  for (const fileName of fileNames) {
    test(`by ${fileName}`, async ({ page }) => {
      if (temporaryFailedTestsFileNames.includes(fileName)) {
        test.fail();
      }

      test.setTimeout(120000);
      // Performance degradation problem - https://github.com/epam/Indigo/issues/1835 - REMOVE AFTER FIX
      await openFileAndAddToCanvasAsNewProject(
        `KET/Toggle-Explicit-Hydrogens-With-Respect-To-Selected-Atoms/A on the canvas/${fileName}`,
        page,
      );
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
