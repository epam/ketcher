/* eslint-disable prettier/prettier */
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
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for sugars: ', () => {
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
    await page.keyboard.press('Control+0');
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
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const sugarMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/Sugar-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      fileName: 'KET/Sugar-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      fileName: 'KET/Sugar-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/Sugar-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/Sugar-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      fileName: 'KET/Sugar-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   fileName: 'KET/Sugar-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      fileName: 'KET/Sugar-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   fileName: 'KET/Sugar-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   fileName: 'KET/Sugar-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   fileName: 'KET/Sugar-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   fileName: 'KET/Sugar-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   fileName: 'KET/Sugar-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   fileName: 'KET/Sugar-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   fileName: 'KET/Sugar-Templates/15 - (R1,R2,R3,R4,R5).ket',
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
    leftSugar: IMonomer,
    rightSugar: IMonomer,
  ) {
    await openFileAndAddToCanvasMacro(leftSugar.fileName, page);
    const leftsugarLocator = page
      .getByText(leftSugar.alias)
      .locator('..')
      .first();
    await leftsugarLocator.hover();
    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightSugar.fileName, page);
    const rightsugarLocator =
      (await page.getByText(leftSugar.alias).count()) > 1
        ? page.getByText(rightSugar.alias).nth(1).locator('..').first()
        : page.getByText(rightSugar.alias).locator('..').first();
    await rightsugarLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 371, page);
    await moveMouseAway(page);
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftSugar: IMonomer,
    rightSugar: IMonomer,
    leftSugarConnectionPoint?: string,
    rightSugarConnectionPoint?: string,
  ) {
    const leftSugarLocator = await page
      .getByText(leftSugar.alias, { exact: true })
      .locator('..')
      .first();

    const rightSugarLocator =
      (await page.getByText(rightSugar.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightSugar.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightSugar.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftSugarLocator,
      rightSugarLocator,
      leftSugarConnectionPoint,
      rightSugarConnectionPoint,
    );
  }

  // test(`temporary test for debug purposes`, async () => {
  //   await prepareCanvasOneFreeAPLeft(
  //     page,
  //     sugarMonomers['(R1,R2,R3,R4,R5)'],
  //     sugarMonomers['(R1,R2,R3,R4,R5)'],
  //     'R1',
  //     'R5',
  //   );
  // });

  Object.values(sugarMonomers).forEach((leftSugar) => {
    Object.values(sugarMonomers).forEach((rightSugar) => {
      Object.values(leftSugar.connectionPoints).forEach(
        (leftSugarConnectionPoint) => {
          Object.values(rightSugar.connectionPoints).forEach(
            (rightSugarConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3810 - Case 1
               *  Description: User clicks on the specific AP of the first monomer and drags a bond to the specific AP of the second monomer.
               */
              test(`Case 1: Connect ${leftSugarConnectionPoint} to ${rightSugarConnectionPoint} of ${leftSugar.alias} and ${rightSugar.alias}`, async () => {
                test.setTimeout(15000);

                await loadTwoMonomers(page, leftSugar, rightSugar);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftSugar,
                  rightSugar,
                  leftSugarConnectionPoint,
                  rightSugarConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);

                const bondLine = page
                  .locator('g[pointer-events="stroke"]')
                  .first();
                await bondLine.hover();

                await takeEditorScreenshot(page);
              });
            },
          );
        },
      );
    });
  });
});
