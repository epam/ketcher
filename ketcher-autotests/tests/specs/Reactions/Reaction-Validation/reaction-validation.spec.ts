/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  openFileAndAddToCanvas,
  RxnFileFormat,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Reaction validation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Saving reaction with more than one pluses', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1486
    Description: Structures are on the canvas, pluses and arrows
    */
    await openFileAndAddToCanvas(page, 'KET/plus-and-reaction-arrow.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/plus-and-reaction-arrow-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Saving reaction with more than one pluses RXN V3000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1488
    Description: Structures are on the canvas, pluses and arrows
    */
    await openFileAndAddToCanvas(page, 'KET/plus-and-reaction-arrow.ket');
    await verifyFileExport(
      page,
      'Rxn-V3000/plus-and-reaction-arrow-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
  });

  test('Only one structure is on canvas and reaction arrow', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1487
    Description: Benzene structure is on the canvas and arrow
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-and-one-arrow.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/benzene-and-one-arrow-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Only one structure is on canvas and reaction arrow RXN V3000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1489
    Description: Benzene structure is on the canvas and arrow
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-and-one-arrow.ket');
    await verifyFileExport(
      page,
      'Rxn-V3000/benzene-and-one-arrow-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
  });

  test('Reaction can have a combination of reactants', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1490
    Description: Structures are saved as .rxn
    */
    await openFileAndAddToCanvas(page, 'KET/combination-of-reactants.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/combination-of-reactants-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Reaction can have a combination of products', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1491
    Description: Structures are saved as .rxn v3000
    */
    await openFileAndAddToCanvas(page, 'KET/combination-of-reactants.ket');
    await verifyFileExport(
      page,
      'Rxn-V3000/combination-of-reactants-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
  });

  test('Editing reaction with combination of products', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1492
    Description: Reaction with combination of products can be edited after opening
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/combination-of-products.ket');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await getAtomLocator(page, { atomLabel: 'C' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Editing reaction with combination of reactants', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1493
    Description: Reaction with combination of reactants can be edited after opening
    */
    await openFileAndAddToCanvas(page, 'KET/combination-of-reactants.ket');
    await RightToolbar(page).clickAtom(Atom.Fluorine);
    await getAtomLocator(page, { atomLabel: 'C' }).first().click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });
});
