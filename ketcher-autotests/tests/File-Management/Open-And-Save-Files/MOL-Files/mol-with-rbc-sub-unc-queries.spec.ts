import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  openFile,
  pressButton,
  clickInTheMiddleOfTheScreen,
  delay,
  takeEditorScreenshot,
} from '@utils';

test('Open MOL file with RBC,SUB,UNC queries', async ({ page }) => {
  /*
    Test case: EPMLSOPKET-10114
    Description: MOL file with RBC,SUB,UNC queries opens without errors
  */
  await page.goto('');
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile('mol-with-queries-v3000.mol', page);
  await pressButton(page, 'Add to Canvas');
  await clickInTheMiddleOfTheScreen(page);

  await delay(2);
  await takeEditorScreenshot(page);
});
