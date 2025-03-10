import { Locator, Page } from '@playwright/test';
import {
  dragMouseTo,
  LeftPanelButton,
  Monomer,
  MonomerType,
  selectLeftPanelButton,
  selectMacroBond,
  selectRectangleSelectionTool,
  waitForRender,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { getMonomerType } from '@utils/mappers/monomerMapper';

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

    await getMonomerLocator(page, { monomerAlias: currentMonomer })
      .first()
      .hover();
    await page.mouse.down();
    await getMonomerLocator(page, { monomerAlias: nextMonomer })
      .first()
      .hover();
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
  return monomerIDs as number[];
}

export function getMonomerLocatorByAlias(page: Page, monomerAlias: string) {
  return page.locator(
    `[data-testid="monomer"][data-monomeralias="${monomerAlias}"]`,
  );
}

export function getMonomerLocatorById(page: Page, id: number | string) {
  return page
    .locator(`[data-testid="monomer"][data-monomerid="${id}"]`)
    .first();
}

type GetMonomerLocatorOptions = {
  numberOfAttachmentPoints?: string;
  rValues?: boolean[];
} & (
  | {
      monomerAlias?: string;
      monomerType?: MonomerType;
      monomerId?: string | number;
    }
  | Monomer
);

export function getMonomerLocator(
  page: Page,
  options: GetMonomerLocatorOptions,
) {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'monomer';

  if ('testId' in options) {
    attributes['data-monomeralias'] = options.alias;
    attributes['data-monomertype'] = getMonomerType(options);
  } else {
    const { monomerAlias, monomerType, monomerId } = options;
    if (monomerAlias) attributes['data-monomeralias'] = monomerAlias;
    if (monomerType) attributes['data-monomertype'] = monomerType;
    if (monomerId) attributes['data-monomerid'] = String(monomerId);
  }

  const { numberOfAttachmentPoints, rValues } = options;

  if (numberOfAttachmentPoints) {
    attributes['data-number-of-attachment-points'] = numberOfAttachmentPoints;
  }

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

type GetAtomLocatorOptions = {
  atomAlias?: string;
  atomId?: string | number;
};

export function getAtomLocator(page: Page, options: GetAtomLocatorOptions) {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'atom';

  const { atomId, atomAlias } = options;
  if (atomId) attributes['data-atomid'] = String(atomId);
  if (atomAlias) attributes['data-atomalias'] = atomAlias;

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  const locator = page.locator(attributeSelectors);

  return locator;
}

export async function createAntisenseChain(page: Page, monomer: Locator) {
  await monomer.click({ button: 'right', force: true });

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  await createAntisenseStrandOption.click();
}
