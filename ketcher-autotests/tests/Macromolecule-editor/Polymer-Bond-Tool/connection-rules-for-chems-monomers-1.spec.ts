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

  async function loadTwoMonomers(
    page: Page,
    leftMonomers: IMonomer,
    rightMonomers: IMonomer,
  ) {
    await openFileAndAddToCanvasMacro(leftMonomers.fileName, page);
    const canvasLocator = page.getByTestId('ketcher-canvas').first();
    const leftMonomerLocator = canvasLocator
      .locator(`text=${leftMonomers.alias}`)
      .locator('..')
      .first();
    // const leftMonomerLocator = page.locator('use').first();
    await leftMonomerLocator.hover();
    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightMonomers.fileName, page);
    const rightMonomerLocator =
      (await canvasLocator.locator(`text=${leftMonomers.alias}`).count()) > 1
        ? canvasLocator
            .locator(`text=${rightMonomers.alias}`)
            .nth(1)
            .locator('..')
            .first()
        : canvasLocator
            .locator(`text=${rightMonomers.alias}`)
            .locator('..')
            .first();
    // const rightMonomerLocator = page.locator('use').nth(1);
    await rightMonomerLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 372, page);
    await moveMouseAway(page);
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
    leftMonomersConnectionPoint?: string,
    rightMonomersConnectionPoint?: string,
  ) {
    const canvasLocator = page.getByTestId('ketcher-canvas');
    const leftMonomerLocator = canvasLocator
      .getByText(leftMonomer.alias, { exact: true })
      // .locator(`text=${leftMonomer.alias}`)
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await canvasLocator
        .getByText(leftMonomer.alias, { exact: true })
        // .locator(`text=${leftMonomer.alias}`)
        .count()) > 1
        ? canvasLocator
            .getByText(rightMonomer.alias, { exact: true })
            // .locator(`text=${rightMonomer.alias}`)
            .nth(1)
            .locator('..')
            .first()
        : canvasLocator
            .getByText(rightMonomer.alias, { exact: true })
            // .locator(`text=${rightMonomer.alias}`)
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      leftMonomersConnectionPoint,
      rightMonomersConnectionPoint,
    );
  }

  async function hoverOverConnectionLine(page: Page) {
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();
  }

  // test(`temporary test for debug purposes`, async () => {
  //   await prepareCanvasOneFreeAPLeft(
  //     page,
  //     chemMonomers['(R1,R2,R3,R4,R5)'],
  //     chemMonomers['(R1,R2,R3,R4,R5)'],
  //     'R1',
  //     'R5',
  //   );
  // });

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftCHEM.connectionPoints).forEach(
        (leftCHEMConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              if (leftCHEMConnectionPoint === rightCHEMConnectionPoint) {
                /*
                 *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 1
                 *  Description: If a user tries to connect 2 monomers that have only identical free attachment
                 *               points (for example, R1 and R1 or R2 and R2), a bond is created, and a message occurs.
                 */
                test(`Case 1: Connect ${leftCHEMConnectionPoint} to ${rightCHEMConnectionPoint} of ${leftCHEM.alias} and ${rightCHEM.alias}`, async () => {
                  test.setTimeout(35000);

                  await loadTwoMonomers(page, leftCHEM, rightCHEM);

                  await bondTwoMonomersByPointToPoint(
                    page,
                    leftCHEM,
                    rightCHEM,
                    leftCHEMConnectionPoint,
                    rightCHEMConnectionPoint,
                  );

                  await zoomWithMouseWheel(page, -600);
                  await hoverOverConnectionLine(page);

                  await takeEditorScreenshot(page, {
                    masks: [page.getByTestId('polymer-library-preview')],
                  });
                });
              }
            },
          );
        },
      );
    });
  });
});
