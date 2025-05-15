import { Page } from '@playwright/test';
import { drawBenzeneRing, getCoordinatesTopAtomOfBenzeneRing } from '.';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';

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
  await page.getByRole('button', { name: 'Benzene (T)' }).click();
  await clickOnCanvas(
    page,
    firstBenzineTopAtom.x,
    firstBenzineTopAtom.y - secondBenzeneRingOffset,
  );
}

export async function drawStructure(page: Page) {
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}
