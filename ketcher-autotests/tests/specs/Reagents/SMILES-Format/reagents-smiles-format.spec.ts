import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  waitForPageInit,
  moveMouseAway,
  readFileContent,
} from '@utils';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';
import {
  getExtendedSmiles,
  getSmiles,
  setMolecule,
  enableDearomatizeOnLoad,
} from '@utils/formats';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';

test.describe('Reagents SMILES format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Detection molecule as reagent 
  and write reagent information in "Daylight SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4661
    Description: System detect molecule as reagent and write reagent in "Daylight SMILES' 
    format in "Preview" tab (e.g. C1C=CC=CC=1>N>C1C=CC=CC=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smiFileExpected = await readFileContent(
      'SMILES/daylight-smiles-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMILES,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent below arrow
  and write reagent information in "Daylight SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4661
    Description: System detect molecule as reagent and write reagent in "Daylight SMILES' 
    format in "Preview" tab (e.g. C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    const smiFileExpected = await readFileContent(
      'SMILES/daylight-smiles-below-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMILES,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent
  and write reagent information in "Extended SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4662
    Description: System detect molecule as reagent and write reagent in "Extended SMILES' 
    format in "Preview" tab (e.g. C1C=CC=CC=1>N>C1C=CC=CC=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.ExtendedSMILES,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent below arrow
  and write reagent information in "Extended SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4662
    Description: System detect molecule as reagent and write reagent in "Extended SMILES' 
    format in "Preview" tab (e.g. C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.ExtendedSMILES,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open from file in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4669
    Description: Reagent 'Cl' above the reaction arrow
    */
    await openFileAndAddToCanvas('SMILES/daylight-smiles-expect.smi', page);
    await takeEditorScreenshot(page);
  });

  test('Open from file in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4670
    Description: Reagent 'Cl' above the reaction arrow
    */
    await openFileAndAddToCanvas(
      'Extended-SMILES/extended-smiles-expect.cxsmi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4667
    Description: Reagent 'Cl' displays below reaction arrow
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4668
    Description: Reagent 'Cl' displays above reaction arrow
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CN(C(Cl)=O)C>Cl>c1ccc(OCCN(C(Cl)=O)C)cc1',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('SMILES import if dearomotize-on-load is true', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5254
    Description: Aromatic Benzene ring transforms into non aromatic Benzene ring
    */
    await enableDearomatizeOnLoad(page);
    await setMolecule(page, 'c1ccccc1');
    await takeEditorScreenshot(page);
  });
});

test.describe('Reagents SMILES format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4665
    Description: File saved in format (e.g. "ketcher.smi")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smiFileExpected = await readFileContent(
      'SMILES/daylight-smiles-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMILES,
    );
    await SaveStructureDialog(page).save();
  });

  test('File saves in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4666
    Description: File saved in format (e.g. "ketcher.cxsmi")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    const smiFileExpected = await readFileContent(
      'Extended-SMILES/extended-smiles.cxsmi',
    );
    const smiFile = await getExtendedSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await selectSaveTool(page);
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.ExtendedSMILES,
    );
    await SaveStructureDialog(page).save();
  });
});
