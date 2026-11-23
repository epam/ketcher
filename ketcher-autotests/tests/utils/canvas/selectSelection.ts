import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheCanvas } from '@utils/clicks';
import {
  copyFromCanvasToClipboardByKeyboard,
  cutFromCanvasToClipboardByKeyboard,
  pasteFromClipboardToCanvasByKeyboard,
} from './helpers';
import { moveMouseAway } from '../moveMouseAway';
import { waitForRender } from '../common/loaders/waitForRender';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

export async function cutAndPaste(page: Page) {
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheCanvas(page);
  await selectAllStructuresOnCanvas(page);
  await cutFromCanvasToClipboardByKeyboard(page);
  await pasteFromClipboardToCanvasByKeyboard(page);
}

export async function copyAndPaste(page: Page) {
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheCanvas(page);
  await moveMouseAway(page);
  await selectAllStructuresOnCanvas(page);
  await copyFromCanvasToClipboardByKeyboard(page);
  await pasteFromClipboardToCanvasByKeyboard(page);
}

export async function selectAllStructuresOnCanvas(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  await waitForRender(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyA`, options),
  );
}
