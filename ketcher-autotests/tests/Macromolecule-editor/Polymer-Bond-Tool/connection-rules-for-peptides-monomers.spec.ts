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

test.describe('Connection rules for peptides: ', () => {
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

  const tmpPeptideMonomers: { [monomerName: string]: IMonomer } = {
    'Test-6-P-x': {
      fileName: 'KET/Peptide-Templates/Test-6-P-x.ket',
      alias: 'Test-6-P-x',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
    'Test-6-P-1': {
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-P-2': {
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-2',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-P-3': {
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-3',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-P-4': {
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-4',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-P-5': {
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-5',
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
    peptide: IMonomer,
    freePeptideConnectionPoint: string,
  ) {
    await openFileAndAddToCanvasMacro(
      tmpPeptideMonomers['Test-6-P-1'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(peptide.fileName, page);
    const peptideLocator = page.getByText(peptide.alias).locator('..').first();
    await peptideLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const peptideConnectionPoint of Object.values(
      peptide.connectionPoints,
    )) {
      const tmpPeptide =
        tmpPeptideMonomers[`Test-6-P-${peptideConnectionPoint[1]}`];
      if (peptideConnectionPoint !== freePeptideConnectionPoint) {
        await bondTwoMonomersByPointToPoint(
          page,
          peptide,
          tmpPeptide,
          peptideConnectionPoint,
          peptideConnectionPoint,
        );
      }
    }
  }

  async function prepareCanvasNoFreeAPLeft(page: Page, peptide: IMonomer) {
    await openFileAndAddToCanvasMacro(
      tmpPeptideMonomers['Test-6-P-1'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(peptide.fileName, page);
    const peptideLocator = page.getByText(peptide.alias).locator('..').first();
    await peptideLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const peptideConnectionPoint of Object.values(
      peptide.connectionPoints,
    )) {
      const tmppeptide =
        tmpPeptideMonomers[`Test-6-P-${peptideConnectionPoint[1]}`];
      await bondTwoMonomersByPointToPoint(
        page,
        peptide,
        tmppeptide,
        peptideConnectionPoint,
        peptideConnectionPoint,
      );
    }
  }

  // async function prepareCanvasNoR1R2APLeft(page: Page, peptide: IMonomer) {
  //   await openFileAndAddToCanvasMacro(
  //     tmpPeptideMonomers['Test-6-P-1'].fileName,
  //     page,
  //   );

  //   await openFileAndAddToCanvasMacro(peptide.fileName, page);
  //   const peptideLocator = page.getByText(peptide.alias).locator('..').first();
  //   await peptideLocator.hover();
  //   await dragMouseTo(550, 370, page);
  //   await moveMouseAway(page);

  //   for await (const peptideConnectionPoint of Object.values(['R1', 'R2'])) {
  //     if (peptideConnectionPoint in peptide.connectionPoints) {
  //       const tmppeptide =
  //         tmpPeptideMonomers[`Test-6-P-${peptideConnectionPoint[1]}`];
  //       await bondTwoMonomersByPointToPoint(
  //         page,
  //         peptide,
  //         tmppeptide,
  //         peptideConnectionPoint,
  //         peptideConnectionPoint,
  //       );
  //     }
  //   }
  // }

  async function loadTwoMonomers(
    page: Page,
    leftPeptide: IMonomer,
    rightPeptide: IMonomer,
  ) {
    await openFileAndAddToCanvasMacro(leftPeptide.fileName, page);
    const leftpeptideLocator = page
      .getByText(leftPeptide.alias)
      .locator('..')
      .first();
    await leftpeptideLocator.hover();
    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightPeptide.fileName, page);
    const rightpeptideLocator =
      (await page.getByText(leftPeptide.alias).count()) > 1
        ? page.getByText(rightPeptide.alias).nth(1).locator('..').first()
        : page.getByText(rightPeptide.alias).locator('..').first();
    await rightpeptideLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 371, page);
    await moveMouseAway(page);
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftPeptide: IMonomer,
    rightPeptide: IMonomer,
    leftPeptideConnectionPoint?: string,
    rightPeptideConnectionPoint?: string,
  ) {
    const leftPeptideLocator = await page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightPeptideLocator =
      (await page.getByText(rightPeptide.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightPeptide.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightPeptide.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftPeptideLocator,
      rightPeptideLocator,
      leftPeptideConnectionPoint,
      rightPeptideConnectionPoint,
    );
  }

  async function bondTwoMonomersByPointToCenter(
    page: Page,
    leftPeptide: IMonomer,
    rightPeptide: IMonomer,
    leftPeptideConnectionPoint?: string,
  ) {
    const leftPeptideLocator = await page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightPeptideLocator =
      (await page.getByText(rightPeptide.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightPeptide.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightPeptide.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftPeptideLocator,
      rightPeptideLocator,
      leftPeptideConnectionPoint,
      undefined,
    );
  }

  async function bondTwoMonomersByCenterToPoint(
    page: Page,
    leftpeptide: IMonomer,
    rightpeptide: IMonomer,
    rightpeptideConnectionPoint?: string,
  ) {
    const leftpeptideLocator = await page
      .getByText(leftpeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightpeptideLocator =
      (await page.getByText(rightpeptide.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightpeptide.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightpeptide.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftpeptideLocator,
      rightpeptideLocator,
      undefined,
      rightpeptideConnectionPoint,
    );
  }

  async function bondTwoMonomersByCenterToCenter(
    page: Page,
    leftPeptide: IMonomer,
    rightPeptide: IMonomer,
  ) {
    const leftPeptideLocator = await page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightPeptideLocator =
      (await page.getByText(rightPeptide.alias, { exact: true }).count()) > 1
        ? page
            .getByText(rightPeptide.alias, { exact: true })
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByText(rightPeptide.alias, { exact: true })
            .locator('..')
            .first();

    await bondTwoMonomersPointToPoint(
      page,
      leftPeptideLocator,
      rightPeptideLocator,
      undefined,
      undefined,
    );
  }

  // test(`temporary test for debug purposes`, async () => {
  //   await prepareCanvasOneFreeAPLeft(
  //     page,
  //     peptideMonomers['(R1,R2,R3,R4,R5)'],
  //     peptideMonomers['(R1,R2,R3,R4,R5)'],
  //     'R1',
  //     'R5',
  //   );
  // });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 1
       *  Description: A default bond between 2 monomers is created using R2 of first monomer and R1 of the second monomer.
       */
      if (
        Object.values(leftPeptide.connectionPoints).includes('R2') &&
        Object.values(rightPeptide.connectionPoints).includes('R1')
      ) {
        test(`Case 1: Connect Center to Center of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
          test.setTimeout(15000);

          await loadTwoMonomers(page, leftPeptide, rightPeptide);

          await bondTwoMonomersByCenterToCenter(
            page,
            leftPeptide,
            rightPeptide,
          );

          await zoomWithMouseWheel(page, -600);

          const bondLine = page.locator('g[pointer-events="stroke"]').first();
          await bondLine.hover();
          await takeEditorScreenshot(page);
        });
      }
    });
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPeptide.connectionPoints).forEach(
        (leftPeptideConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              if (leftPeptideConnectionPoint === rightPeptideConnectionPoint) {
                /*
                 *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 2
                 *  Description: If a user tries to connect 2 monomers that have only identical free attachment
                 *               points (for example, R1 and R1 or R2 and R2), a bond is created, and a message occurs.
                 */
                test(`Case 2: Connect ${leftPeptideConnectionPoint} to ${rightPeptideConnectionPoint} of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
                  test.setTimeout(10000);

                  await loadTwoMonomers(page, leftPeptide, rightPeptide);

                  await bondTwoMonomersByPointToPoint(
                    page,
                    leftPeptide,
                    rightPeptide,
                    leftPeptideConnectionPoint,
                    rightPeptideConnectionPoint,
                  );

                  await zoomWithMouseWheel(page, -600);

                  const bondLine = page
                    .locator('g[pointer-events="stroke"]')
                    .first();
                  await bondLine.hover();
                  await takeEditorScreenshot(page);
                });
              }
            },
          );
        },
      );
    });
  });

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].connectionPoints).forEach(
      (leftPeptideConnectionPoint) => {
        Object.values(rightPeptide.connectionPoints).forEach(
          (rightPeptideConnectionPoint) => {
            /*
             *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 3
             *  Description: If there is only one free attachment point (R1…Rn), a bond is created by default
             *               using only one existing possibility to connect to another monomer (no modal window appears).
             *   For each %peptideSType% from peptideMonomers:
             *     For each %MonomerConnection% (avaliable connections of monomer)
             *       left it unoccupied and occupy the rest
             *       For each %Test-6-Ch-ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
             *         Establish connection between Test-6-Ch(%ConnectionPoint%) and %peptideSType%(%MonomerConnection%)
             *         Validate canvas
             */
            test(`Case 3: Connect ${leftPeptideConnectionPoint} to ${rightPeptideConnectionPoint} of Test-6-P and ${rightPeptide.alias}`, async () => {
              test.setTimeout(15000);

              await prepareCanvasOneFreeAPLeft(
                page,
                rightPeptide,
                rightPeptideConnectionPoint,
              );

              await bondTwoMonomersByPointToPoint(
                page,
                tmpPeptideMonomers['Test-6-P-x'],
                rightPeptide,
                leftPeptideConnectionPoint,
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

  // const selectedPeptides = [
  //   peptideMonomers['(R3,R4)'],
  //   peptideMonomers['(R1,R3,R4)'],
  //   peptideMonomers['(R2,R3,R4)'],
  //   peptideMonomers['(R3,R4,R5)'],
  //   peptideMonomers['(R1,R2,R3,R4)'],
  //   peptideMonomers['(R1,R3,R4,R5)'],
  //   peptideMonomers['(R2,R3,R4,R5)'],
  //   peptideMonomers['(R1,R2,R3,R4,R5)'],
  // ];

  // Object.values(selectedPeptides).forEach((rightPeptide) => {
  //   Object.values(tmpPeptideMonomers['Test-6-P-x'].connectionPoints).forEach(
  //     (leftPeptideConnectionPoint) => {
  //       /*
  //        *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 4.1 (point to point case)
  //        *  Description: If default connection is not possible (R1 and R2 are occupied), and there is more than 1 free AP,
  //        *               modal window appears where user can choose between other possibilities of APs (R3...Rn).
  //        *   For each %peptideSType% from ((R3,R4), (R1,R3,R4), (R2,R3,R4), (R3,R4,R5), (R1,R2,R3,R4), (R1,R3,R4,R5), (R2,R3,R4,R5), (R1,R2,R3,R4,R5)):
  //        *     For each %Test-6-Ch-ConnectionPoint% of Test-6-Ch from (R1, R2, R3, R4, R5)
  //        *       Establish connection between Test-6-P(%ConnectionPoint%) and %peptideType%(%MonomerConnection%)
  //        *       Validate canvas (Dialog should appear)
  //        *       Select any free AP and click Connect (connection should appear)
  //        */
  //       test(`Case 4.1: Connect ${leftPeptideConnectionPoint} to Center of Test-6-P and ${rightPeptide.alias}`, async () => {
  //         test.setTimeout(15000);

  //         await prepareCanvasNoR1R2APLeft(page, rightPeptide);

  //         await bondTwoMonomersByPointToCenter(
  //           page,
  //           tmpPeptideMonomers['Test-6-P-x'],
  //           rightPeptide,
  //           leftPeptideConnectionPoint,
  //         );

  //         await takeEditorScreenshot(page);

  //         const targetConnectionPoint = Object.keys(
  //           rightPeptide.connectionPoints,
  //         )[Object.keys(rightPeptide.connectionPoints).length - 1];
  //         if (await page.getByRole('dialog').isVisible()) {
  //           if ((await page.getByTitle(targetConnectionPoint).count()) > 1) {
  //             await page.getByTitle(targetConnectionPoint).nth(1).click();
  //           } else {
  //             await page.getByTitle(targetConnectionPoint).first().click();
  //           }
  //           await page.getByTitle('Connect').first().click();
  //         }

  //         await zoomWithMouseWheel(page, -600);

  //         const bondLine = page.locator('g[pointer-events="stroke"]').first();
  //         await bondLine.hover();

  //         await takeEditorScreenshot(page);
  //       });
  //     },
  //   );
  // });

  // Object.values(selectedPeptides).forEach((rightPeptide) => {
  //   Object.values(rightPeptide.connectionPoints).forEach(
  //     (rightPeptideConnectionPoint) => {
  //       /*
  //        *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 4.2 (center to point case)
  //        *  Description: If default connection is not possible (R1 and R2 are occupied), and there is more than 1 free AP,
  //        *               modal window appears where user can choose between other possibilities of APs (R3...Rn).
  //        *   For each %peptideSType% from ((R3,R4), (R1,R3,R4), (R2,R3,R4), (R3,R4,R5), (R1,R2,R3,R4), (R1,R3,R4,R5), (R2,R3,R4,R5), (R1,R2,R3,R4,R5)):
  //        *     For each %Test-6-Ch-ConnectionPoint% of Test-6-Ch from (R1, R2, R3, R4, R5)
  //        *       Establish connection between Test-6-P(Center) and %peptideType%(%MonomerConnection%)
  //        *       Validate canvas (Dialog should appear)
  //        *       Select any free AP and click Connect (connection should appear)
  //        */
  //       if (
  //         !(
  //           rightPeptideConnectionPoint === 'R1' ||
  //           rightPeptideConnectionPoint === 'R2'
  //         )
  //       ) {
  //         test(`Case 4.2: Connect Center to ${rightPeptideConnectionPoint} of Test-6-P and ${rightPeptide.alias}`, async () => {
  //           test.setTimeout(15000);

  //           await prepareCanvasNoR1R2APLeft(page, rightPeptide);

  //           await bondTwoMonomersByCenterToPoint(
  //             page,
  //             tmpPeptideMonomers['Test-6-P-x'],
  //             rightPeptide,
  //             rightPeptideConnectionPoint,
  //           );

  //           await takeEditorScreenshot(page);

  //           if (await page.getByRole('dialog').isVisible()) {
  //             await page.getByTitle('R1').first().click();
  //             await page.getByTitle('Connect').first().click();
  //           }

  //           await zoomWithMouseWheel(page, -600);

  //           const bondLine = page.locator('g[pointer-events="stroke"]').first();
  //           await bondLine.hover();

  //           await takeEditorScreenshot(page);
  //         });
  //       }
  //     },
  //   );
  // });

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].connectionPoints).forEach(
      (leftPeptideConnectionPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 5
         *  Description: If a user tries to connect a monomer to the monomer that does not have any free attachment point, no bond is created, and a message occurs.
         *                (point to center case)
         *   For each %peptideSType% from peptideMonomers:
         *     For each %MonomerConnection% (avaliable connections of monomer)
         *       occupy all connections
         *       For each %ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
         *         Establish connection between Test-6-P(%ConnectionPoint%) and %peptideSType%(center)
         *         Validate canvas (No connection established)
         */
        test(`Case 5: Connect ${leftPeptideConnectionPoint} to Center of Test-6-P and ${rightPeptide.alias}`, async () => {
          test.setTimeout(15000);

          await prepareCanvasNoFreeAPLeft(page, rightPeptide);

          await bondTwoMonomersByPointToCenter(
            page,
            tmpPeptideMonomers['Test-6-P-x'],
            rightPeptide,
            leftPeptideConnectionPoint,
          );
          await zoomWithMouseWheel(page, -600);

          await takeEditorScreenshot(page);
        });
      },
    );
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].connectionPoints).forEach(
      (rightPeptideConnectionPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 6
         *  Description: User drags a bond from the center of the first monomer to the specific AP of the second monomer.
         *                By default, if it is not R2-R1 or R1-R2 than - connection dialog should appear.
         *   For each %peptideSType% from peptideMonomers (that have R2 avaliable):
         *     For each %ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
         *         Establish connection between %peptideType%(center) and Test-6-P(%Test-6-P-ConnectionPoint%)
         *         Validate canvas (Connection should be established)
         */

        test(`Case 6: Connect Center to ${rightPeptideConnectionPoint} of ${leftPeptide.alias} and Test-6-P`, async () => {
          test.setTimeout(15000);

          await loadTwoMonomers(
            page,
            leftPeptide,
            tmpPeptideMonomers['Test-6-P-x'],
          );

          await bondTwoMonomersByCenterToPoint(
            page,
            leftPeptide,
            tmpPeptideMonomers['Test-6-P-x'],
            rightPeptideConnectionPoint,
          );

          if (
            !(
              (Object.values(leftPeptide.connectionPoints).includes('R1') &&
                rightPeptideConnectionPoint === 'R2') ||
              (Object.values(leftPeptide.connectionPoints).includes('R2') &&
                rightPeptideConnectionPoint === 'R1')
            )
          ) {
            if (Object.values(leftPeptide.connectionPoints).length > 1) {
              const targetConnectionPoint = Object.keys(
                leftPeptide.connectionPoints,
              )[0];
              if (await page.getByRole('dialog').isVisible()) {
                await page.getByTitle(targetConnectionPoint).first().click();
                await page.getByTitle('Connect').first().click();
              }
            }
          }

          await zoomWithMouseWheel(page, -600);

          const bondLine = page.locator('g[pointer-events="stroke"]').first();
          await bondLine.hover();

          await takeEditorScreenshot(page);
        });
      },
    );
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPeptide.connectionPoints).forEach(
        (leftPeptideConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 7
               *  Description: User clicks on the specific AP of the first monomer and drags a bond to the specific AP of the second monomer.
               */
              test(`Case 7: Connect ${leftPeptideConnectionPoint} to ${rightPeptideConnectionPoint} of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
                test.setTimeout(10000);

                await loadTwoMonomers(page, leftPeptide, rightPeptide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPeptide,
                  rightPeptide,
                  leftPeptideConnectionPoint,
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

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 8
     *  Description: If selected attachment point is occupied, no bond is created, and warning message appears (center to center case).
     *   For each %peptideSType% from peptideMonomers:
     *     For each %MonomerConnection% (avaliable connections of monomer)
     *       left it unoccupied and occupy the rest
     *       For each %Test-6-Ch-ConnectionPoint% of Test-6-P from (R1, R2, R3, R4, R5)
     *         Establish connection between Test-6-P(center) and %peptideSType%(center)
     *         Validate canvas (No connection established)
     */
    test(`Case 8: Connect Center to Center of Test-6-P and ${rightPeptide.alias}`, async () => {
      test.setTimeout(15000);

      await prepareCanvasNoFreeAPLeft(page, rightPeptide);

      await bondTwoMonomersByCenterToCenter(
        page,
        tmpPeptideMonomers['Test-6-P-x'],
        rightPeptide,
      );
      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page);
    });
  });
});
