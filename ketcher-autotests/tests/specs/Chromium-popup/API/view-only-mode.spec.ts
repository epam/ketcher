/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import { waitForPageInit, takePageScreenshot } from '@utils';
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

  test(
    'Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.options',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API ketcher.editor.options({ viewOnlyMode: true }) and ketcher.editor.options({ viewOnlyMode: false })
    */
      await enableViewOnlyMode(page);
      await takePageScreenshot(page);
      await disableViewOnlyMode(page);
      await takePageScreenshot(page);
    },
  );

  test(
    'Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.setOptions',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true })) and window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false }))
    */
      await enableViewOnlyModeBySetOptions(page);
      await takePageScreenshot(page);
      await disableViewOnlyModeBySetOptions(page);
      await takePageScreenshot(page);
    },
  );

  test(
    'Verify that view-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: View-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))
    */
      await enableViewOnlyModeBySetOptions(page);
      await enableViewOnlyModeBySetOptions(page);
      await takePageScreenshot(page);
    },
  );
});
