/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  selectTool,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  selectRing,
  RingButton,
  moveOnAtom,
  waitForRender,
  TopPanelButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  drawBenzeneRing,
  clickOnAtom,
  clickOnBond,
  BondType,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  copyStructureByCtrlMove,
  screenshotBetweenUndoRedo,
  selectPartOfMolecules,
  selectFunctionalGroups,
  FunctionalGroups,
  dragMouseTo,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  copyAndPaste,
  clickOnCanvas,
  selectAromatizeTool,
  selectDearomatizeTool,
  selectAddRemoveExplicitHydrogens,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

test.describe('Hot keys', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('select last chosen selected tool when user press ESC', async ({
    page,
  }) => {
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await selectTool(LeftPanelButton.AddText, page);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('select-fragment')).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('Shift+Tab to switch selection tool', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('select-fragment')).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('Verify move by ctrl when its a part of molecula as only atom', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Atom copied and moves to a new place.
      Case:
      1. Draw a benzene ring.
      2. Select atom.
      3. Press Ctrl key and move atom.
      Expected: Atom copied and moves to a new place.
      */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as atom and bond', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Atom and bond copied and moves to a new place.
      Case:
      1. Draw a benzene ring.
      2. Select atom and bond.
      3. Press Ctrl key and move atom and bond.
      Expected: Atom and bond copied and moves to a new place.
      */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'C', 0);
    await clickOnBond(page, BondType.SINGLE, 0);
    await page.keyboard.up('Shift');
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as ring', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Benzene ring copied and moves to a new place.
      Case:
      1. Draw a benzene ring.
      2. Select all structure.
      3. Press Ctrl key and move structure.
      Expected: Benzene ring copied and moves to a new place.
      */
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as ring with attachment points', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Benzene ring with attachment points copied and moves to a new place.
      Case:
      1. Open a benzene ring with attachment points.
      2. Select all structure.
      3. Press Ctrl key and move structure.
      Expected: Benzene ring with attachment points copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-ring-with-two-attachment-points.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as ring with attachment points and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Benzene ring with attachment points copied and moves to a new place and then Undo/Redo actions work proper.
      Case:
      1. Open a benzene ring with attachment points.
      2. Select all structure.
      3. Press Ctrl key and move structure.
      Expected: Benzene ring with attachment points copied and moves to a new place and then Undo/Redo actions work proper.
      We have a bug: https://github.com/epam/ketcher/issues/6199 
      After fixing this bug we need update screenshots.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-ring-with-two-attachment-points.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as ring with attachment bonds', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a part of molecula as ring with attachment bonds.
      Case:
      1. Open structure.
      2. Select part of structure.
      3. Press Ctrl key and move structure.
      Expected: Structure copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/non-proprietary-structure.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0, { x: 250, y: 250 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a whole molecula', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a whole molecula.
      Case:
      1. Open structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Structure copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/non-proprietary-structure.mol',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await copyStructureByCtrlMove(page, 'C', 0, { x: 245, y: 245 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a contracted functional group', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a functional group.
      Case:
      1. Add functional group structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Functional group structure copied and moves to a new place.
      */
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('Cbz').hover();
    await page.keyboard.down('Control');
    await dragMouseTo(300, 300, page);
    await page.keyboard.up('Control');
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a expanded functional group', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a functional group.
      Case:
      1. Add functional group structure and expand it.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Functional group structure copied and moves to a new place.
      */
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('Cbz').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a contracted salts and solvents', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a salts and solvents.
      Case:
      1. Add salts and solvents structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Salts and solvents structure copied and moves to a new place.
      */
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('formic acid').hover();
    await page.keyboard.down('Control');
    await dragMouseTo(300, 300, page);
    await page.keyboard.up('Control');
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a expanded salts and solvents', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a salts and solvents.
      Case:
      1. Add salts and solvents structure and expand it.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Salts and solvents structure copied and moves to a new place.
      */
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('formic acid').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a reaction with catalyst above and below arrow', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a reaction with catalyst above and below arrow.
      Case:
      1. Add reaction with catalyst above and below arrow.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Reaction with catalyst above and below arrow copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/reaction-with-catalyst.ket',
      page,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0, { x: 270, y: 245 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a reactant and elliptical arrow', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a reaction with catalyst above and below elliptical arrow.
      Case:
      1. Add reaction with catalyst above and below elliptical arrow.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Reaction with catalyst above and below elliptical arrow copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/two-benzene-and-elliptical-arrow.ket',
      page,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0, { x: 270, y: 245 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify move by ctrl when its a part of molecula as atom with valence, alias, text and plus', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Structure moved by ctrl when its a part of molecula as atom with valence, alias, text and plus.
      Case:
      1. Add reaction with a molecula as atom with valence, alias, text and plus.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      Expected: Reaction with a molecula as atom with valence, alias, text and plus copied and moves to a new place.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/two-benzene-valence-alias-text-plus.ket',
      page,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0, { x: 270, y: 245 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
  });

  test('Verify aromatize/dearomatize after copy and moving by ctrl', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Aromatize/dearomatize works after copy and moving by ctrl.
      Case:
      1. Add structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      4. Aromatize/dearomatize.
      Expected: Aromatize/dearomatize works after moving by ctrl.
      */
    await openFileAndAddToCanvasAsNewProject(
      'KET/two-benzene-valence-alias-text-plus.ket',
      page,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0, { x: 270, y: 245 });
    await page.mouse.click(100, 100);
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page, { maxDiffPixels: 2 });
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify Layout after copy and moving by ctrl', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Layout works after copy and moving by ctrl.
      Case:
      1. Add structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      4. Layout.
      Expected: Layout works after moving by ctrl.
      */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify add/remove explicit hydrogen after moving by ctrl', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4986
      Description: Add/remove explicit hydrogen works after copy and moving by ctrl.
      Case:
      1. Add structure.
      2. Select whole structure.
      3. Press Ctrl key and move structure.
      4. Add/remove explicit hydrogen.
      Expected: Add/remove explicit hydrogen works after moving by ctrl.
      */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await selectAddRemoveExplicitHydrogens(page);
    await takeEditorScreenshot(page);
    await selectAddRemoveExplicitHydrogens(page);
    await takeEditorScreenshot(page);
  });

  test('Verify copy/paste works after copy and moving by ctrl', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/4986
        Description: Copy/paste works after copy and moving by ctrl.
        Case:
        1. Add structure.
        2. Select whole structure.
        3. Press Ctrl key and move structure.
        4. Copy/paste.
        Expected: Copy/paste works after moving by ctrl.
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/two-benzene-valence-alias-text-plus.ket',
      page,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyStructureByCtrlMove(page, 'C', 0, { x: 270, y: 245 });
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 400, 500);
    await takeEditorScreenshot(page);
  });
});

test.describe('Hot key Del', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('When deleting part of a structure using a hotkey Del, and preview of structure is under mouse cursor, an error not occurs in DevTool console', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3918
     * Description: Part of structure deleted and canvas can be cleared. No console errors.
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    const x = 100;
    const y = 100;
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await moveOnAtom(page, 'C', 0);
    });
    await page.keyboard.press('Delete');
    await page.mouse.move(x, y);
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });
});
