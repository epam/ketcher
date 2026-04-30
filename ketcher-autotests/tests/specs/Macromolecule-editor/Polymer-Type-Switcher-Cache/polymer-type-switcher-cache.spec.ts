import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { LibraryTab } from '@tests/pages/constants/library/Constants';
import { pageReload, clearLocalStorage } from '@utils/common/helpers';
import { keyboardPressOnCanvas } from '@utils/keyboard';
import { getAltModifier } from '@utils/keyboard';

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
     * 1. Clear browser cache/localStorage
     * 2. Switch to macromolecule mode
     * 3. Verify RNA is selected by default
     *
     * Version 3.12.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
  });

  test('Case 2 - After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting DNA via the polymer type switcher UI, reload the page and verify DNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Select DNA via the polymer type switcher UI
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify DNA is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const dnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(dnaTabSelected).toBeTruthy();
    
    // Verify DNA button is active in the toolbar
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const isActive = await dnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 3 - After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting PEP via the polymer type switcher UI, reload the page and verify PEP is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Select PEP via the polymer type switcher UI
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify PEP is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
    
    // Verify Peptides button is active in the toolbar
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    const isActive = await peptidesButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 4 - After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: After selecting RNA via the polymer type switcher UI, reload the page and verify RNA is still selected when re-entering macromolecule mode
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Select RNA via the polymer type switcher UI
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify RNA is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).rna();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
    
    // Verify RNA button is active in the toolbar
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    const isActive = await rnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 5 - Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+D hotkey to switch to DNA, reload, and confirm DNA is restored from cache on next session
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Use Ctrl+Alt+D hotkey to switch to DNA
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify DNA is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const altModifier = getAltModifier();
    await keyboardPressOnCanvas(page, `Control+${altModifier}+d`);
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const dnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(dnaTabSelected).toBeTruthy();
    
    // Verify DNA button is active in the toolbar
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const isActive = await dnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 6 - Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+P hotkey to switch to PEP, reload, and confirm PEP is restored from cache on next session
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Use Ctrl+Alt+P hotkey to switch to PEP
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify PEP is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const altModifier = getAltModifier();
    await keyboardPressOnCanvas(page, `Control+${altModifier}+p`);
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
    
    // Verify Peptides button is active in the toolbar
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    const isActive = await peptidesButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 7 - Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Use Ctrl+Alt+R hotkey to switch to RNA, reload, and confirm RNA is restored from cache on next session
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Use Ctrl+Alt+R hotkey to switch to RNA
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify RNA is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const altModifier = getAltModifier();
    await keyboardPressOnCanvas(page, `Control+${altModifier}+r`);
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
    
    // Verify RNA button is active in the toolbar
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    const isActive = await rnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 8 - Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Change the polymer type by switching the library tab, reload, and verify the cached type matches the last library tab used
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to Peptides library tab
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify Peptides tab is still selected
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
  });

  test('Case 9 - Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to PEP, reload the page, navigate to flex mode, and verify the peptide library tab is opened by default
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to PEP
     * 3. Reload the page
     * 4. Enter macromolecule mode and navigate to flex mode
     * 5. Verify peptide library tab is opened by default
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
  });

  test('Case 10 - Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to DNA, reload the page, navigate to snake mode, and verify the DNA library tab is opened by default
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to DNA
     * 3. Reload the page
     * 4. Enter macromolecule mode and navigate to snake mode
     * 5. Verify DNA (RNA) library tab is opened by default
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
    
    // Verify DNA button is active in the toolbar
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const isActive = await dnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 11 - Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in snake mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to PEP
     * 3. Navigate to snake mode
     * 4. Verify polymer type switcher is not visible but peptides tab is active
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    
    // Verify polymer type buttons are not visible in snake mode
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    
    expect(await rnaButton.isVisible()).toBeFalsy();
    expect(await dnaButton.isVisible()).toBeFalsy();
    expect(await peptidesButton.isVisible()).toBeFalsy();
    
    // But peptides tab should still be active
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
  });

  test('Case 12 - Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Verify the polymer type switcher UI element is not visible in flex mode but the cached type still governs the active library tab
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to DNA
     * 3. Navigate to flex mode
     * 4. Verify polymer type switcher is not visible but RNA tab is active
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    
    // Verify polymer type buttons are not visible in flex mode
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    
    expect(await rnaButton.isVisible()).toBeFalsy();
    expect(await dnaButton.isVisible()).toBeFalsy();
    expect(await peptidesButton.isVisible()).toBeFalsy();
    
    // But RNA tab should still be active (DNA uses RNA library tab)
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
  });

  test('Case 13 - Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Clear browser cache/localStorage, open macromolecule mode, and confirm RNA is selected as the fallback default
     * Scenario:
     * 1. Clear browser cache/localStorage
     * 2. Enter macromolecule mode
     * 3. Verify RNA is selected as the fallback default
     *
     * Version 3.12.0
     */
    await clearLocalStorage(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
    
    // Verify RNA button is active in the toolbar
    const rnaButton = MacromoleculesTopToolbar(page).rnaButton;
    const isActive = await rnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 14 - Switch polymer type multiple times in sequence (RNA → DNA → PEP → DNA), reload, and verify only the last selection (DNA) is persisted', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch polymer type multiple times in sequence, reload, and verify only the last selection is persisted
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch RNA → DNA → PEP → DNA in sequence
     * 3. Reload the page
     * 4. Enter macromolecule mode again
     * 5. Verify only the last selection (DNA) is persisted
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Sequence: RNA → DNA → PEP → DNA
    await MacromoleculesTopToolbar(page).rna();
    await MacromoleculesTopToolbar(page).dna();
    await MacromoleculesTopToolbar(page).peptides();
    await MacromoleculesTopToolbar(page).dna();
    
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Only the last selection (DNA) should be persisted
    const rnaTabSelected = await Library(page).isTabOpened(LibraryTab.RNA);
    expect(rnaTabSelected).toBeTruthy();
    
    // Verify DNA button is active in the toolbar
    const dnaButton = MacromoleculesTopToolbar(page).dnaButton;
    const isActive = await dnaButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });

  test('Case 15 - Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected without requiring additional user interaction', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9880
     * Description: Switch to macromolecule mode from small molecule mode with a cached PEP value and verify PEP is pre-selected
     * Scenario:
     * 1. Enter macromolecule mode
     * 2. Switch to PEP
     * 3. Switch to small molecule mode
     * 4. Switch back to macromolecule mode
     * 5. Verify PEP is pre-selected without additional interaction
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).peptides();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    const peptidesTabSelected = await Library(page).isTabOpened(LibraryTab.Peptides);
    expect(peptidesTabSelected).toBeTruthy();
    
    // Verify Peptides button is active in the toolbar
    const peptidesButton = MacromoleculesTopToolbar(page).peptidesButton;
    const isActive = await peptidesButton.getAttribute('data-isactive');
    expect(isActive).toBe('true');
  });
});