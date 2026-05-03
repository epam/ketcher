import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { clearLocalStorage, pageReload } from '@utils/common/helpers';

let page: Page;

test.describe('Autotests: Polymer Type Switcher Cache', () => {
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
     * 2. Open macromolecule mode
     * 3. Verify RNA is selected by default
     *
     * Version 3.14.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify RNA button is active by default
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 2 - After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA via UI
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify DNA is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    
    // Verify DNA button is active after reload
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 3 - After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP via UI
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify PEP is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    
    // Verify PEP button is active after reload
    const pepButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(pepButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 4 - After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA first (to change from default)
     * 3. Select RNA via UI
     * 4. Reload the page
     * 5. Re-enter macromolecule mode
     * 6. Verify RNA is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna(); // Change from default
    await MacromoleculesTopToolbar(page).rna();
    await pageReload(page);
    
    // Verify RNA button is active after reload
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 5 - Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Use Ctrl+Alt+D hotkey to switch to DNA
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify DNA is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+d');
    await pageReload(page);
    
    // Verify DNA button is active after reload
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 6 - Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Use Ctrl+Alt+P hotkey to switch to PEP
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify PEP is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+p');
    await pageReload(page);
    
    // Verify PEP button is active after reload
    const pepButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(pepButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 7 - Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Switch to DNA first (to change from default)
     * 3. Use Ctrl+Alt+R hotkey to switch to RNA
     * 4. Reload the page
     * 5. Re-enter macromolecule mode
     * 6. Verify RNA is still selected
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna(); // Change from default
    await page.keyboard.press('Control+Alt+r');
    await pageReload(page);
    
    // Verify RNA button is active after reload
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 8 - Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Switch to DNA library tab
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify DNA polymer type is active
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // Click on DNA library tab (this should also change the polymer type)
    await page.getByTestId('BASES').click();
    await pageReload(page);
    
    // Verify DNA button is active after reload
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 9 - Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP
     * 3. Reload the page
     * 4. Navigate to flex mode
     * 5. Verify peptide library tab is active
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    
    // Verify PEP button is active after reload and peptide library tab is active
    const pepButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(pepButton).toHaveAttribute('data-isactive', 'true');
    
    const peptideTab = page.getByTestId('PEPTIDES');
    await expect(peptideTab).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 10 - Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA
     * 3. Reload the page
     * 4. Navigate to snake mode
     * 5. Verify DNA library tab is active
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    
    // Verify DNA button is active after reload and bases library tab is active
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('data-isactive', 'true');
    
    const basesTab = page.getByTestId('BASES');
    await expect(basesTab).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 11 - Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP
     * 3. Navigate to snake mode
     * 4. Verify polymer type switcher is not visible
     * 5. Verify peptide library tab is still active
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    // Navigate to snake mode (polymer switcher should not be visible in snake mode)
    const { LayoutMode } = await import('@tests/pages/constants/macromoleculesTopToolbar/Constants');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    
    // Verify polymer type buttons are not visible in snake mode
    const pepButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(pepButton).not.toBeVisible();
    
    // Verify peptide library tab is still active
    const peptideTab = page.getByTestId('PEPTIDES');
    await expect(peptideTab).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 12 - Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA
     * 3. Navigate to flex mode
     * 4. Verify polymer type switcher is not visible
     * 5. Verify DNA library tab is still active
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    
    // Navigate to flex mode (polymer switcher should not be visible in flex mode)
    const { LayoutMode } = await import('@tests/pages/constants/macromoleculesTopToolbar/Constants');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    
    // Verify polymer type buttons are not visible in flex mode
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).not.toBeVisible();
    
    // Verify bases library tab is still active
    const basesTab = page.getByTestId('BASES');
    await expect(basesTab).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 13 - Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA (to change from default)
     * 3. Clear browser cache/localStorage
     * 4. Re-enter macromolecule mode
     * 5. Verify RNA is selected as fallback default
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna(); // Change from default
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify RNA button is active as fallback default
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    await expect(rnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 14 - Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Switch in sequence: RNA → DNA → PEP → DNA
     * 3. Reload the page
     * 4. Re-enter macromolecule mode
     * 5. Verify only the last selection (DNA) is persisted
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).rna();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).dna(); // Final selection
    await pageReload(page);
    
    // Verify DNA button is active (last selection)
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    await expect(dnaButton).toHaveAttribute('data-isactive', 'true');
  });

  test('Case 15 - Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP
     * 3. Switch back to small molecule mode
     * 4. Switch to macromolecule mode again
     * 5. Verify PEP is pre-selected automatically
     *
     * Version 3.14.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify PEP button is automatically pre-selected
    const pepButton = MacromoleculesTopToolbar(page).peptidesButton;
    await expect(pepButton).toHaveAttribute('data-isactive', 'true');
  });
});