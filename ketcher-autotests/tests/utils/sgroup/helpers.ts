import { Locator, Page } from '@playwright/test';
import { waitForRender } from '@utils/common';

export async function expandAbbreviation(page: Page, sGroup: Locator) {
  await sGroup.click({ button: 'right', force: true });
  await waitForRender(page, async () => {
    await page.getByText('Expand Abbreviation').click({ force: true });
  });
}

export async function contractAbbreviation(page: Page, sGroup: Locator) {
  await sGroup.click({ button: 'right', force: true });
  await waitForRender(page, async () => {
    await page.getByText('Contract Abbreviation').click({ force: true });
  });
}

export async function removeAbbreviation(page: Page, sGroup: Locator) {
  await sGroup.click({ button: 'right', force: true });
  await waitForRender(page, async () => {
    await page.getByText('Remove Abbreviation').click({ force: true });
  });
}
