/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { AboutDialog } from '@tests/pages/molecules/canvas/AboutDialog';
import { takeEditorScreenshot, takeTopToolbarScreenshot } from '@utils';

let page: Page;

test.describe('Top toolbar Macro mode', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check that the About and Help buttons added to the main toolbar in macromolecules mode', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6270
     * Description: Check that the About and Help buttons added to the main toolbar in macromolecules mode
     * Scenario:
     * 1. Go to Macro mode
     * 2. Check that the About and Help buttons are present in the top toolbar
     */
    const buildVersion = AboutDialog(page).buildVersion;
    const buildTime = AboutDialog(page).buildTime;
    const buildIndigoVersion = AboutDialog(page).buildIndigoVersion;
    const iconAbout = {
      testId: 'about-button',
      title: 'About',
    };
    const iconHelp = {
      testId: 'help-button',
      title: 'Help (?)',
    };
    const iconButton = page.getByTestId(iconAbout.testId).first();
    await expect(iconButton).toHaveAttribute('title', iconAbout.title);
    await takeTopToolbarScreenshot(page);
    await iconButton.click();
    await takeEditorScreenshot(page, {
      mask: [buildVersion, buildTime, buildIndigoVersion],
    });
    await AboutDialog(page).closeByOk();
    const helpButton = page.getByTestId(iconHelp.testId).first();
    await expect(helpButton).toHaveAttribute('title', iconHelp.title);
    await helpButton.click();
  });
});
