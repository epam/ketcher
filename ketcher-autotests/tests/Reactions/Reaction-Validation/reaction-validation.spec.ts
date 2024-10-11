/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  AtomButton,
  clickOnAtom,
  openFileAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  selectAtomInToolbar,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getRxn } from '@utils/formats';

test.describe('Reaction validation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Saving reaction with more than one pluses', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1486
    Description: Structures are on the canvas, pluses and arrows
    */
    await openFileAndAddToCanvas('KET/plus-and-reaction-arrow.ket', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/plus-and-reaction-arrow-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2, 7, 25, 43, 61];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/plus-and-reaction-arrow-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v2000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Saving reaction with more than one pluses RXN V3000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1488
    Description: Structures are on the canvas, pluses and arrows
    */
    await openFileAndAddToCanvas('KET/plus-and-reaction-arrow.ket', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Rxn-V3000/plus-and-reaction-arrow-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V3000/plus-and-reaction-arrow-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v3000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Only one structure is on canvas and reaction arrow', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1487
    Description: Benzene structure is on the canvas and arrow
    */
    await openFileAndAddToCanvas('KET/benzene-and-one-arrow.ket', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/benzene-and-one-arrow-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2, 7];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/benzene-and-one-arrow-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v2000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Only one structure is on canvas and reaction arrow RXN V3000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1489
    Description: Benzene structure is on the canvas and arrow
    */
    await openFileAndAddToCanvas('KET/benzene-and-one-arrow.ket', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Rxn-V3000/benzene-and-one-arrow-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V3000/benzene-and-one-arrow-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v3000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Reaction can have a combination of reactants', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1490
    Description: Structures are saved as .rxn
    */
    await openFileAndAddToCanvas('KET/combination-of-reactants.ket', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/combination-of-reactants-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2, 7, 25, 43, 50, 68, 86];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/combination-of-reactants-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v2000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Reaction can have a combination of products', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1491
    Description: Structures are saved as .rxn v3000
    */
    await openFileAndAddToCanvas('KET/combination-of-reactants.ket', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Rxn-V3000/combination-of-reactants-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V3000/combination-of-reactants-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v3000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Editing reaction with combination of products', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1492
    Description: Reaction with combination of products can be edited after opening
    */
    const anyAtom = 0;
    await openFileAndAddToCanvas('KET/combination-of-products.ket', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Editing reaction with combination of reactants', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1493
    Description: Reaction with combination of reactants can be edited after opening
    */
    const anyAtom = 0;
    await openFileAndAddToCanvas('KET/combination-of-reactants.ket', page);
    await selectAtomInToolbar(AtomButton.Fluorine, page);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });
});
