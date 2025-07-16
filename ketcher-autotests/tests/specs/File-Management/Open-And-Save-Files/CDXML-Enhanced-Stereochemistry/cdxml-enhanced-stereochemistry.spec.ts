import { test } from '@playwright/test';
import { EnhancedStereochemistryRadio } from '@tests/pages/constants/EnhancedStereochemistry/Constants';
import { applyEnhancedStereochemistry } from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('CDXML Enhanced Stereochemistry', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Adding AND stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4724
    Description: The structure is opened correctly
    New 'And Group' label added to structure.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/stereo-test.mol');
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Adding OR stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4728
    Description: The structure is opened correctly
    New 'OR Group' label added to structure.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/stereo-test.mol');
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Adding Mixed AND stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4725
    Description: The structure is opened correctly
    'Mixed AND' label added to structure.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/stereo-test.mol');
    await clickOnAtom(page, 'C', anyAtom);
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Adding Mixed OR stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4726
    Description: The structure is opened correctly
    'Mixed OR' label added to structure.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/stereo-test.mol');
    await clickOnAtom(page, 'C', anyAtom);
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('CDXML Enhanced Stereochemistry', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('AND stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4724
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas(page, 'CDXML/stereo-and-structure.cdxml');

    await verifyFileExport(
      page,
      'CDXML/stereo-and-structure-expected.cdxml',
      FileType.CDXML,
    );
  });

  test('OR stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4728
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas(page, 'CDXML/stereo-or-structure.cdxml');

    await verifyFileExport(
      page,
      'CDXML/stereo-or-structure-expected.cdxml',
      FileType.CDXML,
    );
  });

  test('Mixed AND stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4725
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas(page, 'CDXML/mixed-and-stereo-marks.cdxml');

    await verifyFileExport(
      page,
      'CDXML/mixed-and-stereo-marks-expected.cdxml',
      FileType.CDXML,
    );
  });

  test('Mixed OR stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4726
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas(page, 'CDXML/mixed-or-stereo-marks.cdxml');

    await verifyFileExport(
      page,
      'CDXML/mixed-or-stereo-marks-expected.cdxml',
      FileType.CDXML,
    );
  });

  test('Mixed stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4727
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas(page, 'CDXML/mixed-stereo-marks.cdxml');

    await verifyFileExport(
      page,
      'CDXML/mixed-stereo-marks-expected.cdxml',
      FileType.CDXML,
    );
  });
});
