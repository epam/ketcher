import { Page } from '@playwright/test';
import {
  BondTypeName,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  selectBond,
} from '.';
import { clickInTheMiddleOfTheScreen, dragMouseTo } from '@utils';
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

export async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}
