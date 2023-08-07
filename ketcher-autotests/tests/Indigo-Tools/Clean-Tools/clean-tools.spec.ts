import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  openFile,
  pressButton,
  clickInTheMiddleOfTheScreen,
  delay,
  takeEditorScreenshot,
  DELAY_IN_SECONDS,
  waitForLoad,
} from '@utils';

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.fixme('Clean bonds lenght', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1778
    Description: The length of the bonds becomes the same
    */
    await openFileAndAddToCanvas('different-bond-length.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test.fixme('Clean bonds angles', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1779
    Description: The angles should be 60, 90 or 120°
    (all angles in each structure are equal after the clean action)
   */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('different-angle-fr.mol', page);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    // Large structure. Delay is necessary here
    await delay(DELAY_IN_SECONDS.FOUR);
    await clickInTheMiddleOfTheScreen(page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test('Cleaned structure is placed horizontally', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1781
    Description: After the Layout action the structure moves to the upper left corner of the canvas.
    The structure is placed horizontally.
    During the Layout action structure is rotated 90° counterclockwise.
    After the Clean Up action the structure does not change.
   */
    await openFileAndAddToCanvas('4-bonds.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test('Clean distorted molecule with Layout tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1782
    Description: After the Layout action the structures are aligned to the upper
    left corner of the canvas.
    The structure group of structures appears undistorted.
   */
    await openFileAndAddToCanvas('layout-distorted.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test.fixme(
    'Clean distorted molecule with Clean Up tool',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1785
    Description: After the 'Clean Up' action the structures don't change its position on the canvas.
    The group of structures is cleaned up and appear undistorted.
   */
      await openFileAndAddToCanvas('layout-distorted.mol', page);

      await selectTopPanelButton(TopPanelButton.Clean, page);
      await delay(DELAY_IN_SECONDS.SEVEN);
      await takeEditorScreenshot(page);
    },
  );

  test.fixme('Clean Queries structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1786
    Description: After the Layout and Clean Up actions the structure features appear undistorted.
   */
    await openFileAndAddToCanvas('clean-structure.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test.fixme(
    'Clean Up action on a structures with Attachment point',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1787
    Description: Clean action is correct for the all selected structures.
   */
      await openFileAndAddToCanvas('clean-appoints.mol', page);

      await selectTopPanelButton(TopPanelButton.Clean, page);
      await delay(DELAY_IN_SECONDS.SEVEN);
      await takeEditorScreenshot(page);
    },
  );

  test.fixme('Multiple undo', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1788
    Description: Multiple Undo/Redo actions are correct after the Clean Up action.
   */
    await openFileAndAddToCanvas('distorted-structures.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test.fixme('Structure with Stereochemistry', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1789
    Description: After the Clean Up and Layout actions the structure
    with stereochemistry is appear undistorted.
   */
    await openFileAndAddToCanvas('clean-stereo.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test.fixme('Structure with R-Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1794
    Description: Structures with R-group are cleaned correctly.
    R-group labels are kept.
    R-group definition is correct.
    R-group member's properties aren't changed.
   */
    await openFileAndAddToCanvas('clean-rgroups.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test.fixme('Structure with S-Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1795
    Description: S-group brackets aren't moved away from the structure after the
    Clean Up and Layout actions.
    S-group properties are correct after the Clean Up and Layout actions.
   */
    await openFileAndAddToCanvas('clean-sgroups.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);
  });

  test.fixme('Structure with Stereolabels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1796
    Description: The cleaned structure has the correct abs/or1/&1 stereolabels.
    The Clean Up action is applied correctly and simultaneously
    to the whole structure with stereolabels.
   */
    await openFileAndAddToCanvas('stereolabels.ket', page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.SEVEN);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test.fixme('Structure with Mapping', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1797
    Description: The reaction mapping is kept after the Layout and Clean Up action.
   */
    await openFileAndAddToCanvas('mapping-reaction.rxn', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.FIFTEEN);
    await takeEditorScreenshot(page);
  });

  test('Layout cyclic structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1803
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas('cyclic-structures.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Layout several structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1805
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas('several-structures.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });
});
