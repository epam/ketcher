/* eslint-disable no-magic-numbers */
import { Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForPageInit,
  waitForKetcherInit,
  waitForIndigoToLoad,
  selectClearCanvasTool,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

let page: Page;

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
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  // const brwsr = cntxt.browser();
  console.log('Number of contexts: ', browser.contexts().length);
  console.log('Number of pages: ', cntxt.pages().length);
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // if (brwsr) await brwsr.close();
  // await browser.close();
});

test.describe('Connection rules for Base monomers: ', () => {
  test.setTimeout(15000);
  test.describe.configure({ retries: 0 });
  /*
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */
  interface IMonomer {
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const baseMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/Base-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/Base-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/Base-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R1,R2,R3)': {
      fileName: 'KET/Base-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    '(R1,R3,R4)': {
      fileName: 'KET/Base-Templates/09 - (R1,R3,R4).ket',
      alias: '(R1,R3,R4)',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
        R4: 'R4',
      },
    },
    '(R1,R2,R3,R4)': {
      fileName: 'KET/Base-Templates/12 - (R1,R2,R3,R4).ket',
      alias: '(R1,R2,R3,R4)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
      },
    },
    '(R1,R3,R4,R5)': {
      fileName: 'KET/Base-Templates/13 - (R1,R3,R4,R5).ket',
      alias: '(R1,R3,R4,R5)',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
    '(R1,R2,R3,R4,R5)': {
      fileName: 'KET/Base-Templates/15 - (R1,R2,R3,R4,R5).ket',
      alias: '(R1,R2,R3,R4,R5)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
  };

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftBase: IMonomer,
    rightBase: IMonomer,
    leftBaseConnectionPoint?: string,
    rightBaseConnectionPoint?: string,
  ) {
    await openFileAndAddToCanvasMacro(leftBase.fileName, page);
    const leftBaseLocator = page
      .getByText(leftBase.alias)
      .locator('..')
      .first();
    await leftBaseLocator.hover();
    await dragMouseTo(550, 350, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightBase.fileName, page);

    const rightBaseLocator =
      (await page.getByText(leftBase.alias).count()) > 1
        ? page.getByText(rightBase.alias).nth(1).locator('..').first()
        : page.getByText(rightBase.alias).locator('..').first();
    await rightBaseLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(650, 351, page);
    await moveMouseAway(page);

    await bondTwoMonomersPointToPoint(
      page,
      leftBaseLocator,
      rightBaseLocator,
      leftBaseConnectionPoint,
      rightBaseConnectionPoint,
    );
    await zoomWithMouseWheel(page, -800);

    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();

    await takeEditorScreenshot(page);
  }
  /*
  test(`temporary test for debug purposes1`, async () => {
    await bondTwoMonomersByPointToPoint(
      page,
      baseMonomers['(R1,R2,R3)'],
      baseMonomers['(R1,R3,R4)'],
      'R3',
      'R1',
    );
  });
  test(`temporary test for debug purposes2`, async () => {
    await bondTwoMonomersByPointToPoint(
      page,
      baseMonomers['(R1,R2,R3)'],
      baseMonomers['(R1,R3,R4)'],
      'R3',
      'R4',
    );
  });
  */

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(baseMonomers).forEach((rightBase) => {
      Object.values(leftBase.connectionPoints).forEach(
        (leftBaseConnectionPoint) => {
          Object.values(rightBase.connectionPoints).forEach(
            (rightBaseConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3805
               *  Description: These bunch of tests validates that system able to establish connections for Base monomers.
               * For each %BaseType% from the library (baseMonomers)
               *   For each %BaseType2% from the library (baseMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %BaseType%)
               *         For each %ConnectionPoint2% (avaliable connections of %BaseType2%) do:
               *  1. Clear canvas
               *  2. Load %BaseType% and %BaseType2% and put them on the canvas
               *  3. Establish connection between %BaseType%(%ConnectionPoint%) and %BaseType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Connect ${leftBaseConnectionPoint} to ${rightBaseConnectionPoint} of ${leftBase.alias} and ${rightBase.alias}`, async () => {
                test.setTimeout(40000);
                await bondTwoMonomersByPointToPoint(
                  page,
                  leftBase,
                  rightBase,
                  leftBaseConnectionPoint,
                  rightBaseConnectionPoint,
                );
              });
            },
          );
        },
      );
    });
  });
});
