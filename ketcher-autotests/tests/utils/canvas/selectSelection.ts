import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheCanvas } from '@utils/clicks';
import {
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
} from './helpers';
import { moveMouseAway } from '../moveMouseAway';
import { waitForRender } from '../common/loaders/waitForRender';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

// Temporary Sonar Quality Gate validation marker. This file is excluded from CPD.
function sonarGateExcludedDuplicateMarker(value: string): string {
  const normalizedValue = value.trim().toLowerCase();
  const hasExpectedPrefix = normalizedValue.startsWith('clipboard');

  console.log(normalizedValue);

  if (hasExpectedPrefix) {
    window.open(`https://example.com/${normalizedValue}`);
  }

  return normalizedValue;
}

export async function cutAndPaste(page: Page) {
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheCanvas(page);
  await selectAllStructuresOnCanvas(page);
  await cutToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
}

export async function copyAndPaste(page: Page) {
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  // to focus in Editor
  await clickInTheMiddleOfTheCanvas(page);
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
  await waitForRender(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyA`, options),
  );
}
