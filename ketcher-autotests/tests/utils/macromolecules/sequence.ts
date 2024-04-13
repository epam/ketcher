import { Page } from '@playwright/test';

export async function clickOnSequenceSymbol(
  page: Page,
  symbolText: string,
  clickOptions?: { button: 'right' | 'left' },
) {
  const symbolLocator = await getSequenceSymbolLocator(page, symbolText);
  await symbolLocator.click(clickOptions);
}

export function getSequenceSymbolLocator(
  page: Page,
  symbolText: string,
  nthNumber = 0,
) {
  return page
    .getByTestId('ketcher-canvas')
    .getByText(symbolText)
    .nth(nthNumber);
}
