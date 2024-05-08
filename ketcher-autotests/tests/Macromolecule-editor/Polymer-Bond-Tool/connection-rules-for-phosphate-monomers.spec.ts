/* eslint-disable no-magic-numbers */
import { BrowserContext, Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
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
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  // let sharedContext;
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
  // await browser.close();
});

test.describe('Connection rules for Phosphate monomers: ', () => {
  test.setTimeout(300000);
  test.describe.configure({ retries: 0 });

  interface IMonomer {
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const phosphateMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/Phosphate-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      fileName: 'KET/Phosphate-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      fileName: 'KET/Phosphate-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/Phosphate-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/Phosphate-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      fileName: 'KET/Phosphate-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   fileName: 'KET/Phosphate-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      fileName: 'KET/Phosphate-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   fileName: 'KET/Phosphate-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   fileName: 'KET/Phosphate-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   fileName: 'KET/Phosphate-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   fileName: 'KET/Phosphate-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   fileName: 'KET/Phosphate-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   fileName: 'KET/Phosphate-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   fileName: 'KET/Phosphate-Templates/15 - (R1,R2,R3,R4,R5).ket',
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
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
    leftMonomerConnectionPoint?: string,
    rightMonomerConnectionPoint?: string,
  ) {
    const leftMonomerLocator = page
      .getByText(leftMonomer.alias)
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await page.getByText(leftMonomer.alias).count()) > 1
        ? page.getByText(rightMonomer.alias).nth(1).locator('..').first()
        : page.getByText(rightMonomer.alias).locator('..').first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      leftMonomerConnectionPoint,
      rightMonomerConnectionPoint,
    );
  }

  async function bondTwoMonomersByCenterToCenter(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ) {
    const leftMonomerLocator = page
      .getByText(leftMonomer.alias)
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await page.getByText(leftMonomer.alias).count()) > 1
        ? page.getByText(rightMonomer.alias).nth(1).locator('..').first()
        : page.getByText(rightMonomer.alias).locator('..').first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
    );

    if (await page.getByRole('dialog').isVisible()) {
      const firstConnectionPointKeyForLeftMonomer = Object.keys(
        leftMonomer.connectionPoints,
      )[0];
      const leftMonomerConnectionPoint =
        leftMonomer.connectionPoints[firstConnectionPointKeyForLeftMonomer];
      await page.getByTitle(leftMonomerConnectionPoint).first().click();

      const firstConnectionPointKeyForRightMonomer = Object.keys(
        rightMonomer.connectionPoints,
      )[0];
      const rightMonomerConnectionPoint =
        rightMonomer.connectionPoints[firstConnectionPointKeyForRightMonomer];
      (await page.getByTitle(rightMonomerConnectionPoint).count()) > 1
        ? await page.getByTitle(rightMonomerConnectionPoint).nth(1).click()
        : await page.getByTitle(rightMonomerConnectionPoint).first().click();

      await page.getByTitle('Connect').first().click();
    }
  }

  // test(`temporary test for debug purposes`, async () => {
  //    await bondTwoMonomersByCenterToCenter(page, phosphateMonomers['(R1,R2,R3)'], phosphateMonomers['(R1,R2,R3)']);
  //  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(phosphateMonomers).forEach((rightPhosphate) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 1
       *  Description: Phosphate could be connected with the phosphate through R2-R1 as well as R1-R1 or R2-R2.
       *               User should be asked which attachment points should be used to establish a bond.
       * For each %phosphateType% from the library (phosphateMonomers)
       *   For each %phosphateType2% from the library (phosphateMonomers)
       *  1. Clear canvas
       *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
       *  3. Establish connection between %phosphateType%(center) and %phosphateType%(center)
       *  4. Validate canvas (connection dialog should appear)
       */
      test(`Test case1: Center-to-center of ${leftPhosphate.alias} and ${rightPhosphate.alias}`, async () => {
        test.setTimeout(15000);

        await loadTwoMonomers(page, leftPhosphate, rightPhosphate);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftPhosphate,
          rightPhosphate,
        );

        await zoomWithMouseWheel(page, -800);

        const bondLine = page.locator('g[pointer-events="stroke"]').first();
        await bondLine.hover();

        await takeEditorScreenshot(page);
      });
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(phosphateMonomers).forEach((rightPhosphate) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightPhosphate.connectionPoints).forEach(
            (rightPhosphateConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 2
               *  Description: User can connect any phospshate to any phosphate using point-to-point way
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %phosphateType2% from the library (phosphateMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %phosphateType2%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
               *  3. Establish connection between %phosphateType%(%ConnectionPoint%) and %phosphateType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Test case2: Connect ${leftPhosphateConnectionPoint} to ${rightPhosphateConnectionPoint} of ${leftPhosphate.alias} and ${rightPhosphate.alias}`, async () => {
                test.setTimeout(15000);

                await loadTwoMonomers(page, leftPhosphate, rightPhosphate);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPhosphate,
                  rightPhosphate,
                  leftPhosphateConnectionPoint,
                  rightPhosphateConnectionPoint,
                );

                await zoomWithMouseWheel(page, -800);

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

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   fileName: 'KET/Peptide-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   fileName: 'KET/Peptide-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   fileName: 'KET/Peptide-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   fileName: 'KET/Peptide-Templates/15 - (R1,R2,R3,R4,R5).ket',
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

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 3 (Phosphate - Peptide)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Phosphate - Peptides )
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %peptideType% from the library (peptideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %peptideType%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %peptideType% and put them on the canvas
               *  3. Establish connection between %sphosphateType%(%ConnectionPoint%) and %peptideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case3: Cnnct ${leftPhosphateConnectionPoint} to ${rightPeptideConnectionPoint} of Ph(${leftPhosphate.alias}) and Peptide(${rightPeptide.alias})`, async () => {
                test.setTimeout(15000);

                await loadTwoMonomers(page, leftPhosphate, rightPeptide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPhosphate,
                  rightPeptide,
                  leftPhosphateConnectionPoint,
                  rightPeptideConnectionPoint,
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

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   fileName: 'KET/CHEM-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
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

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 4 (Phosphate - CHEM)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Phosphate - Peptides )
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %CHEMType% from the library (CHEMMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %CHEMType%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %CHEMType% and put them on the canvas
               *  3. Establish connection between %sphosphateType%(%ConnectionPoint%) and %CHEMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case4: Cnnct ${leftPhosphateConnectionPoint} to ${rightCHEMConnectionPoint} of Ph(${leftPhosphate.alias}) and CHEM(${rightCHEM.alias})`, async () => {
                test.setTimeout(15000);

                await loadTwoMonomers(page, leftPhosphate, rightCHEM);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPhosphate,
                  rightCHEM,
                  leftPhosphateConnectionPoint,
                  rightCHEMConnectionPoint,
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
