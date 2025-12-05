/* eslint-disable no-magic-numbers */
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  moveMouseAway,
  dragMouseTo,
  clickOnCanvas,
  zoomWithMouseWheel,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  MacroFileType,
} from '@utils';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

async function zoomWithMouseScrollAndTakeScreenshot(page: Page) {
  const zoomLevelDelta = 600;
  await page.keyboard.down('ControlOrMeta');
  await page.mouse.wheel(0, -zoomLevelDelta);
  await page.keyboard.up('ControlOrMeta');
  await takeEditorScreenshot(page);
  await page.keyboard.down('ControlOrMeta');
  await page.mouse.wheel(0, zoomLevelDelta);
  await page.keyboard.up('ControlOrMeta');
  await takeEditorScreenshot(page);
}

test.describe('Zoom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Check tooltip for a Zoom in, Zoom out, Reset buttons', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Zoom in, Zoom out, Reset buttons tooltips are located in the top toolbar.
    */
    const buttons = [
      {
        locator: CommonTopRightToolbar(page).zoomInButton,
        title: 'Zoom In',
      },
      {
        locator: CommonTopRightToolbar(page).zoomOutButton,
        title: 'Zoom Out',
      },
      {
        locator: CommonTopRightToolbar(page).zoomDefaultButton,
        title: 'Zoom 100%',
      },
    ];
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    await zoomSelector.click();
    for (const button of buttons) {
      await expect(button.locator).toHaveAttribute('title', button.title);
      await button.locator.hover();
      expect(button.title).toBeTruthy();
    }
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Validate that clicking "Zoom In"/"Zoom Out" buttons zooms into top left corner of canvas', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: "Zoom In"/"Zoom Out" buttons zooms into center of current view
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).selectZoomInTool(10);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomOutTool(10);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check that minimum value for zoom out is 20% and maximum value for zoom in is 400%', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Minimum value for zoom out is 20% and maximum value for zoom in is 400%
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;

    await Library(page).switchToRNATab();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).selectZoomOutTool(10);

    await clickInTheMiddleOfTheScreen(page);
    let zoomValue = await zoomSelector.textContent();
    expect(zoomValue).toBe('20%');
    await takePageScreenshot(page);

    await CommonTopRightToolbar(page).resetZoom();
    await CommonTopRightToolbar(page).selectZoomInTool(30);
    await clickInTheMiddleOfTheScreen(page);
    zoomValue = await zoomSelector.textContent();
    expect(zoomValue).toBe('400%');
    await takePageScreenshot(page);
  });

  test('Validate that mouse scrolling IN/OUT - zooms into center of current mouse position', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Mouse scrolling IN/OUT - zooms into center of current mouse position
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );

    await getMonomerLocator(page, Peptide.DTrp2M).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await zoomWithMouseScrollAndTakeScreenshot(page);
  });

  test('Check that button "Reset zoom" is reset zoom settings to 100%', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Button "Reset zoom" is reset zoom settings to 100%
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await ZoomOutByKeyboard(page, { repeat: 10 });
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await CommonTopRightToolbar(page).resetZoom();
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that hotkey "Ctrl + 0" is reset zoom settings to 100%', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Hotkey "Ctrl + 0" is reset zoom settings to 100%
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await ZoomInByKeyboard(page, { repeat: 10 });
    await takeEditorScreenshot(page);
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page);
  });

  test('Check that after open monomers structure from a  .mol  file you are able to zoom in and zoom out', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: After open monomers structure from a  .mol  file you are able
    to zoom in and zoom out by hot keys.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/monomers-and-chem.mol',
      MacroFileType.MOLv3000,
    );
    await ZoomInByKeyboard(page, { repeat: 10 });
    await takeEditorScreenshot(page);
    await ZoomOutByKeyboard(page, { repeat: 10 });
    await takeEditorScreenshot(page);
  });

  test('Check after zoom in on created long snake chain of peptides you can use scroll with Shift', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: After zoom in on created long snake chain of peptides you can use scroll with Shift
    */
    const wheelYDelta = -400;
    const wheelXDelta = -400;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await ZoomInByKeyboard(page, { repeat: 10 });
    await page.keyboard.down('Shift');
    await page.mouse.wheel(wheelXDelta, 0);
    await page.keyboard.up('Shift');
    await page.mouse.wheel(0, wheelYDelta);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('Check when you zoom in on created structure as much as possible, its elements still remain clear and accurate view', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: When you zoom in on created structure as much as possible,
    its elements still remain clear and accurate view.
    */
    const MOUSE_WHEEL_VALUE_FOR_MAX_ZOOM = -1000;

    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-through-chem.ket',
    );
    await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });
    await zoomWithMouseWheel(page, MOUSE_WHEEL_VALUE_FOR_MAX_ZOOM);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that is possible to zoom in and out on empty canvas and it wont cause any errors', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: Zoom in and out on empty canvas wont cause any errors.
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await ZoomInByKeyboard(page, { repeat: 30 });
    await ZoomOutByKeyboard(page, { repeat: 30 });
  });

  test('Check if you create a peptide chain, zoom in and add new elements to chain then zoom out and add another elements', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: After create a peptide chain, zoom in and add new elements to chain then zoom out and add
    another elements, then after back to zoom 100% all structure is create properly.
    */
    const x = 800;
    const y = 350;
    const x1 = 650;
    const y1 = 150;
    await Library(page).dragMonomerOnCanvas(Peptide.bAla, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await ZoomInByKeyboard(page, { repeat: 3 });
    await Library(page).dragMonomerOnCanvas(Peptide.Edc, {
      x,
      y,
    });
    await connectMonomersWithBonds(page, ['bAla', 'Edc']);
    await ZoomOutByKeyboard(page, { repeat: 5 });
    await Library(page).dragMonomerOnCanvas(Peptide.meD, {
      x: x1,
      y: y1,
    });
    await connectMonomersWithBonds(page, ['Edc', 'meD']);
    await takeEditorScreenshot(page);
  });

  test('Undo not undoing zoom', async ({ page }) => {
    /*
    Test case: Zoom Tool
    Description: After creating structure on canvas and then
    click zoom in, and then Undo, Redo the structure is the same size as before.
    */
    const x = 800;
    const y = 350;
    await Library(page).dragMonomerOnCanvas(Peptide.bAla, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.Edc, {
      x,
      y,
    });
    await connectMonomersWithBonds(page, ['bAla', 'Edc']);
    await takeEditorScreenshot(page);
    await ZoomInByKeyboard(page, { repeat: 5 });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('After zooming in to maximum on monomer, connection points looks undistorted', async ({
    page,
  }) => {
    /*
    Test case: Zoom Tool
    Description: After zooming in to maximum on monomer, connection points looks undistorted.
    */
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Peptide-Templates/15 - (R1,R2,R3,R4,R5).ket`,
    );
    await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });
    await dragMouseTo(100, 100, page);
    await ZoomInByKeyboard(page, { repeat: 30, timeout: 1 });
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await getMonomerLocator(page, { monomerAlias: '(R1,R2,R3,R4,R5)' }).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('When zoomed to 175% and more, buttons in Paste from Clipboard window not change their position and not overlap each other', async ({
    page,
    browser,
  }) => {
    /*
    Test case: Zoom Tool
    Description: When zoomed to 175% and more, buttons in
    Paste from Clipboard window not change their position and not overlap each other.
    After fix bug https://github.com/epam/ketcher/issues/4174 need to update snapshot.
    */
    await Library(page).switchToRNATab();
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await browser.newContext({ deviceScaleFactor: 2.5 });
    await page.setViewportSize({ width: 435, height: 291 });
    await takePageScreenshot(page);
  });

  test('Maximum browser zoom out', async ({ page, browser }) => {
    /*
    Test case: Zoom Tool
    Description: When zoomed out to 25%, buttons and toolbars have the correct appearance
    */
    await Library(page).switchToRNATab();
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await browser.newContext({ deviceScaleFactor: 0.2 });
    await page.setViewportSize({ width: 4358, height: 2918 });
    await takePageScreenshot(page);
  });

  test('Maximum browser zoom in', async ({ page, browser }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4422 - Case 29
    Description: When zoomed to maximum, buttons in Paste from Clipboard window not change their position and not overlap each other
    */
    await Library(page).switchToRNATab();
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await browser.newContext({ deviceScaleFactor: 4 });
    await page.setViewportSize({ width: 435, height: 291 });
    await takePageScreenshot(page);
  });
});
