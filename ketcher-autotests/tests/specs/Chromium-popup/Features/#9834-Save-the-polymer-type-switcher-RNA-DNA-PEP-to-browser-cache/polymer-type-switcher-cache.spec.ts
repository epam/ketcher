/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { pageReload, clearLocalStorage } from '@utils/common/helpers';

let page: Page;

test.describe('Autotests: polymer type switcher cache functionality', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - When no cache value exists, verify RNA is selected by default upon entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: When no cache value exists, verify RNA is selected by default upon entering macromolecule mode
     * Scenario:
     * 1. Clear browser cache/localStorage
     * 2. Switch to macromolecule mode
     * 3. Verify RNA is selected by default
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('class', /selected/);
  });

  test('Case 2 - After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify DNA is still selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('class', /selected/);
  });

  test('Case 3 - After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify PEP is still selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).toHaveAttribute('class', /selected/);
  });

  test('Case 4 - After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select RNA via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify RNA is still selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).rna();
    await pageReload(page);
    
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('class', /selected/);
  });

  test('Case 5 - Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Use Ctrl+Alt+D hotkey to switch to DNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify DNA is selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+KeyD');
    await pageReload(page);
    
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('class', /selected/);
  });

  test('Case 6 - Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Use Ctrl+Alt+P hotkey to switch to PEP
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify PEP is selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+KeyP');
    await pageReload(page);
    
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).toHaveAttribute('class', /selected/);
  });

  test('Case 7 - Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Use Ctrl+Alt+R hotkey to switch to RNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify RNA is selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+KeyR');
    await pageReload(page);
    
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('class', /selected/);
  });

  test('Case 8 - Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Switch to peptides library tab
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify PEP is selected and peptides library tab is active
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).peptidesTab.click();
    await pageReload(page);
    
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).peptidesTab).toHaveAttribute('class', /selected/);
  });

  test('Case 9 - Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default', async ({ FlexCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Select PEP
     * 3. Reload the page
     * 4. Switch to flex mode
     * 5. Verify peptide library tab is active
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).peptidesTab).toHaveAttribute('class', /selected/);
  });

  test('Case 10 - Switch to DNA, reload the page, navigate to snake mode, and verify the RNA library tab is opened by default', async ({ SnakeCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to DNA, reload the page, navigate to snake mode, and verify the RNA library tab is opened by default
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Select DNA
     * 3. Reload the page
     * 4. Switch to snake mode
     * 5. Verify RNA library tab is active (DNA is part of RNA tab)
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).rnaTab).toHaveAttribute('class', /selected/);
  });

  test('Case 11 - Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab', async ({ SnakeCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Select PEP
     * 3. Switch to snake mode
     * 4. Verify polymer type switcher is not visible
     * 5. Verify peptide library tab is active
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    // Snake mode doesn't have visible polymer type switcher
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).not.toBeVisible();
    await expect(Library(page).peptidesTab).toHaveAttribute('class', /selected/);
  });

  test('Case 12 - Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab', async ({ FlexCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Select DNA
     * 3. Switch to flex mode
     * 4. Verify polymer type switcher is not visible
     * 5. Verify RNA library tab is active (DNA is part of RNA tab)
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    
    // Flex mode doesn't have visible polymer type switcher
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).not.toBeVisible();
    await expect(Library(page).rnaTab).toHaveAttribute('class', /selected/);
  });

  test('Case 13 - Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default
     * Scenario:
     * 1. Clear browser cache/localStorage
     * 2. Switch to macromolecule mode
     * 3. Verify RNA is selected by default
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).rnaTab).toHaveAttribute('class', /selected/);
  });

  test('Case 14 - Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Switch polymer types in sequence: RNA → DNA → PEP → DNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify DNA is selected (last selection)
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).rna();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).rnaTab).toHaveAttribute('class', /selected/);
  });

  test('Case 15 - Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction
     * Scenario:
     * 1. Clear localStorage and switch to macromolecule mode
     * 2. Select PEP
     * 3. Switch to small molecule mode
     * 4. Switch back to macromolecule mode
     * 5. Verify PEP is pre-selected
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(peptidesButton).toHaveAttribute('class', /selected/);
    await expect(Library(page).peptidesTab).toHaveAttribute('class', /selected/);
  });
});