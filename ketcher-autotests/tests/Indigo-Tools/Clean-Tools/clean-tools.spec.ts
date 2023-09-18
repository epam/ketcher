import { test } from '@playwright/test';
import { selectPartOfChain } from '@tests/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  takeTopToolbarScreenshot,
  waitForSpinnerFinishedWork,
} from '@utils';

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clean Up button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1776
    Description: 'Clean Up' button is always active and presents in top toolbar panel.
    */
    await takeTopToolbarScreenshot(page);
  });
});

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean bonds lenght', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1778
    Description: The length of the bonds becomes the same
    */
    await openFileAndAddToCanvas('different-bond-length.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Clean bonds angles', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1779
    Description: The angles should be 60, 90 or 120°
    (all angles in each structure are equal after the clean action)
   */
    await openFileAndAddToCanvas('different-angle-fr.mol', page);
    await clickInTheMiddleOfTheScreen(page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Cleaned structure is placed horizontally', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1781
    Description: After the Layout action the structure moves to the upper left corner of the canvas.
    The structure is placed horizontally.
    During the Layout action structure is rotated 90° counterclockwise.
    After the Clean Up action the structure does not change.
   */
    await openFileAndAddToCanvas('Molfiles-V2000/four-bonds.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
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
  });

  test('Clean distorted molecule with Clean Up tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1785
    Description: After the 'Clean Up' action the structures don't change its position on the canvas.
    The group of structures is cleaned up and appear undistorted.
   */
    await openFileAndAddToCanvas('layout-distorted.mol', page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Clean Queries structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1786
    Description: After the Layout and Clean Up actions the structure features appear undistorted.
   */
    await openFileAndAddToCanvas('clean-structure.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Clean Up action on a structures with Attachment point', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1787
    Description: Clean action is correct for the all selected structures.
   */
    await openFileAndAddToCanvas('clean-appoints.mol', page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Multiple undo', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1788
    Description: Multiple Undo/Redo actions are correct after the Clean Up action.
   */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/distorted-structures.mol',
      page,
    );

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });

    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Structure with Stereochemistry', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1789
    Description: After the Clean Up and Layout actions the structure
    with stereochemistry is appear undistorted.
   */
    await openFileAndAddToCanvas('clean-stereo.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Structure with R-Groups', async ({ page }) => {
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

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Structure with S-Groups', async ({ page }) => {
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

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Structure with Stereolabels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1796
    Description: The cleaned structure has the correct abs/or1/&1 stereolabels.
    The Clean Up action is applied correctly and simultaneously
    to the whole structure with stereolabels.
   */
    await openFileAndAddToCanvas('KET/stereolabels.ket', page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });

    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Structure with Mapping', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1797
    Description: The reaction mapping is kept after the Layout and Clean Up action.
   */
    await openFileAndAddToCanvas('mapping-reaction.rxn', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);

    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });

  test('Layout cyclic structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1803
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas('cyclic-structures.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Layout several structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1805
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas('several-structures.mol', page);

    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Clean Up part of chain structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1802
    Description: 'Clean Up' action works for the selected part.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/ditorted-chain-with-double-bond.mol',
      page,
    );
    await selectPartOfChain(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
  });
});
