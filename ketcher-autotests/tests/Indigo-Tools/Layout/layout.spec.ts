import { Page, test } from '@playwright/test';
import {
  selectPartOfChain,
  selectPartOfMolecules,
} from '@tests/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFile,
  pressButton,
  waitForLoad,
  openFileAndAddToCanvas,
  moveOnAtom,
  dragMouseTo,
  selectAtomInToolbar,
  AtomButton,
  clickOnAtom,
  waitForSpinnerFinishedWork,
  getCoordinatesOfTheMiddleOfTheScreen,
  waitForPageInit,
  takeTopToolbarScreenshot,
} from '@utils';

async function openFileWithShift(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const shift = 150;
  await page.mouse.click(x + shift, y + shift);
}

test.describe('Indigo Tools - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Layout button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1777
    Description: 'Layout' button is always active and presents in top toolbar panel.
    */
    await takeTopToolbarScreenshot(page);
  });
});

test.describe('Indigo Tools - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Layout part of chain structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1798
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-double-bond-in-the-middle.mol',
      page,
    );
    await selectPartOfChain(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Center molecule after layout', async ({ page }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/2078
    await openFileAndAddToCanvas('Molfiles-V2000/benzene-rings.mol', page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Stereo flag is not shifted after clicking layout multiple times', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3025
    const structureWithStereoFlags = 'KET/structure-with-stereo-flags.ket';
    const numberOfIterations = 3;
    await openFileWithShift(structureWithStereoFlags, page);
    for (let i = 0; i < numberOfIterations; i++) {
      await selectTopPanelButton(TopPanelButton.Layout, page);
    }
  });

  test('After applying Layout, the structure does not disappear and can be interacted with', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3208
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chloro-ethylamino-dimethyl-propoxy-propan-ol.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Sprout bonds to the structure after Layout', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1806
    Description: User is able to change the structure: sprout the bonds, change the atom symbols, 
    change the atoms/bonds properties after the Layout action.
    */
    const x = 300;
    const y = 300;
    const anyAtom = 0;
    await openFileAndAddToCanvas('Molfiles-V2000/toluene.mol', page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.Layout, page);
    });
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.Layout, page);
    });
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Layout action on part of structure with S-Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1812
    Description: The Layout action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/distorted-Sgroups.mol', page);
    await selectPartOfMolecules(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Layout action on part of structure with R-Group label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1813
    Description: The Layout action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/distorted-r-group-labels.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Layout action on part of structure with Attachment point', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1815
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/distorted-structure-attachment-points.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Layout part of structure of R-Group member with R-Group logic', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1816
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-r-group-logic.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Layout action on part of structure with Stereobonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1822
    Description: Layout action is correct for the selected part.
    Non-selected part is invariable.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereobonds.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });
});
