import { Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MicroAtomOption,
  QueryAtomOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  pressButton,
  clickOnAtom,
  resetCurrentTool,
  getAtomByIndex,
} from '@utils';

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
    .getByRole('combobox', { name: '​' })
    .click();
  await page.getByRole('option', { name: ringbondcount }).click();
  await pressButton(page, button);
}

export async function selectHCount(page: Page, hcount: string, button: string) {
  await page.getByText('Query specific').click();
  await page
    .locator('label')
    .filter({ hasText: 'H count', hasNotText: 'Implicit H count' })
    .getByRole('combobox', { name: '​' })
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
    .getByRole('combobox', { name: '​' })
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
    .getByRole('combobox', { name: '​' })
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

export async function selectElementFromExtendedTable(
  page: Page,
  element: string,
  button: string,
) {
  const extendedTableButton = RightToolbar(page).extendedTableButton;

  await extendedTableButton.click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: button, exact: true }).click();
}

export async function selectRingBondCountOption(
  page: Page,
  atomIndex: number,
  optionTestId: string,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.RingBondCount,
  ]);
  await page
    .getByRole('menuitem', { name: 'Ring bond count', exact: true })
    .getByTestId(optionTestId)
    .click();
  await resetCurrentTool(page);
}

export async function selectHCountOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.HCount,
  ]);
  await page
    .locator(
      `div:nth-child(2) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}

export async function selectSubstitutionCountOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.SubstitutionCount,
  ]);
  await page
    .locator(
      `div:nth-child(3) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}

export async function selectUnsaturatedOption(
  page: Page,
  atomIndex: number,
  selectedOption: string,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.Unsaturated,
  ]);

  await page.getByTestId(`${selectedOption}-option`).click();
  await resetCurrentTool(page);
}

export async function selectImplicitHCountOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.ImplicitHCount,
  ]);
  await page
    .locator(
      `div:nth-child(5) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}

export async function selectAromaticityOption(
  page: Page,
  atomIndex: number,
  optionName: string,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.Aromaticity,
  ]);
  await page.getByText(optionName, { exact: true }).click();
  await resetCurrentTool(page);
}

export async function selectRingMembershipOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.RingMembership,
  ]);
  await page
    .locator(
      `div:nth-child(7) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}

export async function selectRingSizeOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.RingSize,
  ]);
  await page
    .locator(
      `div:nth-child(8) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}

export async function selectConnectivityOption(
  page: Page,
  atomIndex: number,
  optionIndex: number,
) {
  const point = await getAtomByIndex(page, { label: 'C' }, atomIndex);
  await ContextMenu(page, point).click([
    MicroAtomOption.QueryProperties,
    QueryAtomOption.Connectivity,
  ]);
  await page
    .locator(
      `div:nth-child(9) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(${optionIndex})`,
    )
    .click();
  await resetCurrentTool(page);
}
