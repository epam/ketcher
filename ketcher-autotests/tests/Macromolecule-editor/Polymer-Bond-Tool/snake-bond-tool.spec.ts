import { test } from '@playwright/test';
import {
  selectSingleBondTool,
  selectSnakeBondTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
/* eslint-disable no-magic-numbers */

test.describe('Snake Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Create snake bond between peptides', async ({ page }) => {
    /* 
    Test case: #3280 - Create snake bond 
    Description: Snake bond tool
    */

    await turnOnMacromoleculesEditor(page);
    await selectSnakeBondTool(page);

    await page.getByText('Tza').click();

    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(300, 500);
    await page.mouse.click(200, 200);

    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    await selectSingleBondTool(page);

    await peptide1.hover();
    await page.mouse.down();
    await peptide2.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide3.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide4.hover();
    await page.mouse.up();
  });

  test('Check snake mode arrange', async ({ page }) => {
    /* 
    Test case: #3280 - Check snake mode
    Description: Snake bond tool
    */

    await turnOnMacromoleculesEditor(page);

    await page.getByText('Tza').click();

    await page.mouse.click(100, 100);
    await page.mouse.click(150, 150);
    await page.mouse.click(200, 200);
    await page.mouse.click(250, 250);
    await page.mouse.click(300, 300);
    await page.mouse.click(350, 350);
    await page.mouse.click(400, 400);
    await page.mouse.click(450, 450);
    await page.mouse.click(500, 500);
    await page.mouse.click(550, 550);
    await page.mouse.click(600, 600);
    await page.mouse.click(650, 650);

    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);
    const peptide5 = peptides.nth(4);
    const peptide6 = peptides.nth(5);
    const peptide7 = peptides.nth(6);
    const peptide8 = peptides.nth(7);
    const peptide9 = peptides.nth(8);
    const peptide10 = peptides.nth(9);
    const peptide11 = peptides.nth(10);
    const peptide12 = peptides.nth(11);

    await selectSingleBondTool(page);

    await peptide1.hover();
    await page.mouse.down();
    await peptide2.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide3.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide4.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide5.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide6.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide7.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide8.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide9.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide10.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide11.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide12.hover();
    await page.mouse.up();

    await selectSnakeBondTool(page);
  });

  test('Check finding right chain sequence using snake mode', async ({
    page,
  }) => {
    /* 
    Test case: #3280 - Check finding right chain sequence using snake mode
    Description: Snake bond tool
    */

    await turnOnMacromoleculesEditor(page);

    await page.getByText('Tza').click();

    await page.mouse.click(100, 100);
    await page.mouse.click(150, 150);

    await page.getByText('dSec').click();
    await page.mouse.click(200, 300);

    await page.getByText('meC').click();
    await page.mouse.click(400, 400);

    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);

    const firstPeptide = await page.getByText('dSec').locator('..');
    const peptide0 = firstPeptide.nth(0);

    const lastPeptide = await page.getByText('meC').locator('..');
    const peptide3 = lastPeptide.nth(0);

    await selectSingleBondTool(page);

    await peptide0.hover();
    await page.mouse.down();
    await peptide1.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide2.hover();
    await page.mouse.up();

    await page.mouse.down();
    await peptide3.hover();
    await page.mouse.up();

    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
  });
});
