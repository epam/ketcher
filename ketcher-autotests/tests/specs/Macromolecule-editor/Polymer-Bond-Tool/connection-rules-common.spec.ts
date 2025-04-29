/* eslint-disable no-magic-numbers */
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  waitForKetcherInit,
  waitForIndigoToLoad,
  waitForRender,
  selectFlexLayoutModeTool,
  selectSnakeLayoutModeTool,
  clickOnCanvas,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  Monomer,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools';
import { waitForMonomerPreviewMicro } from '@utils/common/loaders/previewWaiters';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  bondTwoMonomersPointToPoint,
  pressCancelAtSelectConnectionPointDialog,
  selectLeftConnectionPointAtSelectConnectionPointDialog,
  selectRightConnectionPointAtSelectConnectionPointDialog,
} from '@utils/macromolecules/polymerBond';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Bases } from '@constants/monomers/Bases';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import {
  bondSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Common connection rules: ', () => {
  let page: Page;
  test.setTimeout(300000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    let sharedContext;
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
    await resetZoomLevelToDefault(page);
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    const cntxt = page.context();
    await page.close();
    await cntxt.close();
    await browser.contexts().forEach((someContext) => {
      someContext.close();
    });
    // await browser.close();
  });

  async function dragBondFromMonomerCenterAwayTo(
    page: Page,
    monomer: Monomer,
    x: number,
    y: number,
  ) {
    await bondSelectionTool(page, MacroBondType.Single);
    await getMonomerLocator(page, monomer).first().hover();
    await page.mouse.down();
    await waitForRender(page, async () => {
      await page.mouse.move(x, y);
    });
  }

  async function dragBondFromMonomerCenterTo(
    page: Page,
    leftMonomer: Monomer,
    rightMonomer: Monomer,
  ) {
    await bondSelectionTool(page, MacroBondType.Single);

    const leftMonomerLocator = getMonomerLocator(page, leftMonomer).first();
    const rightMonomerLocator = getMonomerLocator(page, rightMonomer).first();

    await leftMonomerLocator.hover();
    await page.mouse.down();
    await waitForRender(page, async () => {
      await rightMonomerLocator.hover();
    });
  }

  async function hoverMouseOverMonomerNTymes(
    page: Page,
    monomer: Monomer,
    n: number,
  ) {
    await bondSelectionTool(page, MacroBondType.Single);

    const monomerLocator = getMonomerLocator(page, monomer).first();

    for (let i = 1; i < n; i = i + 1) {
      await monomerLocator.hover();
      await moveMouseAway(page);
    }
  }

  async function hoverMouseOverMonomer(page: Page, monomer: Monomer) {
    await bondSelectionTool(page, MacroBondType.Single);
    await getMonomerLocator(page, monomer).first().hover();
  }

  async function grabSelectionAndMoveTo(
    page: Page,
    monomer: Monomer,
    x: number,
    y: number,
  ) {
    await getMonomerLocator(page, monomer).first().hover();
    await page.mouse.down();
    await page.mouse.move(x, y);
    await page.mouse.up();
    await moveMouseAway(page);
  }

  async function eraseMonomer(page: Page, monomer: Monomer) {
    const monomerLocator = getMonomerLocator(page, monomer).first();

    // removing selections
    await clickOnCanvas(page, 100, 100);

    await monomerLocator.click();
    await selectEraseTool(page);
  }

  /*
   *  Test case1: https://github.com/epam/ketcher/issues/4600 - Cases 1-3
   *  Check that bond dissapears when 'ESC' button is pressed while pulling bond away from CHEM monomer placed on canvas
   *  Check that bond dissapears when 'ESC' button is pressed while pulling bond away from Peptide monomer placed on canvas
   *  Check that bond dissapears when 'ESC' button is pressed while pulling bond away from RNA monomer placed on canvas
   */
  test(`Check that bond dissapears when 'ESC' button is pressed while pulling bond away from monomers placed on canvas`, async () => {
    test.setTimeout(30000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
      page,
    );
    // Peptide
    await dragBondFromMonomerCenterAwayTo(page, Chem.SMPEG2, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // CHEM
    await dragBondFromMonomerCenterAwayTo(page, Peptides.LysiPr, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Sugar
    await dragBondFromMonomerCenterAwayTo(page, Sugars._12ddR, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Phosphate
    await dragBondFromMonomerCenterAwayTo(page, Phosphates.P, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Base
    await dragBondFromMonomerCenterAwayTo(page, Bases.c7io7n, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
  });

  /*
   *  Test case2: https://github.com/epam/ketcher/issues/4600 - Cases 4-5
   *  Check that attachment points dissapear when dragging bond from one peptide on canvas to another and clicking 'ESC' when hover second peptide
   *  Check that attachment points dissapear when dragging bond from one RNA monomer on canvas to another and clicking 'ESC' when hover second RNA
   *  Check that attachment points dissapear when dragging bond from one CHEM monomer on canvas to another and clicking 'ESC' when hover second CHEM
   */
  test(`Check that attachment points dissapear when dragging bond from one monomer on canvas to another and clicking 'ESC' when hover second monomer`, async () => {
    test.setTimeout(50000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
      page,
    );
    // Peptide
    await dragBondFromMonomerCenterTo(page, Chem.SMPEG2, Chem.sDBL);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // CHEM
    await dragBondFromMonomerCenterTo(page, Peptides.LysiPr, Peptides.Hcy);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Sugar
    await dragBondFromMonomerCenterTo(page, Sugars._12ddR, Sugars.nC62r);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Phosphate
    await dragBondFromMonomerCenterTo(page, Phosphates.P, Phosphates.mn);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Base
    await dragBondFromMonomerCenterTo(page, Bases.c7io7n, Bases.nC6n5U);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
  });

  /*
   *  Test case3: https://github.com/epam/ketcher/issues/4600 - Cases 6-9
   *  Check that attachment points disappear in snake viewed chain of peptides when hovering them multiple times
   *  Check that attachment points disappear in chain of CHEMs when hovering them multiple times
   *  Check that attachment points disappear in chain of RNAs when hovering them multiple times
   */
  test(`Check that attachment points disappear in chain of monomers when hovering them multiple times`, async () => {
    test.setTimeout(40000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
      page,
    );
    await selectSnakeLayoutModeTool(page);

    // Peptide
    await hoverMouseOverMonomerNTymes(page, Chem.sDBL, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // CHEM
    await hoverMouseOverMonomerNTymes(page, Peptides.Hcy, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Sugar
    await hoverMouseOverMonomerNTymes(page, Sugars.nC62r, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Phosphate
    await hoverMouseOverMonomerNTymes(page, Phosphates.mn, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Base
    await hoverMouseOverMonomerNTymes(page, Bases.nC6n5U, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    await selectFlexLayoutModeTool(page);
  });

  /*
   *  Test case4: https://github.com/epam/ketcher/issues/4605 - Cases 1-5
   *  Check that 4 connected by Bond A6OH monomers can moving after using Rectangle Selection
   *  Check that 4 connected by Bond A6OH monomers are possible to Zoom In/ Zoom Out
   *  Check that 4 connected by Bond A6OH monomers are possible to Erase
   *  Check that 4 connected by Bond A6OH monomers are possible to Save Structure
   *  Check that 4 connected by Bond A6OH monomers are possible to Save Structure in Mol Format
   */
  test(`Check that 4 connected by Bond A6OH monomers can/are...`, async () => {
    test.setTimeout(40000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/4 connected by Bond A6OH.ket',
      page,
    );

    // Check that 4 connected by Bond A6OH monomers can moving after using Rectangle Selection
    await selectRectangleArea(page, 100, 100, 800, 800);
    await grabSelectionAndMoveTo(page, Chem.A6OH, 200, 200);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Check that 4 connected by Bond A6OH monomers are possible to Zoom In/ Zoom Out
    await ZoomInByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await ZoomOutByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Check that 4 connected by Bond A6OH monomers are possible to Erase
    await eraseMonomer(page, Chem.A6OH);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Check that 4 connected by Bond A6OH monomers are possible to Save Structure
    // await saveToKet(page, '4 connected by Bond A6OH-expected.ket');
    await verifyFileExport(
      page,
      'KET/Common-Bond-Tests/4 connected by Bond A6OH-expected.ket',
      FileType.KET,
    );
    // Check that 4 connected by Bond A6OH monomers are possible to Save Structure in Mol Format

    await verifyFileExport(
      page,
      'KET/Common-Bond-Tests/4 connected by Bond A6OH-expected.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  async function bondTwoMonomersByCenterToCenterByNames(
    page: Page,
    leftMonomer: Monomer,
    rightMonomer: Monomer,
  ) {
    const leftMonomerLocator = getMonomerLocator(page, leftMonomer).first();
    const rightMonomerLocator = getMonomerLocator(page, rightMonomer).first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
    );
  }

  test(`Check that select attachment point window works correct`, async () => {
    /*
     *  Test case5: https://github.com/epam/ketcher/issues/4422 - Cases 8-10
     *  Case 8:
     *    "Select Attachment Points" modal: Check click button to expand modal
     *  Case 9:
     *    "Select Attachment Points" modal: Molecular structures of monomers in expanded window have the same scale
     *  Case 10:
     *    Button to collapse expanded view is added. When button is clicked, default modal view is shown
     */
    test.setTimeout(20000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/Two Test-6 monomers on the canvas.ket',
      page,
    );

    await bondTwoMonomersByCenterToCenterByNames(
      page,
      Chem.Test_6_Ch,
      Phosphates.Test_6_Ph,
    );
    // Case 8-9
    await page.getByTitle('expand window').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Case 10
    await page.getByTitle('expand window').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    await pressCancelAtSelectConnectionPointDialog(page);
  });

  // test(`Check that preview window of micro structure not shows pieces of macro structures and vice versa`, async () => {
  //   /*
  //    *  Test case5: https://github.com/epam/ketcher/issues/4422 - Cases 11
  //    *  Case 11:
  //    *    Check that preview window of micro structure not shows pieces of macro structures and vice versa
  //    */
  //   test.setTimeout(20000);
  //
  //   await openFileAndAddToCanvasMacro(
  //     'KET/Common-Bond-Tests/Micro and macro connected.ket',
  //     page,
  //   );
  //
  //   const leftMonomerLocator = page
  //     .getByText('Test-6-Ch')
  //     .locator('..')
  //     .first();
  //   const rightMonomerLocator = getMonomerLocator(page, Chem.F1).first();
  //   await bondTwoMonomersPointToPoint(
  //     page,
  //     leftMonomerLocator,
  //     rightMonomerLocator,
  //     'R1',
  //     'R1',
  //   );
  //
  //   await hoverMouseOverMonomer(page, 'Test-6-Ch');
  //   await delay(1);
  //           await takeEditorScreenshot(page, {
  //         hideMonomerPreview: true,
  //       });
  //
  //   await hoverMouseOverMonomer(page, 'F1');
  //   await delay(1);
  //           await takeEditorScreenshot(page, {
  //         hideMonomerPreview: true,
  //       });
  // });

  test(`Check preview for monomer after loading Mol V3000. Leaving groups are displayed correctly`, async () => {
    /*
     *  Test case6: https://github.com/epam/ketcher/issues/4422 - Cases 15
     *  Case 11:
     *    Check that preview window of micro structure not shows pieces of macro structures and vice versa
     */
    test.setTimeout(20000);

    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/Common-Bond-Tests/C___Cysteine on the canvas.mol',
      page,
    );

    await hoverMouseOverMonomer(page, Peptides.C);
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test(`Check that Leaving groups (connection/attchment points) are displayed correctly in preview when switching to Micro mode`, async () => {
    /*
     *  Test case7: https://github.com/epam/ketcher/issues/4422 - Cases 17
     *  Case 17:
     *    Check that Leaving groups (connection/attchment points) are displayed correctly in preview when switching to Micro mode
     */
    test.setTimeout(20000);

    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/Common-Bond-Tests/C___Cysteine on the canvas.mol',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await page.getByText('C', { exact: true }).first().hover();
    await waitForMonomerPreviewMicro(page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
  });

  test(`Check that system marks availiable connection point as avaliable in Select Connection Point dialog (use attached files)`, async () => {
    /*
     *  Test case7: https://github.com/epam/ketcher/issues/4422 - Cases 19
     *  Case 19:
     *    Check that system marks availiable connection point as avaliable in Select Connection Point dialog (use attached files)
     */
    test.setTimeout(40000);

    await openFileAndAddToCanvasMacro(
      'KET/Common-Bond-Tests/Two Test-6 monomers on the canvas.ket',
      page,
    );
    await bondTwoMonomersByCenterToCenterByNames(
      page,
      Chem.Test_6_Ch,
      Phosphates.Test_6_Ph,
    );

    const connectionPoints = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

    for (const connectionPoint of connectionPoints) {
      await selectLeftConnectionPointAtSelectConnectionPointDialog(
        page,
        connectionPoint,
      );
      //         await takeEditorScreenshot(page, {
      //     hideMonomerPreview: true,
      //   });

      await selectRightConnectionPointAtSelectConnectionPointDialog(
        page,
        connectionPoint,
      );
      //         await takeEditorScreenshot(page, {
      //     hideMonomerPreview: true,
      //   });
    }

    await pressCancelAtSelectConnectionPointDialog(page);
  });
});
