/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  waitForPageInit,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProject,
  takeTopToolbarScreenshot,
  selectRingButton,
  RingButton,
  clickInTheMiddleOfTheScreen,
  takeLeftToolbarScreenshot,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  selectTopPanelButton,
  TopPanelButton,
  openFile,
} from '@utils';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import {
  disableViewOnlyMode,
  disableViewOnlyModeBySetOptions,
  enableViewOnlyMode,
  enableViewOnlyModeBySetOptions,
} from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.options', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API ketcher.editor.options({ viewOnlyMode: true }) and ketcher.editor.options({ viewOnlyMode: false })
    */
    await enableViewOnlyMode(page);
    await takePageScreenshot(page);
    await disableViewOnlyMode(page);
    await takePageScreenshot(page);
  });

  test('Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.setOptions', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true })) and window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false }))
    */
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
    await disableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Verify that view-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: View-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))
    */
    await enableViewOnlyModeBySetOptions(page);
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Verify that view-only mode is still turned off after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: View-only mode is still turned off after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false}))
    */
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
    await disableViewOnlyModeBySetOptions(page);
    await disableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Get an error in console after sending request with the wrong parameters window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode123: false123}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Error in console after sending request with the wrong parameters window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode123: false}))
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await page.evaluate(() => {
      window.ketcher.editor.setOptions(
        JSON.stringify({ viewOnlyMode123: `false123` }),
      );
    });
  });

  test('Add to canvas different elements, turn on view only mode, verify that all editing tools are disabled in toolbars for elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: All editing tools are disabled in toolbars for elements
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-50-with-50-structures.ket',
      page,
    );
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Turn on view-only mode, add to canvas different elements from file, verify that all editing tools are disabled in toolbars for elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Turn on view-only mode, add to canvas different elements from file, verify that all editing tools are disabled in toolbars for elements
    */
    await enableViewOnlyModeBySetOptions(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-50-with-50-structures.ket',
      page,
    );
    await takePageScreenshot(page);
  });

  test('Verify that the following tools and functions are enabled in view-only mode(Open, Save, Copy) ', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Tools and functions are enabled in view-only mode(Open, Save, Copy) 
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await page.keyboard.press('Control+a');
    await expect(page.getByTestId('open-file-button')).toBeEnabled();
    await expect(page.getByTestId('save-file-button')).toBeEnabled();
    await expect(page.getByTitle('Copy (Ctrl+C)')).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the hand and selection tools are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Hand and selection tools are enabled in view-only mode
    */
    await enableViewOnlyModeBySetOptions(page);
    await expect(page.getByTestId('hand')).toBeEnabled();
    await expect(page.getByTestId('select-rectangle-in-toolbar')).toBeEnabled();
    await takeLeftToolbarScreenshot(page);
  });

  test('Verify that elements on Canvas can be copied (as MOL) in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Elements on Canvas copied (as MOL) in view-only mode
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('copy-button-dropdown-triangle').click();
    await page.getByTitle('Copy as MOL (Ctrl+M)').click();
    await disableViewOnlyModeBySetOptions(page);
    await page.keyboard.press('Control+v');
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
  });

  test('Verify that elements on Canvas can be copied (as KET) in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Elements on Canvas copied (as KET) in view-only mode
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('copy-button-dropdown-triangle').click();
    await page.getByTitle('Copy as KET (Ctrl+Shift+K)').click();
    await disableViewOnlyModeBySetOptions(page);
    await page.keyboard.press('Control+v');
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
  });

  test('Verify that the help, about and fullscreen mode are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The help, about and fullscreen mode are enabled in view-only mode 
    */
    await enableViewOnlyModeBySetOptions(page);
    await expect(page.getByTestId('help-button')).toBeEnabled();
    await expect(page.getByTestId('about-button')).toBeEnabled();
    await expect(page.getByTestId('fullscreen-mode-button')).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the "Check Structure", "Calculated Values", and "3D Viewer" tools are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Check Structure", "Calculated Values", and "3D Viewer" tools are enabled in view-only mode
    */
    await enableViewOnlyModeBySetOptions(page);
    await expect(page.getByTitle('Check Structure (Alt+S)')).toBeEnabled();
    await expect(page.getByTitle('Calculated Values (Alt+C)')).toBeEnabled();
    await expect(page.getByTitle('3D Viewer')).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the "Check Structure", "Calculated Values", and "3D Viewer" tools are operational in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Check Structure", "Calculated Values", and "3D Viewer" tools are operational in view-only mode
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Check, page),
    );
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Calculated, page),
    );
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.ThreeD, page),
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Add to Canvas" button is disabled in the "Open structure" dialog window', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Add to Canvas" button is disabled in the "Open structure" dialog window
    */
    await enableViewOnlyModeBySetOptions(page);
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile(`KET/images-png-50-with-50-structures.ket`, page);
    await expect(page.getByText('Add to Canvas')).toBeDisabled();
    await expect(page.getByText('Open as New Project')).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  const hotkeys = [
    { keys: 'Control+o', action: 'Open' },
    { keys: 'Control+s', action: 'Save As' },
    { keys: 'Control+c', action: 'Copy' },
    { keys: 'Control+Shift+f', action: 'Copy Image' },
    { keys: 'Control+m', action: 'Copy as MOL' },
    { keys: 'Control+Shift+k', action: 'Copy as KET' },
    { keys: 'Control+a', action: 'Select All' },
    { keys: 'Control+Shift+a', action: 'Deselect All' },
    { keys: 'Alt+s', action: 'Check structure' },
    { keys: 'Alt+c', action: 'Calculate values' },
    { keys: 'Control+Alt+h', action: 'Hand tool' },
    { keys: 'Escape', action: 'Switch to Selection' },
    { keys: 'Control+-', action: 'Zoom Out' },
    { keys: 'Control+=', action: 'Zoom In' },
    { keys: 'Control+Shift+0', action: 'Zoom 100%' },
    { keys: '?', action: 'Help' },
  ];

  test.describe('Hotkeys test', () => {
    for (const hotkey of hotkeys) {
      test(`Verify that hotkey ${hotkey.keys} triggers ${hotkey.action}`, async ({
        page,
      }) => {
        await selectRingButton(RingButton.Benzene, page);
        await clickInTheMiddleOfTheScreen(page);
        await enableViewOnlyModeBySetOptions(page);
        await page.keyboard.press('Control+a');
        await page.keyboard.press(hotkey.keys);
        await takePageScreenshot(page);
        await closeErrorAndInfoModals(page);
      });
    }
  });
});
