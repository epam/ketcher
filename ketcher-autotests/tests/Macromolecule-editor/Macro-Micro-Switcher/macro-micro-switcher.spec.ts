/* eslint-disable no-magic-numbers */
import {
  enterSequence,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, expect, BrowserContext, chromium } from '@playwright/test';
import {
  FILE_TEST_DATA,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  pressButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  waitForLoad,
  waitForRender,
  moveMouseToTheMiddleOfTheScreen,
  selectOptionInDropdown,
  waitForSpinnerFinishedWork,
  selectRing,
  RingButton,
  moveMouseAway,
  selectAtomInToolbar,
  AtomButton,
  selectFunctionalGroups,
  FunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  selectSingleBondTool,
  drawBenzeneRing,
  selectSnakeLayoutModeTool,
  selectEraseTool,
  clickUndo,
  clickOnAtom,
  getKet,
  saveToFile,
  receiveFileComparisonData,
  getMolfile,
  selectSequenceLayoutModeTool,
  switchSequenceEnteringType,
  SequenceType,
  selectLeftPanelButton,
  LeftPanelButton,
  selectDropdownTool,
  openFileAndAddToCanvasAsNewProject,
  getSdf,
  getCdx,
  openFile,
  getCdxml,
  getCml,
  clickOnFileFormatDropdown,
  takeTopToolbarScreenshot,
  setAttachmentPoints,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
} from '@utils';
import {
  addSuperatomAttachmentPoint,
  removeSuperatomAttachmentPoint,
} from '@utils/canvas/atoms/superatomAttachmentPoints';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';
import { miewApplyButtonIsEnabled } from '@utils/common/loaders/waitForMiewApplyButtonIsEnabled';
import { pageReload } from '@utils/common/helpers';
import { Peptides } from '@utils/selectors/macromoleculeEditor';

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
  await page.getByTestId(Peptides.BetaAlanine).getByText('★').click();
  await page
    .getByTestId('Phe4Me___p-Methylphenylalanine')
    .getByText('★')
    .click();
  await page.getByTestId('meM___N-Methyl-Methionine').getByText('★').click();
  await page.getByTestId('RNA-TAB').click();
  await page.getByTestId('summary-Sugars').click();
  await page.getByTestId('25R___2,5-Ribose').getByText('★').click();
  await page.getByTestId('summary-Bases').click();
  await page.getByTestId('baA___N-benzyl-adenine').getByText('★').click();
  await page.getByTestId('summary-Phosphates').click();
  await page.getByTestId('bP___Boranophosphate').getByText('★').click();
  await page.getByTestId('CHEM-TAB').click();
  await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').getByText('★').click();
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
    .nth(1)
    .click();
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as' })
    .getByRole('textbox')
    .nth(1)
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
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async
  page = await sharedContext.newPage();

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
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
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('Edc').hover();
    await takeEditorScreenshot(page);
  });

  test('Micromolecules in macromode will be represented as CHEMs with generated name(F1, F2, ...Fn)', async () => {
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
  });

  test('Check that After hiding Library in Macro mode possible to see Show Library button', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: After hiding Library in Macro mode 'Show Library' button is visible.
    */
    await page.getByText('Hide').click();
    await takePageScreenshot(page);
    await page.getByText('Show Library').click();
    await page.getByText('Show Library').isVisible();
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
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro('KET/stereo-and-structure.ket', page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test(
    'Create a sequence of monomers in macro mode then switch to micro mode select the entire structure and move it to a new position',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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
      await page.keyboard.press('Control+a');
      await page.getByText('Edc').hover();
      await dragMouseTo(x, y, page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Add monomers in macro mode then switch to micro mode and check that it can not be expanded and abreviation can not be removed',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Abbreviation of monomer expanded without errors.
    Now test working not properly because we have bug https://github.com/epam/ketcher/issues/3659
    */
      await openFileAndAddToCanvasMacro(
        'KET/three-monomers-connected-with-bonds.ket',
        page,
      );
      await turnOnMicromoleculesEditor(page);
      await page.getByText('A6OH').click({ button: 'right' });
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Add monomers in macro mode then switch to micro mode and check that it can not be moved',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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
    },
  );

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
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-selector').click();
    await page.getByTestId('reset-zoom-button').click();
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
    await page.getByTestId('zoom-selector').click();
    await page.getByTestId('reset-zoom-button').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check that the zoomed in/out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoomed In/Out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode
    */
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-connected-with-bonds.ket',
      page,
    );
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
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
    await page.getByTestId('FAVORITES-TAB').click();
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
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
      await page.getByTestId('A___Alanine').click();
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
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
      await page.getByTestId('PEPTIDES-TAB').click();
      await page.getByTestId(Peptides.BetaAlanine).click();
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
    await page.getByTestId(Peptides.BetaAlanine).click();
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

  test('Check that the Mol-structure opened from the file in Micro mode is visible on Macro mode when hover on it', async () => {
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
  });

  test('Check that the Ket-structure opened from the file in Micro mode  is visible in Macro mode when hover on it', async () => {
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
  });

  test('Create two Benzene rings structure with Charge Plus (+) and Charge Plus (-) Tool added in Micro mode and switch to Macro mode', async () => {
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
  });

  test('Create two Benzene rings structure with some text added in Micro mode and switch to Macro mode.', async () => {
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
  });

  test('Create two Benzene rings structure with Shape Ellipse Tool added in Micro mode and switch to Macro mode.', async () => {
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
  });

  test('Create two Benzene rings structure with Arrow Open Angle Tool added in Micro mode and switch to Macro mode.', async () => {
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
  });

  test('Create ABS, new OR Group, new AND Group. Switch to Macro mode and check that ABS, AND and OR isn not appear.', async () => {
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
  });

  test('Create two Benzene rings structure with Reaction Plus Tool in Micro mode and switch to Macro mode.', async () => {
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
  });

  test('Check that the Ket-structure pasted from the clipboard in Micro mode is visible in Macro mode when hover on it.', async () => {
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
    await page.mouse.click(topLeftCornerCoords.x, topLeftCornerCoords.y);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').click();
    await takeEditorScreenshot(page);
  });

  test('Check that the Mol-structure pasted from the clipboard in Micro mode is visible in Macro mode when hover on it.', async () => {
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
    await waitForRender(page, async () => {
      await page.mouse.click(coordsToClick.x, coordsToClick.y);
    });
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test(
    'Make full screen mode in micro mode and switch to macro mode.',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description:  Full screen mode is not reset
    Test working not properly now because we have bug https://github.com/epam/ketcher/issues/3656
    */
      await openFileAndAddToCanvas(
        'KET/two-benzene-and-plus.ket',
        page,
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await page.getByTestId('fullscreen-mode-button').click();
      await turnOnMacromoleculesEditor(page);
      await takePageScreenshot(page);
    },
  );

  test('Confirm that in macromolecules mode, atoms are displayed as dots without any accompanying text or additional information bonds as one line', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Atoms displayed as dots, without any text or other additional information. 
    Bonds displayed as one line regardless which type of bond it is.
    Now test working not properly because we have open ticket https://github.com/epam/ketcher/issues/3618
    After closing the ticket, should update the screenshots.
    */
    await openFileAndAddToCanvas('KET/all-type-of-atoms-and-bonds.ket', page);
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 3; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

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

  test('Settings related to atom and bond display are ignored in macromolecules mode', async () => {
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
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 3; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

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
    await selectSingleBondTool(page);
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
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R1').locator('..').click();
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
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
    await selectSingleBondTool(page);
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
    await selectSingleBondTool(page);
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

  test('Check that in context menu for AP - only Delete avaliable', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: In context menu for AP - only Delete avaliable.
    */
    await openFileAndAddToCanvas(
      'KET/structure-with-two-attachment-points.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R2').locator('..').click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Make sure that micro structure Ring when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Ring moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
    const x = 200;
    const y = 200;
    const x1 = 600;
    const y1 = 600;
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await dragMouseTo(x1, y1, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Make sure that micro structure Atom when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Atom moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
    const x = 200;
    const y = 200;
    const x1 = 600;
    const y1 = 600;
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await dragMouseTo(x1, y1, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Micro structure Functional Group when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Functional Group moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
    const x = 200;
    const y = 200;
    const x1 = 600;
    const y1 = 600;
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await dragMouseTo(x1, y1, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Micro structure Salt and Solvent when moving in macro mode then switching to micro mode is correctly displayed in place where it was moved in macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4531
    Description: Micro structure Salt and Solvent moved in macro mode then switching to micro mode is correctly displayed in coords where it was moved in macro mode.
    */
    const x = 200;
    const y = 200;
    const x1 = 600;
    const y1 = 600;
    await selectSaltsAndSolvents(SaltsAndSolvents.AceticAnhydride, page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('F1').locator('..').hover();
    await dragMouseTo(x1, y1, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  const testData = [
    {
      description: 'Sugar',
      monomer: '25R',
      monomerTestId: '25R___2,5-Ribose',
      summaryTestId: 'summary-Sugars',
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: 'meA___N-Methyl-Adenine',
      summaryTestId: 'summary-Bases',
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'nasP',
      monomerTestId: 'nasP___Sodium Phosporothioate',
      summaryTestId: 'summary-Phosphates',
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
      const firstMonomer = await page.getByText('F1').locator('..');
      const secondMonomer = await page
        .getByText(data.monomer)
        .locator('..')
        .first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(data.summaryTestId).click();
      await page.getByTestId(data.monomerTestId).click();
      await page.mouse.click(x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      const bondLine = page.locator('g[pointer-events="stroke"]').first();
      await bondLine.hover();
      await takeEditorScreenshot(page);
    });
  }

  test('Connect micro structure with attachment point to CHEM in macro mode', async () => {
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
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
      monomerTestId: '25R___2,5-Ribose',
      summaryTestId: 'summary-Sugars',
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: 'meA___N-Methyl-Adenine',
      summaryTestId: 'summary-Bases',
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'moen',
      monomerTestId: 'moen___2-Methoxyethylamino',
      summaryTestId: 'summary-Phosphates',
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
      const firstMonomer = await page.getByText('F1').locator('..');
      const secondMonomer = await page
        .getByText(data.monomer)
        .locator('..')
        .first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await selectSnakeLayoutModeTool(page);
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(data.summaryTestId).click();
      await page.getByTestId(data.monomerTestId).click();
      await page.mouse.click(x, y);
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
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
      monomerTestId: '25R___2,5-Ribose',
      summaryTestId: 'summary-Sugars',
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: 'meA___N-Methyl-Adenine',
      summaryTestId: 'summary-Bases',
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'nasP',
      monomerTestId: 'nasP___Sodium Phosporothioate',
      summaryTestId: 'summary-Phosphates',
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
      const firstMonomer = await page.getByText('F1').locator('..');
      const secondMonomer = await page
        .getByText(data.monomer)
        .locator('..')
        .first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(data.summaryTestId).click();
      await page.getByTestId(data.monomerTestId).click();
      await page.mouse.click(x, y);
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
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
      monomerTestId: '25R___2,5-Ribose',
      summaryTestId: 'summary-Sugars',
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: 'meA',
      monomerTestId: 'meA___N-Methyl-Adenine',
      summaryTestId: 'summary-Bases',
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: 'nasP',
      monomerTestId: 'nasP___Sodium Phosporothioate',
      summaryTestId: 'summary-Phosphates',
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
      const firstMonomer = await page.getByText('F1').locator('..');
      const secondMonomer = await page
        .getByText(data.monomer)
        .locator('..')
        .first();
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await turnOnMacromoleculesEditor(page);
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(data.summaryTestId).click();
      await page.getByTestId(data.monomerTestId).click();
      await page.mouse.click(x, y);
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
      await waitForRender(page, async () => {
        await selectTopPanelButton(TopPanelButton.Undo, page);
      });
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await turnOnMicromoleculesEditor(page);
    await selectEraseTool(page);
    await page.mouse.click(675, 330);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await turnOnMicromoleculesEditor(page);
    await selectDropdownTool(page, 'bonds', 'bond-double');
    await page.mouse.click(675, 330);
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
    await page.mouse.click(645, 318);
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
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/chem-connected-to-micro-structure-expected.ket',
      expectedFile,
    );

    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/chem-connected-to-micro-structure-expected.ket',
    });

    const hasConnectionTypeSingle = expectedFile.includes(
      '"connectionType": "single"',
    );
    expect(hasConnectionTypeSingle).toBe(true);
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
      const expectedFile = await getMolfile(page, 'v2000');
      await saveToFile(
        'Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
        expectedFile,
      );

      const METADATA_STRINGS_INDEXES = [1];

      const { fileExpected: molFileExpected, file: molFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
          metaDataIndexes: METADATA_STRINGS_INDEXES,
          fileFormat: 'v2000',
        });

      expect(molFile).toEqual(molFileExpected);
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

  test(
    'Verify presence and correctness of attachment points (SAP) in the SGROUP segment of CDX molecular structure files',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
    Saved structure opens like blank canvas because we have bug https://github.com/epam/Indigo/issues/1994
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      const expectedFile = await getCdx(page);
      await saveToFile(
        'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
        expectedFile,
      );

      const { fileExpected: cdxFileExpected, file: cdxFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
        });

      expect(cdxFile).toEqual(cdxFileExpected);
      await openCdxFile(page);
      await takeEditorScreenshot(page);
      await pageReload(page);
    },
  );

  test(
    'Verify presence and correctness of attachment points (SAP) in the SGROUP segment of CDXML molecular structure files',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
    Saved structure not opens because we have bug https://github.com/epam/Indigo/issues/1993
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      const expectedFile = await getCdxml(page);
      await saveToFile(
        'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
        expectedFile,
      );

      const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
        });

      expect(cdxmlFile).toEqual(cdxmlFileExpected);
      await openCdxmlFile(page);
      await takeEditorScreenshot(page);
    },
  );

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

  test(
    'Check that Aromatize/Dearomatize works for molecules with AP',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: #4530
    Description: Aromatize/Dearomatize works for molecules with AP.
    Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/4804
    After the fix, you need to update test.
    */
      await openFileAndAddToCanvas(
        'KET/one-attachment-point-added-in-micro-mode.ket',
        page,
      );
      await selectTopPanelButton(TopPanelButton.Aromatize, page);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Dearomatize, page);
      await takeEditorScreenshot(page);
    },
  );

  test('Check that Layout works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Layout works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Check that Clean Up works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Clean Up works for molecules with AP.
    */
    await openFileAndAddToCanvas('KET/distorted-r1-attachment-point.ket', page);
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
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
    test(`Add to micro structure with free attachment point ${data.type} in sequence mode and ensure that a connection was formed when switching to flex or snake mode`, async () => {
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
        await switchSequenceEnteringType(page, data.sequenceType);
      }

      await clickOnSequenceSymbol(page, '@', { button: 'right' });
      await page.getByTestId('edit_sequence').click();
      await page.keyboard.press('ArrowRight');
      await enterSequence(page, 'a');
      await page.keyboard.press('Escape');
      await selectSnakeLayoutModeTool(page);
      await selectSingleBondTool(page);
      await page.getByText('F1').locator('..').hover();
      await takeEditorScreenshot(page);
    });
  }

  const testData6 = [
    { type: 'RNA', sequenceType: null },
    { type: 'DNA', sequenceType: SequenceType.DNA },
    { type: 'Peptide', sequenceType: SequenceType.PEPTIDE },
  ];

  for (const data of testData6) {
    // eslint-disable-next-line max-len
    test(`Add to micro structure with NO free attachment point ${data.type} in sequence mode and ensure that a connection was NOt formed when switching to snake mode`, async () => {
      /*
      Github ticket: #4530
      Description: R2-R1 connection was formed when switching to flex or snake mode
      */
      await drawBenzeneRing(page);
      await turnOnMacromoleculesEditor(page);
      await selectSequenceLayoutModeTool(page);

      if (data.sequenceType) {
        await switchSequenceEnteringType(page, data.sequenceType);
      }

      await clickOnSequenceSymbol(page, '@', { button: 'right' });
      await page.getByTestId('edit_sequence').click();
      await page.keyboard.press('ArrowRight');
      await enterSequence(page, 'a');
      await takeEditorScreenshot(page);
    });
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
      const expectedFile = await getKet(page);
      await saveToFile('KET/micro-macro-structure-expected.ket', expectedFile);

      const { fileExpected: ketFileExpected, file: ketFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/KET/micro-macro-structure-expected.ket',
        });

      expect(ketFile).toEqual(ketFileExpected);
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
      const expectedFile = await getMolfile(page, 'v2000');
      await saveToFile(
        'Molfiles-V2000/micro-macro-structure-expected.mol',
        expectedFile,
      );

      const METADATA_STRINGS_INDEXES = [1];

      const { fileExpected: molFileExpected, file: molFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/Molfiles-V2000/micro-macro-structure-expected.mol',
          metaDataIndexes: METADATA_STRINGS_INDEXES,
          fileFormat: 'v2000',
        });

      expect(molFile).toEqual(molFileExpected);
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
