/* eslint-disable no-magic-numbers */
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

export async function doubleClickOnSequenceSymbol(
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
  await symbolLocator.dblclick(clickOptions);
}

export async function hoverOnSequenceSymbol(
  page: Page,
  symbolText: string,
  nthNumber?: number,
) {
  const symbolLocator = getSequenceSymbolLocator(page, symbolText, nthNumber);
  await symbolLocator.hover();
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
