/* eslint-disable no-magic-numbers */
import { Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForKetcherInit,
  waitForIndigoToLoad,
  resetZoomLevelToDefault,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for chems: ', () => {
  let page: Page;
  test.setTimeout(400000);
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

  interface IMonomer {
    monomerType: string;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/12 - (R1,R2,R3,R4).ket',
      alias: '(R1,R2,R3,R4)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
  };

  const tmpChemMonomers: { [monomerName: string]: IMonomer } = {
    'Test-6-Ch': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/Test-6-Ch.ket',
      alias: 'Test-6-Ch',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
    'Test-6-Ch-1': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch-1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-Ch-2': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch-2',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-Ch-3': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch-3',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-Ch-4': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch-4',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-Ch-5': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch-5',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
  };

  async function bondTwoMonomersByCenterToPoint(
    page: Page,
    leftCHEM: IMonomer,
    rightCHEM: IMonomer,
    rightCHEMConnectionPoint?: string,
  ) {
    const canvasLocator = page.getByTestId('ketcher-canvas');
    const leftCHEMLocator = canvasLocator
      .getByText(leftCHEM.alias, { exact: true })
      .locator('..')
      .first();

    const rightCHEMLocator =
      (await canvasLocator
        .getByText(rightCHEM.alias, { exact: true })
        .count()) > 1
        ? canvasLocator
            .getByText(rightCHEM.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : canvasLocator
            .getByText(rightCHEM.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftCHEMLocator,
      rightCHEMLocator,
      undefined,
      rightCHEMConnectionPoint,
    );
  }

  async function hoverOverConnectionLine(page: Page) {
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();
  }

  Object.values(chemMonomers).forEach((rightCHEM) => {
    Object.values(rightCHEM.connectionPoints).forEach(
      (rightCHEMConnectionPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 3
         *  Description: User drags a bond from the center of the first monomer to the specific AP of the second monomer.
         *   For each %CHEMSType% from chemMonomers:
         *     For each %Test-6-Ch-ConnectionPoint% of Test-6-Ch from (R1, R2, R3, R4, R5)
         *       Establish connection between Test-6-Ch(center) and %CHENMSType%(%Test-6-Ch-ConnectionPoint%)
         *       Validate canvas (Dialog should appear)
         *       Select R1 of Test-6-Ch and establish connection
         *       Validate canvas (Connection should appear)
         */
        test(`Case 3: Connect Center to ${rightCHEMConnectionPoint} of Test-6-Ch and ${rightCHEM.alias}`, async () => {
          test.setTimeout(35000);

          await openFileAndAddToCanvasMacro(
            tmpChemMonomers['Test-6-Ch'].fileName,
            page,
          );
          let CHEMLocator = page
            .getByText(tmpChemMonomers['Test-6-Ch'].alias)
            .locator('..')
            .first();
          await CHEMLocator.hover();
          await dragMouseTo(500, 371, page);
          await moveMouseAway(page);
          await openFileAndAddToCanvasMacro(rightCHEM.fileName, page);

          CHEMLocator = page.getByText(rightCHEM.alias).locator('..').first();
          await CHEMLocator.hover();
          await dragMouseTo(650, 370, page);
          await moveMouseAway(page);

          await bondTwoMonomersByCenterToPoint(
            page,
            tmpChemMonomers['Test-6-Ch'],
            rightCHEM,
            rightCHEMConnectionPoint,
          );

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });

          if (await page.getByRole('dialog').isVisible()) {
            await page.getByTitle('R1').first().click();
            await page.getByTitle('Connect').first().click();
          }

          await zoomWithMouseWheel(page, -600);

          await hoverOverConnectionLine(page);

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });
        });
      },
    );
  });
});
