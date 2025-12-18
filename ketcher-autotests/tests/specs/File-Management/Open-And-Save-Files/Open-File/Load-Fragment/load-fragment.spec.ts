/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  openPasteFromClipboard,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  clickOnCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  takeElementScreenshot,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

const testCasesForOpeningFiles = [
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'Molfiles-V2000/cyclopentyl.mol',
    atomType: 'O',
    atomId: 20,
  },
  {
    firstFile: 'Molfiles-V2000/cyclopentyl.mol',
    secondFile: 'Rxn-V2000/reaction-3.rxn',
    atomType: 'C',
    atomId: 16,
  },
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'SMILES/1840-cyclopentyl.smi',
    atomType: 'O',
    atomId: 20,
  },
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'KET/simple-chain.ket',
    atomType: 'O',
    atomId: 20,
  },
];

test.describe('load as fragment (Add to Canvas) srtuctures from files with different formats', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  for (const testCase of testCasesForOpeningFiles) {
    const index = -1;
    const fileExtension = testCase.secondFile.split('.').at(index);
    test(`Load Fragment - Load as fragment (Add to Canvas) - ${fileExtension}-files`, async () => {
      /*
       * Test case: EPMLSOPKET-1860, EPMLSOPKET-1854, EPMLSOPKET-1861, EPMLSOPKET-2933
       */
      await openFileAndAddToCanvas(page, testCase.firstFile);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

      await CommonLeftToolbar(page).handTool();
      await getAtomLocator(page, {
        atomLabel: testCase.atomType,
        atomId: testCase.atomId,
      }).hover({
        force: true,
      });
      await dragMouseTo(x - 350, y - 150, page);
      await openFileAndAddToCanvas(page, testCase.secondFile);
    });
  }

  test('Open file - Input SMILE-string - check the preview', async () => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'C1=CC=CC=C1';
    await openPasteFromClipboard(page, smileString);
    await takeElementScreenshot(
      page,
      OpenStructureDialog(page).previewTextArea,
    );
    await OpenStructureDialog(page).closeWindow();
  });

  test('Open file - Input SMILE-string - open as new project', async () => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'C1=CC=CC=C1';

    await pasteFromClipboardAndOpenAsNewProject(page, smileString);
    await takeEditorScreenshot(page);
  });

  test('Open file - Input SMILE-string with arrow symbol - open as new project', async () => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileStringWithArrowSymbol = 'C1=CC=CC=C1>>C1=CC=CC=C1';

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      smileStringWithArrowSymbol,
    );
    await takeEditorScreenshot(page);
  });

  test('Open file - Input SMILE-string and try to add incorrect one', async () => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'CCCCCC';
    const incorrectSmileString = 'CCCCC0';

    await pasteFromClipboardAndOpenAsNewProject(page, smileString);

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      incorrectSmileString,
      // error expected
      false,
    );

    const convertErrorMessage = await ErrorMessageDialog(
      page,
    ).getErrorMessage();
    const expectedErrorMessage =
      'Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: ' +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed', " +
      "'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', " +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed', " +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed', " +
      "'scanner: BufferScanner::read() error'";

    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open/Import structure as a KET file - create KET file', async () => {
    /*
     * Test case: EPMLSOPKET-4702 (creating file)
     * Description: Creating a reaction using elements from vertical tool bars
     * Hydrogen tool is applied and element is moved on the left
     * Reaction Plus tool is applied and element is moved on the left
     * Oxygen tool is applied and element is moved on the left
     * Arrow Open Angle tool is applied
     * Hydrogen tool is applied again and placed on the right
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shiftForHydrogen = 200;
    const shiftForReactionPlus = 100;
    const shiftForOxygen = 5;
    const shiftForSecondHydrogen = 200;

    async function addAndMoveHydrogen() {
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Hydrogen);
      await clickInTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      const pointXToMoveElement = x - shiftForHydrogen;
      const pointYToMoveElement = y - 0;

      await CommonLeftToolbar(page).handTool();
      await getAtomLocator(page, { atomLabel: 'H' }).first().hover({
        force: true,
      });
      await dragMouseTo(pointXToMoveElement, pointYToMoveElement, page);
    }

    async function addAndMovePlusSymbol() {
      await LeftToolbar(page).reactionPlusTool();
      await clickInTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).areaSelectionTool();

      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(x - shiftForReactionPlus, y, page);
      await clickInTheMiddleOfTheScreen(page);
    }

    async function addAndMoveOxygen() {
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Oxygen);
      await clickInTheMiddleOfTheScreen(page);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      const pointXToMoveElement = x - shiftForOxygen;
      const pointYToMoveElement = y - 0;

      await CommonLeftToolbar(page).handTool();
      await getAtomLocator(page, { atomLabel: 'O' }).first().hover({
        force: true,
      });
      await dragMouseTo(pointXToMoveElement, pointYToMoveElement, page);
    }

    async function addArrowSymbol() {
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
      await clickInTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).areaSelectionTool();
    }

    async function addSecondHydrogen() {
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Hydrogen);
      await clickOnCanvas(page, x + shiftForSecondHydrogen, y, {
        button: 'left',
        from: 'pageTopLeft',
      });
    }

    await addAndMoveHydrogen();
    await addAndMovePlusSymbol();
    await addAndMoveOxygen();
    await addArrowSymbol();
    await addSecondHydrogen();
    await takeEditorScreenshot(page);
  });

  test('Open/Import structure as a KET file - open KET file', async () => {
    /*
     * Test case: EPMLSOPKET-4702 (opening file)
     * Test is related to the existing bug: https://github.com/epam/ketcher/issues/3153
     */
    await openFileAndAddToCanvas(
      page,
      'KET/hydrogen-plus-oxygen-arrow-hydrogen.ket',
    );
    await verifyFileExport(
      page,
      'KET/hydrogen-plus-oxygen-arrow-hydrogen-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
