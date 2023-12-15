/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  waitForPageInit,
  drawBenzeneRing,
} from '@utils';

test.describe('Toggle-Explicit-Hydrogens Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Empty canvas', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
  });

  test('Show and then hide hydrogens', async ({ page }) => {
    await drawBenzeneRing(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);

    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
  });

  test('(Undo/Redo)', async ({ page }) => {
    await drawBenzeneRing(page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
    });
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeEditorScreenshot(page);
  });
});
