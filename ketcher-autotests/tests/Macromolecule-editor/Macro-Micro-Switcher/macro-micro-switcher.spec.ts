/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Bases, Chem, Peptides, Phosphates, Sugars } from '@constants/monomers';
import { FAVORITES_TAB } from '@constants/testIdConstants';
import { Page, expect, test } from '@playwright/test';
import {
  AtomButton,
  FILE_TEST_DATA,
  FunctionalGroups,
  LeftPanelButton,
  RingButton,
  SaltsAndSolvents,
  SequenceType,
  TopPanelButton,
  addMonomersToFavorites,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnCanvas,
  clickOnFileFormatDropdown,
  clickUndo,
  dragMouseTo,
  drawBenzeneRing,
  getCml,
  getControlModifier,
  getSdf,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  openPasteFromClipboard,
  pressButton,
  readFileContents,
  receiveFileComparisonData,
  saveToFile,
  selectAllStructuresOnCanvas,
  selectAromatizeTool,
  selectAtomInToolbar,
  selectCleanTool,
  selectClearCanvasTool,
  selectDearomatizeTool,
  selectDropdownTool,
  selectEraseTool,
  selectFunctionalGroups,
  selectLayoutTool,
  selectLeftPanelButton,
  selectMacroBond,
  selectMonomer,
  selectOpenTool,
  selectOptionInDropdown,
  selectRing,
  selectSaltsAndSolvents,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  selectTopPanelButton,
  selectZoomInTool,
  selectZoomOutTool,
  selectZoomReset,
  setAttachmentPoints,
  switchSequenceEnteringButtonType,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  takeTopToolbarScreenshot,
  waitForLoad,
  waitForPageInit,
  waitForRender,
  waitForSpinnerFinishedWork,
} from '@utils';
import {
  addSuperatomAttachmentPoint,
  removeSuperatomAttachmentPoint,
} from '@utils/canvas/atoms/superatomAttachmentPoints';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { pageReload } from '@utils/common/helpers';
import { miewApplyButtonIsEnabled } from '@utils/common/loaders/waitForMiewApplyButtonIsEnabled';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  Tabs,
  chooseTab,
  enterSequence,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { goToRNATab, goToTab } from '@utils/macromolecules/library';
import { moveMonomerOnMicro } from '@utils/macromolecules/monomer';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';

const topLeftCorner = {
  x: -325,
  y: -235,
};

async function zoomWithMouseWheel(page: Page, scrollValue: number) {
  await waitForRender(page, async () => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, scrollValue);
    await page.keyboard.up('Control');
  });
}

async function scrollHorizontally(page: Page, scrollValue: number) {
  await waitForRender(page, async () => {
    await page.mouse.wheel(scrollValue, 0);
  });
}

async function pasteFromClipboard(
  page: Page,
  fileFormats: string,
  filename = '.ket',
) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileFormats);
  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
}

async function addToFavoritesMonomers(page: Page) {
  await addMonomersToFavorites(page, [
    Peptides.bAla,
    Peptides.Phe4Me,
    Peptides.meM,
    Sugars._25R,
    Bases.baA,
    Phosphates.bP,
    Chem.Test_6_Ch,
  ]);
}

async function setAtomAndBondSettings(page: Page) {
  await page.getByTestId('settings-button').click();
  await page.getByText('Atoms', { exact: true }).click();
  await page.getByText('Terminal and Hetero').click();
  await page.getByTestId('On-option').click();
  await page.getByText('Bonds', { exact: true }).click();
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as' })
    .getByRole('textbox')
    .nth(2)
    .click();
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as' })
    .getByRole('textbox')
    .nth(2)
    .fill('05');
  await page.getByTestId('OK').click();
}

async function openCdxFile(page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(
    'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
    page,
  );

  await selectOptionInDropdown(
    'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
    page,
  );
  await pressButton(page, 'Open as New Project');
}

async function openCdxmlFile(page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(
    'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
    page,
  );

  await selectOptionInDropdown(
    'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
    page,
  );
  await pressButton(page, 'Open as New Project');
}

enum FileFormat {
  SVGDocument = 'SVG Document',
  PNGImage = 'PNG Image',
}

async function saveFileAsPngOrSvgFormat(page: Page, FileFormat: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: FileFormat }).click();
}

async function open3DViewer(page: Page, waitForButtonIsEnabled = true) {
  await waitForRender(page, async () => {
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
  });
  if (waitForButtonIsEnabled) {
    await miewApplyButtonIsEnabled(page);
  }
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

test.describe('Macro-Micro-Switcher', () => {
  test(
    'Check that preview window of macro structure does not change in micro mode ',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: https://github.com/epam/ketcher/issues/3603
    Description: Preview window of macro structure doesn't change in micro mode
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3603
    */
      const scrollValue = -400;
      const moleculeLabels = ['A', '25R', 'baA', 'Test-6-Ph', 'Test-6-Ch'];
      await openFileAndAddToCanvasMacro('KET/five-monomers.ket', page);
      await turnOnMicromoleculesEditor(page);
      await scrollHorizontally(page, scrollValue);
      for (const label of moleculeLabels) {
        await waitForRender(page, async () => {
          await page.getByText(label, { exact: true }).hover();
        });
        await takeEditorScreenshot(page);
      }
    },
  );

  test('Check that macromolecule structures in micromode are represented as S-Groups with bonds', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Macromolecule structures in micromode are represented as S-Groups with bonds
    */
    await pageReload(page);
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('Edc').hover();
    await takeEditorScreenshot(page);
  });

  test.skip(
    'Micromolecules in macromode will be represented as CHEMs with generated name(F1, F2, ...Fn)',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Micromolecules in macromode represented as CHEMs with generated name(F1, F2, ...Fn)
    */
      await turnOnMicromoleculesEditor(page);
      await openFileAndAddToCanvas(
        'KET/eight-micromolecules.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Check that After hiding Library in Macro mode possible to see Show Library button', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: After hiding Library in Macro mode 'Show Library' button is visible.
    */
    await pageReload(page);
    await page.getByText('Hide').click();
    await takePageScreenshot(page);
    expect(page.getByText('Show Library')).toBeVisible();
  });

  test('Check that the Mol-structure opened from the file in Macro mode is visible on Micro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode
    */
    await openFileAndAddToCanvasMacro('Molfiles-V2000/glutamine.mol', page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check that the Ket-structure opened from the file in Macro mode is visible in Micro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode when
    */
    await pageReload(page);
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro('KET/stereo-and-structure.ket', page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Create a sequence of monomers in macro mode then switch to micro mode select the entire structure and move it to a new position', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Sequence of monomers moved to a new position in Micro mode
    Now test working not properly because we have bug https://github.com/epam/ketcher/issues/3654
    */
    const x = 400;
    const y = 400;
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await selectAllStructuresOnCanvas(page);
    await page.getByText('Edc').hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Add monomers in macro mode then switch to micro mode and check that it can not be expanded and abreviation can not be removed', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Abbreviation of monomer expanded without errors.
    Now test working not properly because we have bug https://github.com/epam/ketcher/issues/3659
    */
    await pageReload(page);
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('A6OH').click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Add monomers in macro mode then switch to micro mode and check that it can not be moved', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Sequence of monomers moved to a new position in Micro mode
    Now test working not properly because we have bug https://github.com/epam/ketcher/issues/3658
    */
    const x1 = 400;
    const y1 = 400;
    const x2 = 500;
    const y2 = 500;
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('Edc').hover();
    await dragMouseTo(x1, y1, page);
    await page.getByText('Edc').hover();
    await dragMouseTo(x2, y2, page);
    await takeEditorScreenshot(page);
  });

  test('Check that Zoom In/Zoom Out/ Reset Zoom Tools work (UI Buttons) after switching to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoom In/Zoom Out/ Reset Zoom Tools work after switching to Macro mode
    */
    await pageReload(page);

    const numberOfPressZoomIn = 5;
    const numberOfPressZoomOut = 8;
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await selectZoomInTool(page, numberOfPressZoomIn);
    await clickInTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);
    await selectZoomOutTool(page, numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectZoomReset(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check that Zoom In/Zoom Out/ Reset Zoom Tools work (Mouse scroll) after switching to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoom In/Zoom Out/ Reset Zoom Tools work after switching to Macro mode
    */
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await zoomWithMouseWheel(page, -400);

    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 250);

    await takeEditorScreenshot(page);
    await selectZoomOutTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that the zoomed in/out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoomed In/Out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode
    */
    await pageReload(page);
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await selectZoomOutTool(page, numberOfPressZoomIn);
    await clickInTheMiddleOfTheScreen(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 250);

    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Add to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs then switch to Micro mode and back', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Added to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs 
    when switching from Macro mode to Micro mode and back to Macro is saved
    */
    await pageReload(page);

    await addToFavoritesMonomers(page);
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await goToTab(page, FAVORITES_TAB);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that the Ket-structure pasted from the clipboard in Macro mode  is visible in Micro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Ket-structure pasted from the clipboard in Macro mode is visible in Micro mode
    */
    await turnOnMacromoleculesEditor(page);
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.oneFunctionalGroupExpandedKet,
    );
    await clickInTheMiddleOfTheScreen(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check that the Mol-structure pasted from the clipboard in Macro mode is visible in Micro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure pasted from the clipboard in Macro mode  is visible in Micro mode
    */
    await pageReload(page);

    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
      '.mol',
    );
    await clickInTheMiddleOfTheScreen(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  const tests = [
    { button: TopPanelButton.Layout, description: 'Layout' },
    { button: TopPanelButton.Clean, description: 'Clean Up' },
  ];

  for (const testInfo of tests) {
    test(`Check that Pressing ${testInfo.description} button not erase all macromolecules from canvas`, async () => {
      /* 
      Test case: Macro-Micro-Switcher/3712
      Description: Pressing Layout or Clean Up button not erase all macromolecules from canvas
      */
      await turnOnMacromoleculesEditor(page);
      await selectMonomer(page, Peptides.A);
      await clickInTheMiddleOfTheScreen(page);
      await turnOnMicromoleculesEditor(page);
      await waitForSpinnerFinishedWork(
        page,
        async () => await selectTopPanelButton(testInfo.button, page),
      );
      await takeEditorScreenshot(page);
    });
  }

  test('Check that for CHEMs monomer from when switch to micro mode restricted remove abbreviation', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Remove abbreviation restricted for CHEMs in micro mode.
    */
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickInTheMiddleOfTheScreen(page);
    await turnOnMicromoleculesEditor(page);
    await page.getByText('Test-6-Ch').click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test(
    'The 3D view works for micromolecules when there are macromolecules on the canvas',
    {
      tag: ['@IncorrectResultBecauseOfBug'],
    },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher/#4203
    Description: The 3D view works for micromolecules when there are macromolecules on the canvas.
    Now test working not properly because we have open ticket https://github.com/epam/ketcher/issues/4203
    After closing the ticket, should update the screenshots.

    */
      await turnOnMacromoleculesEditor(page);
      await selectMonomer(page, Peptides.bAla);
      await clickInTheMiddleOfTheScreen(page);
      await turnOnMicromoleculesEditor(page);
      await selectRing(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);
      await selectTopPanelButton(TopPanelButton.ThreeD, page);
      await takeEditorScreenshot(page, {
        maxDiffPixelRatio: 0.05,
      });
    },
  );

  test('Check that there are no errors in DevTool console when switching to full screen mode after switching from micro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4094
    Description: There are no errors in DevTool console when switching to full screen mode after switching from micro mode.
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Peptides.bAla);
    await clickInTheMiddleOfTheScreen(page);
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await page.locator('.css-1kbfai8').click();
  });

  test('Check the pop-up window appear in fullscreen mode after clicking the “Open/Save” button', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4173
    Description: The pop-up window appear in fullscreen mode after clicking the “Open/Save” button.
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await page.locator('.css-1kbfai8').click();
    await selectTopPanelButton(TopPanelButton.Open, page);
    await takeEditorScreenshot(page);
    await page.getByTitle('Close window').click();
    await selectTopPanelButton(TopPanelButton.Save, page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Macro-Micro-Switcher', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  test.skip(
    'Check that the Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it
    */
      await openFileAndAddToCanvas(
        'Molfiles-V2000/glutamine.mol',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Check that the Ket-structure opened from the file in Micro mode  is visible in Macro mode when hover on it',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it
    */
      await openFileAndAddToCanvas(
        'KET/stereo-and-structure.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create two Benzene rings structure with Charge Plus (+) and Charge Plus (-) Tool added in Micro mode and switch to Macro mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas with changes by Charge Plus (+) Tool and Charge Plus (-).
    */
      await openFileAndAddToCanvas(
        'KET/two-benzene-charged.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F2').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create two Benzene rings structure with some text added in Micro mode and switch to Macro mode.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas without text.
    */
      await openFileAndAddToCanvas(
        'KET/benzene-rings-with-text.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create two Benzene rings structure with Shape Ellipse Tool added in Micro mode and switch to Macro mode.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Structure exists on the canvas without Shape Ellipse.
    */
      await openFileAndAddToCanvas(
        'KET/two-benzene-and-ellipse.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create two Benzene rings structure with Arrow Open Angle Tool added in Micro mode and switch to Macro mode.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Structures exists on the canvas without  arrow ( Arrow Open Angle Tool )
    */
      await openFileAndAddToCanvas(
        'KET/two-benzene-and-arrow.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create ABS, new OR Group, new AND Group. Switch to Macro mode and check that ABS, AND and OR isn not appear.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: In Macro mode ABS, AND and OR is not appear
    */
      const xOffsetFromCenter = 200;
      const yOffsetFromCenter = 0;
      await openFileAndAddToCanvas(
        'KET/three-alpha-d-allopyranose.ket',
        page,
        xOffsetFromCenter,
        yOffsetFromCenter,
      );
      await turnOnMacromoleculesEditor(page);
      await waitForRender(page, async () => {
        await page.getByText('F1').locator('..').hover();
      });
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Create two Benzene rings structure with Reaction Plus Tool in Micro mode and switch to Macro mode.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: In Macro mode plus sign is not appear
    */
      await openFileAndAddToCanvas(
        'KET/two-benzene-and-plus.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await turnOnMacromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Check that the Ket-structure pasted from the clipboard in Micro mode is visible in Macro mode when hover on it.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Ket-structure pasted from the clipboard in Micro mode  is visible in Macro mode when hover on it
    */
      const topLeftCornerCoords = {
        x: 500,
        y: 100,
      };
      await pasteFromClipboard(
        page,
        FILE_TEST_DATA.oneFunctionalGroupExpandedKet,
      );
      await clickOnCanvas(page, topLeftCornerCoords.x, topLeftCornerCoords.y);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').click();
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Check that the Mol-structure pasted from the clipboard in Micro mode is visible in Macro mode when hover on it.',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure pasted from the clipboard in Micro mode  is visible in Macro mode when hover on it
    */
      const coordsToClick = {
        x: 400,
        y: 100,
      };
      await pasteFromClipboard(
        page,
        FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
        '.mol',
      );
      await clickOnCanvas(page, coordsToClick.x, coordsToClick.y);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  test('Make full screen mode in micro mode and switch to macro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description:  Full screen mode is not reset
    */

    await openFileAndAddToCanvas(
      'KET/two-benzene-and-plus.ket',
      page,
      topLeftCorner.x,
      topLeftCorner.y,
    );
    await page.getByTestId('fullscreen-mode-button').click();
    await turnOnMacromoleculesEditor(page);
    await goToRNATab(page);
    await takePageScreenshot(page);
  });

  test.skip(
    'Confirm that in macromolecules mode, atoms are displayed as dots without any accompanying text or additional information bonds as one line',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Atoms displayed as dots, without any text or other additional information. 
    Bonds displayed as one line regardless which type of bond it is.
    Now test working not properly because we have open ticket https://github.com/epam/ketcher/issues/3618
    After closing the ticket, should update the screenshots.
    */
      await openFileAndAddToCanvas('KET/all-type-of-atoms-and-bonds.ket', page);
      await turnOnMacromoleculesEditor(page);
      await selectZoomOutTool(page, 3);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Open a macro file and put in center of canvas in micro mode then switch to macro', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#3902
    Description: Structure is in left upper corner of canvas
    */
    await pageReload(page);
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test.skip(
    'Settings related to atom and bond display are ignored in macromolecules mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Settings related to atom and bond display are ignored in macromolecules mode, 
    and display is consistently set to dots for atoms and single lines for bonds.
    Now test working not properly because we have open ticket https://github.com/epam/ketcher/issues/3618
    After closing the ticket, should update the screenshots.
    */
      await openFileAndAddToCanvas('KET/all-type-of-atoms-and-bonds.ket', page);
      await setAtomAndBondSettings(page);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await selectZoomOutTool(page, 3);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Check that attachment point added in micro mode used as attachment point when switch to macro mode', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: Attachment point added in micro mode used as attachment point when switch to macro mode.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Ensure that system does not allow create s-group if structure have attachment point', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: System does not allow create s-group if structure have attachment point.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    const modifier = getControlModifier();
    await page.keyboard.press(`${modifier}+a`);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await page.keyboard.press(`${modifier}+a`);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await takeEditorScreenshot(page);
  });

  test('Check that multiple attachment points added in micro mode used as attachment point when switch to macro mode', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: Multiple attachment points added in micro mode used as attachment point when switch to macro mode.
    */
    await openFileAndAddToCanvas(
      'KET/more-than-one-attachment-point.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Verify attachment points can be added/removed via context menu', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: Attachment points can be added/removed via context menu.
    */
    await drawBenzeneRing(page);
    await addSuperatomAttachmentPoint(page, 'C', 1);
    await addSuperatomAttachmentPoint(page, 'C', 2);
    await addSuperatomAttachmentPoint(page, 'C', 3);
    await takeEditorScreenshot(page);
    await removeSuperatomAttachmentPoint(page, 'C', 2);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Ensure that new attachment points are labeled correctly (R1/.../R8) based on the next free attachment point number', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: New attachment points are labeled correctly (R1/.../R8) based on the next free attachment point number.
    */
    // await openFileAndAddToCanvas('Molfiles-V2000/long-chain.mol', page);
    await openFileAndAddToCanvas('KET/long-chain.ket', page);
    await addSuperatomAttachmentPoint(page, 'C', 4);
    await addSuperatomAttachmentPoint(page, 'C', 6);
    await addSuperatomAttachmentPoint(page, 'C', 8);
    await addSuperatomAttachmentPoint(page, 'C', 10);
    await addSuperatomAttachmentPoint(page, 'C', 12);
    await addSuperatomAttachmentPoint(page, 'C', 14);
    await addSuperatomAttachmentPoint(page, 'C', 16);
    await addSuperatomAttachmentPoint(page, 'C', 17);
    await takeEditorScreenshot(page);
  });

  test('Verify that system does not create a new attachment point if all 8 attachment points (R1-R8) already exist in the structure', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: System does not create a new attachment point if all 8 attachment points (R1-R8) already exist in the structure.
    */
    await openFileAndAddToCanvas(
      'KET/chain-with-eight-attachment-points.ket',
      page,
    );
    await clickOnAtom(page, 'C', 9, 'right');
    await takeEditorScreenshot(page);
  });

  test('Check that system start to use missed labels if user want to create AP greater that R8 (if it has R1,R3-R8 - attempt to add causes R2 selection)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: System does not create a new attachment point if all 8 attachment points (R1-R8) already exist in the structure.
    */
    await openFileAndAddToCanvas(
      'KET/chain-with-eight-attachment-points.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R2').locator('..').click();
    await addSuperatomAttachmentPoint(page, 'C', 2);
    await takeEditorScreenshot(page);
  });

  test('Check that in context menu for AP - only Delete and Highlight avaliable', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    update: add Highlight option - https://github.com/epam/ketcher/issues/5605
    Description: In context menu for AP - only Delete and Highlight avaliable.
    */
    await openFileAndAddToCanvas(
      'KET/structure-with-two-attachment-points.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R2').locator('..').click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test.skip(
    'Make sure that micro structure Ring when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Ring moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
      const x = 200;
      const y = 200;
      const x1 = 600;
      const y1 = 600;
      await selectRing(RingButton.Benzene, page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await turnOnMicromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Make sure that micro structure Atom when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Atom moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
      const x = 200;
      const y = 200;
      const x1 = 600;
      const y1 = 600;
      await selectAtomInToolbar(AtomButton.Oxygen, page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await turnOnMicromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Micro structure Functional Group when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Functional Group moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
      const x = 200;
      const y = 200;
      const x1 = 600;
      const y1 = 600;
      await selectFunctionalGroups(FunctionalGroups.FMOC, page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await turnOnMicromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  test.skip(
    'Micro structure Salt and Solvent when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Salt and Solvent moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
      const x = 200;
      const y = 200;
      const x1 = 600;
      const y1 = 600;
      await selectSaltsAndSolvents(SaltsAndSolvents.AceticAnhydride, page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await page.getByText('F1').locator('..').hover();
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await turnOnMicromoleculesEditor(page);
      await takeEditorScreenshot(page);
    },
  );

  const testData = [
    {
      description: 'Sugar',
      monomer: '25R',
      monomerTestId: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'sP-',
      monomerTestId: Phosphates.sP_,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
  ];

  for (const data of testData) {
    test(`Connect micro structure with attachment point to ${data.description} in macro mode`, async () => {
      /*
      Test case: Macro-Micro-Switcher/#4530
      Description:
      */
      const x = 750;
      const y = 370;
      const firstMonomer = page.getByText('F1').locator('..');
      const secondMonomer = page.getByText(data.monomer).locator('..').first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await selectMonomer(page, data.monomerTestId);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      const bondLine = page.locator('g[pointer-events="stroke"]').first();
      await bondLine.hover();
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });
    });
  }

  test('Connect micro structure with attachment point to CHEM in macro mode', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: CHEM connected with micro structure.
    */
    const x = 750;
    const y = 370;
    const firstMonomer = page.getByText('F1').locator('..');
    const secondMonomer = page.getByText('Test-6-Ch').locator('..').first();
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  const testData2 = [
    {
      description: 'Sugar',
      monomer: '25R',
      monomerTestId: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'moen',
      monomerTestId: Phosphates.moen,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
  ];

  for (const data of testData2) {
    test(`Connect micro structure with attachment point to ${data.description} in macro mode(snake mode)`, async () => {
      /*
      Test case: Macro-Micro-Switcher/#4530
      Description:
      */
      const x = 750;
      const y = 370;
      const firstMonomer = page.getByText('F1').locator('..');
      const secondMonomer = page.getByText(data.monomer).locator('..').first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await selectSnakeLayoutModeTool(page);
      await selectMonomer(page, data.monomerTestId);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      const bondLine = page.locator('g path').first();
      await bondLine.hover();
      await takeEditorScreenshot(page);
    });
  }

  test('Connect micro structure with attachment point to CHEM in macro mode(snake mode)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: CHEM connected with micro structure.
    */
    const x = 750;
    const y = 370;
    const firstMonomer = await page.getByText('F1').locator('..');
    const secondMonomer = await page
      .getByText('Test-6-Ch')
      .locator('..')
      .first();
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await selectSnakeLayoutModeTool(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    const bondLine = page.locator('g path').first();
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  const testData3 = [
    {
      description: 'Sugar',
      monomer: '25R',
      monomerTestId: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'sP-',
      monomerTestId: Phosphates.sP_,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
  ];

  for (const data of testData3) {
    test(`Delete bond between micro structure with attachment point and ${data.description} in macro mode and Undo deletion`, async () => {
      /*
      Test case: Macro-Micro-Switcher/#4530
      Description:
      */
      const x = 750;
      const y = 370;
      const firstMonomer = page.getByText('F1').locator('..');
      const secondMonomer = page.getByText(data.monomer).locator('..').first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await selectMonomer(page, data.monomerTestId);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      await selectEraseTool(page);
      const bondLine = page.locator('g[pointer-events="stroke"]').first();
      await bondLine.click();
      await takeEditorScreenshot(page);
      await clickUndo(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Delete bond between micro structure with attachment point and CHEM in macro mode and Undo deletion', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: CHEM connected with micro structure.
    */
    const x = 750;
    const y = 370;
    const firstMonomer = page.getByText('F1').locator('..');
    const secondMonomer = page.getByText('Test-6-Ch').locator('..').first();
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await selectEraseTool(page);
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.click();
    await takeEditorScreenshot(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  const testData4 = [
    {
      description: 'Sugar',
      monomer: '25R',
      monomerTestId: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'sP-',
      monomerTestId: Phosphates.sP_,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
  ];

  for (const data of testData4) {
    test(`Delete macro structure ${data.description} in micro mode and Undo deletion`, async () => {
      /*
      Test case: Macro-Micro-Switcher/#4530
      Description: Macro structure deleted.
      */
      const x = 750;
      const y = 370;
      const firstMonomer = page.getByText('F1').locator('..');
      const secondMonomer = page.getByText(data.monomer).locator('..').first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await selectMonomer(page, data.monomerTestId);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      await turnOnMicromoleculesEditor(page);
      await selectEraseTool(page);
      await page.getByText(data.monomer).click();
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Delete bond between micro structure with attachment point and CHEM in micro mode and Undo deletion', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: 
      After removing bond and then pressing Undo, the micro and macro structures are disconnected
    */
    const x = 750;
    const y = 370;
    const firstMonomer = page.getByText('F1').locator('..');
    const secondMonomer = page.getByText('Test-6-Ch').locator('..').first();
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await turnOnMicromoleculesEditor(page);
    await selectEraseTool(page);
    const canvasLocator = page.getByTestId('ketcher-canvas');
    await canvasLocator.locator('path').nth(5).click();
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test('Check that it is not possible to change bond type between monomer and micromolecule in micro mode', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: 
      it is not possible to change bond type between monomer and micromolecule in micro mode
    */
    const x = 750;
    const y = 370;
    const firstMonomer = page.getByText('F1').locator('..');
    const secondMonomer = page.getByText('Test-6-Ch').locator('..').first();
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await turnOnMicromoleculesEditor(page);
    await selectDropdownTool(page, 'bonds', 'bond-double');
    const canvasLocator = page.getByTestId('ketcher-canvas');
    await canvasLocator.locator('path').nth(5).click();
    await takeEditorScreenshot(page);
  });

  test('Check that AP label disappear if we delete bond between AP label and atom (stand alone AP label is not possible)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: 
      AP label disappear if we delete bond between AP label and atom (stand alone AP label is not possible)
    */
    await openFileAndAddToCanvas('KET/oxygen-on-attachment-point.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnCanvas(page, 645, 318);
    await takeEditorScreenshot(page);
  });

  test('Connect molecule to monomer', async () => {
    /*
    Github ticket: https://github.com/epam/ketcher/issues/4532
    Description: Allow connection of molecule with monomer
    */
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(
      'KET/molecule-connected-to-monomers.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Check it is impossible to create attachment point if atom is a part of s-group', async () => {
    /*
    Github ticket: #4530
    Description: It is impossible to create attachment point if atom is a part of s-group
    */
    await openFileAndAddToCanvasMacro('KET/part-chain-with-s-group.ket', page);
    await clickOnAtom(page, 'C', 2, 'right');
    await takeEditorScreenshot(page);
  });

  test('Validate that we can save bond between micro and macro structures to KET', async () => {
    /*
    Test case: #4530
    Description: We can save bond between micro and macro structures to KET.
    */
    await openFileAndAddToCanvas(
      'KET/chem-connected-to-micro-structure.ket',
      page,
    );

    await verifyFileExport(
      page,
      'KET/chem-connected-to-micro-structure-expected.ket',
      FileType.KET,
    );
  });

  test(
    'Verify presence and correctness of attachment points (SAP) in the SGROUP segment of MOL V2000 molecular structure files',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in Mol V2000 format.
    The structure after opening is not similar to the original one. 
    We have a bug https://github.com/epam/ketcher/issues/4785. After the fix, you need to update the screenshot.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await verifyFileExport(
        page,
        'Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
        FileType.MOL,
        'v2000',
      );
      await openFileAndAddToCanvasAsNewProject(
        'Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of SDF V2000 molecular structure files', async () => {
    /*
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in SDF V2000 format.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    const expectedFile = await getSdf(page, 'v2000');
    await saveToFile(
      'SDF/one-attachment-point-added-in-micro-modesdfv2000-expected.sdf',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SDF/one-attachment-point-added-in-micro-modesdfv2000-expected.sdf',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v2000',
      });

    expect(molFile).toEqual(molFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'SDF/one-attachment-point-added-in-micro-modesdfv2000-expected.sdf',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of SDF V3000 molecular structure files', async () => {
    /*
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in SDF V3000 format.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    const expectedFile = await getSdf(page, 'v3000');
    await saveToFile(
      'SDF/one-attachment-point-added-in-micro-modesdfv3000-expected.sdf',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SDF/one-attachment-point-added-in-micro-modesdfv3000-expected.sdf',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(molFile).toEqual(molFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'SDF/one-attachment-point-added-in-micro-modesdfv3000-expected.sdf',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of CDX molecular structure files', async () => {
    /* 
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
                 CDX does not support R-groups, so R1 converts to H (hydrogen)
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
      FileType.CDX,
    );

    await openCdxFile(page);
    await takeEditorScreenshot(page);
    await pageReload(page);
  });

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of CDXML molecular structure files', async () => {
    /* 
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
      FileType.CDXML,
    );

    await openCdxmlFile(page);
    await takeEditorScreenshot(page);
  });

  test(
    'Verify presence and correctness of attachment points (atomRefs) in the SuperatomSgroup segment of CML molecular structure files',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
    Saved structure opens like blank canvas because we have bug https://github.com/epam/Indigo/issues/1990
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      const expectedFile = await getCml(page);
      await saveToFile(
        'CML/one-attachment-point-added-in-micro-mode-expected.cml',
        expectedFile,
      );

      const { fileExpected: cmlFileExpected, file: cmlFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CML/one-attachment-point-added-in-micro-mode-expected.cml',
        });

      expect(cmlFile).toEqual(cmlFileExpected);
      await openFileAndAddToCanvasAsNewProject(
        'CML/one-attachment-point-added-in-micro-mode-expected.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Check that Undo-Redo invalidation if we change mode from micro to macro and back', async () => {
    /*
    Test case: #4530
    Description: Undo-Redo invalidation if we change mode from micro to macro and back.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    await turnOnMicromoleculesEditor(page);
    await takeTopToolbarScreenshot(page);
  });

  test(
    'Check saving to SVG Document format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4530
    Description: Structure saves in SVG Document format.
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/1991
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await saveFileAsPngOrSvgFormat(page, FileFormat.SVGDocument);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Check saving to PNG Image format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4530
    Description: Structure saves in PNG Image format.
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/1991
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await saveFileAsPngOrSvgFormat(page, FileFormat.PNGImage);
      await takeEditorScreenshot(page);
    },
  );

  test('Check that Aromatize/Dearomatize works for molecules with AP', async () => {
    /*
     * Test case: #4530
     * Description: Aromatize/Dearomatize works for molecules with AP.
     */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectAromatizeTool(page);
    await takeEditorScreenshot(page);
    await selectDearomatizeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that Layout works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Layout works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that Clean Up works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Clean Up works for molecules with AP.
    */
    await openFileAndAddToCanvas('KET/distorted-r1-attachment-point.ket', page);
    await takeEditorScreenshot(page);
    await selectCleanTool(page);
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Check that Calculate CIPs works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Calculate CIPs works for molecules with AP.
    */
    await openFileAndAddToCanvas('KET/structure-with-ap-and-stereo.ket', page);
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Calculate, page),
    );
    await takeEditorScreenshot(page);
  });

  test('Check that Structure Check works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Structure Check works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Check, page),
    );
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('Check that Calculate values works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Calculate values works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Calculated, page),
    );
    await takeEditorScreenshot(page);
  });

  test('Check that 3D view works for molecules with AP but hydrohen is shown instead of AP', async () => {
    /*
    Test case: #4530
    Description: 3D view works for molecules with AP but hydrohen is shown instead of AP.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await open3DViewer(page);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  const testData5 = [
    { type: 'RNA', sequenceType: null },
    { type: 'DNA', sequenceType: SequenceType.DNA },
    { type: 'Peptide', sequenceType: SequenceType.PEPTIDE },
  ];

  for (const data of testData5) {
    // eslint-disable-next-line max-len
    test.skip(
      `Add to micro structure with free attachment point ${data.type} in sequence mode and ensure that a connection was formed when switching to flex or snake mode`,
      { tag: ['@NeedToBeUpdated'] },
      async () => {
        /*
      Github ticket: #4530
      Description: R2-R1 connection was formed when switching to flex or snake mode
      */
        await openFileAndAddToCanvas(
          'KET/two-attachment-points-added-in-micro-mode.ket',
          page,
        );
        await turnOnMacromoleculesEditor(page);
        await selectSequenceLayoutModeTool(page);

        if (data.sequenceType) {
          await switchSequenceEnteringButtonType(page, data.sequenceType);
        }

        await clickOnSequenceSymbol(page, '@', { button: 'right' });
        await page.getByTestId('edit_sequence').click();
        await page.keyboard.press('ArrowRight');
        await enterSequence(page, 'a');
        await page.keyboard.press('Escape');
        await selectSnakeLayoutModeTool(page);
        await selectMacroBond(page, MacroBondTool.SINGLE);
        await page.getByText('F1').locator('..').hover();
        await takeEditorScreenshot(page);
      },
    );
  }

  const testData6 = [
    { type: 'RNA', sequenceType: null },
    { type: 'DNA', sequenceType: SequenceType.DNA },
    { type: 'Peptide', sequenceType: SequenceType.PEPTIDE },
  ];

  for (const data of testData6) {
    // eslint-disable-next-line max-len
    test.skip(
      `Add to micro structure with NO free attachment point ${data.type} in sequence mode and ensure that a connection was NOt formed when switching to snake mode`,
      { tag: ['@NeedToBeUpdated'] },
      async () => {
        /*
      Github ticket: #4530
      Description: R2-R1 connection was formed when switching to flex or snake mode
      */
        await drawBenzeneRing(page);
        await turnOnMacromoleculesEditor(page);
        await selectSequenceLayoutModeTool(page);

        if (data.sequenceType) {
          await switchSequenceEnteringButtonType(page, data.sequenceType);
        }

        await clickOnSequenceSymbol(page, '@', { button: 'right' });
        await page.getByTestId('edit_sequence').click();
        await page.keyboard.press('ArrowRight');
        await enterSequence(page, 'a');
        await takeEditorScreenshot(page);
      },
    );
  }

  test('Check it is NOT possible to attach old AP to new AP label', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is NOT possible to attach old AP to new AP label.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectDropdownTool(page, 'rgroup-label', 'rgroup-attpoints');
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
      'Apply',
    );
    await takeEditorScreenshot(page);
  });

  test('Check it is possible to wrap AP labed to R-group (by fragment tool)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is possible to wrap AP labed to R-group (by fragment tool).
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectDropdownTool(page, 'rgroup-label', 'rgroup-fragment');
    await page.getByText('R1').locator('..').click();
    await page.getByText('R18').click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Check it is NOT possible to attach R-Group to AP label', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is NOT possible to attach R-Group to AP label.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'C', 2);
    await page.getByText('R8').click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Check it is NOT possible to change charge of AP label (select it and use A+/A- buttons)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is NOT possible to change charge of AP label (select it and use A+/A- buttons).
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.ChargePlus, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'C', 2);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'C', 2);
    await takeEditorScreenshot(page);
  });

  test('Check it is NOT possible to attach bond to AP label', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is NOT possible to attach bond to AP label.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
  });

  test('Check we can attach AP to single atom', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: AP attached to single atom.
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);
    await addSuperatomAttachmentPoint(page, 'O', 0);
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images together (PNG, SVG) are not presented on the Canvas after switching to Macro mode and presented after returning to Micro', async () => {
    /**
     * Test case: #4911
     * Description: Added to Canvas images together (PNG, SVG) are not presented on the
     * Canvas after switching to Macro mode and presented after returning to Micro
     */

    await openFileAndAddToCanvas('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats (PNG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Added to Canvas (from CDX file) of allowed formats (PNG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro
     */

    const fileContent = await readFileContents(
      'tests/test-data/CDX/image-png-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats (PNG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Added to Canvas (from CDXML file) of allowed formats (PNG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro
     */

    await openFileAndAddToCanvas('CDXML/image-png-expected.cdxml', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats (SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDX file) of allowed formats (SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas('CDX/image-svg-expected.cdx', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats (SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDXML file) of allowed formats (SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */

    await openFileAndAddToCanvas('CDXML/image-svg-expected.cdxml', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats together (PNG, SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDX file) of allowed formats together (PNG, SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas('CDX/image-png-svg-together.cdx', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats together (PNG, SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDXML file) of allowed formats together (PNG, SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */

    await openFileAndAddToCanvas('CDXML/image-png-svg-together.cdxml', page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Validate that it is possible to save micro-macro connection to ket file',
    async () => {
      /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to ket file.
    */
      await openFileAndAddToCanvasAsNewProject(
        'KET/micro-macro-structure.ket',
        page,
      );
      await verifyFileExport(
        page,
        'KET/micro-macro-structure-expected.ket',
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(
        'KET/micro-macro-structure-expected.ket',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that it is possible to save micro-macro connection to mol v2000 file',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to mol v2000 file.
    The structure after opening is not similar to the original one. 
    We have a bug https://github.com/epam/ketcher/issues/4785. After the fix, you need to update the screenshot.
    */
      await openFileAndAddToCanvas('KET/micro-macro-structure.ket', page);
      await verifyFileExport(
        page,
        'Molfiles-V2000/micro-macro-structure-expected.mol',
        FileType.MOL,
        'v2000',
      );
      await openFileAndAddToCanvasAsNewProject(
        'Molfiles-V2000/micro-macro-structure-expected.mol',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that it is possible to save micro-macro connection to sdf v2000 file',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to sdf v2000 file.
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5123
    After fix we need update expected file micro-macro-structure-v2000-expected.sdf
    */
      await openFileAndAddToCanvas('KET/micro-macro-structure.ket', page);
      const expectedFile = await getSdf(page, 'v2000');
      await saveToFile(
        'SDF/micro-macro-structure-v2000-expected.sdf',
        expectedFile,
      );

      const METADATA_STRINGS_INDEXES = [1];

      const { fileExpected: sdfFileExpected, file: sdfFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/SDF/micro-macro-structure-v2000-expected.sdf',
          metaDataIndexes: METADATA_STRINGS_INDEXES,
          fileFormat: 'v2000',
        });

      expect(sdfFile).toEqual(sdfFileExpected);
      await openFileAndAddToCanvasAsNewProject(
        'SDF/micro-macro-structure-v2000-expected.sdf',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that it is possible to save micro-macro connection to sdf v3000 file', async () => {
    /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to sdf v3000 file.
    */
    await openFileAndAddToCanvas('KET/micro-macro-structure.ket', page);
    const expectedFile = await getSdf(page, 'v3000');
    await saveToFile(
      'SDF/micro-macro-structure-v3000-expected.sdf',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: sdfFileExpected, file: sdfFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SDF/micro-macro-structure-v3000-expected.sdf',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(sdfFile).toEqual(sdfFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'SDF/micro-macro-structure-v3000-expected.sdf',
      page,
    );
    await takeEditorScreenshot(page);
  });
});

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

async function collapseMonomer(page: Page) {
  // await clickInTheMiddleOfTheScreen(page, 'right');
  const canvasLocator = page.getByTestId('ketcher-canvas');
  const attachmentPoint = canvasLocator
    .getByText('R1', { exact: true })
    .first();

  if (await attachmentPoint.isVisible()) {
    await attachmentPoint.click({
      button: 'right',
    });
  } else {
    await canvasLocator.getByText('R2', { exact: true }).first().click({
      button: 'right',
    });
  }

  const collapseMonomerMenu = page.getByText('Collapse monomer');
  if (await collapseMonomerMenu.isVisible()) {
    await page.getByText('Collapse monomer').click();
  } else {
    // This hack should be removed after https://github.com/epam/ketcher/issues/5809 fix.
    // Only Collapse monomer menu should remain
    await page.getByText('Contract abbreviation').click();
  }
}

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

const expandableMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Petide D (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
    monomerLocatorText: 'D',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
  {
    monomerDescription: '2. Sugar UNA (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
    monomerLocatorText: 'UNA',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    monomerLocatorText: 'hU',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    monomerLocatorText: 'bnn',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    monomerLocatorText: '5hMedC',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    monomerLocatorText: '4aPEGMal',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5792, ' +
      'https://github.com/epam/ketcher/issues/5782',
  },
];

test.describe('Expand on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const expandableMonomer of expandableMonomers) {
    test(`${expandableMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: That test validates the following checks:
       *       1. [indirectly] Verify that the "Expand Monomer" option is available in the right-click context
       *          menu over the monomer in micro mode
       *       2. Verify that clicking on "Expand monomer" replaces the monomer abbreviation with its full structure of atoms and bonds grouped together
       *       3. Verify that the structure bounding box of the expanded monomer is centered by the
       *          position of the previously collapsed monomer
       *       4. Verify that square brackets are not present for expanded monomers and the monomer label is retained
       *
       * Case: 1. Load monomer on Molecules canvas
       *       2. Take screenshot it was loaded
       *       3. Call context menu for appeared monomer and click Uncollapse monomer
       *       4. Take screenshot to make sure it works
       *       Molecule should appear
       */
      await openFileAndAddToCanvasAsNewProject(expandableMonomer.KETFile, page);
      await takeEditorScreenshot(page);
      await expandMonomer(page, expandableMonomer.monomerLocatorText);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        expandableMonomer.shouldFail === true,
        `That test results are wrong because of ${expandableMonomer.issueNumber} issue(s).`,
      );
    });
  }
});

const nonExpandableMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Peptide X (ambiguouse, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library).ket',
    monomerLocatorText: 'X',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription:
      '2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription:
      '4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '6. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '7. DNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '8. RNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '9. Base M (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'M',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '10. DNA base A+C+G+T (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '11. RNA base A+C+G+U (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '12. Base A+C (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '13. Phosphate bnn,cmp,nen (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '14. Phosphate bnn+cmp+nen (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5789',
  },
  {
    monomerDescription: '17. Unknown nucleotide',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
    monomerLocatorText: 'Unknown',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5791',
  },
];

test.describe('Impossible to expand on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const nonExpandableMonomer of nonExpandableMonomers) {
    test(`${nonExpandableMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: Verify that ambiguous monomers and unknown monomer couldn't be expanded
       *
       * Case: 1. Load monomer on Molecules canvas
       *       2. Take screenshot it was loaded
       *       3. Call context menu for appeared monomer
       *       4. Check if Expand monomer menu option is disabled
       */
      // Test should be skipped if related bug exists
      test.fail(
        nonExpandableMonomer.shouldFail === true,
        `That test fails because of ${nonExpandableMonomer.issueNumber} issue(s).`,
      );

      await openFileAndAddToCanvasAsNewProject(
        nonExpandableMonomer.KETFile,
        page,
      );
      await takeEditorScreenshot(page);
      await callContexMenu(page, nonExpandableMonomer.monomerLocatorText);

      const disableState = await page.getByText('Expand monomer').isDisabled();
      expect(disableState).toBe(true);
    });
  }
});

const collapsableMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Petide D (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
    monomerLocatorText: 'D',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
  {
    monomerDescription: '2. Sugar UNA (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
    monomerLocatorText: 'UNA',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    monomerLocatorText: 'hU',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    monomerLocatorText: 'bnn',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    monomerLocatorText: '5hMedC',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    monomerLocatorText: '4aPEGMal',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5809, ' +
      'https://github.com/epam/ketcher/issues/5810',
  },
];

test.describe('Collapse on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const collapsableMonomer of collapsableMonomers) {
    test(`${collapsableMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: That test validates the following checks:
       *       1. [indirectly] Verify that the "Collapse monomer" option is present in the context menu over the expanded monomer
       *       2. Verify that clicking "Collapse monomer" contracts the structure back to its abbreviation
       *       3. Verify that the contracted monomer is positioned in the center of the bounding box, and
       *          adjacent atoms are moved back to their initial positions
       *
       * Case: 1. Load monomer on Molecules canvas
       *       3. Call context menu for appeared monomer and click Uncollapse monomer
       *       4. Take screenshot to make sure it works
       *       5. Call context menu for appeared molecule and click Collapse monomer
       *       6. Take screenshot to make sure it works
       *       Molecule got collapsed
       */
      await openFileAndAddToCanvasAsNewProject(
        collapsableMonomer.KETFile,
        page,
      );
      await expandMonomer(page, collapsableMonomer.monomerLocatorText);
      await takeEditorScreenshot(page);
      await collapseMonomer(page);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        collapsableMonomer.shouldFail === true,
        `That test results are wrong because of ${collapsableMonomer.issueNumber} issue(s).`,
      );
    });
  }
});

const movableCollapsedMonomers: IMonomer[] = [
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
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    monomerLocatorText: 'hU',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    monomerLocatorText: 'bnn',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    monomerLocatorText: '5hMedC',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    monomerLocatorText: '4aPEGMal',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '7. Peptide X (ambiguouse, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library).ket',
    monomerLocatorText: 'X',
    pageReloadNeeded: true,
  },
  {
    monomerDescription:
      '8. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '9. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription:
      '10. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '11. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '12. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription:
      '13. DNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
    pageReloadNeeded: true,
  },
  {
    monomerDescription:
      '14. RNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '15. Base M (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'M',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '16. DNA base A+C+G+T (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '17. RNA base A+C+G+U (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '18. Base A+C (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '19. Phosphate bnn,cmp,nen (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '20. Phosphate bnn+cmp+nen (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '21. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '22. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
    monomerLocatorText: '%',
    pageReloadNeeded: true,
  },
  {
    monomerDescription: '23. Unknown nucleotide',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
    monomerLocatorText: 'Unknown',
    pageReloadNeeded: true,
  },
];

test.describe('Move in collepsed state on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await turnOnMicromoleculesEditor(page);
  });

  for (const movableCollapsedMonomer of movableCollapsedMonomers) {
    test(`${movableCollapsedMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5773
       * Description: Verify that collapsed macromolecules can be moved across the canvas
       *
       * Case: 1. Load monomer on Molecules canvas
       *       2. Take screenshot to witness initial position
       *       3. Grab it and move it to the top left corner
       *       6. Take screenshot to witness final position
       */
      if (movableCollapsedMonomer.pageReloadNeeded) {
        await pageReload(page);
        await turnOnMicromoleculesEditor(page);
      }

      await openFileAndAddToCanvasAsNewProject(
        movableCollapsedMonomer.KETFile,
        page,
      );
      await takeEditorScreenshot(page);

      const canvasLocator = page.getByTestId('ketcher-canvas');
      const monomerLocator = canvasLocator.getByText(
        movableCollapsedMonomer.monomerLocatorText,
        { exact: true },
      );

      await moveMonomerOnMicro(page, monomerLocator, 100, 100);
      await moveMouseToTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        movableCollapsedMonomer.shouldFail === true,
        `That test results are wrong because of ${movableCollapsedMonomer.issueNumber} issue(s).`,
      );
    });
  }
});

test('Switch to Macro mode, verify that user cant open reactions from RDF RXN V2000/V3000 - error message is displayed', async () => {
  /* 
  Test case: https://github.com/epam/Indigo/issues/2102
  Description: In Macro mode, user can't open reactions from RDF RXN V2000/V3000 - error message is displayed. 
  */
  await pageReload(page);
  await selectOpenTool(page);
  await openFile('RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1.rdf', page);
  await pressButton(page, 'Open as New');
  await takeEditorScreenshot(page);
});
