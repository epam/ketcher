/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForPageInit,
  resetZoomLevelToDefault,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import {
  bondMonomerPointToMoleculeAtom,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for peptides: ', () => {
  let page: Page;
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.afterEach(async () => {
    await page.keyboard.press('Escape');
    await resetZoomLevelToDefault(page);
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  interface IMolecule {
    moleculeType: string;
    fileName: string;
    alias: string;
    atomLocatorSelectors: string[];
    connectionPointShifts: { x: number; y: number }[];
  }

  const molecules: { [moleculeName: string]: IMolecule } = {
    'Benzene ring': {
      moleculeType: 'Molecule',
      fileName: 'KET/Molecule-Templates/1 - Benzene ring.ket',
      alias: 'Benzene ring',
      atomLocatorSelectors: [
        'g > circle',
        'g:nth-child(2) > circle',
        'g:nth-child(3) > circle',
        'g:nth-child(4) > circle',
        'g:nth-child(5) > circle',
        'g:nth-child(6) > circle',
      ],
      connectionPointShifts: [
        { x: 0, y: 2 },
        { x: -2, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: -2 },
        { x: 2, y: -2 },
        { x: -2, y: -2 },
      ],
    },
  };

  interface IMonomer {
    monomerType: string;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

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
    J: {
      monomerType: 'peptide',
      fileName:
        'KET/Peptide-Templates/16 - J - ambiguous alternatives from library (R1,R2).ket',
      alias: 'J',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '%': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Base-Templates/17 - J - ambiguous mixed (R1,R2).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //   },
    // },
  };

  const tmpPeptideMonomers: { [monomerName: string]: IMonomer } = {
    'Test-6-P-x': {
      monomerType: 'peptide',
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
      monomerType: 'peptide',
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
      monomerType: 'peptide',
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
      monomerType: 'peptide',
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
      monomerType: 'peptide',
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
      monomerType: 'peptide',
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

  async function hoverOverConnectionLine(page: Page) {
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();
  }

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
    const leftMonomerLocator = page
      .getByTestId('ketcher-canvas')
      .locator(`text=${leftMonomer.alias}`)
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await page
        .getByTestId('ketcher-canvas')
        .locator(`text=${leftMonomer.alias}`)
        .count()) > 1
        ? page
            .getByTestId('ketcher-canvas')
            .locator(`text=${rightMonomer.alias}`)
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByTestId('ketcher-canvas')
            .locator(`text=${rightMonomer.alias}`)
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
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ) {
    const leftMonomerLocator = page
      .getByTestId('ketcher-canvas')
      .locator(`text=${leftMonomer.alias}`)
      .locator('..')
      .first();

    const rightMonomerLocator =
      (await page
        .getByTestId('ketcher-canvas')
        .locator(`text=${leftMonomer.alias}`)
        .count()) > 1
        ? page
            .getByTestId('ketcher-canvas')
            .locator(`text=${rightMonomer.alias}`)
            .nth(1)
            .locator('..')
            .first()
        : page
            .getByTestId('ketcher-canvas')
            .locator(`text=${rightMonomer.alias}`)
            .locator('..')
            .first();

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
          test.setTimeout(40000);

          await loadTwoMonomers(page, leftPeptide, rightPeptide);

          await bondTwoMonomersByCenterToCenter(
            page,
            leftPeptide,
            rightPeptide,
          );

          await zoomWithMouseWheel(page, -600);

          await hoverOverConnectionLine(page);

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });
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
                  test.setTimeout(35000);

                  await loadTwoMonomers(page, leftPeptide, rightPeptide);

                  await bondTwoMonomersByPointToPoint(
                    page,
                    leftPeptide,
                    rightPeptide,
                    leftPeptideConnectionPoint,
                    rightPeptideConnectionPoint,
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
              test.setTimeout(30000);

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

  //                 await takeEditorScreenshot(page, {
  //         masks: [page.getByTestId('polymer-library-preview')],
  //       });

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
  //
  //         await hoverOverConnectionLine(page);
  //
  //                 await takeEditorScreenshot(page, {
  //         masks: [page.getByTestId('polymer-library-preview')],
  //       });
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

  //                   await takeEditorScreenshot(page, {
  //         masks: [page.getByTestId('polymer-library-preview')],
  //       });

  //           if (await page.getByRole('dialog').isVisible()) {
  //             await page.getByTitle('R1').first().click();
  //             await page.getByTitle('Connect').first().click();
  //           }

  //           await zoomWithMouseWheel(page, -600);

  //           await hoverOverConnectionLine(page);

  //                   await takeEditorScreenshot(page, {
  //         masks: [page.getByTestId('polymer-library-preview')],
  //       });
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
          test.setTimeout(30000);

          await prepareCanvasNoFreeAPLeft(page, rightPeptide);

          await bondTwoMonomersByPointToCenter(
            page,
            tmpPeptideMonomers['Test-6-P-x'],
            rightPeptide,
            leftPeptideConnectionPoint,
          );
          await zoomWithMouseWheel(page, -600);

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });
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
          test.setTimeout(30000);

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

          await hoverOverConnectionLine(page);

          await takeEditorScreenshot(page, {
            masks: [page.getByTestId('polymer-library-preview')],
          });
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
                test.setTimeout(25000);

                await loadTwoMonomers(page, leftPeptide, rightPeptide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPeptide,
                  rightPeptide,
                  leftPeptideConnectionPoint,
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
      test.setTimeout(20000);

      await prepareCanvasNoFreeAPLeft(page, rightPeptide);

      await bondTwoMonomersByCenterToCenter(
        page,
        tmpPeptideMonomers['Test-6-P-x'],
        rightPeptide,
      );
      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page, {
        masks: [page.getByTestId('polymer-library-preview')],
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

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftPeptide.connectionPoints).forEach(
        (leftPeptideConnectionPoint) => {
          Object.values(rightOM.connectionPoints).forEach(
            (rightOMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 2
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Peptide - Ordinary Molecule )
               * For each %chemType% from the library (peptideMonomers)
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
              test(`Test case9: Connect ${leftPeptideConnectionPoint} to ${rightOMConnectionPoint} of Peptide(${leftPeptide.alias}) and OM(${ordinaryMoleculeName})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftPeptide, rightOM);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftPeptide,
                  rightOM,
                  leftPeptideConnectionPoint,
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

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 7
       *  Description: User can connect any Peptide to any OrdinaryMolecule using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      ordinaryMoleculeName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 10: Connect Center to Center of Peptide(${leftPeptide.alias}) and OrdinaryMolecule(${ordinaryMoleculeName})`, async () => {
        test.setTimeout(30000);

        await loadTwoMonomers(page, leftPeptide, rightOrdinaryMolecule);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftPeptide,
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

  async function loadMonomer(page: Page, leftMonomer: IMonomer) {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    const canvasLocator = page.getByTestId('ketcher-canvas').first();
    const leftMonomerLocator = canvasLocator
      .locator(`text=${leftMonomer.alias}`)
      .locator('..')
      .first();
    await leftMonomerLocator.hover();
    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(molecule.fileName, page);
    await moveMouseAway(page);
  }

  async function bondMonomerCenterToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    atomIndex: number,
  ) {
    const leftPeptideLocator = page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightMoleculeLocator = page
      .getByTestId('ketcher-canvas')
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      undefined,
      rightMolecule.connectionPointShifts[atomIndex],
    );
  }

  async function bondMonomerPointToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    attachmentPoint: string,
    atomIndex: number,
  ) {
    const leftPeptideLocator = page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightMoleculeLocator = page
      .getByTestId('ketcher-canvas')
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      attachmentPoint,
      rightMolecule.connectionPointShifts[atomIndex],
    );
  }

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Monomer center to molecule atom connection
       *  Step: 1. Load monomer (peptide) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag center of monomer to first (0th) atom of molecule
       *        Expected result: No connection should be establiched
       *  WARNING: That test tesults are wrong because of bug: https://github.com/epam/ketcher/issues/5976
       *  Screenshots must be updated after fix and fixme should be removed
       */

      test(`Case 11: Connect Center of Peptide(${leftPeptide.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftPeptide);
        await loadMolecule(page, rightMolecule);

        await bondMonomerCenterToAtom(page, leftPeptide, rightMolecule, 0);

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });

        test.fixme(
          // eslint-disable-next-line no-self-compare
          true === true,
          `That test results are wrong because of https://github.com/epam/ketcher/issues/5976 issue(s).`,
        );
      });
    });
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Connect monomer all commection points to moleule atoms
       *  Step: 1. Load monomer (peptide) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag every connection point of monomer to any free atom of molecule
       *        Expected result: Connection should be established
       */

      test(`Case 12: Connect evey connection point of Peptide(${leftPeptide.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftPeptide);
        await loadMolecule(page, rightMolecule);

        const attachmentPointCount = Object.keys(
          leftPeptide.connectionPoints,
        ).length;
        const atomCount = Object.keys(
          rightMolecule.atomLocatorSelectors,
        ).length;

        for (
          let atomIndex = 0;
          atomIndex < Math.min(attachmentPointCount, atomCount);
          atomIndex++
        ) {
          await bondMonomerPointToAtom(
            page,
            leftPeptide,
            rightMolecule,
            Object.keys(leftPeptide.connectionPoints)[atomIndex],
            atomIndex,
          );
        }

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });
      });
    });
  });
});
