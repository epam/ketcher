import { Page } from '@playwright/test';

export class MacromoleculesPage {
  static async openMacromoleculeMode(page: Page): Promise<void> {
    const macroBtn = page.locator('[data-testid="macromolecules-button"]');
    const isMacroVisible = await macroBtn.isVisible().catch(() => false);
    if (isMacroVisible) {
      await macroBtn.click();
    }
    await page.waitForSelector('[data-testid="polymer-type-switcher"], [data-testid="sequence-type-switcher"]', { timeout: 10000 }).catch(() => {});
  }

  static async switchToSmallMoleculeMode(page: Page): Promise<void> {
    const smallMolBtn = page.locator('[data-testid="small-molecule-button"]');
    if (await smallMolBtn.isVisible().catch(() => false)) {
      await smallMolBtn.click();
    }
  }

  static async selectPolymerType(page: Page, type: 'RNA' | 'DNA' | 'PEPTIDE'): Promise<void> {
    const labelMap: Record<string, string> = {
      RNA: 'RNA',
      DNA: 'DNA',
      PEPTIDE: 'Peptides',
    };
    const label = labelMap[type];
    const tab = page
      .locator('[data-testid="polymer-type-switcher"] button, [class*="PolymerType"] button')
      .filter({ hasText: label });
    const tabVisible = await tab.isVisible().catch(() => false);
    if (tabVisible) {
      await tab.click();
      return;
    }
    const sequenceTab = page
      .locator('button, [role="tab"]')
      .filter({ hasText: label })
      .first();
    await sequenceTab.click();
  }

  static async getActivePolymerType(page: Page): Promise<string> {
    await page.waitForTimeout(500);
    const value = await page.evaluate((): string => {
      return localStorage.getItem('ketcher-polymer-type') ||
        localStorage.getItem('polymerType') ||
        localStorage.getItem('macromolecule-editor-polymer-type') || '';
    });
    if (value) {
      if (value.toUpperCase().includes('DNA')) return 'DNA';
      if (value.toUpperCase().includes('PEP') || value.toUpperCase().includes('PEPTIDE')) return 'PEPTIDE';
      if (value.toUpperCase().includes('RNA')) return 'RNA';
    }
    const activeBtn = page
      .locator('[data-testid="polymer-type-switcher"] button[class*="active"], [data-testid="polymer-type-switcher"] button[aria-selected="true"], [class*="PolymerType"] button[class*="active"]')
      .first();
    const text = await activeBtn.innerText().catch(() => '');
    if (text.toLowerCase().includes('dna')) return 'DNA';
    if (text.toLowerCase().includes('pep')) return 'PEPTIDE';
    return 'RNA';
  }
}