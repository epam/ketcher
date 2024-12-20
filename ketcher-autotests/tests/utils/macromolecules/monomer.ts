import { Locator, Page } from '@playwright/test';
import {
  dragMouseTo,
  LeftPanelButton,
  MonomerType,
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
          const monomerId = element.getAttribute('data-monomerid');
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
    .locator(`[data-testid="monomer"][data-monomerid="${id}"]`)
    .first();
}

export async function getMonomerLocator(
  page: Page,
  {
    monomerAlias,
    monomerType,
    monomerId,
    numberOfAttachmentPoints,
    rValues,
  }: {
    monomerAlias?: string;
    monomerType?: MonomerType;
    monomerId?: string | number;
    numberOfAttachmentPoints?: string;
    rValues?: boolean[];
  },
): Promise<Locator> {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'monomer';

  if (monomerAlias) attributes['data-monomeralias'] = monomerAlias;
  if (numberOfAttachmentPoints) {
    attributes['data-number-of-attachment-points'] = numberOfAttachmentPoints;
  }
  if (monomerType) attributes['data-monomertype'] = monomerType;
  if (monomerId) attributes['data-monomerid'] = String(monomerId);

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  let locator = page.locator(attributeSelectors);

  if (rValues) {
    rValues.forEach((value, index) => {
      locator = locator.filter({
        has: page.locator(`[data-R${index + 1}="${value}"]`),
      });
    });
  }

  return locator;
}
