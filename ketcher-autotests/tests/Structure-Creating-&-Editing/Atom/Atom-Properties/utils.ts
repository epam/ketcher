import { Page } from '@playwright/test';
import { selectAtomInToolbar, pressButton, AtomButton } from '@utils';

export async function selectAtomLabel(
  page: Page,
  label: string,
  button: string,
) {
  await page.getByLabel('Label').fill(label);
  await pressButton(page, button);
}

export async function fillAliasForAtom(
  page: Page,
  alias: string,
  button: string,
) {
  await page.getByLabel('Alias').fill(alias);
  await pressButton(page, button);
}

export async function fillChargeForAtom(
  page: Page,
  charge: string,
  button: string,
) {
  await page.getByLabel('Charge').fill(charge);
  await pressButton(page, button);
}

export async function fillIsotopeForAtom(
  page: Page,
  isotope: string,
  button: string,
) {
  await page.getByLabel('Isotope').fill(isotope);
  await pressButton(page, button);
}

export async function selectValenceForAtom(
  page: Page,
  valence: string,
  button: string,
) {
  await page.locator('label').filter({ hasText: 'Valence' }).click();
  await page.getByRole('option', { name: valence, exact: true }).click();
  await pressButton(page, button);
}

export async function selectRadical(
  page: Page,
  radical: string,
  button: string,
) {
  await page.locator('label').filter({ hasText: 'Radical' }).click();
  await page.getByRole('option', { name: radical }).click();
  await pressButton(page, button);
}

export async function selectRingBondCount(
  page: Page,
  ringbondcount: string,
  button: string,
) {
  await page.getByText('Query specific').click();
  await page
    .locator('label')
    .filter({ hasText: 'Ring bond count' })
    .getByRole('button', { name: '​' })
    .click();
  await page.getByRole('option', { name: ringbondcount }).click();
  await pressButton(page, button);
}

export async function selectHCount(page: Page, hcount: string, button: string) {
  await page.getByText('Query specific').click();
  await page
    .locator('label')
    .filter({ hasText: 'H count', hasNotText: 'Implicit H count' })
    .getByRole('button', { name: '​' })
    .click();
  await page.getByRole('option', { name: hcount }).click();
  await pressButton(page, button);
}

export async function selectSubstitutionCount(
  page: Page,
  substitutioncount: string,
  button: string,
) {
  await page.getByText('Query specific').click();
  await page
    .locator('label')
    .filter({ hasText: 'Substitution count' })
    .getByRole('button', { name: '​' })
    .click();
  await page.getByRole('option', { name: substitutioncount }).click();
  await pressButton(page, button);
}

export async function selectUnsaturated(page: Page, button: string) {
  await page.getByText('Query specific').click();
  await page.getByLabel('Unsaturated').check();
  await pressButton(page, button);
}

export async function selectReactionFlagsInversion(
  page: Page,
  inversion: string,
  finalizationButtonName?: 'Apply' | 'Cancel',
) {
  await page.getByText('Reaction flags').click();
  await page
    .locator('label')
    .filter({ hasText: 'Inversion' })
    .getByRole('button', { name: '​' })
    .click();
  await page.getByRole('option', { name: inversion }).click();
  if (finalizationButtonName) {
    pressButton(page, finalizationButtonName);
  }
}

export async function selectExactChange(
  page: Page,
  finalizationButtonName?: 'Apply' | 'Cancel',
) {
  await page.getByText('Reaction flags').click();
  await page.getByLabel('Exact change').check();
  if (finalizationButtonName) {
    pressButton(page, finalizationButtonName);
  }
}

export async function selectThreeAtomsFromPeriodicTable(
  page: Page,
  selectlisting: 'List' | 'Not List',
  atom1: string,
  atom2: string,
  atom3: string,
  button: string,
) {
  await selectAtomInToolbar(AtomButton.Periodic, page);
  await page.getByText(selectlisting, { exact: true }).click();
  await pressButton(page, atom1);
  await pressButton(page, atom2);
  await pressButton(page, atom3);
  await page.getByRole('button', { name: button, exact: true }).click();
}

export async function selectElementFromExtendedTable(
  page: Page,
  element: string,
  button: string,
) {
  await selectAtomInToolbar(AtomButton.Extended, page);
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: button, exact: true }).click();
}
