/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  copyAndPaste,
  cutAndPaste,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectAllStructuresOnCanvas,
  selectAromatizeTool,
  selectDearomatizeTool,
  selectRing,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

const CANVAS_CLICK_X = 200;
const CANVAS_CLICK_Y = 200;

test.describe('Aromatize/Dearomatize Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Empty canvas', { tag: ['@chromium-popup'] }, async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1867
    Description: Nothing is changed.
    */
    await selectAromatizeTool(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Non-aromatic structures - Single bonds only', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1868
    Description: Nothing is changed on the canvas because only non-aromatic structures are present on the canvas.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/non-aromatic.mol', page);
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Non-aromatic structures - interchanged Single and Double bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1869
    Description: Nothing is changed on the canvas because only non-aromatic structures are present on the canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/non-aromatic-structures.mol',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Aromatic structures - interchanged Single and Double bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1870
    Description: The aromatic structures appear with circle inside the cycles.
    Aromatize function affects all canvas.
    The structures appears in a Kekule form: with interchanged Single and Double bonds.
    Dearomatize function affects all canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/aromatic-structures.mol',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Cycles with Aromatic Bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1871
    Description: All bonds in the structures are changed with Aromatic Bonds.
    The circle inside the structure appears.
    Only six-cycle structures appear in a Kekule form: with interchanged Single and Double bonds.
    All other structures are rendered with a circle inside the cycles.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/cycles-with-aromatic-bonds.mol',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('(Undo/Redo) Manipulations with cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1872
    Description: Only six-cycle structures appear in a Kekule form: with interchanged Single and Double bonds.
    All other structures are rendered with a circle inside the cycles. The actions are Undone/Redone.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/cycles-with-aromatic-bonds.mol',
      page,
    );
    await selectAromatizeTool(page);
    await selectDearomatizeTool(page);
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('(Copy/Paste) Manipulations with cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1872
    Description: The structures are pasted. The structures are rendered with a circle
    inside the cycle during any manipulations.
    */
    // test is working but structures moves. will fixes after fixing bug with canvas movement after copy/paste
    await openFileAndAddToCanvas(
      'Molfiles-V2000/cycles-with-aromatic-bonds.mol',
      page,
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('(Cut/Paste) Manipulations with cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1872
    Description: The structures are pasted. The structures are rendered with a circle
    inside the cycle during any manipulations.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/cycles-with-aromatic-bonds.mol',
      page,
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('(Add Atom) Manipulations with cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1872
    Description: Atom added to the structure.
    The structures are rendered with a circle inside the cycle during any manipulations.
    */
    const atomToolbar = RightToolbar(page);

    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAromatizeTool(page);
    await selectAllStructuresOnCanvas(page);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await takeEditorScreenshot(page);
  });

  test('(MolV2000) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1877
    Description: The structures are saved as mol-file.
    The saved mol-file is opened correctly. In Ketcher the saved structures appear
    with the circle inside the cycles.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/aromatic-benzene-v2000.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/aromatic-benzene-v2000-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('(MolV3000) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1877
     * Description: The structures are saved as mol-file.
     * The saved mol-file is opened correctly. In Ketcher the saved structures appear
     * with the circle inside the cycles.
     */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/aromatic-benzene-v3000.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/aromatic-benzene-v3000-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await takeEditorScreenshot(page);
  });

  test('(Smiles) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1877
    Description: The structures are saved as smiles-file.
    The saved smiles-file is opened correctly. In Ketcher the saved structures appear
    with the circle inside the cycles.
    */
    await openFileAndAddToCanvas('SMILES/aromatic-benzene-smiles.smi', page);
    await verifyFileExport(
      page,
      'SMILES/aromatic-benzene-smiles-expected.smi',
      FileType.SMILES,
    );
    await takeEditorScreenshot(page);
  });

  test('(RxnV2000) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1877
    Description: The structures are saved as rxn-file.
    The saved rxn-file is opened correctly. In Ketcher the saved structures appear
    with the circle inside the cycles.
    */
    await openFileAndAddToCanvas(
      'Rxn-V2000/aromatic-benzene-rxnv2000.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/aromatic-benzene-rxnv2000-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('(RxnV3000) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1877
    Description: The structures are saved as rxn-file.
    The saved rxn-file is opened correctly. In Ketcher the saved structures appear
    with the circle inside the cycles.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/aromatic-benzene-rxnv3000.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/aromatic-benzene-rxnv3000-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await takeEditorScreenshot(page);
  });

  test('(Cml file) Save cyclic structures with a circle inside the cycle', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2943
    Description: The structures are saved as cml-file.
    The saved cml-file is opened correctly. In Ketcher the saved structures appear
    with the circle inside the cycles.
    */
    await openFileAndAddToCanvas('CML/aromatic-benzene.cml', page);

    await verifyFileExport(
      page,
      'CML/aromatic-benzene-cml-expected.cml',
      FileType.CML,
    );
    await takeEditorScreenshot(page);
  });

  test(
    'User can aromatize molecules with query parameters (not custom query, but only ordinary).',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/3849 - Test case 1
    Description: User can aromatize molecules with query parameters (not custom query, but only ordinary).
    1. Clear canvas
    2. Open as New Project: AllPossibleQueryFeaturesWithOutCustomQuery.ket
    3. Press Aromatize button
    4. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/3529 issue.
    Screenshots should be updated after fix.
     */
      test.slow();

      await openFileAndAddToCanvasAsNewProject(
        'KET/all-possible-query-features-with-out-custom-query.ket',
        page,
      );
      await selectAromatizeTool(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'User can DEaromatize molecules with query parameters (not custom query, but only ordinary).',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/3849 - Test case 2
    Description: User can aromatize molecules with query parameters (not custom query, but only ordinary).
    1. Clear canvas
    2. Open as New Project: AllPossibleQueryFeaturesWithOutCustomQuery.ket
    3. Press Aromatize button
    4. Press Dearomatize button
    5. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/3529 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1757 issue.
    Screenshots should be updated after fix.
     */
      test.slow();

      await openFileAndAddToCanvasAsNewProject(
        'KET/all-possible-query-features-with-out-custom-query.ket',
        page,
      );
      await selectAromatizeTool(page);
      await selectDearomatizeTool(page);
      await takeEditorScreenshot(page);
    },
  );

  test('User can aromatize molecules with custom query parameters. @IncorrectResultBecauseOfBug', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3849 - Test case 3
    Description: User can aromatize molecules with query parameters (not custom query, but only ordinary).
    1. Clear canvas
    2. Open as New Project: AllPossibleQueryFeaturesWithOutCustomQuery.ket
    3. Press Aromatize button
    4. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1753 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1754 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1759 issue.
    Screenshots should be updated after fix.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/all-possible-custom-query-features.ket',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('User can Dearomatize molecules with custom query parameters. @IncorrectResultBecauseOfBug', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3849 - Test case 4
    Description: User can aromatize molecules with query parameters (not custom query, but only ordinary).
    1. Clear canvas
    2. Open as New Project: AllPossibleQueryFeaturesWithOutCustomQuery.ket
    3. Press Aromatize button
    4. Press Dearomatize button
    4. Validate canvas
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1753 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1754 issue.
    IMPORTANT: Result of execution is incorrect because of https://github.com/epam/Indigo/issues/1759 issue.
    Screenshots should be updated after fix.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/all-possible-custom-query-features.ket',
      page,
    );
    await selectAromatizeTool(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic arrow could be Aromatize', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/schema-with-retrosynthetic-arrow-for-options.ket',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic arrow could be Dearomatize', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/schema-with-retrosynthetic-arrow-for-options.ket',
      page,
    );
    await selectAromatizeTool(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });
});
