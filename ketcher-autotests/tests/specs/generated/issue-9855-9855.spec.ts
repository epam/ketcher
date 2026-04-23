import { test, expect, Page } from '@playwright/test';
import { waitForPageInit } from '@utils';

const KETCHER_URL = process.env.KETCHER_URL || 'http://localhost:3000';

async function openMacromoleculeMode(page: Page) {
  await page.keyboard.press('Control+Alt+Shift+M');
  await page.waitForSelector('[data-testid="polymer-toggler"]', { timeout: 5000 }).catch(() => {});
}

async function switchToMacroMode(page: Page) {
  const macroBtn = page.getByTestId('macromolecule-editor');
  if (await macroBtn.isVisible()) {
    await macroBtn.click();
  }
}

test.describe('Polymer type switcher persistence in browser cache', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(KETCHER_URL);
    await waitForPageInit(page);
  });

  test('defaults to RNA when no cache value exists and opens RNA library tab', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageInit(page);
    await switchToMacroMode(page);
    const rnaTab = page.getByTestId('RNA');
    await expect(rnaTab).toBeVisible();
    const rnaToggle = page.locator('[class*="active"]').filter({ hasText: /RNA/i }).first();
    await expect(rnaToggle).toBeVisible();
  });

  test('selecting DNA via switcher UI persists after page reload', async ({ page }) => {
    await switchToMacroMode(page);
    const dnaButton = page.getByTestId('DNA');
    await dnaButton.click();
    await page.reload();
    await waitForPageInit(page);
    await switchToMacroMode(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(cachedValue).toBe('DNA');
    const dnaActive = page.locator('[class*="active"]').filter({ hasText: /DNA/i });
    await expect(dnaActive).toBeVisible();
  });

  test('selecting PEP via switcher UI persists after page reload', async ({ page }) => {
    await switchToMacroMode(page);
    const pepButton = page.getByTestId('PEPTIDE').or(page.getByText('PEP'));
    await pepButton.first().click();
    await page.reload();
    await waitForPageInit(page);
    await switchToMacroMode(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(['PEP', 'PEPTIDE']).toContain(cachedValue);
  });

  test('using hotkey Ctrl+Alt+D to switch to DNA persists after page reload', async ({ page }) => {
    await switchToMacroMode(page);
    await page.keyboard.press('Control+Alt+d');
    await page.reload();
    await waitForPageInit(page);
    await switchToMacroMode(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(cachedValue).toBe('DNA');
  });

  test('clearing localStorage resets polymer type to default RNA on next load', async ({ page }) => {
    await switchToMacroMode(page);
    await page.getByTestId('DNA').click();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageInit(page);
    await switchToMacroMode(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(cachedValue === null || cachedValue === 'RNA').toBeTruthy();
  });

  test('switching polymer type multiple times saves only the last selected value', async ({ page }) => {
    await switchToMacroMode(page);
    await page.getByTestId('RNA').click();
    await page.getByTestId('DNA').click();
    const pepBtn = page.getByTestId('PEPTIDE').or(page.getByText('PEP'));
    await pepBtn.first().click();
    await page.reload();
    await waitForPageInit(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(['PEP', 'PEPTIDE']).toContain(cachedValue);
  });

  test('cached polymer type persists when switching between small molecule and macromolecule modes', async ({ page }) => {
    await switchToMacroMode(page);
    await page.getByTestId('DNA').click();
    const smallMolBtn = page.getByTestId('molecule-editor').or(page.getByTitle(/small molecule/i));
    await smallMolBtn.first().click();
    await switchToMacroMode(page);
    const cachedValue = await page.evaluate(() => localStorage.getItem('polymerType'));
    expect(cachedValue).toBe('DNA');
  });
});