import { Locator, Page } from '@playwright/test';
import { moveMouseAway } from '@utils';

export async function clickOnSequenceSymbol(
  page: Page,
  symbolText: string,
  clickOptions?: { button?: 'right' | 'left'; nthNumber?: number },
) {
  const symbolLocator = getSequenceSymbolLocator(
    page,
    symbolText,
    clickOptions?.nthNumber,
  );
  await symbolLocator.hover();
  await symbolLocator.click(clickOptions);
}

export async function clickOnSequenceSymbolByIndex(
  page: Page,
  symbolIndex: number,
) {
  const symbolLocator = page.locator(
    `g:nth-child(${symbolIndex.toString()}) > text`,
  );
  await symbolLocator.hover();
  await symbolLocator.click();
}

export function getSequenceSymbolLocator(
  page: Page,
  symbolText: string,
  nthNumber = 0,
) {
  return page
    .getByTestId('ketcher-canvas')
    .getByText(symbolText)
    .nth(nthNumber)
    .locator('..');
}

export async function selectSequenceRangeInEditMode(
  page: Page,
  fromSymbol: Locator,
  toSymbol: Locator,
) {
  await fromSymbol.hover();
  await page.mouse.down();

  // it needs to trigger mousemove event several times to activate selection mode
  // due to the specific of implementation
  await page.mouse.move(0, 0);
  await page.mouse.move(10, 10);

  await toSymbol.hover();

  await page.mouse.up();
  await moveMouseAway(page);
}
