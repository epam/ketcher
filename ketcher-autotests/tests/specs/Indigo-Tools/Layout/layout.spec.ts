import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  moveOnAtom,
  dragMouseTo,
  clickOnAtom,
  waitForPageInit,
  takeTopToolbarScreenshot,
  selectPartOfMolecules,
  selectPartOfChain,
} from '@utils';

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

  test('Layout part of chain structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1798
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-double-bond-in-the-middle.mol',
    );
    await selectPartOfChain(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Center molecule after layout', async ({ page }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/2078
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-rings.mol');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Stereo flag is not shifted after clicking layout multiple times', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3025
    const structureWithStereoFlags = 'KET/structure-with-stereo-flags.ket';
    const numberOfIterations = 3;
    const shift = 150;
    await openFileAndAddToCanvas(page, structureWithStereoFlags, shift, shift);
    for (let i = 0; i < numberOfIterations; i++) {
      await IndigoFunctionsToolbar(page).layout();
    }
    await takeEditorScreenshot(page);
  });

  test('After applying Layout, the structure does not disappear and can be interacted with', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3208
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chloro-ethylamino-dimethyl-propoxy-propan-ol.mol',
    );
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/toluene.mol');
    await IndigoFunctionsToolbar(page).layout();
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await IndigoFunctionsToolbar(page).layout();
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Layout action on part of structure with S-Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1812
    Description: The Layout action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/distorted-Sgroups.mol');
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Layout action on part of structure with R-Group label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1813
    Description: The Layout action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-r-group-labels.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Layout action on part of structure with Attachment point', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1815
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-structure-attachment-points.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Layout part of structure of R-Group member with R-Group logic', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1816
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-r-group-logic.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/structure-with-stereobonds.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test.fail('Clean reaction with Layout tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2878
    Description: After Layout action structures are undistorted. 
    Position of the reaction does not change.
    We have a bug https://github.com/epam/Indigo/issues/2229
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/distorted-reaction.rxn');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Structures are displayed in the middle of the screen after clicks "Layout" button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-17665, EPMLSOPKET-10084
    Description: After Layout the structures are displayed orderly in the middle of the screen.
    */
    await openFileAndAddToCanvas(page, 'KET/four-benzene-at-edges.ket');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Molecular structures are displayed in the middle of the canvas after clicks "Ctrl+L"', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-17666
    Description: After Layout the structures are displayed orderly in the middle of the screen.
    */
    await openFileAndAddToCanvas(page, 'KET/four-benzene-at-edges.ket');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test(
    'Layout action on part of structure with different properties',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1823
    Description: Layout action is implemented for the whole canvas.
    Test working incorrect because we have a bug https://github.com/epam/Indigo/issues/388
    */
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/clean-different-properties.mol',
      );
      await selectPartOfMolecules(page);
      await IndigoFunctionsToolbar(page).layout();
      await takeEditorScreenshot(page);
    },
  );
});
