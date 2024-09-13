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

  async function prepareCanvasOneFreeAPLeft(
    page: Page,
    CHEM: IMonomer,
    freeCHEMConnectionPoint: string,
  ) {
    await openFileAndAddToCanvasMacro(
      tmpChemMonomers['Test-6-Ch-1'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(CHEM.fileName, page);
    const CHEMLocator = page.getByText(CHEM.alias).locator('..').first();
    await CHEMLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const CHEMConnectionPoint of Object.values(
      CHEM.connectionPoints,
    )) {
      const tmpCHEM = tmpChemMonomers[`Test-6-Ch-${CHEMConnectionPoint[1]}`];
      if (CHEMConnectionPoint !== freeCHEMConnectionPoint) {
        await bondTwoMonomersByPointToPoint(
          page,
          CHEM,
          tmpCHEM,
          CHEMConnectionPoint,
          CHEMConnectionPoint,
        );
      }
    }
  }

  async function prepareCanvasNoFreeAPLeft(page: Page, CHEM: IMonomer) {
    await openFileAndAddToCanvasMacro(
      tmpChemMonomers['Test-6-Ch-1'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(CHEM.fileName, page);
    const CHEMLocator = page.getByText(CHEM.alias).locator('..').first();
    await CHEMLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const CHEMConnectionPoint of Object.values(
      CHEM.connectionPoints,
    )) {
      const tmpCHEM = tmpChemMonomers[`Test-6-Ch-${CHEMConnectionPoint[1]}`];
      await bondTwoMonomersByPointToPoint(
        page,
        CHEM,
        tmpCHEM,
        CHEMConnectionPoint,
        CHEMConnectionPoint,
      );
    }
  }

  async function loadTwoMonomers(
    page: Page,
    leftCHEM: IMonomer,
    rightCHEM: IMonomer,
  ) {
    await openFileAndAddToCanvasMacro(leftCHEM.fileName, page);
    const leftCHEMLocator = page
      .getByText(leftCHEM.alias)
      .locator('..')
      .first();
    await leftCHEMLocator.hover();
    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightCHEM.fileName, page);
    const rightCHEMLocator =
      (await page.getByText(leftCHEM.alias).count()) > 1
        ? page.getByText(rightCHEM.alias).nth(1).locator('..').first()
        : page.getByText(rightCHEM.alias).locator('..').first();
    await rightCHEMLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 371, page);
    await moveMouseAway(page);
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftCHEM: IMonomer,
    rightCHEM: IMonomer,
    leftCHEMConnectionPoint?: string,
    rightCHEMConnectionPoint?: string,
  ) {
    const leftCHEMLocator = await page
      .getByText(leftCHEM.alias, { exact: true })
      .locator('..')
      .first();

    const rightCHEMLocator =
      (await page.getByText(rightCHEM.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightCHEM.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightCHEM.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftCHEMLocator,
      rightCHEMLocator,
      leftCHEMConnectionPoint,
      rightCHEMConnectionPoint,
    );
  }

  async function bondTwoMonomersByCenterToPoint(
    page: Page,
    leftCHEM: IMonomer,
    rightCHEM: IMonomer,
    rightCHEMConnectionPoint?: string,
  ) {
    const leftCHEMLocator = await page
      .getByText(leftCHEM.alias, { exact: true })
      .locator('..')
      .first();

    const rightCHEMLocator =
      (await page.getByText(rightCHEM.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightCHEM.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
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

  async function bondTwoMonomersByCenterToCenter(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ) {
    const leftMonomerLocator = await page
      .getByText(leftMonomer.alias, { exact: true })
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await page.getByText(rightMonomer.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightMonomer.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightMonomer.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      undefined,
      undefined,
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
                  test.setTimeout(15000);

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

  Object.values(chemMonomers).forEach((rightCHEM) => {
    Object.values(tmpChemMonomers['Test-6-Ch'].connectionPoints).forEach(
      (leftCHEMConnectionPoint) => {
        Object.values(rightCHEM.connectionPoints).forEach(
          (rightCHEMConnectionPoint) => {
            /*
             *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 2
             *  Description: If there is only one free attachment point (R1…Rn), a bond is created by default
             *               using only one existing possibility to connect to another monomer (no modal window appears).
             *   For each %CHEMSType% from chemMonomers:
             *     For each %MonomerConnection% (avaliable connections of monomer)
             *       left it unoccupied and occupy the rest
             *       For each %Test-6-Ch-ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
             *         Establish connection between Test-6-Ch(%ConnectionPoint%) and %CHEMSType%(%MonomerConnection%)
             *         Validate canvas
             */
            test(`Case 2: Connect ${leftCHEMConnectionPoint} to ${rightCHEMConnectionPoint} of Test-6-Ch and ${rightCHEM.alias}`, async () => {
              test.setTimeout(20000);

              await prepareCanvasOneFreeAPLeft(
                page,
                rightCHEM,
                rightCHEMConnectionPoint,
              );

              await bondTwoMonomersByPointToPoint(
                page,
                tmpChemMonomers['Test-6-Ch'],
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
          },
        );
      },
    );
  });

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
          test.setTimeout(20000);

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

  Object.values(chemMonomers).forEach((rightCHEM) => {
    Object.values(tmpChemMonomers['Test-6-Ch'].connectionPoints).forEach(
      (leftCHEMConnectionPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 4
         *  Description: If selected attachment point is occupied, no bond is created, and warning message appears.
         *   For each %CHEMSType% from chemMonomers:
         *     For each %MonomerConnection% (avaliable connections of monomer)
         *       occupy all connections
         *       For each %ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
         *         Establish connection between Test-6-P(%ConnectionPoint%) and %CHEMSType%(center)
         *         Validate canvas (No connection established)
         */
        test(`Case 4: Connect ${leftCHEMConnectionPoint} to Center of Test-6-Ch and ${rightCHEM.alias}`, async () => {
          test.setTimeout(20000);

          await prepareCanvasNoFreeAPLeft(page, rightCHEM);

          await bondTwoMonomersByPointToPoint(
            page,
            tmpChemMonomers['Test-6-Ch'],
            rightCHEM,
            leftCHEMConnectionPoint,
          );
          await zoomWithMouseWheel(page, -600);

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });
        });
      },
    );
  });

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftCHEM.connectionPoints).forEach(
        (leftCHEMConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 1
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( CHEM )
               * For each %chemType% from the library (chemMonomers)
               *   For each %chemType2% from the library (chemMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %chemType2%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %chemType2% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %chemType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Test case5: Connect ${leftCHEMConnectionPoint} to ${rightCHEMConnectionPoint} of  CHEMS(${leftCHEM.alias}) and  CHEMS(${rightCHEM.alias})`, async () => {
                test.setTimeout(20000);

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
            },
          );
        },
      );
    });
  });

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: 'peptide',
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
    //   monomerType: 'peptide',
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
    //   monomerType: 'peptide',
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
    //   monomerType: 'peptide',
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

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftCHEM.connectionPoints).forEach(
        (leftCHEMConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 2
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( CHEM - Peptides )
               * For each %chemType% from the library (chemMonomers)
               *   For each %peptideType% from the library (peptideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %peptideType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %peptideType% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %peptideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Test case6: Connect ${leftCHEMConnectionPoint} to ${rightPeptideConnectionPoint} of CHEM(${leftCHEM.alias}) and Peptide(${rightPeptide.alias})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftCHEM, rightPeptide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftCHEM,
                  rightPeptide,
                  leftCHEMConnectionPoint,
                  rightPeptideConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);

                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page, {
                  masks: [page.getByTestId('polymer-library-preview')],
                });
              });
            },
          );
        },
      );
    });
  });

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 1
       *  Description: User can connect any CHEM to any CHEM using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      test(`Case 7: Connect Center to Center of CHEM(${leftCHEM.alias}) and CHEM(${rightCHEM.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftCHEM, rightCHEM);

        await bondTwoMonomersByCenterToCenter(page, leftCHEM, rightCHEM);

        await zoomWithMouseWheel(page, -600);

        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });
      });
    });
  });

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 2
       *  Description: User can connect any CHEM to any Peptide using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      test(`Case 8: Connect Center to Center of CHEM(${leftCHEM.alias}) and Peptide(${rightPeptide.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftCHEM, rightPeptide);

        await bondTwoMonomersByCenterToCenter(page, leftCHEM, rightPeptide);

        await zoomWithMouseWheel(page, -600);

        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });
      });
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/07 - (R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/09 - (R1,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/10 - (R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/11 - (R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/12 - (R1,R2,R3,R4).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4,R5)': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/15 - (R1,R2,R3,R4,R5).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
  };

  let ordinaryMoleculeName: string;

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftCHEM.connectionPoints).forEach(
        (leftCHEMConnectionPoint) => {
          Object.values(rightOM.connectionPoints).forEach(
            (rightOMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 1
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( CHEM - Ordinary Molecule )
               * For each %chemType% from the library (chemMonomers)
               *   For each %OMType% from the library (ordinaryMoleculeMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %OMType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %OMType% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %OMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              ordinaryMoleculeName = rightOM.fileName.substring(
                rightOM.fileName.indexOf(' - '),
                rightOM.fileName.lastIndexOf('.ket'),
              );
              test(`Test case9: Connect ${leftCHEMConnectionPoint} to ${rightOMConnectionPoint} of CHEM(${leftCHEM.alias}) and OM(${ordinaryMoleculeName})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftCHEM, rightOM);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftCHEM,
                  rightOM,
                  leftCHEMConnectionPoint,
                  rightOMConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);
                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page, {
                  masks: [page.getByTestId('polymer-library-preview')],
                });
              });
            },
          );
        },
      );
    });
  });

  Object.values(chemMonomers).forEach((leftCHEM) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 6
       *  Description: User can connect any CHEM to any OrdinaryMolecule using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      ordinaryMoleculeName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 10: Connect Center to Center of CHEM(${leftCHEM.alias}) and OrdinaryMolecule(${ordinaryMoleculeName})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftCHEM, rightOrdinaryMolecule);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftCHEM,
          rightOrdinaryMolecule,
        );

        await zoomWithMouseWheel(page, -600);

        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });
      });
    });
  });
});
