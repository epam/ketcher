/* eslint-disable no-magic-numbers */
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Page, chromium, test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  waitForKetcherInit,
  waitForRender,
  clickOnCanvas,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  Monomer,
  takeElementScreenshot,
  MacroFileType,
  MolFileFormat,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import { waitForMonomerPreviewMicro } from '@utils/common/loaders/previewWaiters';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  getMonomerLocator,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomersPointToPoint,
  selectLeftConnectionPointAtSelectConnectionPointDialog,
  selectRightConnectionPointAtSelectConnectionPointDialog,
} from '@utils/macromolecules/polymerBond';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { pageReload } from '@utils/common/helpers';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';

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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test.afterEach(async () => {
    await page.keyboard.press('Escape');
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    const monomerLocator = getMonomerLocator(page, monomer).first();

    for (let i = 1; i < n; i = i + 1) {
      await monomerLocator.hover();
      await moveMouseAway(page);
    }
  }

  async function hoverMouseOverMonomer(page: Page, monomer: Monomer) {
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });

    await monomerLocator.click();
    await CommonLeftToolbar(page).erase();
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
      page,
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
    );
    // Peptide
    await dragBondFromMonomerCenterAwayTo(page, Chem.SMPEG2, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // CHEM
    await dragBondFromMonomerCenterAwayTo(page, Peptide.LysiPr, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Sugar
    await dragBondFromMonomerCenterAwayTo(page, Sugar._12ddR, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Phosphate
    await dragBondFromMonomerCenterAwayTo(page, Phosphate.P, 500, 400);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Base
    await dragBondFromMonomerCenterAwayTo(page, Base.c7io7n, 500, 400);
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
      page,
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
    );
    // Peptide
    await dragBondFromMonomerCenterTo(page, Chem.SMPEG2, Chem.sDBL);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // CHEM
    await dragBondFromMonomerCenterTo(page, Peptide.LysiPr, Peptide.Hcy);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Sugar
    await dragBondFromMonomerCenterTo(page, Sugar._12ddR, Sugar.nC62r);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Phosphate
    await dragBondFromMonomerCenterTo(page, Phosphate.P, Phosphate.mn);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.mouse.up();
    // Base
    await dragBondFromMonomerCenterTo(page, Base.c7io7n, Base.nC6n5U);
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
      page,
      'KET/Common-Bond-Tests/Automation of Bond tests (203-211).ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    // Peptide
    await hoverMouseOverMonomerNTymes(page, Chem.sDBL, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // CHEM
    await hoverMouseOverMonomerNTymes(page, Peptide.Hcy, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Sugar
    await hoverMouseOverMonomerNTymes(page, Sugar.nC62r, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Phosphate
    await hoverMouseOverMonomerNTymes(page, Phosphate.mn, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    // Base
    await hoverMouseOverMonomerNTymes(page, Base.nC6n5U, 10);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
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
      page,
      'KET/Common-Bond-Tests/4 connected by Bond A6OH.ket',
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
      MolFileFormat.v3000,
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
      page,
      'KET/Common-Bond-Tests/Two Test-6 monomers on the canvas.ket',
    );

    await bondTwoMonomersByCenterToCenterByNames(
      page,
      Chem.Test_6_Ch,
      Phosphate.Test_6_Ph,
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

    await AttachmentPointsDialog(page).cancel();
  });

  // test(`Check that preview window of micro structure not shows pieces of macro structures and vice versa`, async () => {
  //   /*
  //    *  Test case5: https://github.com/epam/ketcher/issues/4422 - Cases 11
  //    *  Case 11:
  //    *    Check that preview window of micro structure not shows pieces of macro structures and vice versa
  //    */
  //   test.setTimeout(20000);
  //
  //   await openFileAndAddToCanvasMacro(page,
  //     'KET/Common-Bond-Tests/Micro and macro connected.ket',
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
  //     AttachmentPoint.R1,
  //     AttachmentPoint.R1,
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
      page,
      'Molfiles-V3000/Common-Bond-Tests/C___Cysteine on the canvas.mol',
      MacroFileType.MOLv3000,
    );

    await hoverMouseOverMonomer(page, Peptide.C);
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
    await pageReload(page);

    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/Common-Bond-Tests/C___Cysteine on the canvas.mol',
      MacroFileType.MOLv3000,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await page
      .getByTestId(KETCHER_CANVAS)
      .filter({ has: page.locator(':visible') })
      .getByText('C', { exact: true })
      .first()
      .hover();
    await waitForMonomerPreviewMicro(page);

    await takeElementScreenshot(
      page,
      page.getByTestId('monomer-preview-micro'),
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test(`Check that system marks availiable connection point as avaliable in Select Connection Point dialog (use attached files)`, async () => {
    /*
     *  Test case7: https://github.com/epam/ketcher/issues/4422 - Cases 19
     *  Case 19:
     *    Check that system marks availiable connection point as avaliable in Select Connection Point dialog (use attached files)
     */
    test.setTimeout(40000);

    await openFileAndAddToCanvasMacro(
      page,
      'KET/Common-Bond-Tests/Two Test-6 monomers on the canvas.ket',
    );
    await bondTwoMonomersByCenterToCenterByNames(
      page,
      Chem.Test_6_Ch,
      Phosphate.Test_6_Ph,
    );

    const attachmentPoints = [
      AttachmentPoint.R1,
      AttachmentPoint.R2,
      AttachmentPoint.R3,
      AttachmentPoint.R4,
      AttachmentPoint.R5,
      AttachmentPoint.R6,
    ];

    for (const attachmentPoint of attachmentPoints) {
      await selectLeftConnectionPointAtSelectConnectionPointDialog(
        page,
        attachmentPoint,
      );
      //         await takeEditorScreenshot(page, {
      //     hideMonomerPreview: true,
      //   });

      await selectRightConnectionPointAtSelectConnectionPointDialog(
        page,
        attachmentPoint,
      );
      //         await takeEditorScreenshot(page, {
      //     hideMonomerPreview: true,
      //   });
    }

    await AttachmentPointsDialog(page).cancel();
  });
});
