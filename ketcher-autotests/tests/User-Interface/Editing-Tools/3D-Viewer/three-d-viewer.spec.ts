/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  pressButton,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  DELAY_IN_SECONDS,
  selectTopPanelButton,
  TopPanelButton,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import { getKet } from '@utils/formats';

test.describe.fixme('3D Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('3D Rotation of the simple structure without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1934
    Description: 3D window is opened. Benzene is drawn in it.
    The structure is spinned.
    Position of structure on the canvas is not changed. 
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    // delay need to load 3D Viewer
    await delay(DELAY_IN_SECONDS.THREE);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 20, y, page);
    await pressButton(page, 'Cancel');
  });

  test('Structure with Heteroatoms without Save Position', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1936
    Description: 3D window is opened.
    3D window is opened. Benzene with heteroatom is drawn in it. 
    Position of the structure on the canvas isn't changed. 
    */
    await openFileAndAddToCanvas('benzene-br.mol', page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    // delay need to load 3D Viewer
    await delay(DELAY_IN_SECONDS.THREE);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - 20, y, page);
    await pressButton(page, 'Cancel');
  });

  test('Structure with a Stereobonds without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1942
    Description: 3D window is opened. Benzene with all stereo bonds is drawn in it.
    The structure isn't changed.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene-stereo.mol', page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    // delay need to load 3D Viewer
    await delay(DELAY_IN_SECONDS.THREE);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - 20, y, page);
    await pressButton(page, 'Cancel');
  });

  test('Structure with Aromatic Bonds without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1943
    Description: 3D window is opened. The structure with a circle inside the cycle is displayed in the window. 
    The structure isn't changed.
    */
    await openFileAndAddToCanvas('benzene-with-aromatic-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    // delay need to load 3D Viewer
    await delay(DELAY_IN_SECONDS.THREE);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - 20, y, page);
    await pressButton(page, 'Cancel');
  });
});

test.describe.fixme('3D Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Button and tooltip verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1931
    Description: '3D Viewer' button is present on the main toolbar.
    */
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    // delay need to load 3D Viewer
    await delay(DELAY_IN_SECONDS.THREE);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Empty canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1932
    Description: 3D Viewer window is opened. There is no structure in the opened  window.
    */
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test.fixme('One simple structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1933
    Description: A structure (e.g. Benzene) is created on the canvas.
    3D window is opened. Benzene is drawn in it. 
    */
    // we need remove or block the variable number of frames per second in the lower right corner
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test.fixme(
    '3D Rotation of the simple structure with Save Position',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1935
    Description: 3D window is opened.
    Benzene is drawn in it. The structure is spinned.
    Position of the structure on the canvas is changed. 
    */
      await selectRing(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);
      const initialStructureData = await getKet(page);
      await selectTopPanelButton(TopPanelButton.ThreeD, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(x, y + 75, page);
      await pressButton(page, 'Apply');

      // Get the structure data after making changes
      const changedStructureData = await getKet(page);

      // Compare the initial and changed structure data
      expect(initialStructureData).not.toEqual(changedStructureData);
    },
  );

  test.fixme(
    'Structure with Heteroatoms with Save Position',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-15539
    Description: 3D window is opened.
    3D window is opened. Benzene with heteroatom is drawn in it. 
    Position of the structure on the canvas is changed. 
    */
      await openFileAndAddToCanvas('benzene-br.mol', page);
      const initialStructureData = await getKet(page);
      await selectTopPanelButton(TopPanelButton.ThreeD, page);
      // delay need to load 3D Viewer
      await delay(DELAY_IN_SECONDS.TWO);
      await moveMouseToTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(x + 80, y, page);
      await pressButton(page, 'Apply');

      // Get the structure data after making changes
      const changedStructureData = await getKet(page);

      // Compare the initial and changed structure data
      expect(initialStructureData).not.toEqual(changedStructureData);
    },
  );

  test.fixme(
    'Structure with a Stereobonds with Save Position',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1942
    Description: 3D window is opened. Benzene with all stereo bonds is drawn in it.
    The structure isn't changed.
    */
      await openFileAndAddToCanvas('Molfiles-V2000/benzene-stereo.mol', page);
      const initialStructureData = await getKet(page);
      await selectTopPanelButton(TopPanelButton.ThreeD, page);
      // delay need to load 3D Viewer
      await delay(DELAY_IN_SECONDS.TWO);
      await moveMouseToTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(x + 75, y, page);
      await pressButton(page, 'Apply');

      // Get the structure data after making changes
      const changedStructureData = await getKet(page);

      // Compare the initial and changed structure data
      expect(initialStructureData).not.toEqual(changedStructureData);
    },
  );

  test.fixme(
    'Structure with Aromatic Bonds with Save Position',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-15541
    Description: 3D window is opened. The structure with a circle inside the cycle is displayed in the window. 
    The structure is changed.
    */
      await openFileAndAddToCanvas('benzene-with-aromatic-bonds.mol', page);
      const initialStructureData = await getKet(page);
      await selectTopPanelButton(TopPanelButton.ThreeD, page);
      // delay need to load 3D Viewer
      await delay(DELAY_IN_SECONDS.TWO);
      await moveMouseToTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(x - 90, y, page);
      await pressButton(page, 'Apply');

      // Get the structure data after making changes
      const changedStructureData = await getKet(page);

      // Compare the initial and changed structure data
      expect(initialStructureData).not.toEqual(changedStructureData);
    },
  );
});
