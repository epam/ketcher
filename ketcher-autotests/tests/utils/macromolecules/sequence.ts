import { Page } from '@playwright/test';

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
