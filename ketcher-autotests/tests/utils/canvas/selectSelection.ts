/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getControlModifier } from '@utils/keyboard';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import { INPUT_DELAY } from '@utils/globals';
import { moveMouseAway, waitForRender } from '..';
import { selectAreaSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';

export async function cutAndPaste(page: Page) {
  const modifier = getControlModifier();
  await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await keyboardPressOnCanvas(page, `${modifier}+KeyA`, { delay: INPUT_DELAY });
  await keyboardPressOnCanvas(page, `${modifier}+KeyX`, { delay: INPUT_DELAY });
  await keyboardPressOnCanvas(page, `${modifier}+KeyV`, { delay: INPUT_DELAY });
}

export async function copyAndPaste(page: Page) {
  const modifier = getControlModifier();
  await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);
  await keyboardPressOnCanvas(page, `${modifier}+KeyA`, { delay: INPUT_DELAY });
  await keyboardPressOnCanvas(page, `${modifier}+KeyC`, { delay: INPUT_DELAY });
  await keyboardPressOnCanvas(page, `${modifier}+KeyV`, { delay: INPUT_DELAY });
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
