import { Page, test } from '@playwright/test';
import {
  BondType,
  BondTypeName,
  clickInTheMiddleOfTheScreen,
  doubleClickOnBond,
  selectBond,
  waitForPageInit,
} from '@utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

async function waitForBondPropsModal(page: Page) {
  await expect(page.getByTestId('bondProps-dialog')).toBeVisible();
}

test.describe('Checking bond attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnBond(page, BondType.SINGLE, 0);
    await waitForBondPropsModal(page);
  });
});
