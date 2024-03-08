/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  waitForRender,
  takeLeftToolbarMacromoleculeScreenshot,
  selectSnakeLayoutModeTool,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

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
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
    for (let i = 0; i < 30; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+-');
      });
    }
  });
});
