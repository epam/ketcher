import { test, expect, Page } from '@playwright/test';
import { waitForPageInit } from '@utils/common/loaders/waitForPageInit';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { PolymerTypeSwitcher } from '@tests/pages/macromolecules/PolymerTypeSwitcher';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('[TEST_CLAUDE] Save the polymer type switcher (RNA/DNA/PEP) to browser cache', () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/9834
   * Description: Save the polymer type switcher (RNA/DNA/PEP) to browser cache
   * Version: 3.x
   */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('1. When no cache value exists, RNA is selected by default upon entering macromolecule mode', async ({ page }) => {
    /*
     * Scenario:
     * 1. Clear localStorage
     * 2. Open macromolecule mode
     * 3. Verify RNA is selected by default
     * Expected: RNA tab is active
     */
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const switcher = PolymerTypeSwitcher(page);
    await expect(switcher.getRNAButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('2. After selecting DNA via UI, reload the page and verify DNA is still selected', async ({ page }) => {
    /*
     * Scenario:
     * 1. Open macromolecule mode
     * 2. Select DNA via polymer type switcher
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify DNA is still selected
     * Expected: DNA tab is active after reload
     */
    const switcher = PolymerTypeSwitcher(page);
    await switcher.selectDNA();
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await expect(switcher.getDNAButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('3. After selecting PEP via UI, reload the page and verify PEP is still selected', async ({ page }) => {
    /*
     * Scenario:
     * 1. Open macromolecule mode
     * 2. Select PEP via polymer type switcher
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify PEP is still selected
     * Expected: PEP tab is active after reload
     */
    const switcher = PolymerTypeSwitcher(page);
    await switcher.selectPEP();
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await expect(switcher.getPEPButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('4. Switch polymer type multiple times, reload, verify only last selection persisted', async ({ page }) => {
    /*
     * Scenario:
     * 1. Open macromolecule mode
     * 2. Switch RNA -> DNA -> PEP -> DNA
     * 3. Reload page
     * 4. Re-enter macromolecule mode
     * 5. Verify DNA is selected
     * Expected: Only the last selected type (DNA) is persisted
     */
    const switcher = PolymerTypeSwitcher(page);
    await switcher.selectRNA();
    await switcher.selectDNA();
    await switcher.selectPEP();
    await switcher.selectDNA();
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await expect(switcher.getDNAButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('5. Clear localStorage, open macromolecule mode, confirm RNA is fallback default', async ({ page }) => {
    /*
     * Scenario:
     * 1. Select DNA
     * 2. Clear browser localStorage
     * 3. Reload page
     * 4. Open macromolecule mode
     * 5. Verify RNA is selected as fallback
     * Expected: RNA is selected when no cache exists
     */
    const switcher = PolymerTypeSwitcher(page);
    await switcher.selectDNA();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await expect(switcher.getRNAButton()).toHaveAttribute('aria-pressed', 'true');
  });
});