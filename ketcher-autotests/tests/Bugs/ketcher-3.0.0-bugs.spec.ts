/* eslint-disable no-magic-numbers */

import { Peptides } from '@constants/monomers/Peptides';
import { Page, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectMacroBond,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { waitForPageInit } from '@utils/common';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

let page: Page;

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptides.A).hover();

  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();

  await page.mouse.down();

  await page.locator('g').filter({ hasText: /^H2N$/ }).locator('rect').hover();

  await page.mouse.up();
}

test.describe('Ketcher bugs in 3.0.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, false, false);
  });

  test.afterEach(async () => {
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('In the Text-editing mode, the canvas is moved to make the newly added sequence visible', async () => {
    const sequences = [
      'AAAA',
      'CCC',
      'TTT',
      'UUU',
      'GGG',
      'CCC',
      'TTT',
      'UUU',
      'CCC',
    ];

    for (const sequence of sequences) {
      await page.keyboard.type(sequence);
      await page.keyboard.press('Enter');
    }

    await takeEditorScreenshot(page);
  });

  test('Switching from Sequence mode to Flex mode and back not shifts visible area of canvas beyond visible frame', async () => {
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/switching-from-sequence-mode-to-snake-mode-and-back.ket',
      page,
    );
    await takePageScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takePageScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takePageScreenshot(page);
  });

  test('Connection between molecule and monomer affect an amount of implicit hydrogens', async () => {
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/monomer-and-micro-structure.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page);
  });
});
