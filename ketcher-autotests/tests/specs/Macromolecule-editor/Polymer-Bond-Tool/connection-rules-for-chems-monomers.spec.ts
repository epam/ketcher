/* eslint-disable no-magic-numbers */
import { Locator, Page, test, expect } from '@playwright/test';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  resetZoomLevelToDefault,
  MonomerType,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  bondMonomerPointToMoleculeAtom,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for chems: ', () => {
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
    await resetZoomLevelToDefault(page);
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  interface IMonomer {
    monomerType: MonomerType;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.CHEM,
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
    //   monomerType: MonomerType.CHEM,
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
    //   monomerType: MonomerType.CHEM,
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
    //   monomerType: MonomerType.CHEM,
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
      monomerType: MonomerType.CHEM,
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
    'Test-6-Ch-Main': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/chem-connection-rules-cases-template.ket',
      alias: 'Test-6-Ch',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
        R6: 'R6',
      },
    },
    'Test-6-Ch-1': {
      monomerType: MonomerType.CHEM,
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
      monomerType: MonomerType.CHEM,
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
      monomerType: MonomerType.CHEM,
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
      monomerType: MonomerType.CHEM,
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
      monomerType: MonomerType.CHEM,
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
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(
      tmpChemMonomers['Test-6-Ch-Main'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(CHEM.fileName, page);
    const CHEMLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
    }).first();
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

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: tmpChemMonomers['Test-6-Ch-Main'].alias,
      monomerType: tmpChemMonomers['Test-6-Ch-Main'].monomerType,
    }).first();
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
      monomerType: CHEM.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  async function prepareCanvasNoFreeAPLeft(
    page: Page,
    CHEM: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(
      tmpChemMonomers['Test-6-Ch-Main'].fileName,
      page,
    );

    await openFileAndAddToCanvasMacro(CHEM.fileName, page);
    const CHEMLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
    }).first();
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

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: tmpChemMonomers['Test-6-Ch-Main'].alias,
      monomerType: tmpChemMonomers['Test-6-Ch-Main'].monomerType,
    }).first();
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
      monomerType: CHEM.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  async function loadTwoMonomers(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
      monomerType: leftMonomer.monomerType,
    }).first();

    await leftMonomerLocator.hover({ force: true });

    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightMonomer.fileName, page);
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
      monomerType: rightMonomer.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    await rightMonomerLocator.hover({ force: true });
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 375, page);
    await moveMouseAway(page);

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
    leftMonomersConnectionPoint?: string,
    rightMonomersConnectionPoint?: string,
  ) {
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    }).first();

    const rightMonomerLocator = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
    }).first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      leftMonomersConnectionPoint,
      rightMonomersConnectionPoint,
    );
  }

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
                  test.setTimeout(30000);

                  const {
                    leftMonomer: leftMonomerLocator,
                    rightMonomer: rightMonomerLocator,
                  } = await loadTwoMonomers(page, leftCHEM, rightCHEM);

                  const bondLine = await bondTwoMonomersPointToPoint(
                    page,
                    leftMonomerLocator,
                    rightMonomerLocator,
                    leftCHEMConnectionPoint,
                    rightCHEMConnectionPoint,
                  );

                  await expect(bondLine).toBeVisible();
                  const errorMessage = page
                    .getByTestId('error-tooltip')
                    .first();
                  await expect(errorMessage).toContainText(
                    'You have connected monomers with attachment points of the same group',
                  );
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
              test.setTimeout(35000);

              const {
                leftMonomer: leftMonomerLocator,
                rightMonomer: rightMonomerLocator,
              } = await prepareCanvasOneFreeAPLeft(
                page,
                rightCHEM,
                rightCHEMConnectionPoint,
              );

              const bondLine = await bondTwoMonomersPointToPoint(
                page,
                leftMonomerLocator,
                rightMonomerLocator,
                leftCHEMConnectionPoint,
                rightCHEMConnectionPoint,
              );
              await expect(bondLine).toBeVisible();
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
          test.setTimeout(30000);

          const {
            leftMonomer: leftMonomerLocator,
            rightMonomer: rightMonomerLocator,
          } = await loadTwoMonomers(
            page,
            tmpChemMonomers['Test-6-Ch'],
            rightCHEM,
          );

          const bondLine = await bondTwoMonomersPointToPoint(
            page,
            leftMonomerLocator,
            rightMonomerLocator,
            undefined,
            rightCHEMConnectionPoint,
            undefined,
            true,
          );
          await expect(bondLine).toBeVisible();
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
          test.setTimeout(35000);

          const {
            leftMonomer: leftMonomerLocator,
            rightMonomer: rightMonomerLocator,
          } = await prepareCanvasNoFreeAPLeft(page, rightCHEM);

          const bondLine = await bondTwoMonomersPointToPoint(
            page,
            leftMonomerLocator,
            rightMonomerLocator,
            leftCHEMConnectionPoint,
          );
          await expect(bondLine).toBeHidden();
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
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftCHEM, rightCHEM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftCHEMConnectionPoint,
                  rightCHEMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/16 - J - ambiguous alternatives from library (R1,R2).ket',
      alias: 'J',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '%': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Base-Templates/17 - J - ambiguous mixed (R1,R2).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
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
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftCHEM, rightPeptide);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftCHEMConnectionPoint,
                  rightPeptideConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
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
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftCHEM, rightCHEM);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
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
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftCHEM, rightPeptide);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/07 - (R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/09 - (R1,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/10 - (R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/11 - (R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.Molecule,
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
    //   monomerType: MonomerType.Molecule,
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
    //   monomerType: MonomerType.Molecule,
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
      monomerType: MonomerType.Molecule,
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
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftCHEM, rightOM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftCHEMConnectionPoint,
                  rightOMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
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
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftCHEM, rightOrdinaryMolecule);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
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

  async function loadMonomer(page: Page, leftMonomer: IMonomer) {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    await getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    })
      .first()
      .hover();

    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(molecule.fileName, page);
    await moveMouseAway(page);
  }

  async function bondMonomerPointToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    attachmentPoint: string,
    atomIndex: number,
  ) {
    const leftPeptideLocator = getMonomerLocator(page, {
      monomerAlias: leftPeptide.alias,
    }).first();

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

  Object.values(chemMonomers).forEach((leftMonomer) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Connect monomer all commection points to moleule atoms
       *  Step: 1. Load monomer (chem) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag every connection point of monomer to any free atom of molecule
       *        Expected result: Connection should be established
       */
      test(`Case 12: Connect evey connection point of of Chem(${leftMonomer.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftMonomer);
        await loadMolecule(page, rightMolecule);

        const attachmentPointCount = Object.keys(
          leftMonomer.connectionPoints,
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
            leftMonomer,
            rightMolecule,
            Object.keys(leftMonomer.connectionPoints)[atomIndex],
            atomIndex,
          );
        }

        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
        });
      });
    });
  });
});
