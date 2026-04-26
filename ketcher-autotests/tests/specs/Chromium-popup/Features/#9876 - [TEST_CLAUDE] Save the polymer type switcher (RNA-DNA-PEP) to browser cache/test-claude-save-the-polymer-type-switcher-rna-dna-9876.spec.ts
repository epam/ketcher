import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils';
import { MacromoleculesPage } from '@tests/pages/macromolecules/MacromoleculesPage';

test.describe('Polymer type switcher (RNA/DNA/PEP) cached in localStorage', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
  });

  test('RNA is selected by default when no cache exists', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('RNA');
  });

  test('DNA persists after selecting via UI and reloading', async ({ page }) => {
    await MacromoleculesPage.selectPolymerType(page, 'DNA');
    await page.reload();
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('DNA');
  });

  test('PEP persists after selecting via UI and reloading', async ({ page }) => {
    await MacromoleculesPage.selectPolymerType(page, 'PEPTIDE');
    await page.reload();
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('PEPTIDE');
  });

  test('RNA persists after explicitly selecting RNA and reloading', async ({ page }) => {
    await MacromoleculesPage.selectPolymerType(page, 'DNA');
    await MacromoleculesPage.selectPolymerType(page, 'RNA');
    await page.reload();
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('RNA');
  });

  test('only last selected type is persisted after rapid switches', async ({ page }) => {
    await MacromoleculesPage.selectPolymerType(page, 'RNA');
    await MacromoleculesPage.selectPolymerType(page, 'DNA');
    await MacromoleculesPage.selectPolymerType(page, 'PEPTIDE');
    await MacromoleculesPage.selectPolymerType(page, 'DNA');
    await page.reload();
    await waitForPageInit(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('DNA');
  });

  test('polymer type is restored after switching to small molecule mode and back', async ({ page }) => {
    await MacromoleculesPage.selectPolymerType(page, 'PEPTIDE');
    await MacromoleculesPage.switchToSmallMoleculeMode(page);
    await MacromoleculesPage.openMacromoleculeMode(page);
    const activeTab = await MacromoleculesPage.getActivePolymerType(page);
    expect(activeTab).toBe('PEPTIDE');
  });
});