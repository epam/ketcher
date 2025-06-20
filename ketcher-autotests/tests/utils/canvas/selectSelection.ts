/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getControlModifier } from '@utils/keyboard';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import {
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  moveMouseAway,
  pasteFromClipboardByKeyboard,
  waitForRender,
} from '..';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

export async function cutAndPaste(page: Page) {
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await selectAllStructuresOnCanvas(page);
  await cutToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
}

export async function copyAndPaste(page: Page) {
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
}

export async function selectAllStructuresOnCanvas(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  const modifier = getControlModifier();

  await waitForRender(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyA`, options),
  );
}
