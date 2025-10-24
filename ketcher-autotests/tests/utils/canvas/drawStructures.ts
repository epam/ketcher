import { Page } from '@playwright/test';
import { getCoordinatesTopAtomOfBenzeneRing } from '.';
import { clickOnCanvas, dragMouseTo } from '@utils';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';

export async function drawReactionWithTwoBenzeneRings(
  page: Page,
  secondBenzeneRingOffset: number,
  arrowOffset: number,
  arrowLenght: number,
) {
  await drawBenzeneRing(page);
  await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
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
  await BottomToolbar(page).Benzene();
  await clickOnCanvas(
    page,
    firstBenzineTopAtom.x,
    firstBenzineTopAtom.y - secondBenzeneRingOffset,
    { from: 'pageTopLeft' },
  );
}
