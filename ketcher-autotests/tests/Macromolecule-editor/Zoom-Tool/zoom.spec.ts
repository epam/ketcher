/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  waitForRender,
  takeLeftToolbarMacromoleculeScreenshot,
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
});
