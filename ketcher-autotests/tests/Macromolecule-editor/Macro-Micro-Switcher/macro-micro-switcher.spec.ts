import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  takePageScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';

test.describe('Macro-Micro-Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that preview window of macro structure doesn not change in micro mode ', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3603
    Description: Preview window of macro structure doesn't change in micro mode
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3603
    */
    const moleculeLabels = ['A', '25R', 'baA', 'Test-6-Ph', 'Test-6-Ch'];
    await openFileAndAddToCanvas('KET/five-monomers.ket', page);
    await turnOnMicromoleculesEditor(page);
    for (const label of moleculeLabels) {
      await page.getByText(label, { exact: true }).hover();
      await takeEditorScreenshot(page);
    }
  });

  test('Check that macromolecule structures in micromode are represented as S-Groups with bonds', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Macromolecule structures in micromode are represented as S-Groups with bonds
    */
    await openFileAndAddToCanvas(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('Edc').hover();
    await takeEditorScreenshot(page);
  });

  test('Micromolecules in macromode will be represented as CHEMs with generated name(F1, F2, ...Fn)', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Micromolecules in macromode represented as CHEMs with generated name(F1, F2, ...Fn)
    */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvas('KET/eight-micromolecules.ket', page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check that After hiding Library in Macro mode possible to see Show Library button', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: After hiding Library in Macro mode 'Show Library' button is visible.
    */
    await page.getByText('Hide').click();
    await takePageScreenshot(page);
    await page.getByText('Show Library').click();
  });

  test('Check that the Mol-structure opened from the file in Macro mode is visible on Micro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode
    */
    await openFileAndAddToCanvas('Molfiles-V2000/glutamine.mol', page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check that the Ket-structure opened from the file in Macro mode  is visible in Micro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode when
    */
    await openFileAndAddToCanvas('KET/stereo-and-structure.ket', page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check that Zoom In/Zoom Out/ Reset Zoom Tools work (UI Buttons) after switching to Macro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoom In/Zoom Out/ Reset Zoom Tools work after switching to Macro mode
    */
    const numberOfPressZoomIn = 5;
    const numberOfPressZoomOut = 8;
    await openFileAndAddToCanvas(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }

    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
    await page.getByTestId('reset-zoom-button').click();
    await takeEditorScreenshot(page);
  });

  test('Check that Zoom In/Zoom Out/ Reset Zoom Tools work (Mouse scroll) after switching to Macro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoom In/Zoom Out/ Reset Zoom Tools work after switching to Macro mode
    */
    const randomNegativeNumber = -80;
    const randomPositiveNumber = 50;
    const numberOfMouseWheelScroll = 5;
    await openFileAndAddToCanvas(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomNegativeNumber);
    }
    await page.keyboard.up('Control');

    await takeEditorScreenshot(page);

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomPositiveNumber);
    }
    await page.keyboard.up('Control');

    await takeEditorScreenshot(page);
    await page.getByTestId('reset-zoom-button').click();
    await takeEditorScreenshot(page);
  });

  test('Check that the zoomed in/out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoomed In/Out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode
    */
    const numberOfPressZoomIn = 5;
    const randomPositiveNumber = 50;
    const numberOfMouseWheelScroll = 5;
    await openFileAndAddToCanvas(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomPositiveNumber);
    }
    await page.keyboard.up('Control');

    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Macro-Micro-Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that the Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it
    */
    await openFileAndAddToCanvas('Molfiles-V2000/glutamine.mol', page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').click();
    await takeEditorScreenshot(page);
  });

  test('Check that the Ket-structure opened from the file in Micro mode  is visible in Macro mode when hover on it', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it
    */
    await openFileAndAddToCanvas('KET/stereo-and-structure.ket', page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Create two Benzene rings structure with Charge Plus (+) and Charge Plus (-) Tool added in Micro mode and switch to Macro mode', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas with changes by Charge Plus (+) Tool and Charge Plus (-).
    */
    await openFileAndAddToCanvas('KET/two-benzene-charged.ket', page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F2').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Create two Benzene rings structure with some text added in Micro mode and switch to Macro mode.', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas without text.
    */
    await openFileAndAddToCanvas('KET/benzene-rings-with-text.ket', page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Create two Benzene rings structure with Shape Ellipse Tool added in Micro mode and switch to Macro mode.', async ({
    page,
  }) => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas without Shape Ellipse.
    */
    await openFileAndAddToCanvas('KET/two-benzene-and-ellipse.ket', page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });
});
