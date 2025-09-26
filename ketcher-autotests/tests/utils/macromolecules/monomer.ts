import { Locator, Page } from '@playwright/test';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  dragMouseTo,
  Monomer,
  MonomerType,
  SymbolType,
  waitForRender,
} from '@utils';
import {
  MacroBondType,
  MicroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MonomerOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';

export async function moveMonomer(
  page: Page,
  monomer: Locator,
  x: number,
  y: number,
) {
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  await monomer.click();
  await dragMouseTo(x, y, page);
}

export async function moveMonomerOnMicro(
  page: Page,
  monomer: Locator,
  x: number,
  y: number,
) {
  await CommonLeftToolbar(page).selectHandTool();
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  await waitForRender(page, async () => {
    await monomer.click();
  });
  await dragMouseTo(x, y, page);
}

export async function connectMonomersWithBonds(
  page: Page,
  monomerNames: string[],
  bondType: MacroBondType | MicroBondType = MacroBondType.Single,
) {
  await CommonLeftToolbar(page).selectBondTool(bondType);

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

export type MonomerLocatorOptions = {
  numberOfAttachmentPoints?: string;
  rValues?: boolean[];
  hydrogenConnectionNumber?: string | number;
} & (
  | {
      monomerAlias?: string;
      monomerType?: MonomerType;
      monomerId?: string | number;
    }
  | Monomer
);

export enum AttachmentPoint {
  R1 = 'R1',
  R2 = 'R2',
  R3 = 'R3',
  R4 = 'R4',
  R5 = 'R5',
  R6 = 'R6',
  R7 = 'R7',
  R8 = 'R8',
}

/**
 * This function returns locator for monomer in the macromolecule editor.
 * It can be used to find monomers by their alias, type, or ID. It also allows for additional options such as number of attachment points, R values, and hydrogen connection number.
 * It can be used to find monomers by specisic monomer enums, such as Bases, Sugars, and Peptides.
 * It is useful for automating tests and interactions with the macromolecule editor in Ketcher.
 * @param {Page} page - The Playwright page instance where the monomer is located.
 * @param {MonomerLocatorOptions} options - Options for locating the monomer.
 * @returns {Locator} - The locator for the specified monomer.
 * @example
 * const { test, expect } = require('@playwright/test');
 * const { getMonomerLocator } = require('./path/to/your/module');
 * const { Page } = require('playwright');
 *
 * test('should locate a monomer by alias', async ({ page }) => {
 *   const locator = getMonomerLocator(page, { monomerAlias: 'A' });
 *   await expect(locator).toBeVisible();
 * });
 *
 * test('should locate a monomer by type', async ({ page }) => {
 *   const locator = getMonomerLocator(page, { monomerType: MonomerType.AminoAcid });
 *   await expect(locator).toBeVisible();
 * });
 *
 * test('should locate a monomer by ID', async ({ page }) => {
 *   const locator = getMonomerLocator(page, { monomerId: 123 });
 *   await expect(locator).toBeVisible();
 * });
 *
 * test('should locate a monomer with specific options', async ({ page }) => {
 *   const locator = getMonomerLocator(page, {
 *     monomerAlias: 'A',
 *     numberOfAttachmentPoints: '2',
 *     rValues: [true, false],
 *     hydrogenConnectionNumber: '1',
 *   });
 *   await expect(locator).toBeVisible();
 * });
 *
 * test('should take a screenshot of the monomer', async ({ page }) => {
 *   const locator = getMonomerLocator(page, { monomerAlias: 'A' });
 *   await expect(locator).toHaveScreenshot();
 * });
 *
 * test('should take a screenshot of the monomer with specific options', async ({ page }) => {
 *   const locator = getMonomerLocator(page, {
 *     monomerAlias: 'A',
 *     numberOfAttachmentPoints: '2',
 *     rValues: [true, false],
 *     hydrogenConnectionNumber: '1',
 *   });
 *   await expect(locator).toHaveScreenshot();
 *
 * test('should take a screenshot of the monomer from Bases', async ({ page }) => {
 *  const locator = getMonomerLocator(page, Base.A);
 *  await expect(locator).toHaveScreenshot();
 * });
 *
 * test('should take a screenshot of the monomer from Sugars and with specific options', async ({ page }) => {
 *   const locator = getMonomerLocator(page, {
 *     ...Sugar.fR,
 *     rValues: [true, true, true],
 *   });
 *   await expect(locator).toHaveScreenshot();
 **/

export function getMonomerLocator(page: Page, options: MonomerLocatorOptions) {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'monomer';

  if ('testId' in options) {
    attributes['data-monomeralias'] = options.alias;
    attributes['data-monomertype'] = options.monomerType;
    // getMonomerType(options);
  } else {
    const { monomerAlias, monomerType, monomerId } = options;
    if (monomerAlias) attributes['data-monomeralias'] = monomerAlias;
    if (monomerType) attributes['data-monomertype'] = monomerType;
    if (monomerId) attributes['data-monomerid'] = String(monomerId);
  }

  const { numberOfAttachmentPoints, rValues, hydrogenConnectionNumber } =
    options;

  if (numberOfAttachmentPoints) {
    attributes['data-number-of-attachment-points'] = numberOfAttachmentPoints;
  }

  if (
    Object.prototype.hasOwnProperty.call(options, 'hydrogenConnectionNumber')
  ) {
    attributes['data-hydrogen-connection-number'] = String(
      hydrogenConnectionNumber,
    );
  }

  if (rValues) {
    rValues.forEach((value, index) => {
      attributes[`data-R${index + 1}`] = `${value}`;
    });
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  const locator = page.locator(attributeSelectors);

  return locator;
}

export async function createRNAAntisenseChain(page: Page, monomer: Locator) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(
      MonomerOption.CreateAntisenseRNAStrand,
    );
  });
}

export async function modifyInRnaBuilder(page: Page, symbolLocator: Locator) {
  await waitForRender(page, async () => {
    await ContextMenu(page, symbolLocator).click(
      SequenceSymbolOption.ModifyInRNABuilder,
    );
  });
}

export async function createDNAAntisenseChain(page: Page, monomer: Locator) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(
      MonomerOption.CreateAntisenseDNAStrand,
    );
  });
}

export async function deleteHydrogenBond(page: Page, symbol: Locator) {
  await waitForRender(page, async () => {
    await ContextMenu(page, symbol).click(
      SequenceSymbolOption.DeleteHydrogenBonds,
    );
  });
}

type SymbolLocatorOptions = {
  symbolAlias?: string;
  symbolId?: string | number;
  chainId?: string | number;
  sideConnectionNumber?: string | number;
  hasLeftConnection?: boolean;
  hasRightConnection?: boolean;
  hydrogenConnectionNumber?: string | number;
  dataSymbolType?: SymbolType;
  nodeIndexOverall?: string | number;
  isAntisense?: string | boolean;
};

export function getSymbolLocator(
  page: Page,
  options: SymbolLocatorOptions,
): Locator {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'sequence-item';

  const {
    symbolAlias,
    symbolId,
    chainId,
    sideConnectionNumber,
    hasLeftConnection,
    hasRightConnection,
    hydrogenConnectionNumber,
    dataSymbolType,
    nodeIndexOverall,
    isAntisense,
  } = options;
  if (Object.prototype.hasOwnProperty.call(options, 'symbolId')) {
    attributes['data-symbol-id'] = String(symbolId);
  }
  if (Object.prototype.hasOwnProperty.call(options, 'chainId')) {
    attributes['data-chain-id'] = String(chainId);
  }
  if (Object.prototype.hasOwnProperty.call(options, 'sideConnectionNumber')) {
    attributes['data-side-connection-number'] = String(sideConnectionNumber);
  }
  if (Object.prototype.hasOwnProperty.call(options, 'hasLeftConnection')) {
    attributes['data-has-left-connection'] = String(hasLeftConnection);
  }
  if (Object.prototype.hasOwnProperty.call(options, 'hasRightConnection')) {
    attributes['data-has-right-connection'] = String(hasRightConnection);
  }
  if (
    Object.prototype.hasOwnProperty.call(options, 'hydrogenConnectionNumber')
  ) {
    attributes['data-hydrogen-connection-number'] = String(
      hydrogenConnectionNumber,
    );
  }
  if (dataSymbolType) attributes['data-symbol-type'] = dataSymbolType;
  if (Object.prototype.hasOwnProperty.call(options, 'nodeIndexOverall')) {
    attributes['data-nodeIndexOverall'] = String(nodeIndexOverall);
  }
  if (Object.prototype.hasOwnProperty.call(options, 'isAntisense')) {
    attributes['data-isAntisense'] = String(isAntisense);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  const locator = symbolAlias
    ? page.locator(attributeSelectors).getByText(symbolAlias)
    : page.locator(attributeSelectors);

  return locator;
}
