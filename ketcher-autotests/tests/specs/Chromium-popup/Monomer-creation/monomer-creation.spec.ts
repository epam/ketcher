/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(
  '1. Check that a monomer creation wizard button added to the sidebar',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that a monomer creation wizard button added to the sidebar
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Validate that a monomer creation wizard button visible
     *
     * Version 3.7
     */
    const createMonomerButton = LeftToolbar(page).createMonomerButton;
    await expect(createMonomerButton).toBeVisible();
  },
);

test(
  '2. Check that tooltip appears on hovering to wizard button',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that tooltip appears on hovering to wizard button
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Hover mouse over monomer creation wizard button
     *      3. Validate that a tooltip appears
     *
     * Version 3.7
     */
    const createMonomerButton = LeftToolbar(page).createMonomerButton;
    await createMonomerButton.hover();
    await expect(createMonomerButton).toHaveAttribute(
      'title',
      'Create a monomer (Ctrl+M)',
    );
  },
);
