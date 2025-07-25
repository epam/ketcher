import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  deleteByKeyboard,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import {
  setACSSettings,
  setSettingsOptions,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  BondsSetting,
  GeneralSetting,
  MeasurementUnit,
} from '@tests/pages/constants/settingsDialog/Constants';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Paste CDXML', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2956
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-2956.cdxml');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open CDXML by Open Structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-3086
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-3086.cdxml');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open/Import structure while opening a CDXML file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4712
     * Description: Open/Import structure while openning a CDXML file
     */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Hydrogen);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).reactionPlusTool();
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Hydrogen);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open structure in another editor', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4713
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4713.cdxml');
    await takeEditorScreenshot(page);
  });

  test('Text tool - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4714
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4714.cdxml');
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Delete file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4715
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4715.cdxml');
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from .cdxml file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4716
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4716.cdxml');

    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Functional Groups - Open from .cdxml file with contracted and expanded function', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4717
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4717.cdxml');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open/save/open cdxml file with structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4718
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-4718-structures.cdxml');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Save/Open file - Save *.cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-6969
     * Description: Open/Import structure CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-6969.cdxml');

    await verifyFileExport(
      page,
      'CDXML/cdxml-6969-expected.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-nucleotides.cdxml',
      FileType.CDXML,
    );
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to Cdxml file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-chems.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to Cdxml file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-bases.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to Cdxml file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-sugars.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-phosphates.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to Cdxml file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/unsplit-nucleotides-connected-with-peptides.cdxml',
      FileType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/simple-schema-with-retrosynthetic-arrow.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/simple-schema-with-retrosynthetic-arrow.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back

    Valence is not displayed. After fixing https://github.com/epam/Indigo/issues/2205 need to update a screenshot.
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/schema-with-retrosynthetic-angel-arrows-and-plus.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/schema-with-retrosynthetic-angel-arrows-and-plus.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/schema-with-two-retrosynthetic-arrows.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/schema-with-two-retrosynthetic-arrows.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test(
    'Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2311 
    After fix we need update screenshot
    */

      await openFileAndAddToCanvas(
        page,
        'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      );

      await verifyFileExport(
        page,
        'CDXML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdxml',
        FileType.CDXML,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'CDXML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdxml',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that the schema with vertical retrosynthetic arrow could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2219
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        page,
        'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      );

      await verifyFileExport(
        page,
        'CDXML/schema-with-vertical-retrosynthetic-arrow.cdxml',
        FileType.CDXML,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'CDXML/schema-with-vertical-retrosynthetic-arrow.cdxml',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that the schema with diagonal retrosynthetic arrow could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2221
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        page,
        'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      );

      await verifyFileExport(
        page,
        'CDXML/schema-with-diagonal-retrosynthetic-arrow.cdxml',
        FileType.CDXML,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'CDXML/schema-with-diagonal-retrosynthetic-arrow.cdxml',
      );
      await takeEditorScreenshot(page);
    },
  );

  test('The Bond length setting with pt option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDXML specification
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '54.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'CDXML/layout-with-catalyst-pt-bond-lengh.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-catalyst-pt-bond-lengh.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied, click on layout and it should be save to CDXML specification
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '54.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/layout-with-catalyst-pt-hash-spacing-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-catalyst-pt-hash-spacing-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with cm option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied, click on layout and it should be save to CDXML specification
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/layout-with-catalyst-cm-hash-spacing-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-catalyst-cm-hash-spacing-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with inch option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied, click on layout and it should be save to CDXML specification
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '7.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/layout-with-catalyst-inch-hash-spacing-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-catalyst-inch-hash-spacing-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '7.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'CDXML/layout-with-catalyst-px-margin-size.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-catalyst-px-margin-size.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  Need to update screenshots after implementing https://github.com/epam/ketcher/issues/5650 and 
  https://github.com/epam/Indigo/issues/2458
  */
    test.slow();
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'CDXML/layout-with-dif-elements-acs-style.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/layout-with-dif-elements-acs-style.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing only reactants can be saved/loaded from CDXML with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only reactants can be saved/loaded from CDXML with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/reactant-single-reaction.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/reactant-single-reaction-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/reactant-single-reaction-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing only products can be saved/loaded from CDXML with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only products can be saved/loaded from CDXML with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/products-single-reaction.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/products-single-reaction-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/products-single-reaction-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDXML, ignoring the MTA', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Verify that a single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDXML, ignoring the MTA.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ket-cascade-reaction-3-1-2-1-1.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/ket-cascade-reaction-3-1-2-1-1-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/ket-cascade-reaction-3-1-2-1-1-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that multiple individual reactions (without any cascading) can be saved/loaded from CDXML with correct positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Multiple individual reactions (without any cascading) can be saved/loaded from CDXML with correct positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/multiple-individual-reactions.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/multiple-individual-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/multiple-individual-reactions-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that several cascaded reactions can be saved/loaded from CDXML, ignoring multi-tail arrows', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Several cascaded reactions can be saved/loaded from CDXML, ignoring multi-tail arrows.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/several-cascade-reactions.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/several-cascade-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/several-cascade-reactions-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a combination of a single reaction and a cascaded reaction can be saved/loaded from CDXML with correct positioning, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Combination of a single reaction and a cascaded reaction can be saved/loaded from CDXML with correct positioning, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/combination-of-single-and-cascade-reactions.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/combination-of-single-and-cascade-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/combination-of-single-and-cascade-reactions-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDXML, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDXML, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/cascade-of-multiple-reactions.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/cascade-of-multiple-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/cascade-of-multiple-reactions-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify the saving/loading a pathway with mixed single reactions and cascades from CDXML,  MTAs are ignored', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Saving/loading a pathway with mixed single reactions and cascades from CDXML,  MTAs are ignored.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/pathway-with-mixed-single-reactions-and-cascades.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/pathway-with-mixed-single-reactions-and-cascades-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/pathway-with-mixed-single-reactions-and-cascades-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });
});
