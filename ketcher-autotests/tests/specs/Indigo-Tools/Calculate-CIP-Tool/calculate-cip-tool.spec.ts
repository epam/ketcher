/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, test, Page } from '@fixtures';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  BondType,
  clickInTheMiddleOfTheScreen,
  receiveFileComparisonData,
  saveToFile,
  waitForRender,
  clickOnBond,
  openFileAndAddToCanvasAsNewProject,
  clickOnCanvas,
  clickOnAtom,
  addMonomerToCenterOfCanvas,
  deleteByKeyboard,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getMolfile, MolFileFormat } from '@utils/formats';
import {
  FileType,
  verifyFileExport,
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  MacroBondType,
  MicroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  COORDINATES_TO_PERFORM_ROTATION,
  horizontalFlip,
  rotateToCoordinates,
  verticalFlip,
} from '@tests/specs/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  setACSSettings,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { MiewDialog } from '@tests/pages/molecules/canvas/MiewDialog';
import { InfoMessageDialog } from '@tests/pages/molecules/canvas/InfoMessageDialog';

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptide.A).hover();
  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();
  await page.mouse.down();
  await page.locator('g:nth-child(2) > rect').hover();
  await page.mouse.up();
}

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Operation with a structure without stereo properties', async () => {
    /*
    Test case: EPMLSOPKET-1886
    Description: The structure isn`t changed.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Operation with structure including stereo properties (R/S labels)', async () => {
    /*
    Test case: EPMLSOPKET-1887
    Description: (R) and (S) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Operation with empty canvas', async () => {
    /*
    Test case: EPMLSOPKET-1885
    Description: Nothing happens on the canvas when it is empty.
    Ketcher functions work correctly after clicking the 'Calculate CIP' button on the empty canvas.
    */
    await IndigoFunctionsToolbar(page).calculateCIP();
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await CommonLeftToolbar(page).eraseButton.click();
    await takeEditorScreenshot(page);
  });

  test('Layout/Undo with structure that contain stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1900
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Stereo labels disappear after 'Layout' action.
    'Undo' action leads to the previous structure with stereo labels.
    */
    // will work after bugfix in 2.13-rc.3 bug#3025
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await IndigoFunctionsToolbar(page).layout();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste of structure that contain stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1896
    Description: The structure is copied.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste of structure that contain stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1898
    Description: The structure is cut.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Operation with structure including stereo properties (E/Z labels)', async () => {
    /*
    Test case: EPMLSOPKET-1888
    Description: (E) and (Z) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structures-with-stereo-bonds-ez.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(1 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-1.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(2 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-2.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(3 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-3.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(4 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-4.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(5 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-5.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(6 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-6.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(7 structure) Calculate files that contain stereo labels (various structure combinations)', async () => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds-7.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Aromatize/Undo with structure that contain stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1910
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Stereo labels disappear after 'Aromatize' action.
    'Undo' action leads to previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/aromatic-with-stereolabels.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);

    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('3D View_structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1919
    Description: Stereo labels appear near stereobonds after the 'Calculate CIP' action.
    The structure appears in 3D Viewer dialog without stereo labels.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await IndigoFunctionsToolbar(page).threeDViewer();
    await takeEditorScreenshot(page);
    await MiewDialog(page).closeWindow();
  });

  test('(Erase bond with stereo labels and Undo) Manipulations with structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1925
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Bond with stereo label is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, 3);
    });
    await deleteByKeyboard(page);

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('(Erase atom with stereo labels and Undo) Manipulations with structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1925
    Description: An atom of a stereo bond is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, { atomLabel: 'N', atomId: 2 }).click();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('(Rotate structure) Manipulations with structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1925
    Description: The whole fragment is rotated around the structure center. Stereo labels are rotated with structure.
    */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await selectAllStructuresOnCanvas(page);

    const rotationHandle = page.getByTestId('rotation-handle');
    await rotationHandle.hover();
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test('(Add a new stereobond to the structure) Manipulations with structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1925
    Description: New stereobond is added to the Chain structure.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check tooltip and labels', async () => {
    /*
    Test case: EPMLSOPKET-11841
    Description: The labels are next to the stereo bonds. When you hover over the label, the tooltip does not appear.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test(
    'Validate that the schema with retrosynthetic arrow after clicking on Calculate CIP tool',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2318
    After fix we need update file and screenshot.
     */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/schema-with-retrosynthetic-arrow-for-options.ket',
      );
      await IndigoFunctionsToolbar(page).calculateCIP();
      await takeEditorScreenshot(page);
    },
  );
});

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Check .ket file CIP data must be moved from s-group properties to atom properties', async () => {
    /*
    Test case: EPMLSOPKET-11842
    Description: CIP data located in file at atom properties section
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();

    await verifyFileExport(
      page,
      'KET/structure-with-stereo-bonds-expected.ket',
      FileType.KET,
    );
  });

  // TODO: It's unstable, skip for now
  test.skip(
    'Save as .mol V2000 file structure with stereo labels',
    {
      tag: ['@FlackyTest'],
    },
    async () => {
      /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V2000 file.

    IMPORTANT: This test some times fails because of https://github.com/epam/ketcher/issues/2647 and https://github.com/epam/ketcher/issues/3951
    */
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/structure-with-stereo-bonds.mol',
      );
      const expectedFile = await getMolfile(page, MolFileFormat.v2000);
      await saveToFile(
        'Molfiles-V2000/structure-with-stereo-bonds-expectedV2000.mol',
        expectedFile,
      );
      await IndigoFunctionsToolbar(page).calculateCIP();
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          metaDataIndexes: METADATA_STRING_INDEX,
          expectedFileName:
            'Molfiles-V2000/structure-with-stereo-bonds-expectedV2000.mol',
          fileFormat: MolFileFormat.v2000,
        });

      expect(molFile).toEqual(molFileExpected);
    },
  );

  test('Save as .mol V3000 file structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V3000 file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/structure-with-stereo-bonds-expectedV3000.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });

  test('Save as .smi file structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1912
    Description: The file is saved as .smi file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'SMILES/structure-with-stereo-bonds.smi',
      FileType.SMILES,
    );
  });

  test('Save as .inchi file structure with stereo labels', async () => {
    /*
    Test case: EPMLSOPKET-1918
    Description: The file is saved as .inchi file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'InChI/structure-with-stereo-bonds.inchi',
      FileType.InChI,
    );
  });

  test('Check smart positioning of CIP stereo-labels for atoms on various structures ( rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures ( rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Save and Open structure with smart positioning of CIP stereo-labels for atoms on various structures in KET ( rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures ( rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Save to KET
     * 5. Open saved file
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'KET/ring-and-chains-with-stereo-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Save and Open structure with smart positioning of CIP stereo-labels for atoms on various structures in MOL V3000 (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures ( rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After opening the file, the CIP stereo-labels are mising because of MOL V3000 format limitations.
     * The CIP stereo-labels are not saved in the file.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Save to MOL V3000
     * 5. Open saved file
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'Molfiles-V3000/ring-and-chains-with-stereo-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/ring-and-chains-with-stereo-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Save and Open structure with smart positioning of CIP stereo-labels for atoms on various structures in SVG ( rings, chains)', async () => {
    // Test fails because of the bug: https://github.com/epam/Indigo/issues/3049
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures ( rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Save to SVG
     * 5. Open saved file
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifySVGExport(page);
  });

  test('Save and Open structure with smart positioning of CIP stereo-labels for atoms on various structures in PNG ( rings, chains)', async () => {
    // Test fails because of the bug: https://github.com/epam/Indigo/issues/3049
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures ( rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Save to PNG
     * 5. Open saved file
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyPNGExport(page);
  });

  test('Erase and Undo atoms with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After Undo the CIP stereo-labels are restored.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Erase atom with CIP stereo-label
     * 5. Press Undo
     * 6. Check that CIP stereo-label is restored
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).erase();
    await clickOnAtom(page, 'C', 1);
    await clickOnAtom(page, 'C', 4);
    await clickOnAtom(page, 'C', 6);
    await clickOnAtom(page, 'C', 9);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 4; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Switching and displaying to different views (flex, sequence, snake) smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly in different views (flex, sequence, snake).
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Switch to Flex view, Sequence view, Snake view
     * 5. Check that CIP stereo-labels are displayed correctly in all views
     * We have a bug with displaying CIP stereo-labels in Flex and Sequence views, so we need to skip this test for now.
     * https://github.com/epam/ketcher/issues/7239
     * After fix we need update screenshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Rotate structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After rotation the CIP stereo-labels are rotated with structure.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Rotate structure
     * 5. Check that CIP stereo-labels are rotated with structure
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Horizontal flip structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After horizontal flip the CIP stereo-labels are flipped with structure.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Flip structure horizontally
     * 5. Check that CIP stereo-labels are flipped with structure
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await horizontalFlip(page);
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Vertical flip structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After vertical flip the CIP stereo-labels are flipped with structure.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Flip structure vertically
     * 5. Check that CIP stereo-labels are flipped with structure
     * We have a bug with displaying CIP stereo-labels after vertical flip, so we need to skip this test for now.
     * https://github.com/epam/ketcher/issues/7240
     * After fix we need update screenshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await verticalFlip(page);
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check zoom in and zoom out change for structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After zoom in and zoom out the CIP stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Zoom in and zoom out
     * 5. Check that CIP stereo-labels are positioned correctly
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('150');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await takeEditorScreenshot(page);
  });

  test('Add ACS style in Settings and check structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains) ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After zoom in and zoom out the CIP stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Add ACS style in Settings
     * 5. Check that CIP stereo-labels are positioned correctly
     * We have a bug with displaying CIP stereo-labels after adding ACS style, so we need to skip this test for now.
     * https://github.com/epam/ketcher/issues/7214
     * After fix we need update screenshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await setACSSettings(page);
    await takeEditorScreenshot(page);
  });

  test('Add ACS style in Settings and rotate structure with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After ACS style is added and structure is rotated, the CIP stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Add ACS style in Settings
     * 5. Rotate structure
     * 6. Check that CIP stereo-labels are positioned correctly
     * We have a bug with displaying CIP stereo-labels after adding ACS style, so we need to skip this test for now.
     * https://github.com/epam/ketcher/issues/7214
     * After fix we need update screenshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
    if (await InfoMessageDialog(page).isVisible()) {
      await InfoMessageDialog(page).ok();
    }
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
    if (await InfoMessageDialog(page).isVisible()) {
      await InfoMessageDialog(page).ok();
    }
  });

  test('Add ACS style in Settings and check structure with CIP stereo-labels for atoms on various structures and levels of canvas zoom (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After ACS style is added and structure is zoomed in and out, the CIP stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Add ACS style in Settings
     * 5. Zoom in and zoom out
     * 6. Check that CIP stereo-labels are positioned correctly
     * We have a bug with displaying CIP stereo-labels after adding ACS style, so we need to skip this test for now.
     * https://github.com/epam/ketcher/issues/7214
     * After fix we need update screenshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await setACSSettings(page);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('150');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await takeEditorScreenshot(page);
  });

  test('Connect monomer to atom with smart positioning of CIP stereo-labels for atoms on various structures (rings, chains)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7233
     * Description: CIP stereo-labels for atoms on various structures (rings, chains) not intersect with atoms and bonds.
     * Stereo-labels are positioned correctly. After connecting monomer to atom, the CIP stereo-labels are positioned correctly.
     * Version 3.5
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Calculate CIP
     * 4. Switch to Macromolecules
     * 5. Connect monomer to atom
     * 6. Check that CIP stereo-labels are positioned correctly
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ring-and-chains-with-stereo.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await addMonomerToCenterOfCanvas(page, Peptide.A);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
