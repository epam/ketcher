import { Locator, Page } from '@playwright/test';
import { moveMouseAway } from '../moveMouseAway';
import { keyboardPressOnCanvas } from '../keyboard';
import { SequenceEditor } from '@tests/pages/macromolecules/canvas/SequenceEditor';

export async function exitFromEditMode(page: Page) {
  await keyboardPressOnCanvas(page, 'Escape');
  await SequenceEditor(page).waitForEditModeToExit();
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
