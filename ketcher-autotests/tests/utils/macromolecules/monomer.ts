import { Locator, Page } from '@playwright/test';
import {
  dragMouseTo,
  LeftPanelButton,
  Monomer,
  MonomerType,
  selectLeftPanelButton,
  selectMacroBond,
  selectRectangleSelectionTool,
  SymbolType,
  waitForRender,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { getMonomerType } from '@utils/mappers/monomerMapper';
import { clickOnSequenceSymbol } from './sequence';

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

type MonomerLocatorOptions = {
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

export function getMonomerLocator(page: Page, options: MonomerLocatorOptions) {
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

export async function createRNAAntisenseChain(page: Page, monomer: Locator) {
  await monomer.click({ button: 'right', force: true });

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_rna_chain')
    .first();

  await createAntisenseStrandOption.click();
}

export async function createDNAAntisenseChain(page: Page, monomer: Locator) {
  await monomer.click({ button: 'right', force: true });

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_dna_chain')
    .first();

  await createAntisenseStrandOption.click();
}

export function getSequenceMonomerLocator(
  page: Page,
  options: MonomerLocatorOptions,
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

export async function createRNAAntisenseStrand(
  page: Page,
  letter: string,
  nthNumber = 0,
) {
  await clickOnSequenceSymbol(page, letter, {
    nthNumber,
    button: 'right',
  });

  const createAntisenseStrandOption = page.getByTestId(
    'create_rna_antisense_strand',
  );

  await createAntisenseStrandOption.click();
}

export async function createDNAAntisenseStrand(
  page: Page,
  letter: string,
  nthNumber = 0,
) {
  await clickOnSequenceSymbol(page, letter, {
    nthNumber,
    button: 'right',
  });

  const createAntisenseStrandOption = page.getByTestId(
    'create_dna_antisense_strand',
  );

  await createAntisenseStrandOption.click();
}
