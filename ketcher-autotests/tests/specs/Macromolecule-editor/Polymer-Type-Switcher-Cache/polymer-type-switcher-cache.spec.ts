import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { LibraryTab } from '@tests/pages/constants/library/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  pageReload,
  clearLocalStorage,
  waitForPageInit,
} from '@utils/common/helpers';
import {
  takeEditorScreenshot,
  takePageScreenshot,
} from '@utils';

let page: Page;

test.describe('Polymer Type Switcher Cache', () => {
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
     * 1. Clear local storage to ensure no cache exists
     * 2. Switch to macromolecule mode
     * 3. Verify that RNA button is active/selected by default
     * 4. Verify that RNA library tab is opened by default
     *
     * Version 3.16.0
     */
    await clearLocalStorage(page);
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Check that RNA button is active
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    
    // Check that RNA library tab is opened
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 2 - After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify DNA is still selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    
    // Verify DNA is selected before reload
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify DNA is still selected after reload
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy(); // DNA uses RNA tab
    
    await takeEditorScreenshot(page);
  });

  test('Case 3 - After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify PEP is still selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    // Verify PEP is selected before reload
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify PEP is still selected after reload
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 4 - After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP first, then RNA via UI
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify RNA is selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides(); // First select PEP
    await MacromoleculesTopToolbar(page).rna(); // Then select RNA
    
    // Verify RNA is selected before reload
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify RNA is still selected after reload
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 5 - Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Use Ctrl+Alt+D hotkey to select DNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify DNA is selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+D');
    
    // Verify DNA is selected before reload
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify DNA is still selected after reload
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy(); // DNA uses RNA tab
    
    await takeEditorScreenshot(page);
  });

  test('Case 6 - Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Use Ctrl+Alt+P hotkey to select PEP
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify PEP is selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.keyboard.press('Control+Alt+P');
    
    // Verify PEP is selected before reload
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify PEP is still selected after reload
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 7 - Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP first, then use Ctrl+Alt+R hotkey to select RNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify RNA is selected
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides(); // First select PEP
    await page.keyboard.press('Control+Alt+R');
    
    // Verify RNA is selected before reload
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify RNA is still selected after reload
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 8 - Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Switch to Peptides library tab
     * 3. Reload the page
     * 4. Switch to macromolecule mode again
     * 5. Verify the cached type matches the library tab
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
    
    // Verify peptides tab is selected and PEP button is active
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify peptides is still selected after reload
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 9 - Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default', async ({ FlexCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP
     * 3. Reload the page
     * 4. Switch to macromolecule mode and flex mode
     * 5. Verify peptide library tab is opened
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    
    // Verify PEP is selected and peptides tab is opened in flex mode
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 10 - Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default', async ({ SnakeCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode and snake mode
     * 5. Verify DNA library tab (RNA) is opened
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    
    // Verify DNA is selected and RNA tab is opened in snake mode (DNA uses RNA tab)
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 11 - Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab', async ({ SnakeCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select PEP
     * 3. Switch to snake mode
     * 4. Verify polymer switcher is not visible but PEP governs library tab
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    
    // Verify polymer type switcher buttons are not visible in snake mode
    await expect(MacromoleculesTopToolbar(page).peptidesButton).not.toBeVisible();
    await expect(MacromoleculesTopToolbar(page).rnaButton).not.toBeVisible();
    await expect(MacromoleculesTopToolbar(page).dnaButton).not.toBeVisible();
    
    // Verify peptides library tab is still active (cached type governs)
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 12 - Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab', async ({ FlexCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Select DNA
     * 3. Switch to flex mode
     * 4. Verify polymer switcher is not visible but DNA governs library tab
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    
    // Verify polymer type switcher buttons are not visible in flex mode
    await expect(MacromoleculesTopToolbar(page).peptidesButton).not.toBeVisible();
    await expect(MacromoleculesTopToolbar(page).rnaButton).not.toBeVisible();
    await expect(MacromoleculesTopToolbar(page).dnaButton).not.toBeVisible();
    
    // Verify RNA library tab is still active (DNA uses RNA tab)
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 13 - Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default
     * Scenario:
     * 1. Select PEP first
     * 2. Clear local storage
     * 3. Reload page
     * 4. Switch to macromolecule mode
     * 5. Verify RNA is selected as fallback default
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    // Verify PEP is selected before clearing cache
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    
    await clearLocalStorage(page);
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify RNA is selected as fallback default after clearing cache
    await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });

  test('Case 14 - Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted
     * Scenario:
     * 1. Switch to macromolecule mode
     * 2. Switch through RNA → DNA → PEP → DNA
     * 3. Reload the page
     * 4. Switch to macromolecule mode
     * 5. Verify only the last selection (DNA) is persisted
     *
     * Version 3.16.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Switch through the sequence: RNA → DNA → PEP → DNA
    await MacromoleculesTopToolbar(page).rna();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).dna();
    
    // Verify DNA is the last selection
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify only the last selection (DNA) is persisted
    await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.RNA)).resolves.toBeTruthy(); // DNA uses RNA tab
    
    await takeEditorScreenshot(page);
  });

  test('Case 15 - Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction', async ({ MoleculesCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction
     * Scenario:
     * 1. Switch to macromolecule mode and select PEP
     * 2. Switch back to molecule mode
     * 3. Switch to macromolecule mode again
     * 4. Verify PEP is pre-selected without additional interaction
     *
     * Version 3.16.0
     */
    // First set PEP in cache by switching to macro mode and selecting PEP
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    
    // Verify PEP is selected
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    
    // Switch back to molecule mode
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    
    // Switch to macromolecule mode again
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Verify PEP is pre-selected without additional user interaction
    await expect(MacromoleculesTopToolbar(page).peptidesButton).toHaveAttribute('data-isactive', 'true');
    await expect(Library(page).isTabOpened(LibraryTab.Peptides)).resolves.toBeTruthy();
    
    await takeEditorScreenshot(page);
  });
});