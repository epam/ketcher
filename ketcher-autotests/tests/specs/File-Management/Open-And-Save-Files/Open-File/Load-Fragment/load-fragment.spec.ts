import { test, expect, Page } from '@playwright/test';
import { commonLeftToolbarLocators } from '@tests/pages/common/CommonLeftToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  openPasteFromClipboard,
  waitForPageInit,
  selectLeftPanelButton,
  dragMouseTo,
  LeftPanelButton,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  moveOnAtom,
  clickOnCanvas,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

const testCasesForOpeningFiles = [
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'Molfiles-V2000/cyclopentyl.mol',
    atomType: 'O',
  },
  {
    firstFile: 'Molfiles-V2000/cyclopentyl.mol',
    secondFile: 'Rxn-V2000/reaction-3.rxn',
    atomType: 'C',
  },
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'SMILES/1840-cyclopentyl.smi',
    atomType: 'O',
  },
  {
    firstFile: 'Molfiles-V2000/glutamine.mol',
    secondFile: 'KET/simple-chain.ket',
    atomType: 'O',
  },
];

async function moveElement(
  page: Page,
  atomLabel: string,
  atomNumber: number,
  xShiftForElement = 350,
  yShiftForElement = 150,
) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const pointXToMoveElement = x - xShiftForElement;
  const pointYToMoveElement = y - yShiftForElement;

  await commonLeftToolbarLocators(page).handToolButton.click();
  await moveOnAtom(page, atomLabel, atomNumber);
  await dragMouseTo(pointXToMoveElement, pointYToMoveElement, page);
}

test.describe('load as fragment (Add to Canvas) srtuctures from files with different formats', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  for (const testCase of testCasesForOpeningFiles) {
    const index = -1;
    const fileExtension = testCase.secondFile.split('.').at(index);
    test(`Load Fragment - Load as fragment (Add to Canvas) - ${fileExtension}-files`, async ({
      page,
    }) => {
      /*
       * Test case: EPMLSOPKET-1860, EPMLSOPKET-1854, EPMLSOPKET-1861, EPMLSOPKET-2933
       */
      await openFileAndAddToCanvas(testCase.firstFile, page);
      await moveElement(page, testCase.atomType, 0);
      await openFileAndAddToCanvas(testCase.secondFile, page);
    });
  }

  test('Open file - Input SMILE-string - check the preview', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'C1=CC=CC=C1';
    await openPasteFromClipboard(page, smileString);
    await takeEditorScreenshot(page);
  });

  test('Open file - Input SMILE-string - open as new project', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'C1=CC=CC=C1';

    await pasteFromClipboardAndOpenAsNewProject(page, smileString);
    await takeEditorScreenshot(page);
  });

  test('Open file - Input SMILE-string with arrow symbol - open as new project', async ({
    page,
  }) => {
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

  test('Open file - Input SMILE-string and try to add incorrect one', async ({
    page,
  }) => {
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

    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: ' +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed', " +
      "'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', " +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed'";
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
    await takeEditorScreenshot(page);
  });

  test('Open/Import structure as a KET file - create KET file', async ({
    page,
  }) => {
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
      const atomToolbar = rightToolbar(page);

      await atomToolbar.clickAtom(Atom.Hydrogen);
      await clickInTheMiddleOfTheScreen(page);
      await moveElement(page, 'H', 0, shiftForHydrogen, 0);
    }

    async function addAndMovePlusSymbol() {
      await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
      await clickInTheMiddleOfTheScreen(page);
      await resetCurrentTool(page);

      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(x - shiftForReactionPlus, y, page);
      await clickInTheMiddleOfTheScreen(page);
    }

    async function addAndMoveOxygen() {
      const atomToolbar = rightToolbar(page);

      await atomToolbar.clickAtom(Atom.Oxygen);
      await clickInTheMiddleOfTheScreen(page);
      await moveElement(page, 'O', 0, shiftForOxygen, 0);
    }

    async function addArrowSymbol() {
      await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
      await clickInTheMiddleOfTheScreen(page);
      await resetCurrentTool(page);
    }

    async function addSecondHydrogen() {
      const atomToolbar = rightToolbar(page);

      await atomToolbar.clickAtom(Atom.Hydrogen);
      await clickOnCanvas(page, x + shiftForSecondHydrogen, y, {
        button: 'left',
      });
    }

    await addAndMoveHydrogen();
    await addAndMovePlusSymbol();
    await addAndMoveOxygen();
    await addArrowSymbol();
    await addSecondHydrogen();
    await takeEditorScreenshot(page);
  });

  test('Open/Import structure as a KET file - open KET file', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-4702 (opening file)
     * Test is related to the existing bug: https://github.com/epam/ketcher/issues/3153
     */
    await openFileAndAddToCanvas(
      'KET/hydrogen-plus-oxygen-arrow-hydrogen.ket',
      page,
    );
    await verifyFileExport(
      page,
      'KET/hydrogen-plus-oxygen-arrow-hydrogen-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
