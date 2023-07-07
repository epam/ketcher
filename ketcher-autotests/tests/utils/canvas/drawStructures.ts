import { Page } from '@playwright/test';
import { drawBenzeneRing, getCoordinatesTopAtomOfBenzeneRing } from '.';
import { dragMouseTo } from '@utils';
import { ArrowTool, selectNestedTool } from './tools/selectNestedTool';

export async function drawReactionWithTwoBenzeneRings(
  page: Page,
  secondBenzeneRingOffset: number,
  arrowOffset: number,
  arrowLenght: number,
) {
  await drawBenzeneRing(page);
  await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
  const firstBenzineTopAtom = await getCoordinatesTopAtomOfBenzeneRing(page);
  await page.mouse.move(
    firstBenzineTopAtom.x,
    firstBenzineTopAtom.y - arrowOffset,
  );
  await dragMouseTo(
    firstBenzineTopAtom.x,
    firstBenzineTopAtom.y - arrowLenght,
    page,
  );
  await page.getByRole('button', { name: 'Benzene (T)' }).click();
  await page.mouse.click(
    firstBenzineTopAtom.x,
    firstBenzineTopAtom.y - secondBenzeneRingOffset,
  );
}
