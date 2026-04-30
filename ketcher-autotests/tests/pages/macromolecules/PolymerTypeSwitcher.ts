import { Page, Locator } from '@playwright/test';

export function PolymerTypeSwitcher(page: Page) {
  const getRNAButton = (): Locator =>
    page.getByRole('button', { name: /RNA/i }).or(
      page.locator('[data-testid="rna-tab"]')
    ).first();

  const getDNAButton = (): Locator =>
    page.getByRole('button', { name: /DNA/i }).or(
      page.locator('[data-testid="dna-tab"]')
    ).first();

  const getPEPButton = (): Locator =>
    page.getByRole('button', { name: /PEP/i }).or(
      page.locator('[data-testid="pep-tab"]')
    ).first();

  const selectRNA = async (): Promise<void> => {
    await getRNAButton().click();
  };

  const selectDNA = async (): Promise<void> => {
    await getDNAButton().click();
  };

  const selectPEP = async (): Promise<void> => {
    await getPEPButton().click();
  };

  return {
    getRNAButton,
    getDNAButton,
    getPEPButton,
    selectRNA,
    selectDNA,
    selectPEP,
  };
}