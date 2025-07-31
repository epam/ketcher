/* eslint-disable no-magic-numbers */
import { expect, test, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  getCoordinatesTopAtomOfBenzeneRing,
  clickOnAtom,
  clickOnTheCanvas,
  pressButton,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  clickOnCanvas,
  RxnFileFormat,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  BondsSetting,
  GeneralSetting,
  MeasurementUnit,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  setACSSettings,
  setSettingsOptions,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { setAttachmentPoints } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { RGroupDialog } from '@tests/pages/molecules/canvas/R-GroupDialog';

async function savedFileInfoStartsWithRxn(page: Page, wantedResult = false) {
  await CommonTopLeftToolbar(page).saveFile();
  const textareaText = await SaveStructureDialog(page).getTextAreaValue();
  const expectedSentence = '$RXN';
  wantedResult
    ? expect(textareaText?.startsWith(expectedSentence)).toBeTruthy()
    : expect(textareaText?.startsWith(expectedSentence)).toBeFalsy();
}

test.describe('Tests for Open and Save RXN file operations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save file - Reaction with atom and bond properties', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1897
     * Description: Reaction with atom and bond properties
     */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-with-atom-and-bond-properties-saved.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Rgroup', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1901
     * Description: Reaction from file that contains Rgroup
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    const xOffsetFromCenter = 40;
    await drawBenzeneRing(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 1);
    await RGroupDialog(page).setRGroupLabels(RGroup.R7);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await CommonTopLeftToolbar(page).saveFile();
    await expect(saveButton).not.toHaveAttribute('disabled', 'disabled');

    await SaveStructureDialog(page).cancel();
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );
    await CommonTopLeftToolbar(page).saveFile();
    await expect(saveButton).not.toHaveAttribute('disabled', 'disabled');

    await SaveStructureDialog(page).cancel();
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R22);
    await CommonTopLeftToolbar(page).saveFile();
    await expect(saveButton).not.toHaveAttribute('disabled', 'disabled');
  });

  test('Open and Save file - Reaction from file that contains Sgroup', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1903
     * Description: Reaction from file that contains Sgroup
     */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - File without arrow or(and) plus-symbol', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1905
     * Description: File without arrow or(and) plus-symbol
     */
    test.slow();
    await LeftToolbar(page).chain();
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const xDelta = 300;
    const xDeltaHalf = 150;
    const yDelta50 = 50;
    const yDelta20 = 20;
    const xCoordinatesWithShift = x + xDelta;
    const xCoordinatesWithShiftHalf = x + xDeltaHalf;
    const yCoordinatesWithShift = y + yDelta50;
    await dragMouseTo(xCoordinatesWithShift, y, page);
    await savedFileInfoStartsWithRxn(page);

    await pressButton(page, 'Cancel');
    await LeftToolbar(page).reactionPlusTool();
    await clickOnCanvas(page, xCoordinatesWithShiftHalf, yCoordinatesWithShift);
    const ySecondChain = yCoordinatesWithShift + yDelta50;
    await LeftToolbar(page).chain();
    await page.mouse.move(x, ySecondChain);
    await dragMouseTo(xCoordinatesWithShift, ySecondChain, page);
    await savedFileInfoStartsWithRxn(page);

    await pressButton(page, 'Cancel');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, xCoordinatesWithShiftHalf, yCoordinatesWithShift);
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
    const yArrowStart = y + yDelta20;
    const yArrowEnd = yArrowStart + yDelta20;
    await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
    await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
    await savedFileInfoStartsWithRxn(page, true);

    await pressButton(page, 'Cancel');
    await CommonTopLeftToolbar(page).clearCanvas();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
    await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
    await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
    await savedFileInfoStartsWithRxn(page, true);
  });

  test('Open and Save file - Structure is not missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-8904
     * Description: Structure isn't missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures
     */
    test.slow();
    const RING_OFFSET = 150;
    const ARROW_OFFSET = 20;
    const ARROW_LENGTH = 100;
    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    const xOffsetFromCenter = 50;
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
    );
    await takeEditorScreenshot(page);

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Import the structure from the saved RXN 2000/3000 file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12964
     * Description: Import the structure from the saved RXN 2000/3000 file
     */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V3000/reaction-with-several-components.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v3000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v3000 file with 'S-Group Properties Type = Multiple group rxnV3000Multiple.zip
     * Description: Open the RXN v3000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V3000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v2000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v2000 file with 'S-Group Properties Type = Multiple group rxnV2000Multiple.zip
     * Description: Open the RXN v2000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains abbreviation 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1899(1)
     * Description: Reaction with abbreviations is opened and saved correctly
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/sec-butyl-abr.rxn');
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains abbreviation 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1899(2)
     * Description: Reaction with abbreviations is opened and saved correctly
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/sec-butyl-abr.rxn');
    await verifyFileExport(
      page,
      'Rxn-V2000/sec-butyl-abr-expectedV2000.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/sec-butyl-abr-expectedV2000.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Heteroatoms 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1904(1)
     * Description: Reaction with heteroatoms is opened and saved correctly
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/heteroatoms.rxn');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Heteroatoms 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1904(2)
     * Description: Reaction with heteroatoms is opened and saved correctly
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/heteroatoms.rxn');
    await verifyFileExport(
      page,
      'Rxn-V2000/heteroatoms-expectedV2000.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Open and Save file - V3000 rxn file contains Rgroup 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1902(1)
     * Description: Reaction can be opened correctly from rxn V3000 file
     */
    await openFileAndAddToCanvas(page, 'Rxn-V3000/r-group-V3000.rxn');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - V3000 rxn file contains Rgroup 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1902(2)
     * Description: Reaction can be saved correctly to rxn V3000 file
     */
    await openFileAndAddToCanvas(page, 'Rxn-V3000/r-group-V3000.rxn');
    await verifyFileExport(
      page,
      'Rxn-V3000/r-group-V3000-expectedV3000.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-phosphates.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-phosphates.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-peptides.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-peptides.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with other nucleotides could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with other nucleotides could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(700, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-nucleotides.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-nucleotides.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);
    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-chems.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-chems.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-bases.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-bases.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-sugars.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-sugars.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/simple-schema-with-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/simple-schema-with-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/simple-schema-with-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/simple-schema-with-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-vertical-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/schema-with-vertical-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-vertical-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/schema-with-vertical-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-two-retrosynthetic-arrows.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/schema-with-two-retrosynthetic-arrows.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-two-retrosynthetic-arrows.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/schema-with-two-retrosynthetic-arrows.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/schema-with-diagonal-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/schema-with-diagonal-retrosynthetic-arrow.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*

    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with px option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
      { option: BondsSetting.BondLength, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-bond-lengh.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('The Hash spacing setting with px option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-catalyst-px-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with px option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/layout-with-catalyst-px-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with pt option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '67.8' },
    ]);

    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-bond-lengh.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-bond-lengh.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with cm option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Cm },
      { option: BondsSetting.BondLength, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-bond-lengh.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-bond-lengh.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with cm option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with cm option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with inch option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-inch-bond-lengh.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('The Hash spacing setting with inch option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with inch option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to RXN2000
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '47.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-margin-size.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-catalyst-px-margin-size.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-acs-style.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/layout-with-long-molecule-acs-style.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-long-molecule-acs-style.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/layout-with-long-molecule-acs-style.rxn',
    );
    await takeEditorScreenshot(page);
  });
});
