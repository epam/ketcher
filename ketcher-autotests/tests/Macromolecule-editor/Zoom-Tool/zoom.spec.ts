/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  waitForRender,
  takeLeftToolbarMacromoleculeScreenshot,
  selectSnakeLayoutModeTool,
  clickInTheMiddleOfTheScreen,
  screenshotBetweenUndoRedoInMacro,
  moveMouseToTheMiddleOfTheScreen,
  selectSingleBondTool,
  takePageScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { connectMonomersWithBonds } from '@utils/macromolecules/monomer';

async function zoomWithMouseScrollAndTakeScreenshot(page: Page) {
  const zoomLevelDelta = 600;
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -zoomLevelDelta);
  await page.keyboard.up('Control');
  await takeEditorScreenshot(page);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, zoomLevelDelta);
  await page.keyboard.up('Control');
  await takeEditorScreenshot(page);
}

test.describe('Zoom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Validate presence of zoom button with three options: zoom in, zoom out, reset zoom.', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: Zoom button with three options: zoom in, zoom out, reset zoom are located in left toolbar.
    */
    await page.getByTestId('zoom-in-button').hover();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Check tooltip for a Zoom in, Zoom out, Reset buttons', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: Zoom in, Zoom out, Reset buttons tooltips are located in the left toolbar.
    */
    const icons = [
      {
        testId: 'zoom-in-button',
        title: 'Zoom In (Ctrl+=)',
      },
      {
        testId: 'zoom-out-button',
        title: 'Zoom Out (Ctrl+-)',
      },
      {
        testId: 'reset-zoom-button',
        title: 'Reset Zoom (Ctrl+0)',
      },
    ];
    for (const icon of icons) {
      const iconButton = page.getByTestId(icon.testId);
      await expect(iconButton).toHaveAttribute('title', icon.title);
      await iconButton.hover();
      expect(icon.title).toBeTruthy();
    }
  });

  test('Validate that clicking "Zoom In"/"Zoom Out" buttons zooms into center of current view', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: "Zoom In"/"Zoom Out" buttons zooms into center of current view
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Validate that mouse scrolling IN/OUT - zooms into center of current mouse position', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: Mouse scrolling IN/OUT - zooms into center of current mouse position
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    await page.getByText('DTrp2M').locator('..').first().hover();
    await zoomWithMouseScrollAndTakeScreenshot(page);
  });

  test('Check that button "Reset zoom" is reset zoom settings to 100%', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: Button "Reset zoom" is reset zoom settings to 100%
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+-');
      });
    }
    await takeEditorScreenshot(page);
    await page.getByTestId('reset-zoom-button').click();
    await takeEditorScreenshot(page);
  });

  test('Check that hotkey "Ctrl + 0" is reset zoom settings to 100%', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: Hotkey "Ctrl + 0" is reset zoom settings to 100%
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+0');
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
    await openFileAndAddToCanvas('Molfiles-V3000/monomers-and-chem.mol', page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+-');
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Check after zoom in on created long snake chain of peptides you can use scroll with Shift', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: After zoom in on created long snake chain of peptides you can use scroll with Shift
    */
    const wheelDelta = 200;
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, wheelDelta);
    await page.keyboard.up('Shift');
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
    await openFileAndAddToCanvas(
      'KET/peptides-connected-through-chem.ket',
      page,
    );
    for (let i = 0; i < 30; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await takeEditorScreenshot(page);
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
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Control+=');
    }
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Control+-');
    }
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
    await page.getByTestId('Bal___beta-Alanine').click();
    await clickInTheMiddleOfTheScreen(page);
    for (let i = 0; i < 3; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['Bal', 'Edc']);
    for (let i = 0; i < 5; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+-');
      });
    }
    await page.getByTestId('meD___N-Methyl-Aspartic acid').click();
    await page.mouse.click(x1, y1);
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
    await page.getByTestId('Bal___beta-Alanine').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['Bal', 'Edc']);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 5; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await screenshotBetweenUndoRedoInMacro(page);
    await takeEditorScreenshot(page);
  });

  test('After zooming out to maximum canvas zoom level, preview of monomer entities remains same as before zoom out', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: After zooming out to maximum canvas 
    zoom level, preview of monomer entities under mouse cursor remains same as before zoom out.
    */
    for (let i = 0; i < 8; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+-');
      });
    }
    await page.getByTestId('Bal___beta-Alanine').click();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('C_C_R_P').click();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('SMPEG2___SM(PEG)2 linker from Pierce').click();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('After zooming in to maximum on monomer, connection points looks undistorted', async ({
    page,
  }) => {
    /* 
    Test case: Zoom Tool
    Description: After zooming in to maximum on monomer, connection points looks undistorted.
    */
    await openFileAndAddToCanvas(
      `KET/Peptide-Templates/15 - (R1,R2,R3,R4,R5).ket`,
      page,
    );
    for (let i = 0; i < 30; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    await selectSingleBondTool(page);
    await page.getByText('(R').locator('..').first().hover();
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
    await page.getByTestId('open-button').click();
    await page.getByTestId('paste-from-clipboard-button').click();
    await browser.newContext({ deviceScaleFactor: 2.5 });
    await page.setViewportSize({ width: 435, height: 291 });
    await takePageScreenshot(page);
  });

  test('Maximum browser zoom out', async ({ page, browser }) => {
    /* 
    Test case: Zoom Tool
    Description: When zoomed out to 25%, buttons and toolbars have the correct appearance
    */
    await page.getByTestId('open-button').click();
    await page.getByTestId('paste-from-clipboard-button').click();
    await browser.newContext({ deviceScaleFactor: 0.2 });
    await page.setViewportSize({ width: 4358, height: 2918 });
    await takePageScreenshot(page);
  });
});
