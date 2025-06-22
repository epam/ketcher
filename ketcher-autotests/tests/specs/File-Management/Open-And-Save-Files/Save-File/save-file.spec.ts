/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToCanvas,
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForPageInit,
} from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import { MolFileFormat, RxnFileFormat, SdfFileFormat } from '@utils/formats';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

const RING_OFFSET = 150;
const ARROW_OFFSET = 20;
const ARROW_LENGTH = 100;

test.describe('Save files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save file - Save *.rxn file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1849
     * Description: Reaction is saved correctly in .rxn file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/rxn-1849-to-compare-expectedV2000.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Save file - Save *.mol file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1848
     * Description: Structure (benzine ring) is saved correctly to .mol format
     */

    await drawBenzeneRing(page);
    await verifyFileExport(
      page,
      'Molfiles-V2000/mol-1848-to-compare-expectedV2000.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
  });

  test('Save file - Save *.ket file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2934
     * Description: Sctuctures are saved correctly in .ket file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    await verifyFileExport(
      page,
      'KET/ket-2934-to-compare-expected.ket',
      FileType.KET,
    );
  });

  test('Click and Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1851
    Description: Click the 'Save As' button, save as Smiles file ('Daylight SMILES' format).
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-connected.ket');
    await verifyFileExport(
      page,
      'KET/two-benzene-connected-expected.smi',
      FileType.SMILES,
    );
  });

  test('Save as a .rxn file if reaction consists of two or more reaction arrows', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4729
    Description: Structure reaction consists of two or more reaction arrows saved as .rxn file
    */
    await openFileAndAddToCanvas(page, 'KET/two-arrows-and-plus.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/two-arrows-and-plus-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/two-arrows-and-plus-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Automatic selection of MDL Molfile v3000 encoding is work if the number of atoms (or bonds) exceeds 999', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-5260
     * Description: Structure is saved according to automated selected format MDL Molfile v3000
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/structure-where-atoms-exceeds999.mol',
    );

    await verifyFileExport(
      page,
      'Molfiles-V3000/structure-where-atoms-exceeds999-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('The file formats in the Save Structure window match the mockup', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4739
    Description: File formats in the Save Structure window match the mockup
    */
    const fileFormatDropdonwList =
      SaveStructureDialog(page).fileFormatDropdownList;

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.KetFormat,
    );
    await fileFormatDropdonwList.click();
    await takeEditorScreenshot(page);
  });

  test('An atom or structure copied to the clipboard is saved without coordinates', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8921
      Description: In the save window that opens, in the preview section, 
      the atom or structure has no coordinates because they were not added to the canvas.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Hydrogen);
    await CommonTopLeftToolbar(page).saveFile();

    await verifyFileExport(
      page,
      'Molfiles-V2000/nitrogen-atom-under-cursor-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
  });

  test('Support for exporting to "InChiKey" file format', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-18030
     * Description: Save file - InChiKey for Benzene ring on canvas
     */
    // Can't select TestId because after press drop-down menu there is no InchIKey.
    await waitForIndigoToLoad(page);
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChIKey,
    );
    const inChistring = await SaveStructureDialog(page).getTextAreaValue();
    expect(inChistring).toEqual('UHOVQNZJYSORNB-UHFFFAOYSA-N');
  });

  test('Support for exporting to "SDF V2000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V2000 format
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await verifyFileExport(
      page,
      'SDF/chain-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
  });

  test('Support for exporting to "SDF V3000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V3000 format
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await verifyFileExport(
      page,
      'SDF/chain-expectedV3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
  });
});

test.describe('Open/Save/Paste files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Paste the content from mol-string', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1844
      Description: MolFile is pasted to canvas
      */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Daylight SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Daylight SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=CC=1.[*:1]%91 |$;;;;;;;;;;;;;;;;_AP1$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Extended SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Extended SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=C%92C=1O1C=CN=CC=1.[*:1]%91.[*:2]%92 |$;;;;;;;;;;;;;;;;;;;;;;_AP1;_AP2$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "InChi" format structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1847
    Description: InChi is pasted to canvas
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'InChI=1S/C16H18/c1-11-5-12(2)8-15(7-11)16-9-13(3)6-14(4)10-16/h5-10H,1-4H3',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save structure with SVG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2253
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-connected.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Save structure with PNG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2254
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-connected.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test('Saving structure with QUERY in Smiles format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3944
    Description: Message is shown: The message should be: "Structure contains query properties 
    of atoms and bonds that are not supported in the SMILES. 
    Query properties will not be reflected in the file saved."
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/attached-data.mol');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMILES,
    );
    await SaveStructureDialog(page).warningsTab.click();
    await takeEditorScreenshot(page);
  });

  test('Save *.ket file with atom list and atom properties', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3387
     * Description: All the atom properties (general and query specific) for atom list should be saved in ket format
     */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-with-atom-list-and-all-atom-and-query-attributes.ket',
    );

    await verifyFileExport(
      page,
      'KET/benzene-with-atom-list-and-all-atom-and-query-attributes-to-compare.ket',
      FileType.KET,
    );

    await takeEditorScreenshot(page);
  });
});
