/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import {
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  dragMouseTo,
  takeEditorScreenshot,
  moveMouseToTheMiddleOfTheScreen,
  selectEraseTool,
  openFileAndAddToCanvasAsNewProject,
  selectClearCanvasTool,
  waitForPageInit,
  moveOnBond,
  BondType,
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnBond,
  clickOnAtomById,
  clickOnCanvas,
  waitForRender,
  setZoomInputValue,
  resetCurrentTool,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';
import { pressCancelAtEditAbbreviationDialog } from '@utils/canvas/EditAbbreviation';

async function clickOnAtomOfExpandedMonomer(page: Page, atomId: number) {
  await clickOnAtomById(page, atomId);
}

async function selectExpandedMonomer(
  page: Page,
  bondType: number = BondType.SINGLE,
  bondNumber = 1,
) {
  await clickOnBond(page, bondType, bondNumber);
}

async function callContexMenu(page: Page, locatorText: string) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator.getByText(locatorText, { exact: true }).click({
    button: 'right',
  });
}

async function expandMonomer(page: Page, locatorText: string) {
  await callContexMenu(page, locatorText);
  await waitForRender(page, async () => {
    await page.getByText('Expand monomer').click();
  });
}

async function selectMonomerOnMicro(page: Page, monomerName: string) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await waitForRender(page, async () => {
    await canvasLocator.getByText(monomerName, { exact: true }).click();
  });
}

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await configureInitialState(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IMonomer {
  monomerDescription: string;
  KETFile: string;
  monomerLocatorText: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

// Unable to stabilize because of Undo/redo shift object on the canvas
// test.describe('Move collapsed monomer on Micro and Undo: ', () => {
//   test.beforeEach(async () => {
//     await turnOnMicromoleculesEditor(page);
//   });

//   const movableCollapsedMonomers: IMonomer[] = [
//     {
//       monomerDescription: '1. Petide D (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
//       monomerLocatorText: 'D',
//       pageReloadNeeded: true,
//     },
//     {
//       monomerDescription: '2. Sugar UNA (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
//       monomerLocatorText: 'UNA',
//       pageReloadNeeded: true,
//     },
//     {
//       monomerDescription: '3. Base hU (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
//       monomerLocatorText: 'hU',
//     },
//     {
//       monomerDescription: '4. Phosphate bnn (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
//       monomerLocatorText: 'bnn',
//       pageReloadNeeded: true,
//     },
//     {
//       monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
//       monomerLocatorText: '5hMedC',
//     },
//     {
//       monomerDescription: '6. CHEM 4aPEGMal (from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
//       monomerLocatorText: '4aPEGMal',
//     },
//     {
//       monomerDescription:
//         '7. Peptide X (ambiguouse, alternatives, from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library).ket',
//       monomerLocatorText: 'X',
//     },
//     {
//       monomerDescription:
//         '8. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '9. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription:
//         '10. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '11. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '12. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription:
//         '13. DNA base N (ambiguous, alternatives, from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
//       monomerLocatorText: 'N',
//     },
//     {
//       monomerDescription:
//         '14. RNA base N (ambiguous, alternatives, from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
//       monomerLocatorText: 'N',
//     },
//     {
//       monomerDescription: '15. Base M (ambiguous, alternatives, from library)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
//       monomerLocatorText: 'M',
//     },
//     {
//       monomerDescription: '16. DNA base A+C+G+T (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '17. RNA base A+C+G+U (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '18. Base A+C (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//       pageReloadNeeded: true,
//     },
//     {
//       monomerDescription: '19. Phosphate bnn,cmp,nen (ambiguous, alternatives)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '20. Phosphate bnn+cmp+nen (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//       pageReloadNeeded: true,
//     },
//     {
//       monomerDescription:
//         '21. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '22. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
//       monomerLocatorText: '%',
//     },
//     {
//       monomerDescription: '23. Unknown nucleotide',
//       KETFile:
//         'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
//       monomerLocatorText: 'Unknown',
//     },
//   ];

//   for (const movableCollapsedMonomer of movableCollapsedMonomers) {
//     test(`${movableCollapsedMonomer.monomerDescription}`, async () => {
//       /*
//        * Test task: https://github.com/epam/ketcher/issues/5773
//        * Description: Verify that moving a collapsed monomer (abbreviation) to a new location
//        *              on the canvas and then using Undo correctly repositions the monomer back to
//        *              its original position, then Redo moves it back to the new location
//        *
//        * Case: 1. Load monomer on Molecules canvas and move it to certain place
//        *       2. Take screenshot to witness initial position
//        *       3. Grab it and move it to the top left corner
//        *       6. Take screenshot to witness final position
//        *       7. Press Undo button to witness initial position
//        */
//       if (movableCollapsedMonomer.pageReloadNeeded) {
//         await pageReload(page);
//         await turnOnMicromoleculesEditor(page);
//       }

//       await openFileAndAddToCanvasAsNewProject(
//         movableCollapsedMonomer.KETFile,
//         page,
//       );
//       const canvasLocator = page.getByTestId('ketcher-canvas');
//       const monomerLocator = canvasLocator.getByText(
//         movableCollapsedMonomer.monomerLocatorText,
//         { exact: true },
//       );
//       await moveMonomerOnMicro(page, monomerLocator, 400, 400);
//       await moveMouseToTheMiddleOfTheScreen(page);
//       await takeEditorScreenshot(page);

//       await moveMonomerOnMicro(page, monomerLocator, 100, 100);
//       await moveMouseToTheMiddleOfTheScreen(page);
//       await takeEditorScreenshot(page);

//       await pressUndoButton(page);
//       await takeEditorScreenshot(page);

//       // Test should be skipped if related bug exists
//       test.fixme(
//         movableCollapsedMonomer.shouldFail === true,
//         `That test results are wrong because of ${movableCollapsedMonomer.issueNumber} issue(s).`,
//       );
//     });
//   }
// });

async function moveExpandedMonomerOnMicro(page: Page, x: number, y: number) {
  await moveOnBond(page, BondType.SINGLE, 1);
  await dragMouseTo(x, y, page);
}

const movableExpandedMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Petide D (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
    monomerLocatorText: 'D',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '2. Sugar UNA (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
    monomerLocatorText: 'UNA',
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    monomerLocatorText: 'hU',
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    monomerLocatorText: 'bnn',
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    monomerLocatorText: '5hMedC',
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    monomerLocatorText: '4aPEGMal',
  },
];

test.describe('Move in expanded state on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const movableExpandedMonomer of movableExpandedMonomers) {
    test(`${movableExpandedMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: Verify that expanded macromolecules can be moved across the canvas
       *
       * Case: 1. Load monomer on Molecules canvas
       *       2. Expand it
       *       2. Take screenshot to witness initial position
       *       3. Grab it and move it to the top left corner
       *       6. Take screenshot to witness final position
       */
      if (movableExpandedMonomer.pageReloadNeeded) {
        await pageReload(page);
        await turnOnMicromoleculesEditor(page);
      }
      await openFileAndAddToCanvasAsNewProject(
        movableExpandedMonomer.KETFile,
        page,
      );

      await expandMonomer(page, movableExpandedMonomer.monomerLocatorText);
      await takeEditorScreenshot(page);

      await moveExpandedMonomerOnMicro(page, 200, 200);
      await moveMouseToTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        movableExpandedMonomer.shouldFail === true,
        `That test results are wrong because of ${movableExpandedMonomer.issueNumber} issue(s).`,
      );
    });
  }
});

test.describe('Move expanded monomer on Micro and Undo: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const movableExpandedMonomer of movableExpandedMonomers) {
    test(`${movableExpandedMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: Verify that expanded macromolecules can be moved across the canvas
       *
       * Case: 1. Load monomer on Molecules canvas
       *       2. Expand it
       *       2. Take screenshot to witness initial position
       *       3. Grab it and move it to the top left corner
       *       6. Take screenshot to witness final position
       *       7. Press Undo button
       *       8. Take screenshot to witness initial position
       */
      if (movableExpandedMonomer.pageReloadNeeded) {
        await pageReload(page);
        await turnOnMicromoleculesEditor(page);
      }
      await openFileAndAddToCanvasAsNewProject(
        movableExpandedMonomer.KETFile,
        page,
      );

      await expandMonomer(page, movableExpandedMonomer.monomerLocatorText);
      await takeEditorScreenshot(page);

      await moveExpandedMonomerOnMicro(page, 200, 200);
      await moveMouseToTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      await pressUndoButton(page);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        movableExpandedMonomer.shouldFail === true,
        `That test results are wrong because of ${movableExpandedMonomer.issueNumber} issue(s).`,
      );
    });
  }
});

const expandableMonomer: IMonomer = {
  monomerDescription: '1. Petide D (from library)',
  KETFile:
    'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
  monomerLocatorText: 'D',
};

test(`Verify that the system supports undo/redo functionality for expanding and collapsing monomers in micro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that the system supports undo/redo functionality for expanding and collapsing monomers in micro mode
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Expand it
   *       2. Take screenshot to witness initial state
   *       3. Press Undo button
   *       4. Take screenshot to witness final position
   *       5. Press Redo button
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(expandableMonomer.KETFile, page);
  await expandMonomer(page, expandableMonomer.monomerLocatorText);
  await takeEditorScreenshot(page);
  await pressUndoButton(page);
  await takeEditorScreenshot(page);
  await pressRedoButton(page);
  await takeEditorScreenshot(page);
});

test(`Verify switching back from micro mode to macro mode with expanded and collapsed monomers`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify switching back from micro mode to macro mode with expanded and collapsed monomers
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Expand it
   *       2. Take screenshot to witness initial state
   *       3. Switch to Macro mode
   *       4. Switch to Micro mode
   *       6. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(expandableMonomer.KETFile, page);
  await expandMonomer(page, expandableMonomer.monomerLocatorText);
  await takeEditorScreenshot(page);
  await turnOnMacromoleculesEditor(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5849 issue(s).`,
  );
});

const copyableMonomer: IMonomer = {
  monomerDescription: '1. Petide D (from library)',
  KETFile:
    'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
  monomerLocatorText: 'D',
};

test(`Verify that the system supports copy/paste functionality for collapsed monomers in micro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that the system supports copy/paste functionality for collapsed monomers in micro mode
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Copy monomer to clipboard
   *       4. Paste it to the canvas
   *       5. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(copyableMonomer.KETFile, page);
  await takeEditorScreenshot(page);
  await selectMonomerOnMicro(page, copyableMonomer.monomerLocatorText);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 200, 200);
  await takeEditorScreenshot(page);
});

const cutableMonomer: IMonomer = {
  monomerDescription: '1. Petide D (from library)',
  KETFile:
    'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
  monomerLocatorText: 'D',
};

test(`Verify that the system supports cut/paste functionality for collapsed monomers in micro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that the system supports cut/paste functionality for collapsed monomers in micro mode
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Cut monomer to clipboard
   *       4. Paste it to the canvas
   *       5. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(cutableMonomer.KETFile, page);
  await takeEditorScreenshot(page);
  await selectMonomerOnMicro(page, cutableMonomer.monomerLocatorText);

  await cutToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 200, 200);
  await takeEditorScreenshot(page);
});

test(`Verify that the system supports copy/paste functionality for expanded monomers in micro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that the system supports copy/paste functionality for expanded monomers in micro mode
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Expand monomer
   *       3. Click on any monomer bond to select it
   *       4. Take screenshot to witness initial state
   *       5. Copy monomer to clipboard
   *       6. Paste it to the canvas
   *       7. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(copyableMonomer.KETFile, page);
  await expandMonomer(page, copyableMonomer.monomerLocatorText);
  await takeEditorScreenshot(page);
  await selectExpandedMonomer(page);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 200, 200);

  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5831 issue(s).`,
  );
});

test(`Verify that the system supports cut/paste functionality for expanded monomers in micro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that the system supports cut/paste functionality for expanded monomers in micro mode
   *
   * Case: 1. Load monomer on Molecules canvas
   *       2. Expand monomer
   *       3. Click on any monomer bond to select it
   *       4. Take screenshot to witness initial state
   *       5. Cut monomer to clipboard
   *       6. Paste it to the canvas
   *       7. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(cutableMonomer.KETFile, page);
  await expandMonomer(page, cutableMonomer.monomerLocatorText);
  await takeEditorScreenshot(page);
  await selectExpandedMonomer(page);
  await cutToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 200, 200);
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5831 issue(s).`,
  );
});

test(`Verify that "Expand monomer" does not break cyclic structures when the ring is expanded`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that "Expand monomer" does not break cyclic structures when the ring is expanded
   *
   * Case: 1. Load monomer cycle on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Expand all monomers from cycle
   *       4. Take screenshot to witness final position
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers cycled.ket',
    page,
  );
  await setZoomInputValue(page, '50');
  await resetCurrentTool(page);
  await takeEditorScreenshot(page);
  await expandMonomer(page, 'A');
  await expandMonomer(page, '5hMedC');
  await expandMonomer(page, 'gly');
  await expandMonomer(page, 'Mal');
  await expandMonomer(page, '12ddR');
  await expandMonomer(page, 'oC64m5');
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5670 issue(s).`,
  );
});

test(`Verify that expanding multiple monomers works in a left-to-right order within a chain`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that expanding multiple monomers works in a left-to-right order within a chain
   *
   * Case: 1. Load monomer chain on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Expand all monomers from  chain (from right to left)
   *       4. Take screenshot to witness final position
   */
  await pageReload(page);
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers in horisontal chain.ket',
    page,
  );
  await setZoomInputValue(page, '50');
  await resetCurrentTool(page);
  await takeEditorScreenshot(page);
  await expandMonomer(page, '12ddR');
  await expandMonomer(page, 'Mal');
  await expandMonomer(page, 'A');
  await expandMonomer(page, '5hMedC');
  await expandMonomer(page, 'gly');
  await expandMonomer(page, 'oC64m5');
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5670 issue(s).`,
  );
});

test(`Verify that expanding multiple monomers works in a top-to-bottom order within a chain`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that expanding multiple monomers works in a top-to-bottom order within a chain
   *
   * Case: 1. Load monomer chain on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Expand all monomers from chain (from top to bottom)
   *       4. Take screenshot to witness final position
   */
  await pageReload(page);
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers in vertical chain.ket',
    page,
  );
  await setZoomInputValue(page, '40');
  await resetCurrentTool(page);
  await takeEditorScreenshot(page);
  await expandMonomer(page, 'oC64m5');
  await expandMonomer(page, 'gly');
  await expandMonomer(page, '5hMedC');
  await expandMonomer(page, 'A');
  await expandMonomer(page, 'Mal');
  await expandMonomer(page, '12ddR');
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5670 issue(s).`,
  );
});

test(`Verify that expanding monomers with big mircomolecule ring structures in the middle behaves correctly without breaking the chain`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that expanding monomers with big mircomolecule ring structures in the middle behaves correctly without breaking the chain
   *
   * Case: 1. Load monomer chain on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. Expand all monomers from chain (from right to left)
   *       4. Take screenshot to witness final position
   */
  await pageReload(page);
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers in horisontal chain and large micromolecule in the middle.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await expandMonomer(page, 'oC64m5');
  await expandMonomer(page, 'gly');
  await expandMonomer(page, '5hMedC');
  await expandMonomer(page, 'A');
  await expandMonomer(page, 'Mal');
  await expandMonomer(page, '12ddR');
  await takeEditorScreenshot(page);

  test.fixme(
    // eslint-disable-next-line no-self-compare
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5670 issue(s).`,
  );
});

type monomer = {
  name: string;
  AtomId: number;
};

const monomers: monomer[] = [
  { name: '12ddR', AtomId: 70 },
  { name: 'Mal', AtomId: 0 },
  { name: 'A', AtomId: 58 },
  { name: '5hMedC', AtomId: 53 },
  { name: 'gly', AtomId: 30 },
  { name: 'oC64m5', AtomId: 25 },
];

test(`Verify that deleting an expanded monomer in a chain structure using the Erase tool cause Edit Abbreviations dialog to appear`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5773
   * Description: Verify that deleting an expanded monomer in a chain structure using the Erase tool cause Edit Abbreviations dialog to appear
   *
   * Case: 1. Load monomer chain on Molecules canvas
   *       2. Take screenshot to witness initial state
   *       3. For each monomer do the following:
   *           3.1 Expand monomer
   *           3.2 Select Erase tool and click on expanded monomer
   *           3.3 Take screenshot to witness opened dialog
   *           3.4 Press Cancel in appeared Abbriviation dialog
   *           3.5 Undo changes to collapse momomer back
   */
  await pageReload(page);
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers in horisontal chain.ket',
    page,
  );
  await takeEditorScreenshot(page);

  for (const monomer of monomers) {
    await expandMonomer(page, monomer.name);
    await selectEraseTool(page);
    await clickOnAtomOfExpandedMonomer(page, monomer.AtomId);
    await takeEditorScreenshot(page);
    await pressCancelAtEditAbbreviationDialog(page);
    await pressUndoButton(page);
  }
});

// NOT ACTUAL BECAUSE OF BUG: https://github.com/epam/ketcher/issues/5849
// async function clickOnBondOfExpandedMonomer(page: Page, bondId: number) {
//   await clickOnBondById(page, bondId);
// }
// const tryToChangeMonomers: IMonomer[] = [
//   {
//     monomerDescription: '1. Petide D (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
//     monomerLocatorText: 'D',
//   },
//   {
//     monomerDescription: '2. Sugar UNA (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
//     monomerLocatorText: 'UNA',
//   },
//   {
//     monomerDescription: '3. Base hU (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
//     monomerLocatorText: 'hU',
//   },
//   {
//     monomerDescription: '4. Phosphate bnn (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
//     monomerLocatorText: 'bnn',
//   },
//   {
//     monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
//     monomerLocatorText: '5hMedC',
//   },
//   {
//     monomerDescription: '6. CHEM 4aPEGMal (from library)',
//     KETFile:
//       'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
//     monomerLocatorText: '4aPEGMal',
//   },
// ];

// test.describe('Trying to change: ', () => {
//   test.beforeEach(async () => {
//     await turnOnMicromoleculesEditor(page);
//   });

//   for (const tryToChangeMonomer of tryToChangeMonomers) {
//     test(`${tryToChangeMonomer.monomerDescription}`, async () => {
//       /*
//        * Test task: https://github.com/epam/ketcher/issues/5773
//        * Description: Verify that no atoms or bonds can be added/removed from the expanded monomer
//        *
//        * Case: 1. Load monomer Molecules canvas
//        *       2. Expand it
//        *       2. Take screenshot to witness initial state
//        *       3. For each monomer do the following:
//        *           3.1 Select atom from right tool bar (Br) and click on any atom of expanded monomer
//        *           3.2 Take screenshot to witness opened dialog
//        *           3.3 Press Cancel on appeared dialog
//        *           3.4 Select triple bond from left menu and click on any bond of expanded monomer
//        *           3.5 Take screenshot to witness opened dialog
//        *           3.6 Press Cancel on appeared dialog
//        */

//       await openFileAndAddToCanvasAsNewProject(
//         tryToChangeMonomer.KETFile,
//         page,
//       );
//       await expandMonomer(page, tryToChangeMonomer.monomerLocatorText);
//       await takeEditorScreenshot(page);

//       await selectAtomInToolbar(AtomButton.Bromine, page);
//       await clickOnAtomOfExpandedMonomer(page, 1);
//       await takeEditorScreenshot(page);
//       await pressCancelAtEditAbbreviationDialog(page);

//       await selectBond(BondTypeName.Triple, page);
//       await clickOnBondOfExpandedMonomer(page, 1);
//       await takeEditorScreenshot(page);
//       await pressCancelAtEditAbbreviationDialog(page);

//       // Test should be skipped if related bug exists
//       test.fixme(
//         expandableMonomer.shouldFail === true,
//         `That test results are wrong because of ${tryToChangeMonomer.issueNumber} issue(s).`,
//       );
//     });
//   }
// });

test(
  `Verify that after using the Erase tool to delete an expanded monomer in both chain and ring structures, ` +
    `the Undo and Redo functionality works correctly, restoring or re-removing the expanded monomer and its bonds`,
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5773
     * Description: Verify that after using the Erase tool to delete an expanded monomer in both chain and ring structures,
     *              the Undo and Redo functionality works correctly, restoring or re-removing the expanded monomer and its bonds
     *
     * Case: 1. Load monomer chain on Molecules canvas
     *       2. Take screenshot to witness initial state
     *         3. For each monomer do the following:
     *           3.1 Expand monomer
     *           3.2 Click on any atom to select molecule inside monomer
     *           3.3 Press Erase tool button to delete expanded monomer
     *           3.4 Take screenshot to witness monomer erase
     *           3.5 Press Undo button
     *           3.6 Take screenshot to witness monomer got back
     *           3.7 Press Undo button
     *           3.8 Take screenshot to witness monomer got collapsed
     */
    test.slow();
    await pageReload(page);
    await turnOnMicromoleculesEditor(page);

    await openFileAndAddToCanvasAsNewProject(
      'KET/Micro-Macro-Switcher/All type of monomers in horisontal chain.ket',
      page,
    );
    // Pic 1
    await takeEditorScreenshot(page);

    for (const monomer of monomers) {
      await expandMonomer(page, monomer.name);
      await clickOnAtomOfExpandedMonomer(page, monomer.AtomId);
      await selectEraseTool(page);
      // Pic 2, 5, 8, 11, 14, 17
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      // Pic 3, 6, 9, 12, 15, 18
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      // Pic 4, 6, 10, 13, 16, 19
      await takeEditorScreenshot(page);
    }
  },
);
