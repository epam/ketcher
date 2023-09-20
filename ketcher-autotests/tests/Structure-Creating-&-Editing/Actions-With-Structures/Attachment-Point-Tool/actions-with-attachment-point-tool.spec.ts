import { test } from '@playwright/test';
import {
  pressButton,
  // delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  // DELAY_IN_SECONDS,
  // selectNestedTool,
  // RgroupTool,
  // selectTopPanelButton,
  TopPanelButton,
  // selectAtomInToolbar,
  // AtomButton,
  LeftPanelButton,
  selectLeftPanelButton,
  // dragMouseTo,
  // selectRing,
  RingButton,
  // resetCurrentTool,
  // copyAndPaste,
  // cutAndPaste,
  // saveToFile,
  // receiveFileComparisonData,
  clickOnAtom,
  // screenshotBetweenUndoRedo,
  setAttachmentPoints,
  // AttachmentPoint,
  waitForPageInit,
  waitForLoad,
  // drawBenzeneRing,
  clickInTheMiddleOfTheScreen,
  selectRingButton,
  selectTopPanelButton,
  selectNestedTool,
  RgroupTool,
  saveToFile,
} from '@utils';

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Opening *.mol V2000 file with S-Group containing Attachment point', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18024
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFileAndAddToCanvas('s-group-with-attachment-points.mol', page);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
      await takeEditorScreenshot(page);
    });
  });

  test('Opening the *.ket file with S-Group containing "Attachment point" instruction', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18026
    // await selectTopPanelButton(TopPanelButton.Open, page);
    await openFileAndAddToCanvas('s-group-with-attachment-points.ket', page);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
      await takeEditorScreenshot(page);
    });
  });

  // test('Remove "Edit attachment point..." from right-click context menu', async ({
  //   page,
  // }) => {
  //   await selectRingButton(RingButton.Benzene, page);
  //   await clickInTheMiddleOfTheScreen(page);
  //   await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
  //   await page.getByTestId('rgroup-attpoints').click();
  //   await clickOnAtom(page, 'C', 0);
  //   await setAttachmentPoints(
  //     page,
  //     { label: 'C', index: 4 },
  //     { primary: true, secondary: false },
  //     'Apply',
  //   );
  //   await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
  //   await page.mouse.click(right);
  //   await page.getBy()click(right);
  //   await delay(DELAY_IN_SECONDS.THREE);
  //   await page.keyboard.press('Control+r');
  //   await page.mouse.click(x, y);
  //   await page.getByLabel(AttachmentPoint.PRIMARY).check();
  //   await clickModalButton(page, 'Apply');
  // });

  test('Saving the S-Group structure with Attachment point in *.ket file', async ({
    page,
    // Test case: EPMLSOPKET-18025
  }) => {
    await openFileAndAddToCanvas('s-group-with-attachment-points.mol', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.get;

    const expectedFile = await getKet(page);
    await saveToFile('KET/ket-2934-to-compare-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/ket-2934-to-compare-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });
});
