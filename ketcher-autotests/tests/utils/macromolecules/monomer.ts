import { Locator, Page } from '@playwright/test';
import {
  dragMouseTo,
  LeftPanelButton,
  selectLeftPanelButton,
  selectMacroBond,
  selectRectangleSelectionTool,
  waitForRender,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

export async function moveMonomer(
  page: Page,
  monomer: Locator,
  x: number,
  y: number,
) {
  await selectRectangleSelectionTool(page);
  await monomer.click();
  await dragMouseTo(x, y, page);
}

export async function moveMonomerOnMicro(
  page: Page,
  monomer: Locator,
  x: number,
  y: number,
) {
  await selectLeftPanelButton(LeftPanelButton.HandTool, page);
  await selectRectangleSelectionTool(page);
  await waitForRender(page, async () => {
    await monomer.click();
  });
  await dragMouseTo(x, y, page);
}

export async function connectMonomersWithBonds(
  page: Page,
  monomerNames: string[],
) {
  await selectMacroBond(page, MacroBondTool.SINGLE);

  for (let i = 0; i < monomerNames.length - 1; i++) {
    const currentMonomer = monomerNames[i];
    const nextMonomer = monomerNames[i + 1];

    await page.getByText(currentMonomer).locator('..').first().hover();
    await page.mouse.down();
    await page.getByText(nextMonomer).locator('..').first().hover();
    await page.mouse.up();
  }
}

export async function getMonomerIDsByAlias(
  page: Page,
  name: string,
): Promise<number[]> {
  const monomerIDs = await page
    .locator('[data-testid="monomer"]')
    .evaluateAll((elements, alias) => {
      return elements
        .filter(
          (element) => element.getAttribute('data-monomeralias') === alias,
        )
        .map((element) => {
          const monomerId = element.getAttribute('data-monomerId');
          return monomerId ? parseInt(monomerId, 10) : null;
        })
        .filter((id) => id !== null);
    }, name);
  return monomerIDs;
}

export async function getMonomerLocatorByAlias(
  page: Page,
  monomerAlias: string,
): Promise<Locator> {
  return page.locator(
    `[data-testid="monomer"][data-monomeralias="${monomerAlias}"]`,
  );
}

export async function getMonomerLocatorById(
  page: Page,
  id: number | string,
): Promise<Locator> {
  return page
    .locator(`[data-testid="monomer"][data-monomerId="${id}"]`)
    .first();
}
