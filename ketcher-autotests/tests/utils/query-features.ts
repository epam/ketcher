import { Page } from '@playwright/test';
import { BondTypeName } from '@utils';

// Custom query - bond properties:

export async function setCustomQueryForBond(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('bond-custom-query').fill(customQuery);
}

// Bond attributes:
// TO DO: bondType must be specific type, not a string
export async function setBondType(page: Page, bondType: BondTypeName | string) {
  await page.getByTestId('type-input-span').click();
  await page.getByTestId(`${bondType}-option`).click();
}

export async function setBondTopology(page: Page, bondTopologyTestId: string) {
  await page.getByTestId('topology-input-span').click();
  await page.getByTestId(bondTopologyTestId).click();
}

export async function setReactingCenter(
  page: Page,
  reactingCenterOptionTestId: string,
) {
  await page.getByTestId('reacting-center-input-span').click();
  await page.getByTestId(reactingCenterOptionTestId).click();
}
