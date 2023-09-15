/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  selectLeftPanelButton,
  selectNestedTool,
  ReactionMappingTool,
  openFileAndAddToCanvas,
  selectRingButton,
  RingButton,
  getCoordinatesTopAtomOfBenzeneRing,
  selectTopPanelButton,
  TopPanelButton,
  dragMouseTo,
  waitForPageInit,
  mapTwoAtoms,
  clickOnAtom,
  receiveFileComparisonData,
  saveToFile,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getRxn } from '@utils/formats';

test.describe('Mapping Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Click atoms to map atoms in a reaction', async ({ page }) => {
    /* Test case: EPMLSOPKET-1799, EPMLSOPKET-8909
    Description:  Click atoms to map atoms in a reaction
    */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    await mapTwoAtoms(
      page,
      { label: 'C', number: 0 },
      { label: 'C', number: 10 },
    );
  });

  test.describe('Mapping Tools', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V2000/mapped-atoms.rxn', page);
    });

    test('Click the single mapped atom to delete mapping', async ({ page }) => {
      // EPMLSOPKET-1827
      const anyAtom = 0;
      await selectNestedTool(page, ReactionMappingTool.UNMAP);
      await clickOnAtom(page, 'Br', anyAtom);
    });

    test('Map ordering', async ({ page }) => {
      await selectNestedTool(page, ReactionMappingTool.MAP);
      await page.getByText('ALK').click();
      await page.getByText('ABH').click();
      await page.getByText('CHC').click();
      await page.getByText('ARY').click();
    });
  });

  test('No Unmapping after the arrow deleting', async ({ page }) => {
    // EPMLSOPKET-1828
    await openFileAndAddToCanvas('Rxn-V2000/mapped-rection-benz.rxn', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Click atoms to map atoms of reactants or products', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    const point = await getAtomByIndex(page, { label: 'Br' }, 0);
    await page.mouse.click(point.x, point.y);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await dragMouseTo(x, y, page);
  });

  test('Undo working in atom mapping, able to remove mapping', async ({
    page,
  }) => {
    // EPMLSOPKET-12961
    // Undo not working properly https://github.com/epam/ketcher/issues/2174
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test.describe('Mapping reactions', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V2000/mapped-reaction.rxn', page);
      await clickInTheMiddleOfTheScreen(page);
    });

    test('Remove the reaction components', async ({ page }) => {
      // EPMLSOPKET-1831
      await selectNestedTool(page, ReactionMappingTool.MAP);
      await page.getByText('CEL').click();
      await page.keyboard.press('Delete');
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Undo, page);
    });

    test('Unmap the mapped reaction', async ({ page }) => {
      // EPMLSOPKET-1830
      await selectNestedTool(page, ReactionMappingTool.UNMAP);
      await page.getByText('CEL').click();
    });
  });
});

test.describe('Mapping reactions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1830
    Description: Structure with attachment points saved as .rxn file
    */
    await openFileAndAddToCanvas('Rxn-V2000/mapped-reaction.rxn', page);
    const expectedFile = await getRxn(page);
    await saveToFile('Rxn-V2000/mapped-reaction-expected.rxn', expectedFile);

    const METADATA_STRING_INDEX = [2, 7, 25, 40, 66];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/Rxn-V2000/mapped-reaction-expected.rxn',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });
});
