import { test } from '@playwright/test';
import * as Utils from '@utils';

test('drawing atom, then dragging other atom', async ({ page }) => {
  await page.goto('');

  await Utils.selectAtom(Utils.AtomButton.Carbon, page);
  await Utils.clickInTheMiddleOfTheScreen(page);

  await Utils.selectAtom(Utils.AtomButton.Nitrogen, page);
  await Utils.moveMouseToTheMiddleOfTheScreen(page);

  const { x, y } = await Utils.getCoordinatesOfTheMiddleOfTheScreen(page);
  await Utils.dragMouseTo(x + 100, y, page);

  await Utils.takeEditorScreenshot(page);
});

test('drawing benzene ring, then adding single bond', async ({ page }) => {
  await page.goto('');

  await Utils.drawBenzeneRing(page);

  await Utils.selectBond(Utils.BondTypeName.Single, page);

  const { x, y } = await Utils.getCoordinatesTopAtomOfBenzeneRing(page);
  await page.mouse.click(x, y);

  await Utils.takeEditorScreenshot(page);
});
