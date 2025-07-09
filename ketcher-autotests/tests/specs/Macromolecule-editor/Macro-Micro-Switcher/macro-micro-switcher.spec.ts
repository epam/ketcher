/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, expect, test } from '@playwright/test';
import {
  FILE_TEST_DATA,
  FunctionalGroups,
  MolFileFormat,
  SaltsAndSolvents,
  SdfFileFormat,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnCanvas,
  dragMouseTo,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  pressButton,
  readFileContent,
  selectFunctionalGroups,
  selectSaltsAndSolvents,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  takeTopToolbarScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
  switchSequenceEnteringButtonType,
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
} from '@utils/canvas/tools/helpers';
import { MacroFileType, SequenceType } from '@utils/canvas';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  addSuperatomAttachmentPoint,
  removeSuperatomAttachmentPoint,
} from '@utils/canvas/atoms/superatomAttachmentPoints';
import { closeErrorAndInfoModals, pageReload } from '@utils/common/helpers';
import { waitForMonomerPreviewMicro } from '@utils/common/loaders/previewWaiters';
import { miewApplyButtonIsEnabled } from '@utils/common/loaders/waitForMiewApplyButtonIsEnabled';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  getMonomerLocator,
  moveMonomerOnMicro,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomersPointToPoint,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  MacroBondDataIds,
  MacroBondType,
  MicroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  keyboardPressOnCanvas,
  resetZoomLevelToDefault,
} from '@utils/keyboard/index';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { setSettingsOptions } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  AtomsSetting,
  BondsSetting,
  ShowHydrogenLabelsOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MonomerOnMicroOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { setAttachmentPoints } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';

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

async function open3DViewer(page: Page, waitForButtonIsEnabled = true) {
  await IndigoFunctionsToolbar(page).ThreeDViewer();
  if (waitForButtonIsEnabled) {
    await miewApplyButtonIsEnabled(page);
  }
}

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await CommonTopLeftToolbar(page).clearCanvas();
  await resetZoomLevelToDefault(page);
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
      await openFileAndAddToCanvasMacro(page, 'KET/five-monomers.ket');
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await scrollHorizontally(page, scrollValue);
      for (const label of moleculeLabels) {
        await waitForRender(page, async () => {
          await page
            .getByTestId(KETCHER_CANVAS)
            .filter({ has: page.locator(':visible') })
            .getByText(label, { exact: true })
            .hover();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test.skip(
    'Micromolecules in macromode will be represented as CHEMs with generated name(F1, F2, ...Fn)',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /* 
    Test case: Macro-Micro-Switcher
    Description: Micromolecules in macromode represented as CHEMs with generated name(F1, F2, ...Fn)
    */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvas(
        page,
        'KET/eight-micromolecules.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await takeEditorScreenshot(page);
    },
  );

  test('Check that After hiding Library in Macro mode possible to see Show Library button', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: After hiding Library in Macro mode 'Show Library' button is visible.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).hideLibrary();
    await takePageScreenshot(page);
    expect(Library(page).showLibraryButton).toBeVisible();
    await Library(page).showLibrary();
  });

  test('Check that the Mol-structure opened from the file in Macro mode is visible on Micro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V2000/glutamine.mol',
      MacroFileType.MOLv3000,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that the Ket-structure opened from the file in Macro mode is visible in Micro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure opened from the file in Macro mode is visible on Micro mode when
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasMacro(page, 'KET/stereo-and-structure.ket');
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create a sequence of monomers in macro mode then switch to micro mode select the entire structure and move it to a new position', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Sequence of monomers moved to a new position in Micro mode
    Now test working not properly because we have bug https://github.com/epam/ketcher/issues/3654
    */
    const x = 400;
    const y = 400;
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await resetZoomLevelToDefault(page);
    const monomerOnTheCanvas = page
      .getByTestId(KETCHER_CANVAS)
      .filter({ has: page.locator(':visible') })
      .getByText('A6OH');
    await monomerOnTheCanvas.hover();
    await ContextMenu(page, monomerOnTheCanvas).open();
    await waitForMonomerPreviewMicro(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await resetZoomLevelToDefault(page);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await resetZoomLevelToDefault(page);
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

    const numberOfPressZoomIn = 5;
    const numberOfPressZoomOut = 8;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await resetZoomLevelToDefault(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await resetZoomLevelToDefault(page);
    await CommonTopRightToolbar(page).selectZoomInTool(numberOfPressZoomIn);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).resetZoom();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that Zoom In/Zoom Out/ Reset Zoom Tools work (Mouse scroll) after switching to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoom In/Zoom Out/ Reset Zoom Tools work after switching to Macro mode
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await moveMouseToTheMiddleOfTheScreen(page);
    await zoomWithMouseWheel(page, -400);

    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 250);

    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomOutTool();
    await takeEditorScreenshot(page);
  });

  test('Check that the zoomed in/out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Zoomed In/Out structure from Macro mode become standart 100% when switch to Micro mode and again to Macro mode
    */
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).selectZoomOutTool(numberOfPressZoomIn);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 250);

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Add to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs then switch to Micro mode and back', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Added to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs 
    when switching from Macro mode to Micro mode and back to Macro is saved
    */

    await Library(page).addMonomersToFavorites([
      Peptides.bAla,
      Peptides.Phe4Me,
      Peptides.meM,
      Sugars._25R,
      Bases.baA,
      Phosphates.bP,
      Chem.Test_6_Ch,
    ]);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that the Ket-structure pasted from the clipboard in Macro mode  is visible in Micro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Ket-structure pasted from the clipboard in Macro mode is visible in Micro mode
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.oneFunctionalGroupExpandedKet,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Check that the Mol-structure pasted from the clipboard in Macro mode is visible in Micro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Mol-structure pasted from the clipboard in Macro mode  is visible in Micro mode
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.MOLv3000,
      FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Check that Pressing Layout button not erase all macromolecules from canvas`, async () => {
    /*
      Test case: Macro-Micro-Switcher/3712
      Description: Pressing Layout button not erase all macromolecules from canvas
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Peptides.A);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Check that Pressing Clean Up button not erase all macromolecules from canvas`, async () => {
    /*
      Test case: Macro-Micro-Switcher/3712
      Description: Pressing Clean Up button not erase all macromolecules from canvas
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await resetZoomLevelToDefault(page);
    await Library(page).selectMonomer(Peptides.A);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await IndigoFunctionsToolbar(page).cleanUp();
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that for CHEMs monomer from when switch to micro mode restricted remove abbreviation', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description: Remove abbreviation restricted for CHEMs in micro mode.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await resetZoomLevelToDefault(page);
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await resetZoomLevelToDefault(page);
    const test6Ch = page
      .getByTestId(KETCHER_CANVAS)
      .getByText(Chem.Test_6_Ch.alias);
    await test6Ch.hover();
    await ContextMenu(page, test6Ch).open();
    await waitForMonomerPreviewMicro(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
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
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await Library(page).selectMonomer(Peptides.bAla);
      await clickInTheMiddleOfTheScreen(page);
      await moveMouseAway(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await selectRingButton(page, RingButton.Benzene);
      await clickInTheMiddleOfTheScreen(page);
      await IndigoFunctionsToolbar(page).ThreeDViewer();
      await moveMouseAway(page);
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
    const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Peptides.bAla);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await fullScreenButton.click();
  });

  test('Check the pop-up window appear in fullscreen mode after clicking the “Open/Save” button', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#4173
    Description: The pop-up window appear in fullscreen mode after clicking the “Open/Save” button.
    */
    const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await fullScreenButton.click();
    await CommonTopLeftToolbar(page).openFile();
    await takeEditorScreenshot(page);
    await PasteFromClipboardDialog(page).closeWindowButton.click();
    await CommonTopLeftToolbar(page).saveFile();
    await takeEditorScreenshot(page);
  });
});

test.describe('Macro-Micro-Switcher', () => {
  test.beforeEach(async () => {
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
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
        page,
        'Molfiles-V2000/glutamine.mol',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
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
        page,
        'KET/stereo-and-structure.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
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
        page,
        'KET/two-benzene-charged.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F2',
      }).hover();
      await waitForMonomerPreview(page);
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
        page,
        'KET/benzene-rings-with-text.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
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
        page,
        'KET/two-benzene-and-ellipse.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        'KET/two-benzene-and-arrow.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        'KET/three-alpha-d-allopyranose.ket',
        xOffsetFromCenter,
        yOffsetFromCenter,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
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
        page,
        'KET/two-benzene-and-plus.ket',
        topLeftCorner.x,
        topLeftCorner.y,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
      await pasteFromClipboardAndAddToCanvas(
        page,
        FILE_TEST_DATA.oneFunctionalGroupExpandedKet,
      );
      await clickOnCanvas(page, topLeftCornerCoords.x, topLeftCornerCoords.y);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
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
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.MOLv3000,
        FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
      );
      await clickOnCanvas(page, coordsToClick.x, coordsToClick.y);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Make full screen mode in micro mode and switch to macro mode.', async () => {
    /* 
    Test case: Macro-Micro-Switcher
    Description:  Full screen mode is not reset
    */

    await openFileAndAddToCanvas(
      page,
      'KET/two-benzene-and-plus.ket',
      topLeftCorner.x,
      topLeftCorner.y,
    );
    await page
      .getByTestId('fullscreen-mode-button')
      .filter({ has: page.locator(':visible') })
      .click();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
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
      await openFileAndAddToCanvas(page, 'KET/all-type-of-atoms-and-bonds.ket');
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await CommonTopRightToolbar(page).selectZoomOutTool(3);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Open a macro file and put in center of canvas in micro mode then switch to macro', async () => {
    /* 
    Test case: Macro-Micro-Switcher/#3902
    Description: Structure is in left upper corner of canvas
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvas(page, 'KET/peptides-connected-with-bonds.ket');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
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
      await openFileAndAddToCanvas(page, 'KET/all-type-of-atoms-and-bonds.ket');
      await setSettingsOptions(page, [
        {
          option: AtomsSetting.ShowHydrogenLabels,
          value: ShowHydrogenLabelsOption.TerminalAndHetero,
        },
        {
          option: BondsSetting.BondThickness,
          value: '05',
        },
      ]);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await CommonTopRightToolbar(page).selectZoomOutTool(3);
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.F1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Ensure that system does not allow create s-group if structure have attachment point', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: System does not allow create s-group if structure have attachment point.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('R1').click();
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Check that multiple attachment points added in micro mode used as attachment point when switch to macro mode', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: Multiple attachment points added in micro mode used as attachment point when switch to macro mode.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/more-than-one-attachment-point.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.F1).hover();
    await waitForMonomerPreview(page);
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.F1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Ensure that new attachment points are labeled correctly (R1/.../R8) based on the next free attachment point number', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: New attachment points are labeled correctly (R1/.../R8) based on the next free attachment point number.
    */
    // await openFileAndAddToCanvas(page, 'Molfiles-V2000/long-chain.mol', page);
    await openFileAndAddToCanvas(page, 'KET/long-chain.ket');
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
      page,
      'KET/chain-with-eight-attachment-points.ket',
    );
    const point = await getAtomByIndex(page, { label: 'C' }, 9);
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Check that system start to use missed labels if user want to create AP greater that R8 (if it has R1,R3-R8 - attempt to add causes R2 selection)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: System does not create a new attachment point if all 8 attachment points (R1-R8) already exist in the structure.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/chain-with-eight-attachment-points.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('R2').click();
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
      page,
      'KET/structure-with-two-attachment-points.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await ContextMenu(page, page.getByText('R2')).open();
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
      await selectRingButton(page, RingButton.Benzene);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Oxygen);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, {
        monomerAlias: 'F1',
      }).hover();
      await waitForMonomerPreview(page);
      await dragMouseTo(x1, y1, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await takeEditorScreenshot(page);
    },
  );

  const testData = [
    {
      description: 'Sugar',
      monomer: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: Phosphates.sP_,
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
      const firstMonomer = getMonomerLocator(page, Chem.F1);
      const secondMonomer = getMonomerLocator(page, data.monomer);
      await openFileAndAddToCanvas(
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await Library(page).selectMonomer(data.monomer);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      const bondLine = getBondLocator(page, {
        bondType: MacroBondDataIds.Single,
      }).first();
      await bondLine.hover({ force: true });
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
    const firstMonomer = getMonomerLocator(page, Chem.F1);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    const bondLine = getBondLocator(page, {
      bondType: MacroBondDataIds.Single,
    }).first();
    await bondLine.hover({ force: true });
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  const testData2 = [
    {
      description: 'Sugar',
      monomer: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: Phosphates.moen,
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
      const firstMonomer = getMonomerLocator(page, Chem.F1);
      const secondMonomer = getMonomerLocator(page, data.monomer);
      await openFileAndAddToCanvas(
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await selectSnakeLayoutModeTool(page);
      await Library(page).selectMonomer(data.monomer);
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
    const firstMonomer = getMonomerLocator(page, Chem.F1);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectSnakeLayoutModeTool(page);
    await Library(page).selectMonomer(Chem.Test_6_Ch);
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
      monomer: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: Phosphates.sP_,
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
      const firstMonomer = getMonomerLocator(page, Chem.F1);
      const secondMonomer = getMonomerLocator(page, data.monomer);
      await openFileAndAddToCanvas(
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await Library(page).selectMonomer(data.monomer);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      await CommonLeftToolbar(page).selectEraseTool();
      const bondLine = getBondLocator(page, {
        bondType: MacroBondDataIds.Single,
      }).first();
      await bondLine.click({ force: true });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
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
    const firstMonomer = getMonomerLocator(page, Chem.F1);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    const bondLine = getBondLocator(page, {
      bondType: MacroBondDataIds.Single,
    }).first();
    await bondLine.click({ force: true });
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  const testData4 = [
    {
      description: 'Sugar',
      monomer: Sugars._25R,
      bondEndpoints: { first: 'R1', second: 'R2' },
    },
    {
      description: 'Base',
      monomer: Bases.meA,
      bondEndpoints: { first: 'R1', second: 'R1' },
    },
    {
      description: 'Phosphate',
      monomer: Phosphates.sP_,
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
      const firstMonomer = getMonomerLocator(page, Chem.F1);
      const secondMonomer = getMonomerLocator(page, data.monomer);
      await openFileAndAddToCanvas(
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await Library(page).selectMonomer(data.monomer);
      await clickOnCanvas(page, x, y);
      await bondTwoMonomersPointToPoint(
        page,
        firstMonomer,
        secondMonomer,
        data.bondEndpoints.first,
        data.bondEndpoints.second,
      );
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await CommonLeftToolbar(page).selectEraseTool();
      await page.getByText(data.monomer.alias).click();
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
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
    const firstMonomer = getMonomerLocator(page, Chem.F1);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonLeftToolbar(page).selectEraseTool();
    const canvasLocator = page
      .getByTestId(KETCHER_CANVAS)
      .filter({ has: page.locator(':visible') });
    await canvasLocator.locator('path').nth(5).click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
    const firstMonomer = getMonomerLocator(page, Chem.F1);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R1',
      'R3',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);
    const canvasLocator = page
      .getByTestId(KETCHER_CANVAS)
      .filter({ has: page.locator(':visible') });
    await canvasLocator.locator('path').nth(5).click();
    await takeEditorScreenshot(page);
  });

  test('Check that AP label disappear if we delete bond between AP label and atom (stand alone AP label is not possible)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: 
      AP label disappear if we delete bond between AP label and atom (stand alone AP label is not possible)
    */
    await openFileAndAddToCanvas(page, 'KET/oxygen-on-attachment-point.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 645, 318);
    await takeEditorScreenshot(page);
  });

  test('Connect molecule to monomer', async () => {
    /*
    Github ticket: https://github.com/epam/ketcher/issues/4532
    Description: Allow connection of molecule with monomer
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/molecule-connected-to-monomers.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Check it is impossible to create attachment point if atom is a part of s-group', async () => {
    /*
    Github ticket: #4530
    Description: It is impossible to create attachment point if atom is a part of s-group
    */
    await openFileAndAddToCanvasMacro(page, 'KET/part-chain-with-s-group.ket');
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Validate that we can save bond between micro and macro structures to KET', async () => {
    /*
    Test case: #4530
    Description: We can save bond between micro and macro structures to KET.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/chem-connected-to-micro-structure.ket',
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
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await verifyFileExport(
        page,
        'Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
        FileType.MOL,
        MolFileFormat.v2000,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/one-attachment-point-added-in-micro-mode-expected.mol',
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await verifyFileExport(
      page,
      'SDF/one-attachment-point-added-in-micro-modesdfv2000-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/one-attachment-point-added-in-micro-modesdfv2000-expected.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of SDF V3000 molecular structure files', async () => {
    /*
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in SDF V3000 format.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await verifyFileExport(
      page,
      'SDF/one-attachment-point-added-in-micro-modesdfv3000-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/one-attachment-point-added-in-micro-modesdfv3000-expected.sdf',
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );

    await verifyFileExport(
      page,
      'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
      FileType.CDX,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDX/one-attachment-point-added-in-micro-mode-expected.cdx',
      // Error expected
      true,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await closeErrorAndInfoModals(page);
  });

  test('Verify presence and correctness of attachment points (SAP) in the SGROUP segment of CDXML molecular structure files', async () => {
    /* 
    Test case: #4530
    Description: Attachment points and leaving groups are correctly represented in CDX format.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );

    await verifyFileExport(
      page,
      'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
      FileType.CDXML,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/one-attachment-point-added-in-micro-mode-expected.cdxml',
    );
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
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );

      await verifyFileExport(
        page,
        'CML/one-attachment-point-added-in-micro-mode-expected.cml',
        FileType.CML,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'CML/one-attachment-point-added-in-micro-mode-expected.cml',
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MoleculesFileFormatType.SVGDocument,
      );
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
        page,
        'KET/one-attachment-point-added-in-micro-mode.ket',
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MoleculesFileFormatType.PNGImage,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Check that Aromatize/Dearomatize works for molecules with AP', async () => {
    /*
     * Test case: #4530
     * Description: Aromatize/Dearomatize works for molecules with AP.
     */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
  });

  test('Check that Layout works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Layout works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Check that Clean Up works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Clean Up works for molecules with AP.
    */
    await openFileAndAddToCanvas(page, 'KET/distorted-r1-attachment-point.ket');
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Check that Calculate CIPs works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Calculate CIPs works for molecules with AP.
    */
    await openFileAndAddToCanvas(page, 'KET/structure-with-ap-and-stereo.ket');
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Check that Structure Check works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Structure Check works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await IndigoFunctionsToolbar(page).checkStructure();
    await takeEditorScreenshot(page, {
      mask: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('Check that Calculate values works for molecules with AP', async () => {
    /*
    Test case: #4530
    Description: Calculate values works for molecules with AP.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
  });

  test('Check that 3D view works for molecules with AP but hydrohen is shown instead of AP', async () => {
    /*
    Test case: #4530
    Description: 3D view works for molecules with AP but hydrohen is shown instead of AP.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
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
          page,
          'KET/two-attachment-points-added-in-micro-mode.ket',
        );
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
        await selectSequenceLayoutModeTool(page);

        if (data.sequenceType) {
          await switchSequenceEnteringButtonType(page, data.sequenceType);
        }

        const symbolAt = getSymbolLocator(page, {
          symbolAlias: '@',
          nodeIndexOverall: 0,
        });
        await ContextMenu(page, symbolAt).click(
          SequenceSymbolOption.EditSequence,
        );
        await keyboardPressOnCanvas(page, 'ArrowRight');
        await keyboardPressOnCanvas(page, 'a');
        await keyboardPressOnCanvas(page, 'Escape');
        await selectSnakeLayoutModeTool(page);
        await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
        await getMonomerLocator(page, {
          monomerAlias: 'F1',
        }).hover();
        await waitForMonomerPreview(page);
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
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
        await selectSequenceLayoutModeTool(page);

        if (data.sequenceType) {
          await switchSequenceEnteringButtonType(page, data.sequenceType);
        }

        const symbolAt = getSymbolLocator(page, {
          symbolAlias: '@',
          nodeIndexOverall: 0,
        });
        await ContextMenu(page, symbolAt).click(
          SequenceSymbolOption.EditSequence,
        );
        await keyboardPressOnCanvas(page, 'ArrowRight');
        await keyboardPressOnCanvas(page, 'a');
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await page.getByText('R1').click();
    await takeEditorScreenshot(page);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );
    await takeEditorScreenshot(page);
  });

  test('Check it is possible to wrap AP labed to R-group (by fragment tool)', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: It is possible to wrap AP labed to R-group (by fragment tool).
    */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await page.getByText('R1').click();
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await page.getByText('R1').click();
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await LeftToolbar(page).chargePlus();
    await page.getByText('R1').click();
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'C', 2);
    await takeEditorScreenshot(page);
    await LeftToolbar(page).chargeMinus();
    await page.getByText('R1').click();
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await page.getByText('R1').click();
    await takeEditorScreenshot(page);
  });

  test('Check we can attach AP to single atom', async () => {
    /*
    Test case: Macro-Micro-Switcher/#4530
    Description: AP attached to single atom.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
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

    await openFileAndAddToCanvas(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats (PNG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Added to Canvas (from CDX file) of allowed formats (PNG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro
     */

    const fileContent = await readFileContent('CDX/image-png-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);

    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats (PNG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Added to Canvas (from CDXML file) of allowed formats (PNG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro
     */

    await openFileAndAddToCanvas(page, 'CDXML/image-png-expected.cdxml');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats (SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDX file) of allowed formats (SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDX/image-svg-expected.cdx');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats (SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDXML file) of allowed formats (SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */

    await openFileAndAddToCanvas(page, 'CDXML/image-svg-expected.cdxml');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDX file) of allowed formats together (PNG, SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDX file) of allowed formats together (PNG, SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDX/image-png-svg-together.cdx');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Added to Canvas (from CDXML file) of allowed formats together (PNG, SVG) are not presented on Canvas after switching to Macro mode and presented after returning to Micro ', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Added to Canvas (from CDXML file) of allowed formats together (PNG, SVG) are not presented on the Canvas after switching
     * to Macro mode and presented after returning to Micro (SVG image replaced by placeholder)
     */

    await openFileAndAddToCanvas(page, 'CDXML/image-png-svg-together.cdxml');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Validate that it is possible to save micro-macro connection to ket file', async () => {
    /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to ket file.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-macro-structure.ket',
    );
    await verifyFileExport(
      page,
      'KET/micro-macro-structure-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-macro-structure-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

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
      await openFileAndAddToCanvas(page, 'KET/micro-macro-structure.ket');
      await verifyFileExport(
        page,
        'Molfiles-V2000/micro-macro-structure-expected.mol',
        FileType.MOL,
        MolFileFormat.v2000,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/micro-macro-structure-expected.mol',
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
      await openFileAndAddToCanvas(page, 'KET/micro-macro-structure.ket');
      await verifyFileExport(
        page,
        'SDF/micro-macro-structure-v2000-expected.sdf',
        FileType.SDF,
        SdfFileFormat.v2000,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'SDF/micro-macro-structure-v2000-expected.sdf',
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that it is possible to save micro-macro connection to sdf v3000 file', async () => {
    /*
    Test case: #4532
    Description: It is possible to save micro-macro connection to sdf v3000 file.
    */
    await openFileAndAddToCanvas(page, 'KET/micro-macro-structure.ket');
    await verifyFileExport(
      page,
      'SDF/micro-macro-structure-v3000-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/micro-macro-structure-v3000-expected.sdf',
    );
    await takeEditorScreenshot(page);
  });
});

async function collapseMonomer(page: Page) {
  const canvas = page.getByTestId(KETCHER_CANVAS);
  const attachmentPoint = canvas.getByText('H', { exact: true }).first();

  if (await attachmentPoint.isVisible()) {
    await ContextMenu(page, attachmentPoint).click(
      MonomerOnMicroOption.CollapseMonomer,
    );
  } else {
    await ContextMenu(
      page,
      canvas.getByText('O', { exact: true }).first(),
    ).click(MonomerOnMicroOption.CollapseMonomer);
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      await openFileAndAddToCanvasAsNewProject(page, expandableMonomer.KETFile);
      await takeEditorScreenshot(page);
      const monomerOnMicro = page
        .getByTestId(KETCHER_CANVAS)
        .getByText(expandableMonomer.monomerLocatorText, { exact: true });
      await ContextMenu(page, monomerOnMicro).click(
        MonomerOnMicroOption.ExpandMonomer,
      );
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
  },
  {
    monomerDescription:
      '2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription:
      '4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '6. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '7. DNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription: '8. RNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription: '9. Base M (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'M',
  },
  {
    monomerDescription: '10. DNA base A+C+G+T (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '11. RNA base A+C+G+U (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '12. Base A+C (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '13. Phosphate bnn,cmp,nen (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '14. Phosphate bnn+cmp+nen (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '17. Unknown nucleotide',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
    monomerLocatorText: 'Unknown',
  },
];

test.describe('Impossible to expand on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      await openFileAndAddToCanvasAsNewProject(
        page,
        nonExpandableMonomer.KETFile,
      );
      await takeEditorScreenshot(page);

      const monomerOnMicro = page
        .getByTestId(KETCHER_CANVAS)
        .getByText(nonExpandableMonomer.monomerLocatorText, { exact: true });
      await ContextMenu(page, monomerOnMicro).open();

      const disableState = await page
        .getByTestId(MonomerOnMicroOption.ExpandMonomer)
        .isDisabled();
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
        page,
        collapsableMonomer.KETFile,
      );
      const monomerOnMicro = page
        .getByTestId(KETCHER_CANVAS)
        .getByText(collapsableMonomer.monomerLocatorText, { exact: true });
      await ContextMenu(page, monomerOnMicro).click(
        MonomerOnMicroOption.ExpandMonomer,
      );
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
  {
    monomerDescription: '7. Peptide X (ambiguouse, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library).ket',
    monomerLocatorText: 'X',
  },
  {
    monomerDescription:
      '8. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '9. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription:
      '10. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '11. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '12. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription:
      '13. DNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription:
      '14. RNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription: '15. Base M (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
    monomerLocatorText: 'M',
  },
  {
    monomerDescription: '16. DNA base A+C+G+T (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '17. RNA base A+C+G+U (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
    monomerLocatorText: '%',
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
  },
  {
    monomerDescription: '20. Phosphate bnn+cmp+nen (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '21. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '22. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '23. Unknown nucleotide',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
    monomerLocatorText: 'Unknown',
  },
];

test.describe('Move in collepsed state on Micro canvas: ', () => {
  test.beforeEach(async () => {
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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

      await openFileAndAddToCanvasAsNewProject(
        page,
        movableCollapsedMonomer.KETFile,
      );
      await takeEditorScreenshot(page);

      const canvasLocator = page.getByTestId(KETCHER_CANVAS);
      const monomerLocator = canvasLocator.getByText(
        movableCollapsedMonomer.monomerLocatorText,
        { exact: true },
      );

      await moveMonomerOnMicro(page, monomerLocator, 100, 100);
      await moveMouseToTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

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
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1.rdf',
    MacroFileType.Ket,
    // error is expected
    true,
  );
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});
